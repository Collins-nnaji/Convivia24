/**
 * Faceted search for the shop — pure, so the same rules run in the browser and in tests.
 *
 * Within a facet group the options are OR'd (Whisky OR Cognac); across groups they are AND'd
 * (Whisky AND under ₦50k). Counts are "disjunctive": each group's counts apply every *other*
 * group's selection but not its own, so ticking Whisky never zeroes out Cognac's count.
 */
import { CATEGORY_LABELS, savingNgn, type DrinkCategory, type DrinkProduct } from '@/lib/drinks/catalog';

export type FacetProduct = DrinkProduct & {
  available?: number;
  rating?: number;
  ratingCount?: number;
};

export type FacetKey = 'offer' | 'type' | 'brand' | 'country' | 'price' | 'abv' | 'size';

export type FilterState = {
  q: string;
  offer: string[];
  type: string[];
  brand: string[];
  country: string[];
  price: string[];
  abv: string[];
  size: string[];
  /** Minimum average rating, 0 = any. */
  rating: number;
  sort: SortKey;
  page: number;
  per: number;
};

export const SORTS = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'best-selling', label: 'Best selling' },
  { key: 'price-asc', label: 'Price: low to high' },
  { key: 'price-desc', label: 'Price: high to low' },
  { key: 'saving', label: 'Biggest saving' },
  { key: 'rating', label: 'Top rated' },
  { key: 'newest', label: 'Newest' },
  { key: 'name', label: 'Name A–Z' },
] as const;
export type SortKey = (typeof SORTS)[number]['key'];

export const PER_PAGE_OPTIONS = [24, 48, 96] as const;

export const PRICE_BANDS = [
  { key: 'u25', label: 'Under ₦25,000', min: 0, max: 24_999 },
  { key: '25-50', label: '₦25,000 – ₦49,999', min: 25_000, max: 49_999 },
  { key: '50-100', label: '₦50,000 – ₦99,999', min: 50_000, max: 99_999 },
  { key: '100-250', label: '₦100,000 – ₦249,999', min: 100_000, max: 249_999 },
  { key: '250up', label: '₦250,000 and over', min: 250_000, max: Number.POSITIVE_INFINITY },
] as const;

export const ABV_BANDS = [
  { key: 'zero', label: 'Non-alcoholic', min: 0, max: 0.5 },
  { key: 'light', label: 'Light (under 15%)', min: 0.5, max: 14.99 },
  { key: 'medium', label: 'Medium (15% – 39%)', min: 15, max: 39.99 },
  { key: 'full', label: 'Full (40% and over)', min: 40, max: 100 },
] as const;

export const OFFER_OPTIONS = [
  { key: 'on-offer', label: 'On offer' },
  { key: 'new', label: 'New in' },
  { key: 'best-seller', label: 'Best sellers' },
  { key: 'staff-pick', label: 'Staff picks' },
  { key: 'in-stock', label: 'In stock now' },
] as const;

export const RATING_STEPS = [4, 3] as const;

/** "New in" window for desk-listed bottles. */
const NEW_DAYS = 30;

export const EMPTY_FILTERS: FilterState = {
  q: '',
  offer: [],
  type: [],
  brand: [],
  country: [],
  price: [],
  abv: [],
  size: [],
  rating: 0,
  sort: 'recommended',
  page: 1,
  per: 24,
};

/** Collapse free-text catalog volumes into shopper-facing sizes. */
export function sizeBucket(volume: string): string {
  const raw = (volume || '').trim();
  const upper = raw.toUpperCase().replace(/\s+/g, '');
  if (/×|\bx\b|bottles?|pack/i.test(raw)) return 'Packs';
  if (/^(5|20|35|50|70|75|100)CL$/.test(upper)) return upper;
  if (upper === '33CL') return '33CL';
  if (upper === '1L' || upper === '1LTR' || upper === '1LITRE') return '1L';
  return raw && raw !== '—' ? raw.toUpperCase() : 'Other';
}

const SIZE_ORDER = ['5CL', '20CL', '33CL', '35CL', '50CL', '70CL', '75CL', '100CL', '1L', 'Packs'];

export function isNewIn(p: FacetProduct, now = Date.now()): boolean {
  if (p.badge === 'new') return true;
  if (!p.listedAt) return false;
  return now - new Date(p.listedAt).getTime() < NEW_DAYS * 86_400_000;
}

/** Every predicate a facet option tests. `bestSellers` comes from real order data. */
function optionMatches(
  key: FacetKey,
  value: string,
  p: FacetProduct,
  ctx: { bestSellers: Set<string>; now: number }
): boolean {
  switch (key) {
    case 'type':
      return p.category === value;
    case 'brand':
      return (p.brand || '') === value;
    case 'country':
      return (p.origin || '') === value;
    case 'size':
      return sizeBucket(p.volume) === value;
    case 'price': {
      const band = PRICE_BANDS.find((b) => b.key === value);
      return !!band && p.priceNgn >= band.min && p.priceNgn <= band.max;
    }
    case 'abv': {
      const band = ABV_BANDS.find((b) => b.key === value);
      return !!band && p.abv >= band.min && p.abv <= band.max;
    }
    case 'offer':
      switch (value) {
        case 'on-offer':
          return savingNgn(p) > 0 || !!p.deal;
        case 'new':
          return isNewIn(p, ctx.now);
        case 'best-seller':
          return p.badge === 'best-seller' || ctx.bestSellers.has(p.slug);
        case 'staff-pick':
          return p.badge === 'staff-pick';
        case 'in-stock':
          return p.available == null || p.available > 0;
        default:
          return false;
      }
  }
}

const FACET_KEYS: FacetKey[] = ['offer', 'type', 'brand', 'country', 'price', 'abv', 'size'];

export function matchesQuery(p: FacetProduct, raw: string): boolean {
  const q = raw.trim().toLowerCase();
  if (!q) return true;
  const hay = [
    p.name,
    p.brand,
    p.origin,
    p.tagline,
    p.description,
    p.category,
    CATEGORY_LABELS[p.category as DrinkCategory],
    p.volume,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  // Every word must appear somewhere — "hennessy vsop" should not match plain VS.
  return q.split(/\s+/).every((word) => hay.includes(word));
}

function passes(
  p: FacetProduct,
  f: FilterState,
  ctx: { bestSellers: Set<string>; now: number },
  skip?: FacetKey
): boolean {
  if (!matchesQuery(p, f.q)) return false;
  if (f.rating > 0 && (p.rating ?? 0) < f.rating) return false;
  for (const key of FACET_KEYS) {
    if (key === skip) continue;
    const selected = f[key];
    if (selected.length && !selected.some((v) => optionMatches(key, v, p, ctx))) return false;
  }
  return true;
}

export type FacetOption = { value: string; label: string; count: number };
export type FacetGroup = { key: FacetKey; label: string; options: FacetOption[]; searchable?: boolean };

function labelFor(key: FacetKey, value: string): string {
  switch (key) {
    case 'type':
      return CATEGORY_LABELS[value as DrinkCategory] ?? value;
    case 'price':
      return PRICE_BANDS.find((b) => b.key === value)?.label ?? value;
    case 'abv':
      return ABV_BANDS.find((b) => b.key === value)?.label ?? value;
    case 'offer':
      return OFFER_OPTIONS.find((o) => o.key === value)?.label ?? value;
    default:
      return value;
  }
}

/** The values a group offers: fixed bands, or whatever the catalog actually contains. */
function groupValues(key: FacetKey, products: FacetProduct[]): string[] {
  switch (key) {
    case 'offer':
      return OFFER_OPTIONS.map((o) => o.key);
    case 'price':
      return PRICE_BANDS.map((b) => b.key);
    case 'abv':
      return ABV_BANDS.map((b) => b.key);
    case 'type':
      return [...new Set(products.map((p) => p.category))];
    case 'brand':
      return [...new Set(products.map((p) => p.brand || '').filter(Boolean))].sort((a, b) => a.localeCompare(b));
    case 'country':
      return [...new Set(products.map((p) => p.origin || '').filter(Boolean))].sort((a, b) => a.localeCompare(b));
    case 'size': {
      const found = [...new Set(products.map((p) => sizeBucket(p.volume)))];
      return found.sort((a, b) => {
        const ia = SIZE_ORDER.indexOf(a);
        const ib = SIZE_ORDER.indexOf(b);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
      });
    }
  }
}

const GROUP_LABELS: Record<FacetKey, string> = {
  offer: 'Offers',
  type: 'Type',
  brand: 'Brand',
  country: 'Country',
  price: 'Price',
  abv: 'Strength',
  size: 'Size',
};

function sortProducts(list: FacetProduct[], sort: SortKey, bestSellers: string[]): FacetProduct[] {
  const rank = new Map(bestSellers.map((slug, i) => [slug, i]));
  const sellerRank = (p: FacetProduct) => rank.get(p.slug) ?? (p.badge === 'best-seller' ? bestSellers.length : 9_999);
  const sorted = [...list];
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.priceNgn - b.priceNgn);
    case 'price-desc':
      return sorted.sort((a, b) => b.priceNgn - a.priceNgn);
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'saving':
      return sorted.sort((a, b) => savingNgn(b) - savingNgn(a) || Number(!!b.deal) - Number(!!a.deal));
    case 'rating':
      return sorted.sort(
        (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.ratingCount ?? 0) - (a.ratingCount ?? 0)
      );
    case 'newest':
      return sorted.sort(
        (a, b) =>
          (b.listedAt ? new Date(b.listedAt).getTime() : 0) - (a.listedAt ? new Date(a.listedAt).getTime() : 0) ||
          Number(b.badge === 'new') - Number(a.badge === 'new')
      );
    case 'best-selling':
      return sorted.sort((a, b) => sellerRank(a) - sellerRank(b));
    default:
      // Recommended: desk rank, then featured, then offers, then what sells, out-of-stock last.
      return sorted.sort(
        (a, b) =>
          Number((b.available ?? 1) > 0) - Number((a.available ?? 1) > 0) ||
          (b.merchRank ?? 0) - (a.merchRank ?? 0) ||
          Number(!!b.featured) - Number(!!a.featured) ||
          Number(savingNgn(b) > 0 || !!b.deal) - Number(savingNgn(a) > 0 || !!a.deal) ||
          sellerRank(a) - sellerRank(b)
      );
  }
}

export type SearchResult = {
  /** The current page. */
  items: FacetProduct[];
  total: number;
  pages: number;
  page: number;
  groups: FacetGroup[];
};

export function searchCatalog(
  products: FacetProduct[],
  f: FilterState,
  opts: { bestSellers?: string[]; now?: number } = {}
): SearchResult {
  const ctx = { bestSellers: new Set(opts.bestSellers ?? []), now: opts.now ?? Date.now() };
  const matched = products.filter((p) => passes(p, f, ctx));
  const sorted = sortProducts(matched, f.sort, opts.bestSellers ?? []);

  const groups: FacetGroup[] = FACET_KEYS.map((key) => {
    const pool = products.filter((p) => passes(p, f, ctx, key));
    const options = groupValues(key, products)
      .map((value) => ({
        value,
        label: labelFor(key, value),
        count: pool.filter((p) => optionMatches(key, value, p, ctx)).length,
      }))
      // Keep a selected option visible even at zero so it can be unticked.
      .filter((o) => o.count > 0 || f[key].includes(o.value));
    return { key, label: GROUP_LABELS[key], options, searchable: key === 'brand' || key === 'country' };
  }).filter((g) => g.options.length > 0);

  const per = Math.max(1, f.per);
  const pages = Math.max(1, Math.ceil(sorted.length / per));
  const page = Math.min(Math.max(1, f.page), pages);
  return {
    items: sorted.slice((page - 1) * per, page * per),
    total: sorted.length,
    pages,
    page,
    groups,
  };
}

/** Rating "& up" counts, under every other filter. */
export function ratingCounts(products: FacetProduct[], f: FilterState, opts: { bestSellers?: string[] } = {}) {
  const ctx = { bestSellers: new Set(opts.bestSellers ?? []), now: Date.now() };
  const pool = products.filter((p) => passes(p, { ...f, rating: 0 }, ctx));
  return RATING_STEPS.map((min) => ({ min, count: pool.filter((p) => (p.rating ?? 0) >= min).length }));
}

/* ── URL ↔ state ─────────────────────────────────────────────── */

const LIST_KEYS: FacetKey[] = FACET_KEYS;

export function filtersFromParams(params: URLSearchParams): FilterState {
  const list = (key: string) =>
    (params.get(key) || '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  const out: FilterState = { ...EMPTY_FILTERS };
  for (const key of LIST_KEYS) out[key] = list(key);
  // Legacy links: /shop?category=whisky
  const legacy = params.get('category');
  if (legacy && legacy !== 'all' && !out.type.includes(legacy)) out.type = [...out.type, legacy];
  out.q = params.get('q') || '';
  const rating = Number(params.get('rating'));
  out.rating = Number.isFinite(rating) && rating > 0 ? Math.min(5, rating) : 0;
  const sort = params.get('sort');
  out.sort = SORTS.some((s) => s.key === sort) ? (sort as SortKey) : 'recommended';
  const page = Number(params.get('page'));
  out.page = Number.isFinite(page) && page > 1 ? Math.floor(page) : 1;
  const per = Number(params.get('per'));
  out.per = (PER_PAGE_OPTIONS as readonly number[]).includes(per) ? per : 24;
  return out;
}

export function paramsFromFilters(f: FilterState, extra: Record<string, string | null> = {}): string {
  const q = new URLSearchParams();
  if (f.q.trim()) q.set('q', f.q.trim());
  for (const key of LIST_KEYS) if (f[key].length) q.set(key, f[key].join(','));
  if (f.rating > 0) q.set('rating', String(f.rating));
  if (f.sort !== 'recommended') q.set('sort', f.sort);
  if (f.per !== 24) q.set('per', String(f.per));
  if (f.page > 1) q.set('page', String(f.page));
  for (const [k, v] of Object.entries(extra)) if (v) q.set(k, v);
  return q.toString();
}

export function activeFilterCount(f: FilterState): number {
  return LIST_KEYS.reduce((n, key) => n + f[key].length, 0) + (f.rating > 0 ? 1 : 0);
}

/** Chips for the "applied filters" row. */
export function appliedChips(f: FilterState): { key: FacetKey | 'rating' | 'q'; value: string; label: string }[] {
  const chips: { key: FacetKey | 'rating' | 'q'; value: string; label: string }[] = [];
  if (f.q.trim()) chips.push({ key: 'q', value: f.q, label: `“${f.q.trim()}”` });
  for (const key of LIST_KEYS) for (const value of f[key]) chips.push({ key, value, label: labelFor(key, value) });
  if (f.rating > 0) chips.push({ key: 'rating', value: String(f.rating), label: `${f.rating}★ & up` });
  return chips;
}
