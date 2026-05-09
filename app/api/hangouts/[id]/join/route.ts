import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

// POST /api/hangouts/[id]/join — apply to a shift.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) {
      return NextResponse.json({ error: 'Sign in to apply for this shift.' }, { status: 401 });
    }

    const user = await getOrCreateUser(authUser);
    const { id: hangoutId } = await params;

    // Check if shift exists and has room
    const hangouts = await sql`
      SELECT * FROM hangouts WHERE id = ${hangoutId} AND status IN ('pending', 'confirmed')
    `;

    if (hangouts.length === 0) {
      return NextResponse.json({ error: 'Shift not found or unavailable.' }, { status: 404 });
    }

    const hangout = hangouts[0];

    if ((hangout.current_guests as number) >= (hangout.max_guests as number)) {
      return NextResponse.json({ error: 'This shift is filled.' }, { status: 400 });
    }

    // Check if already applied
    const existing = await sql`
      SELECT * FROM attendees WHERE hangout_id = ${hangoutId} AND user_id = ${user.id}
    `;

    if (existing.length > 0) {
      return NextResponse.json({ error: 'You have already applied for this shift.' }, { status: 400 });
    }

    // Add the worker to the shift roster.
    await sql`
      INSERT INTO attendees (hangout_id, user_id, status) VALUES (${hangoutId}, ${user.id}, 'attending')
    `;

    await sql`
      UPDATE hangouts SET current_guests = current_guests + 1 WHERE id = ${hangoutId}
    `;

    return NextResponse.json({ ok: true, message: 'Application received.' });
  } catch (err) {
    console.error('Error applying to shift:', err);
    return NextResponse.json({ error: 'Failed to apply for this shift.' }, { status: 500 });
  }
}
