import { withAudit } from '@/lib/audit/route';
import { AGE_GATE_COOKIE, verifyAgeToken } from '@/lib/age-gate';
import { createHash, randomUUID } from 'crypto';
import { notifyOrderStatus } from '@/lib/commerce/notify';
import { NextRequest, NextResponse } from 'next/server';
import sql, { apiErrorResponse } from '@/lib/db';
import { preferTrackForCategory } from '@/lib/drinks/catalog';
import { getCurrentUser } from '@/lib/auth/session';
import { claimMember, loyaltyDiscountNgn, resolveMemberOwner } from '@/lib/loyalty/members';
import { rateLimit, clientIp } from '@/lib/redis';
import { resolveSellableProduct, getInventory } from '@/lib/inventory';
import { routeOrder } from '@/lib/suppliers/stock';
import { expandPackLines } from '@/lib/packages/lines';
import { readReferralCookie } from '@/lib/referrals/cookie';
import { attributeOrder } from '@/lib/referrals/repo';
import { catalogMinOrderQty } from '@/lib/commerce/minimum-order';
import { findSellable } from '@/lib/catalog/sellable';

type IncomingItem = {
  slug: string;
  qty: number;
};

async function handleGET() {
  try {
    const user = await getCurrentUser();
    if (!user?.email) {
      return NextResponse.json({ orders: [], authRequired: true }, { status: 401 });
    }

    const email = user.email.trim().toLowerCase();
    const orders = await sql`
      SELECT
        o.id,
        o.status,
        o.subtotal_ngn,
        o.loyalty_discount_ngn,
        o.gift_card_discount_ngn,
        o.total_ngn,
        o.address_line1,
        o.area,
        o.courier_name,
        o.rider_phone,
        o.eta_at,
        o.tracking_note,
        o.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'slug', i.kit_slug,
              'name', i.kit_name,
              'qty', i.qty,
              'unitPriceNgn', i.unit_price_ngn
            )
            ORDER BY i.created_at
          ) FILTER (WHERE i.id IS NOT NULL),
          '[]'::json
        ) AS items
      FROM ritual_orders o
      LEFT JOIN ritual_order_items i ON i.order_id = o.id
      WHERE LOWER(o.email) = ${email}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 50
    `;

    return NextResponse.json({
      orders: orders.map((o) => ({
        id: o.id,
        status: o.status,
        subtotalNgn: o.subtotal_ngn,
        loyaltyDiscountNgn: Number(o.loyalty_discount_ngn ?? 0),
        giftCardDiscountNgn: Number(o.gift_card_discount_ngn ?? 0),
        totalNgn: Number(o.total_ngn ?? o.subtotal_ngn),
        addressLine1: o.address_line1,
        area: o.area,
        courierName: o.courier_name,
        riderPhone: o.rider_phone,
        etaAt: o.eta_at,
        trackingNote: o.tracking_note,
        createdAt: o.created_at,
        items: o.items,
      })),
    });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Unable to load orders.');
    return NextResponse.json({ error, orders: [] }, { status });
  }
}

async function handlePOST(req: NextRequest) {
  try {
    if (!await verifyAgeToken(req.cookies.get(AGE_GATE_COOKIE)?.value)) return NextResponse.json({ error: 'Confirm you are 18+ before ordering.' }, { status: 403 });
    const rl = await rateLimit(`orders:create:${clientIp(req)}`, 10, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });

    /**
     * Ordering requires an account.
     *
     * Tracking (`GET /api/orders/[id]`) matches an order to the signed-in buyer by email, so a
     * guest checkout produced an order nobody could ever open. The email is taken from the
     * session rather than the request body — a typo'd address would orphan the order the same way.
     */
    const user = await getCurrentUser();
    if (!user?.email) {
      return NextResponse.json(
        { error: 'Please sign in to place your order — that is how you track it.', authRequired: true },
        { status: 401 }
      );
    }
    const email = user.email.trim().toLowerCase();

    const body = await req.json();
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const deliveryMode = body.deliveryMode === 'venue' ? 'venue' : 'address';
    const venueName = typeof body.venueName === 'string' ? body.venueName.trim() : '';
    const addressLine1 =
      deliveryMode === 'venue'
        ? venueName || (typeof body.addressLine1 === 'string' ? body.addressLine1.trim() : '')
        : typeof body.addressLine1 === 'string'
          ? body.addressLine1.trim()
          : '';
    const addressLine2 = typeof body.addressLine2 === 'string' ? body.addressLine2.trim() : null;
    const city = typeof body.city === 'string' ? body.city.trim() : '';
    const area = typeof body.area === 'string' ? body.area.trim() : null;
    const notesRaw = typeof body.notes === 'string' ? body.notes.trim() : '';
    const eventId = typeof body.eventId === 'string' ? body.eventId.trim() : '';
    const notesParts = [
      deliveryMode === 'venue' ? `Delivery: venue — ${venueName || addressLine1}` : 'Delivery: address',
      eventId ? `Event: ${eventId}` : '',
      notesRaw,
    ].filter(Boolean);
    const notes = notesParts.join(' · ') || null;
    const incoming = Array.isArray(body.items) ? body.items : [];
    if (incoming.length > 100 || incoming.some((item: IncomingItem) => !item || typeof item.slug !== 'string' || !Number.isInteger(item.qty) || item.qty < 1 || item.qty > 24)) {
      return NextResponse.json({ error: 'Each product needs a whole quantity between 1 and 24.' }, { status: 400 });
    }
    const grouped = new Map<string, number>();
    for (const item of incoming as IncomingItem[]) grouped.set(item.slug, (grouped.get(item.slug) || 0) + item.qty);
    const items = [...grouped].map(([slug, qty]) => ({ slug, qty }));
    if (items.some((item) => item.qty > 24)) return NextResponse.json({ error: 'Maximum quantity is 24 per product.' }, { status: 400 });
    const giftCardCode = typeof body.giftCardCode === 'string' ? body.giftCardCode.trim() : '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }
    if (!fullName) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
    }
    if (!phone || phone.length < 8) {
      return NextResponse.json({ error: 'A phone number is required for delivery.' }, { status: 400 });
    }
    if (!city) {
      return NextResponse.json({ error: 'City is required for delivery in Lagos, Abuja, and Port Harcourt.' }, { status: 400 });
    }
    if (!addressLine1) {
      return NextResponse.json(
        { error: deliveryMode === 'venue' ? 'Venue / lounge name is required.' : 'Delivery address is required.' },
        { status: 400 }
      );
    }
    const zoneId = typeof body.deliveryZoneId === 'string' ? body.deliveryZoneId : '';
    if (!/^[0-9a-f-]{36}$/i.test(zoneId)) return NextResponse.json({ error: 'Choose a supported delivery zone.' }, { status: 400 });
    const [zone] = await sql`SELECT id, city, fee_ngn FROM delivery_zones WHERE id = ${zoneId}::uuid AND active`;
    if (!zone || String(zone.city).toLowerCase() !== city.toLowerCase()) return NextResponse.json({ error: 'Delivery is not available for this city and zone.' }, { status: 400 });
    const deliveryFeeNgn = Number(zone.fee_ngn);

    // Authoritative check — inventory min_order_qty wins over the catalog default.
    if (items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
    }
    for (const item of items) {
      const qty = Math.max(0, Math.floor(Number(item.qty) || 0));
      const inv = await getInventory(item.slug).catch(() => null);
      const min = Math.max(
        1,
        Math.min(24, Math.floor(Number(inv?.min_order_qty ?? catalogMinOrderQty(item.slug)) || 1))
      );
      if (qty < min) {
        const name = findSellable(item.slug)?.name || item.slug;
        return NextResponse.json(
          {
            error: `${name}: minimum order is ${min}. You have ${qty} — add ${min - qty} more.`,
            slug: item.slug,
            minOrderQty: min,
            qty,
          },
          { status: 400 }
        );
      }
    }

    const resolved: {
      slug: string;
      name: string;
      preferTrack: string;
      unitPrice: number;
      qty: number;
    }[] = [];

    for (const item of items) {
      const product = await resolveSellableProduct(item.slug);
      if (!product) {
        return NextResponse.json({ error: `Unknown product: ${item.slug}` }, { status: 400 });
      }
      const qty = Math.max(1, Math.min(24, Number(item.qty) || 1));
      resolved.push({
        slug: product.slug,
        name: product.name,
        preferTrack: preferTrackForCategory(product.category),
        unitPrice: product.priceNgn,
        qty,
      });
    }

    const subtotal = resolved.reduce((n, r) => n + r.unitPrice * r.qty, 0);

    // Tier discount comes from the server's own points record, never the client.
    const loyaltyOwnerId = await resolveMemberOwner();
    const member = loyaltyOwnerId
      ? await claimMember(loyaltyOwnerId, { email, name: fullName })
      : null;
    const discount = loyaltyDiscountNgn(subtotal, member);

    const requestKey = req.headers.get('idempotency-key') || '';
    if (!/^[0-9a-f-]{36}$/i.test(requestKey)) return NextResponse.json({ error: 'A checkout request key is required.' }, { status: 400 });
    const expectedTotalNgn = body.expectedTotalNgn;
    if (!Number.isSafeInteger(expectedTotalNgn) || expectedTotalNgn < 0) return NextResponse.json({ error: 'Review the checkout total first.' }, { status: 400 });
    const fingerprint = createHash('sha256').update(JSON.stringify({ fullName, phone, addressLine1, addressLine2, city, area, notes, items, giftCardCode, zoneId, expectedTotalNgn })).digest('hex');
    const stockLines = expandPackLines(resolved.map((r) => ({ slug: r.slug, qty: r.qty })));
    const [order] = await sql`SELECT * FROM c24_create_order(
      ${randomUUID()}::uuid, ${email}, ${requestKey}::uuid, ${fingerprint},
      ${JSON.stringify({ fullName, phone, addressLine1, addressLine2, city, area, notes, deliveryZoneId: zoneId, expectedTotalNgn })}::jsonb,
      ${JSON.stringify(resolved)}::jsonb, ${JSON.stringify(stockLines)}::jsonb,
      ${discount.ngn}::integer, ${member ? loyaltyOwnerId : null}, ${giftCardCode}
    )`;
    const orderId = String(order.id);
    const finalTotal = Number(order.total_ngn);
    const giftCardAppliedNgn = Number(order.gift_card_discount_ngn || 0);
    const refCode = await readReferralCookie();
    if (refCode) await attributeOrder(orderId, refCode);
    try {
      const decision = await routeOrder(city, stockLines);
      if (decision && !decision.outOfCity) {
        await sql`SELECT c24_assign_supplier(${orderId}::uuid, ${decision.supplierId}::uuid)`;
        await sql`UPDATE ritual_orders SET routed_cost_ngn = ${decision.expectedCostNgn} WHERE id = ${orderId}`;
      }
    } catch (err) { console.error('Order needs staff sourcing', err); }
    if (order.status === 'paid') await notifyOrderStatus(orderId, 'paid');

    return NextResponse.json({
      ok: true,
      orderId,
      subtotalNgn: subtotal,
      loyaltyDiscountPct: discount.pct,
      loyaltyDiscountNgn: discount.ngn,
      giftCardAppliedNgn,
      totalNgn: finalTotal,
      deliveryFeeNgn,
      status: order.status,
    });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Unable to place order. Please try again.');
    return NextResponse.json({ error }, { status });
  }
}

async function handlePATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.email) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }
    const email = user.email.trim().toLowerCase();

    const body = await req.json();
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required.' }, { status: 400 });
    }

    const [order] = await sql`SELECT id, status FROM ritual_orders WHERE id = ${orderId}::uuid AND LOWER(email) = ${email} AND status IN ('pending', 'awaiting_payment')`;
    if (!order) return NextResponse.json({ error: 'Order not found or cannot be cancelled.' }, { status: 404 });
    const [result] = await sql`SELECT c24_transition_order(${orderId}::uuid, ${order.status}, 'cancelled', '{}'::jsonb, 'Cancelled by customer') AS changed`;
    if (!result.changed) return NextResponse.json({ error: 'Order changed; refresh before cancelling.' }, { status: 409 });
    order.status = 'cancelled';

    return NextResponse.json({ ok: true, orderId: order.id, status: order.status });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Unable to cancel order.');
    return NextResponse.json({ error }, { status });
  }
}

export const GET = withAudit('/api/orders', handleGET);
export const POST = withAudit('/api/orders', handlePOST);
export const PATCH = withAudit('/api/orders', handlePATCH);
