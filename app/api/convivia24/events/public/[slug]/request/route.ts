import { NextRequest, NextResponse } from 'next/server';
import { getEventBySlug, createGuest } from '@/lib/convivia24';

type Params = { params: Promise<{ slug: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!event.invite_live) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() || null : null;

  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });

  const guest = await createGuest(event.id, { name, email });
  return NextResponse.json({ ok: true, guest_id: guest.id }, { status: 201 });
}
