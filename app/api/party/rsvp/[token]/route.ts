import { NextRequest, NextResponse } from 'next/server';
import { getEventById, getGuestByToken, rsvpGuest } from '@/lib/convivia24';
import { apiErrorResponse } from '@/lib/db';

type Params = { params: Promise<{ token: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { token } = await params;
    const guest = await getGuestByToken(token);
    if (!guest) return NextResponse.json({ error: 'Invalid invite link' }, { status: 404 });
    const event = await getEventById(guest.event_id);
    if (!event) return NextResponse.json({ error: 'Party not found' }, { status: 404 });
    if (!event.invite_live) {
      return NextResponse.json({ error: 'This invite is not live yet.' }, { status: 403 });
    }
    const { user_id: _uid, ...safeEvent } = event;
    void _uid;
    return NextResponse.json({ guest, event: safeEvent });
  } catch (err) {
    const { status, error } = apiErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { token } = await params;
    const guest = await getGuestByToken(token);
    if (!guest) return NextResponse.json({ error: 'Invalid invite link' }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const state = String(body.state || '');
    if (!['in', 'maybe', 'out'].includes(state)) {
      return NextResponse.json({ error: 'state must be in | maybe | out' }, { status: 400 });
    }

    const updated = await rsvpGuest(token, state, {
      party_size: Number(body.party_size) || guest.party_size,
      dietary: body.dietary || null,
      message: body.message || null,
      song_request: body.song_request || null,
    });
    return NextResponse.json({ guest: updated });
  } catch (err) {
    const { status, error } = apiErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}
