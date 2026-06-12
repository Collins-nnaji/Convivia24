import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { chat, aiConfigured } from '@/lib/ai/azure';
import { rateLimit, clientIp } from '@/lib/redis';

/**
 * AI event concierge — recommends live events based on a free-text request.
 * body: { query: string }
 * Returns: { reply: string, picks: [{ slug, title, why }] }
 */
export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(`concierge:${clientIp(req)}`, 15, 60);
    if (!rl.ok) return NextResponse.json({ error: 'You are asking quickly! Give me a few seconds.' }, { status: 429 });

    const { query } = await req.json();
    if (!query?.trim()) return NextResponse.json({ error: 'Tell me what you are in the mood for.' }, { status: 400 });

    const events = await sql`
      SELECT slug, title, tagline, category, city, venue, starts_at, age_restriction, tags
      FROM events WHERE status = 'published' AND starts_at > NOW()
      ORDER BY starts_at ASC LIMIT 40
    `;

    if (events.length === 0) {
      return NextResponse.json({ reply: 'There are no upcoming events live right now — check back soon.', picks: [] });
    }

    const catalogue = events.map((e) => ({
      slug: String(e.slug),
      title: String(e.title),
      tagline: e.tagline as string | null,
      category: String(e.category),
      city: String(e.city),
      venue: e.venue as string | null,
      when: new Date(e.starts_at as string).toDateString(),
      age: e.age_restriction as string | null,
      tags: (e.tags as string[] | null) ?? [],
    }));

    if (!aiConfigured()) {
      const q = query.toLowerCase();
      const picks = catalogue
        .filter((e) =>
          [e.category, e.city, e.title, ...(e.tags || [])].filter(Boolean).some((t) => q.includes(String(t).toLowerCase())) )
        .slice(0, 3)
        .map((e) => ({ slug: e.slug, title: e.title, why: `${e.category} in ${e.city} — ${e.tagline || 'a great night out'}.` }));
      const list = picks.length ? picks : catalogue.slice(0, 3).map((e) => ({ slug: e.slug, title: e.title, why: `${e.category} in ${e.city}.` }));
      return NextResponse.json({ reply: `Here are a few you might like for "${query}".`, picks: list });
    }

    const system = `You are the Convivia24 event concierge. You ONLY recommend events from the provided catalogue. Be warm, concise and a little stylish. Respond ONLY with strict JSON.`;
    const user = `User request: "${query}"

Catalogue (JSON):
${JSON.stringify(catalogue)}

Pick up to 3 best matches. Return JSON:
{
  "reply": "1-2 friendly sentences addressing the request",
  "picks": [{"slug": "event-slug-from-catalogue", "title": "event title", "why": "one sentence on why it fits"}]
}
Only use slugs that exist in the catalogue. If nothing fits, return an empty picks array and say so kindly.`;

    const raw = await chat({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.6,
      json: true,
    });

    let parsed: { reply?: string; picks?: { slug: string; title: string; why: string }[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ reply: raw || 'Here are a few ideas.', picks: [] });
    }

    const validSlugs = new Set(catalogue.map((e) => e.slug));
    const picks = (parsed.picks || []).filter((p) => validSlugs.has(p.slug)).slice(0, 3);
    return NextResponse.json({ reply: parsed.reply || 'Here are my picks.', picks });
  } catch (err) {
    console.error('[POST /api/ai/concierge]', err);
    return NextResponse.json({ error: 'The concierge is unavailable right now.' }, { status: 500 });
  }
}
