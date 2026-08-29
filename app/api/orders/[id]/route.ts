import { NextRequest, NextResponse } from 'next/server';
import sql, { apiErrorResponse } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { buildTrackingSteps, listOrderEvents } from '@/lib/commerce/timeline';
import type { OrderStatus } from '@/lib/commerce/status';
import { captureApiError } from '@/lib/sentry';

/** One order, with its tracking timeline. Scoped to the signed-in buyer's email. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const user = await getCurrentUser();
    if (!user?.email) return NextResponse.json({ error: 'Sign in to track this order.' }, { status: 401 });

    const rows = await sql`
      SELECT
        o.id, o.status, o.subtotal_ngn, o.loyalty_discount_ngn, o.gift_card_discount_ngn,
        o.total_ngn, o.loyalty_points_awarded, o.full_name, o.phone,
        o.address_line1, o.address_line2, o.city, o.area, o.notes,
        o.courier_name, o.rider_phone, o.eta_at, o.tracking_note, o.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'slug', i.kit_slug, 'name', i.kit_name, 'qty', i.qty, 'unitPriceNgn', i.unit_price_ngn
            ) ORDER BY i.created_at
          ) FILTER (WHERE i.id IS NOT NULL),
          '[]'::json
        ) AS items
      FROM ritual_orders o
      LEFT JOIN ritual_order_items i ON i.order_id = o.id
      WHERE o.id = ${id}::uuid AND LOWER(o.email) = ${user.email.trim().toLowerCase()}
      GROUP BY o.id
      LIMIT 1
    `;

    const o = rows[0];
    // Same answer for "not yours" and "does not exist" — an order id should not
    // be a way to learn whose it is.
    if (!o) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

    const createdAt = new Date(o.created_at as string).toISOString();
    const events = await listOrderEvents(id).catch(() => []);

    return NextResponse.json({
      order: {
        id: String(o.id),
        status: String(o.status) as OrderStatus,
        subtotalNgn: Number(o.subtotal_ngn ?? 0),
        loyaltyDiscountNgn: Number(o.loyalty_discount_ngn ?? 0),
        giftCardDiscountNgn: Number(o.gift_card_discount_ngn ?? 0),
        totalNgn: Number(o.total_ngn ?? o.subtotal_ngn ?? 0),
        pointsAwarded: Number(o.loyalty_points_awarded ?? 0),
        fullName: String(o.full_name || ''),
        phone: (o.phone as string) || null,
        addressLine1: String(o.address_line1 || ''),
        addressLine2: (o.address_line2 as string) || null,
        city: String(o.city || ''),
        area: (o.area as string) || null,
        notes: (o.notes as string) || null,
        courierName: (o.courier_name as string) || null,
        riderPhone: (o.rider_phone as string) || null,
        etaAt: o.eta_at ? new Date(o.eta_at as string).toISOString() : null,
        trackingNote: (o.tracking_note as string) || null,
        createdAt,
        items: o.items,
      },
      steps: buildTrackingSteps(String(o.status) as OrderStatus, events, createdAt),
    });
  } catch (err) {
    captureApiError(err, { route: 'orders/[id] GET' });
    const { status, error } = apiErrorResponse(err, 'Could not load that order.');
    return NextResponse.json({ error }, { status });
  }
}
