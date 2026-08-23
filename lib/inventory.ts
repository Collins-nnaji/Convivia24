import sql from '@/lib/db';
import { DRINKS, type DrinkCategory, type DrinkProduct } from '@/lib/drinks/catalog';
import { TASTE_NOTES } from '@/lib/drinks/brand-guide';
import { upsertBrand } from '@/lib/drinks/product-info';

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
  taste_note: string | null;
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
    taste_note: (r.taste_note as string) || null,
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
  tasteNote?: string;
  brandOrigin?: string;
  brandFounded?: string;
  brandHistory?: string;
  brandStyle?: string;
  imageUrl?: string | null;
}): Promise<InventoryRow> {
  const slug = input.slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);

  if (input.brand && (input.brandHistory || input.brandStyle || input.brandOrigin)) {
    await upsertBrand(input.brand, {
      origin: input.brandOrigin || '',
      founded: input.brandFounded || '',
      history: input.brandHistory || '',
      style: input.brandStyle || '',
    });
  }

  const rows = await sql`
    INSERT INTO inventory (
      slug, name, on_hand, reserved, low_stock_threshold, track_stock, active,
      image_url, category, brand, volume, abv, price_ngn, tagline, description, taste_note, source, updated_at
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
      ${input.tasteNote || null},
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
      taste_note = COALESCE(EXCLUDED.taste_note, inventory.taste_note),
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
    taste_note: TASTE_NOTES[d.slug] || null,
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
  patch: {
    onHand?: number;
    priceNgn?: number | null;
    lowStockThreshold?: number;
    active?: boolean;
    tasteNote?: string | null;
    tagline?: string | null;
    description?: string | null;
    brand?: string | null;
    brandOrigin?: string;
    brandFounded?: string;
    brandHistory?: string;
    brandStyle?: string;
  }
): Promise<InventoryRow | null> {
  const existing = await getInventory(slug);
  if (!existing) {
    const seed = DRINKS.find((d) => d.slug === slug);
    if (!seed) return null;
    await sql`
      INSERT INTO inventory (slug, name, on_hand, category, brand, volume, abv, price_ngn, tagline, description, taste_note, source)
      VALUES (
        ${seed.slug}, ${seed.name}, 0, ${seed.category}, ${seed.brand || null}, ${seed.volume || null},
        ${seed.abv ?? null}, ${seed.priceNgn ?? null}, ${seed.tagline || null}, ${seed.description || null},
        ${TASTE_NOTES[seed.slug] || null}, 'seed'
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
  const tasteNote = patch.tasteNote !== undefined ? (patch.tasteNote?.trim() || null) : null;
  const tagline = patch.tagline !== undefined ? (patch.tagline?.trim() || null) : null;
  const description = patch.description !== undefined ? (patch.description?.trim() || null) : null;
  const brand = patch.brand !== undefined ? (patch.brand?.trim() || null) : null;
  const setTaste = patch.tasteNote !== undefined;
  const setTagline = patch.tagline !== undefined;
  const setDescription = patch.description !== undefined;
  const setBrand = patch.brand !== undefined;

  const brandName = brand ?? existing?.brand ?? null;
  if (brandName && (patch.brandHistory || patch.brandStyle || patch.brandOrigin || patch.brandFounded)) {
    await upsertBrand(brandName, {
      origin: patch.brandOrigin || '',
      founded: patch.brandFounded || '',
      history: patch.brandHistory || '',
      style: patch.brandStyle || '',
    });
  }

  const rows = await sql`
    UPDATE inventory SET
      on_hand = COALESCE(${onHand}, on_hand),
      price_ngn = COALESCE(${priceNgn}, price_ngn),
      low_stock_threshold = COALESCE(${threshold}, low_stock_threshold),
      active = COALESCE(${active}, active),
      taste_note = CASE WHEN ${setTaste} THEN ${tasteNote} ELSE taste_note END,
      tagline = CASE WHEN ${setTagline} THEN ${tagline} ELSE tagline END,
      description = CASE WHEN ${setDescription} THEN ${description} ELSE description END,
      brand = CASE WHEN ${setBrand} THEN ${brand} ELSE brand END,
      updated_at = NOW()
    WHERE slug = ${slug}
    RETURNING *
  `;
  if (!rows[0]) return null;
  const row = mapRow(rows[0]);
  if (onHand != null) {
    const previous = existing?.on_hand ?? 0;
    await logMovement(slug, { onHand: onHand - previous }, 'adjust', 'Admin stock edit');
  }
  return row;
}

async function logMovement(
  slug: string,
  delta: { onHand?: number; reserved?: number },
  reason: string,
  note: string,
  orderId?: string
) {
  try {
    await sql`
      INSERT INTO inventory_movements (slug, delta_on_hand, delta_reserved, reason, order_id, note)
      VALUES (${slug}, ${delta.onHand ?? 0}, ${delta.reserved ?? 0}, ${reason}, ${orderId || null}, ${note})
    `;
  } catch {
    /* movement log is best-effort */
  }
}

export type StockLine = { slug: string; qty: number };

/**
 * Reserves stock for every tracked line item on order creation, so two
 * shoppers can't both check out the last bottle. The HTTP-only Neon driver
 * has no interactive transactions, so this reserves one line at a time and
 * compensates (releases) anything already reserved if a later line fails —
 * a saga rather than a single ACID transaction, but it never lets `reserved`
 * exceed `on_hand` (the DB's own CHECK constraint backs that up too).
 * Untracked items (no inventory row, or track_stock=false) are skipped.
 */
export async function reserveStockForOrder(
  lines: StockLine[],
  orderId: string
): Promise<{ error: string } | null> {
  const reservedSoFar: StockLine[] = [];
  for (const line of lines) {
    const rows = await sql`
      UPDATE inventory
      SET reserved = reserved + ${line.qty}, updated_at = NOW()
      WHERE slug = ${line.slug} AND track_stock = true AND (on_hand - reserved) >= ${line.qty}
      RETURNING slug
    `;
    if (rows.length > 0) {
      reservedSoFar.push(line);
      await logMovement(line.slug, { reserved: line.qty }, 'reserve', `Reserved for order ${orderId}`, orderId);
      continue;
    }

    const [existing] = await sql`SELECT name, track_stock FROM inventory WHERE slug = ${line.slug} LIMIT 1`;
    if (!existing || existing.track_stock === false) continue; // not stock-tracked — nothing to reserve

    for (const r of reservedSoFar) {
      await sql`UPDATE inventory SET reserved = GREATEST(0, reserved - ${r.qty}), updated_at = NOW() WHERE slug = ${r.slug}`;
      await logMovement(r.slug, { reserved: -r.qty }, 'release', `Rolled back — ${line.slug} unavailable`, orderId);
    }
    return { error: `${existing.name || line.slug} doesn't have enough stock right now.` };
  }
  return null;
}

/** Releases reserved-but-not-yet-fulfilled stock — order cancelled or refunded. */
export async function releaseStockForOrder(lines: StockLine[], orderId: string): Promise<void> {
  for (const l of lines) {
    await sql`
      UPDATE inventory SET reserved = GREATEST(0, reserved - ${l.qty}), updated_at = NOW()
      WHERE slug = ${l.slug} AND track_stock = true
    `;
    await logMovement(l.slug, { reserved: -l.qty }, 'release', `Released — order ${orderId}`, orderId);
  }
}

/** Consumes stock for good — order actually left the building (delivered/fulfilled). */
export async function fulfillStockForOrder(lines: StockLine[], orderId: string): Promise<void> {
  for (const l of lines) {
    await sql`
      UPDATE inventory
      SET on_hand = GREATEST(0, on_hand - ${l.qty}), reserved = GREATEST(0, reserved - ${l.qty}), updated_at = NOW()
      WHERE slug = ${l.slug} AND track_stock = true
    `;
    await logMovement(l.slug, { onHand: -l.qty, reserved: -l.qty }, 'fulfill', `Fulfilled — order ${orderId}`, orderId);
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
