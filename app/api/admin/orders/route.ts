import { NextRequest, NextResponse } from 'next/server';
import sql, { apiErrorResponse } from '@/lib/db';
import { requireAdmin } from '@/lib/admin';
import { ORDER_STATUSES, ORDER_STATUS_LABELS, canTransition, type OrderStatus } from '@/lib/commerce/status';
import { recordOrderEvent } from '@/lib/commerce/timeline';
import { notifyOrderStatus } from '@/lib/commerce/notify';
import { formatNgn } from '@/lib/drinks/catalog';
import { releaseOrderResources } from '@/lib/commerce/fulfillment';
import { applyOrderStatus, applyOrderTracking, readTrackingPatch } from '@/lib/commerce/transitions';
import { rateLimit, clientIp } from '@/lib/redis';
import { refundFlutterwave } from '@/lib/payments/flutterwave';
import { captureApiError } from '@/lib/sentry';
import { orderMargin } from '@/lib/suppliers/margin';
import { getSupplier } from '@/lib/suppliers/repo';
import { reconcileOrderPoints } from '@/lib/loyalty/members';
import { DRINKS } from '@/lib/drinks/catalog';

/** Statuses the desk can hand-set. System-only statuses (pending, awaiting_payment) are excluded. */
const ADMIN_SETTABLE_STATUSES: OrderStatus[] = ORDER_STATUSES.filter(
  (s) => s !== 'pending' && s !== 'awaiting_payment'
);

/**
 * GET ?from=&to=&status=&q=&limit=&offset= — the ledger, filtered and paged on the server so
 * "all time" and the CSV are actually complete.
 */
export async function GET(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const url = new URL(req.url);
    const fromRaw = url.searchParams.get('from');
    const toRaw = url.searchParams.get('to');
    const from = fromRaw && !Number.isNaN(Date.parse(fromRaw)) ? new Date(fromRaw).toISOString() : null;
    const to = toRaw && !Number.isNaN(Date.parse(toRaw)) ? new Date(toRaw).toISOString() : null;
    const statusFilter = url.searchParams.get('status') || null;
    const status = statusFilter && (ORDER_STATUSES as readonly string[]).includes(statusFilter) ? statusFilter : null;
    const q = (url.searchParams.get('q') || '').trim().toLowerCase() || null;
    const like = q ? `%${q}%` : null;
    const limit = Math.min(500, Math.max(1, Number(url.searchParams.get('limit')) || 100));
    const offset = Math.max(0, Number(url.searchParams.get('offset')) || 0);

    const [{ total }] = await sql`
      SELECT COUNT(*)::int AS total FROM ritual_orders o
      WHERE o.status != 'pending'
        AND (${from}::timestamptz IS NULL OR o.created_at >= ${from}::timestamptz)
        AND (${to}::timestamptz IS NULL OR o.created_at < ${to}::timestamptz)
        AND (${status}::text IS NULL OR o.status = ${status})
        AND (${like}::text IS NULL OR LOWER(o.full_name) LIKE ${like} OR LOWER(o.email) LIKE ${like}
             OR COALESCE(o.phone, '') LIKE ${like} OR o.id::text LIKE ${like} OR LOWER(COALESCE(o.area, '')) LIKE ${like})
    `;

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
        o.city,
        o.notes,
        o.courier_name,
        o.rider_phone,
        o.eta_at,
        o.tracking_note,
        o.payment_provider,
        o.payment_ref,
        o.refund_ref,
        o.refunded_ngn,
        o.routed_supplier_id,
        o.routed_out_of_city,
        rs.name AS routed_supplier_name,
        o.supplier_id,
        o.supplier_cost_ngn,
        o.sourced_at,
        o.sourcing_note,
        s.name AS supplier_name,
        o.created_at,
        o.updated_at,
        COALESCE(
          json_agg(
            json_build_object('slug', i.kit_slug, 'name', i.kit_name, 'qty', i.qty, 'unitPriceNgn', i.unit_price_ngn, 'imageUrl', inv.image_url)
            ORDER BY i.created_at
          ) FILTER (WHERE i.id IS NOT NULL),
          '[]'::json
        ) AS items
      FROM ritual_orders o
      LEFT JOIN ritual_order_items i ON i.order_id = o.id
      LEFT JOIN inventory inv ON inv.slug = i.kit_slug
      LEFT JOIN suppliers s ON s.id = o.supplier_id
      LEFT JOIN suppliers rs ON rs.id = o.routed_supplier_id
      WHERE o.status != 'pending'
        AND (${from}::timestamptz IS NULL OR o.created_at >= ${from}::timestamptz)
        AND (${to}::timestamptz IS NULL OR o.created_at < ${to}::timestamptz)
        AND (${status}::text IS NULL OR o.status = ${status})
        AND (${like}::text IS NULL OR LOWER(o.full_name) LIKE ${like} OR LOWER(o.email) LIKE ${like}
             OR COALESCE(o.phone, '') LIKE ${like} OR o.id::text LIKE ${like} OR LOWER(COALESCE(o.area, '')) LIKE ${like})
      GROUP BY o.id, s.name, rs.name
      ORDER BY o.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Most bottles carry their shot in the static catalog, not the inventory row.
    const catalogImage = (slug: string) => {
      const d = DRINKS.find((x) => x.slug === slug);
      return d?.image || d?.packImages?.[0] || null;
    };
    type Line = { slug?: string; name: string; qty: number; unitPriceNgn: number; imageUrl?: string | null };
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
        city: o.city,
        notes: o.notes,
        courierName: o.courier_name,
        riderPhone: o.rider_phone,
        etaAt: o.eta_at,
        trackingNote: o.tracking_note,
        paymentProvider: o.payment_provider,
        paymentRef: o.payment_ref,
        refundRef: o.refund_ref,
        routedSupplierName: (o.routed_supplier_name as string) || null,
        routedOutOfCity: o.routed_out_of_city === true,
        refundedNgn: Number(o.refunded_ngn ?? 0),
        supplierId: o.supplier_id,
        supplierName: o.supplier_name,
        supplierCostNgn: o.supplier_cost_ngn == null ? null : Number(o.supplier_cost_ngn),
        sourcedAt: o.sourced_at,
        sourcingNote: o.sourcing_note,
        margin: orderMargin({
          totalNgn: Number(o.total_ngn ?? o.subtotal_ngn),
          supplierCostNgn: o.supplier_cost_ngn == null ? null : Number(o.supplier_cost_ngn),
          refundedNgn: Number(o.refunded_ngn ?? 0),
        }),
        createdAt: o.created_at,
        updatedAt: o.updated_at,
        items: ((o.items as Line[]) || []).map((l) => ({ ...l, imageUrl: l.imageUrl || (l.slug ? catalogImage(l.slug) : null) })),
      })),
      statuses: ADMIN_SETTABLE_STATUSES,
      total: Number(total ?? 0),
      limit,
      offset,
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
        SELECT id, status, total_ngn, subtotal_ngn, payment_provider, payment_ref, refunded_ngn
        FROM ritual_orders WHERE id = ${orderId} LIMIT 1
      `;
      if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
      if (!canTransition(order.status as OrderStatus, 'refunded')) {
        return NextResponse.json(
          { error: `A ${ORDER_STATUS_LABELS[order.status as OrderStatus].toLowerCase()} order cannot be refunded.` },
          { status: 400 }
        );
      }
      const alreadyNgn = Number(order.refunded_ngn ?? 0);
      const remainingNgn = Math.max(0, Number(order.total_ngn ?? order.subtotal_ngn) - alreadyNgn);
      const requested = body.amountNgn == null || body.amountNgn === '' ? remainingNgn : Math.round(Number(body.amountNgn));
      if (!Number.isFinite(requested) || requested <= 0) {
        return NextResponse.json({ error: 'Refund amount must be more than zero.' }, { status: 400 });
      }
      if (requested > remainingNgn) {
        return NextResponse.json({ error: `Only ${formatNgn(remainingNgn)} is left to refund on this order.` }, { status: 400 });
      }
      const amountNgn = requested;
      const partial = amountNgn < remainingNgn;
      let refundRef = 'manual';
      if (
        (order.payment_provider === 'flutterwave' || order.payment_provider === 'paystack') &&
        order.payment_ref
      ) {
        const result = await refundFlutterwave(order.payment_ref as string, amountNgn);
        if ('error' in result) return NextResponse.json({ error: result.error }, { status: 502 });
        refundRef = result.refundRef;
      }
      const totalRefunded = alreadyNgn + amountNgn;
      if (partial) {
        // Money back for part of the order (a broken bottle, a missing mixer) — the order itself
        // carries on: status, stock and points are untouched, only the refunded total moves.
        await sql`
          UPDATE ritual_orders
          SET refund_ref = ${refundRef}, refunded_ngn = ${totalRefunded}, updated_at = NOW()
          WHERE id = ${orderId}
        `;
        const note = `Partial refund of ${formatNgn(amountNgn)}${typeof body.reason === 'string' && body.reason.trim() ? ` — ${body.reason.trim().slice(0, 200)}` : ''}.`;
        await recordOrderEvent(orderId, order.status as OrderStatus, note).catch(() => {});
        await notifyOrderStatus(orderId, order.status as OrderStatus, note);
        return NextResponse.json({ ok: true, orderId, status: order.status, refundedNgn: totalRefunded, partial: true });
      }
      await sql`
        UPDATE ritual_orders
        SET status = 'refunded', refund_ref = ${refundRef}, refunded_ngn = ${totalRefunded}, updated_at = NOW()
        WHERE id = ${orderId}
      `;
      await releaseOrderResources(orderId);
      await reconcileOrderPoints(orderId);
      // Stamp the transition like every other status change, so the customer's tracking page
      // shows the refund instead of stopping at the last delivery step.
      await recordOrderEvent(orderId, 'refunded', `Refunded ${formatNgn(amountNgn)}.`).catch(() => {});
      await notifyOrderStatus(orderId, 'refunded', `Refunded ${formatNgn(amountNgn)}.`);
      return NextResponse.json({ ok: true, orderId, status: 'refunded', refundedNgn: totalRefunded });
    }

    // Delivery details change without touching status — a typo in the address should not
    // require cancelling a paid order. Closed orders are left as they were delivered.
    if (body.action === 'edit') {
      const [current] = await sql`SELECT status FROM ritual_orders WHERE id = ${orderId} LIMIT 1`;
      if (!current) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
      if (['delivered', 'fulfilled', 'cancelled', 'refunded'].includes(String(current.status))) {
        return NextResponse.json({ error: 'A closed order cannot be edited.' }, { status: 409 });
      }
      const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined);
      const fullName = str(body.fullName, 120);
      const addressLine1 = str(body.addressLine1);
      if (fullName === '' || addressLine1 === '') {
        return NextResponse.json({ error: 'Name and address line 1 are required.' }, { status: 400 });
      }
      const [updated] = await sql`
        UPDATE ritual_orders SET
          full_name = COALESCE(${fullName ?? null}, full_name),
          phone = COALESCE(${str(body.phone, 40) ?? null}, phone),
          address_line1 = COALESCE(${addressLine1 ?? null}, address_line1),
          address_line2 = CASE WHEN ${body.addressLine2 === undefined} THEN address_line2 ELSE ${str(body.addressLine2) || null} END,
          area = CASE WHEN ${body.area === undefined} THEN area ELSE ${str(body.area, 80) || null} END,
          city = COALESCE(${str(body.city, 80) ?? null}, city),
          notes = CASE WHEN ${body.notes === undefined} THEN notes ELSE ${str(body.notes, 500) || null} END,
          updated_at = NOW()
        WHERE id = ${orderId}
        RETURNING full_name, phone, address_line1, address_line2, area, city, notes
      `;
      await recordOrderEvent(orderId, current.status as OrderStatus, 'Delivery details updated by the desk.').catch(() => {});
      return NextResponse.json({
        ok: true,
        orderId,
        fullName: updated.full_name,
        phone: updated.phone,
        addressLine1: updated.address_line1,
        addressLine2: updated.address_line2,
        area: updated.area,
        city: updated.city,
        notes: updated.notes,
      });
    }

    // Sourcing is its own action — it records who filled the order and what they charged, and
    // never touches order status. Assigning a supplier is not a promise the order has shipped.
    if (body.action === 'source') {
      const supplierId = typeof body.supplierId === 'string' ? body.supplierId.trim() : '';
      const clearing = supplierId === '';

      const rawCost = body.supplierCostNgn;
      let supplierCostNgn: number | null = null;
      if (!clearing) {
        if (rawCost === null || rawCost === undefined || rawCost === '') {
          return NextResponse.json({ error: 'Enter what the supplier charged.' }, { status: 400 });
        }
        const cost = Number(rawCost);
        if (!Number.isFinite(cost) || cost < 0) {
          return NextResponse.json({ error: 'Supplier cost must be zero or more.' }, { status: 400 });
        }
        supplierCostNgn = Math.round(cost);

        const supplier = await getSupplier(supplierId);
        if (!supplier) return NextResponse.json({ error: 'Supplier not found.' }, { status: 404 });
        if (!supplier.active) {
          return NextResponse.json({ error: 'That supplier is not active.' }, { status: 400 });
        }
      }

      const sourcingNote =
        typeof body.sourcingNote === 'string' ? body.sourcingNote.trim().slice(0, 500) || null : null;

      const [sourced] = await sql`
        UPDATE ritual_orders
        SET
          supplier_id = ${clearing ? null : supplierId}::uuid,
          supplier_cost_ngn = ${supplierCostNgn},
          sourcing_note = ${sourcingNote},
          sourced_at = ${clearing ? null : new Date().toISOString()}::timestamptz,
          updated_at = NOW()
        WHERE id = ${orderId}
        RETURNING id, total_ngn, subtotal_ngn, refunded_ngn, supplier_id, supplier_cost_ngn, sourced_at
      `;
      if (!sourced) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

      return NextResponse.json({
        ok: true,
        orderId: sourced.id,
        supplierId: sourced.supplier_id,
        supplierCostNgn:
          sourced.supplier_cost_ngn == null ? null : Number(sourced.supplier_cost_ngn),
        sourcedAt: sourced.sourced_at,
        margin: orderMargin({
          totalNgn: Number(sourced.total_ngn ?? sourced.subtotal_ngn),
          supplierCostNgn:
            sourced.supplier_cost_ngn == null ? null : Number(sourced.supplier_cost_ngn),
          refundedNgn: Number(sourced.refunded_ngn ?? 0),
        }),
      });
    }

    const tracking = readTrackingPatch(body);

    // Tracking is its own action — rider, ETA and note change without touching status, so
    // editing a phone number never re-sends the customer their "out for delivery" message.
    if (body.action === 'tracking') {
      const result = await applyOrderTracking(orderId, tracking, { kind: 'admin' });
      if (!result) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
      return NextResponse.json({ ok: true, ...result });
    }

    const status = typeof body.status === 'string' ? (body.status as OrderStatus) : null;
    if (!status || !ADMIN_SETTABLE_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Unknown or unsettable status.' }, { status: 400 });
    }
    const result = await applyOrderStatus(orderId, status, {
      note: typeof body.note === 'string' ? body.note : null,
      tracking,
      actor: { kind: 'admin' },
    });
    if (result.ok === false) return NextResponse.json({ error: result.error }, { status: result.httpStatus });
    return NextResponse.json({ ok: true, orderId: result.orderId, status: result.status });
  } catch (err) {
    captureApiError(err, { route: 'admin/orders PATCH' });
    const { status, error } = apiErrorResponse(err, 'Unable to update order.');
    return NextResponse.json({ error }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Order ID required.' }, { status: 400 });

    // Only a closed order can go. Cancelling or refunding is what releases stock, gift cards,
    // points and referral commission — deleting a live order would skip all of that and the
    // revenue would just vanish from the ledger.
    const [order] = await sql`SELECT status FROM ritual_orders WHERE id = ${id} LIMIT 1`;
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    if (order.status !== 'cancelled' && order.status !== 'refunded') {
      return NextResponse.json(
        { error: 'Cancel or refund the order first — only closed orders can be deleted.' },
        { status: 409 }
      );
    }

    // gift_cards.redeemed_order_id has no ON DELETE rule; everything else cascades or nulls.
    await sql`UPDATE gift_cards SET redeemed_order_id = NULL WHERE redeemed_order_id = ${id}`;
    await sql`DELETE FROM order_events WHERE order_id = ${id}`;
    await sql`DELETE FROM ritual_order_items WHERE order_id = ${id}`;
    await sql`DELETE FROM ritual_orders WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    captureApiError(err, { route: 'admin/orders DELETE' });
    const { status, error } = apiErrorResponse(err, 'Could not delete order.');
    return NextResponse.json({ error }, { status });
  }
}
