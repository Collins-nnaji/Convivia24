import { NextRequest, NextResponse } from 'next/server';
import { deleteEvent, getEventById, updateEvent } from '@/lib/convivia24';
import { resolvePartyHostId } from '@/lib/party/host';
import { apiErrorResponse } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const hostId = await resolvePartyHostId();
    const event = await getEventById(id);
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (event.user_id !== hostId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ event });
  } catch (err) {
    const { status, error } = apiErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const hostId = await resolvePartyHostId();
    const body = await req.json().catch(() => ({}));
    const event = await updateEvent(id, hostId, body);
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ event });
  } catch (err) {
    const { status, error } = apiErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const hostId = await resolvePartyHostId();
    await deleteEvent(id, hostId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const { status, error } = apiErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}
