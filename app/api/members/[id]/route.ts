import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const secret = req.headers.get('x-admin-secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const rows = await sql`
      UPDATE convivium_members
      SET name         = COALESCE(${data.name ?? null}, name),
          phone        = COALESCE(${data.phone ?? null}, phone),
          member_type  = COALESCE(${data.member_type ?? null}, member_type),
          status       = COALESCE(${data.status ?? null}, status),
          renewal_date = COALESCE(${data.renewal_date ?? null}, renewal_date),
          notes        = COALESCE(${data.notes ?? null}, notes),
          updated_at   = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `;
    if (!rows.length) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[PATCH /api/members/[id]]', err);
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 });
  }
}
