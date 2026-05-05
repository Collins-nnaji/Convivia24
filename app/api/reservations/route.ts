import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

/**
 * GET  /api/reservations  — current user's recent reservations
 * POST /api/reservations  — request a seat at a venue
 *   { venue_id, party_size?, requested_for?, notes? }
 */

export async function GET() {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await getOrCreateUser(authUser);

    const rows = await sql`
      SELECT r.*, v.name as venue_name, v.image_url as venue_image, v.city as venue_city
      FROM reservations r
      JOIN venues v ON v.id = r.venue_id
      WHERE r.user_id = ${user.id}
      ORDER BY r.created_at DESC
      LIMIT 20
    `;

    return NextResponse.json({ reservations: rows });
  } catch (err) {
    console.error('Error loading reservations:', err);
    return NextResponse.json({ error: 'Failed to load reservations.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Sign in to reserve.' }, { status: 401 });
    const user = await getOrCreateUser(authUser);

    const body = await req.json();
    const { venue_id, party_size, requested_for, notes } = body;

    if (!venue_id) return NextResponse.json({ error: 'venue_id is required.' }, { status: 400 });

    // Check the venue actually exists
    const venues = await sql`SELECT id, name FROM venues WHERE id = ${venue_id} LIMIT 1`;
    if (venues.length === 0) return NextResponse.json({ error: 'Venue not found.' }, { status: 404 });

    // Premium users get auto-confirmed reservations; free users get "requested" until partner confirms.
    const premiumNow = user.tier === 'black' || (user.premium_until && new Date(user.premium_until as string).getTime() > Date.now());
    const status = premiumNow ? 'confirmed' : 'requested';

    const inserted = await sql`
      INSERT INTO reservations (user_id, venue_id, party_size, requested_for, status, notes)
      VALUES (
        ${user.id},
        ${venue_id},
        ${Number(party_size) || 2},
        ${requested_for || null},
        ${status},
        ${notes?.toString().trim() || null}
      )
      RETURNING *
    `;

    return NextResponse.json({ ok: true, reservation: inserted[0], premium: premiumNow });
  } catch (err) {
    console.error('Error creating reservation:', err);
    return NextResponse.json({ error: 'Failed to create reservation.' }, { status: 500 });
  }
}
