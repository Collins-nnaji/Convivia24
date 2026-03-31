import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

// POST /api/hangouts/[id]/join — Join a hangout
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) {
      return NextResponse.json({ error: 'Sign in to join a hangout.' }, { status: 401 });
    }

    const user = await getOrCreateUser(authUser);
    const { id: hangoutId } = await params;

    // Check if hangout exists and has room
    const hangouts = await sql`
      SELECT * FROM hangouts WHERE id = ${hangoutId} AND status IN ('pending', 'confirmed')
    `;

    if (hangouts.length === 0) {
      return NextResponse.json({ error: 'Hangout not found or unavailable.' }, { status: 404 });
    }

    const hangout = hangouts[0];

    if ((hangout.current_guests as number) >= (hangout.max_guests as number)) {
      return NextResponse.json({ error: 'This hangout is full.' }, { status: 400 });
    }

    // Check if already attending
    const existing = await sql`
      SELECT * FROM attendees WHERE hangout_id = ${hangoutId} AND user_id = ${user.id}
    `;

    if (existing.length > 0) {
      return NextResponse.json({ error: 'You have already joined this hangout.' }, { status: 400 });
    }

    // Join the hangout
    await sql`
      INSERT INTO attendees (hangout_id, user_id, status) VALUES (${hangoutId}, ${user.id}, 'attending')
    `;

    await sql`
      UPDATE hangouts SET current_guests = current_guests + 1 WHERE id = ${hangoutId}
    `;

    return NextResponse.json({ ok: true, message: "You're in. See you there." });
  } catch (err) {
    console.error('Error joining hangout:', err);
    return NextResponse.json({ error: 'Failed to join hangout.' }, { status: 500 });
  }
}
