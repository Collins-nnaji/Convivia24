'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { formatNgn } from '@/lib/drinks/catalog';
import { skuMargin } from '@/lib/suppliers/margin';
import type { Supplier, SupplierInput } from '@/lib/suppliers/repo';
import type { SupplierAuditEntry } from '@/lib/suppliers/audit';
import { useDialogs } from './ui/DialogProvider';
import SupplierForm from './SupplierForm';
import SupplierPortalPanel from './SupplierPortalPanel';
import { readError } from './types';

type CatalogRow = {
  slug: string;
  name: string;
  category: string | null;
  priceNgn: number | null;
  defaultCostNgn: number | null;
  costs: Record<string, number>;
};

type AuditRow = SupplierAuditEntry & { text: string };

type Pane = 'prices' | 'activity';

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
  const { confirm, notify } = useDialogs();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [catalog, setCatalog] = useState<CatalogRow[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'none' | 'create' | 'edit'>('none');
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
      const rows: Supplier[] = supplierData.suppliers || [];
      setSuppliers(rows);
      setCatalog(catalogData.catalog || []);
      if (feedRes.ok) setFeed((await feedRes.json()).entries || []);
      setSelectedId((current) => current || rows.find((s) => s.active)?.id || rows[0]?.id || '');
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
    setSaving(true);
    try {
      const editing = mode === 'edit' && selected;
      const res = await fetch('/api/admin/suppliers', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing ? { id: selected.id, ...input } : input),
      });
      if (!res.ok) {
        setError(await readError(res, 'Unable to save supplier.'));
        return;
      }
      const data = await res.json();
      setMode('none');
      setError('');
      notify(editing ? 'Supplier updated.' : `${data.supplier?.name} created — issue them an access key below.`);
      if (!editing && data.supplier?.id) setSelectedId(data.supplier.id);
      await reloadAll();
    } finally {
      setSaving(false);
    }
  }

  async function removeSupplier(s: Supplier) {
    const ok = await confirm({
      title: 'Remove this supplier?',
      message: (
        <>
          <strong>{s.name}</strong> is removed. If they already have sourced orders they are deactivated rather than deleted,
          so the order history stays intact.
        </>
      ),
      confirmLabel: 'Remove supplier',
      tone: 'danger',
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/suppliers?id=${encodeURIComponent(s.id)}`, { method: 'DELETE' });
    if (!res.ok) {
      setError(await readError(res, 'Unable to remove supplier.'));
      return;
    }
    if (selectedId === s.id) setSelectedId('');
    await reloadAll();
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
          ['Active suppliers', String(suppliers.filter((s) => s.active).length)],
          ['With portal access', String(suppliers.filter((s) => s.hasAccessKey && s.portalEnabled).length)],
          ['SKUs in catalog', String(catalog.length)],
          ['Avg margin (selected)', selected && summary ? `${summary.avgMarginPct}%` : '—'],
        ].map(([label, value]) => (
          <div key={label} className="bg-white p-4">
            <p className="text-[10px] uppercase tracking-wider text-obsidian/40">{label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-obsidian">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/40">Suppliers</h2>
            <div className="flex items-center gap-2">
              <button type="button" onClick={reloadAll} className="text-obsidian/50 hover:text-obsidian" title="Refresh">
                <RefreshCw size={12} />
              </button>
              <button
                type="button"
                onClick={() => setMode((m) => (m === 'create' ? 'none' : 'create'))}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-ember hover:text-ember/80"
              >
                <Plus size={12} /> Add
              </button>
            </div>
          </div>

          {mode === 'create' && <SupplierForm saving={saving} onSubmit={submitSupplier} onCancel={() => setMode('none')} />}

          {loading && suppliers.length === 0 ? (
            <p className="text-sm text-obsidian/45">Loading…</p>
          ) : suppliers.length === 0 ? (
            <p className="text-sm text-obsidian/45">Add your first wholesaler to start tracking costs per SKU.</p>
          ) : (
            <ul className="space-y-2">
              {suppliers.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(s.id);
                      setMode('none');
                    }}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      selectedId === s.id ? 'border-ember bg-ember/[0.04]' : 'border-obsidian/10 bg-white hover:border-obsidian/20'
                    }`}
                  >
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <span className="truncate">{s.name}</span>
                      {s.hasAccessKey && s.portalEnabled && (
                        <span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-700">portal</span>
                      )}
                      {!s.active && <span className="shrink-0 text-[9px] font-black uppercase tracking-wider text-obsidian/35">inactive</span>}
                    </p>
                    <p className="truncate text-[11px] text-obsidian/45">
                      {s.city} · {s.phone || s.contactName || 'No contact'}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {feed.length > 0 && (
            <div className="pt-4">
              <h2 className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/40">Latest across suppliers</h2>
              <ul className="space-y-1.5 text-[12px] text-obsidian/65">
                {feed.slice(0, 8).map((e) => (
                  <li key={e.id} className="leading-snug">
                    <span className="font-semibold text-obsidian">{e.supplierName}</span>{' '}
                    <span className="text-obsidian/40">{e.actor === 'admin' ? '(desk)' : e.actor === 'system' ? '(system)' : ''}</span> {e.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <section className="min-w-0 space-y-5">
          {!selected ? (
            <div className="rounded-2xl border border-obsidian/10 bg-white p-8 text-center text-sm text-obsidian/50">
              Select a supplier to manage their portal, wholesale costs and activity.
            </div>
          ) : mode === 'edit' ? (
            <SupplierForm initial={selected} saving={saving} onSubmit={submitSupplier} onCancel={() => setMode('none')} />
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-obsidian">{selected.name}</h2>
                  <p className="mt-1 text-sm text-obsidian/50">
                    {selected.city}
                    {selected.areas.length ? ` · ${selected.areas.join(', ')}` : ' · anywhere in city'}
                    {selected.sameDay ? ' · same-day' : ''}
                    {summary ? ` · ${summary.priced} of ${summary.total} SKUs priced` : ''}
                  </p>
                  <p className="text-xs text-obsidian/45">
                    {[selected.contactName, selected.phone, selected.email].filter(Boolean).join(' · ') || 'No contact on file'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setMode('edit')} className="inline-flex items-center gap-1.5 rounded-lg border border-obsidian/15 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/70 hover:border-ember hover:text-ember">
                    <Pencil size={12} /> Edit
                  </button>
                  <button type="button" onClick={() => removeSupplier(selected)} className="grid h-9 w-9 place-items-center rounded-lg text-obsidian/35 hover:bg-red-50 hover:text-red-600" title="Remove supplier">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <SupplierPortalPanel supplier={selected} onChanged={reloadAll} />

              <div className="flex gap-1 border-b border-obsidian/10">
                {(['prices', 'activity'] as Pane[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPane(p)}
                    className={`-mb-px border-b-2 px-3 py-2 text-xs font-bold ${
                      pane === p ? 'border-ember text-ember' : 'border-transparent text-obsidian/50 hover:text-obsidian'
                    }`}
                  >
                    {p === 'prices' ? 'Wholesale costs' : `Activity (${activity.length})`}
                  </button>
                ))}
              </div>

              {pane === 'activity' ? (
                <>
                  <p className="text-sm text-obsidian/50">
                    Everything done on this supplier&apos;s shelf, orders and access — by them in their portal, by the desk, or by routing.
                  </p>
                  <ActivityList entries={activity} />
                </>
              ) : (
                <>
                  <label className="relative block">
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
                          <th className="px-3 py-3 text-right">Supplier cost</th>
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
                              <td className="px-3 py-3">
                                <p className="font-medium text-obsidian">{row.name}</p>
                                <p className="font-mono text-[11px] text-obsidian/40">{row.slug}</p>
                              </td>
                              <td className="px-3 py-3 text-right tabular-nums">{row.priceNgn ? formatNgn(row.priceNgn) : '—'}</td>
                              <td className="px-3 py-3 text-right">
                                <input
                                  type="number"
                                  min={0}
                                  inputMode="numeric"
                                  value={value}
                                  onChange={(e) => setDraftCosts((d) => ({ ...d, [row.slug]: e.target.value }))}
                                  placeholder="Cost"
                                  className="w-28 rounded border border-obsidian/15 px-2 py-1.5 text-right text-sm tabular-nums focus:border-ember focus:ring-0"
                                />
                              </td>
                              <td className="px-3 py-3 text-right">
                                <MarginBadge retail={row.priceNgn} cost={marginCost} />
                              </td>
                              <td className="px-3 py-3 text-right">
                                <button
                                  type="button"
                                  disabled={!dirty || savingSlug === row.slug}
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
                    Suppliers can also set these from their own portal. Saved costs sync to the Drinks tab as the default wholesale cost per SKU.
                  </p>
                </>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
