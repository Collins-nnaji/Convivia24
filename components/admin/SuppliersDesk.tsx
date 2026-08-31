'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { formatNgn } from '@/lib/drinks/catalog';
import { LAGOS_AREAS } from '@/lib/geo/lagos';
import { skuMargin } from '@/lib/suppliers/margin';
import { type Supplier } from '@/lib/suppliers/repo';

type CatalogRow = {
  slug: string;
  name: string;
  category: string | null;
  priceNgn: number | null;
  defaultCostNgn: number | null;
  costs: Record<string, number>;
};

const AREA_NAMES = LAGOS_AREAS.map((a) => a.name);
const EMPTY_FORM = {
  name: '',
  contactName: '',
  phone: '',
  email: '',
  city: 'Lagos',
  areas: [] as string[],
  categories: [] as string[],
  sameDay: false,
  notes: '',
};

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

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

export default function SuppliersDesk({ onCatalogChanged }: { onCatalogChanged?: () => void }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [catalog, setCatalog] = useState<CatalogRow[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [draftCosts, setDraftCosts] = useState<Record<string, string>>({});
  const [savingSlug, setSavingSlug] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [supplierRes, catalogRes] = await Promise.all([
        fetch('/api/admin/suppliers'),
        fetch('/api/admin/supplier-prices'),
      ]);
      const supplierData = await supplierRes.json();
      const catalogData = await catalogRes.json();
      if (!supplierRes.ok) throw new Error(supplierData.error || 'Unable to load suppliers.');
      if (!catalogRes.ok) throw new Error(catalogData.error || 'Unable to load SKU prices.');
      const rows = supplierData.suppliers || [];
      setSuppliers(rows);
      setCatalog(catalogData.catalog || []);
      setSelectedId((current) => current || rows.find((s: Supplier) => s.active)?.id || rows[0]?.id || '');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load suppliers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selected = suppliers.find((s) => s.id === selectedId) || null;

  const filteredCatalog = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.slug.toLowerCase().includes(q) ||
        (row.category || '').toLowerCase().includes(q)
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
    return {
      priced,
      total: catalog.length,
      avgMarginPct: marginCount > 0 ? Math.round((marginTotal / marginCount) * 10) / 10 : 0,
    };
  }, [catalog, selected]);

  async function createSupplier(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/admin/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to create supplier.');
      setForm(EMPTY_FORM);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create supplier.');
    } finally {
      setCreating(false);
    }
  }

  async function removeSupplier(id: string, name: string) {
    if (!confirm(`Remove ${name}? If they have sourced orders they are deactivated, not deleted.`)) return;
    try {
      const res = await fetch(`/api/admin/suppliers?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to remove supplier.');
      if (selectedId === id) setSelectedId('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to remove supplier.');
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to save cost.');
      setDraftCosts((d) => {
        const next = { ...d };
        delete next[slug];
        return next;
      });
      setError('');
      await load();
      onCatalogChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save cost.');
    } finally {
      setSavingSlug('');
    }
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-ember">{error}</p>}

      <div className="grid gap-px bg-obsidian/10 border border-obsidian/10 sm:grid-cols-3">
        {[
          ['Suppliers', String(suppliers.filter((s) => s.active).length)],
          ['SKUs in catalog', String(catalog.length)],
          ['Avg margin', selected && summary ? `${summary.avgMarginPct}%` : '—'],
        ].map(([label, value]) => (
          <div key={label} className="bg-white p-4">
            <p className="text-[10px] uppercase tracking-wider text-obsidian/40">{label}</p>
            <p className="mt-1 text-2xl font-bold text-obsidian tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/40">Suppliers</h2>
            <div className="flex items-center gap-2">
              <button type="button" onClick={load} className="text-[11px] text-obsidian/50 hover:text-obsidian">
                <RefreshCw size={12} />
              </button>
              <button type="button" onClick={() => setShowForm((v) => !v)} className="text-[11px] text-ember hover:text-ember-dark">
                <Plus size={12} className="inline" /> Add
              </button>
            </div>
          </div>

          {showForm && (
            <form onSubmit={createSupplier} className="bg-white border border-obsidian/10 p-4 space-y-3">
              <input required placeholder="Supplier name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-obsidian/15 px-3 py-2 text-sm" />
              <input placeholder="Contact" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className="w-full border border-obsidian/15 px-3 py-2 text-sm" />
              <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-obsidian/15 px-3 py-2 text-sm" />
              <div className="flex flex-wrap gap-1">
                {AREA_NAMES.slice(0, 6).map((area) => (
                  <button key={area} type="button" onClick={() => setForm({ ...form, areas: toggle(form.areas, area) })} className={`px-2 py-1 text-[10px] border ${form.areas.includes(area) ? 'border-ember text-ember' : 'border-obsidian/15 text-obsidian/50'}`}>
                    {area}
                  </button>
                ))}
              </div>
              <button type="submit" disabled={creating} className="btn-brand w-full py-2 text-[11px]">
                {creating ? 'Saving…' : 'Save supplier'}
              </button>
            </form>
          )}

          {loading ? (
            <p className="text-sm text-obsidian/45">Loading…</p>
          ) : suppliers.length === 0 ? (
            <p className="text-sm text-obsidian/45">Add your first wholesaler to start tracking costs per SKU.</p>
          ) : (
            <ul className="space-y-2">
              {suppliers.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(s.id)}
                    className={`w-full text-left border p-3 transition-colors ${
                      selectedId === s.id ? 'border-ember bg-ember/[0.04]' : 'border-obsidian/10 bg-white hover:border-obsidian/20'
                    }`}
                  >
                    <p className="font-semibold text-sm truncate">{s.name}</p>
                    <p className="text-[11px] text-obsidian/45 truncate">
                      {s.phone || s.contactName || 'No contact'}
                      {!s.active ? ' · inactive' : ''}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="min-w-0">
          {!selected ? (
            <div className="bg-white border border-obsidian/10 p-8 text-center text-sm text-obsidian/50">
              Select a supplier to manage their wholesale costs and see margins per SKU.
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-obsidian">{selected.name}</h2>
                  <p className="text-sm text-obsidian/50 mt-1">
                    {summary ? `${summary.priced} of ${summary.total} SKUs priced` : '—'}
                    {selected.areas.length ? ` · Delivers: ${selected.areas.join(', ')}` : ''}
                  </p>
                </div>
                <button type="button" onClick={() => removeSupplier(selected.id, selected.name)} className="text-obsidian/35 hover:text-ember">
                  <Trash2 size={16} />
                </button>
              </div>

              <label className="relative mb-4 block">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian/35" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search SKU…"
                  className="w-full rounded-lg border border-obsidian/10 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-ember focus:ring-0"
                />
              </label>

              <div className="overflow-x-auto border border-obsidian/10 bg-white">
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
                            <p className="text-[11px] text-obsidian/40 font-mono">{row.slug}</p>
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
                              className="px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] border border-obsidian/15 disabled:opacity-35 hover:border-ember hover:text-ember"
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

              <p className="mt-3 text-[11px] text-obsidian/45">
                Margins update as you type. Saved costs sync to the Drinks tab as the default wholesale cost for each SKU.
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
