import { NextRequest, NextResponse } from 'next/server';
import { withAudit } from '@/lib/audit/route';
import { requireAdmin } from '@/lib/admin';
import sql, { apiErrorResponse } from '@/lib/db';
import { captureApiError } from '@/lib/sentry';

/**
 * Customers, built from orders (one row per email): what they have spent, how often they order,
 * their loyalty balance and any open support requests. `?email=` returns one customer's orders.
 */

const COLLECTED = ['paid', 'processing', 'packed', 'out_for_delivery', 'delivered', 'fulfilled', 'refunded'];

async function handleGET(req: NextRequest) {
  const gate = await requireAdmin('orders');
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const url = new URL(req.url);
    const email = (url.searchParams.get('email') || '').trim().toLowerCase();
    if (email) {
      const orders = await sql`
        SELECT o.id, o.status, COALESCE(o.total_ngn, o.subtotal_ngn) AS total, o.refunded_ngn, o.created_at, o.area, o.city,
               COALESCE(json_agg(json_build_object('name', i.kit_name, 'qty', i.qty) ORDER BY i.created_at)
                 FILTER (WHERE i.id IS NOT NULL), '[]'::json) AS items
        FROM ritual_orders o LEFT JOIN ritual_order_items i ON i.order_id = o.id
        WHERE LOWER(o.email) = ${email} AND o.status <> 'pending'
        GROUP BY o.id ORDER BY o.created_at DESC LIMIT 100
      `;
      const tickets = await sql`
        SELECT id, category, status, message, created_at FROM support_tickets WHERE LOWER(email) = ${email} ORDER BY created_at DESC LIMIT 20
      `.catch(() => []);
      return NextResponse.json({
        orders: orders.map((o) => ({
          id: String(o.id),
          status: String(o.status),
          totalNgn: Number(o.total ?? 0),
          refundedNgn: Number(o.refunded_ngn ?? 0),
          createdAt: String(o.created_at instanceof Date ? o.created_at.toISOString() : o.created_at),
          area: [o.area, o.city].filter(Boolean).join(', '),
          items: o.items,
        })),
        tickets: tickets.map((t) => ({
          id: String(t.id),
          category: String(t.category),
          status: String(t.status),
          message: String(t.message).slice(0, 200),
          createdAt: String(t.created_at instanceof Date ? t.created_at.toISOString() : t.created_at),
        })),
      });
    }

    const q = (url.searchParams.get('q') || '').trim().toLowerCase();
    const like = q ? `%${q}%` : null;
    const sort = url.searchParams.get('sort') === 'spend' ? 'spend' : 'recent';
    const rows = await sql`
      WITH c AS (
        SELECT LOWER(o.email) AS email,
               (ARRAY_AGG(o.full_name ORDER BY o.created_at DESC))[1] AS name,
               (ARRAY_AGG(o.phone ORDER BY o.created_at DESC) FILTER (WHERE o.phone IS NOT NULL))[1] AS phone,
               (ARRAY_AGG(COALESCE(o.area, o.city) ORDER BY o.created_at DESC))[1] AS area,
               COUNT(*) FILTER (WHERE o.status = ANY(${COLLECTED}))::int AS orders,
               COALESCE(SUM(COALESCE(o.total_ngn, o.subtotal_ngn) - COALESCE(o.refunded_ngn, 0)) FILTER (WHERE o.status = ANY(${COLLECTED})), 0)::bigint AS spend,
               COUNT(*) FILTER (WHERE o.status IN ('awaiting_payment'))::int AS unpaid,
               MIN(o.created_at) AS first_at,
               MAX(o.created_at) AS last_at
        FROM ritual_orders o
        WHERE o.status <> 'pending' AND o.archived_at IS NULL
        GROUP BY LOWER(o.email)
      )
      SELECT c.*,
             COALESCE(lm.points, 0) AS points,
             (SELECT COUNT(*)::int FROM support_tickets t WHERE LOWER(t.email) = c.email AND t.status <> 'resolved') AS open_tickets
      FROM c
      LEFT JOIN LATERAL (SELECT points FROM loyalty_members m WHERE LOWER(m.email) = c.email ORDER BY updated_at DESC LIMIT 1) lm ON true
      WHERE ${like}::text IS NULL OR c.email LIKE ${like} OR LOWER(COALESCE(c.name, '')) LIKE ${like} OR COALESCE(c.phone, '') LIKE ${like}
      ORDER BY CASE WHEN ${sort} = 'spend' THEN c.spend END DESC NULLS LAST, c.last_at DESC
      LIMIT 200
    `;
    return NextResponse.json({
      customers: rows.map((r) => ({
        email: String(r.email),
        name: r.name ? String(r.name) : null,
        phone: r.phone ? String(r.phone) : null,
        area: r.area ? String(r.area) : null,
        orders: Number(r.orders),
        spendNgn: Number(r.spend),
        unpaid: Number(r.unpaid),
        points: Number(r.points),
        openTickets: Number(r.open_tickets),
        firstAt: String(r.first_at instanceof Date ? r.first_at.toISOString() : r.first_at),
        lastAt: String(r.last_at instanceof Date ? r.last_at.toISOString() : r.last_at),
      })),
    });
  } catch (err) {
    captureApiError(err, { route: 'admin/customers GET' });
    const { status, error } = apiErrorResponse(err, 'Could not load customers.');
    return NextResponse.json({ error }, { status });
  }
}

export const GET = withAudit('/api/admin/customers', handleGET);
