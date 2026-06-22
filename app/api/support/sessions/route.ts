import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { rateLimit, clientIp } from '@/lib/redis';
import * as repo from '@/lib/support/repo';

/** GET /api/support/sessions — the signed-in user's own sessions, both as seeker and as supporter. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  try {
    const sessions = await repo.listSessionsForUser(user.id);
    return NextResponse.json(sessions);
  } catch (err) {
    console.error('[GET /api/support/sessions]', err);
    return NextResponse.json({ error: 'Could not load your sessions.' }, { status: 500 });
  }
}

/** POST /api/support/sessions — book a session. body: { supporter_id, starts_at, duration_mins?, note? } */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  try {
    const rl = await rateLimit(`support-session:${clientIp(req)}`, 10, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Slow down a little — try again shortly.' }, { status: 429 });

    const { supporter_id, starts_at, duration_mins, note } = await req.json();
    if (!supporter_id?.trim() || !starts_at) {
      return NextResponse.json({ error: 'Pick a supporter and a time.' }, { status: 400 });
    }
    if (supporter_id === user.id) {
      return NextResponse.json({ error: "You can't book a session with yourself." }, { status: 400 });
    }
    const supporter = await repo.getSupporterProfile(supporter_id);
    if (!supporter?.is_active) return NextResponse.json({ error: 'That supporter is not available.' }, { status: 404 });

    const displayName = user.name?.trim() || user.email.split('@')[0];
    const session = await repo.requestSession(user.id, displayName, {
      supporter_id,
      starts_at,
      duration_mins: typeof duration_mins === 'number' ? duration_mins : 30,
      note,
    });
    return NextResponse.json({ session });
  } catch (err) {
    console.error('[POST /api/support/sessions]', err);
    return NextResponse.json({ error: 'Could not send that booking request.' }, { status: 500 });
  }
}
