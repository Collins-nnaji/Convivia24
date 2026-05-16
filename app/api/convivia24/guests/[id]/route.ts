import { NextRequest, NextResponse } from 'next/server';
import { neonAuth } from '@/lib/auth/server';
import { getEventById, updateGuest, deleteGuest } from '@/lib/convivia24';
import { neon } from '@neondatabase/serverless';

type Params = { params: Promise<{ id: string }> };

async function getGuestOwnerEventId(guestId: string): Promise<string | null> {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT event_id FROM convivia24_guests WHERE id = ${guestId} LIMIT 1`;
  return (rows[0]?.event_id as string) ?? null;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { user } = await neonAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const eventId = await getGuestOwnerEventId(id);
  if (!eventId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const event = await getEventById(eventId);
  if (!event || event.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const guest = await updateGuest(id, body);
  return NextResponse.json({ guest });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { user } = await neonAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const eventId = await getGuestOwnerEventId(id);
  if (!eventId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const event = await getEventById(eventId);
  if (!event || event.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await deleteGuest(id);
  return NextResponse.json({ ok: true });
}
