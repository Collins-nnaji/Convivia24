import { reconcilePayment } from '@/lib/payments/reconcile';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import sql, { apiErrorResponse } from '@/lib/db';
import { approveReferralForOrder } from '@/lib/referrals/repo';
import { notifyOrderStatus } from '@/lib/commerce/notify';
import { recordOrderEvent } from '@/lib/commerce/timeline';
import {
  flutterwavePaid,
  flutterwaveSecret,
  verifyFlutterwavePayment,
} from '@/lib/payments/flutterwave';

/** Verify Flutterwave payment (or confirm manual/awaiting status) for an order. */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in to verify your order.' }, { status: 401 });
    const orderId = req.nextUrl.searchParams.get('orderId')?.trim() || '';
    const reference =
      req.nextUrl.searchParams.get('reference')?.trim() ||
      req.nextUrl.searchParams.get('tx_ref')?.trim() ||
      req.nextUrl.searchParams.get('trxref')?.trim() ||
      '';
    const transactionId = req.nextUrl.searchParams.get('transaction_id')?.trim() || '';

    if (!orderId && !reference && !transactionId) {
      return NextResponse.json({ error: 'orderId or reference is required.' }, { status: 400 });
    }

    const [order] = orderId
      ? await sql`
          SELECT id, email, full_name, subtotal_ngn, total_ngn, loyalty_owner_id,
                 loyalty_points_awarded, status, payment_ref, payment_provider
          FROM ritual_orders WHERE id = ${orderId} AND LOWER(email) = ${user.email.trim().toLowerCase()} LIMIT 1
        `
      : await sql`
          SELECT id, email, full_name, subtotal_ngn, total_ngn, loyalty_owner_id,
                 loyalty_points_awarded, status, payment_ref, payment_provider
          FROM ritual_orders WHERE payment_ref = ${reference} AND LOWER(email) = ${user.email.trim().toLowerCase()} LIMIT 1
        `;

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (['paid', 'processing', 'packed', 'out_for_delivery', 'delivered', 'fulfilled'].includes(String(order.status))) {
      return NextResponse.json({
        ok: true,
        orderId: order.id,
        status: order.status,
        subtotalNgn: order.subtotal_ngn,
        totalNgn: Number(order.total_ngn ?? order.subtotal_ngn),
        verified: true,
      });
    }

    if (['cancelled', 'refunded'].includes(String(order.status))) {
      return NextResponse.json({
        ok: true,
        orderId: order.id,
        status: order.status,
        verified: false,
      });
    }

    const secret = flutterwaveSecret();
    const refToVerify = order.payment_ref as string | null;
    const provider = String(order.payment_provider || '');

    if (secret && (refToVerify || transactionId) && (provider === 'flutterwave' || provider === 'paystack')) {
      const verifyData = await verifyFlutterwavePayment({
        txRef: refToVerify,
        transactionId,
      });
      const chargedNgn = Number(order.total_ngn ?? order.subtotal_ngn);
      const paid = flutterwavePaid(verifyData, chargedNgn, String(order.payment_ref || ''));

      if (paid) {
        const reconciled = await reconcilePayment(String(order.id), verifyData);
        return NextResponse.json({
          ok: true,
          orderId: order.id,
          status: reconciled?.status || order.status,
          subtotalNgn: order.subtotal_ngn,
          totalNgn: chargedNgn,
          verified: reconciled?.verified === true,
        });
      }

      return NextResponse.json({
        ok: true,
        orderId: order.id,
        status: order.status,
        subtotalNgn: order.subtotal_ngn,
        totalNgn: Number(order.total_ngn ?? order.subtotal_ngn),
        verified: false,
        flutterwaveStatus: verifyData?.status || 'unknown',
      });
    }

    if (order.payment_provider === 'manual' || order.status === 'awaiting_payment' || order.status === 'pending') {
      return NextResponse.json({
        ok: true,
        orderId: order.id,
        status: order.status,
        subtotalNgn: order.subtotal_ngn,
        totalNgn: Number(order.total_ngn ?? order.subtotal_ngn),
        verified: false,
        mode: order.payment_provider === 'manual' ? 'manual' : 'pending',
      });
    }

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      status: order.status,
      subtotalNgn: order.subtotal_ngn,
        totalNgn: Number(order.total_ngn ?? order.subtotal_ngn),
      verified: false,
    });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Unable to verify payment.');
    return NextResponse.json({ error }, { status });
  }
}
