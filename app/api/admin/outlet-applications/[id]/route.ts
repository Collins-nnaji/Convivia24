import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { isConviviaAdmin } from '@/lib/admin';
import { getOutletApplicationForUser, serializeOutletApplication } from '@/lib/outlet-application';

/** PATCH — approve / reject / mark under review. */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser?.email || !isConviviaAdmin(authUser.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await ctx.params;
    const body = await req.json();
    const action = typeof body.action === 'string' ? body.action.trim() : '';
    const admin_notes = typeof body.admin_notes === 'string' ? body.admin_notes.trim() : '';

    if (!['approve', 'reject', 'under_review'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
    }

    const existing = await sql`
      SELECT user_id FROM outlet_applications WHERE id = ${id}::uuid LIMIT 1
    `;
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    }
    const ownerId = String(existing[0].user_id);

    if (action === 'approve') {
      await sql`
        UPDATE outlet_applications
        SET
          status = 'approved',
          approved_at = NOW(),
          rejected_at = NULL,
          admin_notes = ${admin_notes || null},
          reviewed_by = ${authUser.email},
          updated_at = NOW()
        WHERE id = ${id}::uuid
      `;
    } else if (action === 'reject') {
      await sql`
        UPDATE outlet_applications
        SET
          status = 'rejected',
          rejected_at = NOW(),
          approved_at = NULL,
          admin_notes = ${admin_notes || null},
          reviewed_by = ${authUser.email},
          updated_at = NOW()
        WHERE id = ${id}::uuid
      `;
    } else {
      await sql`
        UPDATE outlet_applications
        SET
          status = 'under_review',
          admin_notes = ${admin_notes || null},
          reviewed_by = ${authUser.email},
          updated_at = NOW()
        WHERE id = ${id}::uuid
      `;
    }

    const fresh = await getOutletApplicationForUser(ownerId);
    return NextResponse.json({
      ok: true,
      application: serializeOutletApplication(fresh),
    });
  } catch (err) {
    console.error('PATCH /api/admin/outlet-applications/[id]', err);
    return NextResponse.json({ error: 'Failed to update.' }, { status: 500 });
  }
}
