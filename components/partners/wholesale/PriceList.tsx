'use client';

import { useMemo, useState } from 'react';
import { Minus, Plus, Search } from 'lucide-react';
import DrinkPhoto from '@/components/shop/DrinkPhoto';
import { CATEGORIES, CATEGORY_LABELS, DRINKS, formatNgn, getDrinkBySlug, type DrinkCategory } from '@/lib/drinks/catalog';

/** Points rule mirrors lib/partners/outlets.ts → placeWholesaleOrder (floor(total / 50)). */
const pointsFor = (totalNgn: number) => Math.floor(totalNgn / 50);
const CASE_SIZE = 6;
const MAX_PER_SKU = 48;

/**
 * The wholesale price list, inside the signed-in wholesale portal only.
 *
 * Prices come from /api/partners/price-list (approved outlets and admins), never from a
 * client-side formula, so the list is not published to anyone who is not signed in.
 */
export default function PriceList({
  prices,
  canOrder,
  disabledReason,
  onOrder,
  busy = false,
}: {
  prices: Record<string, number>;
  canOrder: boolean;
  disabledReason?: string;
  onOrder?: (items: { slug: string; qty: number }[]) => Promise<boolean>;
  busy?: boolean;
}) {
  const [cat, setCat] = useState<DrinkCategory | 'all'>('all');
  const [q, setQ] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});

  const listed = useMemo(() => DRINKS.filter((d) => prices[d.slug] != null), [prices]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return listed
      .filter((d) => cat === 'all' || d.category === cat)
      .filter((d) => !needle || `${d.name} ${d.brand ?? ''}`.toLowerCase().includes(needle))
      .sort((a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) || b.priceNgn - a.priceNgn);
  }, [listed, cat, q]);

  const lines = Object.entries(cart)
    .map(([slug, qty]) => ({ drink: getDrinkBySlug(slug), unit: prices[slug] ?? 0, qty }))
    .filter((l): l is { drink: NonNullable<typeof l.drink>; unit: number; qty: number } => Boolean(l.drink) && l.qty > 0);
  const total = lines.reduce((n, l) => n + l.unit * l.qty, 0);
  const retail = lines.reduce((n, l) => n + l.drink.priceNgn * l.qty, 0);
  const bottles = lines.reduce((n, l) => n + l.qty, 0);

  const bump = (slug: string, delta: number) =>
    setCart((prev) => {
      const next = Math.max(0, Math.min(MAX_PER_SKU, (prev[slug] || 0) + delta));
      const copy = { ...prev };
      if (next) copy[slug] = next;
      else delete copy[slug];
      return copy;
    });

  async function order() {
    if (!onOrder || !lines.length) return;
    const ok = await onOrder(lines.map((l) => ({ slug: l.drink.slug, qty: l.qty })));
    if (ok) setCart({});
  }

  const cats = CATEGORIES.filter((c) => listed.some((d) => d.category === c));

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-5">
        <label className="relative block">
          <span className="sr-only">Search bottles</span>
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-obsidian/35" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a bottle or brand"
            className="w-full rounded-full border border-obsidian/12 bg-white py-2.5 pl-10 pr-4 text-base focus:border-ember focus:ring-0 sm:text-sm"
          />
        </label>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
          {(['all', ...cats] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`shrink-0 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                cat === c ? 'bg-obsidian text-white' : 'border border-obsidian/10 bg-white text-obsidian/55 hover:border-obsidian/25'
              }`}
            >
              {c === 'all' ? 'Everything' : CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>

        <ul className="overflow-hidden rounded-2xl border border-obsidian/8 bg-white">
          {rows.map((d, i) => {
            const unit = prices[d.slug];
            const qty = cart[d.slug] || 0;
            return (
              <li key={d.slug} className={`flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4 ${i ? 'border-t border-obsidian/6' : ''}`}>
                <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-paper">
                  <DrinkPhoto product={d} watermark={false} className="absolute inset-0 h-full w-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-obsidian sm:line-clamp-1">{d.name}</p>
                  <p className="text-xs text-obsidian/45">
                    {CATEGORY_LABELS[d.category]} · {d.volume}
                  </p>
                </div>
                <div className="text-right">
                  <p className="hidden text-[11px] text-obsidian/35 line-through tabular-nums sm:block">{formatNgn(d.priceNgn)}</p>
                  <p className="text-sm font-bold tabular-nums text-obsidian">{formatNgn(unit)}</p>
                </div>
                <div className="hidden w-28 text-right md:block">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-obsidian/35">Case of {CASE_SIZE}</p>
                  <p className="text-sm tabular-nums text-obsidian/70">{formatNgn(unit * CASE_SIZE)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1 rounded-full border border-obsidian/10 p-0.5">
                  <button type="button" aria-label={`One case less of ${d.name}`} onClick={() => bump(d.slug, -CASE_SIZE)} disabled={!qty} className="grid h-7 w-7 place-items-center rounded-full text-obsidian/60 hover:bg-paper disabled:opacity-30">
                    <Minus size={14} />
                  </button>
                  <span className="w-7 text-center text-sm font-semibold tabular-nums">{qty}</span>
                  <button type="button" aria-label={`One case more of ${d.name}`} onClick={() => bump(d.slug, CASE_SIZE)} disabled={qty >= MAX_PER_SKU} className="grid h-7 w-7 place-items-center rounded-full text-obsidian/60 hover:bg-paper disabled:opacity-30">
                    <Plus size={14} />
                  </button>
                </div>
              </li>
            );
          })}
          {rows.length === 0 && <li className="px-4 py-8 text-center text-sm text-obsidian/45">No bottles match that search.</li>}
        </ul>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24">
        <div className="rounded-3xl bg-obsidian p-6 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Restock basket</p>
          <p className="mt-2 font-serif text-4xl font-light tabular-nums tracking-tight">{formatNgn(total)}</p>
          <p className="mt-1 text-sm text-white/55">
            {bottles} bottle{bottles === 1 ? '' : 's'} · {lines.length} line{lines.length === 1 ? '' : 's'}
          </p>
          <dl className="mt-5 space-y-2.5 border-t border-white/10 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-white/55">At retail</dt>
              <dd className="tabular-nums text-white/70 line-through">{formatNgn(retail)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/55">You save</dt>
              <dd className="font-semibold tabular-nums text-saffron">{formatNgn(retail - total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/55">Premium points</dt>
              <dd className="font-semibold tabular-nums">{pointsFor(total).toLocaleString()} pts</dd>
            </div>
          </dl>
          {lines.length > 0 && (
            <button type="button" onClick={() => setCart({})} className="mt-4 text-xs font-semibold text-white/50 hover:text-white">
              Clear basket
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={order}
          disabled={!canOrder || !lines.length || busy}
          className="btn-brand flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] disabled:opacity-40"
        >
          {busy ? 'Placing…' : 'Place restock'}
        </button>
        <p className="px-1 text-xs leading-relaxed text-obsidian/45">
          {!canOrder && disabledReason ? disabledReason : `Up to ${MAX_PER_SKU} bottles per product on one order.`}
        </p>
      </aside>
    </div>
  );
}
