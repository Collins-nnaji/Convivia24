'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  Search,
  SlidersHorizontal,
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

type SortKey = 'recommended' | 'rating' | 'price-asc' | 'price-desc' | 'name';

const SORT_OPTIONS: { key: SortKey; label: string; short: string }[] = [
  { key: 'recommended', label: 'Recommended', short: 'Recommended' },
  { key: 'rating', label: 'Customer rating', short: 'Top rated' },
  { key: 'price-asc', label: 'Price — low to high', short: 'Price ↑' },
  { key: 'price-desc', label: 'Price — high to low', short: 'Price ↓' },
  { key: 'name', label: 'Name A–Z', short: 'A–Z' },
];

/** Minimum-rating filter, the way most shopping apps present it. */
const RATING_FILTERS: { value: number; label: string }[] = [
  { value: 0, label: 'Any rating' },
  { value: 4, label: '4★ & up' },
  { value: 3, label: '3★ & up' },
];

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
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
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

  const refined = useMemo(() => {
    let list = filtered;
    if (minRating > 0) list = list.filter((d) => (d.rating ?? 0) >= minRating);
    if (inStockOnly) list = list.filter((d) => d.available == null || d.available > 0);
    if (maxPrice != null) list = list.filter((d) => d.priceNgn <= maxPrice);

    const sorted = [...list];
    switch (sort) {
      case 'rating':
        // Unrated bottles sink rather than tying at zero with genuinely poor ones, and a
        // higher review count breaks ties so one five-star review can't top the list.
        sorted.sort(
          (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.ratingCount ?? 0) - (a.ratingCount ?? 0)
        );
        break;
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
  }, [filtered, minRating, inStockOnly, maxPrice, sort]);

  const activeFilterCount = (minRating > 0 ? 1 : 0) + (inStockOnly ? 1 : 0) + (maxPrice != null ? 1 : 0);

  function resetFilters() {
    setMinRating(0);
    setInStockOnly(false);
    setMaxPrice(null);
  }

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
        <GuestCardStrip variant="inline" className="hidden shrink-0 w-full sm:block sm:w-auto sm:max-w-[280px]" />
      </header>

      {/* Shop modes are tabs. Package occasions are views, not filters. */}
      <div className="mb-3 space-y-2.5 sm:mb-5 sm:space-y-3">
        <div className="grid grid-cols-2 gap-1.5 sm:flex sm:gap-2" role="tablist" aria-label="Shop view">
          <ChipBtn active={section === 'bottles'} onClick={() => goSection('bottles')}>
            Bottles
          </ChipBtn>
          <ChipBtn active={section === 'packages'} onClick={() => goSection('packages')}>
            Packages
          </ChipBtn>
        </div>
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
          <aside
            className="hidden lg:block lg:sticky lg:top-[4.75rem] lg:self-start shrink-0 lg:w-72 xl:w-80 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto rounded-2xl bg-ember/[0.06] border border-ember/15 p-3 sm:p-4"
            aria-label="Browse and refine drinks"
          >
              <p className="mb-2.5 px-1 text-xs font-bold uppercase tracking-[0.14em] text-obsidian/70">Category</p>
              <div className="rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-obsidian/[0.06]">
                <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible scrollbar-hide pb-0.5 lg:pb-0">
                  <SidebarBtn active={category === 'all'} onClick={() => goCategory('all')}>
                    All
                  </SidebarBtn>
                  {CATEGORIES.filter((c) => c !== 'party-packs').map((cat) => (
                    <SidebarBtn
                      key={cat}
                      active={category === cat}
                      onClick={() => goCategory(cat)}
                      icon={<CategoryIcon category={cat} className="w-[18px] h-[18px] shrink-0" />}
                    >
                      {CATEGORY_LABELS[cat]}
                    </SidebarBtn>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="mb-2 px-1 text-xs font-bold uppercase tracking-[0.14em] text-obsidian/70">Sort</p>
                  <label className="relative block">
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
                      className="w-full appearance-none rounded-xl border border-obsidian/10 bg-white py-2.5 pl-9 pr-9 text-sm font-semibold text-obsidian focus:border-ember focus:ring-0"
                    >
                      {SORT_OPTIONS.map((o) => (
                        <option key={o.key} value={o.key}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      aria-hidden
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-obsidian/45"
                    />
                  </label>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-2 px-1">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-obsidian/70">Filters</p>
                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="text-[10px] font-black uppercase tracking-[0.12em] text-ember hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="space-y-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-obsidian/[0.06]">
                    <div>
                      <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/40">
                        Customer rating
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {RATING_FILTERS.map((r) => (
                          <button
                            key={r.value}
                            type="button"
                            onClick={() => setMinRating(r.value)}
                            className={`rounded-full border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                              minRating === r.value
                                ? 'border-ember bg-ember text-white'
                                : 'border-obsidian/12 text-obsidian/60 hover:border-ember/40 hover:text-ember'
                            }`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/40">
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
                      <p className="mt-0.5 text-[11px] font-semibold text-obsidian/55">
                        {maxPrice == null ? 'Any price' : `Up to ${formatNgn(maxPrice)}`}
                      </p>
                    </div>

                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="h-4 w-4 rounded border-obsidian/25 text-ember focus:ring-ember"
                      />
                      <span className="text-xs font-semibold text-obsidian/70">In stock only</span>
                    </label>
                  </div>
                </div>
              </div>
          </aside>
        )}

        <div className="flex-1 min-w-0">
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
                  <div className="mt-2 grid gap-3 border-t border-obsidian/[0.07] px-1.5 pt-3 sm:grid-cols-3">
                    <div>
                      <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/40">
                        Customer rating
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {RATING_FILTERS.map((r) => (
                          <button
                            key={r.value}
                            type="button"
                            onClick={() => setMinRating(r.value)}
                            className={`rounded-full border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                              minRating === r.value
                                ? 'border-ember bg-ember text-white'
                                : 'border-obsidian/12 text-obsidian/60 hover:border-ember/40 hover:text-ember'
                            }`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/40">
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
                      <p className="mt-0.5 text-[11px] font-semibold text-obsidian/55">
                        {maxPrice == null ? 'Any price' : `Up to ${formatNgn(maxPrice)}`}
                      </p>
                    </div>

                    <div className="flex flex-col justify-between gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={inStockOnly}
                          onChange={(e) => setInStockOnly(e.target.checked)}
                          className="h-4 w-4 rounded border-obsidian/25 text-ember focus:ring-ember"
                        />
                        <span className="text-xs font-semibold text-obsidian/70">In stock only</span>
                      </label>
                      {activeFilterCount > 0 && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="self-start text-[11px] font-black uppercase tracking-[0.12em] text-ember hover:underline"
                        >
                          Clear filters
                        </button>
                      )}
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
                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="mt-3 text-[11px] font-black uppercase tracking-[0.12em] text-ember hover:underline"
                      >
                        Clear filters
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
      className={`shrink-0 lg:shrink inline-flex w-full items-center gap-2.5 rounded-lg px-3 py-3 text-left text-[15px] font-medium leading-tight transition-all duration-150 ${
        active
          ? 'bg-ember/[0.08] font-semibold text-obsidian ring-1 ring-ember/25'
          : 'text-obsidian/80 hover:bg-obsidian/[0.04] hover:text-obsidian active:scale-[0.98]'
      }`}
    >
      {icon}
      <span className="whitespace-nowrap">{children}</span>
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
