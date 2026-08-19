import sql from '@/lib/db';

export type VenueKind = 'club' | 'lounge' | 'rooftop' | 'beach' | 'live' | 'restaurant' | 'bar';

export type DBVenue = {
  id: string;
  slug: string;
  name: string;
  kind: VenueKind;
  areaId: string;
  area: string;
  address: string;
  lat: number;
  lng: number;
  tagline: string;
  about: string;
  hours: string;
  coverNgn: number | null;
  cardPerk: string;
  cardDiscountPct: number;
  photoUrl: string | null;
  gallery: string[];
  phone: string | null;
  instagram: string | null;
  website: string | null;
  status: 'pending' | 'active' | 'suspended';
  source: 'admin' | 'partner_submission';
  followerCount: number;
  reviewCount: number;
  avgRating: number;
  followed: boolean;
};

function mapRow(r: Record<string, unknown>, userId?: string | null): DBVenue {
  let gallery: string[] = [];
  try {
    const raw = r.gallery;
    if (typeof raw === 'string') gallery = JSON.parse(raw);
    else if (Array.isArray(raw)) gallery = raw as string[];
  } catch {}

  return {
    id: String(r.id),
    slug: String(r.slug),
    name: String(r.name),
    kind: String(r.kind) as VenueKind,
    areaId: String(r.area_id),
    area: String(r.area),
    address: String(r.address || ''),
    lat: Number(r.lat || 0),
    lng: Number(r.lng || 0),
    tagline: String(r.tagline || ''),
    about: String(r.about || ''),
    hours: String(r.hours || ''),
    coverNgn: r.cover_ngn != null ? Number(r.cover_ngn) : null,
    cardPerk: String(r.card_perk || ''),
    cardDiscountPct: Number(r.card_discount_pct || 0),
    photoUrl: r.photo_url ? String(r.photo_url) : null,
    gallery,
    phone: r.phone ? String(r.phone) : null,
    instagram: r.instagram ? String(r.instagram) : null,
    website: r.website ? String(r.website) : null,
    status: String(r.status) as DBVenue['status'],
    source: String(r.source) as DBVenue['source'],
    followerCount: Number(r.follower_count ?? 0),
    reviewCount: Number(r.review_count ?? 0),
    avgRating: Number(r.avg_rating ?? 0),
    followed: Boolean(r.followed),
  };
}

export async function listVenues(opts: {
  userId?: string | null;
  status?: string;
  areaId?: string;
}): Promise<DBVenue[]> {
  const { userId = null, status = 'active', areaId } = opts;
  const rows = await sql`
    SELECT v.*,
      COALESCE(fc.cnt, 0) AS follower_count,
      COALESCE(rc.cnt, 0) AS review_count,
      COALESCE(rc.avg_r, 0) AS avg_rating,
      CASE WHEN vf.user_id IS NOT NULL THEN true ELSE false END AS followed
    FROM venues v
    LEFT JOIN (SELECT venue_id, COUNT(*) AS cnt FROM venue_followers GROUP BY venue_id) fc ON fc.venue_id = v.id
    LEFT JOIN (SELECT venue_id, COUNT(*) AS cnt, AVG(rating) AS avg_r FROM venue_reviews GROUP BY venue_id) rc ON rc.venue_id = v.id
    LEFT JOIN venue_followers vf ON vf.venue_id = v.id AND vf.user_id = ${userId}
    WHERE (${status} = 'all' OR v.status = ${status})
      AND (${areaId || 'all'} = 'all' OR v.area_id = ${areaId || 'all'})
    ORDER BY v.name ASC
  `;
  return rows.map((r) => mapRow(r, userId));
}

export async function getVenueBySlug(slug: string, userId?: string | null): Promise<DBVenue | null> {
  const rows = await sql`
    SELECT v.*,
      COALESCE(fc.cnt, 0) AS follower_count,
      COALESCE(rc.cnt, 0) AS review_count,
      COALESCE(rc.avg_r, 0) AS avg_rating,
      CASE WHEN vf.user_id IS NOT NULL THEN true ELSE false END AS followed
    FROM venues v
    LEFT JOIN (SELECT venue_id, COUNT(*) AS cnt FROM venue_followers GROUP BY venue_id) fc ON fc.venue_id = v.id
    LEFT JOIN (SELECT venue_id, COUNT(*) AS cnt, AVG(rating) AS avg_r FROM venue_reviews GROUP BY venue_id) rc ON rc.venue_id = v.id
    LEFT JOIN venue_followers vf ON vf.venue_id = v.id AND vf.user_id = ${userId ?? null}
    WHERE v.slug = ${slug}
    LIMIT 1
  `;
  return rows.length ? mapRow(rows[0], userId) : null;
}

export async function createVenue(data: {
  slug: string;
  name: string;
  kind: string;
  areaId: string;
  area: string;
  address?: string;
  lat?: number;
  lng?: number;
  tagline?: string;
  about?: string;
  hours?: string;
  coverNgn?: number | null;
  cardPerk?: string;
  cardDiscountPct?: number;
  photoUrl?: string | null;
  gallery?: string[];
  phone?: string | null;
  instagram?: string | null;
  website?: string | null;
  status?: string;
  source?: string;
  submittedBy?: string | null;
}): Promise<DBVenue> {
  const rows = await sql`
    INSERT INTO venues (slug, name, kind, area_id, area, address, lat, lng, tagline, about, hours, cover_ngn, card_perk, card_discount_pct, photo_url, gallery, phone, instagram, website, status, source, submitted_by)
    VALUES (
      ${data.slug}, ${data.name}, ${data.kind}, ${data.areaId}, ${data.area},
      ${data.address || ''}, ${data.lat || 0}, ${data.lng || 0},
      ${data.tagline || ''}, ${data.about || ''}, ${data.hours || ''},
      ${data.coverNgn ?? null}, ${data.cardPerk || ''}, ${data.cardDiscountPct || 0},
      ${data.photoUrl ?? null}, ${JSON.stringify(data.gallery || [])},
      ${data.phone ?? null}, ${data.instagram ?? null}, ${data.website ?? null},
      ${data.status || 'active'}, ${data.source || 'admin'}, ${data.submittedBy ?? null}
    )
    RETURNING *
  `;
  return mapRow({ ...rows[0], follower_count: 0, review_count: 0, avg_rating: 0, followed: false });
}

export async function updateVenue(id: string, data: Partial<{
  name: string;
  kind: string;
  areaId: string;
  area: string;
  address: string;
  tagline: string;
  about: string;
  hours: string;
  coverNgn: number | null;
  cardPerk: string;
  cardDiscountPct: number;
  photoUrl: string | null;
  gallery: string[];
  phone: string | null;
  instagram: string | null;
  website: string | null;
  status: string;
}>): Promise<void> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  if (data.name !== undefined) { sets.push('name'); vals.push(data.name); }
  if (data.kind !== undefined) { sets.push('kind'); vals.push(data.kind); }
  if (data.areaId !== undefined) { sets.push('area_id'); vals.push(data.areaId); }
  if (data.area !== undefined) { sets.push('area'); vals.push(data.area); }
  if (data.address !== undefined) { sets.push('address'); vals.push(data.address); }
  if (data.tagline !== undefined) { sets.push('tagline'); vals.push(data.tagline); }
  if (data.about !== undefined) { sets.push('about'); vals.push(data.about); }
  if (data.hours !== undefined) { sets.push('hours'); vals.push(data.hours); }
  if (data.photoUrl !== undefined) { sets.push('photo_url'); vals.push(data.photoUrl); }
  if (data.gallery !== undefined) { sets.push('gallery'); vals.push(JSON.stringify(data.gallery)); }
  if (data.phone !== undefined) { sets.push('phone'); vals.push(data.phone); }
  if (data.instagram !== undefined) { sets.push('instagram'); vals.push(data.instagram); }
  if (data.website !== undefined) { sets.push('website'); vals.push(data.website); }
  if (data.status !== undefined) { sets.push('status'); vals.push(data.status); }
  if (data.coverNgn !== undefined) { sets.push('cover_ngn'); vals.push(data.coverNgn); }
  if (data.cardPerk !== undefined) { sets.push('card_perk'); vals.push(data.cardPerk); }
  if (data.cardDiscountPct !== undefined) { sets.push('card_discount_pct'); vals.push(data.cardDiscountPct); }
  if (data.hours !== undefined) { sets.push('hours'); vals.push(data.hours); }

  // Simple approach: update each field individually
  if (data.name !== undefined) await sql`UPDATE venues SET name = ${data.name}, updated_at = NOW() WHERE id = ${id}`;
  if (data.photoUrl !== undefined) await sql`UPDATE venues SET photo_url = ${data.photoUrl}, updated_at = NOW() WHERE id = ${id}`;
  if (data.status !== undefined) await sql`UPDATE venues SET status = ${data.status}, updated_at = NOW() WHERE id = ${id}`;
  if (data.tagline !== undefined) await sql`UPDATE venues SET tagline = ${data.tagline}, updated_at = NOW() WHERE id = ${id}`;
  if (data.about !== undefined) await sql`UPDATE venues SET about = ${data.about}, updated_at = NOW() WHERE id = ${id}`;
  if (data.gallery !== undefined) await sql`UPDATE venues SET gallery = ${JSON.stringify(data.gallery)}, updated_at = NOW() WHERE id = ${id}`;
  if (data.kind !== undefined) await sql`UPDATE venues SET kind = ${data.kind}, updated_at = NOW() WHERE id = ${id}`;
  if (data.hours !== undefined) await sql`UPDATE venues SET hours = ${data.hours}, updated_at = NOW() WHERE id = ${id}`;
  if (data.instagram !== undefined) await sql`UPDATE venues SET instagram = ${data.instagram}, updated_at = NOW() WHERE id = ${id}`;
  if (data.phone !== undefined) await sql`UPDATE venues SET phone = ${data.phone}, updated_at = NOW() WHERE id = ${id}`;
  if (data.website !== undefined) await sql`UPDATE venues SET website = ${data.website}, updated_at = NOW() WHERE id = ${id}`;
  if (data.cardPerk !== undefined) await sql`UPDATE venues SET card_perk = ${data.cardPerk}, updated_at = NOW() WHERE id = ${id}`;
  if (data.coverNgn !== undefined) await sql`UPDATE venues SET cover_ngn = ${data.coverNgn}, updated_at = NOW() WHERE id = ${id}`;
}

export async function followVenue(venueId: string, userId: string): Promise<void> {
  await sql`
    INSERT INTO venue_followers (venue_id, user_id) VALUES (${venueId}, ${userId})
    ON CONFLICT (venue_id, user_id) DO NOTHING
  `;
}

export async function unfollowVenue(venueId: string, userId: string): Promise<void> {
  await sql`DELETE FROM venue_followers WHERE venue_id = ${venueId} AND user_id = ${userId}`;
}

export type VenueReview = {
  id: string;
  userId: string;
  authorName: string;
  rating: number;
  body: string;
  createdAt: string;
};

export async function getVenueReviews(venueId: string): Promise<VenueReview[]> {
  const rows = await sql`
    SELECT * FROM venue_reviews WHERE venue_id = ${venueId} ORDER BY created_at DESC LIMIT 50
  `;
  return rows.map((r) => ({
    id: String(r.id),
    userId: String(r.user_id),
    authorName: String(r.author_name),
    rating: Number(r.rating),
    body: String(r.body),
    createdAt: String(r.created_at),
  }));
}

export async function addVenueReview(data: {
  venueId: string;
  userId: string;
  authorName: string;
  rating: number;
  body: string;
}): Promise<VenueReview> {
  const rows = await sql`
    INSERT INTO venue_reviews (venue_id, user_id, author_name, rating, body)
    VALUES (${data.venueId}, ${data.userId}, ${data.authorName}, ${data.rating}, ${data.body})
    ON CONFLICT (venue_id, user_id) DO UPDATE SET rating = EXCLUDED.rating, body = EXCLUDED.body, author_name = EXCLUDED.author_name
    RETURNING *
  `;
  const r = rows[0];
  return {
    id: String(r.id),
    userId: String(r.user_id),
    authorName: String(r.author_name),
    rating: Number(r.rating),
    body: String(r.body),
    createdAt: String(r.created_at),
  };
}

export async function deleteVenue(id: string): Promise<void> {
  await sql`DELETE FROM venues WHERE id = ${id}`;
}
