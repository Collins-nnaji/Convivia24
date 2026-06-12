import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { isAdminRequest } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const [events] = await sql`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='published') AS published FROM events`;
    const [tickets] = await sql`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='used') AS checked_in FROM tickets`;
    const [orders] = await sql`SELECT COUNT(*) AS total, COALESCE(SUM(total),0) AS revenue FROM orders WHERE status='paid'`;
    const byEvent = await sql`
      SELECT e.title, e.slug, e.starts_at,
        (SELECT COUNT(*) FROM tickets t WHERE t.event_id = e.id) AS sold,
        (SELECT COUNT(*) FROM tickets t WHERE t.event_id = e.id AND t.status='used') AS checked_in
      FROM events e WHERE e.status='published'
      ORDER BY e.starts_at ASC LIMIT 12
    `;
    return NextResponse.json({ events, tickets, orders, byEvent });
  } catch (err) {
    console.error('[GET /api/stats]', err);
    return NextResponse.json({ error: 'Failed to load stats.' }, { status: 500 });
  }
}
