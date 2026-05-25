import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

/**
 * GET /api/validate/[code]
 * Staff validator app — look up a pass by token, return validation state
 * Does NOT redeem — use POST /api/guest/redeem for that
 */
export async function GET(_req: NextRequest, { params }: { params: { code: string } }) {
  const [pass] = await sql`
    SELECT gp.id, gp.name, gp.phone, gp.status, gp.voucher_redeemed,
           gp.voucher_redeemed_at, gp.checked_in, gp.checked_in_at, gp.pass_token,
           c.brand_name, c.voucher_enabled, c.voucher_label,
           c.primary_color, c.bg_color, c.text_color, c.venue_name
    FROM guest_passes gp
    JOIN brand_campaigns c ON c.id = gp.campaign_id
    WHERE gp.pass_token = ${params.code}
  `;

  if (!pass) {
    return NextResponse.json({ valid: false, reason: 'NOT_FOUND' });
  }
  if (pass.status === 'revoked') {
    return NextResponse.json({ valid: false, reason: 'REVOKED', guest_name: pass.name });
  }
  if (pass.voucher_redeemed) {
    return NextResponse.json({ valid: false, reason: 'ALREADY_REDEEMED', guest_name: pass.name, brand_name: pass.brand_name });
  }

  return NextResponse.json({
    valid: true, reason: 'OK',
    guest_name: pass.name,
    brand_name: pass.brand_name,
    voucher_enabled: pass.voucher_enabled,
    voucher_label: pass.voucher_label,
    primary_color: pass.primary_color,
    pass_token: pass.pass_token,
  });
}

/**
 * POST /api/validate/[code]
 * Check-in a guest at the door (without redeeming voucher)
 */
export async function POST(_req: NextRequest, { params }: { params: { code: string } }) {
  const [pass] = await sql`
    SELECT gp.id, gp.name, gp.checked_in, c.brand_name, c.primary_color, c.voucher_enabled
    FROM guest_passes gp
    JOIN brand_campaigns c ON c.id = gp.campaign_id
    WHERE gp.pass_token = ${params.code}
  `;

  if (!pass) return NextResponse.json({ valid: false, reason: 'NOT_FOUND' });

  if (!pass.checked_in) {
    await sql`UPDATE guest_passes SET checked_in = true, checked_in_at = NOW() WHERE id = ${pass.id as string}`;
  }

  return NextResponse.json({
    valid: true,
    already_checked_in: pass.checked_in,
    guest_name: pass.name,
    brand_name: pass.brand_name,
    primary_color: pass.primary_color,
    voucher_enabled: pass.voucher_enabled,
  });
}
