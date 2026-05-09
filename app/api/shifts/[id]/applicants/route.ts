import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

// GET /api/shifts/[id]/applicants
// Outlet-only: returns all workers who applied for this shift.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user: authUser } = await neonAuth();
  if (!authUser) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const user = await getOrCreateUser(authUser);
  const { id: shiftId } = await params;

  // Only the outlet that posted the shift (host) can view applicants
  const shifts = await sql`
    SELECT id, host_id, title FROM hangouts WHERE id = ${shiftId} LIMIT 1
  `;
  if (shifts.length === 0) {
    return NextResponse.json({ error: 'Shift not found.' }, { status: 404 });
  }
  if (String(shifts[0].host_id) !== String(user.id)) {
    return NextResponse.json({ error: 'Only the outlet that posted this shift can view applicants.' }, { status: 403 });
  }

  const applicants = await sql`
    SELECT
      sa.id,
      sa.shift_id,
      sa.worker_id,
      sa.status,
      sa.payout_provider,
      sa.payout_phone,
      sa.note,
      sa.applied_at,
      sa.updated_at,
      u.name         AS worker_name,
      u.avatar_url   AS worker_avatar,
      u.rating       AS worker_rating,
      u.verified     AS worker_verified,
      u.location     AS worker_location,
      u.certifications AS worker_certifications,
      u.bio          AS worker_bio
    FROM shift_applications sa
    JOIN users u ON u.id = sa.worker_id
    WHERE sa.shift_id = ${shiftId}
    ORDER BY
      CASE sa.status
        WHEN 'confirmed'   THEN 1
        WHEN 'shortlisted' THEN 2
        WHEN 'pending'     THEN 3
        WHEN 'rejected'    THEN 4
        WHEN 'no_show'     THEN 5
      END,
      sa.applied_at ASC
  `;

  return NextResponse.json({ applicants });
}
