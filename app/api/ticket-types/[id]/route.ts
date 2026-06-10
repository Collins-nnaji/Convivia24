import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { isAdminRequest } from '@/lib/auth/session';

/** Update a ticket tier. Admin only. Quantity can't drop below tickets already sold. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const d = await req.json();

    if (d.quantity != null) {
      const [tier] = await sql`SELECT sold FROM ticket_types WHERE id = ${id}`;
      if (tier && Number(d.quantity) < Number(tier.sold)) {
        return NextResponse.json({ error: `Quantity can't be below ${tier.sold} already sold.` }, { status: 400 });
      }
    }

    const rows = await sql`
      UPDATE ticket_types SET
        name          = COALESCE(${d.name ?? null}, name),
        description   = COALESCE(${d.description ?? null}, description),
        price         = COALESCE(${d.price ?? null}, price),
        quantity      = COALESCE(${d.quantity ?? null}, quantity),
        max_per_order = COALESCE(${d.max_per_order ?? null}, max_per_order),
        perks         = COALESCE(${(d.perks ?? null) as string[] | null}::text[], perks),
        is_active     = COALESCE(${d.is_active ?? null}, is_active),
        sort_order    = COALESCE(${d.sort_order ?? null}, sort_order),
        updated_at    = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (!rows.length) return NextResponse.json({ error: 'Tier not found.' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[PATCH /api/ticket-types/[id]]', err);
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 });
  }
}

/** Delete a ticket tier. Admin only. Blocked once tickets have sold. */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const [tier] = await sql`SELECT sold FROM ticket_types WHERE id = ${id}`;
    if (!tier) return NextResponse.json({ error: 'Tier not found.' }, { status: 404 });
    if (Number(tier.sold) > 0) {
      return NextResponse.json({ error: 'Can\'t delete a tier with tickets sold — deactivate it instead.' }, { status: 400 });
    }
    await sql`DELETE FROM ticket_types WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/ticket-types/[id]]', err);
    return NextResponse.json({ error: 'Delete failed.' }, { status: 500 });
  }
}
