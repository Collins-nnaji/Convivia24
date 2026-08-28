import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { apiErrorResponse } from '@/lib/db';
import { captureApiError } from '@/lib/sentry';
import {
  attachOwner,
  getPartnerByEmail,
  getPartnerByOwner,
  partnerEarnings,
} from '@/lib/referrals/repo';

/** The signed-in partner's own code, link and earnings. */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ authRequired: true }, { status: 401 });
    }

    // Applications are made before signing in, so the first visit links the row by email.
    let partner = await getPartnerByOwner(user.id);
    if (!partner && user.email) {
      const byEmail = await getPartnerByEmail(user.email);
      if (byEmail && !byEmail.ownerId) {
        await attachOwner(byEmail.id, user.id);
        partner = { ...byEmail, ownerId: user.id };
      }
    }

    if (!partner) return NextResponse.json({ partner: null });

    const earnings = await partnerEarnings(partner);
    return NextResponse.json(earnings);
  } catch (err) {
    captureApiError(err, { route: 'referrals/me GET' });
    const { status, error } = apiErrorResponse(err, 'Unable to load your referral standing.');
    return NextResponse.json({ error }, { status });
  }
}
