'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';
import ShopCartBar from '@/components/shop/ShopCartBar';
import GuestCardStrip from '@/components/loyalty/GuestCardStrip';
import { useCart } from '@/components/cart/CartProvider';
import PackageBrowse, { PACKAGE_OCCASION_ORDER } from '@/components/packages/PackageBrowse';
import PartyPlanner from '@/components/shop/PartyPlanner';
import PlanShareDemo from '@/components/party/PlanShareDemo';
import TrustBadges from '@/components/shop/TrustBadges';
import { CategoryIcon } from '@/components/icons/ShopIcons';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  DRINKS,
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
};

type ShopSection = 'bottles' | 'packages' | 'plan';

function parseSection(raw: string | null): ShopSection {
  if (raw === 'packages' || raw === 'plan') return raw;
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

  useEffect(() => {
    setSection(parseSection(params.get('section')));
  }, [params]);

  useEffect(() => {
    if (params.get('plan') === '1') {
      router.replace('/shop?section=plan');
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

  function pushShop(next: { section?: ShopSection; category?: DrinkCategory | 'all'; q?: string; pkg?: string | null }) {
    const q = new URLSearchParams();
    const sec = next.section ?? section;
    if (sec !== 'bottles') q.set('section', sec);
    const cat = next.category ?? category;
    if (sec === 'bottles' && cat !== 'all') q.set('category', cat);
    const search = next.q ?? query;
    if (search.trim()) q.set('q', search.trim());
    if (next.pkg) q.set('pkg', next.pkg);
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((d) => !d.partyPack);
    if (category !== 'all') list = list.filter((d) => d.category === category);
    if (q) {
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.brand?.toLowerCase().includes(q) ||
          d.tagline.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, query, category]);

  const recommended = products.filter((d) => d.featured && !d.partyPack);
  const deals = products.filter((d) => d.deal && !d.partyPack);
  const showRails = section === 'bottles' && !query && category === 'all';

  const sectionTitle =
    section === 'packages' ? 'Event packages' : section === 'plan' ? 'Plan your event' : 'Shop drinks';

  const sectionBlurb =
    section === 'packages'
      ? 'Ready-made bars at one fixed price — pick an occasion, expand a package, add to cart.'
      : section === 'plan'
        ? 'Size the bar by headcount and vibe — or jump to a fixed package when you are ready.'
        : 'Spirits, Champagne, RTDs, and mixers for parties, clubs, and home.';

  return (
    <div
      className={`w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-5 pt-5 sm:pt-6 ${
        count > 0 ? 'pb-32 md:pb-20' : 'pb-14 sm:pb-20'
      }`}
    >
      <header className="mb-5 sm:mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="font-wordmark text-2xl sm:text-3xl md:text-4xl text-obsidian mb-2">{sectionTitle}</h1>
          <p className="text-body text-obsidian/60 max-w-3xl">{sectionBlurb}</p>
        </div>
        <GuestCardStrip variant="inline" className="shrink-0 w-full sm:w-auto sm:max-w-[280px]" />
      </header>

      {/* Shop modes are tabs. Package occasions are views, not filters. */}
      <div className="mb-5 space-y-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5" role="tablist" aria-label="Shop view">
          <ChipBtn active={section === 'bottles'} onClick={() => goSection('bottles')}>
            Bottles
          </ChipBtn>
          <ChipBtn active={section === 'packages'} onClick={() => goSection('packages')}>
            Packages
          </ChipBtn>
        </div>
        {section === 'bottles' && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5 lg:hidden" aria-label="Bottle categories">
            <ChipBtn active={category === 'all'} onClick={() => goCategory('all')}>
              All
            </ChipBtn>
            {CATEGORIES.filter((c) => c !== 'party-packs').map((cat) => (
              <ChipBtn key={cat} active={category === cat} onClick={() => goCategory(cat)}>
                {CATEGORY_LABELS[cat]}
              </ChipBtn>
            ))}
          </div>
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
                  className={`relative shrink-0 px-4 py-3 text-sm sm:text-base font-semibold transition-colors ${
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
            className="hidden lg:block lg:sticky lg:top-[4.75rem] lg:self-start shrink-0 lg:w-56 xl:w-60 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto rounded-2xl bg-ember/[0.06] border border-ember/15 p-3 sm:p-4"
            aria-label="Bottle categories"
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
          </aside>
        )}

        <div className="flex-1 min-w-0">
          {section === 'plan' && (
            <div className="mb-8">
              <TrustBadges className="mb-6" />
              <PlanShareDemo />
            </div>
          )}

          {section === 'packages' && (
            <PackageBrowse
              selectedSlug={selectedPkg}
              occasion={packageOccasion}
              onOccasionChange={setPackageOccasion}
              hideSidebar
            />
          )}

          {section === 'plan' && <PartyPlanner defaultOpen />}

          {section === 'bottles' && (
            <>
              <div className="relative mb-5">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian/35" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search whisky, canned cocktails, wine…"
                  className="w-full pl-10 pr-3 py-3 bg-white border border-obsidian/10 focus:border-ember focus:ring-0 text-base"
                />
              </div>

              <div className="mb-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ember/15 bg-gradient-to-r from-ember/[0.06] to-ember/[0.02] px-4 py-4 sm:px-5">
                <p className="text-base text-obsidian/75 leading-snug max-w-xl">
                  Planning a party? Size the bar by headcount and vibe — we&apos;ll build your basket.
                </p>
                <button
                  type="button"
                  onClick={() => goSection('plan')}
                  className="px-5 py-2.5 btn-brand text-sm font-wordmark-sm shrink-0"
                >
                  Plan my party
                </button>
              </div>

              {showRails && (
                <>
                  <Rail title="Recommended" products={recommended} />
                  <Rail title="Hot deals" products={deals} />
                </>
              )}

              <div className="mt-2">
                <h2 className="text-xl sm:text-2xl font-bold text-obsidian mb-4">
                  {showRails ? 'All drinks' : `${filtered.length} result${filtered.length === 1 ? '' : 's'}`}
                </h2>
                {filtered.length === 0 ? (
                  <p className="text-body text-obsidian/45">No drinks match. Try another search or category.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 py-1">
                    {filtered.map((p) => (
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
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
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
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-xl sm:text-2xl font-bold text-obsidian">{title}</h2>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            disabled={!canScrollLeft}
            aria-label={`Scroll ${title} left`}
            className="w-9 h-9 rounded-full border border-obsidian/12 bg-white text-obsidian/70 hover:border-ember hover:text-ember disabled:opacity-30 disabled:pointer-events-none transition-colors grid place-items-center"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            disabled={!canScrollRight}
            aria-label={`Scroll ${title} right`}
            className="w-9 h-9 rounded-full border border-obsidian/12 bg-white text-obsidian/70 hover:border-ember hover:text-ember disabled:opacity-30 disabled:pointer-events-none transition-colors grid place-items-center"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="relative">
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
      </div>
    </div>
  );
}
