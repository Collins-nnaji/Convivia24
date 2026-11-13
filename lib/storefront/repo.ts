import sql from '@/lib/db';
import { cacheGet, cacheSet, redis } from '@/lib/redis';
import {
  resolveContent,
  type BlockKind,
  type BlockTheme,
  type StorefrontBlock,
  type StorefrontContent,
} from './blocks';

export const STOREFRONT_CACHE_KEY = 'storefront:content:v1';

function mapRow(r: Record<string, unknown>): StorefrontBlock {
  const iso = (v: unknown) => (v ? new Date(v as string).toISOString() : null);
  return {
    id: String(r.id),
    kind: r.kind as BlockKind,
    title: String(r.title || ''),
    subtitle: (r.subtitle as string) || null,
    ctaLabel: (r.cta_label as string) || null,
    href: (r.href as string) || null,
    imageUrl: (r.image_url as string) || null,
    theme: (r.theme as BlockTheme) || 'ember',
    position: Number(r.position ?? 0),
    published: r.published !== false,
    startsAt: iso(r.starts_at),
    endsAt: iso(r.ends_at),
  };
}

/** Every block, for the desk. */
export async function listBlocks(): Promise<StorefrontBlock[]> {
  const rows = await sql`SELECT * FROM storefront_blocks ORDER BY kind, position, created_at`;
  return rows.map(mapRow);
}

/**
 * What the storefront renders right now. A missing table (migration not run) or a database
 * outage falls back to the built-in defaults rather than breaking the home page.
 */
export async function storefrontContent(): Promise<StorefrontContent> {
  // Rows are cached, not the resolved content, so a scheduled block still switches on time.
  const cached = await cacheGet<StorefrontBlock[]>(STOREFRONT_CACHE_KEY);
  if (cached) return resolveContent(cached);
  let rows: StorefrontBlock[] = [];
  try {
    rows = await listBlocks();
    await cacheSet(STOREFRONT_CACHE_KEY, rows, 60);
  } catch {
    rows = [];
  }
  return resolveContent(rows);
}

export async function invalidateStorefront(): Promise<void> {
  const r = redis();
  if (!r) return;
  try {
    await r.del(STOREFRONT_CACHE_KEY);
  } catch {
    /* next read misses at worst */
  }
}

export type BlockInput = {
  kind: BlockKind;
  title: string;
  subtitle?: string | null;
  ctaLabel?: string | null;
  href?: string | null;
  imageUrl?: string | null;
  theme: BlockTheme;
  position?: number;
  published?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
};

export async function createBlock(input: BlockInput): Promise<StorefrontBlock> {
  const rows = await sql`
    INSERT INTO storefront_blocks (kind, title, subtitle, cta_label, href, image_url, theme, position, published, starts_at, ends_at)
    VALUES (
      ${input.kind}, ${input.title}, ${input.subtitle || null}, ${input.ctaLabel || null}, ${input.href || null},
      ${input.imageUrl || null}, ${input.theme},
      COALESCE(${input.position ?? null}::integer, (SELECT COALESCE(MAX(position) + 1, 0) FROM storefront_blocks WHERE kind = ${input.kind})),
      ${input.published ?? true}, ${input.startsAt || null}, ${input.endsAt || null}
    )
    RETURNING *
  `;
  return mapRow(rows[0]);
}

export async function updateBlock(id: string, input: BlockInput): Promise<StorefrontBlock | null> {
  const rows = await sql`
    UPDATE storefront_blocks SET
      kind = ${input.kind},
      title = ${input.title},
      subtitle = ${input.subtitle || null},
      cta_label = ${input.ctaLabel || null},
      href = ${input.href || null},
      image_url = ${input.imageUrl || null},
      theme = ${input.theme},
      position = COALESCE(${input.position ?? null}::integer, position),
      published = ${input.published ?? true},
      starts_at = ${input.startsAt || null},
      ends_at = ${input.endsAt || null},
      updated_at = NOW()
    WHERE id = ${id}::uuid
    RETURNING *
  `;
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function setBlockPublished(id: string, published: boolean): Promise<StorefrontBlock | null> {
  const rows = await sql`
    UPDATE storefront_blocks SET published = ${published}, updated_at = NOW() WHERE id = ${id}::uuid RETURNING *
  `;
  return rows[0] ? mapRow(rows[0]) : null;
}

/** Swap a block with its neighbour inside the same slot. */
export async function moveBlock(id: string, direction: -1 | 1): Promise<void> {
  const [row] = await sql`SELECT id, kind, position FROM storefront_blocks WHERE id = ${id}::uuid`;
  if (!row) return;
  const siblings = await sql`
    SELECT id, position FROM storefront_blocks WHERE kind = ${row.kind as string} ORDER BY position, created_at
  `;
  const ids = siblings.map((s) => String(s.id));
  const from = ids.indexOf(id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= ids.length) return;
  [ids[from], ids[to]] = [ids[to], ids[from]];
  // Renumber the whole slot so positions stay dense after deletes.
  for (let i = 0; i < ids.length; i++) {
    await sql`UPDATE storefront_blocks SET position = ${i}, updated_at = NOW() WHERE id = ${ids[i]}::uuid`;
  }
}

export async function deleteBlock(id: string): Promise<boolean> {
  const rows = await sql`DELETE FROM storefront_blocks WHERE id = ${id}::uuid RETURNING id`;
  return rows.length > 0;
}

/**
 * Best sellers by units in paid orders over the last `days`. Party packs count as themselves —
 * the shopper bought the pack, not its bottles.
 */
export async function bestSellerSlugs(days = 90, limit = 24): Promise<string[]> {
  try {
    const rows = await sql`
      SELECT i.kit_slug AS slug, SUM(i.qty)::int AS units
      FROM ritual_order_items i
      JOIN ritual_orders o ON o.id = i.order_id
      WHERE o.status NOT IN ('pending', 'awaiting_payment', 'cancelled')
        AND o.created_at > NOW() - make_interval(days => ${days})
      GROUP BY i.kit_slug
      ORDER BY units DESC
      LIMIT ${limit}
    `;
    return rows.map((r) => String(r.slug));
  } catch {
    return [];
  }
}

export type HomeReview = {
  id: string;
  slug: string;
  productName: string;
  authorName: string;
  rating: number;
  body: string;
  verifiedBuyer: boolean;
  createdAt: string;
};

/** Recent 4–5 star published reviews with something to say, plus the shop-wide average. */
export async function homeReviews(limit = 8): Promise<{ reviews: HomeReview[]; average: number; count: number }> {
  try {
    const [rows, agg] = await Promise.all([
      sql`
        SELECT r.id, r.slug, r.author_name, r.rating, r.body, r.verified_buyer, r.created_at,
          COALESCE(inv.name, r.slug) AS product_name
        FROM product_reviews r
        LEFT JOIN inventory inv ON inv.slug = r.slug
        WHERE r.status = 'published' AND r.rating >= 4 AND length(trim(r.body)) >= 12
        ORDER BY r.verified_buyer DESC, r.created_at DESC
        LIMIT ${limit}
      `,
      sql`SELECT COALESCE(AVG(rating), 0)::float AS average, COUNT(*)::int AS count FROM product_reviews WHERE status = 'published'`,
    ]);
    return {
      reviews: rows.map((r) => ({
        id: String(r.id),
        slug: String(r.slug),
        productName: String(r.product_name),
        authorName: String(r.author_name),
        rating: Number(r.rating),
        body: String(r.body),
        verifiedBuyer: r.verified_buyer === true,
        createdAt: new Date(r.created_at as string).toISOString(),
      })),
      average: Number(agg[0]?.average ?? 0),
      count: Number(agg[0]?.count ?? 0),
    };
  } catch {
    return { reviews: [], average: 0, count: 0 };
  }
}

/** Best sellers, cached for 10 minutes — order volume does not move faster than that. */
export async function cachedBestSellers(): Promise<string[]> {
  const key = 'storefront:best-sellers:v1';
  const cached = await cacheGet<string[]>(key);
  if (cached) return cached;
  const slugs = await bestSellerSlugs();
  await cacheSet(key, slugs, 600);
  return slugs;
}

export type DeliveryCity = { city: string; areas: { name: string; feeNgn: number; estimate: string }[] };

/**
 * Where checkout actually delivers: the active zones from Delivery settings, grouped by city.
 * Empty when no zone is switched on (or the table is unavailable) — never a guess.
 */
export async function activeDeliveryCities(): Promise<DeliveryCity[]> {
  try {
    const rows = await sql`
      SELECT city, name, fee_ngn, estimate FROM delivery_zones WHERE active ORDER BY city, name
    `;
    const byCity = new Map<string, DeliveryCity>();
    for (const r of rows) {
      const city = String(r.city);
      if (!byCity.has(city)) byCity.set(city, { city, areas: [] });
      byCity.get(city)!.areas.push({ name: String(r.name), feeNgn: Number(r.fee_ngn), estimate: String(r.estimate) });
    }
    return [...byCity.values()];
  } catch {
    return [];
  }
}
