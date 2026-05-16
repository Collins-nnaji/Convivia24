import { NextRequest, NextResponse } from 'next/server';
import { neonAuth } from '@/lib/auth/server';
import { getEventById, updateEvent, deleteEvent } from '@/lib/convene';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { user } = await neonAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (event.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  return NextResponse.json({ event });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { user } = await neonAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await getEventById(id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (existing.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const event = await updateEvent(id, user.id, body);
  return NextResponse.json({ event });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { user } = await neonAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await getEventById(id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (existing.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await deleteEvent(id, user.id);
  return NextResponse.json({ ok: true });
}
