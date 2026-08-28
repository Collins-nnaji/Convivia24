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
  };
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

export async function createSupplier(input: SupplierInput): Promise<Supplier> {
  const rows = await sql`
    INSERT INTO suppliers (name, contact_name, phone, email, city, areas, categories, same_day, notes, active)
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
      ${input.active !== false}
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
