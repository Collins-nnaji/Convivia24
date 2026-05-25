import sql from '@/lib/db';
import { randomBytes } from 'crypto';

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

export interface BrandCampaign {
  id: string;
  owner_id: string;
  name: string;
  brand_name: string;
  slug: string;
  status: CampaignStatus;
  primary_color: string;
  logo_url: string | null;
  headline: string | null;
  subheadline: string | null;
  venue_name: string | null;
  city: string;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  guestlist_enabled: boolean;
  max_capacity: number;
  age_gate: boolean;
  voucher_enabled: boolean;
  voucher_label: string | null;
  voucher_limit: number | null;
  voucher_per_phone: number;
  photowall_enabled: boolean;
  lineup_text: string | null;
  menu_text: string | null;
  total_scans: number;
  total_checkins: number;
  total_redemptions: number;
  total_photos: number;
  created_at: Date | string;
  updated_at: Date | string;
}

export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return base || 'activation';
}

export function newPassToken(): string {
  return randomBytes(24).toString('hex');
}

export async function uniqueSlug(base: string): Promise<string> {
  let slug = slugify(base);
  let n = 0;
  for (;;) {
    const candidate = n === 0 ? slug : `${slug}-${n}`;
    const rows = await sql`SELECT 1 FROM brand_campaigns WHERE slug = ${candidate} LIMIT 1`;
    if (rows.length === 0) return candidate;
    n += 1;
  }
}

export async function listCampaignsForOwner(ownerId: string) {
  const rows = await sql`
    SELECT c.*,
      (SELECT COUNT(*)::int FROM campaign_guests g WHERE g.campaign_id = c.id) AS guest_count,
      (SELECT COUNT(*)::int FROM campaign_guests g WHERE g.campaign_id = c.id AND g.checked_in_at IS NOT NULL) AS checked_in_count
    FROM brand_campaigns c
    WHERE c.owner_id = ${ownerId}
    ORDER BY c.created_at DESC
  `;
  return rows;
}

export async function getCampaignById(id: string, ownerId?: string) {
  const rows = ownerId
    ? await sql`SELECT * FROM brand_campaigns WHERE id = ${id} AND owner_id = ${ownerId} LIMIT 1`
    : await sql`SELECT * FROM brand_campaigns WHERE id = ${id} LIMIT 1`;
  return rows[0] as unknown as BrandCampaign | undefined;
}

export async function getCampaignBySlug(slug: string) {
  const rows = await sql`SELECT * FROM brand_campaigns WHERE slug = ${slug} LIMIT 1`;
  return rows[0] as unknown as BrandCampaign | undefined;
}

export async function createCampaign(
  ownerId: string,
  data: Partial<BrandCampaign> & { name: string; brand_name: string },
) {
  const slug = data.slug ? slugify(data.slug) : await uniqueSlug(data.name);
  const rows = await sql`
    INSERT INTO brand_campaigns (
      owner_id, name, brand_name, slug, status, primary_color, logo_url,
      headline, subheadline, venue_name, city, event_date, start_time, end_time,
      guestlist_enabled, max_capacity, age_gate, voucher_enabled, voucher_label,
      voucher_limit, voucher_per_phone, photowall_enabled, lineup_text, menu_text
    ) VALUES (
      ${ownerId},
      ${data.name},
      ${data.brand_name},
      ${slug},
      ${data.status ?? 'draft'},
      ${data.primary_color ?? '#c9a84c'},
      ${data.logo_url ?? null},
      ${data.headline ?? null},
      ${data.subheadline ?? null},
      ${data.venue_name ?? null},
      ${data.city ?? 'Lagos'},
      ${data.event_date ?? null},
      ${data.start_time ?? null},
      ${data.end_time ?? null},
      ${data.guestlist_enabled ?? true},
      ${data.max_capacity ?? 500},
      ${data.age_gate ?? true},
      ${data.voucher_enabled ?? false},
      ${data.voucher_label ?? 'Free sample'},
      ${data.voucher_limit ?? 500},
      ${data.voucher_per_phone ?? 1},
      ${data.photowall_enabled ?? true},
      ${data.lineup_text ?? null},
      ${data.menu_text ?? null}
    )
    RETURNING *
  `;
  return rows[0] as unknown as BrandCampaign;
}

export async function updateCampaign(
  id: string,
  ownerId: string,
  patch: Record<string, unknown>,
) {
  const allowed = [
    'name', 'brand_name', 'status', 'primary_color', 'logo_url', 'headline', 'subheadline',
    'venue_name', 'city', 'event_date', 'start_time', 'end_time', 'guestlist_enabled',
    'max_capacity', 'age_gate', 'voucher_enabled', 'voucher_label', 'voucher_limit',
    'voucher_per_phone', 'photowall_enabled', 'lineup_text', 'menu_text',
  ] as const;
  const current = await getCampaignById(id, ownerId);
  if (!current) return null;

  const next = { ...current, ...patch, updated_at: new Date() };
  const rows = await sql`
    UPDATE brand_campaigns SET
      name = ${next.name},
      brand_name = ${next.brand_name},
      status = ${next.status},
      primary_color = ${next.primary_color},
      logo_url = ${next.logo_url},
      headline = ${next.headline},
      subheadline = ${next.subheadline},
      venue_name = ${next.venue_name},
      city = ${next.city},
      event_date = ${next.event_date},
      start_time = ${next.start_time},
      end_time = ${next.end_time},
      guestlist_enabled = ${next.guestlist_enabled},
      max_capacity = ${next.max_capacity},
      age_gate = ${next.age_gate},
      voucher_enabled = ${next.voucher_enabled},
      voucher_label = ${next.voucher_label},
      voucher_limit = ${next.voucher_limit},
      voucher_per_phone = ${next.voucher_per_phone},
      photowall_enabled = ${next.photowall_enabled},
      lineup_text = ${next.lineup_text},
      menu_text = ${next.menu_text},
      updated_at = NOW()
    WHERE id = ${id} AND owner_id = ${ownerId}
    RETURNING *
  `;
  return rows[0] as unknown as BrandCampaign | undefined;
}

export async function recordScan(
  campaignId: string,
  eventType: 'hub_view' | 'pass_open' | 'checkin' | 'redeem' | 'photo',
  guestId?: string | null,
) {
  await sql`
    INSERT INTO campaign_scans (campaign_id, event_type, guest_id)
    VALUES (${campaignId}, ${eventType}, ${guestId ?? null})
  `;
  const col =
    eventType === 'checkin' ? 'total_checkins'
    : eventType === 'redeem' ? 'total_redemptions'
    : eventType === 'photo' ? 'total_photos'
    : 'total_scans';
  if (col === 'total_scans') {
    await sql`UPDATE brand_campaigns SET total_scans = total_scans + 1, updated_at = NOW() WHERE id = ${campaignId}`;
  } else if (col === 'total_checkins') {
    await sql`UPDATE brand_campaigns SET total_checkins = total_checkins + 1, updated_at = NOW() WHERE id = ${campaignId}`;
  } else if (col === 'total_redemptions') {
    await sql`UPDATE brand_campaigns SET total_redemptions = total_redemptions + 1, updated_at = NOW() WHERE id = ${campaignId}`;
  } else if (col === 'total_photos') {
    await sql`UPDATE brand_campaigns SET total_photos = total_photos + 1, updated_at = NOW() WHERE id = ${campaignId}`;
  }
}

export async function registerGuest(
  campaignId: string,
  data: { name: string; phone: string; email?: string; segment?: string; consent?: boolean },
) {
  const campaign = await getCampaignById(campaignId);
  if (!campaign || campaign.status !== 'active') {
    throw new Error('Campaign not available');
  }
  const countRows = await sql`
    SELECT COUNT(*)::int AS n FROM campaign_guests WHERE campaign_id = ${campaignId}
  `;
  if (Number(countRows[0]?.n) >= campaign.max_capacity) {
    throw new Error('Activation is at capacity');
  }
  const token = newPassToken();
  const rows = await sql`
    INSERT INTO campaign_guests (campaign_id, name, phone, email, pass_token, segment, consent_at)
    VALUES (
      ${campaignId},
      ${data.name},
      ${data.phone},
      ${data.email ?? null},
      ${token},
      ${data.segment ?? null},
      ${data.consent ? new Date().toISOString() : null}
    )
    ON CONFLICT (campaign_id, phone) DO UPDATE SET
      name = EXCLUDED.name,
      email = COALESCE(EXCLUDED.email, campaign_guests.email),
      consent_at = COALESCE(EXCLUDED.consent_at, campaign_guests.consent_at)
    RETURNING *
  `;
  await recordScan(campaignId, 'pass_open', String(rows[0].id));
  return rows[0];
}

export async function getGuestByToken(token: string) {
  const rows = await sql`
    SELECT g.*, c.name AS campaign_name, c.brand_name, c.slug, c.primary_color,
           c.voucher_enabled, c.voucher_label, c.venue_name, c.city, c.event_date,
           c.photowall_enabled, c.age_gate, c.headline, c.logo_url
    FROM campaign_guests g
    JOIN brand_campaigns c ON c.id = g.campaign_id
    WHERE g.pass_token = ${token}
    LIMIT 1
  `;
  return rows[0];
}

export async function checkInGuest(token: string, fieldUserId?: string) {
  const guest = await getGuestByToken(token);
  if (!guest) throw new Error('Pass not found');
  if (guest.checked_in_at) return guest;
  const rows = await sql`
    UPDATE campaign_guests SET checked_in_at = NOW()
    WHERE pass_token = ${token}
    RETURNING *
  `;
  await recordScan(String(guest.campaign_id), 'checkin', String(guest.id));
  return rows[0];
}

export async function redeemGuest(token: string, fieldUserId?: string) {
  const guest = await getGuestByToken(token);
  if (!guest) throw new Error('Pass not found');
  if (!guest.voucher_enabled) throw new Error('Voucher not enabled for this activation');
  if (guest.voucher_redeemed_at) throw new Error('Already redeemed');

  const countRows = await sql`
    SELECT COUNT(*)::int AS n FROM campaign_redemptions WHERE campaign_id = ${String(guest.campaign_id)}
  `;
  const limit = Number(guest.voucher_limit ?? 500);
  if (Number(countRows[0]?.n) >= limit) throw new Error('Voucher limit reached');

  await sql`
    INSERT INTO campaign_redemptions (campaign_id, guest_id, redeemed_by)
    VALUES (${String(guest.campaign_id)}, ${String(guest.id)}, ${fieldUserId ?? null})
  `;
  const rows = await sql`
    UPDATE campaign_guests SET voucher_redeemed_at = NOW()
    WHERE id = ${String(guest.id)}
    RETURNING *
  `;
  await recordScan(String(guest.campaign_id), 'redeem', String(guest.id));
  return rows[0];
}

export async function addCampaignPhoto(
  campaignId: string,
  url: string,
  opts?: { guestId?: string; caption?: string; uploadedBy?: string; approved?: boolean },
) {
  const rows = await sql`
    INSERT INTO campaign_photos (campaign_id, guest_id, url, caption, uploaded_by, approved)
    VALUES (
      ${campaignId},
      ${opts?.guestId ?? null},
      ${url},
      ${opts?.caption ?? null},
      ${opts?.uploadedBy ?? null},
      ${opts?.approved ?? false}
    )
    RETURNING *
  `;
  await recordScan(campaignId, 'photo', opts?.guestId);
  return rows[0];
}

export async function listCampaignPhotos(campaignId: string, approvedOnly = false) {
  return approvedOnly
    ? await sql`
        SELECT * FROM campaign_photos
        WHERE campaign_id = ${campaignId} AND approved = true
        ORDER BY created_at DESC
        LIMIT 100
      `
    : await sql`
        SELECT p.*, g.name AS guest_name FROM campaign_photos p
        LEFT JOIN campaign_guests g ON g.id = p.guest_id
        WHERE p.campaign_id = ${campaignId}
        ORDER BY p.created_at DESC
        LIMIT 100
      `;
}

export async function approvePhoto(photoId: string, campaignId: string) {
  const rows = await sql`
    UPDATE campaign_photos SET approved = true
    WHERE id = ${photoId} AND campaign_id = ${campaignId}
    RETURNING *
  `;
  return rows[0];
}

export async function getActivationStats(ownerId: string) {
  const rows = await sql`
    SELECT
      COUNT(*)::int AS total_campaigns,
      COUNT(*) FILTER (WHERE status = 'active')::int AS active_campaigns,
      COALESCE(SUM(total_checkins), 0)::int AS total_checkins,
      COALESCE(SUM(total_redemptions), 0)::int AS total_redemptions,
      COALESCE(SUM(total_photos), 0)::int AS total_photos,
      (SELECT COUNT(*)::int FROM campaign_guests g
        JOIN brand_campaigns c ON c.id = g.campaign_id
        WHERE c.owner_id = ${ownerId}) AS total_guests
    FROM brand_campaigns
    WHERE owner_id = ${ownerId}
  `;
  return rows[0];
}

export async function getTodayLiveCampaigns(ownerId: string) {
  const rows = await sql`
    SELECT c.*,
      (SELECT COUNT(*)::int FROM campaign_guests g WHERE g.campaign_id = c.id) AS guest_count,
      (SELECT COUNT(*)::int FROM campaign_guests g WHERE g.campaign_id = c.id AND g.checked_in_at IS NOT NULL) AS checked_in_count
    FROM brand_campaigns c
    WHERE c.owner_id = ${ownerId}
      AND c.status = 'active'
      AND (c.event_date IS NULL OR c.event_date >= CURRENT_DATE - INTERVAL '1 day')
    ORDER BY c.event_date NULLS LAST, c.created_at DESC
    LIMIT 20
  `;
  return rows;
}
