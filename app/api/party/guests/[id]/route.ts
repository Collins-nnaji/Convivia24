import { NextRequest, NextResponse } from 'next/server';
import { deleteGuest, getEventById } from '@/lib/convivia24';
import { resolvePartyHostId } from '@/lib/party/host';
import { apiErrorResponse } from '@/lib/db';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

type Params = { params: Promise<{ id: string }> };

async function hostOwnsGuest(guestId: string): Promise<boolean> {
  const user = await getCurrentUser();
  const hostId = user?.id || (await resolvePartyHostId());
  const rows = await sql`SELECT event_id FROM convivia24_guests WHERE id = ${guestId} LIMIT 1`;
  const eventId = rows[0]?.event_id as string | undefined;
  if (!eventId) return false;
  const event = await getEventById(eventId);
  return Boolean(event && event.user_id === hostId);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    if (!(await hostOwnsGuest(id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    await deleteGuest(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const { status, error } = apiErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    if (!(await hostOwnsGuest(id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const updated = await sql`
      UPDATE convivia24_guests SET invite_sent_at = NOW(), updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return NextResponse.json({ guest: updated[0] });
  } catch (err) {
    const { status, error } = apiErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}
