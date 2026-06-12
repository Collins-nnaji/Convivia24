import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { chat, aiConfigured } from '@/lib/ai/azure';
import { isAdminRequest } from '@/lib/auth/session';
import { cacheGet, cacheSet } from '@/lib/redis';

/**
 * AI sales insights for organizers. Uses the dedicated analysis deployment.
 * Cached in Redis for 10 minutes to keep token spend down.
 */
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const cached = await cacheGet<{ insights: string[]; generatedAt: string }>('ai:insights');
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const events = await sql`
      SELECT e.title, e.city, e.category, e.starts_at, e.status,
        (SELECT COALESCE(SUM(sold),0) FROM ticket_types t WHERE t.event_id = e.id) AS sold,
        (SELECT COALESCE(SUM(quantity),0) FROM ticket_types t WHERE t.event_id = e.id) AS capacity,
        (SELECT MIN(price) FROM ticket_types t WHERE t.event_id = e.id) AS min_price
      FROM events e
      WHERE e.status = 'published'
      ORDER BY e.starts_at ASC LIMIT 30
    `;

    if (events.length === 0) {
      return NextResponse.json({ insights: ['No published events yet — create one to start selling.'], generatedAt: new Date().toISOString() });
    }

    if (!aiConfigured()) {
      // Deterministic fallback so the card is still useful without AI keys.
      const insights = events
        .map((e) => {
          const sold = Number(e.sold), cap = Number(e.capacity) || 1;
          const pct = Math.round((sold / cap) * 100);
          if (pct >= 80) return `🔥 "${e.title}" is ${pct}% sold — consider adding capacity or a higher tier.`;
          if (pct <= 10 && new Date(e.starts_at as string) < new Date(Date.now() + 7 * 864e5)) return `⚠️ "${e.title}" is only ${pct}% sold and is soon — push promotion.`;
          return null;
        })
        .filter(Boolean)
        .slice(0, 5) as string[];
      const result = { insights: insights.length ? insights : ['Sales look steady. Keep promoting your soonest events.'], generatedAt: new Date().toISOString() };
      await cacheSet('ai:insights', result, 600);
      return NextResponse.json(result);
    }

    const raw = await chat({
      model: 'analysis',
      temperature: 0.4,
      json: true,
      messages: [
        { role: 'system', content: 'You are a revenue analyst for an events ticketing platform. Give sharp, specific, actionable insights. Respond ONLY with strict JSON.' },
        { role: 'user', content: `Here is the live event sales data (JSON):\n${JSON.stringify(events)}\n\nReturn JSON: { "insights": ["4-6 short, punchy, specific recommendations an organizer should act on now"] }. Reference event titles and numbers. Flag under-performers and near-sellouts.` },
      ],
    });

    let parsed: { insights?: string[] };
    try { parsed = JSON.parse(raw); } catch { parsed = { insights: [raw] }; }
    const result = { insights: (parsed.insights || []).slice(0, 6), generatedAt: new Date().toISOString() };
    await cacheSet('ai:insights', result, 600);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[GET /api/ai/insights]', err);
    return NextResponse.json({ error: 'Could not generate insights.' }, { status: 500 });
  }
}
