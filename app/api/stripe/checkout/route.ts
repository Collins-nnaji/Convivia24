import { NextRequest, NextResponse } from 'next/server';
import sql, { apiErrorResponse } from '@/lib/db';

/**
 * Lagos-first checkout via Paystack.
 * If PAYSTACK_SECRET_KEY is unset, marks the order awaiting_payment and
 * returns a manual-confirm path (concierge will follow up).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required.' }, { status: 400 });
    }

    const [order] = await sql`
      SELECT id, email, full_name, subtotal_ngn, status, payment_ref
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

    const secret = process.env.PAYSTACK_SECRET_KEY;
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
          'Order saved. Our Lagos concierge will confirm payment and delivery shortly.',
        redirectUrl: `${origin}/checkout/success?order=${orderId}&mode=manual`,
      });
    }

    // Reuse existing Paystack reference when resuming the same order
    const amountKobo = Number(order.subtotal_ngn) * 100;
    const reference =
      (order.payment_ref as string) ||
      `convivia_${orderId.replace(/-/g, '').slice(0, 24)}_${Date.now().toString(36)}`;

    const initRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: order.email,
        amount: amountKobo,
        currency: 'NGN',
        reference,
        callback_url: `${origin}/checkout/success?order=${orderId}`,
        metadata: {
          order_id: orderId,
          full_name: order.full_name,
        },
      }),
    });

    const initData = await initRes.json();
    if (!initRes.ok || !initData?.data?.authorization_url) {
      console.error('Paystack init failed', initData);
      return NextResponse.json(
        { error: 'Payment provider unavailable. Please try again.' },
        { status: 502 }
      );
    }

    await sql`
      UPDATE ritual_orders
      SET
        status = 'awaiting_payment',
        payment_provider = 'paystack',
        payment_ref = ${initData.data.reference},
        updated_at = NOW()
      WHERE id = ${orderId}
    `;

    return NextResponse.json({
      ok: true,
      mode: 'paystack',
      orderId,
      redirectUrl: initData.data.authorization_url as string,
      reference: initData.data.reference as string,
    });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Checkout failed.');
    return NextResponse.json({ error }, { status });
  }
}
