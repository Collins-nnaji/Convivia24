import { NextRequest, NextResponse } from 'next/server';
import { getSharedParty, listPartyRsvps, respondToParty } from '@/lib/party/plans';
import { clientIp, rateLimit } from '@/lib/redis';
import { apiErrorResponse } from '@/lib/db';

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { token } = await params;
    const party = await getSharedParty(token);
    if (!party) return NextResponse.json({ error: 'Plan not found.' }, { status: 404 });
    const rsvps = await listPartyRsvps(party.id);
    return NextResponse.json({ party, rsvps });
  } catch (error) {
    const response = apiErrorResponse(error, 'Could not load this plan.');
    return NextResponse.json({ error: response.error }, { status: response.status });
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const limit = await rateLimit(`night-plan-rsvp:${clientIp(req)}`, 20, 60);
    if (!limit.ok) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });

    const { token } = await params;
    const party = await getSharedParty(token);
    if (!party) return NextResponse.json({ error: 'Plan not found.' }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const name = String(body.name || '').trim().slice(0, 80);
    const status = String(body.status || 'attending');
    if (!name) return NextResponse.json({ error: 'Add your name first.' }, { status: 400 });
    if (!['attending', 'maybe', 'declined'].includes(status)) {
      return NextResponse.json({ error: 'Choose a valid RSVP response.' }, { status: 400 });
    }

    const rsvp = await respondToParty(party.id, name, status as 'attending' | 'maybe' | 'declined');
    const rsvps = await listPartyRsvps(party.id);
    return NextResponse.json({ rsvp, rsvps });
  } catch (error) {
    const response = apiErrorResponse(error, 'Could not save your RSVP.');
    return NextResponse.json({ error: response.error }, { status: response.status });
  }
}
