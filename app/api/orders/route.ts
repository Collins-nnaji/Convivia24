import { NextRequest, NextResponse } from 'next/server';
import sql, { apiErrorResponse } from '@/lib/db';
import { getRitualBySlug } from '@/lib/rituals/catalog';

type IncomingItem = {
  slug: string;
  qty: number;
  preferTrack?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const addressLine1 = typeof body.addressLine1 === 'string' ? body.addressLine1.trim() : '';
    const addressLine2 = typeof body.addressLine2 === 'string' ? body.addressLine2.trim() : null;
    const area = typeof body.area === 'string' ? body.area.trim() : null;
    const notes = typeof body.notes === 'string' ? body.notes.trim() : null;
    const items = Array.isArray(body.items) ? (body.items as IncomingItem[]) : [];

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }
    if (!fullName) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
    }
    if (!phone || phone.length < 8) {
      return NextResponse.json({ error: 'A phone number is required for Lagos delivery.' }, { status: 400 });
    }
    if (!addressLine1) {
      return NextResponse.json({ error: 'Delivery address is required.' }, { status: 400 });
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
      const kit = getRitualBySlug(item.slug);
      if (!kit) {
        return NextResponse.json({ error: `Unknown ritual: ${item.slug}` }, { status: 400 });
      }
      const qty = Math.max(1, Math.min(12, Number(item.qty) || 1));
      const preferTrack =
        item.preferTrack === 'spirit' || item.preferTrack === 'zero' || item.preferTrack === 'mixed'
          ? item.preferTrack
          : kit.track;
      resolved.push({
        slug: kit.slug,
        name: kit.name,
        preferTrack,
        unitPrice: kit.priceNgn,
        qty,
      });
    }

    const subtotal = resolved.reduce((n, r) => n + r.unitPrice * r.qty, 0);

    const [order] = await sql`
      INSERT INTO ritual_orders (
        email, full_name, phone, address_line1, address_line2, city, area, notes, subtotal_ngn, status
      ) VALUES (
        ${email}, ${fullName}, ${phone}, ${addressLine1}, ${addressLine2},
        'Lagos', ${area}, ${notes}, ${subtotal}, 'pending'
      )
      RETURNING id, subtotal_ngn, status
    `;

    const orderId = order.id as string;

    for (const r of resolved) {
      await sql`
        INSERT INTO ritual_order_items (order_id, kit_slug, kit_name, prefer_track, unit_price_ngn, qty)
        VALUES (${orderId}, ${r.slug}, ${r.name}, ${r.preferTrack}, ${r.unitPrice}, ${r.qty})
      `;
    }

    return NextResponse.json({
      ok: true,
      orderId,
      subtotalNgn: subtotal,
      status: 'pending',
    });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Unable to place order. Please try again.');
    return NextResponse.json({ error }, { status });
  }
}

/** Cancel a pending/awaiting order (e.g. Paystack init failed). */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required.' }, { status: 400 });
    }

    const [order] = await sql`
      UPDATE ritual_orders
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = ${orderId} AND status IN ('pending', 'awaiting_payment')
      RETURNING id, status
    `;

    if (!order) {
      return NextResponse.json({ error: 'Order not found or cannot be cancelled.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, orderId: order.id, status: order.status });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Unable to cancel order.');
    return NextResponse.json({ error }, { status });
  }
}
