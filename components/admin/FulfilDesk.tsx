'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { Check, Phone, Printer, Search } from 'lucide-react';
import { formatNgn } from '@/lib/drinks/catalog';
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/commerce/status';
import type { Supplier } from '@/lib/suppliers/repo';
import { PlusMinus, deskField } from './ui/DeskContent';
import type { AdminOrder } from './types';
import type { useAdminOrders } from './useAdminOrders';
import { useOrderActions } from './useOrderActions';

/**
 * Fulfil: the open-order queue, oldest first. Each order walks one line of steps —
 * payment → supplier & cost → packed → dispatched (courier or our own rider, with what it cost) →
 * delivered — and the row's main button is always the next step.
 */

type Stage = 'all' | 'payment' | 'prepare' | 'packed' | 'out';
const STAGES: { key: Stage; label: string; statuses: OrderStatus[] }[] = [
  { key: 'all', label: 'All open', statuses: ['awaiting_payment', 'paid', 'processing', 'packed', 'out_for_delivery'] },
  { key: 'payment', label: 'Awaiting payment', statuses: ['awaiting_payment'] },
  { key: 'prepare', label: 'To prepare', statuses: ['paid', 'processing'] },
  { key: 'packed', label: 'Packed', statuses: ['packed'] },
  { key: 'out', label: 'Out for delivery', statuses: ['out_for_delivery'] },
];

const STEPS = ['Paid', 'Supplier', 'Packed', 'Dispatched', 'Delivered'] as const;

function stepsDone(o: AdminOrder): boolean[] {
  const paid = !['pending', 'awaiting_payment', 'cancelled'].includes(o.status);
  const packed = ['packed', 'out_for_delivery', 'delivered', 'fulfilled'].includes(o.status);
  const out = ['out_for_delivery', 'delivered', 'fulfilled'].includes(o.status);
  const delivered = ['delivered', 'fulfilled'].includes(o.status);
  return [paid, o.supplierCostNgn != null, packed, out, delivered];
}

function ago(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  return h < 48 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}

const primary = 'btn-brand inline-flex h-8 items-center justify-center whitespace-nowrap rounded-md px-3 text-xs font-bold disabled:opacity-40';
const secondary = 'inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md border border-obsidian/20 bg-white px-2.5 text-xs font-semibold text-obsidian/80 hover:border-obsidian disabled:opacity-40';

export default function FulfilDesk({
  store,
  mirror,
  onChanged,
}: {
  store: ReturnType<typeof useAdminOrders>;
  /** The All orders list — kept in step with every change made here. */
  mirror?: ReturnType<typeof useAdminOrders>;
  onChanged?: () => void;
}) {
  const { orders, error, loading, loaded, reload } = store;
  const actions = useOrderActions(store, onChanged, mirror ? [mirror] : []);
  const [stage, setStage] = useState<Stage>('all');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [couriers, setCouriers] = useState<string[]>([]);

  useEffect(() => {
    if (!loaded && !loading) void reload({ status: 'open' });
  }, [loaded, loading, reload]);
  useEffect(() => {
    fetch('/api/admin/suppliers')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setSuppliers(((d?.suppliers || []) as Supplier[]).filter((s) => s.active)))
      .catch(() => {});
    fetch('/api/admin/delivery')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setCouriers((d?.providers || []).filter((p: { active: boolean }) => p.active).map((p: { name: string }) => p.name)))
      .catch(() => {});
  }, []);

  const counts = useMemo(() => Object.fromEntries(STAGES.map((s) => [s.key, orders.filter((o) => s.statuses.includes(o.status)).length])), [orders]);
  const rows = useMemo(() => {
    const st = STAGES.find((s) => s.key === stage)!;
    const q = query.trim().toLowerCase();
    // Orders finished in this session stay visible (ticked) until the next refresh.
    return orders.filter(
      (o) =>
        (st.statuses.includes(o.status) || (stage === 'all' && ['delivered', 'fulfilled'].includes(o.status))) &&
        (!q || [o.fullName, o.phone, o.area, o.id, o.email].some((v) => (v || '').toLowerCase().includes(q)))
    );
  }, [orders, stage, query]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex flex-wrap overflow-hidden rounded-md border border-obsidian/20">
          {STAGES.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setStage(s.key)}
              className={`flex h-9 items-center gap-1.5 px-3 text-sm font-semibold ${i > 0 ? 'border-l border-obsidian/15' : ''} ${
                stage === s.key ? 'bg-obsidian text-white' : 'bg-white text-obsidian/75 hover:bg-obsidian/[0.05]'
              }`}
            >
              {s.label}
              <span className={`rounded px-1.5 text-[11px] font-bold tabular-nums ${stage === s.key ? 'bg-white/20' : 'bg-obsidian/[0.07]'}`}>{counts[s.key] ?? 0}</span>
            </button>
          ))}
        </div>
        <label className="relative">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-obsidian/50" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, phone, area, order #" className={`${deskField} h-9 w-60 py-1.5 pl-8`} />
        </label>
        <button type="button" onClick={() => void reload({ status: 'open' })} disabled={loading} className={secondary}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && <p role="alert" className="rounded-md border border-ember/30 bg-ember/5 px-3 py-2 text-sm text-ember">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-obsidian/15">
        <table className="w-full min-w-[980px] border-collapse text-sm">
          <thead className="bg-obsidian/[0.04] text-left text-[11px] font-semibold uppercase tracking-wider text-obsidian/65">
            <tr>
              <th className="w-10 py-2 pl-3" aria-label="Expand" />
              <th className="px-2 py-2">Order</th>
              <th className="px-2 py-2">Deliver to</th>
              <th className="px-2 py-2">Items</th>
              <th className="px-2 py-2 text-right">Total</th>
              <th className="px-2 py-2">Progress</th>
              <th className="py-2 pl-2 pr-3 text-right">Next step</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <FulfilRow
                key={o.id}
                order={o}
                open={open === o.id}
                onToggle={() => setOpen(open === o.id ? null : o.id)}
                onOpen={() => setOpen(o.id)}
                busy={actions.updatingOrder === o.id}
                suppliers={suppliers}
                couriers={couriers}
                actions={actions}
              />
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-obsidian/65">
            {loading ? 'Loading open orders…' : stage === 'all' ? 'Nothing to fulfil — every order is delivered. 🎉' : 'No orders at this stage.'}
          </p>
        )}
      </div>
      {actions.dialogs}
    </div>
  );
}

type Actions = ReturnType<typeof useOrderActions>;

function FulfilRow({
  order: o,
  open,
  onToggle,
  onOpen,
  busy,
  suppliers,
  couriers,
  actions,
}: {
  order: AdminOrder;
  open: boolean;
  onToggle: () => void;
  onOpen: () => void;
  busy: boolean;
  suppliers: Supplier[];
  couriers: string[];
  actions: Actions;
}) {
  const done = stepsDone(o);
  const delivered = done[4];
  const itemsCount = o.items.reduce((n, i) => n + i.qty, 0);

  // The one button that moves the order on.
  let next: ReactNode;
  if (delivered) next = <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><Check size={14} /> Delivered</span>;
  else if (o.status === 'awaiting_payment') next = <button type="button" onClick={onOpen} className={primary}>Confirm payment</button>;
  else if (o.status === 'paid') next = <button type="button" disabled={busy} onClick={() => actions.updateOrderStatus(o, 'processing')} className={primary}>Start preparing</button>;
  else if (o.status === 'processing') next = <button type="button" disabled={busy} onClick={() => actions.updateOrderStatus(o, 'packed')} className={primary}>Mark packed</button>;
  else if (o.status === 'packed') next = <button type="button" onClick={onOpen} className={primary}>Dispatch…</button>;
  else if (o.status === 'out_for_delivery') next = <button type="button" disabled={busy} onClick={() => actions.updateOrderStatus(o, 'delivered')} className={primary}>Mark delivered</button>;

  return (
    <>
      <tr className={`border-t border-obsidian/10 align-middle ${open ? 'bg-shell' : delivered ? 'bg-emerald-50/40' : 'bg-white hover:bg-obsidian/[0.02]'}`}>
        <td className="py-2 pl-3">
          <button type="button" onClick={onToggle} aria-expanded={open} aria-label={open ? 'Collapse order' : 'Expand order'}>
            <PlusMinus open={open} />
          </button>
        </td>
        <td className="px-2 py-2">
          <p className="font-mono text-xs font-bold text-obsidian">#{o.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-[11px] text-obsidian/60">{ago(o.createdAt)} · {ORDER_STATUS_LABELS[o.status]}</p>
        </td>
        <td className="max-w-[220px] px-2 py-2">
          <p className="truncate font-semibold text-obsidian">{o.fullName}</p>
          <p className="truncate text-xs text-obsidian/65">{[o.area, o.city].filter(Boolean).join(', ') || o.addressLine1}</p>
        </td>
        <td className="px-2 py-2">
          <div className="flex items-center gap-1">
            {o.items.slice(0, 4).map((i, idx) => (
              <span key={`${i.slug}-${idx}`} title={`${i.qty}× ${i.name}`} className="relative grid h-10 w-8 place-items-center overflow-hidden rounded bg-shell ring-1 ring-obsidian/10">
                {i.imageUrl ? <Image src={i.imageUrl} alt="" width={32} height={40} className="h-10 w-8 object-contain" /> : <span className="text-[9px] font-bold text-obsidian/50">{i.qty}×</span>}
                {i.qty > 1 && <span className="absolute bottom-0 right-0 rounded-tl bg-obsidian px-0.5 text-[9px] font-bold text-white">{i.qty}</span>}
              </span>
            ))}
            <span className="ml-1 text-xs text-obsidian/65">{itemsCount} item{itemsCount === 1 ? '' : 's'}</span>
          </div>
        </td>
        <td className="px-2 py-2 text-right font-semibold tabular-nums">{formatNgn(o.totalNgn)}</td>
        <td className="px-2 py-2">
          <ol className="flex items-center gap-1" aria-label="Progress">
            {STEPS.map((label, i) => (
              <li key={label} title={label} className="flex items-center gap-1">
                <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${done[i] ? 'bg-emerald-600 text-white' : 'border border-obsidian/25 text-obsidian/50'}`}>
                  {done[i] ? <Check size={11} strokeWidth={3} /> : i + 1}
                </span>
                {i < STEPS.length - 1 && <span className={`h-px w-2.5 ${done[i] ? 'bg-emerald-600' : 'bg-obsidian/20'}`} />}
              </li>
            ))}
          </ol>
          <p className="mt-0.5 text-[11px] text-obsidian/60">{STEPS[done.findIndex((d) => !d)] ? `Next: ${STEPS[done.findIndex((d) => !d)]}` : 'Complete'}</p>
        </td>
        <td className="py-2 pl-2 pr-3 text-right">{next}</td>
      </tr>
      {open && (
        <tr className="bg-shell">
          <td />
          <td colSpan={6} className="pb-4 pr-3">
            <OrderWorkbench order={o} busy={busy} suppliers={suppliers} couriers={couriers} actions={actions} />
          </td>
        </tr>
      )}
    </>
  );
}

function Panel({ step, title, done, children }: { step: number; title: string; done?: boolean; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-md border border-obsidian/15 bg-white p-3">
      <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-obsidian">
        <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${done ? 'bg-emerald-600 text-white' : 'bg-obsidian text-white'}`}>
          {done ? <Check size={11} strokeWidth={3} /> : step}
        </span>
        {title}
      </h4>
      {children}
    </section>
  );
}

const field = `${deskField} h-9 py-1.5`;
const lbl = 'block text-[11px] font-semibold text-obsidian/70';

/** Everything needed to fulfil one order, in the order you do it. */
function OrderWorkbench({ order: o, busy, suppliers, couriers, actions }: { order: AdminOrder; busy: boolean; suppliers: Supplier[]; couriers: string[]; actions: Actions }) {
  const [bankRef, setBankRef] = useState('');
  const [supplierId, setSupplierId] = useState(o.supplierId || suppliers[0]?.id || '');
  const [cost, setCost] = useState(o.supplierCostNgn != null ? String(o.supplierCostNgn) : o.routedCostNgn != null ? String(o.routedCostNgn) : '');
  const initialManual = o.courierName ? !couriers.includes(o.courierName) : couriers.length === 0;
  const [manual, setManual] = useState(initialManual);
  const [courier, setCourier] = useState(o.courierName || '');
  const [riderPhone, setRiderPhone] = useState(o.riderPhone || '');
  const [eta, setEta] = useState(o.etaAt ? new Date(new Date(o.etaAt).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');
  const [deliveryCost, setDeliveryCost] = useState(o.courierCostNgn != null ? String(o.courierCostNgn) : '');
  const [reference, setReference] = useState(o.courierReference || '');
  const [trackingUrl, setTrackingUrl] = useState(o.trackingUrl || '');

  useEffect(() => {
    if (!supplierId && suppliers[0]) setSupplierId(suppliers[0].id);
  }, [suppliers, supplierId]);

  const paid = !['awaiting_payment', 'pending', 'cancelled'].includes(o.status);
  const out = ['out_for_delivery', 'delivered', 'fulfilled'].includes(o.status);
  const supplierCost = cost === '' ? null : Number(cost);
  const delivery = deliveryCost === '' ? 0 : Number(deliveryCost);
  const net = o.totalNgn - o.refundedNgn;
  const margin = net - (supplierCost ?? 0) - delivery;
  const costDirty = cost !== (o.supplierCostNgn != null ? String(o.supplierCostNgn) : '') || supplierId !== (o.supplierId || '');

  const tracking = () => ({
    courierName: courier.trim(),
    riderPhone: riderPhone.trim(),
    etaAt: eta ? new Date(eta).toISOString() : null,
    courierCostNgn: deliveryCost === '' ? null : Math.round(Number(deliveryCost)),
    courierReference: manual ? '' : reference.trim(),
    trackingUrl: manual ? '' : trackingUrl.trim(),
    trackingNote: manual ? 'Manual delivery — own rider' : o.trackingNote || '',
  });

  async function dispatch() {
    if (!(await actions.saveTracking(o, tracking(), { quiet: true }))) return;
    if (o.status !== 'out_for_delivery') await actions.updateOrderStatus(o, 'out_for_delivery');
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 xl:grid-cols-[1fr_1fr_1.25fr]">
        {/* 1 — what to send and where */}
        <Panel step={1} title={paid ? 'Order & customer' : 'Confirm payment'} done={paid}>
          {!paid && (
            <div className="mb-3 rounded-md border border-amber-300 bg-amber-50 p-2.5">
              <p className="mb-1.5 text-xs text-amber-900">Waiting for a bank transfer. Enter the transfer reference once the money is in the account.</p>
              <div className="flex gap-1.5">
                <input value={bankRef} onChange={(e) => setBankRef(e.target.value)} placeholder="Transfer reference" className={`${field} flex-1`} />
                <button type="button" disabled={busy || !bankRef.trim()} onClick={() => actions.recordBankTransfer(o, bankRef.trim())} className={primary}>
                  Confirm paid
                </button>
              </div>
            </div>
          )}
          <ul className="divide-y divide-obsidian/8 text-sm">
            {o.items.map((i, idx) => (
              <li key={`${i.slug}-${idx}`} className="flex items-center gap-2 py-1.5">
                <span className="grid h-10 w-8 shrink-0 place-items-center overflow-hidden rounded bg-shell">
                  {i.imageUrl && <Image src={i.imageUrl} alt="" width={32} height={40} className="h-10 w-8 object-contain" />}
                </span>
                <span className="min-w-0 flex-1 truncate"><strong className="tabular-nums">{i.qty}×</strong> {i.name}</span>
                <span className="text-xs tabular-nums text-obsidian/65">{formatNgn(i.unitPriceNgn * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 border-t border-obsidian/10 pt-2 text-sm">
            <p className="font-semibold">{o.fullName}</p>
            <p className="text-obsidian/75">{[o.addressLine1, o.addressLine2, o.area, o.city].filter(Boolean).join(', ')}</p>
            {o.notes && <p className="mt-1 rounded bg-amber-50 px-2 py-1 text-xs text-amber-900">Note: {o.notes}</p>}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {o.phone && (
                <a href={`tel:${o.phone}`} className={secondary}><Phone size={13} /> {o.phone}</a>
              )}
              <a href={`/admin/label/${o.id}`} target="_blank" rel="noreferrer" className={secondary}><Printer size={13} /> Print label</a>
              <button type="button" onClick={() => actions.edit(o)} className={secondary}>Edit address</button>
            </div>
          </div>
        </Panel>

        {/* 2 — who supplied it and what it cost */}
        <Panel step={2} title="Supplier & cost" done={o.supplierCostNgn != null}>
          <div className="space-y-2">
            <label className={lbl}>
              Supplier
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className={`${field} mt-1`}>
                {suppliers.length === 0 && <option value="">No active supplier</option>}
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}{s.city ? ` · ${s.city}` : ''}</option>
                ))}
              </select>
            </label>
            <label className={lbl}>
              What the supplier charged (₦)
              <input type="number" min={0} inputMode="numeric" value={cost} onChange={(e) => setCost(e.target.value)} className={`${field} mt-1 tabular-nums`} placeholder="e.g. 85000" />
            </label>
            {o.supplierCostNgn == null && o.routedCostNgn != null && (
              <p className="text-[11px] text-obsidian/60">Pre-filled from the price list ({formatNgn(o.routedCostNgn)}) — change it if the supplier charged differently.</p>
            )}
            <button
              type="button"
              disabled={busy || !supplierId || cost === '' || !costDirty}
              onClick={() => actions.saveSourcing(o, supplierId, Math.round(Number(cost)))}
              className={primary}
            >
              {o.supplierCostNgn != null && !costDirty ? 'Saved' : 'Save supplier cost'}
            </button>
            <p className="text-[11px] text-obsidian/60">Adds to what you owe the supplier in Finance › Payouts.</p>
          </div>
        </Panel>

        {/* 3 — how it gets there and what that cost us */}
        <Panel step={3} title="Delivery" done={out}>
          <div className="mb-2 inline-flex overflow-hidden rounded-md border border-obsidian/20 text-xs font-semibold">
            <button type="button" onClick={() => setManual(false)} className={`px-3 py-1.5 ${!manual ? 'bg-obsidian text-white' : 'bg-white text-obsidian/75'}`}>Courier company</button>
            <button type="button" onClick={() => setManual(true)} className={`border-l border-obsidian/15 px-3 py-1.5 ${manual ? 'bg-obsidian text-white' : 'bg-white text-obsidian/75'}`}>Manual / own rider</button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className={lbl}>
              {manual ? 'Rider name' : 'Courier'}
              {manual || couriers.length === 0 ? (
                <input value={courier} onChange={(e) => setCourier(e.target.value)} placeholder={manual ? 'Who is delivering' : 'Courier name'} className={`${field} mt-1`} />
              ) : (
                <select value={courier} onChange={(e) => setCourier(e.target.value)} className={`${field} mt-1`}>
                  <option value="">Choose…</option>
                  {[...new Set([...couriers, ...(courier ? [courier] : [])])].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}
            </label>
            <label className={lbl}>
              Rider phone
              <input value={riderPhone} onChange={(e) => setRiderPhone(e.target.value)} placeholder="+234…" className={`${field} mt-1`} />
            </label>
            <label className={lbl}>
              Delivery cost to us (₦)
              <input type="number" min={0} inputMode="numeric" value={deliveryCost} onChange={(e) => setDeliveryCost(e.target.value)} placeholder="Fuel, rider fee, courier bill" className={`${field} mt-1 tabular-nums`} />
            </label>
            <label className={lbl}>
              Expected arrival
              <input type="datetime-local" value={eta} onChange={(e) => setEta(e.target.value)} className={`${field} mt-1`} />
            </label>
            {!manual && (
              <>
                <label className={lbl}>
                  Booking reference
                  <input value={reference} onChange={(e) => setReference(e.target.value)} className={`${field} mt-1`} />
                </label>
                <label className={lbl}>
                  Tracking link
                  <input value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} placeholder="https://…" className={`${field} mt-1`} />
                </label>
              </>
            )}
          </div>
          {(o.deliveryFeeNgn ?? 0) > 0 && <p className="mt-2 text-[11px] text-obsidian/65">Customer paid {formatNgn(o.deliveryFeeNgn ?? 0)} for delivery.</p>}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {!out ? (
              <button type="button" disabled={busy || !paid || !courier.trim()} onClick={dispatch} className={primary} title={!paid ? 'Confirm payment first' : undefined}>
                Save &amp; dispatch
              </button>
            ) : (
              !['delivered', 'fulfilled'].includes(o.status) && (
                <button type="button" disabled={busy} onClick={() => actions.updateOrderStatus(o, 'delivered')} className={primary}>
                  Mark delivered
                </button>
              )
            )}
            <button type="button" disabled={busy} onClick={() => actions.saveTracking(o, tracking())} className={secondary}>
              Save details only
            </button>
          </div>
        </Panel>
      </div>

      {/* Money on this order, live as you type. */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-obsidian/15 bg-white px-3 py-2 text-sm">
        <p className="tabular-nums text-obsidian/80">
          Paid <strong>{formatNgn(net)}</strong>
          {o.refundedNgn > 0 && <span className="text-obsidian/60"> (after {formatNgn(o.refundedNgn)} refunded)</span>}
          {' − '}supplier <strong>{supplierCost != null ? formatNgn(supplierCost) : '—'}</strong>
          {' − '}delivery <strong>{formatNgn(delivery)}</strong>
          {' = '}
          <strong className={supplierCost == null ? 'text-obsidian/60' : margin < 0 ? 'text-red-600' : 'text-emerald-700'}>
            {supplierCost == null ? 'margin once costed' : `${formatNgn(margin)} margin`}
          </strong>
        </p>
        <div className="flex gap-1.5">
          {paid && (
            <button type="button" onClick={() => actions.refund(o)} className={`${secondary} border-red-300 text-red-700`}>
              Refund…
            </button>
          )}
          {!paid && (
            <button type="button" disabled={busy} onClick={() => actions.updateOrderStatus(o, 'cancelled')} className={`${secondary} border-red-300 text-red-700`}>
              Cancel order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
