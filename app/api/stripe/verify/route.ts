import { NextRequest, NextResponse } from 'next/server';
import sql, { apiErrorResponse } from '@/lib/db';
import { awardPoints, pointsFromSpend } from '@/lib/loyalty/members';

/**
 * Award loyalty points for a paid order, once. The column doubles as the guard
 * so a repeated verify callback cannot bank the same points twice.
 */
async function awardOrderPoints(order: Record<string, unknown>, chargedNgn: number) {
  const ownerId = (order.loyalty_owner_id as string) || '';
  if (!ownerId || Number(order.loyalty_points_awarded ?? 0) > 0) return;
  const points = pointsFromSpend(chargedNgn);
  if (points <= 0) return;
  try {
    const claimed = await sql`
      UPDATE ritual_orders SET loyalty_points_awarded = ${points}
      WHERE id = ${order.id as string} AND loyalty_points_awarded = 0
      RETURNING id
    `;
    if (claimed.length === 0) return;
    await awardPoints(ownerId, points);
  } catch {
    /* points are a bonus — never fail a verified payment over them */
  }
}

/** Verify Paystack payment (or confirm manual/awaiting status) for an order. */
export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get('orderId')?.trim() || '';
    const reference =
      req.nextUrl.searchParams.get('reference')?.trim() ||
      req.nextUrl.searchParams.get('trxref')?.trim() ||
      '';

    if (!orderId && !reference) {
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

    const secret = process.env.PAYSTACK_SECRET_KEY;
    const refToVerify = reference || (order.payment_ref as string | null);

    if (secret && refToVerify && order.payment_provider === 'paystack') {
      const verifyRes = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(refToVerify)}`,
        { headers: { Authorization: `Bearer ${secret}` } }
      );
      const verifyData = await verifyRes.json();
      // Compare against the amount the order was actually charged, which is
      // the loyalty-adjusted total when a tier discount applied.
      const chargedNgn = Number(order.total_ngn ?? order.subtotal_ngn);
      const paid =
        verifyRes.ok &&
        verifyData?.data?.status === 'success' &&
        Number(verifyData?.data?.amount) === chargedNgn * 100;

      if (paid) {
        await sql`
          UPDATE ritual_orders
          SET status = 'paid', payment_ref = ${refToVerify}, updated_at = NOW()
          WHERE id = ${order.id as string}
        `;
        await awardOrderPoints(order, chargedNgn);
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
        paystackStatus: verifyData?.data?.status || 'unknown',
      });
    }

    // Manual / concierge path — order is saved, payment pending confirmation
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
