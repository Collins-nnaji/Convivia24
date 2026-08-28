import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import {
  EVENTS_CACHE_KEY,
  deleteEvent,
  listEventVenueOptions,
  listEvents,
  setEventPublished,
  upsertEvent,
  validateEventInput,
  type EventInput,
} from '@/lib/events/store';
import { EVENT_TAGS } from '@/lib/events/catalog';
import { apiErrorResponse } from '@/lib/db';
import { rateLimit, clientIp, redis } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

async function invalidateFeed() {
  await redis()?.del(EVENTS_CACHE_KEY);
}

export async function GET() {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const [events, venues] = await Promise.all([listEvents(false), listEventVenueOptions()]);
    return NextResponse.json({ events, tags: EVENT_TAGS, venues });
  } catch (err) {
    captureApiError(err, { route: 'admin/events GET' });
    const { error } = apiErrorResponse(err, 'Could not load events.');
    return NextResponse.json({ events: [], tags: EVENT_TAGS, venues: [], error });
  }
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const rl = await rateLimit(`admin-events:${clientIp(req)}`, 40, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const input: EventInput = {
      id: body.id ? String(body.id) : undefined,
      title: String(body.title || ''),
      venueSlug: String(body.venueSlug || ''),
      tag: String(body.tag || 'Lounge'),
      blurb: String(body.blurb || ''),
      expected: String(body.expected || ''),
      coverNgn: body.coverNgn != null && body.coverNgn !== '' ? Number(body.coverNgn) : null,
      startsAtIso: String(body.startsAtIso || ''),
      endsAtIso: String(body.endsAtIso || ''),
      published: body.published !== false,
    };

    const invalid = validateEventInput(input);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

    const event = await upsertEvent(input);
    await invalidateFeed();
    return NextResponse.json({ event }, { status: input.id ? 200 : 201 });
  } catch (err) {
    captureApiError(err, { route: 'admin/events POST' });
    const { status, error } = apiErrorResponse(err, 'Could not save event.');
    return NextResponse.json({ error }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const body = await req.json().catch(() => ({}));
    const id = String(body.id || '');
    if (!id) return NextResponse.json({ error: 'Event id is required.' }, { status: 400 });
    const event = await setEventPublished(id, body.published !== false);
    if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    await invalidateFeed();
    return NextResponse.json({ event });
  } catch (err) {
    captureApiError(err, { route: 'admin/events PATCH' });
    const { status, error } = apiErrorResponse(err, 'Could not update event.');
    return NextResponse.json({ error }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const id = new URL(req.url).searchParams.get('id') || '';
    if (!id) return NextResponse.json({ error: 'Event id is required.' }, { status: 400 });
    const removed = await deleteEvent(id);
    if (!removed) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    await invalidateFeed();
    return NextResponse.json({ ok: true });
  } catch (err) {
    captureApiError(err, { route: 'admin/events DELETE' });
    const { status, error } = apiErrorResponse(err, 'Could not delete event.');
    return NextResponse.json({ error }, { status });
  }
}
