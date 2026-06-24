import sql from '@/lib/db';

export interface EventFinance {
  event_id: string;
  title: string;
  slug: string;
  currency: string;
  tickets_sold: number;
  tickets_checked_in: number;
  orders_count: number;
  gross_revenue: number;
  conversion_rate: number;
  avg_order_value: number;
}

export async function getEventFinance(eventId: string): Promise<EventFinance | null> {
  const rows = await sql`
    SELECT
      e.id AS event_id,
      e.title,
      e.slug,
      e.currency,
      COALESCE(SUM(tt.sold), 0)::int AS tickets_sold,
      (SELECT COUNT(*)::int FROM tickets t WHERE t.event_id = e.id AND t.status = 'used') AS tickets_checked_in,
      (SELECT COUNT(*)::int FROM orders o WHERE o.event_id = e.id AND o.status = 'paid') AS orders_count,
      COALESCE((SELECT SUM(o.total) FROM orders o WHERE o.event_id = e.id AND o.status = 'paid'), 0)::float AS gross_revenue
    FROM events e
    LEFT JOIN ticket_types tt ON tt.event_id = e.id
    WHERE e.id = ${eventId}
    GROUP BY e.id
  `;
  if (!rows.length) return null;
  const r = rows[0];
  const sold = Number(r.tickets_sold);
  const orders = Number(r.orders_count);
  const revenue = Number(r.gross_revenue);
  return {
    event_id: String(r.event_id),
    title: String(r.title),
    slug: String(r.slug),
    currency: String(r.currency),
    tickets_sold: sold,
    tickets_checked_in: Number(r.tickets_checked_in),
    orders_count: orders,
    gross_revenue: revenue,
    conversion_rate: sold > 0 ? Math.round((orders / sold) * 100) : 0,
    avg_order_value: orders > 0 ? revenue / orders : 0,
  };
}

export async function getPlatformFinance() {
  const rows = await sql`
    SELECT
      COUNT(DISTINCT e.id)::int AS events,
      COALESCE(SUM(tt.sold), 0)::int AS tickets_sold,
      (SELECT COUNT(*)::int FROM orders WHERE status = 'paid') AS orders,
      COALESCE((SELECT SUM(total) FROM orders WHERE status = 'paid'), 0)::float AS gross_revenue,
      (SELECT COUNT(*)::int FROM guestlist_applications WHERE status = 'pending') AS pending_applications
    FROM events e
    LEFT JOIN ticket_types tt ON tt.event_id = e.id
  `;
  return rows[0];
}
