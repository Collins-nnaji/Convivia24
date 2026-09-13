import { createHash, randomBytes } from 'crypto';
import sql from '@/lib/db';
import { CATEGORIES } from '@/lib/drinks/catalog';
import { LAGOS_AREAS } from '@/lib/geo/lagos';

export type Supplier = {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  city: string;
  /** Area names from LAGOS_AREAS this supplier will deliver to. Empty = anywhere in `city`. */
  areas: string[];
  /** DrinkCategory values this supplier can fill. Empty = no stated speciality. */
  categories: string[];
  sameDay: boolean;
  notes: string | null;
  active: boolean;
  createdAt: string;
  /** URL handle for the supplier's own portal: /supplier/<slug>. */
  slug: string;
  /** Whether the portal accepts logins at all — a soft switch separate from revoking the key. */
  portalEnabled: boolean;
  /** True once an access key has been issued (the key itself is never stored in the clear). */
  hasAccessKey: boolean;
  accessKeyIssuedAt: string | null;
  lastSeenAt: string | null;
  /** Extra emails that open the portal with a normal account login (the contact email always does). */
  portalEmails: string[];
};

export type SupplierInput = {
  name: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  areas?: string[];
  categories?: string[];
  sameDay?: boolean;
  notes?: string | null;
  active?: boolean;
};

const AREA_NAMES = LAGOS_AREAS.map((a) => a.name);

function mapSupplier(r: Record<string, unknown>): Supplier {
  return {
    id: String(r.id),
    name: String(r.name),
    contactName: (r.contact_name as string) || null,
    phone: (r.phone as string) || null,
    email: (r.email as string) || null,
    city: String(r.city || 'Lagos'),
    areas: Array.isArray(r.areas) ? (r.areas as string[]) : [],
    categories: Array.isArray(r.categories) ? (r.categories as string[]) : [],
    sameDay: r.same_day === true,
    notes: (r.notes as string) || null,
    active: r.active !== false,
    createdAt: String(r.created_at),
    slug: String(r.slug || ''),
    portalEnabled: r.portal_enabled !== false,
    hasAccessKey: Boolean(r.access_key_hash),
    accessKeyIssuedAt: r.access_key_issued_at ? String(r.access_key_issued_at) : null,
    lastSeenAt: r.last_seen_at ? String(r.last_seen_at) : null,
    portalEmails: Array.isArray(r.portal_emails) ? (r.portal_emails as string[]) : [],
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Every email that may open this supplier's portal, lower-cased and de-duplicated. */
export function supplierSignInEmails(s: Pick<Supplier, 'email' | 'portalEmails'>): string[] {
  const all = [s.email, ...s.portalEmails].map((e) => (e || '').trim().toLowerCase()).filter(Boolean);
  return [...new Set(all)];
}

/** Replaces the allowlist. Returns the rejected entries so the desk can say which ones. */
export async function setSupplierPortalEmails(id: string, emails: string[]): Promise<{ supplier: Supplier | null; rejected: string[] }> {
  const clean: string[] = [];
  const rejected: string[] = [];
  for (const raw of emails) {
    const e = String(raw || '').trim().toLowerCase();
    if (!e) continue;
    if (!EMAIL_RE.test(e)) rejected.push(raw);
    else if (!clean.includes(e)) clean.push(e);
  }
  const rows = await sql`
    UPDATE suppliers SET portal_emails = ${clean.slice(0, 20)}, updated_at = NOW() WHERE id = ${id} RETURNING *
  `;
  return { supplier: rows[0] ? mapSupplier(rows[0]) : null, rejected };
}

/** The active supplier this email may open, if any — used to route a signed-in user to their portal. */
export async function findSupplierForEmail(email: string): Promise<Supplier | null> {
  const e = email.trim().toLowerCase();
  if (!e) return null;
  const rows = await sql`
    SELECT * FROM suppliers
    WHERE active = true AND portal_enabled = true AND (LOWER(email) = ${e} OR ${e} = ANY(portal_emails))
    ORDER BY name ASC LIMIT 1
  `;
  return rows[0] ? mapSupplier(rows[0]) : null;
}

export function slugifySupplier(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'supplier';
}

/** A slug nobody else holds, appending a short random suffix on collision. */
async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let candidate = base;
  for (let attempt = 0; attempt < 5; attempt++) {
    const rows = excludeId
      ? await sql`SELECT 1 FROM suppliers WHERE slug = ${candidate} AND id <> ${excludeId} LIMIT 1`
      : await sql`SELECT 1 FROM suppliers WHERE slug = ${candidate} LIMIT 1`;
    if (rows.length === 0) return candidate;
    candidate = `${base}-${randomBytes(2).toString('hex')}`;
  }
  return `${base}-${randomBytes(4).toString('hex')}`;
}

export function hashAccessKey(key: string): string {
  return createHash('sha256').update(key.trim()).digest('hex');
}

/** Human-typeable key, shown to the admin once. Format: CV24-XXXX-XXXX-XXXX (no 0/O/1/I). */
function generateAccessKey(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(12);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
    if (i % 4 === 3 && i !== bytes.length - 1) out += '-';
  }
  return `CV24-${out}`;
}

/** Drops anything not in the known list, so a typo cannot quietly make a supplier unmatchable. */
function cleanList(values: string[] | undefined, allowed: readonly string[]): string[] {
  if (!Array.isArray(values)) return [];
  const seen = new Set<string>();
  for (const v of values) {
    const match = allowed.find((a) => a.toLowerCase() === String(v).trim().toLowerCase());
    if (match) seen.add(match);
  }
  return [...seen];
}

export function validateSupplier(input: SupplierInput): string | null {
  if (!input.name || !input.name.trim()) return 'Supplier name is required.';
  if (input.name.trim().length > 120) return 'Supplier name is too long.';
  if (input.email && input.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    return 'That email does not look right.';
  }
  if (input.phone && input.phone.trim() && !/^[+\d][\d\s-]{6,19}$/.test(input.phone.trim())) {
    return 'That phone number does not look right.';
  }
  const areas = input.areas;
  if (areas && areas.length && !cleanList(areas, AREA_NAMES).length) {
    return 'None of those delivery areas are recognised.';
  }
  const categories = input.categories;
  if (categories && categories.length && !cleanList(categories, CATEGORIES).length) {
    return 'None of those categories are recognised.';
  }
  return null;
}

export async function listSuppliers(activeOnly = false): Promise<Supplier[]> {
  const rows = activeOnly
    ? await sql`SELECT * FROM suppliers WHERE active = true ORDER BY name ASC`
    : await sql`SELECT * FROM suppliers ORDER BY active DESC, name ASC`;
  return rows.map(mapSupplier);
}

export async function getSupplier(id: string): Promise<Supplier | null> {
  const rows = await sql`SELECT * FROM suppliers WHERE id = ${id} LIMIT 1`;
  return rows[0] ? mapSupplier(rows[0]) : null;
}

export async function getSupplierBySlug(slug: string): Promise<Supplier | null> {
  const clean = slug.trim().toLowerCase();
  if (!clean) return null;
  const rows = await sql`SELECT * FROM suppliers WHERE slug = ${clean} LIMIT 1`;
  return rows[0] ? mapSupplier(rows[0]) : null;
}

/** The stored hash for login checks — kept off the `Supplier` type so it never reaches a client. */
export async function getSupplierAccessKeyHash(id: string): Promise<string | null> {
  const rows = await sql`SELECT access_key_hash FROM suppliers WHERE id = ${id} LIMIT 1`;
  return rows[0]?.access_key_hash ? String(rows[0].access_key_hash) : null;
}

/** Issues a fresh key, replacing any existing one. Returns the plaintext exactly once. */
export async function issueSupplierAccessKey(id: string): Promise<{ key: string } | null> {
  const key = generateAccessKey();
  const rows = await sql`
    UPDATE suppliers
    SET access_key_hash = ${hashAccessKey(key)}, access_key_issued_at = NOW(), updated_at = NOW()
    WHERE id = ${id}
    RETURNING id
  `;
  return rows[0] ? { key } : null;
}

export async function revokeSupplierAccessKey(id: string): Promise<void> {
  await sql`
    UPDATE suppliers SET access_key_hash = NULL, access_key_issued_at = NULL, updated_at = NOW() WHERE id = ${id}
  `;
}

export async function setSupplierPortalEnabled(id: string, enabled: boolean): Promise<void> {
  await sql`UPDATE suppliers SET portal_enabled = ${enabled}, updated_at = NOW() WHERE id = ${id}`;
}

export async function touchSupplierSeen(id: string): Promise<void> {
  await sql`UPDATE suppliers SET last_seen_at = NOW() WHERE id = ${id}`.catch(() => {});
}

/** What a supplier may change about themselves from the portal — never name, city or areas. */
export async function updateSupplierContact(
  id: string,
  input: { contactName?: string | null; phone?: string | null; email?: string | null; sameDay?: boolean; notes?: string | null }
): Promise<Supplier | null> {
  const rows = await sql`
    UPDATE suppliers SET
      contact_name = COALESCE(${input.contactName === undefined ? null : input.contactName?.trim() || ''}, contact_name),
      phone = COALESCE(${input.phone === undefined ? null : input.phone?.trim() || ''}, phone),
      email = COALESCE(${input.email === undefined ? null : input.email?.trim().toLowerCase() || ''}, email),
      same_day = COALESCE(${input.sameDay === undefined ? null : input.sameDay}, same_day),
      notes = COALESCE(${input.notes === undefined ? null : input.notes?.trim() || ''}, notes),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] ? mapSupplier(rows[0]) : null;
}

export async function createSupplier(input: SupplierInput): Promise<Supplier> {
  const slug = await uniqueSlug(slugifySupplier(input.name));
  const rows = await sql`
    INSERT INTO suppliers (name, contact_name, phone, email, city, areas, categories, same_day, notes, active, slug)
    VALUES (
      ${input.name.trim()},
      ${input.contactName?.trim() || null},
      ${input.phone?.trim() || null},
      ${input.email?.trim().toLowerCase() || null},
      ${input.city?.trim() || 'Lagos'},
      ${cleanList(input.areas, AREA_NAMES)},
      ${cleanList(input.categories, CATEGORIES)},
      ${input.sameDay === true},
      ${input.notes?.trim() || null},
      ${input.active !== false},
      ${slug}
    )
    RETURNING *
  `;
  return mapSupplier(rows[0]);
}

export async function updateSupplier(id: string, input: SupplierInput): Promise<Supplier | null> {
  const rows = await sql`
    UPDATE suppliers SET
      name = ${input.name.trim()},
      contact_name = ${input.contactName?.trim() || null},
      phone = ${input.phone?.trim() || null},
      email = ${input.email?.trim().toLowerCase() || null},
      city = ${input.city?.trim() || 'Lagos'},
      areas = ${cleanList(input.areas, AREA_NAMES)},
      categories = ${cleanList(input.categories, CATEGORIES)},
      same_day = ${input.sameDay === true},
      notes = ${input.notes?.trim() || null},
      active = ${input.active !== false},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] ? mapSupplier(rows[0]) : null;
}

/**
 * Suppliers are never hard-deleted once they have sourced an order — `ritual_orders.supplier_id`
 * still points at them and the margin history would break. Those are deactivated instead.
 */
export async function deleteSupplier(id: string): Promise<{ deactivated: boolean }> {
  const [used] = await sql`
    SELECT COUNT(*)::int AS count FROM ritual_orders WHERE supplier_id = ${id}
  `;
  if (Number(used?.count ?? 0) > 0) {
    await sql`UPDATE suppliers SET active = false, updated_at = NOW() WHERE id = ${id}`;
    return { deactivated: true };
  }
  await sql`DELETE FROM suppliers WHERE id = ${id}`;
  return { deactivated: false };
}

export type SupplierSuggestion = Supplier & { score: number; reasons: string[] };

/**
 * Rank active suppliers for an order. A hint the desk can override — not an auto-router.
 * Everyone active stays in the list; a better fit just sorts higher.
 */
export function suggestSuppliers(
  suppliers: Supplier[],
  want: { area?: string | null; categories?: string[]; sameDay?: boolean }
): SupplierSuggestion[] {
  const area = want.area?.trim().toLowerCase() || '';
  const categories = want.categories || [];

  return suppliers
    .filter((s) => s.active)
    .map((s) => {
      let score = 0;
      const reasons: string[] = [];

      if (area && s.areas.some((a) => a.toLowerCase() === area)) {
        score += 3;
        reasons.push(`covers ${want.area}`);
      } else if (area && s.areas.length === 0) {
        score += 1;
        reasons.push('no stated area limit');
      }

      if (categories.length && s.categories.length) {
        const hits = categories.filter((c) => s.categories.includes(c));
        if (hits.length === categories.length) {
          score += 3;
          reasons.push('stocks every category');
        } else if (hits.length) {
          score += 2;
          reasons.push(`stocks ${hits.join(', ')}`);
        }
      }

      if (want.sameDay) {
        if (s.sameDay) {
          score += 4;
          reasons.push('does same-day');
        } else {
          score -= 4;
          reasons.push('no same-day');
        }
      }

      return { ...s, score, reasons };
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}
