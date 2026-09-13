'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Phone } from 'lucide-react';
import { ORDER_STATUS_LABELS, ORDER_TRANSITIONS, type OrderStatus } from '@/lib/commerce/status';
import { formatNgn } from '@/lib/drinks/catalog';
import { useDialogs } from '@/components/admin/ui/DialogProvider';
import { AdminInput, AdminSelect } from '@/components/admin/ui/Fields';
import { OPEN_STATUSES, readError, type SupplierOrder } from './types';

const COURIERS = ['GIG Logistics', 'Kwik', 'Gokada', 'Sendbox', 'Bolt Courier', 'Our own rider'];

const TONE: Record<string, string> = {
  paid: 'bg-amber-50 text-amber-700 ring-amber-200',
  processing: 'bg-amber-50 text-amber-700 ring-amber-200',
  packed: 'bg-sky-50 text-sky-700 ring-sky-200',
  out_for_delivery: 'bg-sky-50 text-sky-700 ring-sky-200',
  delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  fulfilled: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

/** The single most useful next step for a supplier, per status. */
const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  paid: { to: 'packed', label: 'Mark packed' },
  processing: { to: 'packed', label: 'Mark packed' },
  packed: { to: 'out_for_delivery', label: 'Out for delivery' },
  out_for_delivery: { to: 'delivered', label: 'Mark delivered' },
};

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function SupplierOrdersDesk({
  base,
  orders,
  statuses,
  onChanged,
}: {
  base: string;
  orders: SupplierOrder[];
  statuses: OrderStatus[];
  onChanged: () => Promise<unknown>;
}) {
  const { confirm, notify } = useDialogs();
  const [view, setView] = useState<'open' | 'done' | 'all'>('open');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState('');

  const rows = useMemo(() => {
    if (view === 'open') return orders.filter((o) => OPEN_STATUSES.has(o.status));
    if (view === 'done') return orders.filter((o) => !OPEN_STATUSES.has(o.status));
    return orders;
  }, [orders, view]);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function patch(order: SupplierOrder, body: Record<string, unknown>, fallback: string) {
    setBusy(order.id);
    try {
      const res = await fetch(`${base}/orders`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, ...body }),
      });
      if (!res.ok) {
        notify(await readError(res, fallback), 'error');
        return false;
      }
      await onChanged();
      return true;
    } finally {
      setBusy('');
    }
  }

  async function move(order: SupplierOrder, to: OrderStatus) {
    if (to === 'delivered') {
      const ok = await confirm({
        title: 'Mark this order delivered?',
        message: (
          <>
            The bottles leave your stock for good and <strong>{order.fullName}</strong> is told the order arrived. Only do this
            once it is in their hands.
          </>
        ),
        confirmLabel: 'Delivered',
      });
      if (!ok) return;
    }
    if (await patch(order, { status: to }, 'Could not update the order.')) {
      notify(`${order.id.slice(0, 8).toUpperCase()} → ${ORDER_STATUS_LABELS[to]}`);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(['open', 'done', 'all'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
              view === v ? 'bg-obsidian text-white' : 'text-obsidian/55 hover:bg-obsidian/[0.05] hover:text-obsidian'
            }`}
          >
            {v === 'open' ? 'To fill' : v === 'done' ? 'Done' : 'All'}
          </button>
        ))}
        <span className="text-xs text-obsidian/45">{rows.length} order{rows.length === 1 ? '' : 's'}</span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-obsidian/10 bg-white">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-paper text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/45">
            <tr>
              <th className="w-8 py-2.5 pl-3" />
              <th className="px-2 py-2.5 text-left">Order</th>
              <th className="px-2 py-2.5 text-left">Deliver to</th>
              <th className="px-2 py-2.5 text-left">Bottles</th>
              <th className="px-2 py-2.5 text-right">You get</th>
              <th className="px-2 py-2.5 text-left">Status</th>
              <th className="px-2 py-2.5 text-right">Next</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => {
              const open = expanded.has(o.id);
              const status = o.status as OrderStatus;
              const next = NEXT[status];
              const legal = next && ORDER_TRANSITIONS[status]?.includes(next.to) && statuses.includes(next.to);
              return [
                <tr key={o.id} className={`border-b border-obsidian/[0.06] align-top transition-colors hover:bg-ember/[0.02] ${open ? 'bg-ember/[0.03]' : ''}`}>
                  <td className="py-2.5 pl-3">
                    <button type="button" onClick={() => toggle(o.id)} aria-expanded={open} aria-label="Details" className="grid h-6 w-6 place-items-center rounded text-obsidian/40 hover:bg-obsidian/[0.06]">
                      {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </button>
                  </td>
                  <td className="px-2 py-2.5">
                    <span className="block font-mono text-xs text-obsidian/70">{o.id.slice(0, 8).toUpperCase()}</span>
                    <span className="block text-[11px] text-obsidian/40">
                      {new Date(o.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                    </span>
                  </td>
                  <td className="max-w-[220px] px-2 py-2.5">
                    <span className="block truncate font-semibold text-obsidian">{o.fullName}</span>
                    <span className="block truncate text-[11px] text-obsidian/45">{[o.area, o.city].filter(Boolean).join(', ')}</span>
                    {o.outOfCity && (
                      <span className="mt-0.5 inline-block rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200">out of city</span>
                    )}
                  </td>
                  <td className="px-2 py-2.5 text-xs text-obsidian/70">
                    {o.items.map((i) => (
                      <span key={`${i.slug}-${i.name}`} className="block">
                        {i.name} <strong>× {i.qty}</strong>
                      </span>
                    ))}
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums text-obsidian/70">{o.costNgn != null ? formatNgn(o.costNgn) : '—'}</td>
                  <td className="px-2 py-2.5">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ${TONE[o.status] ?? 'bg-obsidian/[0.06] text-obsidian/60 ring-obsidian/10'}`}>
                      {ORDER_STATUS_LABELS[status] ?? o.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-2 py-2.5 text-right">
                    {legal && next ? (
                      <button
                        type="button"
                        disabled={busy === o.id}
                        onClick={() => move(o, next.to)}
                        className="btn-brand px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-40"
                      >
                        {busy === o.id ? '…' : next.label}
                      </button>
                    ) : (
                      <span className="text-xs text-obsidian/30">—</span>
                    )}
                  </td>
                </tr>,
                open && (
                  <tr key={`${o.id}-d`} className="border-b border-obsidian/[0.06] bg-paper/40">
                    <td />
                    <td colSpan={6} className="px-2 py-3">
                      <div className="grid gap-4 lg:grid-cols-2">
                        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-obsidian/60">
                          <dt className="text-obsidian/40">Address</dt>
                          <dd>{[o.addressLine1, o.addressLine2, o.area, o.city].filter(Boolean).join(', ')}</dd>
                          <dt className="text-obsidian/40">Phone</dt>
                          <dd>
                            {o.phone ? (
                              <a href={`tel:${o.phone}`} className="inline-flex items-center gap-1 text-ember">
                                <Phone size={11} /> {o.phone}
                              </a>
                            ) : '—'}
                          </dd>
                          {o.notes && (
                            <>
                              <dt className="text-obsidian/40">Customer note</dt>
                              <dd>{o.notes}</dd>
                            </>
                          )}
                        </dl>
                        {OPEN_STATUSES.has(o.status) && (
                          <TrackingForm order={o} saving={busy === o.id} onSave={(t) => patch(o, { action: 'tracking', ...t }, 'Could not save tracking.')} />
                        )}
                      </div>
                    </td>
                  </tr>
                ),
              ];
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-obsidian/45">
            {view === 'open' ? 'Nothing to fill right now.' : 'No orders here.'}
          </p>
        )}
      </div>
    </div>
  );
}

function TrackingForm({
  order,
  saving,
  onSave,
}: {
  order: SupplierOrder;
  saving: boolean;
  onSave: (t: { courierName: string; riderPhone: string; etaAt: string | null; trackingNote: string }) => Promise<boolean>;
}) {
  const [courierName, setCourierName] = useState(order.courierName || '');
  const [riderPhone, setRiderPhone] = useState(order.riderPhone || '');
  const [eta, setEta] = useState(order.etaAt ? toLocalInput(order.etaAt) : '');
  const [trackingNote, setTrackingNote] = useState(order.trackingNote || '');

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/40">Rider &amp; ETA — shown to the customer</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <AdminSelect label="Courier" value={courierName} onChange={setCourierName} placeholder="Choose…" options={COURIERS} />
        <AdminInput label="Rider phone" value={riderPhone} onChange={(e) => setRiderPhone(e.target.value)} placeholder="+234…" />
        <AdminInput label="ETA" type="datetime-local" value={eta} onChange={(e) => setEta(e.target.value)} />
        <AdminInput label="Note" value={trackingNote} onChange={(e) => setTrackingNote(e.target.value)} placeholder="Optional" />
      </div>
      <button
        type="button"
        disabled={saving}
        onClick={() =>
          onSave({
            courierName,
            riderPhone,
            etaAt: eta ? new Date(eta).toISOString() : null,
            trackingNote,
          })
        }
        className="rounded-lg border border-obsidian/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/70 hover:border-ember hover:text-ember disabled:opacity-40"
      >
        {saving ? '…' : 'Save rider details'}
      </button>
    </div>
  );
}
