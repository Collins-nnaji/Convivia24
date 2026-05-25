import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

type Ctx = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { user: authUser } = await neonAuth();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await getOrCreateUser(authUser);

  const [campaign] = await sql`
    SELECT c.*,
      (SELECT COUNT(*) FROM guest_passes gp WHERE gp.campaign_id = c.id) AS total_guests,
      (SELECT COUNT(*) FROM guest_passes gp WHERE gp.campaign_id = c.id AND gp.voucher_redeemed = true) AS redeemed_count,
      (SELECT COUNT(*) FROM guest_passes gp WHERE gp.campaign_id = c.id AND gp.checked_in = true) AS checked_in_count,
      (SELECT COUNT(*) FROM campaign_photos cp WHERE cp.campaign_id = c.id AND cp.approved = true) AS photo_count
    FROM brand_campaigns c
    WHERE c.id = ${params.id} AND c.owner_id = ${user.id}
  `;

  if (!campaign) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const recentPasses = await sql`
    SELECT id, name, phone, checked_in, checked_in_at, voucher_redeemed, voucher_redeemed_at, created_at
    FROM guest_passes WHERE campaign_id = ${params.id}
    ORDER BY created_at DESC LIMIT 20
  `;

  const recentPhotos = await sql`
    SELECT id, url, thumbnail_url, uploader_name, created_at
    FROM campaign_photos WHERE campaign_id = ${params.id} AND approved = true
    ORDER BY created_at DESC LIMIT 12
  `;

  return NextResponse.json({ campaign, recent_passes: recentPasses, recent_photos: recentPhotos });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { user: authUser } = await neonAuth();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await getOrCreateUser(authUser);

  const [existing] = await sql`SELECT id FROM brand_campaigns WHERE id = ${params.id} AND owner_id = ${user.id}`;
  if (!existing) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const allowed = ['name','brand_name','headline','subheadline','venue_name','city','event_date',
    'start_time','end_time','primary_color','secondary_color','bg_color','text_color',
    'logo_url','bg_image_url','guestlist_enabled','voucher_enabled','voucher_label',
    'voucher_limit','voucher_valid_from','voucher_valid_to','photowall_enabled',
    'lineup_text','menu_text','status','max_capacity'];

  const updates: Record<string,unknown> = { updated_at: new Date().toISOString() };
  for (const k of allowed) if (body[k] !== undefined) updates[k] = body[k];

  const [updated] = await sql`
    UPDATE brand_campaigns SET
      name = COALESCE(${updates.name as string}, name),
      brand_name = COALESCE(${updates.brand_name as string}, brand_name),
      headline = COALESCE(${updates.headline as string}, headline),
      subheadline = COALESCE(${updates.subheadline as string}, subheadline),
      venue_name = COALESCE(${updates.venue_name as string}, venue_name),
      city = COALESCE(${updates.city as string}, city),
      event_date = COALESCE(${updates.event_date as string}, event_date),
      start_time = COALESCE(${updates.start_time as string}, start_time),
      end_time = COALESCE(${updates.end_time as string}, end_time),
      primary_color = COALESCE(${updates.primary_color as string}, primary_color),
      secondary_color = COALESCE(${updates.secondary_color as string}, secondary_color),
      bg_color = COALESCE(${updates.bg_color as string}, bg_color),
      text_color = COALESCE(${updates.text_color as string}, text_color),
      logo_url = COALESCE(${updates.logo_url as string}, logo_url),
      bg_image_url = COALESCE(${updates.bg_image_url as string}, bg_image_url),
      guestlist_enabled = COALESCE(${updates.guestlist_enabled as boolean}, guestlist_enabled),
      voucher_enabled = COALESCE(${updates.voucher_enabled as boolean}, voucher_enabled),
      voucher_label = COALESCE(${updates.voucher_label as string}, voucher_label),
      voucher_limit = COALESCE(${updates.voucher_limit as number}, voucher_limit),
      status = COALESCE(${updates.status as string}, status),
      lineup_text = COALESCE(${updates.lineup_text as string}, lineup_text),
      menu_text = COALESCE(${updates.menu_text as string}, menu_text),
      max_capacity = COALESCE(${updates.max_capacity as number}, max_capacity),
      updated_at = NOW()
    WHERE id = ${params.id}
    RETURNING *
  `;

  return NextResponse.json({ campaign: updated });
}
