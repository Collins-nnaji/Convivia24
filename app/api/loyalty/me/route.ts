import { NextRequest, NextResponse } from 'next/server';
import { claimMember, getMember, resolveMemberOwner, standingFor } from '@/lib/loyalty/members';
import { getCurrentUser } from '@/lib/auth/session';
import { apiErrorResponse, DatabaseUnavailableError } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

/** The signed-in shopper's loyalty standing — points, tier, discount. */
export async function GET() {
  const ownerId = await resolveMemberOwner();
  if (!ownerId) return NextResponse.json({ signedIn: false, standing: null });
  try {
    const member = await getMember(ownerId);
    return NextResponse.json({ signedIn: true, standing: standingFor(member) });
  } catch (err) {
    captureApiError(err, { route: 'loyalty/me GET' });
    return NextResponse.json({ signedIn: true, standing: null, degraded: true });
  }
}

/** Claim a card on this account. */
export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(`loyalty-claim:${clientIp(req)}`, 20, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const ownerId = await resolveMemberOwner();
    const user = await getCurrentUser();
    if (!ownerId || !user) {
      return NextResponse.json({ error: 'Sign in to claim your Guest Card.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const name = String(body.name || user.name || '').trim().slice(0, 80) || null;
    const member = await claimMember(ownerId, { email: user.email, name });
    return NextResponse.json({ signedIn: true, standing: standingFor(member) }, { status: 201 });
  } catch (err) {
    captureApiError(err, { route: 'loyalty/me POST' });
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'Card sign-up is paused right now. Try again shortly.' }, { status: 503 });
    }
    const { status, error } = apiErrorResponse(err, 'Could not claim your card.');
    return NextResponse.json({ error }, { status });
  }
}
