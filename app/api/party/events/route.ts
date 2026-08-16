import { NextRequest, NextResponse } from 'next/server';
import { createEvent, getEventsForUser } from '@/lib/convivia24';
import { resolvePartyHostId } from '@/lib/party/host';
import { apiErrorResponse } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const rl = await rateLimit(`party-events:${clientIp(req)}`, 40, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    const user = await getCurrentUser();
    const hostId = user?.id || (await resolvePartyHostId());
    const events = await getEventsForUser(hostId);
    return NextResponse.json({ events, hostId, signedIn: Boolean(user) });
  } catch (err) {
    captureApiError(err, { route: 'party/events GET' });
    const { status, error } = apiErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(`party-create:${clientIp(req)}`, 20, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    const user = await getCurrentUser();
    const hostId = user?.id || (await resolvePartyHostId());
    const body = await req.json().catch(() => ({}));
    const event = await createEvent(hostId, {
      title: String(body.title || body.host_name || 'My party'),
      host_name: String(body.host_name || body.title || 'Host'),
      event_type: String(body.event_type || 'party'),
      event_date: body.event_date || null,
      event_time: body.event_time || null,
      city: body.city || 'Lagos',
      venue: body.venue || null,
      address: body.address || null,
      capacity: Number(body.capacity) || 40,
      dress_code: body.dress_code || null,
      invite_live: body.invite_live !== false,
    });
    return NextResponse.json({ event }, { status: 201 });
  } catch (err) {
    captureApiError(err, { route: 'party/events POST' });
    const { status, error } = apiErrorResponse(err, 'Could not create party.');
    return NextResponse.json({ error }, { status });
  }
}
