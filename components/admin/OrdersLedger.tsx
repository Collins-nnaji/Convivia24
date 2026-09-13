'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { ChevronDown, ChevronRight, Download, Printer, Search, Trash2, Undo2 } from 'lucide-react';
import { formatNgn } from '@/lib/drinks/catalog';
import {
  ORDER_STATUS_LABELS,
  ORDER_TRANSITIONS,
  TERMINAL_ORDER_STATUSES,
  type OrderStatus,
} from '@/lib/commerce/status';
import type { AdminOrder } from './types';

type RangeKey = 'today' | '7d' | '30d' | 'month' | 'all' | 'custom';

const RANGES: { key: RangeKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: 'month', label: 'This month' },
  { key: 'all', label: 'All time' },
];

/** Local midnight for a `YYYY-MM-DD` input value. */
function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function rangeBounds(key: RangeKey, fromStr: string, toStr: string): { from: Date | null; to: Date | null } {
  const now = new Date();
  switch (key) {
    case 'today':
      return { from: startOfDay(now), to: null };
    case '7d': {
      const f = startOfDay(now);
      f.setDate(f.getDate() - 6);
      return { from: f, to: null };
    }
    case '30d': {
      const f = startOfDay(now);
      f.setDate(f.getDate() - 29);
      return { from: f, to: null };
    }
    case 'month':
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: null };
    case 'custom': {
      const from = fromStr ? startOfDay(new Date(fromStr)) : null;
      // `to` is inclusive of the whole day the admin picked.
      let to: Date | null = null;
      if (toStr) {
        to = startOfDay(new Date(toStr));
        to.setDate(to.getDate() + 1);
      }
      return { from, to };
    }
    default:
      return { from: null, to: null };
  }
}

function dateCell(iso: string): string {
  return new Date(iso).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: '2-digit' });
}

function timeCell(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
}

const STATUS_TONE: Partial<Record<OrderStatus, string>> = {
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  processing: 'bg-amber-50 text-amber-700 ring-amber-200',
  packed: 'bg-amber-50 text-amber-700 ring-amber-200',
  out_for_delivery: 'bg-sky-50 text-sky-700 ring-sky-200',
  delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  fulfilled: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-obsidian/[0.06] text-obsidian/50 ring-obsidian/10',
  refunded: 'bg-red-50 text-red-700 ring-red-200',
  awaiting_payment: 'bg-obsidian/[0.06] text-obsidian/50 ring-obsidian/10',
  pending: 'bg-obsidian/[0.06] text-obsidian/50 ring-obsidian/10',
};

/**
 * Statuses the desk can pick from the dropdown for one order: only the legal next steps.
 * Refund is a separate button (it moves money) and `fulfilled` is a legacy twin of `delivered`.
 */
function nextStatuses(from: OrderStatus): OrderStatus[] {
  return ORDER_TRANSITIONS[from].filter((s) => s !== 'refunded' && s !== 'fulfilled');
}

export default function OrdersLedger({
  orders,
  settableStatuses,
  updatingOrder,
  onStatusChange,
  onRefund,
  onDelete,
  renderTracking,
}: {
  orders: AdminOrder[];
  settableStatuses: OrderStatus[];
  updatingOrder: string;
  onStatusChange: (order: AdminOrder, status: OrderStatus) => void;
  onRefund: (order: AdminOrder) => void;
  onDelete: (order: AdminOrder) => void;
  /** The tracking form, injected so this component stays presentational. */
  renderTracking: (order: AdminOrder) => ReactNode;
}) {
  const [range, setRange] = useState<RangeKey>('30d');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const rows = useMemo(() => {
    const { from: lo, to: hi } = rangeBounds(range, from, to);
    const q = query.trim().toLowerCase();
    return orders
      .filter((o) => {
        const at = new Date(o.createdAt);
        if (lo && at < lo) return false;
        if (hi && at >= hi) return false;
        if (status !== 'all' && o.status !== status) return false;
        if (q) {
          const hay = `${o.fullName} ${o.email} ${o.phone ?? ''} ${o.id} ${o.area ?? ''} ${o.addressLine1}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [orders, range, from, to, status, query]);

  /** Column totals — the reason this reads as a sheet rather than a feed. */
  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, o) => {
          acc.count += 1;
          acc.subtotal += o.subtotalNgn;
          acc.discounts += o.loyaltyDiscountNgn + o.giftCardDiscountNgn;
          acc.gross += o.totalNgn;
          acc.refunded += o.refundedNgn;
          acc.cost += o.supplierCostNgn ?? 0;
          acc.units += o.items.reduce((n, i) => n + i.qty, 0);
          return acc;
        },
        { count: 0, subtotal: 0, discounts: 0, gross: 0, refunded: 0, cost: 0, units: 0 }
      ),
    [rows]
  );
  const net = totals.gross - totals.refunded;

  function exportCsv() {
    const head = [
      'Order','Date','Time','Customer','Email','Phone','City','Area','Status',
      'Items','Units','Subtotal','Discounts','Total','Refunded','Net','Supplier','Cost',
    ];
    const lines = rows.map((o) => {
      const discounts = o.loyaltyDiscountNgn + o.giftCardDiscountNgn;
      return [
        o.id.slice(0, 8).toUpperCase(),
        new Date(o.createdAt).toISOString().slice(0, 10),
        timeCell(o.createdAt),
        o.fullName,
        o.email,
        o.phone ?? '',
        o.city ?? '',
        o.area ?? '',
        ORDER_STATUS_LABELS[o.status],
        o.items.length,
        o.items.reduce((n, i) => n + i.qty, 0),
        o.subtotalNgn,
        discounts,
        o.totalNgn,
        o.refundedNgn,
        o.totalNgn - o.refundedNgn,
        o.supplierName ?? '',
        o.supplierCostNgn ?? '',
      ]
        // Quote everything and double inner quotes — names and addresses contain commas.
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',');
    });
    const blob = new Blob([[head.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `convivia-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* ── Controls ─────────────────────────────────────────── */}
      <div className="mb-4 rounded-2xl border border-obsidian/[0.08] bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                  range === r.key
                    ? 'bg-obsidian text-white'
                    : 'text-obsidian/55 hover:bg-obsidian/[0.05] hover:text-obsidian'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <span className="hidden h-5 w-px bg-obsidian/10 sm:block" />

          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setRange('custom');
              }}
              aria-label="From date"
              className="rounded-lg border border-obsidian/12 px-2 py-1.5 text-xs text-obsidian focus:border-ember focus:ring-0"
            />
            <span className="text-xs text-obsidian/35">→</span>
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setRange('custom');
              }}
              aria-label="To date"
              className="rounded-lg border border-obsidian/12 px-2 py-1.5 text-xs text-obsidian focus:border-ember focus:ring-0"
            />
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <label className="relative">
              <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-obsidian/35" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, email, order #"
                aria-label="Search orders"
                className="w-48 rounded-lg border border-obsidian/12 py-1.5 pl-8 pr-2 text-xs focus:border-ember focus:ring-0"
              />
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus | 'all')}
              aria-label="Filter by status"
              className="rounded-lg border border-obsidian/12 px-2 py-1.5 text-xs font-semibold text-obsidian focus:border-ember focus:ring-0"
            >
              <option value="all">All statuses</option>
              {settableStatuses.map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={exportCsv}
              disabled={rows.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-obsidian/12 px-3 py-1.5 text-xs font-bold text-obsidian/70 transition-colors hover:border-ember/40 hover:text-ember disabled:opacity-40"
            >
              <Download size={13} /> CSV
            </button>
          </div>
        </div>

        {/* ── Running totals for the current filter ──────────── */}
        <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-obsidian/[0.08] bg-obsidian/[0.08] sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Orders" value={String(totals.count)} />
          <Stat label="Units" value={String(totals.units)} />
          <Stat label="Subtotal" value={formatNgn(totals.subtotal)} />
          <Stat label="Discounts" value={formatNgn(totals.discounts)} tone="muted" />
          <Stat label="Refunded" value={formatNgn(totals.refunded)} tone={totals.refunded > 0 ? 'bad' : 'muted'} />
          <Stat label="Net revenue" value={formatNgn(net)} tone="good" />
        </div>
      </div>

      {/* ── The sheet ────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-2xl border border-obsidian/[0.08] bg-white shadow-sm">
        <table className="w-full min-w-[1000px] border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-paper/95 backdrop-blur">
            <tr className="text-left text-[10px] font-black uppercase tracking-[0.1em] text-obsidian/45">
              <th className="w-8 border-b border-obsidian/10 py-2.5 pl-3" />
              <th className="border-b border-obsidian/10 px-2 py-2.5">Date</th>
              <th className="border-b border-obsidian/10 px-2 py-2.5">Order</th>
              <th className="border-b border-obsidian/10 px-2 py-2.5">Customer</th>
              <th className="border-b border-obsidian/10 px-2 py-2.5">Deliver to</th>
              <th className="border-b border-obsidian/10 px-2 py-2.5 text-right">Qty</th>
              <th className="border-b border-obsidian/10 px-2 py-2.5 text-right">Subtotal</th>
              <th className="border-b border-obsidian/10 px-2 py-2.5 text-right">Disc.</th>
              <th className="border-b border-obsidian/10 px-2 py-2.5 text-right">Total</th>
              <th className="border-b border-obsidian/10 px-2 py-2.5">Status</th>
              <th className="border-b border-obsidian/10 px-2 py-2.5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((o) => {
              const open = expanded.has(o.id);
              const discounts = o.loyaltyDiscountNgn + o.giftCardDiscountNgn;
              const units = o.items.reduce((n, i) => n + i.qty, 0);
              const options = nextStatuses(o.status);
              const refundable = ORDER_TRANSITIONS[o.status].includes('refunded');
              const deletable = o.status === 'cancelled' || o.status === 'refunded';
              const closed = TERMINAL_ORDER_STATUSES.includes(o.status);
              return [
                <tr
                  key={o.id}
                  className={`border-b border-obsidian/[0.06] align-middle transition-colors hover:bg-ember/[0.02] ${
                    open ? 'bg-ember/[0.03]' : ''
                  }`}
                >
                  <td className="py-2 pl-3">
                    <button
                      type="button"
                      onClick={() => toggle(o.id)}
                      aria-expanded={open}
                      aria-label={open ? 'Hide line items' : 'Show line items'}
                      className="grid h-6 w-6 place-items-center rounded text-obsidian/40 hover:bg-obsidian/[0.06] hover:text-obsidian"
                    >
                      {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-xs text-obsidian/70">
                    {dateCell(o.createdAt)}
                    <span className="block text-[10px] text-obsidian/35">{timeCell(o.createdAt)}</span>
                  </td>
                  <td className="px-2 py-2 font-mono text-xs text-obsidian/70">{o.id.slice(0, 8).toUpperCase()}</td>
                  <td className="max-w-[190px] px-2 py-2">
                    <span className="block truncate text-[13px] font-semibold text-obsidian">{o.fullName}</span>
                    <span className="block truncate text-[11px] text-obsidian/45">{o.email}</span>
                  </td>
                  <td className="max-w-[170px] px-2 py-2">
                    <span className="block truncate text-xs text-obsidian/70">{o.area || o.city || '—'}</span>
                    <span className="block truncate text-[11px] text-obsidian/40">{o.addressLine1}</span>
                  </td>
                  <td className="px-2 py-2 text-right text-xs tabular-nums text-obsidian/70">{units}</td>
                  <td className="px-2 py-2 text-right text-xs tabular-nums text-obsidian/70">
                    {formatNgn(o.subtotalNgn)}
                  </td>
                  <td className="px-2 py-2 text-right text-xs tabular-nums text-obsidian/45">
                    {discounts > 0 ? `−${formatNgn(discounts)}` : '—'}
                  </td>
                  <td className="px-2 py-2 text-right text-[13px] font-bold tabular-nums text-obsidian">
                    {formatNgn(o.totalNgn)}
                    {o.refundedNgn > 0 && (
                      <span className="block text-[10px] font-semibold text-red-600">
                        −{formatNgn(o.refundedNgn)} refunded
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    {options.length === 0 ? (
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ${
                          STATUS_TONE[o.status] ?? 'bg-obsidian/[0.06] text-obsidian/60 ring-obsidian/10'
                        }`}
                      >
                        {ORDER_STATUS_LABELS[o.status]}
                      </span>
                    ) : (
                      <select
                        value={o.status}
                        disabled={updatingOrder === o.id}
                        onChange={(e) => onStatusChange(o, e.target.value as OrderStatus)}
                        aria-label="Change status"
                        className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ring-1 focus:ring-2 focus:ring-ember disabled:opacity-50 ${
                          STATUS_TONE[o.status] ?? 'bg-obsidian/[0.06] text-obsidian/60 ring-obsidian/10'
                        }`}
                      >
                        <option value={o.status}>{ORDER_STATUS_LABELS[o.status]}</option>
                        {options.map((s) => (
                          <option key={s} value={s}>
                            → {ORDER_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-right">
                    {!closed && (
                      <a
                        href={`/admin/label/${o.id}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Print authenticity label"
                        className="mr-1 inline-grid h-7 w-7 place-items-center rounded text-obsidian/40 hover:bg-obsidian/[0.06] hover:text-obsidian"
                      >
                        <Printer size={14} />
                      </a>
                    )}
                    {refundable && (
                      <button
                        type="button"
                        onClick={() => onRefund(o)}
                        disabled={updatingOrder === o.id}
                        title="Refund order"
                        className="mr-1 inline-grid h-7 w-7 place-items-center rounded text-obsidian/40 hover:bg-ember/10 hover:text-ember disabled:opacity-40"
                      >
                        <Undo2 size={14} />
                      </button>
                    )}
                    {deletable && (
                      <button
                        type="button"
                        onClick={() => onDelete(o)}
                        disabled={updatingOrder === o.id}
                        title="Delete order"
                        className="inline-grid h-7 w-7 place-items-center rounded text-obsidian/40 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>,

                /* Line items live in their own rows, not stacked inside the order cell. */
                open && (
                  <tr key={`${o.id}-detail`} className="border-b border-obsidian/[0.06] bg-paper/40">
                    <td />
                    <td colSpan={10} className="px-2 py-3">
                      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                        <div>
                          <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/40">
                            Line items
                          </p>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-left text-[10px] uppercase tracking-wider text-obsidian/35">
                                <th className="py-1 font-bold">Item</th>
                                <th className="py-1 text-right font-bold">Qty</th>
                                <th className="py-1 text-right font-bold">Unit</th>
                                <th className="py-1 text-right font-bold">Line total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {o.items.map((i, idx) => (
                                <tr key={`${i.slug ?? i.name}-${idx}`} className="border-t border-obsidian/[0.06]">
                                  <td className="py-1.5 pr-2 text-obsidian/75">{i.name}</td>
                                  <td className="py-1.5 text-right tabular-nums text-obsidian/60">{i.qty}</td>
                                  <td className="py-1.5 text-right tabular-nums text-obsidian/60">
                                    {formatNgn(i.unitPriceNgn)}
                                  </td>
                                  <td className="py-1.5 text-right font-semibold tabular-nums text-obsidian">
                                    {formatNgn(i.unitPriceNgn * i.qty)}
                                  </td>
                                </tr>
                              ))}
                              <tr className="border-t-2 border-obsidian/15">
                                <td className="py-1.5 font-bold text-obsidian" colSpan={3}>
                                  Order total
                                </td>
                                <td className="py-1.5 text-right font-bold tabular-nums text-obsidian">
                                  {formatNgn(o.totalNgn)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div className="space-y-2 text-xs">
                          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/40">
                            Fulfilment
                          </p>
                          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-obsidian/60">
                            <dt className="text-obsidian/40">Phone</dt>
                            <dd>{o.phone || '—'}</dd>
                            <dt className="text-obsidian/40">Address</dt>
                            <dd>
                              {o.addressLine1}
                              {o.addressLine2 ? `, ${o.addressLine2}` : ''}
                              {o.area ? `, ${o.area}` : ''}
                            </dd>
                            <dt className="text-obsidian/40">Payment</dt>
                            <dd>
                              {o.paymentProvider || '—'}
                              {o.paymentRef ? ` · ${o.paymentRef}` : ''}
                            </dd>
                            <dt className="text-obsidian/40">Routed to</dt>
                            <dd>
                              {o.routedSupplierName ? (
                                <>
                                  {o.routedSupplierName}
                                  {o.routedOutOfCity && (
                                    <span className="ml-1.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200">
                                      out of city
                                    </span>
                                  )}
                                </>
                              ) : (
                                'Unrouted — source manually'
                              )}
                            </dd>
                            <dt className="text-obsidian/40">Supplier</dt>
                            <dd>
                              {o.supplierName || 'Not sourced'}
                              {o.supplierCostNgn != null ? ` · ${formatNgn(o.supplierCostNgn)}` : ''}
                            </dd>
                            <dt className="text-obsidian/40">Margin</dt>
                            <dd
                              className={
                                o.margin.sourced
                                  ? o.margin.marginNgn >= 0
                                    ? 'font-semibold text-emerald-700'
                                    : 'font-semibold text-red-600'
                                  : ''
                              }
                            >
                              {o.margin.sourced
                                ? `${formatNgn(o.margin.marginNgn)} · ${o.margin.marginPct}%`
                                : 'Awaiting sourcing'}
                            </dd>
                            {o.notes && (
                              <>
                                <dt className="text-obsidian/40">Notes</dt>
                                <dd>{o.notes}</dd>
                              </>
                            )}
                          </dl>
                          <div className="pt-1">{renderTracking(o)}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ),
              ];
            })}
          </tbody>

          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-obsidian/15 bg-paper/60 text-[13px] font-bold text-obsidian">
                <td />
                <td className="px-2 py-2.5 text-xs uppercase tracking-wider text-obsidian/45" colSpan={4}>
                  {totals.count} order{totals.count === 1 ? '' : 's'}
                </td>
                <td className="px-2 py-2.5 text-right tabular-nums">{totals.units}</td>
                <td className="px-2 py-2.5 text-right tabular-nums">{formatNgn(totals.subtotal)}</td>
                <td className="px-2 py-2.5 text-right tabular-nums text-obsidian/50">
                  {totals.discounts > 0 ? `−${formatNgn(totals.discounts)}` : '—'}
                </td>
                <td className="px-2 py-2.5 text-right tabular-nums">{formatNgn(net)}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>

        {rows.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-obsidian/45">
            No orders in this range. Widen the dates or clear the filters.
          </p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' | 'muted' }) {
  return (
    <div className="bg-white px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-obsidian/35">{label}</p>
      <p
        className={`mt-0.5 text-sm font-bold tabular-nums ${
          tone === 'good'
            ? 'text-emerald-700'
            : tone === 'bad'
              ? 'text-red-600'
              : tone === 'muted'
                ? 'text-obsidian/45'
                : 'text-obsidian'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
