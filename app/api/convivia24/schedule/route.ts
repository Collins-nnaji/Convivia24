import { NextRequest, NextResponse } from 'next/server';
import { neonAuth } from '@/lib/auth/server';
import {
  createScheduleItem,
  deleteScheduleItem,
  getEventById,
  getScheduleForEvent,
} from '@/lib/convivia24';

export async function GET(req: NextRequest) {
  const { user } = await neonAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const eventId = new URL(req.url).searchParams.get('eventId');
  if (!eventId) return NextResponse.json({ error: 'eventId required' }, { status: 400 });

  const event = await getEventById(eventId);
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (event.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const items = await getScheduleForEvent(eventId);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const { user } = await neonAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { event_id, time_label, title, subtitle, sort_order } = body as {
    event_id?: string;
    time_label?: string;
    title?: string;
    subtitle?: string | null;
    sort_order?: number;
  };

  if (!event_id || !time_label?.trim() || !title?.trim()) {
    return NextResponse.json({ error: 'event_id, time_label, and title required' }, { status: 400 });
  }

  const event = await getEventById(event_id);
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (event.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const item = await createScheduleItem(event_id, {
    time_label: time_label.trim(),
    title: title.trim(),
    subtitle: subtitle ?? null,
    sort_order,
  });
  return NextResponse.json({ item }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { user } = await neonAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sp = new URL(req.url).searchParams;
  const id = sp.get('id');
  const eventId = sp.get('eventId');
  if (!id || !eventId) return NextResponse.json({ error: 'id and eventId required' }, { status: 400 });

  const event = await getEventById(eventId);
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (event.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await deleteScheduleItem(id, eventId);
  return NextResponse.json({ ok: true });
}
