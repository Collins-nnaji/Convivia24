import { NextRequest, NextResponse } from 'next/server';
import { neonAuth } from '@/lib/auth/server';
import {
  createEventVendor,
  deleteEventVendor,
  getEventById,
  getEventVendors,
  getMarketplaceVendors,
} from '@/lib/convivia24';

export async function GET(req: NextRequest) {
  const { user } = await neonAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sp = new URL(req.url).searchParams;
  const eventId = sp.get('eventId');
  const marketplace = sp.get('marketplace') === '1';

  if (marketplace) {
    const city = sp.get('city');
    const vendors = await getMarketplaceVendors(city);
    return NextResponse.json({ vendors });
  }

  if (!eventId) return NextResponse.json({ error: 'eventId required' }, { status: 400 });

  const event = await getEventById(eventId);
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (event.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const saved = await getEventVendors(eventId);
  return NextResponse.json({ vendors: saved });
}

export async function POST(req: NextRequest) {
  const { user } = await neonAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { event_id, category, name, contact, notes } = body as {
    event_id?: string;
    category?: string;
    name?: string;
    contact?: string | null;
    notes?: string | null;
  };

  if (!event_id || !category?.trim() || !name?.trim()) {
    return NextResponse.json({ error: 'event_id, category, and name required' }, { status: 400 });
  }

  const event = await getEventById(event_id);
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (event.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const vendor = await createEventVendor(event_id, {
    category: category.trim(),
    name: name.trim(),
    contact: contact ?? null,
    notes: notes ?? null,
  });
  return NextResponse.json({ vendor }, { status: 201 });
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

  await deleteEventVendor(id, eventId);
  return NextResponse.json({ ok: true });
}
