import { NextRequest, NextResponse } from 'next/server';
import sql, { apiErrorResponse } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { flutterwaveSecret, initializeFlutterwavePayment } from '@/lib/payments/flutterwave';

/**
 * Lagos-first checkout via Flutterwave.
 * If FLUTTERWAVE_SECRET_KEY is unset, marks the order awaiting_payment and
 * returns a manual-confirm path (concierge will follow up).
 */
export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(`checkout:${clientIp(req)}`, 15, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });

    const body = await req.json();
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required.' }, { status: 400 });
    }

    const [order] = await sql`
      SELECT id, email, full_name, phone, subtotal_ngn, total_ngn, status, payment_ref
      FROM ritual_orders
      WHERE id = ${orderId}
      LIMIT 1
    `;

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (order.status === 'paid' || order.status === 'fulfilled') {
      return NextResponse.json({ ok: true, alreadyPaid: true, orderId });
    }

    if (order.status === 'cancelled') {
      return NextResponse.json({ error: 'This order was cancelled. Please checkout again.' }, { status: 400 });
    }

    const secret = flutterwaveSecret();
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get('origin') ||
      'http://localhost:3000';

    if (!secret) {
      await sql`
        UPDATE ritual_orders
        SET status = 'awaiting_payment', payment_provider = 'manual', updated_at = NOW()
        WHERE id = ${orderId}
      `;
      return NextResponse.json({
        ok: true,
        mode: 'manual',
        orderId,
        message:
          'Order saved. Our team will confirm payment and delivery shortly.',
        redirectUrl: `${origin}/checkout/success?order=${orderId}&mode=manual`,
      });
    }

    const chargeableNgn = Number(order.total_ngn ?? order.subtotal_ngn);
    const txRef =
      (order.payment_ref as string) ||
      `convivia_${orderId.replace(/-/g, '').slice(0, 24)}_${Date.now().toString(36)}`;

    const init = await initializeFlutterwavePayment({
      txRef,
      amountNgn: chargeableNgn,
      email: String(order.email),
      name: String(order.full_name),
      phone: order.phone ? String(order.phone) : null,
      redirectUrl: `${origin}/checkout/success?order=${orderId}`,
      orderId,
    });

    if ('error' in init) {
      return NextResponse.json({ error: init.error }, { status: 502 });
    }

    await sql`
      UPDATE ritual_orders
      SET
        status = 'awaiting_payment',
        payment_provider = 'flutterwave',
        payment_ref = ${init.txRef},
        updated_at = NOW()
      WHERE id = ${orderId}
    `;

    return NextResponse.json({
      ok: true,
      mode: 'flutterwave',
      orderId,
      redirectUrl: init.link,
      reference: init.txRef,
    });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Checkout failed.');
    return NextResponse.json({ error }, { status });
  }
}
