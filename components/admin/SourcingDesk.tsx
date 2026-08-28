'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { formatNgn, CATEGORIES, CATEGORY_LABELS } from '@/lib/drinks/catalog';
import { LAGOS_AREAS } from '@/lib/geo/lagos';
import { marginSummary, orderMargin } from '@/lib/suppliers/margin';
import { suggestSuppliers, type Supplier } from '@/lib/suppliers/repo';

/** The slice of an admin order this desk needs. Mirrors /api/admin/orders GET. */
export type SourcingOrder = {
  id: string;
  fullName: string;
  status: string;
  area: string | null;
  totalNgn: number;
  refundedNgn: number;
  supplierId: string | null;
  supplierName: string | null;
  supplierCostNgn: number | null;
  sourcedAt: string | null;
  sourcingNote: string | null;
  createdAt: string;
  items: { slug?: string; name: string; qty: number }[];
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

function shortId(id: string) {
  return id.slice(0, 8);
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function SourcingDesk({
  orders,
  onOrdersChanged,
}: {
  orders: SourcingOrder[];
  onOrdersChanged: () => void;
}) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  /** Per-order draft of { supplierId, cost, note } while the desk is typing. */
  const [drafts, setDrafts] = useState<Record<string, { supplierId: string; cost: string; note: string }>>({});
  const [savingId, setSavingId] = useState('');

  const loadSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/suppliers');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to load suppliers.');
      setSuppliers(data.suppliers || []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load suppliers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const summary = useMemo(
    () =>
      marginSummary(
        orders.map((o) => ({
          totalNgn: o.totalNgn,
          supplierCostNgn: o.supplierCostNgn,
          refundedNgn: o.refundedNgn,
        }))
      ),
    [orders]
  );

  const unsourced = useMemo(() => orders.filter((o) => o.supplierCostNgn == null), [orders]);

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
      await loadSuppliers();
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
      await loadSuppliers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to remove supplier.');
    }
  }

  async function saveSourcing(order: SourcingOrder) {
    const draft = drafts[order.id] || {
      supplierId: order.supplierId || '',
      cost: order.supplierCostNgn?.toString() || '',
      note: order.sourcingNote || '',
    };
    setSavingId(order.id);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'source',
          orderId: order.id,
          supplierId: draft.supplierId,
          supplierCostNgn: draft.supplierId ? draft.cost : null,
          sourcingNote: draft.note,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to save sourcing.');
      setDrafts((d) => {
        const next = { ...d };
        delete next[order.id];
        return next;
      });
      setError('');
      onOrdersChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save sourcing.');
    } finally {
      setSavingId('');
    }
  }

  return (
    <div className="space-y-10">
      {error && <p className="text-sm text-ember">{error}</p>}

      {/* ── Margin summary ─────────────────────────────── */}
      <section>
        <h2 className="text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/40 mb-3">
          Margin · last {orders.length} orders
        </h2>
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-obsidian/10 border border-obsidian/10">
          {[
            ['Revenue', formatNgn(summary.revenueNgn)],
            ['Supplier cost', formatNgn(summary.supplierCostNgn)],
            ['Margin', formatNgn(summary.marginNgn)],
            ['Margin %', `${summary.marginPct}%`],
          ].map(([label, value]) => (
            <div key={label} className="bg-white p-4">
              <dt className="text-[10px] uppercase tracking-wider text-obsidian/40">{label}</dt>
              <dd className="text-lg font-bold text-obsidian mt-1 tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-[11px] text-obsidian/45 mt-2">
          {summary.sourcedOrders} of {summary.orders} orders costed
          {summary.sourcedOrders > 0 && <> · {formatNgn(summary.avgMarginNgn)} average margin</>}.
          {unsourced.length > 0 && (
            <span className="text-ember"> {unsourced.length} still need a supplier cost.</span>
          )}
        </p>
      </section>

      {/* ── Suppliers ──────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between gap-4 mb-3">
          <h2 className="text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/40">
            Suppliers ({suppliers.length})
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadSuppliers}
              className="inline-flex items-center gap-1.5 text-[11px] text-obsidian/50 hover:text-obsidian"
            >
              <RefreshCw size={12} /> Refresh
            </button>
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-1.5 text-[11px] text-ember hover:text-ember-dark"
            >
              <Plus size={12} /> Add supplier
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={createSupplier} className="bg-white border border-obsidian/10 p-4 mb-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                required
                placeholder="Supplier name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border border-obsidian/15 px-3 py-2 text-sm"
              />
              <input
                placeholder="Contact person"
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                className="border border-obsidian/15 px-3 py-2 text-sm"
              />
              <input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="border border-obsidian/15 px-3 py-2 text-sm"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border border-obsidian/15 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-obsidian/40 mb-1.5">
                Delivers to (blank = anywhere)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {AREA_NAMES.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setForm({ ...form, areas: toggle(form.areas, area) })}
                    className={`px-2.5 py-1 text-[11px] border transition-colors ${
                      form.areas.includes(area)
                        ? 'border-ember text-ember bg-ember/5'
                        : 'border-obsidian/15 text-obsidian/50 hover:border-obsidian/30'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-obsidian/40 mb-1.5">Can supply</p>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm({ ...form, categories: toggle(form.categories, cat) })}
                    className={`px-2.5 py-1 text-[11px] border transition-colors ${
                      form.categories.includes(cat)
                        ? 'border-ember text-ember bg-ember/5'
                        : 'border-obsidian/15 text-obsidian/50 hover:border-obsidian/30'
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-obsidian/70">
              <input
                type="checkbox"
                checked={form.sameDay}
                onChange={(e) => setForm({ ...form, sameDay: e.target.checked })}
              />
              Can do same-day
            </label>

            <textarea
              placeholder="Notes — payment terms, minimum order, who to call"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full border border-obsidian/15 px-3 py-2 text-sm"
            />

            <button type="submit" disabled={creating} className="btn-brand text-[11px] px-4 py-2">
              {creating ? 'Saving…' : 'Save supplier'}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-obsidian/45">Loading suppliers…</p>
        ) : suppliers.length === 0 ? (
          <p className="text-sm text-obsidian/45">
            No suppliers yet. Add the wholesalers you actually buy from — you can assign orders to them below.
          </p>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {suppliers.map((s) => (
              <li key={s.id} className="bg-white border border-obsidian/10 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-obsidian truncate">
                      {s.name}
                      {!s.active && <span className="text-obsidian/35 font-normal"> · inactive</span>}
                    </p>
                    <p className="text-[11px] text-obsidian/45">
                      {s.contactName || '—'}
                      {s.phone ? ` · ${s.phone}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${s.name}`}
                    onClick={() => removeSupplier(s.id, s.name)}
                    className="text-obsidian/30 hover:text-ember shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <p className="text-[11px] text-obsidian/50 mt-2">
                  {s.areas.length ? s.areas.join(', ') : `${s.city} — no area limit`}
                </p>
                {s.categories.length > 0 && (
                  <p className="text-[11px] text-obsidian/40 mt-0.5">{s.categories.join(' · ')}</p>
                )}
                {s.sameDay && (
                  <span className="inline-block mt-2 badge-brand text-[8px] font-black uppercase tracking-wider px-2 py-0.5">
                    Same-day
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Order sourcing ─────────────────────────────── */}
      <section>
        <h2 className="text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/40 mb-3">
          Assign orders ({unsourced.length} outstanding)
        </h2>

        {orders.length === 0 ? (
          <p className="text-sm text-obsidian/45">No orders yet.</p>
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => {
              const draft = drafts[order.id] || {
                supplierId: order.supplierId || '',
                cost: order.supplierCostNgn?.toString() || '',
                note: order.sourcingNote || '',
              };
              const setDraft = (patch: Partial<typeof draft>) =>
                setDrafts((d) => ({ ...d, [order.id]: { ...draft, ...patch } }));

              const live = orderMargin({
                totalNgn: order.totalNgn,
                supplierCostNgn: draft.cost === '' ? null : Number(draft.cost),
                refundedNgn: order.refundedNgn,
              });
              const ranked = suggestSuppliers(suppliers, { area: order.area });
              const dirty = Boolean(drafts[order.id]);

              return (
                <li key={order.id} className="bg-white border border-obsidian/10 p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-obsidian">
                        {shortId(order.id)} · {order.fullName}
                      </p>
                      <p className="text-[11px] text-obsidian/45">
                        {order.status} · {order.area || 'no area'} ·{' '}
                        {order.items.map((i) => `${i.name} × ${i.qty}`).join(' · ') || 'no items'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-obsidian tabular-nums">
                        {formatNgn(order.totalNgn)}
                      </p>
                      <p
                        className={`text-[11px] tabular-nums ${
                          live.marginNgn < 0 ? 'text-ember' : 'text-obsidian/45'
                        }`}
                      >
                        {draft.cost === ''
                          ? 'not costed'
                          : `${formatNgn(live.marginNgn)} margin · ${live.marginPct}%`}
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-[minmax(0,1fr)_10rem_auto] gap-2 items-start">
                    <select
                      aria-label="Supplier"
                      value={draft.supplierId}
                      onChange={(e) => setDraft({ supplierId: e.target.value })}
                      className="border border-obsidian/15 px-3 py-2 text-sm bg-white"
                    >
                      <option value="">— not sourced —</option>
                      {ranked.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                          {s.reasons.length ? ` (${s.reasons.join(', ')})` : ''}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min={0}
                      step={1000}
                      inputMode="numeric"
                      aria-label="Supplier cost in naira"
                      placeholder="Supplier cost"
                      value={draft.cost}
                      disabled={!draft.supplierId}
                      onChange={(e) => setDraft({ cost: e.target.value })}
                      className="border border-obsidian/15 px-3 py-2 text-sm tabular-nums disabled:bg-obsidian/5"
                    />

                    <button
                      type="button"
                      onClick={() => saveSourcing(order)}
                      disabled={savingId === order.id || !dirty}
                      className="btn-brand text-[11px] px-4 py-2 disabled:opacity-40"
                    >
                      {savingId === order.id ? 'Saving…' : 'Save'}
                    </button>
                  </div>

                  <input
                    placeholder="Sourcing note — who you spoke to, what was agreed"
                    value={draft.note}
                    onChange={(e) => setDraft({ note: e.target.value })}
                    className="w-full border border-obsidian/15 px-3 py-2 text-sm mt-2"
                  />

                  {order.sourcedAt && !dirty && (
                    <p className="text-[11px] text-obsidian/40 mt-2">
                      Sourced from {order.supplierName || 'a supplier'} on{' '}
                      {new Date(order.sourcedAt).toLocaleDateString()}.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
