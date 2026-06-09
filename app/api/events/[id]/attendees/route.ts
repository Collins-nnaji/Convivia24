import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.ADMIN_SECRET && req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const rows = await sql`
      SELECT t.code, t.attendee_name, t.ticket_type_name, t.status, t.checked_in_at,
             o.reference, o.buyer_name, o.buyer_email
      FROM tickets t
      JOIN orders o ON o.id = t.order_id
      WHERE t.event_id::text = ${id} OR t.event_id IN (SELECT id FROM events WHERE slug = ${id})
      ORDER BY t.created_at DESC
    `;
    return NextResponse.json({ attendees: rows });
  } catch (err) {
    console.error('[GET /api/events/[id]/attendees]', err);
    return NextResponse.json({ error: 'Failed to load attendees.' }, { status: 500 });
  }
}
