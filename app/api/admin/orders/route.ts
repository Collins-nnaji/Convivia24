import { NextRequest, NextResponse } from 'next/server';
import sql, { apiErrorResponse } from '@/lib/db';
import { requireAdmin } from '@/lib/admin';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/commerce/status';
import { notifyOrderStatus } from '@/lib/commerce/notify';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

/** Statuses the desk can hand-set. System-only statuses (pending, awaiting_payment) are excluded. */
const ADMIN_SETTABLE_STATUSES: OrderStatus[] = ORDER_STATUSES.filter(
  (s) => s !== 'pending' && s !== 'awaiting_payment'
);

export async function GET() {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const orders = await sql`
      SELECT
        o.id,
        o.email,
        o.full_name,
        o.phone,
        o.status,
        o.subtotal_ngn,
        o.loyalty_discount_ngn,
        o.total_ngn,
        o.address_line1,
        o.address_line2,
        o.area,
        o.notes,
        o.created_at,
        o.updated_at,
        COALESCE(
          json_agg(
            json_build_object('name', i.kit_name, 'qty', i.qty, 'unitPriceNgn', i.unit_price_ngn)
            ORDER BY i.created_at
          ) FILTER (WHERE i.id IS NOT NULL),
          '[]'::json
        ) AS items
      FROM ritual_orders o
      LEFT JOIN ritual_order_items i ON i.order_id = o.id
      WHERE o.status != 'pending'
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 200
    `;

    return NextResponse.json({
      orders: orders.map((o) => ({
        id: o.id,
        email: o.email,
        fullName: o.full_name,
        phone: o.phone,
        status: o.status,
        subtotalNgn: o.subtotal_ngn,
        loyaltyDiscountNgn: Number(o.loyalty_discount_ngn ?? 0),
        totalNgn: Number(o.total_ngn ?? o.subtotal_ngn),
        addressLine1: o.address_line1,
        addressLine2: o.address_line2,
        area: o.area,
        notes: o.notes,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
        items: o.items,
      })),
      statuses: ADMIN_SETTABLE_STATUSES,
    });
  } catch (err) {
    captureApiError(err, { route: 'admin/orders GET' });
    const { status, error } = apiErrorResponse(err, 'Unable to load orders.');
    return NextResponse.json({ error }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const rl = await rateLimit(`admin:${clientIp(req)}`, 40, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
    const status = typeof body.status === 'string' ? (body.status as OrderStatus) : null;
    const note = typeof body.note === 'string' && body.note.trim() ? body.note.trim() : null;

    if (!orderId) return NextResponse.json({ error: 'orderId is required.' }, { status: 400 });
    if (!status || !ADMIN_SETTABLE_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Unknown or unsettable status.' }, { status: 400 });
    }

    const [order] = await sql`
      UPDATE ritual_orders
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${orderId}
      RETURNING id, status
    `;

    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

    await notifyOrderStatus(orderId, status, note);

    return NextResponse.json({ ok: true, orderId: order.id, status: order.status });
  } catch (err) {
    captureApiError(err, { route: 'admin/orders PATCH' });
    const { status, error } = apiErrorResponse(err, 'Unable to update order.');
    return NextResponse.json({ error }, { status });
  }
}
