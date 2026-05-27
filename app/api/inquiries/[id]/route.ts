import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const secret = req.headers.get('x-admin-secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { status, admin_notes } = await req.json();
    const validStatuses = ['new', 'read', 'responded', 'archived'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }

    const rows = await sql`
      UPDATE inquiries
      SET status      = COALESCE(${status || null}, status),
          admin_notes = COALESCE(${admin_notes ?? null}, admin_notes),
          updated_at  = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `;
    if (!rows.length) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[PATCH /api/inquiries/[id]]', err);
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 });
  }
}
