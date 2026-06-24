import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { chat, aiConfigured } from '@/lib/ai/azure';
import { rateLimit, clientIp } from '@/lib/redis';

interface PlanBlock {
  title: string;
  starts_at: string;
  ends_at: string;
  priority: 'low' | 'normal' | 'high';
  notes?: string;
}

const MOOD_FALLBACK_BLOCKS: Record<string, { hour: number; minutes: number; title: string; priority: PlanBlock['priority'] }[]> = {
  calm: [
    { hour: 9, minutes: 60, title: 'Quiet focus time', priority: 'normal' },
    { hour: 13, minutes: 45, title: 'Slow lunch, no screens', priority: 'low' },
    { hour: 19, minutes: 60, title: 'Wind down', priority: 'low' },
  ],
  productive: [
    { hour: 9, minutes: 120, title: 'Deep work block', priority: 'high' },
    { hour: 13, minutes: 45, title: 'Lunch', priority: 'normal' },
    { hour: 15, minutes: 90, title: 'Focused execution block', priority: 'high' },
  ],
  social: [
    { hour: 12, minutes: 60, title: 'Catch up with a friend', priority: 'normal' },
    { hour: 19, minutes: 120, title: 'Dinner out', priority: 'normal' },
  ],
  default: [
    { hour: 9, minutes: 90, title: 'Morning focus', priority: 'normal' },
    { hour: 13, minutes: 45, title: 'Lunch break', priority: 'normal' },
    { hour: 19, minutes: 60, title: 'Evening wind-down', priority: 'low' },
  ],
};

function fallbackPlan(mood: string, dayStart: Date): { reply: string; blocks: PlanBlock[] } {
  const key = mood.toLowerCase().trim();
  const template = MOOD_FALLBACK_BLOCKS[key] || MOOD_FALLBACK_BLOCKS.default;
  const blocks: PlanBlock[] = template.map((t) => {
    const starts = new Date(dayStart);
    starts.setHours(t.hour, 0, 0, 0);
    const ends = new Date(starts.getTime() + t.minutes * 60000);
    return { title: t.title, starts_at: starts.toISOString(), ends_at: ends.toISOString(), priority: t.priority };
  });
  const protectedStart = new Date(dayStart); protectedStart.setHours(20, 30, 0, 0);
  const protectedEnd = new Date(dayStart); protectedEnd.setHours(23, 0, 0, 0);
  blocks.push({ title: 'Protected downtime', starts_at: protectedStart.toISOString(), ends_at: protectedEnd.toISOString(), priority: 'low' });
  return { reply: `Here's a ${key || 'balanced'} shape for tomorrow.`, blocks };
}

/**
 * POST /api/ai/plan-day
 * "How do you want tomorrow to feel?" — given a mood (preset or free text) and
 * tomorrow's existing commitments, proposes a day plan as time blocks. Nothing
 * is written until the user explicitly accepts (see /api/calendar for writes).
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  try {
    const rl = await rateLimit(`plan-day:${clientIp(req)}`, 10, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Take a breath — try again in a moment.' }, { status: 429 });

    const { mood } = await req.json();
    if (!mood?.trim()) return NextResponse.json({ error: 'Tell me how you want tomorrow to feel.' }, { status: 400 });

    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow); tomorrowEnd.setHours(23, 59, 59, 999);

    const existing = await sql`
      SELECT title, starts_at, ends_at, priority
      FROM personal_tasks
      WHERE user_id = ${user.id} AND status = 'active' AND is_rest_block = false
        AND starts_at >= ${tomorrow.toISOString()} AND starts_at <= ${tomorrowEnd.toISOString()}
      ORDER BY starts_at ASC
    `;

    const fixedCommitments = existing.map((t) => ({
      title: String(t.title),
      starts_at: new Date(t.starts_at as string).toISOString(),
      ends_at: new Date(t.ends_at as string).toISOString(),
    }));

    if (!aiConfigured()) {
      const fb = fallbackPlan(mood, tomorrow);
      return NextResponse.json({ reply: fb.reply, blocks: fb.blocks, fixed_commitments: fixedCommitments });
    }

    const memory = await sql`
      SELECT key, value FROM companion_memory WHERE user_id = ${user.id} ORDER BY updated_at DESC LIMIT 40
    `;
    const memoryLines = memory.map((m) => `${m.key}: ${m.value}`).join('\n');

    const system = `You are Convivia24's companion. The user just answered "How do you want tomorrow to feel?" with a mood. Design a realistic day plan around that feeling — a small number of well-placed blocks (morning/afternoon/evening), not a packed schedule. Always end the evening with a protected downtime block. Work around their fixed commitments — never overlap them. Use what you know about this person (people in their life, preferences, routines) to make the plan feel personal where it genuinely fits — don't force it in. Respond ONLY with strict JSON.`;
    const userMsg = `What you know about this person so far:
${memoryLines || '(nothing yet)'}

Mood for tomorrow: "${mood.trim()}"
Tomorrow's date: ${tomorrow.toISOString().slice(0, 10)}
Fixed commitments already on the calendar (do not move or overlap these): ${JSON.stringify(fixedCommitments)}

Return JSON:
{
  "reply": "1-2 warm sentences describing the shape of the day",
  "blocks": [{"title": "...", "starts_at": "ISO datetime tomorrow", "ends_at": "ISO datetime tomorrow", "priority": "low|normal|high", "notes": "optional short note"}]
}
4-6 blocks max, including one protected downtime block in the evening. Times must fall on tomorrow's date and must not overlap the fixed commitments listed above.`;

    const raw = await chat({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userMsg },
      ],
      temperature: 0.6,
      json: true,
    });

    let parsed: { reply?: string; blocks?: PlanBlock[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      const fb = fallbackPlan(mood, tomorrow);
      return NextResponse.json({ reply: raw || fb.reply, blocks: fb.blocks, fixed_commitments: fixedCommitments });
    }

    const blocks = (parsed.blocks || []).filter((b) => b.title && b.starts_at && b.ends_at);
    return NextResponse.json({
      reply: parsed.reply || `Here's a shape for tomorrow.`,
      blocks,
      fixed_commitments: fixedCommitments,
    });
  } catch (err) {
    console.error('[POST /api/ai/plan-day]', err);
    return NextResponse.json({ error: 'Could not plan your day right now.' }, { status: 500 });
  }
}
