import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { getBrand } from '@/lib/brands/catalog';

export async function resolveBrandOwner(): Promise<string | null> {
  const user = await getCurrentUser();
  return user ? `user:${user.id}` : null;
}

/* ── Follows ─────────────────────────────────────────────────────────── */

export async function followerCount(brandSlug: string): Promise<number> {
  const rows = await sql`SELECT COUNT(*)::int AS n FROM brand_follows WHERE brand_slug = ${brandSlug}`;
  return Number(rows[0]?.n ?? 0);
}

export async function isFollowing(brandSlug: string, ownerId: string): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM brand_follows WHERE brand_slug = ${brandSlug} AND owner_id = ${ownerId} LIMIT 1
  `;
  return rows.length > 0;
}

/** Follow or unfollow, returning the state afterwards. */
export async function toggleFollow(
  brandSlug: string,
  ownerId: string
): Promise<{ following: boolean; followers: number }> {
  const removed = await sql`
    DELETE FROM brand_follows WHERE brand_slug = ${brandSlug} AND owner_id = ${ownerId} RETURNING id
  `;
  if (removed.length === 0) {
    await sql`
      INSERT INTO brand_follows (brand_slug, owner_id) VALUES (${brandSlug}, ${ownerId})
      ON CONFLICT (brand_slug, owner_id) DO NOTHING
    `;
  }
  return { following: removed.length === 0, followers: await followerCount(brandSlug) };
}

/* ── Ownership claims ────────────────────────────────────────────────── */

export type BrandClaim = {
  id: string;
  brandSlug: string;
  brandName: string;
  contactName: string;
  email: string;
  phone: string | null;
  role: string | null;
  website: string | null;
  message: string | null;
  status: 'pending' | 'verified' | 'approved' | 'rejected';
  createdAt: string;
};

function mapClaim(r: Record<string, unknown>): BrandClaim {
  return {
    id: String(r.id),
    brandSlug: String(r.brand_slug),
    brandName: String(r.brand_name),
    contactName: String(r.contact_name),
    email: String(r.email),
    phone: (r.phone as string) || null,
    role: (r.role as string) || null,
    website: (r.website as string) || null,
    message: (r.message as string) || null,
    status: String(r.status || 'pending') as BrandClaim['status'],
    createdAt: new Date(r.created_at as string).toISOString(),
  };
}

export class BrandAlreadyManagedError extends Error {
  constructor(message = 'This brand page is already managed by its owner.') {
    super(message);
    this.name = 'BrandAlreadyManagedError';
  }
}

/** The approved owner of a brand page, if a brand has taken it over. */
export async function approvedClaim(brandSlug: string): Promise<BrandClaim | null> {
  const rows = await sql`
    SELECT * FROM brand_claims WHERE brand_slug = ${brandSlug} AND status = 'approved' LIMIT 1
  `;
  return rows[0] ? mapClaim(rows[0]) : null;
}

export async function createClaim(input: {
  brandSlug: string;
  contactName: string;
  email: string;
  phone?: string | null;
  role?: string | null;
  website?: string | null;
  message?: string | null;
  ownerId?: string | null;
}): Promise<BrandClaim> {
  const brand = getBrand(input.brandSlug);
  if (!brand) throw new Error('Unknown brand.');
  if (await approvedClaim(input.brandSlug)) throw new BrandAlreadyManagedError();

  const rows = await sql`
    INSERT INTO brand_claims (brand_slug, brand_name, contact_name, email, phone, role, website, message, owner_id)
    VALUES (
      ${brand.slug}, ${brand.name}, ${input.contactName.trim().slice(0, 120)},
      ${input.email.trim().toLowerCase().slice(0, 160)}, ${input.phone || null},
      ${input.role || null}, ${input.website || null}, ${input.message || null},
      ${input.ownerId || null}
    )
    RETURNING *
  `;
  return mapClaim(rows[0]);
}

export async function listClaims(status?: string): Promise<BrandClaim[]> {
  const rows = status
    ? await sql`SELECT * FROM brand_claims WHERE status = ${status} ORDER BY created_at DESC LIMIT 300`
    : await sql`SELECT * FROM brand_claims ORDER BY created_at DESC LIMIT 300`;
  return rows.map(mapClaim);
}

export async function setClaimStatus(id: string, status: BrandClaim['status']): Promise<BrandClaim | null> {
  const rows = await sql`
    UPDATE brand_claims SET status = ${status}, updated_at = NOW() WHERE id = ${id} RETURNING *
  `;
  return rows[0] ? mapClaim(rows[0]) : null;
}
