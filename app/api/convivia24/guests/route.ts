import { NextRequest, NextResponse } from 'next/server';
import { neonAuth } from '@/lib/auth/server';
import { getEventById, getGuestsForEvent, createGuest, getGuestStats } from '@/lib/convivia24';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, 'cv24:guests:get', 60, 60);
  if (limited) return limited;

  const { user } = await neonAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sp = new URL(req.url).searchParams;
  const eventId = sp.get('eventId') || sp.get('event_id');
  if (!eventId) return NextResponse.json({ error: 'eventId required' }, { status: 400 });

  const page  = Math.max(1, parseInt(sp.get('page') || '1', 10));
  const limit = Math.min(200, Math.max(1, parseInt(sp.get('limit') || '100', 10)));

  const event = await getEventById(eventId);
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (event.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [guests, stats] = await Promise.all([
    getGuestsForEvent(eventId, page, limit),
    getGuestStats(eventId),
  ]);

  return NextResponse.json({ guests, stats, page, limit });
}

export async function POST(req: NextRequest) {
  const { user } = await neonAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { event_id, ...guestData } = body;

  if (!event_id) return NextResponse.json({ error: 'event_id required' }, { status: 400 });

  const event = await getEventById(event_id);
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (event.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const guest = await createGuest(event_id, guestData);
  return NextResponse.json({ guest }, { status: 201 });
}
