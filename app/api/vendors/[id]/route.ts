import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { isAdminRequest } from '@/lib/auth/session';
import { VENDOR_STATUSES } from '@/lib/vendors';

/** Admin-only: approve / reject / feature / annotate a vendor listing. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const { status, is_featured, admin_notes } = await req.json();

    if (status && !VENDOR_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }

    const rows = await sql`
      UPDATE vendors
      SET status      = COALESCE(${status ?? null}, status),
          is_featured = COALESCE(${typeof is_featured === 'boolean' ? is_featured : null}, is_featured),
          admin_notes = COALESCE(${admin_notes ?? null}, admin_notes),
          updated_at  = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (!rows.length) return NextResponse.json({ error: 'Vendor not found.' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[PATCH /api/vendors/[id]]', err);
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 });
  }
}

/** Admin-only: remove a vendor listing. */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const rows = await sql`DELETE FROM vendors WHERE id = ${id} RETURNING id`;
    if (!rows.length) return NextResponse.json({ error: 'Vendor not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/vendors/[id]]', err);
    return NextResponse.json({ error: 'Delete failed.' }, { status: 500 });
  }
}
