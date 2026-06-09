import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyTicketPayload } from '@/lib/tickets/codes';

function authorized(req: NextRequest): boolean {
  const secret = req.headers.get('x-admin-secret');
  // If no ADMIN_SECRET is configured, allow the door scanner in demo mode.
  if (!process.env.ADMIN_SECRET) return true;
  return secret === process.env.ADMIN_SECRET;
}

/**
 * Validate / check in a ticket at the door.
 * body: { payload: string (QR contents or raw code), checkin?: boolean, gate?: string }
 */
export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { payload, checkin = true, gate } = await req.json();
    if (!payload || typeof payload !== 'string') {
      return NextResponse.json({ result: 'invalid', message: 'No ticket scanned.' }, { status: 400 });
    }

    const { code, valid } = verifyTicketPayload(payload);
    if (!valid) {
      return NextResponse.json({ result: 'invalid', message: 'Unrecognised or tampered ticket.' });
    }

    const rows = await sql`SELECT * FROM tickets WHERE code = ${code} LIMIT 1`;
    const ticket = rows[0];
    if (!ticket) {
      return NextResponse.json({ result: 'invalid', message: 'Ticket not found.' });
    }

    const eventRows = await sql`SELECT title, venue, starts_at FROM events WHERE id = ${ticket.event_id} LIMIT 1`;
    const event = eventRows[0] ?? null;

    if (ticket.status === 'void') {
      return NextResponse.json({ result: 'void', message: 'Ticket has been voided.', ticket, event });
    }

    if (ticket.status === 'used') {
      return NextResponse.json({
        result: 'already_used',
        message: `Already checked in${ticket.checked_in_at ? ' at ' + new Date(ticket.checked_in_at as string).toLocaleString('en-GB') : ''}.`,
        ticket, event,
      });
    }

    if (checkin) {
      const updated = await sql`
        UPDATE tickets
        SET status = 'used', checked_in_at = NOW(), checked_in_by = ${gate || 'Door'}
        WHERE id = ${ticket.id} AND status = 'valid'
        RETURNING *
      `;
      return NextResponse.json({ result: 'admitted', message: 'Welcome in.', ticket: updated[0] ?? ticket, event });
    }

    return NextResponse.json({ result: 'valid', message: 'Valid ticket.', ticket, event });
  } catch (err) {
    console.error('[POST /api/scan]', err);
    return NextResponse.json({ result: 'invalid', message: 'Scan failed. Try again.' }, { status: 500 });
  }
}
