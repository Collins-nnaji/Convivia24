'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, Search, SlidersHorizontal, Star, X } from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';
import ShopCartBar from '@/components/shop/ShopCartBar';
import PackageBrowse, { PACKAGE_OCCASION_ORDER } from '@/components/packages/PackageBrowse';
import { CATEGORY_LABELS, type DrinkCategory } from '@/lib/drinks/catalog';
import { EVENT_PACKAGES, OCCASION_LABELS, getPackageBySlug, type PackageOccasion } from '@/lib/packages/catalog';
import {
  EMPTY_FILTERS,
  PER_PAGE_OPTIONS,
  SORTS,
  activeFilterCount,
  appliedChips,
  filtersFromParams,
  paramsFromFilters,
  ratingCounts,
  searchCatalog,
  type FacetGroup,
  type FacetKey,
  type FilterState,
  type SortKey,
} from '@/lib/storefront/facets';
import { loadBestSellers, useCatalog } from '@/lib/shop/use-catalog';

type ShopSection = 'bottles' | 'packages';

/** One line under the page title for each department. */
const CATEGORY_INTROS: Partial<Record<DrinkCategory, string>> = {
  champagne: 'From Moët at the table to Veuve for the toast — bubbles for weddings, birthdays and big wins.',
  whisky: 'Single malts, blends and Irish whiskey — sipping bottles and crowd favourites.',
  cognac: 'Hennessy, Martell, Rémy Martin — VS for the party, VSOP and XO for the moment.',
  wines: 'Reds, whites and rosé for dinners, gifting and the owambe table.',
  spirits: 'Vodka, tequila, gin and rum — the backbone of every good bar.',
  cocktails: 'Ready-to-drink cocktails — chill, open, pour.',
  mixers: 'Tonics, sodas and soft drinks to round out the order.',
};

/** Groups open by default on desktop; the rest start folded. */
const OPEN_BY_DEFAULT: FacetKey[] = ['offer', 'type', 'price', 'brand'];
const COLLAPSED_LIMIT = 8;

export default function ShopCatalog() {
  const router = useRouter();
  const params = useSearchParams();
  const { products } = useCatalog();
  const [bestSellers, setBestSellers] = useState<string[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const gridTop = useRef<HTMLDivElement>(null);

  const section: ShopSection = params.get('section') === 'packages' ? 'packages' : 'bottles';
  const selectedPkg = params.get('pkg');
  const [packageOccasion, setPackageOccasion] = useState<PackageOccasion>(
    () => getPackageBySlug(selectedPkg || '')?.occasion ?? 'party'
  );

  // The URL is the state: every filter combination is a shareable link and Back works.
  const filters = useMemo(() => filtersFromParams(new URLSearchParams(params.toString())), [params]);

  useEffect(() => {
    if (params.get('plan') === '1' || params.get('section') === 'plan') router.replace('/party-planner');
  }, [params, router]);

  useEffect(() => {
    const pkg = getPackageBySlug(selectedPkg || '');
    if (pkg) setPackageOccasion(pkg.occasion);
  }, [selectedPkg]);

  useEffect(() => {
    loadBestSellers().then(setBestSellers);
  }, []);

  // Party packs live in their own tab, whether flagged or only categorised as such.
  const bottles = useMemo(
    () => products.filter((p) => !p.partyPack && p.category !== 'party-packs' && !p.sample),
    [products]
  );
  const result = useMemo(() => searchCatalog(bottles, filters, { bestSellers }), [bottles, filters, bestSellers]);
  const ratings = useMemo(() => ratingCounts(bottles, filters, { bestSellers }), [bottles, filters, bestSellers]);
  const chips = appliedChips(filters);
  const nActive = activeFilterCount(filters);

  function apply(next: FilterState, opts: { keepPage?: boolean; scroll?: boolean } = {}) {
    const state = opts.keepPage ? next : { ...next, page: 1 };
    const qs = paramsFromFilters(state);
    router.replace(qs ? `/shop?${qs}` : '/shop', { scroll: false });
    if (opts.scroll) gridTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const toggle = (key: FacetKey, value: string) => {
    const list = filters[key];
    apply({ ...filters, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  };
  const removeChip = (key: FacetKey | 'rating' | 'q', value: string) => {
    if (key === 'q') apply({ ...filters, q: '' });
    else if (key === 'rating') apply({ ...filters, rating: 0 });
    else apply({ ...filters, [key]: filters[key].filter((v) => v !== value) });
  };
  const clearAll = () => apply({ ...EMPTY_FILTERS, sort: filters.sort, per: filters.per });
  const setPage = (page: number) => apply({ ...filters, page }, { keepPage: true, scroll: true });

  function goSection(next: ShopSection) {
    router.replace(next === 'packages' ? '/shop?section=packages' : '/shop', { scroll: false });
  }

  const singleType = filters.type.length === 1 ? (filters.type[0] as DrinkCategory) : null;
  const title = filters.q.trim()
    ? `Results for “${filters.q.trim()}”`
    : singleType
      ? CATEGORY_LABELS[singleType] ?? 'Shop'
      : filters.offer.length === 1 && filters.offer[0] === 'on-offer'
        ? 'Deals'
        : filters.offer.length === 1 && filters.offer[0] === 'new'
          ? 'New in'
          : section === 'packages'
            ? 'Party packs'
            : 'All drinks';
  const intro = singleType && !filters.q ? CATEGORY_INTROS[singleType] : undefined;

  const filterPanel = (
    <FilterPanel
      groups={result.groups}
      filters={filters}
      ratings={ratings}
      onToggle={toggle}
      onRating={(min) => apply({ ...filters, rating: filters.rating === min ? 0 : min })}
      onQuery={(q) => apply({ ...filters, q })}
    />
  );

  return (
    <div className="mx-auto w-full max-w-[1600px] px-3 pb-24 pt-4 sm:px-4 sm:pt-6 lg:px-5">
      <nav aria-label="Breadcrumb" className="mb-3 text-[13px] text-obsidian/55">
        <Link href="/" className="hover:text-obsidian">Home</Link>
        <span className="mx-2 text-obsidian/25">/</span>
        <Link href="/shop" className="hover:text-obsidian">Shop</Link>
        {title !== 'All drinks' && (
          <>
            <span className="mx-2 text-obsidian/25">/</span>
            <span className="text-obsidian">{title}</span>
          </>
        )}
      </nav>

      <header className="mb-5 flex flex-col gap-4 sm:mb-7 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h1 className="font-serif text-[2rem] font-light leading-tight tracking-tight text-obsidian sm:text-[2.6rem]">{title}</h1>
          {intro && <p className="mt-2 text-[15px] text-obsidian/60">{intro}</p>}
        </div>
        <div className="inline-flex w-fit rounded-full bg-obsidian/[0.05] p-1" role="tablist" aria-label="Shop view">
          {(['bottles', 'packages'] as const).map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={section === s}
              onClick={() => goSection(s)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${section === s ? 'bg-obsidian text-white shadow' : 'text-obsidian/60 hover:text-obsidian'}`}
            >
              {s === 'bottles' ? 'Bottles' : 'Party packs'}
            </button>
          ))}
        </div>
      </header>

      {section === 'packages' ? (
        <>
          <div className="mb-5 flex gap-2 overflow-x-auto border-b border-obsidian/10 scrollbar-hide" role="tablist" aria-label="Package occasions">
            {PACKAGE_OCCASION_ORDER.filter((occ) => EVENT_PACKAGES.some((p) => p.occasion === occ)).map((occ) => (
              <button
                key={occ}
                type="button"
                role="tab"
                aria-selected={packageOccasion === occ}
                onClick={() => setPackageOccasion(occ)}
                className={`relative shrink-0 px-4 py-3 text-sm font-semibold ${packageOccasion === occ ? 'text-obsidian' : 'text-obsidian/60 hover:text-obsidian'}`}
              >
                {OCCASION_LABELS[occ]}
                {packageOccasion === occ && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-ember" aria-hidden />}
              </button>
            ))}
          </div>
          <PackageBrowse selectedSlug={selectedPkg} occasion={packageOccasion} onOccasionChange={setPackageOccasion} hideSidebar />
        </>
      ) : (
        <div className="flex gap-8 xl:gap-10">
          <aside className="hidden w-64 shrink-0 lg:block xl:w-72" aria-label="Filter drinks">
            <div className="sticky top-[5.5rem] max-h-[calc(100vh-6.5rem)] overflow-y-auto pb-6 pr-2 [scrollbar-width:thin]">
              <h2 className="mb-3 font-serif text-2xl font-light text-obsidian">Filter by</h2>
              {filterPanel}
            </div>
          </aside>

          <div className="min-w-0 flex-1" ref={gridTop} style={{ scrollMarginTop: '6rem' }}>
            {/* Toolbar */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-obsidian/20 bg-white px-4 py-2.5 text-sm font-semibold lg:hidden"
              >
                <SlidersHorizontal size={16} /> Filter
                {nActive > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ember px-1 text-[11px] font-bold text-white">{nActive}</span>}
              </button>

              <div className="hidden flex-wrap items-center gap-2 lg:flex">
                {chips.map((c) => (
                  <Chip key={`${c.key}-${c.value}`} label={c.label} onRemove={() => removeChip(c.key, c.value)} />
                ))}
                {chips.length > 0 && (
                  <button type="button" onClick={clearAll} className="px-1 text-sm font-medium text-obsidian underline underline-offset-2 hover:text-ember">
                    Clear filters
                  </button>
                )}
              </div>

              <div className="ml-auto flex items-center gap-2">
                <Dropdown
                  label="Sort by"
                  value={filters.sort}
                  onChange={(v) => apply({ ...filters, sort: v as SortKey })}
                  options={SORTS.map((s) => ({ value: s.key, label: s.label }))}
                />
                <Dropdown
                  label="Per page"
                  className="hidden xl:block"
                  value={String(filters.per)}
                  onChange={(v) => apply({ ...filters, per: Number(v) })}
                  options={PER_PAGE_OPTIONS.map((n) => ({ value: String(n), label: String(n) }))}
                />
                <Pager page={result.page} pages={result.pages} onPage={setPage} compact className="hidden xl:flex" />
              </div>
            </div>

            {/* Mobile chips */}
            {chips.length > 0 && (
              <div className="-mx-3 mb-4 flex gap-2 overflow-x-auto px-3 scrollbar-hide lg:hidden">
                {chips.map((c) => (
                  <Chip key={`${c.key}-${c.value}`} label={c.label} onRemove={() => removeChip(c.key, c.value)} />
                ))}
                <button type="button" onClick={clearAll} className="shrink-0 px-1 text-sm font-medium underline underline-offset-2">
                  Clear
                </button>
              </div>
            )}

            <p className="mb-4 text-sm text-obsidian/55" aria-live="polite">
              {result.total === 0
                ? 'No bottles found'
                : `Showing ${(result.page - 1) * filters.per + 1}–${Math.min(result.page * filters.per, result.total)} of ${result.total} bottle${result.total === 1 ? '' : 's'}`}
            </p>

            {result.total === 0 ? (
              <EmptyState onClear={clearAll} hasFilters={chips.length > 0} />
            ) : (
              <ul className="grid grid-cols-2 gap-x-3 gap-y-9 sm:grid-cols-3 sm:gap-x-5 xl:grid-cols-4">
                {result.items.map((p, i) => (
                  <li key={p.slug}>
                    <ProductCard product={p} priority={i < 4} />
                  </li>
                ))}
              </ul>
            )}

            {result.pages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pager page={result.page} pages={result.pages} onPage={setPage} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {sheetOpen && section === 'bottles' && (
          <>
            <motion.div
              key="scrim"
              className="fixed inset-0 z-[60] bg-black/45 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
            />
            <motion.div
              key="sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Filter drinks"
              className="fixed inset-x-0 bottom-0 z-[70] flex max-h-[88dvh] flex-col rounded-t-3xl bg-white lg:hidden"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 40 }}
            >
              <div className="flex items-center justify-between border-b border-obsidian/10 px-5 py-4">
                <h2 className="font-serif text-2xl font-light">Filter by</h2>
                <button type="button" onClick={() => setSheetOpen(false)} aria-label="Close filters" className="grid h-10 w-10 place-items-center rounded-full hover:bg-obsidian/5">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-2">{filterPanel}</div>
              <div className="flex gap-3 border-t border-obsidian/10 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <button type="button" onClick={clearAll} disabled={chips.length === 0} className="flex-1 rounded-full border border-obsidian/20 py-3 text-sm font-semibold disabled:opacity-40">
                  Clear all
                </button>
                <button type="button" onClick={() => setSheetOpen(false)} className="flex-[2] rounded-full bg-obsidian py-3 text-sm font-bold text-white">
                  Show {result.total} result{result.total === 1 ? '' : 's'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ShopCartBar />
    </div>
  );
}

/* ── Filter panel ─────────────────────────────────────────────── */

function FilterPanel({
  groups,
  filters,
  ratings,
  onToggle,
  onRating,
  onQuery,
}: {
  groups: FacetGroup[];
  filters: FilterState;
  ratings: { min: number; count: number }[];
  onToggle: (key: FacetKey, value: string) => void;
  onRating: (min: number) => void;
  onQuery: (q: string) => void;
}) {
  const [q, setQ] = useState(filters.q);
  useEffect(() => setQ(filters.q), [filters.q]);

  return (
    <div className="divide-y divide-obsidian/10">
      <form
        className="pb-4"
        onSubmit={(e) => {
          e.preventDefault();
          onQuery(q);
        }}
      >
        <label className="relative block">
          <span className="sr-only">Search within results</span>
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-obsidian/40" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onBlur={() => q !== filters.q && onQuery(q)}
            placeholder="Search within results"
            className="h-10 w-full rounded-lg border border-obsidian/15 bg-white pl-9 pr-3 text-sm focus:border-obsidian focus:ring-0"
          />
        </label>
      </form>

      {groups.map((g) => (
        <FacetSection key={g.key} group={g} selected={filters[g.key]} onToggle={(v) => onToggle(g.key, v)} />
      ))}

      {ratings.some((r) => r.count > 0) && (
        <Collapsible title="Average rating" defaultOpen={filters.rating > 0}>
          <ul className="space-y-1">
            {ratings.map((r) => (
              <li key={r.min}>
                <button
                  type="button"
                  onClick={() => onRating(r.min)}
                  disabled={r.count === 0 && filters.rating !== r.min}
                  aria-pressed={filters.rating === r.min}
                  className={`flex w-full items-center gap-2 rounded-md px-1 py-1.5 text-sm disabled:opacity-35 ${filters.rating === r.min ? 'font-semibold text-obsidian' : 'text-obsidian/75 hover:text-obsidian'}`}
                >
                  <span className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={15} className={i <= r.min ? 'text-amber-400' : 'text-obsidian/15'} fill="currentColor" />
                    ))}
                  </span>
                  &amp; up <span className="ml-auto text-xs text-obsidian/40">({r.count})</span>
                </button>
              </li>
            ))}
          </ul>
        </Collapsible>
      )}
    </div>
  );
}

function FacetSection({ group, selected, onToggle }: { group: FacetGroup; selected: string[]; onToggle: (v: string) => void }) {
  const [term, setTerm] = useState('');
  const [all, setAll] = useState(false);
  const options = group.options.filter((o) => !term || o.label.toLowerCase().includes(term.toLowerCase()));
  // Selected options always show, even past the fold.
  const visible = all || term ? options : options.filter((o, i) => i < COLLAPSED_LIMIT || selected.includes(o.value));

  return (
    <Collapsible title={group.label} count={selected.length} defaultOpen={OPEN_BY_DEFAULT.includes(group.key) || selected.length > 0}>
      {group.searchable && group.options.length > COLLAPSED_LIMIT && (
        <input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={`Search ${group.label.toLowerCase()}`}
          className="mb-2 h-9 w-full rounded-md border border-obsidian/15 px-3 text-sm focus:border-obsidian focus:ring-0"
        />
      )}
      <ul className="space-y-0.5">
        {visible.map((o) => {
          const checked = selected.includes(o.value);
          return (
            <li key={o.value}>
              <label className={`flex cursor-pointer items-center gap-3 rounded-md px-1 py-1.5 text-[15px] ${o.count === 0 && !checked ? 'opacity-40' : 'hover:bg-shell'}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={o.count === 0 && !checked}
                  onChange={() => onToggle(o.value)}
                  className="h-[18px] w-[18px] rounded border-obsidian/30 text-palm focus:ring-palm"
                />
                <span className={`flex-1 ${checked ? 'font-semibold text-obsidian' : 'text-obsidian/80'}`}>{o.label}</span>
                <span className="text-xs tabular-nums text-obsidian/40">({o.count})</span>
              </label>
            </li>
          );
        })}
      </ul>
      {!term && options.length > COLLAPSED_LIMIT && (
        <button type="button" onClick={() => setAll((v) => !v)} className="mt-2 px-1 text-sm font-semibold text-obsidian underline underline-offset-2 hover:text-ember">
          {all ? 'Show less' : `Show all ${options.length}`}
        </button>
      )}
    </Collapsible>
  );
}

function Collapsible({ title, count = 0, defaultOpen, children }: { title: string; count?: number; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  return (
    <section className="py-4">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center justify-between text-left">
        <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-obsidian">
          {title}
          {count > 0 && <span className="ml-2 rounded-full bg-palm px-1.5 py-0.5 text-[10px] text-white">{count}</span>}
        </span>
        <ChevronDown size={18} className={`text-obsidian/60 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </section>
  );
}

/* ── Toolbar bits ─────────────────────────────────────────────── */

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-palm py-1.5 pl-3.5 pr-2.5 text-sm font-medium text-white hover:bg-palm-light"
      aria-label={`Remove filter ${label}`}
    >
      {label} <X size={14} />
    </button>
  );
}

function Dropdown({
  label,
  value,
  options,
  onChange,
  className = '',
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <label className={`relative ${className}`}>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-obsidian">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select-clean h-11 appearance-none rounded-lg border border-obsidian/25 bg-white pr-9 text-sm text-obsidian/80 focus:border-obsidian focus:ring-0"
        style={{ paddingLeft: `${label.length * 0.5 + 1.6}rem` }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
    </label>
  );
}

function pageList(page: number, pages: number): (number | '…')[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const out: (number | '…')[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pages - 1, page + 1);
  if (start > 2) out.push('…');
  for (let i = start; i <= end; i++) out.push(i);
  if (end < pages - 1) out.push('…');
  out.push(pages);
  return out;
}

function Pager({
  page,
  pages,
  onPage,
  compact,
  className = '',
}: {
  page: number;
  pages: number;
  onPage: (n: number) => void;
  compact?: boolean;
  className?: string;
}) {
  if (pages <= 1) return null;
  const btn = 'grid h-11 min-w-11 place-items-center rounded-lg px-2 text-sm font-semibold';
  return (
    <nav aria-label="Pages" className={`flex items-center gap-1 ${className}`}>
      <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page" className={`${btn} border border-obsidian/20 disabled:opacity-30`}>
        <ChevronLeft size={18} />
      </button>
      {compact ? (
        <span className="px-2 text-sm tabular-nums text-obsidian/70">
          {page} / {pages}
        </span>
      ) : pageList(page, pages).map((n, i) =>
        n === '…' ? (
          <span key={`gap-${i}`} className="px-1 text-obsidian/40">…</span>
        ) : (
          <button
            key={n}
            type="button"
            onClick={() => onPage(n)}
            aria-current={n === page ? 'page' : undefined}
            className={`${btn} ${n === page ? 'bg-ember text-white' : 'text-obsidian/70 hover:bg-obsidian/5'}`}
          >
            {n}
          </button>
        )
      )}
      <button type="button" onClick={() => onPage(page + 1)} disabled={page >= pages} aria-label="Next page" className={`${btn} border border-obsidian/20 disabled:opacity-30`}>
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}

function EmptyState({ onClear, hasFilters }: { onClear: () => void; hasFilters: boolean }) {
  const ideas = [
    ['Cognac', '/shop?type=cognac'],
    ['Champagne', '/shop?type=champagne'],
    ['Whisky', '/shop?type=whisky'],
    ['Party packs', '/shop?section=packages'],
  ];
  return (
    <div className="rounded-3xl bg-shell px-6 py-14 text-center">
      <p className="font-serif text-2xl font-light text-obsidian">Nothing matches — yet.</p>
      <p className="mx-auto mt-2 max-w-md text-[15px] text-obsidian/60">
        Try fewer filters, or browse a department. New bottles land every week.
      </p>
      {hasFilters && (
        <button type="button" onClick={onClear} className="mt-5 rounded-full bg-obsidian px-6 py-2.5 text-sm font-bold text-white hover:bg-ember">
          Clear all filters
        </button>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {ideas.map(([label, href]) => (
          <Link key={href} href={href} className="rounded-full border border-obsidian/15 bg-white px-4 py-2 text-sm hover:border-obsidian">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
