'use client';

import { useState } from 'react';
import { formatNgn } from '@/lib/drinks/catalog';
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/commerce/status';
import OrdersLedger from './OrdersLedger';
import { useDialogs } from './ui/DialogProvider';
import { AdminField, AdminInput, AdminSelect } from './ui/Fields';
import { readError, type AdminOrder } from './types';
import type { useAdminOrders } from './useAdminOrders';

/** Couriers the desk dispatches with. */
const COURIERS = ['GIG Logistics', 'Kwik', 'Gokada', 'Sendbox', 'Bolt Courier', 'In-house rider'];

type TrackingPatch = { courierName?: string; riderPhone?: string; etaAt?: string | null; trackingNote?: string };

/** ISO → value for <input type="datetime-local"> in the browser's own zone. */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString();
}

export default function OrdersDesk({
  store,
  onChanged,
}: {
  store: ReturnType<typeof useAdminOrders>;
  /** Fired after any write so the shell can refresh its counts. */
  onChanged?: () => void;
}) {
  const { confirm, notify } = useDialogs();
  const { orders, statuses, error, setError, patchOrder, removeOrder } = store;
  const [updatingOrder, setUpdatingOrder] = useState('');

  async function patch(order: AdminOrder, body: Record<string, unknown>, fallback: string) {
    setError('');
    setUpdatingOrder(order.id);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, ...body }),
      });
      if (!res.ok) {
        setError(await readError(res, fallback));
        return null;
      }
      return res.json();
    } finally {
      setUpdatingOrder('');
    }
  }

  async function updateOrderStatus(order: AdminOrder, status: OrderStatus) {
    if (status === 'cancelled') {
      const ok = await confirm({
        title: 'Cancel this order?',
        message: (
          <>
            <strong>{order.fullName}</strong> is told the order is cancelled, reserved stock is released and any
            gift card or referral credit is reversed. Payment is <em>not</em> returned — use Refund for that.
          </>
        ),
        confirmLabel: 'Cancel order',
        tone: 'danger',
      });
      if (!ok) return;
    }
    const data = await patch(order, { status }, 'Could not update the order.');
    if (!data) return;
    patchOrder(order.id, { status });
    notify(`${order.fullName.split(' ')[0]}'s order → ${ORDER_STATUS_LABELS[status]}`);
    onChanged?.();
  }

  async function saveTracking(order: AdminOrder, tracking: TrackingPatch) {
    const data = await patch(order, { action: 'tracking', ...tracking }, 'Could not save tracking info.');
    if (!data) return false;
    patchOrder(order.id, {
      courierName: data.courierName ?? null,
      riderPhone: data.riderPhone ?? null,
      etaAt: data.etaAt ?? null,
      trackingNote: data.trackingNote ?? null,
    });
    notify('Tracking saved.');
    return true;
  }

  async function refundOrder(order: AdminOrder) {
    const ok = await confirm({
      title: 'Refund this order?',
      message: (
        <>
          {formatNgn(order.totalNgn)} goes back to <strong>{order.fullName}</strong> through Flutterwave, the order
          is marked refunded, and reserved stock is released. This cannot be undone.
        </>
      ),
      confirmLabel: 'Refund order',
      tone: 'danger',
    });
    if (!ok) return;
    const data = await patch(order, { action: 'refund' }, 'Could not refund this order.');
    if (!data) return;
    patchOrder(order.id, { status: 'refunded', refundedNgn: data.refundedNgn });
    notify(`Refunded ${formatNgn(data.refundedNgn)}.`);
    onChanged?.();
  }

  async function deleteOrder(order: AdminOrder) {
    const ok = await confirm({
      title: `Delete order ${order.id.slice(0, 8).toUpperCase()}?`,
      message: (
        <>
          The {ORDER_STATUS_LABELS[order.status].toLowerCase()} order from <strong>{order.fullName}</strong> is removed
          from the ledger permanently, along with its timeline. This cannot be undone.
        </>
      ),
      confirmLabel: 'Delete order',
      tone: 'danger',
    });
    if (!ok) return;
    setUpdatingOrder(order.id);
    const res = await fetch(`/api/admin/orders?id=${encodeURIComponent(order.id)}`, { method: 'DELETE' });
    setUpdatingOrder('');
    if (!res.ok) {
      setError(await readError(res, 'Could not delete order.'));
      return;
    }
    removeOrder(order.id);
    onChanged?.();
  }

  return (
    <>
      {error && <p className="mb-4 text-sm text-ember">{error}</p>}
      <OrdersLedger
        orders={orders}
        settableStatuses={statuses}
        updatingOrder={updatingOrder}
        onStatusChange={updateOrderStatus}
        onRefund={refundOrder}
        onDelete={deleteOrder}
        renderTracking={(order) => (
          <TrackingForm
            order={order}
            saving={updatingOrder === order.id}
            onSave={(tracking) => saveTracking(order, tracking)}
          />
        )}
      />
    </>
  );
}

function TrackingForm({
  order,
  saving,
  onSave,
}: {
  order: AdminOrder;
  saving: boolean;
  onSave: (patch: TrackingPatch) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [courierName, setCourierName] = useState(order.courierName || '');
  const [riderPhone, setRiderPhone] = useState(order.riderPhone || '');
  const [etaLocal, setEtaLocal] = useState(order.etaAt ? toLocalInput(order.etaAt) : '');
  const [trackingNote, setTrackingNote] = useState(order.trackingNote || '');

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 text-[10px] font-black uppercase tracking-[0.1em] text-obsidian/40 hover:text-ember"
      >
        {order.courierName || order.etaAt ? `Rider: ${order.courierName || '—'} · edit tracking` : '+ Add rider / ETA'}
      </button>
    );
  }

  return (
    <div className="mt-3 grid gap-3 border-t border-obsidian/10 pt-3 sm:grid-cols-4">
      <AdminSelect
        label="Courier"
        value={courierName}
        onChange={setCourierName}
        placeholder="Choose a courier…"
        options={COURIERS}
      />
      <AdminInput label="Rider phone" value={riderPhone} onChange={(e) => setRiderPhone(e.target.value)} placeholder="+234…" />
      <AdminInput label="ETA" type="datetime-local" value={etaLocal} onChange={(e) => setEtaLocal(e.target.value)} />
      <AdminField label="Tracking note">
        <AdminInput value={trackingNote} onChange={(e) => setTrackingNote(e.target.value)} placeholder="Optional" />
      </AdminField>
      <div className="flex gap-2 sm:col-span-4">
        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            const ok = await onSave({
              courierName,
              riderPhone,
              etaAt: etaLocal ? fromLocalInput(etaLocal) : null,
              trackingNote,
            });
            if (ok) setOpen(false);
          }}
          className="btn-brand px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-40"
        >
          {saving ? '…' : 'Save tracking'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/40"
        >
          Close
        </button>
      </div>
    </div>
  );
}
