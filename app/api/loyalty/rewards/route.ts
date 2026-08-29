import { NextRequest, NextResponse } from 'next/server';
import { getReward } from '@/lib/loyalty/rewards';
import {
  InsufficientPointsError,
  listRedemptions,
  redeemReward,
  TierLockedError,
} from '@/lib/loyalty/redemptions';
import { getMember, resolveMemberOwner, standingFor } from '@/lib/loyalty/members';
import { apiErrorResponse, DatabaseUnavailableError } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

/** The member's standing plus what they have already redeemed. */
export async function GET() {
  const ownerId = await resolveMemberOwner().catch(() => null);
  if (!ownerId) return NextResponse.json({ signedIn: false, standing: null, redemptions: [] });

  try {
    const [member, redemptions] = await Promise.all([
      getMember(ownerId),
      listRedemptions(ownerId).catch(() => []),
    ]);
    return NextResponse.json({ signedIn: true, standing: standingFor(member), redemptions });
  } catch (err) {
    captureApiError(err, { route: 'loyalty/rewards GET' });
    return NextResponse.json({ signedIn: true, standing: null, redemptions: [], degraded: true });
  }
}

/** Spend points on one reward. */
export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(`reward-redeem:${clientIp(req)}`, 10, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const ownerId = await resolveMemberOwner();
    if (!ownerId) return NextResponse.json({ error: 'Sign in to redeem rewards.' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const reward = getReward(String(body.rewardId || ''));
    if (!reward) return NextResponse.json({ error: 'Unknown reward.' }, { status: 400 });

    const redemption = await redeemReward(ownerId, reward);
    const member = await getMember(ownerId);
    return NextResponse.json({ redemption, standing: standingFor(member) }, { status: 201 });
  } catch (err) {
    if (err instanceof InsufficientPointsError || err instanceof TierLockedError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'Redemptions are paused right now. Try again shortly.' }, { status: 503 });
    }
    captureApiError(err, { route: 'loyalty/rewards POST' });
    const { status, error } = apiErrorResponse(err, 'Could not redeem that reward.');
    return NextResponse.json({ error }, { status });
  }
}
