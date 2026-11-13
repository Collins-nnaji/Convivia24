'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import DrinkPhoto from '@/components/shop/DrinkPhoto';
import { CATEGORY_LABELS, formatNgn, type DrinkCategory } from '@/lib/drinks/catalog';
import { PRICE_BANDS } from '@/lib/storefront/facets';
import { useCatalog } from '@/lib/shop/use-catalog';

type Item = {
  key: string;
  label: string;
  href: string;
  category?: DrinkCategory;
  tone?: 'deal';
};

const ITEMS: Item[] = [
  { key: 'new', label: 'New in', href: '/shop?offer=new' },
  { key: 'champagne', label: 'Champagne', href: '/shop?type=champagne', category: 'champagne' },
  { key: 'whisky', label: 'Whisky', href: '/shop?type=whisky', category: 'whisky' },
  { key: 'cognac', label: 'Cognac', href: '/shop?type=cognac', category: 'cognac' },
  { key: 'wines', label: 'Wine', href: '/shop?type=wines', category: 'wines' },
  { key: 'spirits', label: 'Spirits', href: '/shop?type=spirits', category: 'spirits' },
  { key: 'cocktails', label: 'Cocktails', href: '/shop?type=cocktails', category: 'cocktails' },
  { key: 'mixers', label: 'Mixers', href: '/shop?type=mixers', category: 'mixers' },
  { key: 'packs', label: 'Party packs', href: '/shop?section=packages' },
  { key: 'deals', label: 'Deals', href: '/shop?offer=on-offer', tone: 'deal' },
];

/**
 * The department row under the header. Desktop gets a mega menu per category built from the live
 * catalog (its brands, price bands and a featured bottle), so new desk listings appear here
 * without a code change.
 */
export default function CategoryNav() {
  const pathname = usePathname();
  const params = useSearchParams();
  const { products } = useCatalog();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setOpenKey(null), [pathname, params]);

  const activeKey = useMemo(() => {
    if (pathname !== '/shop') return null;
    if (params.get('section') === 'packages') return 'packs';
    const offer = params.get('offer');
    if (offer === 'new') return 'new';
    if (offer === 'on-offer') return 'deals';
    const type = params.get('type') || params.get('category');
    return type && !type.includes(',') ? type : null;
  }, [pathname, params]);

  const menus = useMemo(() => {
    const out = new Map<
      string,
      { brands: [string, number][]; featured?: (typeof products)[number]; count: number; bands: typeof PRICE_BANDS[number][] }
    >();
    for (const item of ITEMS) {
      if (!item.category) continue;
      const inCat = products.filter((p) => p.category === item.category && !p.sample);
      const counts = new Map<string, number>();
      for (const p of inCat) if (p.brand) counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
      const featured = [...inCat].sort(
        (a, b) =>
          (b.merchRank ?? 0) - (a.merchRank ?? 0) ||
          Number(!!b.featured) - Number(!!a.featured) ||
          Number(!!b.image) - Number(!!a.image)
      )[0];
      out.set(item.key, {
        brands: [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10),
        featured,
        count: inCat.length,
        // Only bands with something in them — an empty result page is a dead end.
        bands: PRICE_BANDS.filter((b) => inCat.some((p) => p.priceNgn >= b.min && p.priceNgn <= b.max)),
      });
    }
    return out;
  }, [products]);

  function enter(key: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenKey(key);
  }
  function leave() {
    closeTimer.current = setTimeout(() => setOpenKey(null), 120);
  }

  const open = ITEMS.find((i) => i.key === openKey && i.category);
  const menu = open ? menus.get(open.key) : undefined;

  return (
    <nav aria-label="Departments" className="relative hidden shrink-0 border-b border-obsidian/10 bg-white md:block" onMouseLeave={leave}>
      <ul className="mx-auto flex h-11 max-w-[1600px] items-stretch justify-between gap-1 overflow-x-auto px-3 scrollbar-hide sm:px-4 lg:px-5">
        {ITEMS.map((item) => {
          const active = activeKey === item.key;
          return (
            <li key={item.key} className="flex" onMouseEnter={() => (item.category ? enter(item.key) : setOpenKey(null))}>
              <Link
                href={item.href}
                onFocus={() => item.category && enter(item.key)}
                className={`relative flex items-center whitespace-nowrap px-2 text-[13px] font-medium uppercase tracking-[0.06em] transition-colors lg:px-3 ${
                  item.tone === 'deal'
                    ? 'bg-obsidian px-4 text-white hover:bg-ember lg:px-5'
                    : active
                      ? 'text-ember'
                      : 'text-obsidian/80 hover:text-obsidian'
                }`}
              >
                {item.label}
                {(active || openKey === item.key) && item.tone !== 'deal' && (
                  <span className="absolute inset-x-2 bottom-2 h-[2px] rounded-full bg-ember lg:inset-x-3" aria-hidden />
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {open && menu && (
        <div
          className="absolute inset-x-0 top-full z-40 hidden border-b border-obsidian/10 bg-white shadow-[0_24px_40px_-24px_rgba(10,10,10,0.25)] lg:block"
          onMouseEnter={() => enter(open.key)}
          onMouseLeave={leave}
        >
          <div className="mx-auto grid max-w-[1400px] grid-cols-[1.4fr_1fr_1fr] gap-10 px-8 py-8">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-obsidian/40">Shop by brand</p>
              {menu.brands.length ? (
                <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {menu.brands.map(([brand, n]) => (
                    <li key={brand}>
                      <Link
                        href={`/shop?type=${open.category}&brand=${encodeURIComponent(brand)}`}
                        className="text-sm text-obsidian/75 hover:text-ember"
                      >
                        {brand} <span className="text-obsidian/30">({n})</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-obsidian/45">New houses arriving soon.</p>
              )}
              <Link
                href={open.href}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-obsidian underline underline-offset-4 hover:text-ember"
              >
                Shop all {CATEGORY_LABELS[open.category!].toLowerCase()} ({menu.count}) <ArrowRight size={14} />
              </Link>
            </div>
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-obsidian/40">Shop by price</p>
              <ul className="space-y-2">
                {menu.bands.map((b) => (
                  <li key={b.key}>
                    <Link href={`/shop?type=${open.category}&price=${b.key}`} className="text-sm text-obsidian/75 hover:text-ember">
                      {b.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href={`/shop?type=${open.category}&offer=on-offer`} className="text-sm font-semibold text-ember hover:underline">
                    On offer
                  </Link>
                </li>
              </ul>
            </div>
            {menu.featured && (
              <Link href={`/shop/${menu.featured.slug}`} className="group flex gap-4 rounded-2xl bg-shell p-4">
                <span className="relative h-36 w-28 shrink-0 overflow-hidden rounded-xl">
                  <DrinkPhoto product={menu.featured} watermark={false} className="absolute inset-0 h-full w-full !bg-transparent mix-blend-multiply" />
                </span>
                <span className="flex flex-col justify-center">
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-ember">Featured</span>
                  <span className="mt-1 font-serif text-lg leading-tight text-obsidian group-hover:underline">{menu.featured.name}</span>
                  <span className="mt-1 text-sm text-obsidian/55">{menu.featured.tagline}</span>
                  <span className="mt-2 text-sm font-bold">{formatNgn(menu.featured.priceNgn)}</span>
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
