'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { formatNgn } from '@/lib/drinks/catalog';
import { marginSummary, orderMargin } from '@/lib/suppliers/margin';
import type { Supplier } from '@/lib/suppliers/repo';
import type { AdminOrder } from './types';

function shortId(id: string) {
  return id.slice(0, 8);
}

export default function SourcingDesk({
  orders,
  onOrdersChanged,
}: {
  orders: AdminOrder[];
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
      const active = ((data.suppliers || []) as Supplier[]).filter((s) => s.active);
      setSuppliers(active);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load suppliers.');
    }
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const partner = suppliers[0] || null;

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

  /** Cancelled and refunded orders never need a supplier — they'd only inflate the queue. */
  const live = useMemo(
    () => orders.filter((o) => o.status !== 'cancelled' && o.status !== 'refunded'),
    [orders]
  );
  const unsourced = useMemo(() => live.filter((o) => o.supplierCostNgn == null), [live]);

  async function saveSourcing(order: AdminOrder) {
    if (!partner) {
      setError('No active Nationwide supplier is set up.');
      return;
    }
    const draft = drafts[order.id] || {
      supplierId: order.supplierId || partner.id,
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
          supplierId: partner.id,
          supplierCostNgn: draft.cost === '' ? null : draft.cost,
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
          Record what Nationwide charged for each order. Manage wholesale costs per SKU in the <strong>Supplier</strong> tab.
        </p>
        <h2 className="text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/40 mb-3">
          Assign orders ({unsourced.length} outstanding)
        </h2>

        {live.length === 0 ? (
          <p className="text-sm text-obsidian/45">No live orders to source.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-obsidian/10 bg-white">
          <div className="grid min-w-[900px] grid-cols-[1.4fr_.65fr_2fr] gap-4 border-b border-obsidian/10 bg-paper px-4 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/40">
            <span>Order &amp; contents</span><span className="text-right">Revenue / margin</span><span>Nationwide cost &amp; notes</span>
          </div>
          <ul className="min-w-[900px] divide-y divide-obsidian/8">
            {live.map((order) => {
              const draft = drafts[order.id] || {
                supplierId: order.supplierId || partner?.id || '',
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
              const dirty = Boolean(drafts[order.id]);

              return (
                <li key={order.id} className="grid grid-cols-[1.4fr_.65fr_2fr] gap-4 bg-white p-4 hover:bg-paper/30">
                  <div className="min-w-0">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-obsidian">
                        {shortId(order.id)} · {order.fullName}
                      </p>
                      <p className="text-[11px] text-obsidian/45">
                        {order.status} · {order.area || 'no area'}
                      </p>
                      <ul className="mt-1.5 flex flex-wrap gap-1.5">
                        {order.items.map((i) => (
                          <li key={`${i.slug}-${i.name}`} title={i.name} className="flex items-center gap-1.5 rounded-full bg-paper py-0.5 pl-0.5 pr-2 text-[11px] text-obsidian/65">
                            <span className="grid h-7 w-6 place-items-center overflow-hidden rounded-full bg-white">
                              {i.imageUrl ? <Image src={i.imageUrl} alt="" width={20} height={28} className="h-7 w-5 object-contain" /> : <span className="h-4 w-1.5 rounded-sm bg-obsidian/10" />}
                            </span>
                            <span className="max-w-[140px] truncate">{i.name}</span> <strong>×{i.qty}</strong>
                          </li>
                        ))}
                        {order.items.length === 0 && <li className="text-[11px] text-obsidian/40">no items</li>}
                      </ul>
                    </div>
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

                  <div>
                  <div className="grid grid-cols-[minmax(0,1fr)_10rem_auto] gap-2 items-start">
                    <div className="rounded-lg border border-obsidian/10 bg-paper px-3 py-2 text-sm font-semibold text-obsidian">
                      {partner?.name || 'Nationwide'}
                    </div>

                    <input
                      type="number"
                      min={0}
                      step={1000}
                      inputMode="numeric"
                      aria-label="Nationwide cost in naira"
                      placeholder="Cost"
                      value={draft.cost}
                      disabled={!partner}
                      onChange={(e) => setDraft({ cost: e.target.value })}
                      className="border border-obsidian/15 px-3 py-2 text-sm tabular-nums disabled:bg-obsidian/5"
                    />

                    <button
                      type="button"
                      onClick={() => saveSourcing(order)}
                      disabled={savingId === order.id || !dirty || !partner}
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
                      Costed via {order.supplierName || partner?.name || 'Nationwide'} on{' '}
                      {new Date(order.sourcedAt).toLocaleDateString()}.
                    </p>
                  )}
                  </div>
                </li>
              );
            })}
          </ul>
          </div>
        )}
      </section>
    </div>
  );
}
