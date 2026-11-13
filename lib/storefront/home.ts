import { shopCatalog } from '@/lib/inventory';
import { DRINKS } from '@/lib/drinks/catalog';
import { BRANDS } from '@/lib/brands/catalog';
import { cacheGet, cacheSet } from '@/lib/redis';
import { CATALOG_CACHE_KEY } from '@/lib/shop/catalog-cache';
import type { CatalogProduct } from '@/lib/shop/use-catalog';
import { resolveContent, type StorefrontContent } from './blocks';
import { cachedBestSellers, homeReviews, storefrontContent, type HomeReview } from './repo';

export type HomeBrand = { slug: string; name: string; count: number };

export type HomeData = {
  content: StorefrontContent;
  products: CatalogProduct[];
  handpicked: CatalogProduct[];
  bestSellers: CatalogProduct[];
  brands: HomeBrand[];
  reviews: { reviews: HomeReview[]; average: number; count: number };
};

/** Same cache the /api/shop/catalog route fills, so the home page rarely touches the DB. */
async function catalog(): Promise<CatalogProduct[]> {
  const cached = await cacheGet<{ products: CatalogProduct[] }>(CATALOG_CACHE_KEY);
  if (cached?.products?.length) return cached.products;
  try {
    const products = await shopCatalog();
    await cacheSet(CATALOG_CACHE_KEY, { products }, 30);
    return products;
  } catch {
    // The home page must render even when the database is unreachable.
    return DRINKS;
  }
}

const sellable = (p: CatalogProduct) =>
  !p.sample && !p.partyPack && p.category !== 'party-packs' && (p.available == null || p.available > 0);
const hasPhoto = (p: CatalogProduct) => Boolean(p.image || p.packImages?.length);

/** A slow data source must not hold the home page hostage: fall back after `ms`. */
function within<T>(p: Promise<T>, ms: number, fallback: () => T): Promise<T> {
  return Promise.race([
    p.catch(() => fallback()),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback()), ms)),
  ]);
}

export async function getHomeData(): Promise<HomeData> {
  const [content, products, sellerSlugs, reviews] = await Promise.all([
    within(storefrontContent(), 2500, () => resolveContent([])),
    within<CatalogProduct[]>(catalog(), 4000, () => DRINKS),
    within(cachedBestSellers(), 2000, () => [] as string[]),
    within(homeReviews(), 2000, () => ({ reviews: [], average: 0, count: 0 })),
  ]);

  const pool = products.filter((p) => sellable(p) && hasPhoto(p));

  // Handpicked = desk "featured", ranked; topped up with photographed bottles so the grid is full.
  const featured = pool
    .filter((p) => p.featured)
    .sort((a, b) => (b.merchRank ?? 0) - (a.merchRank ?? 0));
  const handpicked = [...featured, ...pool.filter((p) => !p.featured)].slice(0, 18);

  // Best sellers = real order volume, then desk ribbons, then ratings.
  const bySlug = new Map(pool.map((p) => [p.slug, p]));
  const fromOrders = sellerSlugs.map((s) => bySlug.get(s)).filter((p): p is CatalogProduct => Boolean(p));
  const seen = new Set(fromOrders.map((p) => p.slug));
  // Without order data, avoid repeating the first Handpicked row straight back at the shopper.
  const shownAbove = new Set(handpicked.slice(0, 6).map((p) => p.slug));
  const topUp = pool
    .filter((p) => !seen.has(p.slug))
    .sort(
      (a, b) =>
        Number(b.badge === 'best-seller') - Number(a.badge === 'best-seller') ||
        (b.ratingCount ?? 0) - (a.ratingCount ?? 0) ||
        (b.rating ?? 0) - (a.rating ?? 0) ||
        Number(shownAbove.has(a.slug)) - Number(shownAbove.has(b.slug))
    );
  const bestSellers = [...fromOrders, ...topUp].slice(0, 12);

  // Houses we actually stock, most bottles first.
  const counts = new Map<string, number>();
  for (const p of pool) if (p.brand) counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
  const brands = BRANDS.filter((b) => counts.has(b.name))
    .map((b) => ({ slug: b.slug, name: b.name, count: counts.get(b.name) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 12);

  return { content, products, handpicked, bestSellers, brands, reviews };
}
