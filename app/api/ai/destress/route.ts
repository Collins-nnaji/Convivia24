import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { chat, aiConfigured } from '@/lib/ai/azure';
import { rateLimit, clientIp } from '@/lib/redis';

interface ReshuffleItem { id: string; title: string; starts_at: string; ends_at: string; priority: string }

/**
 * POST /api/ai/destress
 * "Today is getting chaotic. Help me destress." — proposes shifting low-priority
 * tasks later/tomorrow and opening up the evening. Returns a proposal the user
 * must explicitly accept (no silent writes).
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  try {
    const rl = await rateLimit(`destress:${clientIp(req)}`, 10, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Take a breath — try again in a moment.' }, { status: 429 });

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today); todayEnd.setHours(23, 59, 59, 999);

    const tasks = await sql`
      SELECT id, title, starts_at, ends_at, priority
      FROM personal_tasks
      WHERE user_id = ${user.id} AND status = 'active' AND is_rest_block = false
        AND starts_at >= ${today.toISOString()} AND starts_at <= ${todayEnd.toISOString()}
      ORDER BY starts_at ASC
    `;

    const items: ReshuffleItem[] = tasks.map((t) => ({
      id: String(t.id),
      title: String(t.title),
      starts_at: new Date(t.starts_at as string).toISOString(),
      ends_at: new Date(t.ends_at as string).toISOString(),
      priority: String(t.priority),
    }));

    if (items.length === 0) {
      return NextResponse.json({ reply: 'Your day is already light — nothing to clear.', moves: [] });
    }

    if (!aiConfigured()) {
      const evening = new Date(today); evening.setHours(18, 0, 0, 0);
      const lowPriority = items.filter((i) => i.priority === 'low' && +new Date(i.starts_at) < +evening);
      const moves = lowPriority.map((i) => ({ id: i.id, title: i.title, move_to: 'tomorrow' as const }));
      return NextResponse.json({
        reply: moves.length
          ? `Let's clear some space. I'd push ${moves.length} lower-priority item${moves.length > 1 ? 's' : ''} to tomorrow and keep your evening open.`
          : 'Everything left today is high priority — I\'d hold off rescheduling, but I can open your evening if you\'d like.',
        moves,
      });
    }

    const system = `You are Convivia24's calm AI assistant. The user feels their day is chaotic and wants help destressing. Given their remaining tasks today, decide which low-priority items to push to tomorrow to protect their evening. Be gentle, brief, and never move high-priority items. Respond ONLY with strict JSON.`;
    const user_msg = `Current time: ${new Date().toISOString()}
Remaining tasks today (JSON): ${JSON.stringify(items)}

Return JSON:
{
  "reply": "1-2 warm sentences explaining the plan",
  "moves": [{"id": "task-id-from-list", "title": "task title", "move_to": "tomorrow"}]
}
Only include ids that exist in the list above. Prefer moving "low" priority items; only move "normal" priority items if the day is very full. Never move "high" priority items.`;

    const raw = await chat({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user_msg },
      ],
      temperature: 0.5,
      json: true,
    });

    let parsed: { reply?: string; moves?: { id: string; title: string; move_to: string }[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ reply: raw || 'Here\'s a calmer version of your day.', moves: [] });
    }

    const validIds = new Set(items.map((i) => i.id));
    const moves = (parsed.moves || []).filter((m) => validIds.has(m.id));
    return NextResponse.json({ reply: parsed.reply || 'Here\'s a calmer version of your day.', moves });
  } catch (err) {
    console.error('[POST /api/ai/destress]', err);
    return NextResponse.json({ error: 'Could not destress your day right now.' }, { status: 500 });
  }
}
