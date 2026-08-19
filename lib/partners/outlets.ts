import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import {
  DEFAULT_TARGET_MARGIN,
  PREMIUM_CONVERSIONS,
  VENUE_KINDS,
  wholesalePriceNgn,
  type PricingItem,
} from '@/lib/partners/pricing';
import { DRINKS } from '@/lib/drinks/catalog';
import { issueGiftCard } from '@/lib/commerce/gift-cards';

export type Outlet = {
  id: string;
  ownerId: string;
  venueName: string;
  email: string;
  contact: string | null;
  area: string | null;
  venueKind: string;
  seats: number | null;
  targetMarginPct: number;
  points: number;
  lifetimePoints: number;
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

/**
 * Real partner identity, tied to the same Neon Auth account customers sign
 * in with — null when signed out. The partner desk used to fall back to an
 * anonymous per-browser cookie (via lib/owner.ts's resolveOwner), which is
 * how points, wholesale orders, and gift-card conversion ended up running
 * with no real authentication at all. Every partner surface now requires a
 * real account.
 */
export async function resolveOutletOwner(): Promise<string | null> {
  const user = await getCurrentUser();
  return user ? `user:${user.id}` : null;
}

function mapOutlet(r: Record<string, unknown>): Outlet {
  return {
    id: String(r.id),
    ownerId: String(r.owner_id),
    venueName: String(r.venue_name),
    email: String(r.email),
    contact: (r.contact as string) || null,
    area: (r.area as string) || null,
    venueKind: String(r.venue_kind || 'lounge'),
    seats: r.seats != null ? Number(r.seats) : null,
    targetMarginPct: Number(r.target_margin_pct ?? DEFAULT_TARGET_MARGIN),
    points: Number(r.points ?? 0),
    lifetimePoints: Number(r.lifetime_points ?? 0),
  };
}

/** The signed-in outlet, or an error explaining why there isn't one. */
export async function requireSignedInOutlet(): Promise<Outlet | { error: string }> {
  const ownerId = await resolveOutletOwner();
  if (!ownerId) return { error: 'Sign in to use the partner desk.' };
  const outlet = await getOutlet(ownerId);
  if (!outlet) return { error: 'Open a partner desk first.' };
  return outlet;
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

// ═══════════════════════════════════════════════
// Wholesale restocking, Premium points, and gift-card conversion — all
// real and DB-backed, replacing the old localStorage partner desk.
// ═══════════════════════════════════════════════

export type PartnerInventoryRow = { slug: string; onHand: number };
export type WholesaleOrder = {
  id: string;
  items: { slug: string; name: string; qty: number; unitNgn: number }[];
  totalNgn: number;
  pointsEarned: number;
  createdAt: string;
};

export async function getPartnerInventory(outletId: string): Promise<PartnerInventoryRow[]> {
  const rows = await sql`SELECT slug, on_hand FROM partner_inventory WHERE outlet_id = ${outletId} ORDER BY slug ASC`;
  return rows.map((r) => ({ slug: String(r.slug), onHand: Number(r.on_hand) }));
}

export async function setPartnerOnHand(outletId: string, slug: string, onHand: number): Promise<void> {
  const qty = Math.max(0, Math.min(999, Math.floor(onHand)));
  await sql`
    INSERT INTO partner_inventory (outlet_id, slug, on_hand, updated_at)
    VALUES (${outletId}, ${slug}, ${qty}, NOW())
    ON CONFLICT (outlet_id, slug) DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = NOW()
  `;
}

export async function listWholesaleOrders(outletId: string, limit = 30): Promise<WholesaleOrder[]> {
  const rows = await sql`
    SELECT id, items, total_ngn, points_earned, created_at
    FROM partner_wholesale_orders WHERE outlet_id = ${outletId}
    ORDER BY created_at DESC LIMIT ${limit}
  `;
  return rows.map((r) => ({
    id: String(r.id),
    items: r.items as WholesaleOrder['items'],
    totalNgn: Number(r.total_ngn),
    pointsEarned: Number(r.points_earned),
    createdAt: String(r.created_at),
  }));
}

/** Place a wholesale restock order: prices at the wholesale rate, banks points, tops up on-hand. */
export async function placeWholesaleOrder(
  outletId: string,
  items: { slug: string; qty: number }[]
): Promise<WholesaleOrder | { error: string }> {
  const resolved = items
    .map((item) => {
      const drink = DRINKS.find((d) => d.slug === item.slug);
      if (!drink) return null;
      const qty = Math.max(1, Math.min(48, Math.floor(item.qty)));
      return { slug: drink.slug, name: drink.name, qty, unitNgn: wholesalePriceNgn(drink.priceNgn) };
    })
    .filter((r): r is { slug: string; name: string; qty: number; unitNgn: number } => r !== null);

  if (resolved.length === 0) return { error: 'Select bottles to restock.' };

  const totalNgn = resolved.reduce((n, r) => n + r.unitNgn * r.qty, 0);
  const pointsEarned = Math.floor(totalNgn / 50);

  const [order] = await sql`
    INSERT INTO partner_wholesale_orders (outlet_id, items, total_ngn, points_earned)
    VALUES (${outletId}, ${JSON.stringify(resolved)}::jsonb, ${totalNgn}, ${pointsEarned})
    RETURNING id, items, total_ngn, points_earned, created_at
  `;

  for (const r of resolved) {
    await sql`
      INSERT INTO partner_inventory (outlet_id, slug, on_hand, updated_at)
      VALUES (${outletId}, ${r.slug}, ${r.qty}, NOW())
      ON CONFLICT (outlet_id, slug) DO UPDATE SET on_hand = partner_inventory.on_hand + ${r.qty}, updated_at = NOW()
    `;
  }

  await sql`
    UPDATE partner_outlets SET points = points + ${pointsEarned}, lifetime_points = lifetime_points + ${pointsEarned}
    WHERE id = ${outletId}
  `;

  return {
    id: String(order.id),
    items: order.items as WholesaleOrder['items'],
    totalNgn: Number(order.total_ngn),
    pointsEarned: Number(order.points_earned),
    createdAt: String(order.created_at),
  };
}

/** Convert Premium points into a real, DB-backed gift card the outlet can hand a guest. */
export async function convertPartnerPerk(
  outlet: Outlet,
  conversionId: string
): Promise<{ code: string; valueNgn: number; pointsRemaining: number } | { error: string }> {
  const conv = PREMIUM_CONVERSIONS.find((c) => c.id === conversionId);
  if (!conv) return { error: 'Unknown conversion.' };
  if (outlet.points < conv.points) return { error: 'Not enough Premium points.' };

  // Guarded UPDATE doubles as the atomic spend — a double-submit can't drain points twice.
  const [row] = await sql`
    UPDATE partner_outlets SET points = points - ${conv.points}
    WHERE id = ${outlet.id} AND points >= ${conv.points}
    RETURNING points
  `;
  if (!row) return { error: 'Not enough Premium points.' };

  const card = await issueGiftCard(outlet.venueName, conv.valueNgn, `Partner perk conversion · ${outlet.venueName}`);
  return { code: card.code, valueNgn: card.valueNgn, pointsRemaining: Number(row.points) };
}
