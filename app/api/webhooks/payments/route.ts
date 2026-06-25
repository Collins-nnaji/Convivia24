import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { fulfillOrder } from '@/lib/tickets/checkout';

/**
 * Payment provider webhooks (Paystack, Stripe, etc.)
 * Verify signatures in provider-specific handlers before fulfilling orders.
 */
export async function POST(req: NextRequest) {
  try {
    const provider = req.nextUrl.searchParams.get('provider') || 'unknown';
    const raw = await req.text();
    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      payload = { raw };
    }

    await sql`
      INSERT INTO payment_events (provider, event_type, provider_ref, payload, processed)
      VALUES (${provider}, ${String(payload.event || payload.type || 'webhook')}, ${String(payload.reference || payload.id || '')}, ${JSON.stringify(payload)}, false)
    `;

    // TODO: verify Paystack/Stripe signature, map to order reference, call fulfillOrder

    return NextResponse.json({ received: true, provider });
  } catch (err) {
    console.error('[POST /api/webhooks/payments]', err);
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }
}

/** Dev / manual confirmation — only when live provider is not configured */
export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get('reference');
  const secret = process.env.CONVIVIA_WEBHOOK_DEV_SECRET;
  const token = req.nextUrl.searchParams.get('token');

  if (!reference || !secret || token !== secret) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const orderRows = await sql`SELECT id, status FROM orders WHERE reference = ${reference} LIMIT 1`;
  const order = orderRows[0];
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  if (order.status === 'paid') {
    return NextResponse.json({ reference, status: 'paid', message: 'Already fulfilled.' });
  }

  const tickets = await fulfillOrder(String(order.id), {
    paymentProvider: 'manual',
    paymentReference: 'dev_confirm',
  });

  return NextResponse.json({ reference, status: 'paid', tickets });
}
