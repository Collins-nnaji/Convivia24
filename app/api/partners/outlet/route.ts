import { NextRequest, NextResponse } from 'next/server';
import {
  getOutlet,
  resolveOutletOwner,
  upsertOutlet,
  validateOutlet,
  VENUE_KINDS,
  type OutletInput,
} from '@/lib/partners/outlets';
import { apiErrorResponse, DatabaseUnavailableError } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

/** The signed-in outlet's own record, or null when signed out / not yet onboarded. */
export async function GET() {
  try {
    const ownerId = await resolveOutletOwner();
    const outlet = ownerId ? await getOutlet(ownerId) : null;
    return NextResponse.json({ outlet, venueKinds: VENUE_KINDS, signedIn: Boolean(ownerId) });
  } catch (err) {
    captureApiError(err, { route: 'partners/outlet GET' });
    return NextResponse.json({ outlet: null, venueKinds: VENUE_KINDS, degraded: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(`partner-outlet:${clientIp(req)}`, 20, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const input: OutletInput = {
      venueName: String(body.venueName || ''),
      email: String(body.email || ''),
      contact: body.contact ? String(body.contact) : null,
      area: body.area ? String(body.area) : null,
      venueKind: body.venueKind ? String(body.venueKind) : 'lounge',
      seats: body.seats != null && body.seats !== '' ? Number(body.seats) : null,
      targetMarginPct: body.targetMarginPct != null && body.targetMarginPct !== '' ? Number(body.targetMarginPct) : undefined,
    };

    const invalid = validateOutlet(input);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

    const ownerId = await resolveOutletOwner();
    if (!ownerId) return NextResponse.json({ error: 'Sign in to open a partner desk.' }, { status: 401 });
    const outlet = await upsertOutlet(ownerId, input);
    return NextResponse.json({ outlet }, { status: 201 });
  } catch (err) {
    captureApiError(err, { route: 'partners/outlet POST' });
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'Partner sign-up is paused right now. Try again shortly.' }, { status: 503 });
    }
    const { status, error } = apiErrorResponse(err, 'Could not save the outlet.');
    return NextResponse.json({ error }, { status });
  }
}
