'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import DrinkPhoto from '@/components/shop/DrinkPhoto';
import { CATEGORY_LABELS, formatNgn, type DrinkCategory } from '@/lib/drinks/catalog';
import { matchesQuery } from '@/lib/storefront/facets';
import { useCatalog } from '@/lib/shop/use-catalog';

const POPULAR = ['Hennessy', 'Champagne', 'Tequila', 'Single malt', 'Party packs', 'Under ₦50k'];

/** Popular chips that are really filters, not words. */
function popularHref(term: string): string {
  if (term === 'Party packs') return '/shop?section=packages';
  if (term === 'Under ₦50k') return '/shop?price=u25,25-50';
  if (term === 'Champagne') return '/shop?type=champagne';
  return `/shop?q=${encodeURIComponent(term)}`;
}

type Suggestion =
  | { kind: 'brand'; label: string; count: number; href: string }
  | { kind: 'category'; label: string; count: number; href: string }
  | { kind: 'product'; label: string; href: string; slug: string };

/**
 * Header search with live suggestions — brands, categories and bottles from the live catalog,
 * keyboard navigable. Enter (or "See all") opens the full faceted results on /shop.
 */
export default function SearchBox({
  autoFocus = false,
  onNavigate,
  className = '',
}: {
  autoFocus?: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const { products } = useCatalog();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const term = q.trim();
  const { suggestions, productHits } = useMemo(() => {
    if (term.length < 2) return { suggestions: [] as Suggestion[], productHits: [] as typeof products };
    const lower = term.toLowerCase();
    const bottles = products.filter((p) => !p.sample && matchesQuery(p, term));

    const brandCounts = new Map<string, number>();
    for (const p of products) {
      if (p.brand && p.brand.toLowerCase().includes(lower)) brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1);
    }
    const brands: Suggestion[] = [...brandCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([label, count]) => ({ kind: 'brand', label, count, href: `/shop?brand=${encodeURIComponent(label)}` }));

    const cats: Suggestion[] = (Object.keys(CATEGORY_LABELS) as DrinkCategory[])
      .filter((c) => CATEGORY_LABELS[c].toLowerCase().includes(lower) || c.includes(lower))
      .map((c) => ({
        kind: 'category' as const,
        label: CATEGORY_LABELS[c],
        count: products.filter((p) => p.category === c).length,
        href: c === 'party-packs' ? '/shop?section=packages' : `/shop?type=${c}`,
      }))
      .slice(0, 2);

    const top = bottles.slice(0, 6);
    const items: Suggestion[] = [
      ...brands,
      ...cats,
      ...top.map((p) => ({ kind: 'product' as const, label: p.name, href: `/shop/${p.slug}`, slug: p.slug })),
    ];
    return { suggestions: items, productHits: bottles };
  }, [term, products]);

  const bySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);
  const allHref = `/shop?q=${encodeURIComponent(term)}`;

  /** Reset after a Link click — the Link itself navigates. */
  function close() {
    setOpen(false);
    setQ('');
    setActive(-1);
    onNavigate?.();
  }

  /** Keyboard and chip navigation. */
  function go(href: string) {
    close();
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(suggestions.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(-1, i - 1));
    } else if (e.key === 'Escape') {
      // A search input clears itself on Escape, and that change would reopen the panel.
      e.preventDefault();
      setOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (active >= 0 && suggestions[active]) go(suggestions[active].href);
      else if (term) go(allHref);
    }
  }

  const showPanel = open && (term.length >= 2 || term.length === 0);

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <div className="relative">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-obsidian/45" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search for your perfect bottle"
          className="h-11 w-full rounded-full border border-obsidian/80 bg-white pl-11 pr-10 text-[15px] text-obsidian placeholder:text-obsidian/40 focus:border-obsidian focus:ring-2 focus:ring-obsidian/10 [&::-webkit-search-cancel-button]:hidden"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ('');
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-obsidian/40 hover:bg-obsidian/5 hover:text-obsidian"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {showPanel && (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-[60] mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-obsidian/10 bg-white p-2 shadow-[0_24px_60px_-20px_rgba(10,10,10,0.35)]"
        >
          {term.length === 0 ? (
            <div className="p-3">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-obsidian/40">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => go(popularHref(t))}
                    className="rounded-full border border-obsidian/12 px-3 py-1.5 text-sm text-obsidian/75 hover:border-obsidian hover:text-obsidian"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="p-4 text-sm text-obsidian/55">
              No bottles match “{term}”. Try a brand like Hennessy or a style like tequila.
            </div>
          ) : (
            <>
              {suggestions.map((s, i) => {
                const selected = i === active;
                const base = `flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left ${selected ? 'bg-shell' : 'hover:bg-shell/70'}`;
                if (s.kind === 'product') {
                  const p = bySlug.get(s.slug);
                  return (
                    <Link key={s.href} id={`${listId}-${i}`} role="option" aria-selected={selected} href={s.href} onClick={close} className={base}>
                      <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md bg-shell">
                        {p && <DrinkPhoto product={p} watermark={false} className="absolute inset-0 h-full w-full !bg-transparent mix-blend-multiply [&_img]:!p-0.5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-obsidian">{s.label}</span>
                        {p && <span className="block text-xs text-obsidian/50">{p.volume}{p.abv > 0 ? ` · ${p.abv}%` : ''}</span>}
                      </span>
                      {p && <span className="text-sm font-bold text-obsidian">{formatNgn(p.priceNgn)}</span>}
                    </Link>
                  );
                }
                return (
                  <Link key={`${s.kind}-${s.label}`} id={`${listId}-${i}`} role="option" aria-selected={selected} href={s.href} onClick={close} className={base}>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-obsidian/[0.05] text-[10px] font-black uppercase text-obsidian/50">
                      {s.kind === 'brand' ? 'B' : 'C'}
                    </span>
                    <span className="flex-1 text-sm">
                      <span className="font-semibold text-obsidian">{s.label}</span>
                      <span className="ml-2 text-xs text-obsidian/45">{s.kind === 'brand' ? 'Brand' : 'Category'}</span>
                    </span>
                    <span className="text-xs text-obsidian/40">{s.count}</span>
                  </Link>
                );
              })}
              <Link
                href={allHref}
                onClick={close}
                className="mt-1 flex items-center justify-between rounded-xl bg-obsidian px-4 py-2.5 text-sm font-semibold text-white hover:bg-ember"
              >
                See all {productHits.length} result{productHits.length === 1 ? '' : 's'} for “{term}”
                <ArrowRight size={15} />
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
