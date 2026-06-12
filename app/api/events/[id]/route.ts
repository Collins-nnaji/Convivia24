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
      UPDATE events
      SET name             = COALESCE(${data.name ?? null}, name),
          description      = COALESCE(${data.description ?? null}, description),
          frequency        = COALESCE(${data.frequency ?? null}, frequency),
          day_of_week      = COALESCE(${data.day_of_week ?? null}, day_of_week),
          time_start       = COALESCE(${data.time_start ?? null}, time_start),
          time_end         = COALESCE(${data.time_end ?? null}, time_end),
          access_note      = COALESCE(${data.access_note ?? null}, access_note),
          image_url        = COALESCE(${data.image_url ?? null}, image_url),
          booking_required = COALESCE(${data.booking_required ?? null}, booking_required),
          is_active        = COALESCE(${data.is_active ?? null}, is_active),
          sort_order       = COALESCE(${data.sort_order ?? null}, sort_order),
          updated_at       = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `;
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[PATCH /api/events/[id]]', err);
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const secret = req.headers.get('x-admin-secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await sql`DELETE FROM events WHERE id = ${params.id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/events/[id]]', err);
    return NextResponse.json({ error: 'Delete failed.' }, { status: 500 });
  }
}
