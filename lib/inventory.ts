import sql from '@/lib/db';
import { DRINKS, type DrinkCategory, type DrinkProduct } from '@/lib/drinks/catalog';

export type InventoryRow = {
  slug: string;
  name: string;
  on_hand: number;
  reserved: number;
  low_stock_threshold: number;
  track_stock: boolean;
  active: boolean;
  image_url: string | null;
  category: string | null;
  brand: string | null;
  volume: string | null;
  abv: number | null;
  price_ngn: number | null;
  tagline: string | null;
  description: string | null;
  source: string;
  available: number;
};

export async function listInventory(activeOnly = false): Promise<InventoryRow[]> {
  const rows = activeOnly
    ? await sql`SELECT * FROM inventory WHERE active = true ORDER BY name ASC`
    : await sql`SELECT * FROM inventory ORDER BY updated_at DESC`;
  return rows.map(mapRow);
}

export async function getInventory(slug: string): Promise<InventoryRow | null> {
  const rows = await sql`SELECT * FROM inventory WHERE slug = ${slug} LIMIT 1`;
  return rows[0] ? mapRow(rows[0]) : null;
}

function mapRow(r: Record<string, unknown>): InventoryRow {
  const onHand = Number(r.on_hand ?? 0);
  const reserved = Number(r.reserved ?? 0);
  return {
    slug: String(r.slug),
    name: String(r.name),
    on_hand: onHand,
    reserved,
    low_stock_threshold: Number(r.low_stock_threshold ?? 6),
    track_stock: r.track_stock !== false,
    active: r.active !== false,
    image_url: (r.image_url as string) || null,
    category: (r.category as string) || null,
    brand: (r.brand as string) || null,
    volume: (r.volume as string) || null,
    abv: r.abv != null ? Number(r.abv) : null,
    price_ngn: r.price_ngn != null ? Number(r.price_ngn) : null,
    tagline: (r.tagline as string) || null,
    description: (r.description as string) || null,
    source: String(r.source || 'seed'),
    available: Math.max(0, onHand - reserved),
  };
}

export async function upsertAdminProduct(input: {
  slug: string;
  name: string;
  onHand: number;
  priceNgn: number;
  category?: string;
  brand?: string;
  volume?: string;
  abv?: number;
  tagline?: string;
  description?: string;
  imageUrl?: string | null;
}): Promise<InventoryRow> {
  const slug = input.slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
  const rows = await sql`
    INSERT INTO inventory (
      slug, name, on_hand, reserved, low_stock_threshold, track_stock, active,
      image_url, category, brand, volume, abv, price_ngn, tagline, description, source, updated_at
    ) VALUES (
      ${slug},
      ${input.name},
      ${Math.max(0, Math.floor(input.onHand))},
      0,
      6,
      true,
      true,
      ${input.imageUrl || null},
      ${input.category || 'spirits'},
      ${input.brand || null},
      ${input.volume || null},
      ${input.abv ?? null},
      ${Math.max(0, Math.floor(input.priceNgn))},
      ${input.tagline || null},
      ${input.description || null},
      'admin',
      NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      on_hand = EXCLUDED.on_hand,
      image_url = COALESCE(EXCLUDED.image_url, inventory.image_url),
      category = EXCLUDED.category,
      brand = EXCLUDED.brand,
      volume = EXCLUDED.volume,
      abv = EXCLUDED.abv,
      price_ngn = EXCLUDED.price_ngn,
      tagline = EXCLUDED.tagline,
      description = EXCLUDED.description,
      active = true,
      source = 'admin',
      updated_at = NOW()
    RETURNING *
  `;
  await sql`
    INSERT INTO inventory_movements (slug, delta_on_hand, reason, note)
    VALUES (${slug}, ${Math.max(0, Math.floor(input.onHand))}, 'admin_upload', 'Admin stock upsert')
  `;
  return mapRow(rows[0]);
}

export async function adjustStock(slug: string, onHand: number): Promise<InventoryRow | null> {
  const rows = await sql`
    UPDATE inventory SET on_hand = ${Math.max(0, Math.floor(onHand))}, updated_at = NOW()
    WHERE slug = ${slug}
    RETURNING *
  `;
  return rows[0] ? mapRow(rows[0]) : null;
}

export type AdminStockRow = InventoryRow & { tracked: boolean };

/**
 * Every SKU the shop can sell — live inventory rows first, then catalog drinks
 * that have never been stocked (so the desk can set their counts too).
 */
export async function adminStockList(): Promise<AdminStockRow[]> {
  const rows = await listInventory(false);
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const untracked: AdminStockRow[] = DRINKS.filter((d) => !bySlug.has(d.slug)).map((d) => ({
    slug: d.slug,
    name: d.name,
    on_hand: 0,
    reserved: 0,
    low_stock_threshold: 6,
    track_stock: true,
    active: true,
    image_url: d.image || null,
    category: d.category,
    brand: d.brand || null,
    volume: d.volume || null,
    abv: d.abv ?? null,
    price_ngn: d.priceNgn ?? null,
    tagline: d.tagline || null,
    description: d.description || null,
    source: 'catalog',
    available: 0,
    tracked: false,
  }));
  return [...rows.map((r) => ({ ...r, tracked: true })), ...untracked];
}

export class StockEditError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StockEditError';
  }
}

/**
 * Edit an existing SKU's live fields from the admin desk. Any field left
 * undefined is untouched. Seeded catalog SKUs are inserted on first edit so
 * their stock can be managed alongside admin-uploaded ones.
 */
export async function editStockRow(
  slug: string,
  patch: { onHand?: number; priceNgn?: number | null; lowStockThreshold?: number; active?: boolean }
): Promise<InventoryRow | null> {
  const existing = await getInventory(slug);
  if (!existing) {
    const seed = DRINKS.find((d) => d.slug === slug);
    if (!seed) return null;
    await sql`
      INSERT INTO inventory (slug, name, on_hand, category, brand, volume, abv, price_ngn, tagline, description, source)
      VALUES (
        ${seed.slug}, ${seed.name}, 0, ${seed.category}, ${seed.brand || null}, ${seed.volume || null},
        ${seed.abv ?? null}, ${seed.priceNgn ?? null}, ${seed.tagline || null}, ${seed.description || null}, 'seed'
      )
      ON CONFLICT (slug) DO NOTHING
    `;
  }

  const reserved = existing?.reserved ?? 0;
  if (patch.onHand != null && Math.floor(patch.onHand) < reserved) {
    throw new StockEditError(`On hand cannot go below ${reserved} reserved unit(s).`);
  }

  const onHand = patch.onHand != null ? Math.max(0, Math.floor(patch.onHand)) : null;
  const priceNgn = patch.priceNgn != null ? Math.max(0, Math.floor(patch.priceNgn)) : null;
  const threshold = patch.lowStockThreshold != null ? Math.max(0, Math.floor(patch.lowStockThreshold)) : null;
  const active = patch.active != null ? patch.active : null;

  const rows = await sql`
    UPDATE inventory SET
      on_hand = COALESCE(${onHand}, on_hand),
      price_ngn = COALESCE(${priceNgn}, price_ngn),
      low_stock_threshold = COALESCE(${threshold}, low_stock_threshold),
      active = COALESCE(${active}, active),
      updated_at = NOW()
    WHERE slug = ${slug}
    RETURNING *
  `;
  if (!rows[0]) return null;
  const row = mapRow(rows[0]);
  if (onHand != null) {
    const previous = existing?.on_hand ?? 0;
    await logMovement(slug, onHand - previous, 'adjust', 'Admin stock edit');
  }
  return row;
}

async function logMovement(slug: string, delta: number, reason: string, note: string) {
  try {
    await sql`
      INSERT INTO inventory_movements (slug, delta_on_hand, reason, note)
      VALUES (${slug}, ${delta}, ${reason}, ${note})
    `;
  } catch {
    /* movement log is best-effort */
  }
}

/** Merge static catalog + admin inventory into shop products with live stock. */
export async function shopCatalog(): Promise<(DrinkProduct & { onHand?: number; available?: number; lowStock?: boolean })[]> {
  let stock: InventoryRow[] = [];
  try {
    stock = await listInventory(true);
  } catch {
    stock = [];
  }
  const bySlug = new Map(stock.map((s) => [s.slug, s]));

  const fromCatalog = DRINKS.map((d) => {
    const inv = bySlug.get(d.slug);
    const available = inv ? inv.available : undefined;
    return {
      ...d,
      onHand: inv?.on_hand,
      available,
      lowStock: inv ? inv.available <= inv.low_stock_threshold : false,
      image: inv?.image_url || d.image,
      priceNgn: inv?.price_ngn && inv.price_ngn > 0 ? inv.price_ngn : d.priceNgn,
    };
  });

  const catalogSlugs = new Set(DRINKS.map((d) => d.slug));
  const adminOnly = stock
    .filter((s) => s.source === 'admin' && !catalogSlugs.has(s.slug) && s.price_ngn != null)
    .map((s) => ({
      slug: s.slug,
      name: s.name,
      brand: s.brand || undefined,
      category: (s.category as DrinkCategory) || 'spirits',
      abv: Number(s.abv ?? 0),
      volume: s.volume || '—',
      priceNgn: Number(s.price_ngn),
      tagline: s.tagline || 'Admin listed',
      description: s.description || s.tagline || '',
      image: s.image_url || undefined,
      featured: false,
      onHand: s.on_hand,
      available: s.available,
      lowStock: s.available <= s.low_stock_threshold,
    }));

  return [...adminOnly, ...fromCatalog];
}
