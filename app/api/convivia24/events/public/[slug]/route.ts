import { NextRequest, NextResponse } from 'next/server';
import { getEventBySlug } from '@/lib/convivia24';

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!event.invite_live) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Return only public fields — no internal IDs beyond what guests need to see
  return NextResponse.json({
    event: {
      id: event.id,
      slug: event.slug,
      title: event.title,
      event_type: event.event_type,
      host_name: event.host_name,
      event_date: event.event_date,
      event_time: event.event_time,
      city: event.city,
      venue: event.venue,
      address: event.address,
      dress_code: event.dress_code,
      invite_direction: event.invite_direction,
      cover_url: event.cover_url,
      rsvp_deadline: event.rsvp_deadline,
    },
  });
}
