import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { isAdminRequest } from '@/lib/auth/session';

/** Create a new ticket tier on an event. Admin only. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const eventRows = await sql`SELECT id, currency FROM events WHERE id::text = ${id} OR slug = ${id} LIMIT 1`;
    const event = eventRows[0];
    if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });

    const t = await req.json();
    if (!t?.name?.trim()) return NextResponse.json({ error: 'Tier name is required.' }, { status: 400 });

    const [{ next_order }] = await sql`SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM ticket_types WHERE event_id = ${event.id}`;

    const rows = await sql`
      INSERT INTO ticket_types (event_id, name, description, price, currency, quantity, max_per_order, perks, is_active, sort_order)
      VALUES (${event.id}, ${t.name.trim()}, ${t.description || null}, ${Number(t.price) || 0}, ${event.currency},
        ${Number(t.quantity) || 100}, ${Number(t.max_per_order) || 10},
        ${(t.perks?.length ? t.perks : null) as string[] | null}::text[], ${t.is_active ?? true}, ${next_order})
      RETURNING *
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error('[POST /api/events/[id]/tickets]', err);
    return NextResponse.json({ error: 'Could not create the tier.' }, { status: 500 });
  }
}
