import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

// GET /api/people?city=Lagos
// Returns two groups:
//   activity_groups — upcoming hangouts with their attendees (grouped by event)
//   open_to_meet   — users who flagged themselves as open to meeting, no specific event
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city') || 'Lagos';

    // Group 1: upcoming hangouts in this city with attendee details
    const hangouts = await sql`
      SELECT
        h.id, h.title, h.location, h.city, h.category, h.event_time,
        h.max_guests, h.current_guests, h.ticket_url, h.ticket_price
      FROM hangouts h
      WHERE h.status IN ('pending', 'confirmed')
        AND h.event_time > NOW() - INTERVAL '2 hours'
        AND h.event_time < NOW() + INTERVAL '7 days'
        AND (
          h.city ILIKE ${city}
          OR h.location ILIKE ${'%' + city + '%'}
          OR h.id IN (
            SELECT hh.id FROM hangouts hh
            JOIN venues v ON v.id = hh.venue_id
            WHERE v.city ILIKE ${city}
          )
        )
      ORDER BY h.event_time ASC
      LIMIT 20
    `;

    // Attendees for all those hangouts
    const hangoutIds = hangouts.map(h => h.id);
    const attendees = hangoutIds.length > 0 ? await sql`
      SELECT a.hangout_id, u.id, u.name, u.avatar_url, u.tier, u.verified, u.rating
      FROM attendees a
      JOIN users u ON u.id = a.user_id
      WHERE a.hangout_id = ANY(${hangoutIds}::uuid[])
        AND a.status = 'attending'
    ` : [];

    const activity_groups = hangouts.map(h => {
      const d = h.event_time instanceof Date ? h.event_time : new Date(h.event_time as string);
      return {
        hangout_id: h.id,
        title: h.title,
        location: h.location,
        city: h.city,
        category: h.category,
        event_time: d.toISOString(),
        formatted_time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        formatted_date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        max_guests: h.max_guests,
        current_guests: h.current_guests,
        ticket_url: h.ticket_url,
        ticket_price: h.ticket_price,
        attendees: attendees
          .filter(a => a.hangout_id === h.id)
          .map(a => ({ id: a.id, name: a.name, avatar_url: a.avatar_url, tier: a.tier, verified: a.verified, rating: a.rating })),
      };
    });

    // Group 2: users open to meeting, in this city, not already in an upcoming event
    const open_to_meet = await sql`
      SELECT u.id, u.name, u.avatar_url, u.bio, u.location, u.tier, u.verified, u.rating, u.hangouts_count
      FROM users u
      WHERE u.open_to_meet = true
        AND u.location ILIKE ${'%' + city + '%'}
      ORDER BY u.rating DESC, u.hangouts_count DESC
      LIMIT 24
    `;

    return NextResponse.json({ activity_groups, open_to_meet });
  } catch (err) {
    console.error('Error fetching people:', err);
    return NextResponse.json({ error: 'Failed to load.' }, { status: 500 });
  }
}
