import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

// GET /api/hangouts — List upcoming hangouts
export async function GET() {
  try {
    const hangouts = await sql`
      SELECT h.*, u.name as host_name, u.avatar_url as host_avatar, u.tier as host_tier,
             v.name as venue_name, v.type as venue_type
      FROM hangouts h
      JOIN users u ON h.host_id = u.id
      LEFT JOIN venues v ON h.venue_id = v.id
      WHERE h.status IN ('pending', 'confirmed')
        AND h.event_time > NOW() - INTERVAL '2 hours'
      ORDER BY h.event_time ASC
    `;

    // Get attendees for each hangout
    const attendees = await sql`
      SELECT a.*, u.name, u.avatar_url
      FROM attendees a
      JOIN users u ON a.user_id = u.id
      WHERE a.status = 'attending'
    `;

    const serialized = hangouts.map((h) => {
      const d = h.event_time instanceof Date ? h.event_time : new Date(h.event_time as string);
      return {
        ...h,
        event_time: d.toISOString(),
        formatted_date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        formatted_time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        created_at: h.created_at instanceof Date ? h.created_at.toISOString() : h.created_at,
        attendees: attendees
          .filter((a) => a.hangout_id === h.id)
          .map((a) => ({
            user_id: a.user_id,
            name: a.name,
            avatar_url: a.avatar_url,
          })),
      };
    });

    return NextResponse.json({ hangouts: serialized });
  } catch (err) {
    console.error('Error fetching hangouts:', err);
    return NextResponse.json({ error: 'Failed to load hangouts.' }, { status: 500 });
  }
}

// POST /api/hangouts — Create a new hangout
export async function POST(req: NextRequest) {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) {
      return NextResponse.json({ error: 'Sign in to host a hangout.' }, { status: 401 });
    }

    const user = await getOrCreateUser(authUser);
    const body = await req.json();

    const { title, vibe, type, event_time, location, max_guests, cover_image, venue_id } = body;

    if (!title?.trim() || !vibe?.trim() || !event_time || !location?.trim()) {
      return NextResponse.json(
        { error: 'Title, vibe, time, and location are required.' },
        { status: 400 }
      );
    }

    const rows = await sql`
      INSERT INTO hangouts (host_id, title, vibe, type, event_time, location, max_guests, cover_image, venue_id)
      VALUES (
        ${user.id},
        ${title.trim()},
        ${vibe.trim()},
        ${type || 'open'},
        ${event_time},
        ${location.trim()},
        ${max_guests || 6},
        ${cover_image || null},
        ${venue_id || null}
      )
      RETURNING *
    `;

    // Auto-join the host as first attendee
    await sql`
      INSERT INTO attendees (hangout_id, user_id, status)
      VALUES (${rows[0].id}, ${user.id}, 'attending')
    `;

    return NextResponse.json({ ok: true, hangout: rows[0] });
  } catch (err) {
    console.error('Error creating hangout:', err);
    return NextResponse.json({ error: 'Failed to create hangout.' }, { status: 500 });
  }
}
