import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { apiErrorResponse } from '@/lib/db';
import { getCrew, joinCrew } from '@/lib/crews/repo';
import { rateLimit, clientIp } from '@/lib/redis';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to join this crew.' }, { status: 401 });
  try {
    const rl = await rateLimit(`crews:join:${clientIp(req)}`, 20, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const inviteCode = typeof body.inviteCode === 'string' ? body.inviteCode.trim().toUpperCase() : '';

    const crew = await getCrew(id);
    if (!crew) return NextResponse.json({ error: 'Crew not found.' }, { status: 404 });
    if (crew.inviteCode !== inviteCode) {
      return NextResponse.json({ error: 'That invite code is not valid for this crew.' }, { status: 403 });
    }
    if (crew.status !== 'open') {
      return NextResponse.json({ error: 'This crew has already checked out.' }, { status: 400 });
    }

    await joinCrew(id, user.id, user.name || user.email.split('@')[0]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Could not join this crew.');
    return NextResponse.json({ error }, { status });
  }
}
