import { NextRequest, NextResponse } from 'next/server';
import sql, { apiErrorResponse } from '@/lib/db';
import { getDrinkBySlug } from '@/lib/drinks/catalog';

type IncomingItem = {
  slug: string;
  qty: number;
};

export async function POST(req: NextRequest) {
  try {
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
    const area = typeof body.area === 'string' ? body.area.trim() : null;
    const notesRaw = typeof body.notes === 'string' ? body.notes.trim() : '';
    const crewId = typeof body.crewId === 'string' ? body.crewId.trim() : '';
    const notesParts = [
      deliveryMode === 'venue' ? `Delivery: venue — ${venueName || addressLine1}` : 'Delivery: address',
      crewId ? `Crew: ${crewId}` : '',
      notesRaw,
    ].filter(Boolean);
    const notes = notesParts.join(' · ') || null;
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
      const product = getDrinkBySlug(item.slug);
      if (!product) {
        return NextResponse.json({ error: `Unknown product: ${item.slug}` }, { status: 400 });
      }
      const qty = Math.max(1, Math.min(24, Number(item.qty) || 1));
      resolved.push({
        slug: product.slug,
        name: product.name,
        preferTrack: product.category,
        unitPrice: product.priceNgn,
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
