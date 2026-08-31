'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatNgn } from '@/lib/drinks/catalog';
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

function shortId(id: string) {
  return id.slice(0, 8);
}

export default function SourcingDesk({
  orders,
  onOrdersChanged,
}: {
  orders: SourcingOrder[];
  onOrdersChanged: () => void;
}) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [error, setError] = useState('');
  /** Per-order draft of { supplierId, cost, note } while the desk is typing. */
  const [drafts, setDrafts] = useState<Record<string, { supplierId: string; cost: string; note: string }>>({});
  const [savingId, setSavingId] = useState('');

  const loadSuppliers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/suppliers');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to load suppliers.');
      setSuppliers(data.suppliers || []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load suppliers.');
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

      {/* ── Order sourcing ─────────────────────────────── */}
      <section>
        <p className="text-sm text-obsidian/50 mb-4">
          Assign fulfilled orders to a supplier and record what they charged. Manage supplier contacts and per-SKU wholesale costs in the <strong>Suppliers</strong> tab.
        </p>
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
