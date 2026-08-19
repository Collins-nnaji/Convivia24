import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { apiErrorResponse } from '@/lib/db';
import { joinCircle, leaveCircle } from '@/lib/circles/repo';
import { rateLimit, clientIp } from '@/lib/redis';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to join a circle.' }, { status: 401 });
  try {
    const rl = await rateLimit(`circles:join:${clientIp(req)}`, 30, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    await joinCircle(id, user.id, user.name || user.email.split('@')[0]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Could not join this circle.');
    return NextResponse.json({ error }, { status });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  try {
    await leaveCircle(id, user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Could not leave this circle.');
    return NextResponse.json({ error }, { status });
  }
}
