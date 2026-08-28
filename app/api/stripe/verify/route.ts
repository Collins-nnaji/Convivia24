import { NextRequest, NextResponse } from 'next/server';
import sql, { apiErrorResponse } from '@/lib/db';
import { awardOrderPoints } from '@/lib/loyalty/members';
import { approveReferralForOrder } from '@/lib/referrals/repo';
import { notifyOrderStatus } from '@/lib/commerce/notify';
import {
  flutterwavePaid,
  flutterwaveSecret,
  verifyFlutterwavePayment,
} from '@/lib/payments/flutterwave';

/** Verify Flutterwave payment (or confirm manual/awaiting status) for an order. */
export async function GET(req: NextRequest) {
  try {
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
          FROM ritual_orders WHERE id = ${orderId} LIMIT 1
        `
      : await sql`
          SELECT id, email, full_name, subtotal_ngn, total_ngn, loyalty_owner_id,
                 loyalty_points_awarded, status, payment_ref, payment_provider
          FROM ritual_orders WHERE payment_ref = ${reference} LIMIT 1
        `;

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (order.status === 'paid' || order.status === 'fulfilled') {
      return NextResponse.json({
        ok: true,
        orderId: order.id,
        status: order.status,
        subtotalNgn: order.subtotal_ngn,
        verified: true,
      });
    }

    if (order.status === 'cancelled') {
      return NextResponse.json({
        ok: true,
        orderId: order.id,
        status: 'cancelled',
        verified: false,
      });
    }

    const secret = flutterwaveSecret();
    const refToVerify = reference || (order.payment_ref as string | null);
    const provider = String(order.payment_provider || '');

    if (secret && (refToVerify || transactionId) && (provider === 'flutterwave' || provider === 'paystack')) {
      const verifyData = await verifyFlutterwavePayment({
        txRef: refToVerify,
        transactionId,
      });
      const chargedNgn = Number(order.total_ngn ?? order.subtotal_ngn);
      const paid = flutterwavePaid(verifyData, chargedNgn);

      if (paid) {
        const storedRef = verifyData?.tx_ref || refToVerify;
        const [flipped] = await sql`
          UPDATE ritual_orders
          SET status = 'paid', payment_provider = 'flutterwave', payment_ref = ${storedRef}, updated_at = NOW()
          WHERE id = ${order.id as string} AND status NOT IN ('paid', 'fulfilled')
          RETURNING id
        `;
        await awardOrderPoints(order.id as string);
        await approveReferralForOrder(order.id as string);
        if (flipped) {
          await notifyOrderStatus(order.id as string, 'paid');
        }
        return NextResponse.json({
          ok: true,
          orderId: order.id,
          status: 'paid',
          subtotalNgn: order.subtotal_ngn,
          totalNgn: chargedNgn,
          verified: true,
        });
      }

      return NextResponse.json({
        ok: true,
        orderId: order.id,
        status: order.status,
        subtotalNgn: order.subtotal_ngn,
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
        verified: order.payment_provider === 'manual',
        mode: order.payment_provider === 'manual' ? 'manual' : 'pending',
      });
    }

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      status: order.status,
      subtotalNgn: order.subtotal_ngn,
      verified: false,
    });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Unable to verify payment.');
    return NextResponse.json({ error }, { status });
  }
}
