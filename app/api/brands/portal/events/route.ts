import { withAudit } from '@/lib/audit/route';
import { NextRequest, NextResponse } from 'next/server';
import { resolveManagedBrand } from '@/lib/brands/portal-access';
import {
  EVENTS_CACHE_KEY,
  deleteBrandEvent,
  listBrandEvents,
  listEventVenueOptions,
  saveBrandEvent,
  validateEventInput,
  type EventInput,
} from '@/lib/events/store';
import { EVENT_TAGS } from '@/lib/events/catalog';
import { apiErrorResponse } from '@/lib/db';
import { rateLimit, clientIp, redis } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

/**
 * A brand's own events, posted from the brand portal. They appear on /events like any
 * other event; the desk can still unpublish or remove them from the admin Events desk.
 */
async function handleGET(req: NextRequest) {
  try {
    const gate = await resolveManagedBrand(req.nextUrl.searchParams.get('brand'));
    if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
    const [events, venues] = await Promise.all([listBrandEvents(gate.brandSlug), listEventVenueOptions()]);
    return NextResponse.json({ events, venues, tags: EVENT_TAGS });
  } catch (err) {
    captureApiError(err, { route: 'brands/portal/events GET' });
    const { status, error } = apiErrorResponse(err, 'Could not load your events.');
    return NextResponse.json({ error }, { status });
  }
}

async function handlePOST(req: NextRequest) {
  try {
    const rl = await rateLimit(`brand-events:${clientIp(req)}`, 30, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const gate = await resolveManagedBrand(body.brand ? String(body.brand) : null);
    if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });

    const input: EventInput = {
      id: body.id ? String(body.id) : undefined,
      title: String(body.title || '').slice(0, 140),
      venueSlug: String(body.venueSlug || ''),
      tag: String(body.tag || 'Lounge'),
      blurb: String(body.blurb || '').slice(0, 600),
      expected: String(body.expected || '').slice(0, 60),
      coverNgn: body.coverNgn != null && body.coverNgn !== '' ? Number(body.coverNgn) : null,
      startsAtIso: String(body.startsAtIso || ''),
      endsAtIso: String(body.endsAtIso || ''),
      published: body.published !== false,
    };
    const invalid = validateEventInput(input);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
    const venues = await listEventVenueOptions();
    if (!venues.some((v) => v.slug === input.venueSlug)) {
      return NextResponse.json({ error: 'Pick a venue from the list.' }, { status: 400 });
    }

    const event = await saveBrandEvent(gate.brandSlug, input);
    if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    await redis()?.del(EVENTS_CACHE_KEY);
    return NextResponse.json({ event }, { status: input.id ? 200 : 201 });
  } catch (err) {
    captureApiError(err, { route: 'brands/portal/events POST' });
    const { status, error } = apiErrorResponse(err, 'Could not save the event.');
    return NextResponse.json({ error }, { status });
  }
}

async function handleDELETE(req: NextRequest) {
  try {
    const gate = await resolveManagedBrand(req.nextUrl.searchParams.get('brand'));
    if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
    const id = req.nextUrl.searchParams.get('id') || '';
    if (!id) return NextResponse.json({ error: 'Event id is required.' }, { status: 400 });
    const removed = await deleteBrandEvent(gate.brandSlug, id);
    if (!removed) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    await redis()?.del(EVENTS_CACHE_KEY);
    return NextResponse.json({ ok: true });
  } catch (err) {
    captureApiError(err, { route: 'brands/portal/events DELETE' });
    const { status, error } = apiErrorResponse(err, 'Could not delete the event.');
    return NextResponse.json({ error }, { status });
  }
}

export const GET = withAudit('/api/brands/portal/events', handleGET);
export const POST = withAudit('/api/brands/portal/events', handlePOST);
export const DELETE = withAudit('/api/brands/portal/events', handleDELETE);
