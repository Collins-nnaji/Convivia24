import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

/**
 * GET /api/paystack/callback?reference=xxx
 * Paystack redirects here after payment. Verifies the transaction server-side,
 * flips the user to Black if charge succeeded, then redirects back to app.
 */
export async function GET(req: NextRequest) {
  const appBase = process.env.NEXT_PUBLIC_APP_URL || 'https://app.convivia24.com';
  const reference = req.nextUrl.searchParams.get('reference');

  if (!reference) {
    return NextResponse.redirect(`${appBase}/?paystack=missing_ref`);
  }

  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecret) {
    return NextResponse.redirect(`${appBase}/?paystack=not_configured`);
  }

  try {
    // Verify with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${paystackSecret}` },
    });
    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data?.status !== 'success') {
      return NextResponse.redirect(`${appBase}/?paystack=failed`);
    }

    const txData = verifyData.data;
    const userId: string | undefined = txData.metadata?.user_id;
    const amountNgn = Math.round((txData.amount ?? 0) / 100);

    if (!userId) {
      // Fallback: use session user
      const { user: authUser } = await neonAuth();
      if (!authUser) return NextResponse.redirect(`${appBase}/?paystack=no_user`);
      const user = await getOrCreateUser(authUser);

      await applyBlack(String(user.id), amountNgn, reference);
      return NextResponse.redirect(`${appBase}/?paystack=success`);
    }

    await applyBlack(userId, amountNgn, reference);
    return NextResponse.redirect(`${appBase}/?paystack=success`);
  } catch (err) {
    console.error('Paystack callback error:', err);
    return NextResponse.redirect(`${appBase}/?paystack=error`);
  }
}

async function applyBlack(userId: string, amountNgn: number, reference: string) {
  // Idempotent
  const existing = await sql`
    SELECT id FROM subscription_events WHERE payment_ref = ${reference} LIMIT 1
  `;
  if (existing.length > 0) return;

  await sql`
    UPDATE users SET
      tier                   = 'black',
      subscription_status    = 'black',
      premium_until          = NOW() + INTERVAL '31 days',
      match_credits_remaining = 9999
    WHERE id = ${userId}::uuid
  `;

  await sql`
    INSERT INTO subscription_events
      (user_id, event_type, tier_from, tier_to, amount_ngn, payment_ref)
    VALUES
      (${userId}::uuid, 'subscribed', 'standard', 'black', ${amountNgn}, ${reference})
  `;
}
