import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

/**
 * POST /api/subscribe
 *   { plan: 'black' | 'black_trial', payment_ref?, amount_ngn? }
 *
 * Flips the user to Convivia Black.
 *   - 'black_trial' = 14-day free trial, payment_ref optional
 *   - 'black'       = paid (placeholder until Stripe wiring; for now writes the event + flips tier)
 *
 * POST /api/subscribe with { plan: 'cancel' } downgrades back to free.
 *
 * Returns the updated user.
 */

const BLACK_MONTHLY_NGN = 30_000;

export async function POST(req: NextRequest) {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Sign in to subscribe.' }, { status: 401 });
    const user = await getOrCreateUser(authUser);

    const body = await req.json();
    const { plan, payment_ref, amount_ngn } = body;

    if (!plan || !['black', 'black_trial', 'cancel'].includes(plan)) {
      return NextResponse.json({ error: 'plan must be black, black_trial, or cancel.' }, { status: 400 });
    }

    if (plan === 'cancel') {
      const updated = await sql`
        UPDATE users SET
          tier = 'standard',
          subscription_status = 'cancelled',
          premium_until = NOW()
        WHERE id = ${user.id}
        RETURNING *
      `;
      await sql`
        INSERT INTO subscription_events (user_id, event_type, tier_from, tier_to)
        VALUES (${user.id}, 'cancelled', ${user.tier}, 'standard')
      `;
      return NextResponse.json({ ok: true, user: updated[0] });
    }

    const isTrial = plan === 'black_trial';
    const days = isTrial ? 14 : 30;
    const status = isTrial ? 'black_trial' : 'black';

    const updated = await sql`
      UPDATE users SET
        tier = 'black',
        subscription_status = ${status},
        premium_until = NOW() + (${days} || ' days')::interval,
        match_credits_remaining = 9999
      WHERE id = ${user.id}
      RETURNING *
    `;

    await sql`
      INSERT INTO subscription_events (
        user_id, event_type, tier_from, tier_to, amount_ngn, payment_ref
      ) VALUES (
        ${user.id},
        ${isTrial ? 'trial_started' : 'subscribed'},
        ${user.tier},
        'black',
        ${isTrial ? 0 : (Number(amount_ngn) || BLACK_MONTHLY_NGN)},
        ${payment_ref || (isTrial ? 'trial' : 'manual')}
      )
    `;

    return NextResponse.json({
      ok: true,
      user: updated[0],
      message: isTrial ? "You're on a 14-day Black trial. Unlimited matches active." : 'Welcome to Convivia Black.',
    });
  } catch (err) {
    console.error('Error subscribing:', err);
    return NextResponse.json({ error: 'Subscription failed. Try again.' }, { status: 500 });
  }
}
