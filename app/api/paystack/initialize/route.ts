import { NextRequest, NextResponse } from 'next/server';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

const BLACK_MONTHLY_KOBO = 3_000_000; // ₦30,000 in kobo (Paystack uses kobo)

/**
 * POST /api/paystack/initialize
 * Creates a Paystack payment link for ₦30,000/month Black subscription.
 * Returns { authorization_url, reference } — redirect the user to authorization_url.
 */
export async function POST(req: NextRequest) {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return NextResponse.json({ error: 'Payment not configured.' }, { status: 503 });
    }

    const user = await getOrCreateUser(authUser);
    const email = authUser.email;
    if (!email) return NextResponse.json({ error: 'Account email required.' }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const callbackUrl =
      (body.callback_url as string | undefined) ||
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.convivia24.com'}/api/paystack/callback`;

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: BLACK_MONTHLY_KOBO,
        currency: 'NGN',
        metadata: {
          user_id: String(user.id),
          plan: 'black',
          custom_fields: [
            { display_name: 'Plan', variable_name: 'plan', value: 'Convivia Black · ₦30,000/month' },
          ],
        },
        callback_url: callbackUrl,
      }),
    });

    const data = await res.json();
    if (!data.status) {
      console.error('Paystack initialize error:', data);
      return NextResponse.json({ error: data.message || 'Payment init failed.' }, { status: 502 });
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (err) {
    console.error('Paystack initialize error:', err);
    return NextResponse.json({ error: 'Payment init failed.' }, { status: 500 });
  }
}
