import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { apiErrorResponse } from '@/lib/db';
import { createCrew, myCrews } from '@/lib/crews/repo';
import { rateLimit, clientIp } from '@/lib/redis';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ crews: [], authRequired: true }, { status: 401 });
  try {
    const crews = await myCrews(user.id);
    return NextResponse.json({ crews });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Unable to load crews.');
    return NextResponse.json({ error, crews: [] }, { status });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to start a crew.' }, { status: 401 });
  try {
    const rl = await rateLimit(`crews:create:${clientIp(req)}`, 10, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : '';
    if (!name) return NextResponse.json({ error: 'Give your crew a name.' }, { status: 400 });

    const crew = await createCrew(user.id, user.name || user.email.split('@')[0], name);
    return NextResponse.json({ crew }, { status: 201 });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Could not start a crew.');
    return NextResponse.json({ error }, { status });
  }
}
