'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Award, Banknote, ChevronDown, Gift, PartyPopper, Sparkles, Wine, type LucideIcon } from 'lucide-react';
import { CATEGORY_LABELS, type DrinkCategory } from '@/lib/drinks/catalog';
import { PRICE_BANDS } from '@/lib/storefront/facets';
import type { CatalogProduct } from '@/lib/shop/use-catalog';

const TILES: { label: string; href: string; icon: LucideIcon; bg: string }[] = [
  { label: 'Our top picks', href: '/shop?offer=best-seller', icon: Award, bg: 'bg-saffron' },
  { label: 'Party packs', href: '/shop?section=packages', icon: PartyPopper, bg: 'bg-[#E4EC63]' },
  { label: 'Gift-worthy bottles', href: '/shop?type=cognac,champagne,whisky&price=50-100,100-250,250up', icon: Gift, bg: 'bg-blush' },
  { label: 'Under ₦25,000', href: '/shop?price=u25', icon: Banknote, bg: 'bg-blush' },
  { label: 'New in', href: '/shop?offer=new', icon: Sparkles, bg: 'bg-saffron' },
  { label: 'Find your taste', href: '/discover/taste', icon: Wine, bg: 'bg-[#E4EC63]' },
];

/** "Looking for inspiration?" — shortcut tiles plus a three-step bottle finder. */
export default function InspirationPanel({ products }: { products: CatalogProduct[] }) {
  const router = useRouter();
  const pool = useMemo(() => products.filter((p) => !p.sample && !p.partyPack && p.category !== 'party-packs'), [products]);
  const [type, setType] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');

  const types = useMemo(
    () => [...new Set(pool.map((p) => p.category))].filter((c) => c in CATEGORY_LABELS) as DrinkCategory[],
    [pool]
  );
  const inType = useMemo(() => (type ? pool.filter((p) => p.category === type) : []), [pool, type]);
  const brands = useMemo(() => [...new Set(inType.map((p) => p.brand).filter(Boolean) as string[])].sort(), [inType]);
  const inBrand = useMemo(() => (brand ? inType.filter((p) => p.brand === brand) : inType), [inType, brand]);
  const bands = useMemo(
    () => PRICE_BANDS.filter((b) => inBrand.some((p) => p.priceNgn >= b.min && p.priceNgn <= b.max)),
    [inBrand]
  );
  const matches = useMemo(() => {
    const band = PRICE_BANDS.find((b) => b.key === price);
    return (type ? inBrand : pool).filter((p) => !band || (p.priceNgn >= band.min && p.priceNgn <= band.max)).length;
  }, [type, inBrand, pool, price]);

  function find() {
    const q = new URLSearchParams();
    if (type) q.set('type', type);
    if (brand) q.set('brand', brand);
    if (price) q.set('price', price);
    router.push(`/shop${q.toString() ? `?${q}` : ''}`);
  }

  return (
    <section className="mx-auto max-w-[1600px] px-3 sm:px-4 lg:px-5">
      <div className="rounded-3xl bg-shell px-5 py-12 sm:px-10 sm:py-14 lg:px-16">
        <h2 className="mb-10 text-center font-serif text-[1.9rem] font-light tracking-tight text-obsidian sm:text-[2.5rem]">
          Looking for inspiration?
        </h2>
        <div className="grid items-center gap-12 lg:grid-cols-[1.3fr_1fr]">
          <ul className="grid grid-cols-3 gap-x-3 gap-y-8 sm:gap-x-6">
            {TILES.map(({ label, href, icon: Icon, bg }) => (
              <li key={label}>
                <Link href={href} className="group flex flex-col items-center text-center">
                  <span className={`grid h-20 w-20 place-items-center rounded-full ${bg} transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-[-6deg] sm:h-28 sm:w-28`}>
                    <Icon className="h-9 w-9 text-obsidian sm:h-12 sm:w-12" strokeWidth={1.25} />
                  </span>
                  <span className="mt-3 text-[12px] font-semibold uppercase tracking-[0.04em] text-obsidian/80 group-hover:text-obsidian sm:text-[13px]">
                    {label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              find();
            }}
          >
            <Step n={1} label="What do you like?">
              <Select value={type} onChange={(v) => { setType(v); setBrand(''); setPrice(''); }} placeholder="Any drink">
                {types.map((t) => (
                  <option key={t} value={t}>{CATEGORY_LABELS[t]}</option>
                ))}
              </Select>
            </Step>
            <Step n={2} label="Which brand?">
              <Select value={brand} onChange={(v) => { setBrand(v); setPrice(''); }} placeholder={type ? 'Any brand' : 'Select a drink first…'} disabled={!type}>
                {brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </Select>
            </Step>
            <Step n={3} label="Your budget?">
              <Select value={price} onChange={setPrice} placeholder={type ? 'Any budget' : 'Select a drink first…'} disabled={!type}>
                {bands.map((b) => (
                  <option key={b.key} value={b.key}>{b.label}</option>
                ))}
              </Select>
            </Step>
            <div className="flex flex-col items-center gap-2 pt-2 sm:pl-14">
              <button type="submit" className="w-full rounded-lg bg-obsidian px-7 py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-ember sm:w-auto">
                Find my perfect bottle
              </button>
              <p className="text-xs text-obsidian/50" aria-live="polite">
                {matches} bottle{matches === 1 ? '' : 's'} match
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function Step({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-end gap-3">
      <span className="mb-1.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lilac font-serif text-lg text-obsidian">{n}</span>
      <label className="block flex-1">
        <span className="mb-1.5 block text-sm font-medium text-obsidian">{label}</span>
        {children}
      </label>
    </div>
  );
}

function Select({
  value,
  onChange,
  placeholder,
  disabled,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span className="relative block">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="select-clean h-12 w-full rounded-md border border-obsidian/20 bg-white pl-4 pr-10 text-[15px] text-obsidian focus:border-obsidian focus:ring-0 disabled:bg-white/60 disabled:text-obsidian/40"
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-obsidian/60" />
    </span>
  );
}
