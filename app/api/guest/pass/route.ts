import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

/**
 * POST /api/guest/pass
 * Guest registers at a QR door — receives a signed pass token
 * Body: { campaign_slug, name, phone }
 *
 * GET /api/guest/pass?token=xxx
 * Retrieve a pass by token (for the pass screen)
 */

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { campaign_slug, name, phone } = body;

  if (!campaign_slug || !name?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: 'campaign_slug, name, and phone are required.' }, { status: 400 });
  }

  const [campaign] = await sql`
    SELECT id, status, max_capacity, voucher_enabled, voucher_limit,
           voucher_valid_from, voucher_valid_to, guestlist_enabled,
           primary_color, secondary_color, bg_color, text_color,
           logo_url, brand_name, headline, subheadline, venue_name,
           city, event_date, start_time, end_time, photowall_slug
    FROM brand_campaigns WHERE slug = ${campaign_slug}
  `;

  if (!campaign) return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 });
  if (campaign.status !== 'active') return NextResponse.json({ error: 'This campaign is not currently active.' }, { status: 409 });

  // Check capacity
  const [{ cnt }] = await sql`SELECT COUNT(*) AS cnt FROM guest_passes WHERE campaign_id = ${campaign.id as string}`;
  if (parseInt(cnt as string) >= (campaign.max_capacity as number)) {
    return NextResponse.json({ error: 'This event is at full capacity.' }, { status: 409 });
  }

  // Check duplicate phone for this campaign
  const [existing] = await sql`
    SELECT id, pass_token FROM guest_passes WHERE campaign_id = ${campaign.id as string} AND phone = ${phone.trim()}
  `;
  if (existing) {
    // Return existing pass rather than erroring
    return NextResponse.json({ pass: existing, campaign, already_registered: true });
  }

  const cleanPhone = phone.trim().replace(/\s+/g, '');
  const [pass] = await sql`
    INSERT INTO guest_passes (campaign_id, name, phone)
    VALUES (${campaign.id as string}, ${name.trim()}, ${cleanPhone})
    RETURNING *
  `;

  // Update campaign scan counter
  await sql`UPDATE brand_campaigns SET total_scans = total_scans + 1 WHERE id = ${campaign.id as string}`;

  return NextResponse.json({ pass, campaign }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'token is required.' }, { status: 400 });

  const [pass] = await sql`SELECT * FROM guest_passes WHERE pass_token = ${token}`;
  if (!pass) return NextResponse.json({ error: 'Pass not found.' }, { status: 404 });

  const [campaign] = await sql`
    SELECT id, brand_name, headline, subheadline, venue_name, city, event_date,
           start_time, end_time, primary_color, secondary_color, bg_color, text_color,
           logo_url, bg_image_url, voucher_enabled, voucher_label, voucher_limit,
           voucher_valid_from, voucher_valid_to, photowall_enabled, photowall_slug,
           lineup_text, menu_text, slug
    FROM brand_campaigns WHERE id = ${pass.campaign_id as string}
  `;

  return NextResponse.json({ pass, campaign });
}
