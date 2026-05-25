import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

export async function GET() {
  const { user: authUser } = await neonAuth();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await getOrCreateUser(authUser);

  const campaigns = await sql`
    SELECT c.*,
      (SELECT COUNT(*) FROM guest_passes gp WHERE gp.campaign_id = c.id) AS total_guests,
      (SELECT COUNT(*) FROM guest_passes gp WHERE gp.campaign_id = c.id AND gp.voucher_redeemed = true) AS redeemed_count,
      (SELECT COUNT(*) FROM campaign_photos cp WHERE cp.campaign_id = c.id AND cp.approved = true) AS photo_count
    FROM brand_campaigns c
    WHERE c.owner_id = ${user.id}
    ORDER BY c.created_at DESC
  `;

  return NextResponse.json({ campaigns });
}

export async function POST(req: NextRequest) {
  const { user: authUser } = await neonAuth();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await getOrCreateUser(authUser);

  const body = await req.json().catch(() => ({}));
  const { name, brand_name, city, event_date, headline, subheadline, venue_name,
    primary_color, secondary_color, bg_color, text_color,
    guestlist_enabled, voucher_enabled, voucher_label, voucher_limit,
    voucher_valid_from, voucher_valid_to, start_time, end_time,
    photowall_enabled, lineup_text, menu_text } = body;

  if (!name?.trim() || !brand_name?.trim()) {
    return NextResponse.json({ error: 'name and brand_name are required.' }, { status: 400 });
  }

  const slug = `${brand_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}-${Date.now().toString(36)}`;
  const photowall_slug = `pw-${slug.slice(0, 20)}-${Math.random().toString(36).slice(2, 7)}`;

  const [campaign] = await sql`
    INSERT INTO brand_campaigns (
      owner_id, name, brand_name, slug,
      primary_color, secondary_color, bg_color, text_color,
      headline, subheadline, venue_name, city, event_date,
      start_time, end_time,
      guestlist_enabled, voucher_enabled, voucher_label, voucher_limit,
      voucher_valid_from, voucher_valid_to, voucher_per_phone,
      photowall_enabled, photowall_slug, lineup_text, menu_text
    ) VALUES (
      ${user.id}, ${name.trim()}, ${brand_name.trim()}, ${slug},
      ${primary_color || '#c0975a'}, ${secondary_color || '#1a1714'},
      ${bg_color || '#0d0c0a'}, ${text_color || '#faf6ee'},
      ${headline || null}, ${subheadline || null},
      ${venue_name || null}, ${city || 'Lagos'}, ${event_date || null},
      ${start_time || null}, ${end_time || null},
      ${guestlist_enabled !== false}, ${voucher_enabled === true},
      ${voucher_label || 'Free Welcome Drink'}, ${voucher_limit || 500},
      ${voucher_valid_from || null}, ${voucher_valid_to || null}, 1,
      ${photowall_enabled !== false}, ${photowall_slug},
      ${lineup_text || null}, ${menu_text || null}
    )
    RETURNING *
  `;

  return NextResponse.json({ campaign }, { status: 201 });
}
