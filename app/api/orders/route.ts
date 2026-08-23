import { NextRequest, NextResponse } from 'next/server';
import sql, { apiErrorResponse } from '@/lib/db';
import { preferTrackForCategory } from '@/lib/drinks/catalog';
import { getCurrentUser } from '@/lib/auth/session';
import { getMember, loyaltyDiscountNgn, resolveMemberOwner } from '@/lib/loyalty/members';
import { notifyOrderReceived } from '@/lib/commerce/notify';
import { rateLimit, clientIp } from '@/lib/redis';
import { reserveStockForOrder, releaseStockForOrder, resolveSellableProduct } from '@/lib/inventory';
import { redeemGiftCardForOrder } from '@/lib/commerce/gift-cards';
import { releaseOrderResources } from '@/lib/commerce/fulfillment';

type IncomingItem = {
  slug: string;
  qty: number;
};

export async function GET() {
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

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(`orders:create:${clientIp(req)}`, 10, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });

    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
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
    const items = Array.isArray(body.items) ? (body.items as IncomingItem[]) : [];
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
      return NextResponse.json({ error: 'City is required for nationwide delivery.' }, { status: 400 });
    }
    if (!addressLine1) {
      return NextResponse.json(
        { error: deliveryMode === 'venue' ? 'Venue / lounge name is required.' : 'Delivery address is required.' },
        { status: 400 }
      );
    }
    if (items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
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
    const member = loyaltyOwnerId ? await getMember(loyaltyOwnerId) : null;
    const discount = loyaltyDiscountNgn(subtotal, member);
    const total = Math.max(0, subtotal - discount.ngn);

    const [order] = await sql`
      INSERT INTO ritual_orders (
        email, full_name, phone, address_line1, address_line2, city, area, notes,
        subtotal_ngn, loyalty_discount_ngn, total_ngn, loyalty_owner_id, status
      ) VALUES (
        ${email}, ${fullName}, ${phone}, ${addressLine1}, ${addressLine2},
        ${city}, ${area}, ${notes},
        ${subtotal}, ${discount.ngn}, ${total}, ${member ? loyaltyOwnerId : null}, 'pending'
      )
      RETURNING id, subtotal_ngn, status
    `;

    const orderId = order.id as string;

    try {
      for (const r of resolved) {
        await sql`
          INSERT INTO ritual_order_items (order_id, kit_slug, kit_name, prefer_track, unit_price_ngn, qty)
          VALUES (${orderId}, ${r.slug}, ${r.name}, ${r.preferTrack}, ${r.unitPrice}, ${r.qty})
        `;
      }
    } catch (err) {
      await sql`DELETE FROM ritual_orders WHERE id = ${orderId}`;
      throw err;
    }

    // Reserve stock before this order can be paid for — two shoppers can't
    // both walk away with the last bottle. Roll the whole order back if any
    // tracked line is out of stock, rather than silently overselling it.
    const stockLines = resolved.map((r) => ({ slug: r.slug, qty: r.qty }));
    const reservationError = await reserveStockForOrder(stockLines, orderId);
    if (reservationError) {
      await sql`DELETE FROM ritual_orders WHERE id = ${orderId}`;
      return NextResponse.json({ error: reservationError.error }, { status: 409 });
    }

    let finalTotal = total;
    let giftCardAppliedNgn = 0;
    if (giftCardCode) {
      const redemption = await redeemGiftCardForOrder(giftCardCode, orderId);
      if ('error' in redemption) {
        await releaseStockForOrder(stockLines, orderId);
        await sql`DELETE FROM ritual_orders WHERE id = ${orderId}`;
        return NextResponse.json({ error: redemption.error }, { status: 400 });
      }
      giftCardAppliedNgn = Math.min(redemption.valueNgn, finalTotal);
      finalTotal = Math.max(0, finalTotal - giftCardAppliedNgn);
      await sql`
        UPDATE ritual_orders
        SET total_ngn = ${finalTotal}, gift_card_discount_ngn = ${giftCardAppliedNgn}, gift_card_id = ${redemption.id}
        WHERE id = ${orderId}
      `;
    }

    await notifyOrderReceived(orderId);

    return NextResponse.json({
      ok: true,
      orderId,
      subtotalNgn: subtotal,
      loyaltyDiscountPct: discount.pct,
      loyaltyDiscountNgn: discount.ngn,
      giftCardAppliedNgn,
      totalNgn: finalTotal,
      status: 'pending',
    });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Unable to place order. Please try again.');
    return NextResponse.json({ error }, { status });
  }
}

export async function PATCH(req: NextRequest) {
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

    const [order] = await sql`
      UPDATE ritual_orders
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = ${orderId} AND LOWER(email) = ${email} AND status IN ('pending', 'awaiting_payment')
      RETURNING id, status
    `;

    if (!order) {
      return NextResponse.json({ error: 'Order not found or cannot be cancelled.' }, { status: 404 });
    }

    await releaseOrderResources(order.id as string);

    return NextResponse.json({ ok: true, orderId: order.id, status: order.status });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Unable to cancel order.');
    return NextResponse.json({ error }, { status });
  }
}
