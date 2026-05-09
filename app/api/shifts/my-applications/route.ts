import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

// GET /api/shifts/my-applications
// Returns all shift applications for the signed-in worker, newest first.
export async function GET(req: NextRequest) {
  const { user: authUser } = await neonAuth();
  if (!authUser) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const user = await getOrCreateUser(authUser);

  const rows = await sql`
    SELECT
      sa.id,
      sa.shift_id,
      sa.status,
      sa.payout_provider,
      sa.payout_phone,
      sa.note,
      sa.applied_at,
      sa.updated_at,
      h.title          AS shift_title,
      h.location       AS shift_location,
      h.city           AS shift_city,
      h.area           AS shift_area,
      h.event_time     AS shift_event_time,
      h.ticket_price   AS shift_pay_ngn,
      h.vibe           AS shift_vibe,
      h.status         AS shift_status,
      u.name           AS outlet_name,
      u.avatar_url     AS outlet_avatar
    FROM shift_applications sa
    JOIN hangouts h ON h.id = sa.shift_id
    JOIN users u ON u.id = h.host_id
    WHERE sa.worker_id = ${String(user.id)}
    ORDER BY sa.applied_at DESC
    LIMIT 50
  `;

  const serialized = rows.map((r) => ({
    ...r,
    shift_event_time:
      r.shift_event_time instanceof Date
        ? r.shift_event_time.toISOString()
        : r.shift_event_time,
    applied_at:
      r.applied_at instanceof Date ? r.applied_at.toISOString() : r.applied_at,
    updated_at:
      r.updated_at instanceof Date ? r.updated_at.toISOString() : r.updated_at,
  }));

  return NextResponse.json({ applications: serialized });
}
