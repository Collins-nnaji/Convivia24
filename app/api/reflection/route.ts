import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { rateLimit, clientIp } from '@/lib/redis';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/** GET /api/reflection — today's reflection, if the user already answered. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  try {
    const [row] = await sql`
      SELECT highlight, mood FROM daily_reflections WHERE user_id = ${user.id} AND reflect_date = ${todayKey()}
    `;
    return NextResponse.json({ reflection: row || null });
  } catch (err) {
    console.error('[GET /api/reflection]', err);
    return NextResponse.json({ error: 'Could not load today\'s reflection.' }, { status: 500 });
  }
}

/**
 * POST /api/reflection — "How was today?" Stores the highlight and folds it
 * into the companion's memory so future day plans can learn what a good day
 * looks like for this person.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  try {
    const rl = await rateLimit(`reflection:${clientIp(req)}`, 10, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Try again in a moment.' }, { status: 429 });

    const { highlight, mood } = await req.json();
    if (!highlight?.trim()) return NextResponse.json({ error: 'Share something about today first.' }, { status: 400 });

    const date = todayKey();
    await sql`
      INSERT INTO daily_reflections (user_id, reflect_date, highlight, mood)
      VALUES (${user.id}, ${date}, ${highlight.trim()}, ${mood?.trim() || null})
      ON CONFLICT (user_id, reflect_date) DO UPDATE SET highlight = EXCLUDED.highlight, mood = EXCLUDED.mood
    `;

    await sql`
      INSERT INTO companion_memory (user_id, key, value)
      VALUES (${user.id}, ${`good_day_${date}`}, ${highlight.trim()})
      ON CONFLICT (user_id, LOWER(key)) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[POST /api/reflection]', err);
    return NextResponse.json({ error: 'Could not save your reflection.' }, { status: 500 });
  }
}
