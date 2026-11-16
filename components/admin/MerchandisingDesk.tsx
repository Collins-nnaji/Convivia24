'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Search, Star } from 'lucide-react';
import { BADGE_LABELS, CATEGORY_LABELS, DRINKS, PRODUCT_BADGES, formatNgn, type ProductBadge } from '@/lib/drinks/catalog';
import { useDialogs } from './ui/DialogProvider';
import { deskField } from './ui/DeskContent';
import { readError } from './types';

/**
 * Shop picks: which bottles the storefront pushes. Featured → the home page "Handpicked" grid and
 * the top of Recommended; ribbons → "Our top picks" (best seller), staff picks and "New in";
 * a was-price → "Deals". Every change saves on the spot and shows in the shop within a minute.
 */

type Item = {
  slug: string;
  name: string;
  category?: string | null;
  brand?: string | null;
  volume?: string | null;
  price_ngn: number | null;
  image_url: string | null;
  active: boolean;
  featured?: boolean | null;
  badge?: string | null;
  compare_at_ngn?: number | null;
  merch_rank?: number;
};

type Filter = 'all' | 'featured' | 'best-seller' | 'staff-pick' | 'new' | 'offer' | 'none';

const seed = new Map(DRINKS.map((d) => [d.slug, d]));
const isPack = (i: Item) => i.category === 'party-packs' || seed.get(i.slug)?.partyPack === true || seed.get(i.slug)?.sample === true;
/** The shop falls back to the catalog's own flag until the desk sets one. */
const featuredOf = (i: Item) => i.featured ?? seed.get(i.slug)?.featured ?? false;
const onOffer = (i: Item) => i.compare_at_ngn != null && i.price_ngn != null && i.compare_at_ngn > i.price_ngn;

export default function MerchandisingDesk() {
  const { notify } = useDialogs();
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/inventory', { cache: 'no-store' });
    setLoading(false);
    if (!res.ok) {
      setError(await readError(res, 'Could not load the bottles.'));
      return;
    }
    setError('');
    setItems(((await res.json()).items || []) as Item[]);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  async function save(item: Item, patch: Record<string, unknown>, done: string) {
    setSaving(item.slug);
    const res = await fetch('/api/admin/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'adjust', slug: item.slug, ...patch }),
    });
    setSaving('');
    if (!res.ok) {
      setError(await readError(res, 'Could not save.'));
      return;
    }
    const data = await res.json();
    setError('');
    setItems((rows) => rows.map((r) => (r.slug === item.slug ? { ...r, ...(data.item as Item) } : r)));
    notify(done);
  }

  const bottles = useMemo(() => items.filter((i) => !isPack(i)), [items]);
  const counts = useMemo(
    () => ({
      featured: bottles.filter(featuredOf).length,
      best: bottles.filter((i) => i.badge === 'best-seller').length,
      staff: bottles.filter((i) => i.badge === 'staff-pick').length,
      fresh: bottles.filter((i) => i.badge === 'new').length,
      offer: bottles.filter(onOffer).length,
    }),
    [bottles]
  );
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bottles
      .filter((i) => {
        switch (filter) {
          case 'featured':
            return featuredOf(i);
          case 'best-seller':
          case 'staff-pick':
          case 'new':
            return i.badge === filter;
          case 'offer':
            return onOffer(i);
          case 'none':
            return !featuredOf(i) && !i.badge && !onOffer(i);
          default:
            return true;
        }
      })
      .filter((i) => !q || [i.name, i.brand, i.slug, i.category].some((v) => (v || '').toLowerCase().includes(q)))
      .sort((a, b) => Number(featuredOf(b)) - Number(featuredOf(a)) || (b.merch_rank ?? 0) - (a.merch_rank ?? 0) || a.name.localeCompare(b.name));
  }, [bottles, filter, query]);

  const stats: { key: Filter; label: string; value: number; where: string }[] = [
    { key: 'featured', label: 'Featured', value: counts.featured, where: 'Home “Handpicked” + top of the shop' },
    { key: 'best-seller', label: 'Best sellers', value: counts.best, where: '“Our top picks” (with real order data)' },
    { key: 'staff-pick', label: 'Staff picks', value: counts.staff, where: 'Staff picks filter' },
    { key: 'new', label: 'New in', value: counts.fresh, where: '“New in” (with newly listed bottles)' },
    { key: 'offer', label: 'On offer', value: counts.offer, where: 'Deals, with a SAVE badge' },
  ];

  return (
    <div className="space-y-3">
      {/* Each figure is also a filter. */}
      <div className="grid gap-px overflow-hidden rounded-lg border border-obsidian/15 bg-obsidian/15 sm:grid-cols-3 xl:grid-cols-5">
        {stats.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setFilter(filter === s.key ? 'all' : s.key)}
            className={`px-4 py-3 text-left transition-colors ${filter === s.key ? 'bg-obsidian text-white' : 'bg-white hover:bg-obsidian/[0.03]'}`}
          >
            <p className={`text-[11px] font-semibold uppercase tracking-wider ${filter === s.key ? 'text-white/70' : 'text-obsidian/60'}`}>{s.label}</p>
            <p className="mt-0.5 text-2xl font-bold tabular-nums">{s.value}</p>
            <p className={`truncate text-[11px] ${filter === s.key ? 'text-white/70' : 'text-obsidian/55'}`}>{s.where}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-obsidian/50" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search bottles" className={`${deskField} h-9 w-56 py-1.5 pl-8`} />
        </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)} className={`${deskField} h-9 w-auto py-1.5`}>
          <option value="all">All bottles ({bottles.length})</option>
          <option value="featured">Featured</option>
          <option value="best-seller">Best sellers</option>
          <option value="staff-pick">Staff picks</option>
          <option value="new">New in</option>
          <option value="offer">On offer</option>
          <option value="none">Not picked</option>
        </select>
        <span className="text-xs text-obsidian/60">Changes save instantly and show in the shop within a minute.</span>
      </div>

      {error && <p role="alert" className="rounded-md border border-ember/30 bg-ember/5 px-3 py-2 text-sm text-ember">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-obsidian/15">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead className="bg-obsidian/[0.04] text-left text-[11px] font-semibold uppercase tracking-wider text-obsidian/65">
            <tr>
              <th className="py-2 pl-3 pr-2">Bottle</th>
              <th className="px-2 py-2 text-right">Price</th>
              <th className="px-2 py-2 text-center">Featured</th>
              <th className="px-2 py-2">Ribbon</th>
              <th className="px-2 py-2 text-right">Was price (offer)</th>
              <th className="py-2 pl-2 pr-3 text-right">Order</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => (
              <PickRow key={i.slug} item={i} busy={saving === i.slug} onSave={save} onInvalid={setError} />
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="px-4 py-6 text-center text-sm text-obsidian/65">{loading ? 'Loading bottles…' : 'No bottles match.'}</p>}
      </div>
    </div>
  );
}

function PickRow({
  item: i,
  busy,
  onSave,
  onInvalid,
}: {
  item: Item;
  busy: boolean;
  onSave: (i: Item, patch: Record<string, unknown>, done: string) => void;
  onInvalid: (message: string) => void;
}) {
  const featured = featuredOf(i);
  const [was, setWas] = useState(i.compare_at_ngn != null ? String(i.compare_at_ngn) : '');
  const [rank, setRank] = useState(String(i.merch_rank ?? 0));
  useEffect(() => setWas(i.compare_at_ngn != null ? String(i.compare_at_ngn) : ''), [i.compare_at_ngn]);
  useEffect(() => setRank(String(i.merch_rank ?? 0)), [i.merch_rank]);
  const saving = was !== '' && i.price_ngn != null && Number(was) > i.price_ngn ? Number(was) - i.price_ngn : 0;

  const commitWas = () => {
    if (was === (i.compare_at_ngn != null ? String(i.compare_at_ngn) : '')) return;
    if (was !== '' && i.price_ngn != null && Number(was) <= i.price_ngn) {
      setWas(i.compare_at_ngn != null ? String(i.compare_at_ngn) : '');
      onInvalid(`The was-price for ${i.name} must be higher than its price (${formatNgn(i.price_ngn)}).`);
      return;
    }
    onSave(i, { compareAtNgn: was }, was ? `${i.name} is on offer.` : `${i.name} is off offer.`);
  };
  const commitRank = () => {
    if (rank === String(i.merch_rank ?? 0)) return;
    onSave(i, { merchRank: rank || 0 }, `${i.name} reordered.`);
  };

  return (
    <tr className={`border-t border-obsidian/10 align-middle ${featured ? 'bg-saffron/[0.06]' : 'bg-white'} ${busy ? 'opacity-60' : ''}`}>
      <td className="py-2 pl-3 pr-2">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-10 shrink-0 place-items-center overflow-hidden rounded bg-shell ring-1 ring-obsidian/10">
            {i.image_url ? <Image src={i.image_url} alt="" width={40} height={48} className="h-12 w-10 object-contain" /> : <span className="text-[9px] font-bold text-obsidian/50">No pic</span>}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-obsidian">{i.name}</p>
            <p className="truncate text-xs text-obsidian/60">
              {[i.brand, i.category ? CATEGORY_LABELS[i.category as keyof typeof CATEGORY_LABELS] ?? i.category : null, i.volume].filter(Boolean).join(' · ')}
              {!i.active && <span className="ml-1 font-semibold text-red-700">· hidden from shop</span>}
            </p>
          </div>
        </div>
      </td>
      <td className="px-2 py-2 text-right tabular-nums">{i.price_ngn != null ? formatNgn(i.price_ngn) : '—'}</td>
      <td className="px-2 py-2 text-center">
        <button
          type="button"
          role="switch"
          aria-checked={featured}
          aria-label={`Feature ${i.name}`}
          disabled={busy}
          onClick={() => onSave(i, { featured: !featured }, featured ? `${i.name} removed from Featured.` : `${i.name} is featured.`)}
          className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-bold transition-colors ${
            featured ? 'border-saffron bg-saffron text-obsidian' : 'border-obsidian/20 bg-white text-obsidian/60 hover:border-obsidian'
          }`}
        >
          <Star size={13} className={featured ? 'fill-obsidian' : ''} /> {featured ? 'Featured' : 'Feature'}
        </button>
      </td>
      <td className="px-2 py-2">
        <select
          aria-label={`Ribbon for ${i.name}`}
          value={i.badge || ''}
          disabled={busy}
          onChange={(e) => onSave(i, { badge: e.target.value }, e.target.value ? `${i.name}: ${BADGE_LABELS[e.target.value as ProductBadge]}.` : `${i.name}: ribbon removed.`)}
          className={`${deskField} h-8 w-40 py-1 text-xs ${i.badge ? 'border-obsidian font-semibold' : ''}`}
        >
          <option value="">No ribbon</option>
          {PRODUCT_BADGES.map((b) => (
            <option key={b} value={b}>{BADGE_LABELS[b]}</option>
          ))}
        </select>
      </td>
      <td className="px-2 py-2 text-right">
        <input
          type="number"
          min={0}
          inputMode="numeric"
          aria-label={`Was price for ${i.name}`}
          value={was}
          placeholder="—"
          disabled={busy}
          onChange={(e) => setWas(e.target.value)}
          onBlur={commitWas}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          className={`${deskField} h-8 w-28 py-1 text-right text-xs tabular-nums`}
        />
        {saving > 0 && <p className="mt-0.5 text-[11px] font-semibold text-emerald-700">SAVE {formatNgn(saving)}</p>}
      </td>
      <td className="py-2 pl-2 pr-3 text-right">
        <input
          type="number"
          inputMode="numeric"
          aria-label={`Display order for ${i.name}`}
          title="Higher numbers show first"
          value={rank}
          disabled={busy}
          onChange={(e) => setRank(e.target.value)}
          onBlur={commitRank}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          className={`${deskField} h-8 w-16 py-1 text-right text-xs tabular-nums`}
        />
      </td>
    </tr>
  );
}
