import { NextRequest, NextResponse } from 'next/server';
import { createGuest, getEventById, getGuestStats, getGuestsForEvent } from '@/lib/convivia24';
import { resolvePartyHostId } from '@/lib/party/host';
import { apiErrorResponse } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const hostId = await resolvePartyHostId();
    const eventId = new URL(req.url).searchParams.get('eventId');
    if (!eventId) return NextResponse.json({ error: 'eventId required' }, { status: 400 });

    const event = await getEventById(eventId);
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (event.user_id !== hostId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const [guests, stats] = await Promise.all([getGuestsForEvent(eventId), getGuestStats(eventId)]);
    return NextResponse.json({ guests, stats });
  } catch (err) {
    const { status, error } = apiErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const hostId = await resolvePartyHostId();
    const body = await req.json().catch(() => ({}));
    const eventId = String(body.event_id || '');
    if (!eventId) return NextResponse.json({ error: 'event_id required' }, { status: 400 });

    const event = await getEventById(eventId);
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (event.user_id !== hostId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const guest = await createGuest(eventId, {
      name: String(body.name || 'Guest'),
      email: body.email || null,
      phone: body.phone || null,
      party_size: Number(body.party_size) || 1,
    });
    return NextResponse.json({ guest }, { status: 201 });
  } catch (err) {
    const { status, error } = apiErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}
