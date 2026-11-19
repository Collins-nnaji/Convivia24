import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { requireAdmin } from '@/lib/admin';
import { BRANDS, getBrand } from '@/lib/brands/catalog';

export type ManagedBrand = {
  ok: true;
  brandSlug: string;
  ownerId: string;
  contactName: string;
  /** True when the desk is opened by a Convivia24 admin rather than the brand's approved owner. */
  admin: boolean;
};

export type ManagedBrandDenied = { ok: false; status: number; error: string };

/**
 * Which brand this request may manage.
 *
 * - A brand's approved ownership claim opens that brand only — `requested` is ignored.
 * - Convivia24 admins (content permission) can open any brand; `requested` picks it,
 *   defaulting to the first brand in the catalogue.
 */
export async function resolveManagedBrand(requested?: string | null): Promise<ManagedBrand | ManagedBrandDenied> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, status: 401, error: 'Sign in to open the brand portal.' };

  const ownerId = `user:${user.id}`;
  const rows = await sql`
    SELECT brand_slug, contact_name FROM brand_claims
    WHERE status = 'approved' AND (owner_id = ${ownerId} OR LOWER(email) = ${user.email.trim().toLowerCase()})
    ORDER BY updated_at DESC
    LIMIT 1
  `.catch(() => []);

  const admin = await requireAdmin('content').catch(() => null);
  if (admin?.ok) {
    const brand = (requested && getBrand(requested)) || (rows[0] && getBrand(String(rows[0].brand_slug))) || BRANDS[0];
    if (!brand) return { ok: false, status: 404, error: 'No brands in the catalogue yet.' };
    return { ok: true, brandSlug: brand.slug, ownerId, contactName: `${user.name || user.email} (Convivia24)`, admin: true };
  }

  if (!rows[0]) {
    return { ok: false, status: 403, error: 'No approved brand claim on this account yet.' };
  }
  return {
    ok: true,
    brandSlug: String(rows[0].brand_slug),
    ownerId,
    contactName: String(rows[0].contact_name || user.name || user.email),
    admin: false,
  };
}

/** Claims this account has filed, newest first — shown while a claim is still under review. */
export async function claimsForCurrentUser(): Promise<{ brandSlug: string; brandName: string; status: string; createdAt: string }[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  const rows = await sql`
    SELECT brand_slug, brand_name, status, created_at FROM brand_claims
    WHERE owner_id = ${`user:${user.id}`} OR LOWER(email) = ${user.email.trim().toLowerCase()}
    ORDER BY created_at DESC
    LIMIT 10
  `.catch(() => []);
  return rows.map((r) => ({
    brandSlug: String(r.brand_slug),
    brandName: String(r.brand_name),
    status: String(r.status),
    createdAt: new Date(r.created_at as string).toISOString(),
  }));
}
