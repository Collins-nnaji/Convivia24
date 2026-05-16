import { NextRequest, NextResponse } from 'next/server';
import { getGuestByToken, getEventById, rsvpGuest } from '@/lib/convene';

type Params = { params: Promise<{ token: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;

  const guest = await getGuestByToken(token);
  if (!guest) return NextResponse.json({ error: 'Invalid token' }, { status: 404 });

  const event = await getEventById(guest.event_id);
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  const { user_id: _uid, ...safeEvent } = event as unknown as Record<string, unknown> & { user_id: string };
  void _uid;

  return NextResponse.json({ guest, event: safeEvent });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params;

  const guest = await getGuestByToken(token);
  if (!guest) return NextResponse.json({ error: 'Invalid token' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { state, ...rest } = body as { state?: string; [k: string]: unknown };

  if (!state || !['in', 'maybe', 'out'].includes(state)) {
    return NextResponse.json({ error: 'state must be in | maybe | out' }, { status: 400 });
  }

  const updated = await rsvpGuest(token, state, rest as Record<string, unknown>);
  return NextResponse.json({ guest: updated });
}
