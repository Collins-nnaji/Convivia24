import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  try {
    const orders = await sql`
      SELECT o.reference, o.total, o.currency, o.status, o.created_at,
        e.title AS event_title, e.slug AS event_slug, e.starts_at, e.venue, e.city, e.cover_image,
        (SELECT COUNT(*) FROM tickets t WHERE t.order_id = o.id) AS ticket_count
      FROM orders o
      JOIN events e ON e.id = o.event_id
      WHERE o.user_id = ${user.id} OR LOWER(o.buyer_email) = ${user.email.toLowerCase()}
      ORDER BY e.starts_at ASC, o.created_at DESC
    `;
    return NextResponse.json({ orders });
  } catch (err) {
    console.error('[GET /api/me/orders]', err);
    return NextResponse.json({ error: 'Could not load your tickets.' }, { status: 500 });
  }
}
