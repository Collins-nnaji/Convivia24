import { NextRequest, NextResponse } from 'next/server';
import sql, { apiErrorResponse } from '@/lib/db';
import { requireAdmin } from '@/lib/admin';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/commerce/status';
import { notifyOrderStatus } from '@/lib/commerce/notify';
import { formatNgn } from '@/lib/drinks/catalog';
import { releaseOrderResources, fulfillOrderStock } from '@/lib/commerce/fulfillment';
import { rateLimit, clientIp } from '@/lib/redis';
import { refundFlutterwave } from '@/lib/payments/flutterwave';
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
        o.gift_card_discount_ngn,
        o.total_ngn,
        o.address_line1,
        o.address_line2,
        o.area,
        o.notes,
        o.courier_name,
        o.rider_phone,
        o.eta_at,
        o.tracking_note,
        o.payment_provider,
        o.payment_ref,
        o.refund_ref,
        o.refunded_ngn,
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
        giftCardDiscountNgn: Number(o.gift_card_discount_ngn ?? 0),
        totalNgn: Number(o.total_ngn ?? o.subtotal_ngn),
        addressLine1: o.address_line1,
        addressLine2: o.address_line2,
        area: o.area,
        notes: o.notes,
        courierName: o.courier_name,
        riderPhone: o.rider_phone,
        etaAt: o.eta_at,
        trackingNote: o.tracking_note,
        paymentProvider: o.payment_provider,
        paymentRef: o.payment_ref,
        refundRef: o.refund_ref,
        refundedNgn: Number(o.refunded_ngn ?? 0),
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
    if (!orderId) return NextResponse.json({ error: 'orderId is required.' }, { status: 400 });

    // Refund is its own action — it calls out to Flutterwave and always lands on status=refunded.
    if (body.action === 'refund') {
      const [order] = await sql`
        SELECT id, status, total_ngn, subtotal_ngn, payment_provider, payment_ref
        FROM ritual_orders WHERE id = ${orderId} LIMIT 1
      `;
      if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
      if (order.status === 'refunded' || order.status === 'cancelled') {
        return NextResponse.json({ error: 'This order is already refunded or cancelled.' }, { status: 400 });
      }
      const amountNgn = Number(order.total_ngn ?? order.subtotal_ngn);
      let refundRef = 'manual';
      if (
        (order.payment_provider === 'flutterwave' || order.payment_provider === 'paystack') &&
        order.payment_ref
      ) {
        const result = await refundFlutterwave(order.payment_ref as string, amountNgn);
        if ('error' in result) return NextResponse.json({ error: result.error }, { status: 502 });
        refundRef = result.refundRef;
      }
      await sql`
        UPDATE ritual_orders
        SET status = 'refunded', refund_ref = ${refundRef}, refunded_ngn = ${amountNgn}, updated_at = NOW()
        WHERE id = ${orderId}
      `;
      await releaseOrderResources(orderId);
      await notifyOrderStatus(orderId, 'refunded', `Refunded ${formatNgn(amountNgn)}.`);
      return NextResponse.json({ ok: true, orderId, status: 'refunded', refundedNgn: amountNgn });
    }

    const status = typeof body.status === 'string' ? (body.status as OrderStatus) : null;
    const note = typeof body.note === 'string' && body.note.trim() ? body.note.trim() : null;
    const courierName = typeof body.courierName === 'string' ? body.courierName.trim() || null : undefined;
    const riderPhone = typeof body.riderPhone === 'string' ? body.riderPhone.trim() || null : undefined;
    const trackingNote = typeof body.trackingNote === 'string' ? body.trackingNote.trim() || null : undefined;
    const etaAt =
      typeof body.etaAt === 'string' && body.etaAt.trim()
        ? new Date(body.etaAt).toISOString()
        : body.etaAt === null
          ? null
          : undefined;

    if (!status || !ADMIN_SETTABLE_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Unknown or unsettable status.' }, { status: 400 });
    }

    const [order] = await sql`
      UPDATE ritual_orders
      SET
        status = ${status},
        courier_name = COALESCE(${courierName}, courier_name),
        rider_phone = COALESCE(${riderPhone}, rider_phone),
        tracking_note = COALESCE(${trackingNote}, tracking_note),
        eta_at = CASE WHEN ${etaAt === undefined} THEN eta_at ELSE ${etaAt}::timestamptz END,
        updated_at = NOW()
      WHERE id = ${orderId}
      RETURNING id, status
    `;

    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

    if (status === 'delivered' || status === 'fulfilled') {
      await fulfillOrderStock(orderId);
    } else if (status === 'cancelled' || status === 'refunded') {
      await releaseOrderResources(orderId);
    }

    await notifyOrderStatus(orderId, status, note);

    return NextResponse.json({ ok: true, orderId: order.id, status: order.status });
  } catch (err) {
    captureApiError(err, { route: 'admin/orders PATCH' });
    const { status, error } = apiErrorResponse(err, 'Unable to update order.');
    return NextResponse.json({ error }, { status });
  }
}
