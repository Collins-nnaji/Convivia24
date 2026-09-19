'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Pencil, RefreshCw, Search } from 'lucide-react';
import { formatNgn } from '@/lib/drinks/catalog';
import { skuMargin } from '@/lib/suppliers/margin';
import type { Supplier, SupplierInput } from '@/lib/suppliers/repo';
import type { SupplierAuditEntry } from '@/lib/suppliers/audit';
import { useDialogs } from './ui/DialogProvider';
import SupplierForm from './SupplierForm';
import SupplierPortalPanel from './SupplierPortalPanel';
import BottleRequestsPanel from './BottleRequestsPanel';
import { readError } from './types';

type CatalogRow = {
  slug: string;
  name: string;
  category: string | null;
  imageUrl: string | null;
  priceNgn: number | null;
  defaultCostNgn: number | null;
  costs: Record<string, number>;
  derived: boolean;
};

type AuditRow = SupplierAuditEntry & { text: string };

type Pane = 'prices' | 'activity' | 'requests';

function MarginBadge({ retail, cost }: { retail: number | null; cost: number | null }) {
  const margin = skuMargin(retail, cost);
  if (!margin) return <span className="text-[11px] text-obsidian/35">—</span>;
  const tone = margin.negative ? 'text-red-600 bg-red-50' : margin.low ? 'text-amber-700 bg-amber-50' : 'text-emerald-700 bg-emerald-50';
  return (
    <span className={`inline-flex flex-col rounded px-2 py-1 text-[11px] font-semibold tabular-nums ${tone}`}>
      <span>{formatNgn(margin.marginNgn)}</span>
      <span className="font-normal opacity-80">{margin.marginPct}%</span>
    </span>
  );
}

const ACTOR_TONE: Record<SupplierAuditEntry['actor'], string> = {
  supplier: 'bg-ember/10 text-ember',
  admin: 'bg-obsidian text-white',
  system: 'bg-paper text-obsidian/50',
};

function ActivityList({ entries, showSupplier }: { entries: AuditRow[]; showSupplier?: boolean }) {
  if (entries.length === 0) return <p className="text-sm text-obsidian/45">No activity yet.</p>;
  return (
    <ul className="divide-y divide-obsidian/8 rounded-xl border border-obsidian/10 bg-white">
      {entries.map((e) => (
        <li key={e.id} className="flex flex-wrap items-center gap-2.5 px-3 py-2.5 text-sm">
          <span className="w-28 shrink-0 text-[11px] tabular-nums text-obsidian/40">
            {new Date(e.createdAt).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${ACTOR_TONE[e.actor]}`}>
            {e.actor === 'admin' ? 'Desk' : e.actor}
          </span>
          {showSupplier && <span className="font-semibold text-obsidian">{e.supplierName}</span>}
          <span className="text-obsidian/70">{e.text}</span>
          {e.actor === 'supplier' && e.actorLabel && <span className="text-xs text-obsidian/35">({e.actorLabel})</span>}
        </li>
      ))}
    </ul>
  );
}

export default function SuppliersDesk({ onCatalogChanged }: { onCatalogChanged?: () => void }) {
  const { notify } = useDialogs();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [catalog, setCatalog] = useState<CatalogRow[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'none' | 'edit'>('none');
  const [saving, setSaving] = useState(false);
  const [pane, setPane] = useState<Pane>('prices');
  const [draftCosts, setDraftCosts] = useState<Record<string, string>>({});
  const [savingSlug, setSavingSlug] = useState('');
  const [activity, setActivity] = useState<AuditRow[]>([]);
  const [feed, setFeed] = useState<AuditRow[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [supplierRes, catalogRes, feedRes] = await Promise.all([
        fetch('/api/admin/suppliers'),
        fetch('/api/admin/supplier-prices'),
        fetch('/api/admin/suppliers/audit?limit=40'),
      ]);
      const supplierData = await supplierRes.json();
      const catalogData = await catalogRes.json();
      if (!supplierRes.ok) throw new Error(supplierData.error || 'Unable to load suppliers.');
      if (!catalogRes.ok) throw new Error(catalogData.error || 'Unable to load SKU prices.');
      // One active partner fills every order — inactive regionals stay out of the desk.
      const rows: Supplier[] = ((supplierData.suppliers || []) as Supplier[]).filter((s) => s.active);
      setSuppliers(rows);
      setCatalog(catalogData.catalog || []);
      if (feedRes.ok) setFeed((await feedRes.json()).entries || []);
      setSelectedId((current) => {
        if (current && rows.some((s) => s.id === current)) return current;
        return rows[0]?.id || '';
      });
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load suppliers.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadActivity = useCallback(async (supplierId: string) => {
    if (!supplierId) return;
    const res = await fetch(`/api/admin/suppliers/audit?supplierId=${encodeURIComponent(supplierId)}&limit=100`);
    if (res.ok) setActivity((await res.json()).entries || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    loadActivity(selectedId);
  }, [selectedId, loadActivity]);

  const reloadAll = useCallback(async () => {
    await load();
    await loadActivity(selectedId);
    onCatalogChanged?.();
  }, [load, loadActivity, selectedId, onCatalogChanged]);

  const selected = suppliers.find((s) => s.id === selectedId) || null;

  const filteredCatalog = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      (row) =>
        row.name.toLowerCase().includes(q) || row.slug.toLowerCase().includes(q) || (row.category || '').toLowerCase().includes(q)
    );
  }, [catalog, query]);

  const summary = useMemo(() => {
    if (!selected) return null;
    let priced = 0;
    let marginTotal = 0;
    let marginCount = 0;
    for (const row of catalog) {
      const cost = row.costs[selected.id] ?? row.defaultCostNgn;
      const margin = skuMargin(row.priceNgn, cost);
      if (cost != null) priced += 1;
      if (margin) {
        marginTotal += margin.marginPct;
        marginCount += 1;
      }
    }
    return { priced, total: catalog.length, avgMarginPct: marginCount > 0 ? Math.round((marginTotal / marginCount) * 10) / 10 : 0 };
  }, [catalog, selected]);

  async function submitSupplier(input: SupplierInput) {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/suppliers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, ...input }),
      });
      if (!res.ok) {
        setError(await readError(res, 'Unable to save supplier.'));
        return;
      }
      setMode('none');
      setError('');
      notify('Nationwide partner updated.');
      await reloadAll();
    } finally {
      setSaving(false);
    }
  }

  async function saveCost(slug: string) {
    if (!selected) return;
    const raw = draftCosts[slug];
    const existing = catalog.find((row) => row.slug === slug);
    const current = raw ?? String(existing?.costs[selected.id] ?? '');
    const costNgn = Number(current);
    if (!Number.isFinite(costNgn) || costNgn < 0) {
      setError('Enter a valid supplier cost.');
      return;
    }
    setSavingSlug(slug);
    try {
      const res = await fetch('/api/admin/supplier-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierId: selected.id, slug, costNgn }),
      });
      if (!res.ok) {
        setError(await readError(res, 'Unable to save cost.'));
        return;
      }
      setDraftCosts((d) => {
        const next = { ...d };
        delete next[slug];
        return next;
      });
      setError('');
      await reloadAll();
    } finally {
      setSavingSlug('');
    }
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-ember">{error}</p>}

      <div className="grid gap-px overflow-hidden rounded-2xl border border-obsidian/10 bg-obsidian/10 sm:grid-cols-4">
        {[
          ['Partner', selected?.name || '—'],
          ['Portal', selected?.hasAccessKey && selected.portalEnabled ? 'Open' : 'Off'],
          ['SKUs priced', selected && summary ? `${summary.priced}/${summary.total}` : '—'],
          ['Avg margin', selected && summary ? `${summary.avgMarginPct}%` : '—'],
        ].map(([label, value]) => (
          <div key={label} className="bg-white p-4">
            <p className="text-[10px] uppercase tracking-wider text-obsidian/40">{label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-obsidian">{value}</p>
          </div>
        ))}
      </div>

      <section className="min-w-0 space-y-5">
        {loading && !selected ? (
          <p className="text-sm text-obsidian/45">Loading Nationwide partner…</p>
        ) : !selected ? (
          <div className="rounded-2xl border border-obsidian/10 bg-white p-8 text-center text-sm text-obsidian/50">
            No active supplier. Seed Nationwide with <code className="text-xs">npx tsx lib/db/seed-suppliers.ts</code>.
          </div>
        ) : mode === 'edit' ? (
          <SupplierForm initial={selected} saving={saving} onSubmit={submitSupplier} onCancel={() => setMode('none')} />
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-obsidian">{selected.name}</h2>
                  <button type="button" onClick={reloadAll} className="text-obsidian/40 hover:text-obsidian" title="Refresh">
                    <RefreshCw size={14} />
                  </button>
                </div>
                <p className="mt-1 text-sm text-obsidian/50">
                  Single fulfilment partner · {selected.city}
                  {selected.sameDay ? ' · same-day capable' : ''}
                  {summary ? ` · ${summary.priced} of ${summary.total} SKUs priced` : ''}
                </p>
                <p className="text-xs text-obsidian/45">
                  {[selected.contactName, selected.phone, selected.email].filter(Boolean).join(' · ') || 'No contact on file'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMode('edit')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-obsidian/15 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/70 hover:border-ember hover:text-ember"
              >
                <Pencil size={12} /> Edit partner
              </button>
            </div>

            <SupplierPortalPanel supplier={selected} onChanged={reloadAll} />

            <div className="flex gap-1 border-b border-obsidian/10">
              {(['prices', 'activity', 'requests'] as Pane[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPane(p)}
                  className={`-mb-px border-b-2 px-3 py-2 text-xs font-bold ${
                    pane === p ? 'border-ember text-ember' : 'border-transparent text-obsidian/50 hover:text-obsidian'
                  }`}
                >
                  {p === 'prices' ? 'Wholesale costs' : p === 'activity' ? `Activity (${activity.length})` : 'Bottle requests'}
                </button>
              ))}
            </div>

            {pane === 'requests' ? (
              <BottleRequestsPanel onChanged={reloadAll} />
            ) : pane === 'activity' ? (
              <>
                <p className="text-sm text-obsidian/50">
                  Shelf updates, orders and access — from the portal, the desk, or automatic routing.
                </p>
                <ActivityList entries={activity.length ? activity : feed} />
              </>
            ) : (
              <>
                <label className="relative block max-w-md">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian/35" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search SKU…"
                    className="w-full rounded-lg border border-obsidian/10 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-ember focus:ring-0"
                  />
                </label>

                <div className="overflow-x-auto rounded-xl border border-obsidian/10 bg-white">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead className="bg-paper text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/45">
                      <tr>
                        <th className="px-3 py-3 text-left">SKU</th>
                        <th className="px-3 py-3 text-right">Retail</th>
                        <th className="px-3 py-3 text-right">Nationwide cost</th>
                        <th className="px-3 py-3 text-right">Margin</th>
                        <th className="px-3 py-3 text-right">Save</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-obsidian/8">
                      {filteredCatalog.map((row) => {
                        const savedCost = row.costs[selected.id];
                        const draft = draftCosts[row.slug];
                        const value = draft ?? (savedCost != null ? String(savedCost) : '');
                        const dirty = draft != null && draft !== (savedCost != null ? String(savedCost) : '');
                        const marginCost = value !== '' ? Number(value) : savedCost ?? row.defaultCostNgn;
                        return (
                          <tr key={row.slug} className="hover:bg-paper/60">
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-3">
                                <span className="grid h-12 w-9 shrink-0 place-items-center overflow-hidden rounded-md bg-paper">
                                  {row.imageUrl ? <Image src={row.imageUrl} alt="" width={36} height={48} className="h-12 w-9 object-contain" /> : <span className="h-6 w-2 rounded-sm bg-obsidian/10" />}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate font-medium text-obsidian">{row.name}</p>
                                  <p className="truncate font-mono text-[11px] text-obsidian/40">{row.slug}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-right tabular-nums">{row.priceNgn ? formatNgn(row.priceNgn) : '—'}</td>
                            <td className="px-3 py-3 text-right">
                              {row.derived ? (
                                <span className="inline-block text-right" title="Summed from the bottles in the pack — quote those instead">
                                  <span className="block text-sm font-semibold tabular-nums text-obsidian/70">{savedCost != null ? formatNgn(savedCost) : '—'}</span>
                                  <span className="block text-[10px] font-bold uppercase tracking-wider text-obsidian/35">from bottles</span>
                                </span>
                              ) : (
                                <input
                                  type="number"
                                  min={0}
                                  inputMode="numeric"
                                  value={value}
                                  onChange={(e) => setDraftCosts((d) => ({ ...d, [row.slug]: e.target.value }))}
                                  placeholder="Cost"
                                  className="w-28 rounded border border-obsidian/15 px-2 py-1.5 text-right text-sm tabular-nums focus:border-ember focus:ring-0"
                                />
                              )}
                            </td>
                            <td className="px-3 py-3 text-right">
                              <MarginBadge retail={row.priceNgn} cost={marginCost} />
                            </td>
                            <td className="px-3 py-3 text-right">
                              <button
                                type="button"
                                disabled={row.derived || !dirty || savingSlug === row.slug}
                                onClick={() => saveCost(row.slug)}
                                className="border border-obsidian/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] hover:border-ember hover:text-ember disabled:opacity-35"
                              >
                                {savingSlug === row.slug ? '…' : 'Save'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-[11px] text-obsidian/45">
                  Costs sync to the Drinks tab as the wholesale cost per SKU. The partner can also update these from their portal.
                </p>
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}
