import { NextRequest, NextResponse } from 'next/server';
import sql, { apiErrorResponse } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { claimMember, getMember, reconcileOrderPoints, resolveMemberOwner } from '@/lib/loyalty/members';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

/**
 * POST { orderId } — attach a guest order to the signed-in account so its points count.
 * Only an order placed with this account's email, and not yet owned by anyone, can be claimed.
 * Claiming also enrols the account in the Guest Card if it isn't already.
 */
export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(`claim-order:${clientIp(req)}`, 20, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    const user = await getCurrentUser();
    const ownerId = await resolveMemberOwner();
    if (!user?.email || !ownerId) return NextResponse.json({ error: 'Sign in to claim this order.' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
    if (!orderId) return NextResponse.json({ error: 'orderId is required.' }, { status: 400 });

    if (!(await getMember(ownerId))) await claimMember(ownerId, { email: user.email, name: user.name || null });

    const rows = await sql`
      UPDATE ritual_orders SET loyalty_owner_id = ${ownerId}
      WHERE id = ${orderId}::uuid AND loyalty_owner_id IS NULL AND LOWER(email) = ${user.email.trim().toLowerCase()}
        AND status NOT IN ('pending', 'awaiting_payment', 'cancelled', 'refunded')
      RETURNING id
    `;
    if (rows.length === 0) return NextResponse.json({ error: 'This order cannot be claimed on this account.' }, { status: 409 });
    await reconcileOrderPoints(orderId);
    const [o] = await sql`SELECT loyalty_points_awarded, status FROM ritual_orders WHERE id = ${orderId}::uuid`;
    return NextResponse.json({ ok: true, pointsAwarded: Number(o?.loyalty_points_awarded ?? 0), status: o?.status });
  } catch (err) {
    captureApiError(err, { route: 'loyalty/claim-order' });
    const { status, error } = apiErrorResponse(err, 'Could not claim this order.');
    return NextResponse.json({ error }, { status });
  }
}
