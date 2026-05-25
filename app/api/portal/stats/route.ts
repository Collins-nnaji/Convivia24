import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

// GET /api/portal/stats — aggregate stats across all of a brand manager's campaigns
export async function GET() {
  const { user: authUser } = await neonAuth();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await getOrCreateUser(authUser);

  const [totals] = await sql`
    SELECT
      COUNT(DISTINCT c.id) AS total_campaigns,
      COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'active') AS active_campaigns,
      COALESCE(SUM(gp.cnt), 0) AS total_guests,
      COALESCE(SUM(gp.redeemed), 0) AS total_redemptions,
      COALESCE(SUM(cp.cnt), 0) AS total_photos
    FROM brand_campaigns c
    LEFT JOIN (
      SELECT campaign_id, COUNT(*) AS cnt, COUNT(*) FILTER (WHERE voucher_redeemed = true) AS redeemed
      FROM guest_passes GROUP BY campaign_id
    ) gp ON gp.campaign_id = c.id
    LEFT JOIN (
      SELECT campaign_id, COUNT(*) AS cnt FROM campaign_photos WHERE approved = true GROUP BY campaign_id
    ) cp ON cp.campaign_id = c.id
    WHERE c.owner_id = ${user.id}
  `;

  // Recent activity — last 20 check-ins across all campaigns
  const activity = await sql`
    SELECT gp.name, gp.checked_in_at, gp.voucher_redeemed_at, gp.created_at,
           c.brand_name, c.venue_name, c.primary_color
    FROM guest_passes gp
    JOIN brand_campaigns c ON c.id = gp.campaign_id
    WHERE c.owner_id = ${user.id}
      AND (gp.checked_in = true OR gp.voucher_redeemed = true)
    ORDER BY GREATEST(
      COALESCE(gp.checked_in_at, '1970-01-01'),
      COALESCE(gp.voucher_redeemed_at, '1970-01-01'),
      gp.created_at
    ) DESC
    LIMIT 20
  `;

  return NextResponse.json({ totals, activity });
}
