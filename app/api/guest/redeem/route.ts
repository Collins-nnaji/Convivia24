import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

/**
 * POST /api/guest/redeem
 * Staff redeems a guest's voucher via the validator app
 * Body: { pass_token }
 *
 * Also used by validator app — no auth needed for scanning (staff uses shared URL)
 * but we log the staff_id if a session exists.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { pass_token } = body;
  if (!pass_token) return NextResponse.json({ error: 'pass_token is required.' }, { status: 400 });

  // Try to get staff user (optional)
  let staffId: string | null = null;
  try {
    const { user: authUser } = await neonAuth();
    if (authUser) {
      const u = await getOrCreateUser(authUser);
      staffId = u.id;
    }
  } catch { /* unauthenticated validator is fine */ }

  const [pass] = await sql`
    SELECT gp.*, c.voucher_enabled, c.voucher_valid_from, c.voucher_valid_to,
           c.primary_color, c.bg_color, c.text_color, c.brand_name, c.venue_name
    FROM guest_passes gp
    JOIN brand_campaigns c ON c.id = gp.campaign_id
    WHERE gp.pass_token = ${pass_token}
  `;

  if (!pass) return NextResponse.json({ valid: false, reason: 'INVALID', message: 'Pass not found.' }, { status: 200 });
  if (!pass.voucher_enabled) return NextResponse.json({ valid: false, reason: 'NO_VOUCHER', message: 'Vouchers not enabled for this campaign.' });
  if (pass.voucher_redeemed) return NextResponse.json({ valid: false, reason: 'ALREADY_REDEEMED', message: 'This voucher has already been redeemed.' }, { status: 200 });
  if (pass.status === 'revoked') return NextResponse.json({ valid: false, reason: 'REVOKED', message: 'This pass has been revoked.' }, { status: 200 });

  // Time window check
  const now = new Date();
  if (pass.voucher_valid_from) {
    const [h, m] = (pass.voucher_valid_from as string).split(':').map(Number);
    const validFrom = new Date(now); validFrom.setHours(h, m, 0, 0);
    if (now < validFrom) return NextResponse.json({ valid: false, reason: 'TOO_EARLY', message: `Vouchers are not valid until ${pass.voucher_valid_from}.` }, { status: 200 });
  }
  if (pass.voucher_valid_to) {
    const [h, m] = (pass.voucher_valid_to as string).split(':').map(Number);
    const validTo = new Date(now); validTo.setHours(h, m, 59, 999);
    if (now > validTo) return NextResponse.json({ valid: false, reason: 'EXPIRED', message: `Vouchers expired at ${pass.voucher_valid_to}.` }, { status: 200 });
  }

  // Mark redeemed
  await sql`
    UPDATE guest_passes
    SET voucher_redeemed = true, voucher_redeemed_at = NOW(),
        redeemed_by_staff_id = ${staffId}
    WHERE id = ${pass.id as string}
  `;
  await sql`UPDATE brand_campaigns SET total_redemptions = total_redemptions + 1 WHERE id = ${pass.campaign_id as string}`;

  return NextResponse.json({
    valid: true,
    reason: 'OK',
    message: 'Voucher validated. Issue drink.',
    guest_name: pass.name,
    brand_name: pass.brand_name,
    primary_color: pass.primary_color,
  });
}
