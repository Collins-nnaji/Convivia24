'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Plus, Search } from 'lucide-react';
import { formatNgn } from '@/lib/drinks/catalog';
import { skuMargin } from '@/lib/suppliers/margin';
import { useDialogs } from '@/components/admin/ui/DialogProvider';
import { AdminSelect, adminInputClass } from '@/components/admin/ui/Fields';
import { readError, type ShelfRow } from './types';
import SupplierBottleRequests from './SupplierBottleRequests';

/**
 * The supplier's shelf. Listed SKUs first, with stock and their quote editable inline (saves on
 * blur); the rest of the catalog below so they can add a bottle in one click.
 */
export default function SupplierStockDesk({
  base,
  shelf,
  onChanged,
}: {
  base: string;
  shelf: ShelfRow[];
  onChanged: () => Promise<unknown>;
}) {
  const { confirm, notify } = useDialogs();
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'listed' | 'low' | 'catalog'>('listed');
  const [busySlug, setBusySlug] = useState('');

  const listed = useMemo(() => shelf.filter((r) => r.onHand != null), [shelf]);
  const unlisted = useMemo(() => shelf.filter((r) => r.onHand == null), [shelf]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = view === 'catalog' ? unlisted : view === 'low' ? listed.filter((r) => r.available <= 2) : listed;
    if (!q) return pool;
    return pool.filter((r) => `${r.name} ${r.brand ?? ''} ${r.category ?? ''}`.toLowerCase().includes(q));
  }, [query, view, listed, unlisted]);

  async function save(slug: string, patch: { onHand?: number; costNgn?: number }) {
    setBusySlug(slug);
    try {
      const res = await fetch(`${base}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, ...patch }),
      });
      if (!res.ok) {
        notify(await readError(res, 'Could not update stock.'), 'error');
        return false;
      }
      await onChanged();
      return true;
    } finally {
      setBusySlug('');
    }
  }

  async function remove(row: ShelfRow) {
    const ok = await confirm({
      title: `Take ${row.name} off your shelf?`,
      message: 'Convivia24 stops routing orders for it to you until you list it again. Your quote is removed too.',
      confirmLabel: 'Remove',
      tone: 'danger',
    });
    if (!ok) return;
    setBusySlug(row.slug);
    const res = await fetch(`${base}/stock?slug=${encodeURIComponent(row.slug)}`, { method: 'DELETE' });
    setBusySlug('');
    if (!res.ok) {
      notify(await readError(res, 'Could not remove it.'), 'error');
      return;
    }
    notify(`${row.name} removed.`);
    await onChanged();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="relative">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-obsidian/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bottles…"
            aria-label="Search"
            className={`${adminInputClass} w-56 py-2 pl-8`}
          />
        </label>
        <AdminSelect
          value={view}
          onChange={(v) => setView(v as typeof view)}
          options={[
            { value: 'listed', label: `On my shelf (${listed.length})` },
            { value: 'low', label: `Running low (${listed.filter((r) => r.available <= 2).length})` },
            { value: 'catalog', label: `Add from catalog (${unlisted.length})` },
          ]}
          className="w-auto py-2"
        />
        <span className="text-xs text-obsidian/45">{rows.length} shown</span>
      </div>

      <p className="mb-4 text-sm text-obsidian/50">
        {view === 'catalog'
          ? 'Bottles Convivia24 sells that you do not stock yet. Add one and set how many you hold.'
          : 'Stock is what you physically hold. Reserved bottles are already promised to paid orders. Your price is what you charge Convivia24 per bottle — orders go to the cheapest supplier who can fill them.'}
      </p>

      <div className="overflow-x-auto rounded-2xl border border-obsidian/10 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-paper text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/45">
            <tr>
              <th className="px-3 py-3 text-left">Bottle</th>
              <th className="px-3 py-3 text-right">Retail</th>
              <th className="px-3 py-3 text-right">My stock</th>
              <th className="px-3 py-3 text-right">Reserved</th>
              <th className="px-3 py-3 text-right">My price</th>
              <th className="px-3 py-3 text-right">Convivia24 margin</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-obsidian/8">
            {rows.map((row) => (
              <ShelfLine key={row.slug} row={row} busy={busySlug === row.slug} onSave={(p) => save(row.slug, p)} onRemove={() => remove(row)} />
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-obsidian/45">
            {view === 'listed' && listed.length === 0 ? 'Nothing on your shelf yet — switch to "Add from catalog".' : 'Nothing matches.'}
          </p>
        )}
      </div>

      <SupplierBottleRequests base={base} onApproved={onChanged} />
    </div>
  );
}

function ShelfLine({
  row,
  busy,
  onSave,
  onRemove,
}: {
  row: ShelfRow;
  busy: boolean;
  onSave: (patch: { onHand?: number; costNgn?: number }) => Promise<boolean>;
  onRemove: () => void;
}) {
  const listed = row.onHand != null;
  const [qty, setQty] = useState(listed ? String(row.onHand) : '');
  const [cost, setCost] = useState(row.costNgn != null ? String(row.costNgn) : '');
  const [adding, setAdding] = useState(false);

  const margin = skuMargin(row.retailNgn, cost === '' ? null : Number(cost));
  const cell = 'w-24 rounded-lg border border-obsidian/12 bg-white px-2 py-1.5 text-right text-sm tabular-nums focus:border-ember focus:ring-0 disabled:opacity-50';

  async function commitQty() {
    const n = Number(qty);
    if (!Number.isFinite(n) || n < 0 || (listed && n === row.onHand)) {
      setQty(listed ? String(row.onHand) : '');
      return;
    }
    await onSave({ onHand: n });
  }
  async function commitCost() {
    const n = Number(cost);
    if (cost === '' || !Number.isFinite(n) || n < 0 || n === row.costNgn) {
      setCost(row.costNgn != null ? String(row.costNgn) : '');
      return;
    }
    await onSave({ costNgn: n });
  }

  return (
    <tr className={`hover:bg-paper/50 ${busy ? 'opacity-60' : ''}`}>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-paper">
            {row.imageUrl ? (
              <Image src={row.imageUrl} alt="" width={44} height={56} className="h-14 w-11 object-contain" />
            ) : (
              <span className="h-8 w-3 rounded-sm bg-obsidian/10" />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-obsidian">{row.name}</p>
            <p className="truncate text-[11px] text-obsidian/40">{[row.brand, row.category].filter(Boolean).join(' · ')}</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums text-obsidian/60">{row.retailNgn != null ? formatNgn(row.retailNgn) : '—'}</td>
      <td className="px-3 py-2.5 text-right">
        {listed || adding ? (
          <input
            type="number"
            min={row.reserved}
            inputMode="numeric"
            value={qty}
            disabled={busy}
            autoFocus={adding}
            onChange={(e) => setQty(e.target.value)}
            onBlur={commitQty}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            className={cell}
            aria-label={`${row.name} stock`}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-ember/40 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-ember hover:bg-ember/5"
          >
            <Plus size={12} /> Add
          </button>
        )}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums text-obsidian/50">
        {listed ? (row.reserved > 0 ? <span className="text-amber-700">{row.reserved}</span> : '0') : '—'}
      </td>
      <td className="px-3 py-2.5 text-right">
        {row.derivedCost ? (
          <span className="inline-block text-right" title="Priced from the bottles inside — set those bottle prices instead">
            <span className="block text-sm font-semibold tabular-nums text-obsidian/70">{row.costNgn != null ? formatNgn(row.costNgn) : '—'}</span>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-obsidian/35">{row.costNgn != null ? 'from bottles' : 'price the bottles'}</span>
          </span>
        ) : (
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={cost}
            disabled={busy || (!listed && !adding)}
            placeholder="₦"
            onChange={(e) => setCost(e.target.value)}
            onBlur={commitCost}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            className={cell}
            aria-label={`${row.name} price`}
          />
        )}
      </td>
      <td className="px-3 py-2.5 text-right text-xs tabular-nums">
        {margin ? (
          <span className={margin.negative ? 'text-red-600' : margin.low ? 'text-amber-700' : 'text-emerald-700'}>{margin.marginPct}%</span>
        ) : (
          <span className="text-obsidian/30">—</span>
        )}
      </td>
      <td className="px-3 py-2.5 text-right">
        {listed && (
          <button type="button" onClick={onRemove} disabled={busy} className="text-[10px] font-black uppercase tracking-wider text-obsidian/40 hover:text-ember disabled:opacity-40">
            Remove
          </button>
        )}
      </td>
    </tr>
  );
}
