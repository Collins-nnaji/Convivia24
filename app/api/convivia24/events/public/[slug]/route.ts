import { NextRequest, NextResponse } from 'next/server';
import { getEventBySlug, getGuestStats, getGiftsForEvent } from '@/lib/convivia24';

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [stats, gifts] = await Promise.all([
    getGuestStats(event.id),
    getGiftsForEvent(event.id),
  ]);

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
      invite_live: event.invite_live,
    },
    stats: { in: stats.in, maybe: stats.maybe, total: stats.total },
    gifts: gifts.map(g => ({
      id: g.id,
      title: g.title,
      kind: g.kind,
      amount_target: g.amount_target,
      amount_pledged: g.amount_pledged,
      claimed: g.claimed,
      image_label: g.image_label,
    })),
  });
}
