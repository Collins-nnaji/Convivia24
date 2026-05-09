import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import sql from '@/lib/db';

/**
 * POST /api/paystack/webhook
 * Receives Paystack events. On charge.success, flips the user to Black tier.
 *
 * Set PAYSTACK_WEBHOOK_SECRET in Netlify to the secret shown in Paystack dashboard
 * (Settings → Webhooks → your endpoint → Webhook secret).
 */
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;
  const rawBody = await req.text();

  // Verify signature
  if (webhookSecret) {
    const signature = req.headers.get('x-paystack-signature') ?? '';
    const expected = crypto
      .createHmac('sha512', webhookSecret)
      .update(rawBody)
      .digest('hex');
    if (signature !== expected) {
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
    }
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Bad JSON.' }, { status: 400 });
  }

  if (event.event === 'charge.success') {
    const data = event.data ?? {};
    const userId: string | undefined = data.metadata?.user_id;
    const reference: string = data.reference ?? '';
    const amountKobo: number = data.amount ?? 0;
    const amountNgn = Math.round(amountKobo / 100);

    if (!userId) {
      console.warn('Paystack webhook: charge.success missing user_id in metadata', reference);
      return NextResponse.json({ ok: true });
    }

    try {
      // Idempotency: skip if this reference was already applied
      const existing = await sql`
        SELECT id FROM subscription_events WHERE payment_ref = ${reference} LIMIT 1
      `;
      if (existing.length > 0) {
        return NextResponse.json({ ok: true, duplicate: true });
      }

      const updated = await sql`
        UPDATE users SET
          tier                   = 'black',
          subscription_status    = 'black',
          premium_until          = NOW() + INTERVAL '31 days',
          match_credits_remaining = 9999
        WHERE id = ${userId}::uuid
        RETURNING tier, subscription_status
      `;

      if (updated.length === 0) {
        console.warn('Paystack webhook: user not found', userId, reference);
        return NextResponse.json({ ok: true });
      }

      await sql`
        INSERT INTO subscription_events
          (user_id, event_type, tier_from, tier_to, amount_ngn, payment_ref)
        VALUES
          (${userId}::uuid, 'subscribed', 'standard', 'black', ${amountNgn}, ${reference})
      `;

      console.log(`Paystack webhook: user ${userId} upgraded to Black (ref ${reference})`);
    } catch (err) {
      console.error('Paystack webhook DB error:', err);
      // Return 200 so Paystack doesn't retry — log the error for manual recovery
      return NextResponse.json({ ok: true, error: 'db_error' });
    }
  }

  return NextResponse.json({ ok: true });
}
