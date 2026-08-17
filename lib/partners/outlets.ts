import sql from '@/lib/db';
import { resolveOwner } from '@/lib/owner';
import { DEFAULT_TARGET_MARGIN, VENUE_KINDS, type PricingItem } from '@/lib/partners/pricing';

export type Outlet = {
  id: string;
  venueName: string;
  email: string;
  contact: string | null;
  area: string | null;
  venueKind: string;
  seats: number | null;
  targetMarginPct: number;
};

export type OutletInput = {
  venueName: string;
  email: string;
  contact?: string | null;
  area?: string | null;
  venueKind?: string;
  seats?: number | null;
  targetMarginPct?: number;
};

export { VENUE_KINDS };

export async function resolveOutletOwner(): Promise<string> {
  return resolveOwner('c24_partner');
}

function mapOutlet(r: Record<string, unknown>): Outlet {
  return {
    id: String(r.id),
    venueName: String(r.venue_name),
    email: String(r.email),
    contact: (r.contact as string) || null,
    area: (r.area as string) || null,
    venueKind: String(r.venue_kind || 'lounge'),
    seats: r.seats != null ? Number(r.seats) : null,
    targetMarginPct: Number(r.target_margin_pct ?? DEFAULT_TARGET_MARGIN),
  };
}

function mapItem(r: Record<string, unknown>): PricingItem {
  return {
    id: String(r.id),
    slug: (r.slug as string) || null,
    name: String(r.name),
    category: (r.category as string) || null,
    bottleCostNgn: Number(r.bottle_cost_ngn ?? 0),
    sellPriceNgn: Number(r.sell_price_ngn ?? 0),
    servingsPerBottle: Number(r.servings_per_bottle ?? 12),
    bottlesPerMonth: Number(r.bottles_per_month ?? 0),
  };
}

export function validateOutlet(input: OutletInput): string | null {
  if (!input.venueName.trim()) return 'Venue name is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) return 'A valid email is required.';
  if (input.targetMarginPct != null && (input.targetMarginPct < 1 || input.targetMarginPct > 95)) {
    return 'Target margin must be between 1 and 95%.';
  }
  return null;
}

export async function getOutlet(ownerId: string): Promise<Outlet | null> {
  const rows = await sql`SELECT * FROM partner_outlets WHERE owner_id = ${ownerId} LIMIT 1`;
  return rows[0] ? mapOutlet(rows[0]) : null;
}

export async function upsertOutlet(ownerId: string, input: OutletInput): Promise<Outlet> {
  const kind = (VENUE_KINDS as readonly string[]).includes(input.venueKind || '')
    ? (input.venueKind as string)
    : 'lounge';
  const rows = await sql`
    INSERT INTO partner_outlets (owner_id, venue_name, email, contact, area, venue_kind, seats, target_margin_pct)
    VALUES (
      ${ownerId}, ${input.venueName.trim()}, ${input.email.trim().toLowerCase()},
      ${input.contact || null}, ${input.area || null}, ${kind},
      ${input.seats ?? null}, ${input.targetMarginPct ?? DEFAULT_TARGET_MARGIN}
    )
    ON CONFLICT (owner_id) DO UPDATE SET
      venue_name = EXCLUDED.venue_name,
      email = EXCLUDED.email,
      contact = EXCLUDED.contact,
      area = EXCLUDED.area,
      venue_kind = EXCLUDED.venue_kind,
      seats = EXCLUDED.seats,
      target_margin_pct = EXCLUDED.target_margin_pct,
      updated_at = NOW()
    RETURNING *
  `;
  return mapOutlet(rows[0]);
}

export async function setTargetMargin(outletId: string, pct: number): Promise<void> {
  await sql`
    UPDATE partner_outlets SET target_margin_pct = ${Math.min(95, Math.max(1, Math.round(pct)))}, updated_at = NOW()
    WHERE id = ${outletId}
  `;
}

export async function listPricingItems(outletId: string): Promise<PricingItem[]> {
  const rows = await sql`
    SELECT * FROM partner_pricing_items WHERE outlet_id = ${outletId} ORDER BY created_at ASC
  `;
  return rows.map(mapItem);
}

export async function upsertPricingItem(
  outletId: string,
  input: Omit<PricingItem, 'id'> & { id?: string }
): Promise<PricingItem> {
  const cost = Math.max(0, Math.round(input.bottleCostNgn));
  const price = Math.max(0, Math.round(input.sellPriceNgn));
  const servings = Math.max(1, Math.round(input.servingsPerBottle));
  const volume = Math.max(0, Math.round(input.bottlesPerMonth));

  const rows = input.id
    ? await sql`
        UPDATE partner_pricing_items SET
          name = ${input.name.trim()},
          slug = ${input.slug || null},
          category = ${input.category || null},
          bottle_cost_ngn = ${cost},
          sell_price_ngn = ${price},
          servings_per_bottle = ${servings},
          bottles_per_month = ${volume},
          updated_at = NOW()
        WHERE id = ${input.id} AND outlet_id = ${outletId}
        RETURNING *
      `
    : await sql`
        INSERT INTO partner_pricing_items (
          outlet_id, slug, name, category, bottle_cost_ngn, sell_price_ngn, servings_per_bottle, bottles_per_month
        ) VALUES (
          ${outletId}, ${input.slug || null}, ${input.name.trim()}, ${input.category || null},
          ${cost}, ${price}, ${servings}, ${volume}
        )
        RETURNING *
      `;
  if (!rows[0]) throw new Error('Pricing line not found');
  return mapItem(rows[0]);
}

export async function deletePricingItem(outletId: string, id: string): Promise<boolean> {
  const rows = await sql`
    DELETE FROM partner_pricing_items WHERE id = ${id} AND outlet_id = ${outletId} RETURNING id
  `;
  return rows.length > 0;
}
