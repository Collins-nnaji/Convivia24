import { NextRequest, NextResponse } from 'next/server';
import { neonAuth } from '@/lib/auth/server';
import { getEventsForUser, createEvent } from '@/lib/convene';

export async function GET() {
  const { user } = await neonAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const events = await getEventsForUser(user.id);
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const { user } = await neonAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const event = await createEvent(user.id, body);
  return NextResponse.json({ event }, { status: 201 });
}
