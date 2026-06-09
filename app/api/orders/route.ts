import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(req: NextRequest) {
  if (process.env.ADMIN_SECRET && req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const rows = await sql`
      SELECT o.*, e.title AS event_title, e.slug AS event_slug,
        (SELECT COUNT(*) FROM tickets t WHERE t.order_id = o.id) AS ticket_count
      FROM orders o
      JOIN events e ON e.id = o.event_id
      ORDER BY o.created_at DESC
      LIMIT 200
    `;
    return NextResponse.json({ orders: rows });
  } catch (err) {
    console.error('[GET /api/orders]', err);
    return NextResponse.json({ error: 'Failed to load orders.' }, { status: 500 });
  }
}
