import { NextRequest, NextResponse } from 'next/server';
import { deleteParty, listParties, saveParty, validatePartyInput, type SavePartyInput } from '@/lib/party/plans';
import { resolvePartyOwner } from '@/lib/party/owner';
import { apiErrorResponse, DatabaseUnavailableError } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

export async function GET() {
  try {
    const ownerId = await resolvePartyOwner();
    const parties = await listParties(ownerId);
    return NextResponse.json({ parties });
  } catch (err) {
    captureApiError(err, { route: 'parties GET' });
    // Saved parties are a convenience — an unavailable DB should not break the shop.
    return NextResponse.json({ parties: [], degraded: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(`parties:${clientIp(req)}`, 30, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const ownerId = await resolvePartyOwner();
    const body = await req.json().catch(() => ({}));
    const input: SavePartyInput = {
      id: body.id ? String(body.id) : undefined,
      ownerId,
      name: String(body.name || ''),
      occasion: body.occasion ? String(body.occasion) : null,
      eventDate: body.eventDate ? String(body.eventDate) : null,
      venue: body.venue ? String(body.venue) : null,
      guests: Number(body.guests),
      hours: Number(body.hours),
      vibe: String(body.vibe || 'balanced'),
      budgetNgn: body.budgetNgn != null && body.budgetNgn !== '' ? Number(body.budgetNgn) : null,
      plan: body.plan ?? null,
    };

    const invalid = validatePartyInput(input);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

    const party = await saveParty(input);
    return NextResponse.json({ party }, { status: input.id ? 200 : 201 });
  } catch (err) {
    captureApiError(err, { route: 'parties POST' });
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'Saving parties is paused right now. Try again shortly.' }, { status: 503 });
    }
    const { status, error } = apiErrorResponse(err, 'Could not save the party.');
    return NextResponse.json({ error }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ownerId = await resolvePartyOwner();
    const id = new URL(req.url).searchParams.get('id') || '';
    if (!id) return NextResponse.json({ error: 'Party id is required.' }, { status: 400 });
    const removed = await deleteParty(id, ownerId);
    if (!removed) return NextResponse.json({ error: 'Party not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    captureApiError(err, { route: 'parties DELETE' });
    const { status, error } = apiErrorResponse(err, 'Could not delete the party.');
    return NextResponse.json({ error }, { status });
  }
}
