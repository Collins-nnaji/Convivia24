import { reconcilePayment } from '@/lib/payments/reconcile';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { recordOrderEvent } from '@/lib/commerce/timeline';
import { notifyOrderStatus } from '@/lib/commerce/notify';
import { approveReferralForOrder } from '@/lib/referrals/repo';
import {
  flutterwavePaid,
  flutterwaveSecret,
  flutterwaveWebhookHash,
  verifyFlutterwavePayment,
} from '@/lib/payments/flutterwave';

function hashesMatch(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

/** Flutterwave webhook — marks ritual orders paid. */
export async function POST(req: NextRequest) {
  try {
    if (!flutterwaveSecret()) {
      return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    }

    const raw = await req.text();
    const expectedHash = flutterwaveWebhookHash();
    const incomingHash = req.headers.get('verif-hash') || '';
    if (!expectedHash) return NextResponse.json({ error: 'Webhook authentication is not configured' }, { status: 503 });
    if (!hashesMatch(incomingHash, expectedHash)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(raw) as {
      event?: string;
      data?: {
        id?: number;
        tx_ref?: string;
        status?: string;
        amount?: number;
        meta?: { order_id?: string };
      };
    };

    const data = event.data;
    const status = String(data?.status || '').toLowerCase();
    const completed =
      event.event === 'charge.completed' || !event.event;
    if (!completed || (status !== 'successful' && status !== 'completed') || !data) {
      return NextResponse.json({ received: true });
    }

    const txRef = data.tx_ref || null;
    const transactionId = data.id != null ? String(data.id) : null;
    const verified = await verifyFlutterwavePayment({ txRef, transactionId });
    const orderId = verified?.meta?.order_id;
    const reference = verified?.tx_ref;

    let chargedNgn: number | null = null;
    let expectedReference = '';
    if (orderId) {
      const [order] = await sql`
        SELECT total_ngn, subtotal_ngn, payment_ref FROM ritual_orders WHERE id = ${orderId} LIMIT 1
      `;
      if (order) { chargedNgn = Number(order.total_ngn ?? order.subtotal_ngn); expectedReference = String(order.payment_ref || ''); }
    } else if (reference) {
      const [order] = await sql`
        SELECT total_ngn, subtotal_ngn, payment_ref FROM ritual_orders WHERE payment_ref = ${reference} LIMIT 1
      `;
      if (order) { chargedNgn = Number(order.total_ngn ?? order.subtotal_ngn); expectedReference = String(order.payment_ref || ''); }
    }

    if (chargedNgn == null || !flutterwavePaid(verified, chargedNgn, expectedReference)) {
      return NextResponse.json({ received: true });
    }

    let matchedId = orderId;
    if (!matchedId && reference) { const [order] = await sql`SELECT id FROM ritual_orders WHERE payment_ref = ${reference} AND payment_provider = 'flutterwave'`; matchedId = order?.id as string | undefined; }
    if (matchedId) await reconcilePayment(matchedId, verified);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('flutterwave webhook', err);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
