import { NextRequest, NextResponse } from 'next/server';
import { getEventBySlug, createGuest, rsvpGuest } from '@/lib/convivia24';

type Params = { params: Promise<{ slug: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() || null : null;
  const rsvp_state = ['in', 'maybe', 'out'].includes(body.rsvp_state) ? body.rsvp_state : 'in';
  const party_size = typeof body.party_size === 'number' ? Math.max(1, body.party_size) : 1;
  const dietary = typeof body.dietary === 'string' ? body.dietary.trim() || null : null;
  const song_request = typeof body.song_request === 'string' ? body.song_request.trim() || null : null;
  const message = typeof body.message === 'string' ? body.message.trim() || null : null;

  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });

  const guest = await createGuest(event.id, { name, email, party_size, rsvp_state: 'pending' });
  const updated = await rsvpGuest(guest.pass_token, rsvp_state, { dietary, song_request, message, party_size });

  return NextResponse.json({
    pass_token: (updated ?? guest).pass_token,
    guest_name: name,
  }, { status: 201 });
}
