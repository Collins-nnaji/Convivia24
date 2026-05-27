import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const secret = req.headers.get('x-admin-secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { type, ...data } = await req.json();

    if (type === 'category') {
      const rows = await sql`
        UPDATE menu_categories
        SET name       = COALESCE(${data.name ?? null}, name),
            note       = COALESCE(${data.note ?? null}, note),
            sort_order = COALESCE(${data.sort_order ?? null}, sort_order),
            is_active  = COALESCE(${data.is_active ?? null}, is_active),
            updated_at = NOW()
        WHERE id = ${params.id}
        RETURNING *
      `;
      if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(rows[0]);
    }

    const rows = await sql`
      UPDATE menu_items
      SET name        = COALESCE(${data.name ?? null}, name),
          description = COALESCE(${data.description ?? null}, description),
          price       = COALESCE(${data.price ?? null}, price),
          is_active   = COALESCE(${data.is_active ?? null}, is_active),
          is_highlight= COALESCE(${data.is_highlight ?? null}, is_highlight),
          sort_order  = COALESCE(${data.sort_order ?? null}, sort_order),
          image_url   = COALESCE(${data.image_url ?? null}, image_url),
          updated_at  = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `;
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[PATCH /api/menu/[id]]', err);
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const secret = req.headers.get('x-admin-secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { type } = await req.json().catch(() => ({ type: 'item' }));
    const table = type === 'category' ? 'menu_categories' : 'menu_items';
    await sql`DELETE FROM ${sql(table)} WHERE id = ${params.id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/menu/[id]]', err);
    return NextResponse.json({ error: 'Delete failed.' }, { status: 500 });
  }
}
