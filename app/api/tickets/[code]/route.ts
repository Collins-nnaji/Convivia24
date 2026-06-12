import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const rows = await sql`SELECT * FROM tickets WHERE code = ${code.toUpperCase()} LIMIT 1`;
    const ticket = rows[0];
    if (!ticket) return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });

    const eventRows = await sql`SELECT * FROM events WHERE id = ${ticket.event_id} LIMIT 1`;
    const orderRows = await sql`SELECT reference, buyer_name FROM orders WHERE id = ${ticket.order_id} LIMIT 1`;
    return NextResponse.json({ ticket, event: eventRows[0] ?? null, order: orderRows[0] ?? null });
  } catch (err) {
    console.error('[GET /api/tickets/[code]]', err);
    return NextResponse.json({ error: 'Could not load ticket.' }, { status: 500 });
  }
}
