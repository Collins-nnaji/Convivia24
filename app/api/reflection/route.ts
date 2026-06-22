import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { rateLimit, clientIp } from '@/lib/redis';
import { getTodayCheckIn, getRecentCheckIns, saveCheckIn } from '@/lib/checkin/repo';

/** GET /api/reflection — today's check-in (if any) plus a recent trend for analytics. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  try {
    const [today, recent] = await Promise.all([
      getTodayCheckIn(user.id),
      getRecentCheckIns(user.id, 14),
    ]);
    return NextResponse.json({ reflection: today, recent });
  } catch (err) {
    console.error('[GET /api/reflection]', err);
    return NextResponse.json({ error: 'Could not load today\'s check-in.' }, { status: 500 });
  }
}

/**
 * POST /api/reflection — log today's mood/energy/highlight (any subset).
 * Stores the check-in and folds it into the companion's memory so future
 * day plans and recommendations can factor in how the person's been doing.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  try {
    const rl = await rateLimit(`reflection:${clientIp(req)}`, 10, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Try again in a moment.' }, { status: 429 });

    const { highlight, mood, energy } = await req.json();
    if (!highlight?.trim() && !mood && !energy) {
      return NextResponse.json({ error: 'Share a mood, energy, or note first.' }, { status: 400 });
    }

    const reflection = await saveCheckIn(user.id, { highlight, mood, energy });
    return NextResponse.json({ ok: true, reflection });
  } catch (err) {
    console.error('[POST /api/reflection]', err);
    return NextResponse.json({ error: 'Could not save your check-in.' }, { status: 500 });
  }
}
