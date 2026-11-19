'use client';

import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Minus,
  Plus,
  Search,
} from 'lucide-react';
import ConviviumCard from '@/components/ConviviumCard';
import DrinkPhoto from '@/components/shop/DrinkPhoto';
import { useUser } from '@/components/auth/AuthProvider';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  DRINKS,
  formatNgn,
  getDrinkBySlug,
  type DrinkCategory,
} from '@/lib/drinks/catalog';
import {
  PREMIUM_CONVERSIONS,
  VENUE_KINDS,
  WHOLESALE_OFF_PCT,
  analyseItem,
  defaultServings,
  itemFromCatalogSlug,
  wholesalePriceNgn,
} from '@/lib/partners/pricing';
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/site';

/** Points rule mirrors lib/partners/outlets.ts → placeWholesaleOrder (floor(total / 50)). */
const pointsFor = (totalNgn: number) => Math.floor(totalNgn / 50);
const CASE_SIZE = 6;
const MAX_PER_SKU = 48;

const WHOLESALE_DRINKS = DRINKS.filter((d) => !d.sample);

/* ── Building blocks ─────────────────────────────────────────────── */

export function Block({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4 border-b border-obsidian/8 pb-3">
        <h3 className="font-serif text-xl font-light tracking-tight text-obsidian">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function QA({ items }: { items: readonly (readonly [string, string])[] }) {
  return (
    <dl className="overflow-hidden rounded-2xl border border-obsidian/8 bg-white">
      {items.map(([q, a], i) => (
        <div key={q} className={`px-5 py-4 sm:px-6 ${i ? 'border-t border-obsidian/6' : ''}`}>
          <dt className="text-[15px] font-semibold leading-snug text-obsidian">{q}</dt>
          <dd className="mt-1.5 text-sm leading-relaxed text-obsidian/60">{a}</dd>
        </div>
      ))}
    </dl>
  );
}

function Accordion({ items }: { items: readonly (readonly [string, string])[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-obsidian/8 bg-white">
      {items.map(([q, a], i) => (
        <details key={q} className={`group ${i ? 'border-t border-obsidian/6' : ''}`}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[15px] font-semibold text-obsidian transition-colors hover:bg-paper sm:px-6 [&::-webkit-details-marker]:hidden">
            <span>{q}</span>
            <ChevronDown size={18} className="shrink-0 text-ember transition-transform group-open:rotate-180" />
          </summary>
          <p className="px-5 pb-5 text-sm leading-relaxed text-obsidian/60 sm:px-6">{a}</p>
        </details>
      ))}
    </div>
  );
}

function Stat({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'ember' | 'dark' }) {
  const cls =
    tone === 'dark'
      ? 'bg-obsidian text-white border-obsidian'
      : tone === 'ember'
        ? 'bg-ember/[0.06] border-ember/20 text-obsidian'
        : 'bg-white border-obsidian/8 text-obsidian';
  return (
    <div className={`rounded-2xl border p-4 ${cls}`}>
      <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${tone === 'dark' ? 'text-white/50' : 'text-obsidian/45'}`}>
        {label}
      </p>
      <p className="mt-1.5 font-serif text-2xl font-light tabular-nums tracking-tight">{value}</p>
    </div>
  );
}

function OpenLink({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
  return (
    <a href={`/partners?open=${to}`} data-wholesale-open={to} className={className}>
      {children}
    </a>
  );
}

const labelCls = 'mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-obsidian/45';
const inputCls =
  'w-full rounded-xl border border-obsidian/12 bg-white px-3 py-2.5 text-base focus:border-ember focus:ring-0';

/* ── Apply ───────────────────────────────────────────────────────── */

const INTERESTS = [
  { id: 'wholesale', label: 'Wholesale & bulk restock' },
  { id: 'margin', label: 'Menu margin desk' },
  { id: 'delivery', label: 'Same-night delivery to the room' },
  { id: 'events', label: 'List events on Convivia' },
];

const NEXT_STEPS: [string, string][] = [
  ['We review your details', 'Our partnerships team reads every application and may ask about your premises and how much you move a month.'],
  ['A call, then your agreement', 'We agree delivery zones, payment terms and who on your team can order.'],
  ['Your partner desk opens', 'Sign in with the same email to order at partner rates, track stock and bank Premium points.'],
];

export function ApplyPanel() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/partners/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'outlet',
          contactName: String(fd.get('contactName') || ''),
          email: String(fd.get('email') || ''),
          phone: String(fd.get('phone') || '') || null,
          companyName: String(fd.get('companyName') || ''),
          area: String(fd.get('area') || ''),
          venueKind: String(fd.get('venueKind') || 'lounge'),
          seats: fd.get('seats') ? Number(fd.get('seats')) : null,
          interests: INTERESTS.map((i) => i.id).filter((id) => fd.get(`interest-${id}`) === 'on'),
          notes: [fd.get('spend') ? `Monthly drinks spend: ${fd.get('spend')}` : '', String(fd.get('notes') || '')]
            .filter(Boolean)
            .join('\n') || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not send your application.');
        return;
      }
      setDone(data.message || 'Application received — we will be in touch.');
      form.reset();
    } catch {
      setError('Could not send your application. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="space-y-6 lg:col-span-5">
        <p className="text-base leading-relaxed text-obsidian/65">
          For clubs, lounges, rooftops, restaurants, hotels, beach clubs and event spaces buying drinks every week.
          Partner rates run <strong className="text-obsidian">{WHOLESALE_OFF_PCT}% below retail</strong>, and approved
          outlets get two weeks’ credit once the agreement is signed.
        </p>
        <ol className="space-y-3">
          {NEXT_STEPS.map(([t, b], i) => (
            <li key={t} className="flex gap-4 rounded-2xl border border-obsidian/8 bg-white p-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ember/10 text-sm font-bold text-ember">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-obsidian">{t}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-obsidian/55">{b}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="text-sm text-obsidian/50">
          A spirit house or importer? Use the <Link href="/contact" className="font-semibold text-ember">brand enquiry form</Link>.
          Questions first? <a href={SUPPORT_MAILTO} className="font-semibold text-ember">{SUPPORT_EMAIL}</a>
        </p>
      </div>

      <div className="rounded-3xl border border-obsidian/8 bg-white p-6 shadow-sm sm:p-8 lg:col-span-7">
        {done ? (
          <div className="py-6 text-center">
            <CheckCircle2 size={40} className="mx-auto text-palm" strokeWidth={1.6} />
            <p className="mt-4 font-serif text-2xl font-light text-obsidian">Application received</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-obsidian/60">{done}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <OpenLink to="prices" className="btn-brand inline-flex items-center gap-2 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em]">
                Browse partner prices <ArrowRight size={14} />
              </OpenLink>
              <button type="button" onClick={() => setDone(null)} className="px-4 py-3 text-sm font-semibold text-ember">
                Send another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Your name" name="contactName" required placeholder="Ada Okafor" autoComplete="name" />
              <Field label="Work email" name="email" type="email" required placeholder="you@venue.com" autoComplete="email" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Phone" name="phone" type="tel" placeholder="+234…" autoComplete="tel" />
              <Field label="Venue name" name="companyName" required placeholder="Harbour House" />
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Area" name="area" required placeholder="Victoria Island" />
              <div>
                <label className={labelCls} htmlFor="ws-venueKind">Room type</label>
                <select id="ws-venueKind" name="venueKind" defaultValue="lounge" className={`${inputCls} capitalize`}>
                  {VENUE_KINDS.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
              <Field label="Covers (optional)" name="seats" type="number" placeholder="120" />
            </div>
            <div>
              <label className={labelCls} htmlFor="ws-spend">Monthly drinks spend</label>
              <select id="ws-spend" name="spend" defaultValue="" className={inputCls}>
                <option value="">Prefer not to say</option>
                <option>Under ₦1m</option>
                <option>₦1m – ₦5m</option>
                <option>₦5m – ₦15m</option>
                <option>Over ₦15m</option>
              </select>
            </div>
            <fieldset>
              <legend className={labelCls}>Interested in</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {INTERESTS.map(({ id, label }) => (
                  <label
                    key={id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-obsidian/10 px-3 py-2.5 text-sm text-obsidian/75 hover:border-ember/30 has-[:checked]:border-ember/40 has-[:checked]:bg-ember/[0.04]"
                  >
                    <input type="checkbox" name={`interest-${id}`} defaultChecked={id === 'wholesale'} className="rounded accent-ember text-ember focus:ring-ember/30" />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <label className={labelCls} htmlFor="ws-notes">Anything else</label>
              <textarea
                id="ws-notes"
                name="notes"
                rows={3}
                placeholder="Brands you pour most, opening hours, when you usually restock…"
                className={`${inputCls} resize-y`}
              />
            </div>
            {error && <p className="text-sm text-ember">{error}</p>}
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={busy}
                className="btn-brand inline-flex items-center gap-2 px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em]"
              >
                {busy ? 'Sending…' : 'Apply for wholesale'}
                {!busy && <ArrowRight size={15} />}
              </button>
              <p className="text-xs text-obsidian/45">Adults 18+ only. We never share your details.</p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  const id = `ws-${name}`;
  return (
    <div>
      <label className={labelCls} htmlFor={id}>{label}</label>
      <input id={id} name={name} type={type} required={required} placeholder={placeholder} autoComplete={autoComplete} className={inputCls} />
    </div>
  );
}

/* ── Price list + order estimator ────────────────────────────────── */

export function PricesPanel() {
  const [cat, setCat] = useState<DrinkCategory | 'all'>('all');
  const [q, setQ] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return WHOLESALE_DRINKS.filter((d) => (cat === 'all' || d.category === cat))
      .filter((d) => !needle || `${d.name} ${d.brand ?? ''}`.toLowerCase().includes(needle))
      .sort((a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) || b.priceNgn - a.priceNgn);
  }, [cat, q]);

  const lines = Object.entries(cart)
    .map(([slug, qty]) => ({ drink: getDrinkBySlug(slug), qty }))
    .filter((l): l is { drink: NonNullable<typeof l.drink>; qty: number } => Boolean(l.drink) && l.qty > 0);
  const total = lines.reduce((n, l) => n + wholesalePriceNgn(l.drink.priceNgn) * l.qty, 0);
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

  const cats = CATEGORIES.filter((c) => WHOLESALE_DRINKS.some((d) => d.category === c));

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-5">
        <p className="text-sm leading-relaxed text-obsidian/60">
          Every bottle we carry, at partner rates. Add cases to estimate a restock — this doesn’t place an order. Live
          prices are confirmed in your partner desk when you order.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search bottles</span>
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-obsidian/35" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search a bottle or brand"
              className="w-full rounded-full border border-obsidian/12 bg-white py-2.5 pl-10 pr-4 text-base focus:border-ember focus:ring-0 sm:text-sm"
            />
          </label>
        </div>
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
            const unit = wholesalePriceNgn(d.priceNgn);
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
                <div className="hidden text-right sm:block">
                  <p className="text-[11px] text-obsidian/35 line-through tabular-nums">{formatNgn(d.priceNgn)}</p>
                  <p className="text-sm font-bold tabular-nums text-obsidian">{formatNgn(unit)}</p>
                </div>
                <div className="hidden w-28 text-right md:block">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-obsidian/35">Case of {CASE_SIZE}</p>
                  <p className="text-sm tabular-nums text-obsidian/70">{formatNgn(unit * CASE_SIZE)}</p>
                </div>
                <div className="text-right sm:hidden">
                  <p className="text-sm font-bold tabular-nums">{formatNgn(unit)}</p>
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
        {lines.length > 0 && (
          <div className="sticky bottom-3 z-10 flex items-center justify-between gap-3 rounded-2xl bg-obsidian px-4 py-3 text-white shadow-lg lg:hidden">
            <div>
              <p className="font-serif text-xl font-light tabular-nums">{formatNgn(total)}</p>
              <p className="text-[11px] text-white/55">
                Save {formatNgn(retail - total)} · {pointsFor(total).toLocaleString()} pts
              </p>
            </div>
            <OpenLink to="apply" className="shrink-0 rounded-full bg-white px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-obsidian">
              Apply
            </OpenLink>
          </div>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-2">
        <div className="rounded-3xl bg-obsidian p-6 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Restock estimate</p>
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
              Clear estimate
            </button>
          )}
        </div>
        <OpenLink
          to="apply"
          className="btn-brand flex w-full items-center justify-center gap-2 px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em]"
        >
          Apply to order at these prices <ArrowRight size={14} />
        </OpenLink>
        <p className="px-1 text-xs leading-relaxed text-obsidian/45">
          Up to {MAX_PER_SKU} bottles per product on one order. Already a partner?{' '}
          <Link href="/partners/portal" className="font-semibold text-ember">Order from your desk</Link>.
        </p>
      </aside>
    </div>
  );
}

/* ── Margin calculator ───────────────────────────────────────────── */

const MARGIN_DRINKS = WHOLESALE_DRINKS.filter((d) => d.category !== 'party-packs');

export function MarginPanel() {
  const first = MARGIN_DRINKS.find((d) => d.category === 'cognac') ?? MARGIN_DRINKS[0];
  const [slug, setSlug] = useState(first?.slug ?? '');
  const seed = itemFromCatalogSlug(slug);
  const [retailCost, setRetailCost] = useState<number | null>(null);
  const [sell, setSell] = useState(seed?.sellPriceNgn ?? 0);
  const [servings, setServings] = useState(seed?.servingsPerBottle ?? 16);
  const [perMonth, setPerMonth] = useState(12);
  const [target, setTarget] = useState(72);

  const drink = getDrinkBySlug(slug);
  const wholesale = drink ? wholesalePriceNgn(drink.priceNgn) : 0;
  const nowPaying = retailCost ?? drink?.priceNgn ?? 0;

  function pick(next: string) {
    setSlug(next);
    const s = itemFromCatalogSlug(next);
    if (s) {
      setSell(s.sellPriceNgn);
      setServings(s.servingsPerBottle);
    }
    setRetailCost(null);
  }

  const base = { id: 'x', slug, name: drink?.name ?? '', category: drink?.category ?? null, sellPriceNgn: sell, servingsPerBottle: servings, bottlesPerMonth: perMonth };
  const atWholesale = analyseItem({ ...base, bottleCostNgn: wholesale }, target);
  const atCurrent = analyseItem({ ...base, bottleCostNgn: nowPaying }, target);
  const monthlyGain = atWholesale.monthlyProfitNgn - atCurrent.monthlyProfitNgn;

  const verdict =
    atWholesale.verdict === 'under'
      ? { text: `Under your ${target}% target — try ${formatNgn(atWholesale.suggestedPriceNgn)} a serve.`, cls: 'bg-ember text-white' }
      : atWholesale.verdict === 'premium'
        ? { text: 'Priced at a premium — strong margin, watch the volume.', cls: 'bg-obsidian text-white' }
        : { text: 'On target for a healthy bar margin.', cls: 'bg-palm text-white' };

  const num = (v: string) => Math.max(0, Number(v) || 0);

  return (
    <div className="space-y-8">
      <p className="max-w-2xl text-sm leading-relaxed text-obsidian/60">
        Pick a bottle, set your menu price, and see what it earns at partner rates against what you pay now. Bar
        managers aim for a pour cost around 20–30% (a 70–80% margin) on spirits.
      </p>
      <div className="grid items-start gap-8 lg:grid-cols-12">
        <div className="space-y-5 rounded-3xl border border-obsidian/8 bg-white p-6 sm:p-7 lg:col-span-5">
          <div>
            <label className={labelCls} htmlFor="mg-drink">Bottle</label>
            <select id="mg-drink" value={slug} onChange={(e) => pick(e.target.value)} className={inputCls}>
              {CATEGORIES.filter((c) => c !== 'party-packs').map((c) => {
                const ds = MARGIN_DRINKS.filter((d) => d.category === c);
                if (!ds.length) return null;
                return (
                  <optgroup key={c} label={CATEGORY_LABELS[c]}>
                    {ds.map((d) => (
                      <option key={d.slug} value={d.slug}>{d.name}</option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <NumField id="mg-now" label="You pay now / bottle" value={nowPaying} onChange={(v) => setRetailCost(num(v))} />
            <div>
              <span className={labelCls}>Partner price</span>
              <p className="rounded-xl border border-ember/20 bg-ember/[0.05] px-3 py-2.5 text-base font-semibold tabular-nums text-ember">
                {formatNgn(wholesale)}
              </p>
            </div>
            <NumField id="mg-sell" label="Menu price / serve" value={sell} onChange={(v) => setSell(num(v))} />
            <NumField
              id="mg-serves"
              label="Serves / bottle"
              value={servings}
              onChange={(v) => setServings(Math.max(1, num(v)))}
              hint={`Typical: ${defaultServings(drink?.category ?? null)}`}
            />
            <NumField id="mg-month" label="Bottles / month" value={perMonth} onChange={(v) => setPerMonth(num(v))} />
            <div>
              <label className={labelCls} htmlFor="mg-target">Target margin · {target}%</label>
              <input
                id="mg-target"
                type="range"
                min={50}
                max={85}
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="mt-3 w-full accent-ember"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-7">
          <div className={`rounded-2xl px-5 py-4 text-sm font-semibold ${verdict.cls}`}>{verdict.text}</div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Gross margin" value={`${atWholesale.grossMarginPct}%`} tone="ember" />
            <Stat label="Pour cost" value={`${atWholesale.pourCostPct}%`} />
            <Stat label="Cost per serve" value={formatNgn(atWholesale.costPerServingNgn)} />
            <Stat label="Profit / bottle" value={formatNgn(atWholesale.profitPerBottleNgn)} />
            <Stat label="Break-even" value={`${atWholesale.breakevenServings} serves`} />
            <Stat label="Profit / month" value={formatNgn(atWholesale.monthlyProfitNgn)} tone="dark" />
          </div>
          <div className="rounded-2xl border border-obsidian/8 bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-obsidian/45">Switching to partner rates</p>
            <p className="mt-2 text-sm leading-relaxed text-obsidian/65">
              At {formatNgn(nowPaying)} a bottle your margin is <strong className="text-obsidian">{atCurrent.grossMarginPct}%</strong>.
              At partner price it’s <strong className="text-obsidian">{atWholesale.grossMarginPct}%</strong>
              {monthlyGain > 0 ? (
                <>
                  {' '}— <strong className="text-ember">{formatNgn(monthlyGain)} more profit a month</strong> on this bottle
                  alone, {formatNgn(monthlyGain * 12)} a year.
                </>
              ) : (
                '.'
              )}
            </p>
          </div>
          <p className="text-xs text-obsidian/45">
            Partners get the full margin desk — every bottle on your menu, saved, with under-priced lines flagged.
          </p>
        </div>
      </div>
    </div>
  );
}

function NumField({ id, label, value, onChange, hint }: { id: string; label: string; value: number; onChange: (v: string) => void; hint?: string }) {
  return (
    <div>
      <label className={labelCls} htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} tabular-nums`}
      />
      {hint && <p className="mt-1 text-[11px] text-obsidian/40">{hint}</p>}
    </div>
  );
}

/* ── How it works ────────────────────────────────────────────────── */

const STEPS: [string, string][] = [
  ['Apply', 'Tell us about your venue, your area and roughly what you move each month.'],
  ['Agree terms', 'A short call, then a partner agreement covering delivery zones, payment and credit.'],
  ['Order from your desk', `Sign in, pick bottles at ${WHOLESALE_OFF_PCT}% below retail, up to ${MAX_PER_SKU} per product.`],
  ['Pay or use credit', 'Pay securely through Flutterwave, or on two weeks’ credit once your agreement is signed.'],
  ['We deliver', 'Dispatched to your venue, with a tracking reference in your desk from the moment it leaves.'],
  ['Confirm & earn', 'Tap “Confirm received” — your stock count updates and Premium points land.'],
];

export function HowPanel() {
  return (
    <div className="space-y-10">
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map(([t, b], i) => (
          <li key={t} className="relative rounded-2xl border border-obsidian/8 bg-white p-5">
            <span className="font-serif text-4xl font-light text-ember/25 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
            <p className="mt-2 font-semibold text-obsidian">{t}</p>
            <p className="mt-1 text-sm leading-relaxed text-obsidian/55">{b}</p>
          </li>
        ))}
      </ol>
      <Block title="Who we supply">
        <div className="flex flex-wrap gap-2">
          {VENUE_KINDS.map((k) => (
            <span key={k} className="rounded-full border border-obsidian/10 bg-white px-4 py-2 text-sm font-semibold capitalize text-obsidian/75">
              {k === 'events' ? 'Event spaces' : k === 'beach' ? 'Beach clubs' : `${k}s`}
            </span>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-obsidian/55">
          Running a one-off party rather than a venue? The <Link href="/party-planner" className="font-semibold text-ember">Party Planner</Link> works
          out quantities and delivers at retail.
        </p>
      </Block>
      <OpenLink to="apply" className="btn-brand inline-flex items-center gap-2 px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em]">
        Start your application <ArrowRight size={14} />
      </OpenLink>
    </div>
  );
}

/* ── Terms ───────────────────────────────────────────────────────── */

const TERMS: [string, string][] = [
  ['Partner pricing', `Approved outlets buy at ${WHOLESALE_OFF_PCT}% below our retail price on every bottle we carry. The price shown when you order is the price you pay.`],
  ['Order sizes', `Order 1 to ${MAX_PER_SKU} bottles of any product per order, across up to 100 lines. Need more of something for a big night? Ask us before you order.`],
  ['Payment', 'Orders are confirmed once payment clears through Flutterwave. Your desk shows each order as awaiting payment, dispatched or received.'],
  ['Two weeks’ credit', 'Once your partner agreement is signed, approved outlets can order on 14-day terms. Limits are agreed with you and reviewed as you trade.'],
  ['Delivery', 'We deliver to enabled zones in supported areas across Nigeria. Each dispatched order carries a tracking reference in your desk.'],
  ['Receiving stock', 'Check the delivery against the order, then tap “Confirm received”. That updates your on-hand stock and releases your Premium points.'],
  ['Short, damaged or wrong items', 'Tell support the same day with your order reference and photos. Keep the packaging, and don’t return anything until we’ve given instructions.'],
  ['Responsible service', 'Convivia24 supplies adults 18+ only. Partners agree to serve responsibly and follow local licensing rules for their premises.'],
];

export function TermsPanel() {
  return (
    <div className="space-y-6">
      <QA items={TERMS} />
      <p className="text-sm text-obsidian/50">
        Full details are in your partner agreement and our <Link href="/terms-of-use" className="font-semibold text-ember">terms of use</Link>.
      </p>
    </div>
  );
}

/* ── Premium card & perks ────────────────────────────────────────── */

export function PerksPanel() {
  const example = 750000;
  return (
    <div className="grid items-start gap-10 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-5">
        <ConviviumCard kind="premium" tier="Premium" name="Your venue" points={pointsFor(example)} />
        <p className="text-sm leading-relaxed text-obsidian/60">
          Every partner gets a Premium card. Wholesale spend banks <strong className="text-obsidian">2 points per ₦100</strong>,
          credited when you confirm a delivery.
        </p>
      </div>
      <div className="space-y-8 lg:col-span-7">
        <Block title="Turn points into guest gift cards">
          <ul className="space-y-3">
            {PREMIUM_CONVERSIONS.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 rounded-2xl border border-obsidian/8 bg-white p-4">
                <div>
                  <p className="font-semibold text-obsidian">{c.label}</p>
                  <p className="text-xs text-obsidian/45">
                    Equivalent to {formatNgn(c.points * 50)} of wholesale orders
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-ember/10 px-3 py-1.5 text-xs font-bold tabular-nums text-ember">
                  {c.points.toLocaleString()} pts
                </span>
              </li>
            ))}
          </ul>
          <p className="text-sm leading-relaxed text-obsidian/55">
            Hand the code to a regular, a birthday table or a promoter. Guests load it on their{' '}
            <Link href="/guest-card" className="font-semibold text-ember">Guest Card</Link> and spend it at checkout — so your perk
            brings them back to you.
          </p>
        </Block>
        <div className="rounded-2xl border border-ember/20 bg-ember/[0.05] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ember">Worked example</p>
          <p className="mt-2 text-sm leading-relaxed text-obsidian/70">
            A lounge restocking {formatNgn(example)} a month earns {pointsFor(example).toLocaleString()} points — a{' '}
            {formatNgn(60000)} gift card every month, on top of {formatNgn(Math.round(example / (1 - WHOLESALE_OFF_PCT / 100)) - example)} saved against retail.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Partner desk ────────────────────────────────────────────────── */

const DESK: [string, string][] = [
  ['Restock', 'The full range at partner rates, with your basket and order history in one place.'],
  ['Inventory', 'Keep on-hand counts per bottle; low lines are flagged and one tap adds a case.'],
  ['Margin desk', 'Your whole menu priced against target, with under-priced serves called out.'],
  ['Premium card', 'Points balance, conversions and every gift-card code you’ve issued.'],
];

export function DeskPanel() {
  const { user, loading } = useUser();
  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2">
        {DESK.map(([t, b]) => (
          <div key={t} className="rounded-2xl border border-obsidian/8 bg-white p-5">
            <p className="font-semibold text-obsidian">{t}</p>
            <p className="mt-1 text-sm leading-relaxed text-obsidian/55">{b}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4 rounded-3xl bg-shell p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="font-serif text-2xl font-light text-obsidian">
            {loading ? 'Checking your account…' : user ? 'You’re signed in.' : 'Already approved?'}
          </p>
          <p className="mt-1 text-sm text-obsidian/55">
            {user ? 'Open your desk to order, count stock and use your points.' : 'Sign in with the email on your application.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={user ? '/partners/portal' : '/signin?next=/partners/portal'}
            className="btn-brand inline-flex items-center gap-2 px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em]"
          >
            {user ? 'Open partner desk' : 'Sign in'} <ArrowRight size={14} />
          </Link>
          {!user && (
            <OpenLink to="apply" className="px-2 text-sm font-semibold text-ember">
              Not a partner yet? Apply
            </OpenLink>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Help ────────────────────────────────────────────────────────── */

const FAQ: [string, string][] = [
  ['Do I need a minimum order?', 'No fixed minimum. Most partners restock weekly by the case; delivery to your zone is quoted on the order.'],
  ['How fast is delivery?', 'It depends on your zone and the time you order. Your desk shows a tracking reference once an order is dispatched, and we’ll agree typical cut-off times with you when you sign up.'],
  ['What if a bottle looks wrong?', 'Report it the same day from support with your order reference and photos, and keep the packaging. We investigate every report with the supplier.'],
  ['What if a bottle runs out mid-week?', 'Order as often as you need. The inventory view flags low lines so you can top up before the weekend.'],
  ['Can I get a brand you don’t list?', 'Ask us. If enough venues want it, we talk to the brand — and brands can apply to be carried from the contact page.'],
  ['How do I use my points?', 'Points sit on your Premium card until you convert them into gift-card codes in your desk. Each code is redeemable at Convivia24 checkout.'],
];

export function HelpPanel() {
  return (
    <div className="space-y-10">
      <Block title="Questions partners ask">
        <Accordion items={FAQ} />
      </Block>
      <Block title="Not a venue?">
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/brands/portal" className="group rounded-2xl border border-obsidian/8 bg-white p-5 transition-colors hover:border-ember/30">
            <p className="flex items-center justify-between font-semibold text-obsidian">
              Brands <ArrowRight size={15} className="text-obsidian/30 transition-transform group-hover:translate-x-0.5 group-hover:text-ember" />
            </p>
            <p className="mt-1 text-sm text-obsidian/55">Campaigns, listings and distribution for spirit houses and importers.</p>
          </Link>
          <Link href="/supplier" className="group rounded-2xl border border-obsidian/8 bg-white p-5 transition-colors hover:border-ember/30">
            <p className="flex items-center justify-between font-semibold text-obsidian">
              Suppliers <ArrowRight size={15} className="text-obsidian/30 transition-transform group-hover:translate-x-0.5 group-hover:text-ember" />
            </p>
            <p className="mt-1 text-sm text-obsidian/55">Supply stock to Convivia24 through the supplier portal.</p>
          </Link>
        </div>
      </Block>
      <p className="text-sm text-obsidian/50">
        Still stuck? <a href={SUPPORT_MAILTO} className="font-semibold text-ember">{SUPPORT_EMAIL}</a> ·{' '}
        <Link href="/support" className="font-semibold text-ember">Support</Link>
      </p>
    </div>
  );
}
