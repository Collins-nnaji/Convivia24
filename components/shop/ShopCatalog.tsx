'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  Percent,
  RotateCcw,
  Search,
  SlidersHorizontal,
  UserRound,
  Users,
} from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';
import ShopCartBar from '@/components/shop/ShopCartBar';
import GuestCardStrip from '@/components/loyalty/GuestCardStrip';
import { useCart } from '@/components/cart/CartProvider';
import PackageBrowse, { PACKAGE_OCCASION_ORDER } from '@/components/packages/PackageBrowse';
import { CategoryIcon } from '@/components/icons/ShopIcons';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  DRINKS,
  formatNgn,
  type DrinkCategory,
  type DrinkProduct,
} from '@/lib/drinks/catalog';
import {
  EVENT_PACKAGES,
  OCCASION_LABELS,
  getPackageBySlug,
  type PackageOccasion,
} from '@/lib/packages/catalog';

type ShopProduct = DrinkProduct & {
  tasteNote?: string | null;
  onHand?: number;
  available?: number;
  lowStock?: boolean;
  rating?: number;
  ratingCount?: number;
};

type ShopSection = 'bottles' | 'packages';

type SortKey = 'recommended' | 'price-asc' | 'price-desc' | 'name';

const SORT_OPTIONS: { key: SortKey; label: string; short: string }[] = [
  { key: 'recommended', label: 'Recommended', short: 'Recommended' },
  { key: 'price-asc', label: 'Price — low to high', short: 'Price ↑' },
  { key: 'price-desc', label: 'Price — high to low', short: 'Price ↓' },
  { key: 'name', label: 'Name A–Z', short: 'A–Z' },
];

const ABV_BANDS = [
  { key: '0', label: '0% — non-alcoholic', min: 0, max: 0 },
  { key: 'under5', label: 'Under 5%', min: 0.01, max: 4.99 },
  { key: '5-20', label: '5–20%', min: 5, max: 20 },
  { key: '20-40', label: '20–40%', min: 20.01, max: 39.99 },
  { key: '40plus', label: '40% and up', min: 40, max: 100 },
] as const;

type AbvBandKey = (typeof ABV_BANDS)[number]['key'];

const SELECT_CLASS =
  'w-full appearance-none rounded-lg border border-obsidian/10 bg-white py-1.5 pl-8 pr-7 font-wordmark text-[13px] font-semibold tracking-[0.1em] text-obsidian focus:border-ember focus:ring-0';

/** Collapse catalog volumes into the shopper-facing size options. */
function sizeBucket(volume: string): string {
  const raw = volume.trim();
  const upper = raw.toUpperCase();
  if (/×|\bx\b|bottles?/i.test(raw)) return 'Packs';
  if (upper === '33CL') return '33CL';
  if (upper === '70CL') return '70CL';
  if (upper === '75CL') return '75CL';
  return raw || 'Other';
}

const SIZE_ORDER = ['33CL', '70CL', '75CL', 'Packs'];

function parseSection(raw: string | null): ShopSection {
  if (raw === 'packages') return raw;
  return 'bottles';
}

export default function ShopCatalog() {
  const router = useRouter();
  const params = useSearchParams();
  const { count } = useCart();
  const initialCat = params.get('category') as DrinkCategory | null;
  const initialQ = params.get('q') || '';
  const selectedPkg = params.get('pkg');

  const [query, setQuery] = useState(initialQ);
  const [section, setSection] = useState<ShopSection>(() => parseSection(params.get('section')));
  const [category, setCategory] = useState<DrinkCategory | 'all'>(
    initialCat && CATEGORIES.includes(initialCat) ? initialCat : 'all'
  );
  const [packageOccasion, setPackageOccasion] = useState<PackageOccasion>(() => {
    const slug = params.get('pkg');
    return getPackageBySlug(slug || '')?.occasion ?? 'party';
  });
  const [products, setProducts] = useState<ShopProduct[]>(DRINKS);
  const [sort, setSort] = useState<SortKey>(() => {
    const raw = params.get('sort');
    return SORT_OPTIONS.some((o) => o.key === raw) ? (raw as SortKey) : 'recommended';
  });
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [abvBand, setAbvBand] = useState<AbvBandKey | ''>('');
  const [size, setSize] = useState<string>('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setSection(parseSection(params.get('section')));
  }, [params]);

  useEffect(() => {
    if (params.get('plan') === '1' || params.get('section') === 'plan') {
      router.replace('/party-planner');
    }
  }, [params, router]);

  useEffect(() => {
    const slug = params.get('pkg');
    if (slug) {
      const pkg = getPackageBySlug(slug);
      if (pkg) setPackageOccasion(pkg.occasion);
    }
  }, [params]);

  useEffect(() => {
    fetch('/api/shop/catalog')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.products) && data.products.length) {
          setProducts(data.products);
        }
      })
      .catch(() => {});
  }, []);

  function pushShop(next: { section?: ShopSection; category?: DrinkCategory | 'all'; q?: string; pkg?: string | null; sort?: SortKey }) {
    const q = new URLSearchParams();
    const sec = next.section ?? section;
    if (sec !== 'bottles') q.set('section', sec);
    const cat = next.category ?? category;
    if (sec === 'bottles' && cat !== 'all') q.set('category', cat);
    const search = next.q ?? query;
    if (search.trim()) q.set('q', search.trim());
    if (next.pkg) q.set('pkg', next.pkg);
    const nextSort = next.sort ?? sort;
    if (nextSort !== 'recommended') q.set('sort', nextSort);
    const suffix = q.toString();
    router.replace(suffix ? `/shop?${suffix}` : '/shop', { scroll: false });
  }

  function goSection(next: ShopSection) {
    setSection(next);
    pushShop({ section: next, pkg: null });
  }

  function goCategory(cat: DrinkCategory | 'all') {
    setCategory(cat);
    setSection('bottles');
    pushShop({ section: 'bottles', category: cat, pkg: null });
  }

  function goPackageOccasion(occ: PackageOccasion) {
    setPackageOccasion(occ);
    setSection('packages');
    pushShop({ section: 'packages', pkg: null });
  }

  /**
   * Search runs over every field a shopper might type — including the category name itself, so
   * "whisky" finds the whiskies even from the All tab.
   */
  const matchesQuery = (d: ShopProduct, q: string) =>
    d.name.toLowerCase().includes(q) ||
    (d.brand?.toLowerCase().includes(q) ?? false) ||
    (d.origin?.toLowerCase().includes(q) ?? false) ||
    d.tagline.toLowerCase().includes(q) ||
    d.description.toLowerCase().includes(q) ||
    d.category.includes(q) ||
    CATEGORY_LABELS[d.category].toLowerCase().includes(q);

  const searchable = useMemo(() => products.filter((d) => !d.partyPack), [products]);
  const q = query.trim().toLowerCase();

  /** Every bottle matching the query, ignoring the category tab. */
  const globalMatches = useMemo(
    () => (q ? searchable.filter((d) => matchesQuery(d, q)) : searchable),
    [searchable, q]
  );

  /** What the grid shows: the query narrowed to the chosen category. */
  const filtered = useMemo(
    () => (category === 'all' ? globalMatches : globalMatches.filter((d) => d.category === category)),
    [globalMatches, category]
  );

  /**
   * Hits the current category tab is hiding. Searching stays scoped to the selected category — that
   * is what picking a category means — but we never let a match disappear silently: this powers a
   * one-tap widen to all drinks.
   */
  const hiddenElsewhere = q && category !== 'all' ? globalMatches.length - filtered.length : 0;

  /** The most expensive bottle in view — the ceiling for the price slider. */
  const priceCeiling = useMemo(
    () => filtered.reduce((max, d) => Math.max(max, d.priceNgn), 0),
    [filtered]
  );

  const availableSizes = useMemo(() => {
    const found = new Set(filtered.map((d) => sizeBucket(d.volume)));
    const ordered = SIZE_ORDER.filter((s) => found.has(s));
    const rest = [...found].filter((s) => !SIZE_ORDER.includes(s)).sort();
    const list = [...ordered, ...rest];
    if (size && !list.includes(size)) list.push(size);
    return list;
  }, [filtered, size]);

  const refined = useMemo(() => {
    let list = filtered;
    if (maxPrice != null) list = list.filter((d) => d.priceNgn <= maxPrice);
    if (abvBand) {
      const band = ABV_BANDS.find((b) => b.key === abvBand);
      if (band) list = list.filter((d) => d.abv >= band.min && d.abv <= band.max);
    }
    if (size) {
      list = list.filter((d) => sizeBucket(d.volume) === size);
    }

    const sorted = [...list];
    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => a.priceNgn - b.priceNgn);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.priceNgn - a.priceNgn);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // "Recommended": featured first, then deals, then the catalog's own order.
        sorted.sort(
          (a, b) => Number(!!b.featured) - Number(!!a.featured) || Number(!!b.deal) - Number(!!a.deal)
        );
    }
    return sorted;
  }, [filtered, maxPrice, abvBand, size, sort]);

  const activeFilterCount =
    (maxPrice != null ? 1 : 0) + (abvBand ? 1 : 0) + (size ? 1 : 0);

  function resetFilters() {
    setMaxPrice(null);
    setAbvBand('');
    setSize('');
    setSort('recommended');
    setCategory('all');
    setQuery('');
    setFiltersOpen(false);
    router.replace('/shop', { scroll: false });
  }

  const hasRefinements = activeFilterCount > 0 || sort !== 'recommended' || category !== 'all' || Boolean(q);

  const recommended = products.filter((d) => d.featured && !d.partyPack);
  const deals = products.filter((d) => d.deal && !d.partyPack);
  /**
   * Rails follow the category tab instead of vanishing the moment one is picked — browsing
   * "Whisky" should still surface the recommended whiskies. They stand down only when the shopper
   * is actively searching or has narrowed with the filter panel, where a rail of unfiltered
   * bottles would contradict what the grid is showing.
   */
  const showRails = section === 'bottles' && !q && activeFilterCount === 0;

  const inCategory = (list: ShopProduct[]) =>
    category === 'all' ? list : list.filter((d) => d.category === category);
  const railRecommended = inCategory(recommended);
  const railDeals = inCategory(deals);

  const sectionTitle = section === 'packages' ? 'Event packages' : 'Shop drinks';

  return (
    <div
      className={`w-full max-w-[1600px] mx-auto px-2.5 sm:px-4 lg:px-5 pt-3 sm:pt-6 ${
        count > 0 ? 'pb-32 md:pb-20' : 'pb-14 sm:pb-20'
      }`}
    >
      <header className="mb-3 flex flex-col gap-2 sm:mb-7 sm:gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="font-wordmark text-xl sm:text-3xl md:text-4xl text-obsidian">{sectionTitle}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Link
            href="/shop/refer-and-earn"
            className="inline-flex items-center gap-1.5 rounded-full border border-ember/20 bg-ember/[0.06] px-3 py-2 text-xs font-bold text-ember hover:bg-ember/[0.1]"
          >
            <Users size={14} /> Refer &amp; earn
          </Link>
          <GuestCardStrip variant="inline" className="hidden shrink-0 w-full xl:block xl:w-auto xl:max-w-[280px]" />
        </div>
      </header>

      {/* Shop modes are tabs. Package occasions are views, not filters. */}
      <div className="mb-3 space-y-2.5 sm:mb-5 sm:space-y-3">
        {section === 'bottles' && (
          <label className="relative flex min-h-11 items-center rounded-xl border border-obsidian/10 bg-white px-3 shadow-sm lg:hidden">
            <ListFilter size={17} className="mr-2.5 shrink-0 text-ember" />
            <span className="mr-2 text-xs font-black uppercase tracking-[0.12em] text-obsidian/40">Category</span>
            <select
              value={category}
              onChange={(event) => goCategory(event.target.value as DrinkCategory | 'all')}
              aria-label="Choose a bottle category"
              className="select-clean min-w-0 flex-1 border-0 bg-transparent py-2 pl-0 pr-7 text-right text-sm font-semibold text-obsidian focus:ring-0"
            >
              <option value="all">All drinks</option>
              {CATEGORIES.filter((cat) => cat !== 'party-packs').map((cat) => (
                <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
              ))}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3 text-obsidian/45" />
          </label>
        )}
        {section === 'packages' && (
          <div
            className="flex gap-1 overflow-x-auto scrollbar-hide border-b border-obsidian/10"
            role="tablist"
            aria-label="Package occasions"
          >
            {PACKAGE_OCCASION_ORDER.map((occ) => {
              if (!EVENT_PACKAGES.some((p) => p.occasion === occ)) return null;
              return (
                <button
                  key={occ}
                  type="button"
                  role="tab"
                  aria-selected={packageOccasion === occ}
                  onClick={() => goPackageOccasion(occ)}
                  className={`relative shrink-0 px-4 py-3 font-wordmark text-xs sm:text-sm transition-colors ${
                    packageOccasion === occ
                      ? 'text-obsidian'
                      : 'text-obsidian/45 hover:text-obsidian/75'
                  }`}
                >
                  {OCCASION_LABELS[occ]}
                  {packageOccasion === occ && (
                    <span className="absolute inset-x-3 bottom-0 h-0.5 bg-ember" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
        {section === 'bottles' && (
          <>
          <aside
            className="fixed bottom-[5.25rem] top-[10.5rem] z-20 hidden w-72 overflow-hidden rounded-2xl border border-ember/15 bg-paper/95 p-2.5 shadow-[0_12px_35px_rgba(15,15,15,0.08)] backdrop-blur-md lg:flex lg:flex-col xl:w-80"
            style={{ left: 'max(1.25rem, calc((100vw - 1600px) / 2 + 1.25rem))' }}
            aria-label="Browse and refine drinks"
          >
              <div className="mb-1.5 flex items-center justify-between gap-2 px-0.5">
                <p className="font-wordmark text-[13px] font-bold tracking-[0.1em] text-obsidian/70">Browse &amp; filter</p>
                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={!hasRefinements}
                  aria-label="Clear all shop filters"
                  title="Clear all filters"
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-obsidian/10 bg-white text-obsidian/45 transition hover:border-ember/30 hover:text-ember disabled:cursor-default disabled:opacity-30"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
              <p className="mb-1 px-0.5 font-wordmark text-[11px] font-semibold tracking-[0.1em] text-obsidian/40">Category</p>
              <div className="min-h-0 flex-1 rounded-lg bg-white p-1 shadow-sm ring-1 ring-obsidian/[0.06]">
                <div className="flex h-full flex-col justify-evenly gap-0">
                  <SidebarBtn active={category === 'all'} onClick={() => goCategory('all')}>
                    All
                  </SidebarBtn>
                  {CATEGORIES.filter((c) => c !== 'party-packs').map((cat) => (
                    <SidebarBtn
                      key={cat}
                      active={category === cat}
                      onClick={() => goCategory(cat)}
                      icon={<CategoryIcon category={cat} className="w-4 h-4 shrink-0" />}
                    >
                      {CATEGORY_LABELS[cat]}
                    </SidebarBtn>
                  ))}
                </div>
              </div>

              <div className="mt-2 shrink-0 space-y-2">
                <div>
                  <p className="mb-1 px-0.5 font-wordmark text-[11px] font-semibold tracking-[0.1em] text-obsidian/70">Sort</p>
                  <label className="relative block">
                    <span className="sr-only">Sort drinks by</span>
                    <ArrowUpDown
                      size={13}
                      aria-hidden
                      className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-obsidian/45"
                    />
                    <select
                      value={sort}
                      onChange={(e) => {
                        const next = e.target.value as SortKey;
                        setSort(next);
                        pushShop({ sort: next });
                      }}
                      className={SELECT_CLASS}
                    >
                      {SORT_OPTIONS.map((o) => (
                        <option key={o.key} value={o.key}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={13}
                      aria-hidden
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-obsidian/45"
                    />
                  </label>
                </div>

                <div>
                  <p className="mb-1 px-0.5 font-wordmark text-[11px] font-semibold tracking-[0.1em] text-obsidian/70">Alcohol %</p>
                  <label className="relative block">
                    <span className="sr-only">Filter by alcohol percentage</span>
                    <Percent
                      size={13}
                      aria-hidden
                      className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-obsidian/45"
                    />
                    <select
                      value={abvBand}
                      onChange={(e) => setAbvBand((e.target.value || '') as AbvBandKey | '')}
                      className={SELECT_CLASS}
                    >
                      <option value="">Any strength</option>
                      {ABV_BANDS.map((band) => (
                        <option key={band.key} value={band.key}>
                          {band.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={13}
                      aria-hidden
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-obsidian/45"
                    />
                  </label>
                </div>

                <div>
                  <p className="mb-1 px-0.5 font-wordmark text-[11px] font-semibold tracking-[0.1em] text-obsidian/70">Size</p>
                  <label className="relative block">
                    <span className="sr-only">Filter by bottle size</span>
                    <ListFilter
                      size={13}
                      aria-hidden
                      className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-obsidian/45"
                    />
                    <select
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className={SELECT_CLASS}
                    >
                      <option value="">Any size</option>
                      {availableSizes.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={13}
                      aria-hidden
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-obsidian/45"
                    />
                  </label>
                </div>

                <div>
                  <p className="mb-1 px-0.5 font-wordmark text-[11px] font-semibold tracking-[0.1em] text-obsidian/70">Max price</p>
                  <div className="rounded-lg bg-white px-2.5 py-2 shadow-sm ring-1 ring-obsidian/[0.06]">
                    <input
                      type="range"
                      min={0}
                      max={priceCeiling || 1}
                      step={1000}
                      value={maxPrice ?? priceCeiling}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setMaxPrice(v >= priceCeiling ? null : v);
                      }}
                      className="w-full accent-ember"
                      aria-label="Maximum price"
                    />
                    <p className="mt-0.5 font-wordmark text-[12px] font-semibold leading-tight tracking-[0.08em] text-obsidian/55">
                      {maxPrice == null ? 'Any price' : `Up to ${formatNgn(maxPrice)}`}
                    </p>
                  </div>
                </div>
              </div>
          </aside>
          <div className="hidden shrink-0 lg:block lg:w-72 xl:w-80" aria-hidden />
          </>
        )}

        <div className="flex-1 min-w-0">
          <div
            className="mb-3 grid grid-cols-2 gap-1 rounded-xl border border-obsidian/[0.08] bg-white p-1 shadow-sm sm:mb-4 sm:flex sm:w-fit"
            role="tablist"
            aria-label="Shop view"
          >
            <ChipBtn active={section === 'bottles'} onClick={() => goSection('bottles')}>
              Bottles
            </ChipBtn>
            <ChipBtn active={section === 'packages'} onClick={() => goSection('packages')}>
              Packages
            </ChipBtn>
          </div>

          {section === 'packages' && (
            <PackageBrowse
              selectedSlug={selectedPkg}
              occasion={packageOccasion}
              onOccasionChange={setPackageOccasion}
              hideSidebar
            />
          )}

          {section === 'bottles' && (
            <>
              <div className="mb-3 sm:mb-5">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian/35" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      category === 'all'
                        ? 'Search all drinks — whisky, cognac, wine…'
                        : `Search in ${CATEGORY_LABELS[category]}…`
                    }
                    className="w-full rounded-xl pl-10 pr-24 py-2.5 sm:py-3 bg-white border border-obsidian/10 focus:border-ember focus:ring-0 text-base"
                  />
                  {/* The tab the search is confined to, shown inside the field so the scope is never a surprise. */}
                  {category !== 'all' && (
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 max-w-[40%] truncate rounded-full bg-ember/[0.08] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-ember ring-1 ring-ember/20">
                      {CATEGORY_LABELS[category]}
                    </span>
                  )}
                </div>

                {/* Matches the category tab is hiding — one tap widens to the whole shop. */}
                {hiddenElsewhere > 0 && (
                  <button
                    type="button"
                    onClick={() => goCategory('all')}
                    className="mt-2 flex w-full items-center justify-between gap-3 rounded-xl border border-ember/20 bg-ember/[0.05] px-3.5 py-2.5 text-left transition-colors hover:bg-ember/[0.09]"
                  >
                    <span className="text-sm text-obsidian/75">
                      <strong className="font-bold text-obsidian">{hiddenElsewhere}</strong> more match
                      {hiddenElsewhere === 1 ? '' : 'es'} outside {CATEGORY_LABELS[category]}
                    </span>
                    <span className="shrink-0 text-[11px] font-black uppercase tracking-[0.12em] text-ember">
                      Search all →
                    </span>
                  </button>

                )}
              </div>

              {/* Mobile/tablet filters — desktop lives in the sticky left bar. */}
              <div className="mb-4 rounded-2xl border border-obsidian/[0.07] bg-white p-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)] lg:hidden">
                <div className="flex items-center gap-2">
                  <h2 className="min-w-0 flex-1 truncate pl-1.5 text-sm font-bold text-obsidian sm:text-base">
                    {!q && activeFilterCount === 0
                      ? category === 'all'
                        ? 'All drinks'
                        : `All ${CATEGORY_LABELS[category].toLowerCase()}`
                      : `${refined.length} result${refined.length === 1 ? '' : 's'}`}
                    {refined.length !== filtered.length && (
                      <span className="ml-1.5 font-normal text-obsidian/40">of {filtered.length}</span>
                    )}
                  </h2>

                  <button
                    type="button"
                    onClick={() => setFiltersOpen((v) => !v)}
                    aria-expanded={filtersOpen}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition-colors ${
                      activeFilterCount > 0 || filtersOpen
                        ? 'border-ember/30 bg-ember/[0.07] text-ember'
                        : 'border-obsidian/12 text-obsidian/60 hover:border-obsidian/25 hover:text-obsidian'
                    }`}
                  >
                    <SlidersHorizontal size={14} />
                    <span className="hidden sm:inline">Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="grid h-4 min-w-4 place-items-center rounded-full bg-ember px-1 text-[10px] font-black text-white">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  {hasRefinements && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      aria-label="Clear all shop filters"
                      title="Clear all filters"
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ember/25 bg-ember/[0.06] text-ember transition hover:bg-ember/[0.12]"
                    >
                      <RotateCcw size={14} />
                    </button>
                  )}

                  <label className="relative shrink-0">
                    <span className="sr-only">Sort drinks by</span>
                    <ArrowUpDown
                      size={14}
                      aria-hidden
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-obsidian/45"
                    />
                    <select
                      value={sort}
                      onChange={(e) => {
                        const next = e.target.value as SortKey;
                        setSort(next);
                        pushShop({ sort: next });
                      }}
                      className="appearance-none rounded-full border border-obsidian/12 bg-white py-2 pl-8 pr-8 text-xs font-bold text-obsidian focus:border-ember focus:ring-0"
                    >
                      {SORT_OPTIONS.map((o) => (
                        <option key={o.key} value={o.key}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={13}
                      aria-hidden
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-obsidian/45"
                    />
                  </label>
                </div>

                {filtersOpen && (
                  <div className="mt-2 grid gap-3 border-t border-obsidian/[0.07] px-1.5 pt-3 sm:grid-cols-2">
                    <div>
                      <p className="mb-1.5 font-wordmark text-[11px] font-semibold tracking-[0.1em] text-obsidian/40">
                        Max price
                      </p>
                      <input
                        type="range"
                        min={0}
                        max={priceCeiling || 1}
                        step={1000}
                        value={maxPrice ?? priceCeiling}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setMaxPrice(v >= priceCeiling ? null : v);
                        }}
                        className="w-full accent-ember"
                        aria-label="Maximum price"
                      />
                      <p className="mt-0.5 font-wordmark text-[12px] font-semibold text-obsidian/55">
                        {maxPrice == null ? 'Any price' : `Up to ${formatNgn(maxPrice)}`}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1.5 font-wordmark text-[11px] font-semibold tracking-[0.1em] text-obsidian/40">
                        Alcohol %
                      </p>
                      <label className="relative block">
                        <span className="sr-only">Filter by alcohol percentage</span>
                        <Percent
                          size={13}
                          aria-hidden
                          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-obsidian/45"
                        />
                        <select
                          value={abvBand}
                          onChange={(e) => setAbvBand((e.target.value || '') as AbvBandKey | '')}
                          className={SELECT_CLASS}
                        >
                          <option value="">Any strength</option>
                          {ABV_BANDS.map((band) => (
                            <option key={band.key} value={band.key}>
                              {band.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={13}
                          aria-hidden
                          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-obsidian/45"
                        />
                      </label>
                    </div>
                    <div>
                      <p className="mb-1.5 font-wordmark text-[11px] font-semibold tracking-[0.1em] text-obsidian/40">
                        Size
                      </p>
                      <label className="relative block">
                        <span className="sr-only">Filter by bottle size</span>
                        <ListFilter
                          size={13}
                          aria-hidden
                          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-obsidian/45"
                        />
                        <select
                          value={size}
                          onChange={(e) => setSize(e.target.value)}
                          className={SELECT_CLASS}
                        >
                          <option value="">Any size</option>
                          {availableSizes.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={13}
                          aria-hidden
                          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-obsidian/45"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <h2 className="mb-4 hidden truncate text-sm font-bold text-obsidian lg:block sm:text-base">
                {!q && activeFilterCount === 0
                  ? category === 'all'
                    ? 'All drinks'
                    : `All ${CATEGORY_LABELS[category].toLowerCase()}`
                  : `${refined.length} result${refined.length === 1 ? '' : 's'}`}
                {refined.length !== filtered.length && (
                  <span className="ml-1.5 font-normal text-obsidian/40">of {filtered.length}</span>
                )}
              </h2>

              {showRails && (
                <>
                  <Rail
                    title={category === 'all' ? 'Recommended' : `Recommended ${CATEGORY_LABELS[category].toLowerCase()}`}
                    products={railRecommended}
                  />
                  <Rail title="Hot deals" products={railDeals} />
                </>
              )}

              <div className="mt-2">
                {refined.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-obsidian/15 px-5 py-10 text-center">
                    <p className="text-body text-obsidian/50">No drinks match these filters.</p>
                    {hasRefinements && (
                      <button type="button" onClick={resetFilters} className="mt-3 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.12em] text-ember hover:underline">
                        <RotateCcw size={13} /> Reset results
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-5 py-1">
                    {refined.map((p) => (
                      <ProductCard key={p.slug} product={p} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <ShopCartBar />
    </div>
  );
}

function ChipBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`min-w-0 rounded-lg px-2 py-2 text-xs font-semibold transition-colors sm:shrink-0 sm:rounded-full sm:px-4 sm:text-sm ${
        active
          ? 'bg-obsidian text-white'
          : 'bg-white text-obsidian/70 ring-1 ring-obsidian/10 hover:text-obsidian'
      }`}
    >
      {children}
    </button>
  );
}

function SidebarBtn({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex w-full items-center gap-2 rounded-md px-2 py-1 font-wordmark text-[13px] tracking-[0.1em] transition-all duration-150 ${
        active
          ? 'bg-ember/[0.08] font-bold text-ember ring-1 ring-ember/25'
          : 'font-medium text-obsidian/65 hover:bg-obsidian/[0.04] hover:text-obsidian active:scale-[0.98]'
      }`}
    >
      {icon}
      <span className="truncate">{children}</span>
    </button>
  );
}

function Rail({ title, products }: { title: string; products: ShopProduct[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollState() {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => ro.disconnect();
  }, [products]);

  function scrollByPage(direction: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.max(el.clientWidth * 0.75, 200);
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
  }

  if (products.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="text-xl sm:text-2xl font-bold text-obsidian mb-3">{title}</h2>

      {/* Arrows sit on the edge they scroll toward, overlaying the rail itself. */}
      <div className="relative group/rail">
        <div
          ref={scrollerRef}
          onScroll={updateScrollState}
          className="overflow-x-auto scroll-smooth scrollbar-hide snap-x snap-mandatory"
        >
          <div className="flex gap-4 pb-2">
            {products.map((p) => (
              <div key={p.slug} className="shrink-0 w-[172px] sm:w-[188px] snap-start">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>

        {/* Fade masks so cards dissolve under the arrows rather than being clipped. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute left-0 top-0 bottom-2 w-16 bg-gradient-to-r from-paper to-transparent transition-opacity duration-200 ${
            canScrollLeft ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-paper to-transparent transition-opacity duration-200 ${
            canScrollRight ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <RailArrow side="left" title={title} show={canScrollLeft} onClick={() => scrollByPage(-1)} />
        <RailArrow side="right" title={title} show={canScrollRight} onClick={() => scrollByPage(1)} />
      </div>
    </div>
  );
}

function RailArrow({
  side,
  title,
  show,
  onClick,
}: {
  side: 'left' | 'right';
  title: string;
  show: boolean;
  onClick: () => void;
}) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
      aria-label={`Scroll ${title} ${side}`}
      className={`absolute top-1/2 -translate-y-1/2 z-10 grid place-items-center w-10 h-10 rounded-full
        bg-white/95 backdrop-blur ring-1 ring-obsidian/10 text-obsidian/70 shadow-[0_4px_16px_rgba(0,0,0,0.10)]
        transition-all duration-200
        hover:bg-white hover:text-ember hover:ring-ember/30 hover:shadow-[0_6px_20px_rgba(0,0,0,0.16)]
        active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember
        ${side === 'left' ? 'left-1 sm:-left-4' : 'right-1 sm:-right-4'}
        ${show ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    >
      <Icon size={20} strokeWidth={2.5} />
    </button>
  );
}
