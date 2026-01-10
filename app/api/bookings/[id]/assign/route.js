import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireRole } from '@/lib/auth';

// POST assign staff to booking (admin/supervisor only)
export async function POST(request, { params }) {
  try {
    const requireAdminOrSupervisor = requireRole('admin', 'supervisor');
    const authResult = await requireAdminOrSupervisor(request);

    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { staff_id, supervisor_id, notes } = body;

    if (!staff_id) {
      return NextResponse.json(
        { error: 'Staff ID is required' },
        { status: 400 }
      );
    }

    // Verify booking exists
    const [booking] = await sql`
      SELECT * FROM bookings WHERE id = ${id}
    `;

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify staff user exists and has staff role
    const [staff] = await sql`
      SELECT * FROM users WHERE id = ${staff_id} AND role = 'staff'
    `;

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    // Create or update assignment
    const [assignment] = await sql`
      INSERT INTO staff_assignments (
        booking_id, staff_id, supervisor_id, notes
      )
      VALUES (
        ${id},
        ${staff_id},
        ${supervisor_id || authResult.user.id},
        ${notes || null}
      )
      ON CONFLICT DO NOTHING
      RETURNING *
    `;

    // Update booking status to scheduled if not already
    if (booking.status === 'pending') {
      await sql`
        UPDATE bookings
        SET status = 'scheduled'
        WHERE id = ${id}
      `;
    }

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    console.error('Assign staff error:', error);
    return NextResponse.json(
      { error: 'Failed to assign staff' },
      { status: 500 }
    );
  }
}
