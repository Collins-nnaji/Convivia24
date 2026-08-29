import { BRAND_INFO, type BrandInfo } from '@/lib/drinks/brand-guide';
import { DRINKS, type DrinkProduct } from '@/lib/drinks/catalog';
import { TRIVIA_ROUNDS, type TriviaRound } from '@/lib/trivia/catalog';

/**
 * Brand pages.
 *
 * Convivia24 owns and writes these — a brand can claim its page to take over
 * management, but nothing here is supplied by the brand until that happens.
 * Everything on a page is assembled from what the shop already holds: the
 * bottles stocked, the house write-up, and the trivia rounds that run on it.
 */

export type Brand = {
  slug: string;
  name: string;
  info: BrandInfo;
  /** Bottles we stock from this house, cheapest first. */
  products: DrinkProduct[];
  /** Trivia rounds that run on this house. */
  rounds: TriviaRound[];
};

export function brandSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, 'and')
    // Drop apostrophes outright — "Jack Daniel's" should slug to
    // jack-daniels, not jack-daniel-s.
    .replace(/['\u2019]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildBrands(): Brand[] {
  const byName = new Map<string, DrinkProduct[]>();
  for (const product of DRINKS) {
    if (!product.brand || product.sample || product.partyPack) continue;
    const rows = byName.get(product.brand) ?? [];
    rows.push(product);
    byName.set(product.brand, rows);
  }

  return [...byName.entries()]
    // A page needs something to say — a house write-up is the minimum bar.
    .filter(([name]) => Boolean(BRAND_INFO[name]))
    .map(([name, products]) => ({
      slug: brandSlug(name),
      name,
      info: BRAND_INFO[name],
      products: [...products].sort((a, b) => a.priceNgn - b.priceNgn),
      rounds: TRIVIA_ROUNDS.filter((r) => r.brand === name),
    }))
    .sort((a, b) => b.products.length - a.products.length || a.name.localeCompare(b.name));
}

export const BRANDS: Brand[] = buildBrands();

export function getBrand(slug: string): Brand | undefined {
  return BRANDS.find((b) => b.slug === slug);
}

/** Headline numbers on a brand page — each one counted, never rounded up for effect. */
export type BrandStat = { label: string; value: string };

export function brandStats(brand: Brand, followers: number): BrandStat[] {
  const founded = Number(brand.info.founded);
  const years = Number.isFinite(founded) ? new Date().getFullYear() - founded : null;

  const stats: BrandStat[] = [];
  if (years && years > 0) stats.push({ label: 'Years of heritage', value: `${years}` });
  stats.push({ label: 'Bottles stocked', value: `${brand.products.length}` });
  if (brand.rounds.length > 0) {
    stats.push({ label: 'Trivia rounds', value: `${brand.rounds.length}` });
  }
  stats.push({ label: 'Followers', value: followers.toLocaleString() });
  return stats;
}

/** The four things Convivia24 says about every house it lists. */
export const BRAND_PILLARS = [
  { title: 'Original stock', detail: 'Sourced through authorised channels. No parallel imports.' },
  { title: 'Written up honestly', detail: 'Tasting notes and house history, not marketing copy.' },
  { title: 'Nationwide delivery', detail: 'To homes, parties, clubs and lounges across Nigeria.' },
  { title: 'Scan to verify', detail: 'Every order ships with a checkable authenticity stamp.' },
];
