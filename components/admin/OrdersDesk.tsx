'use client';

import { useState } from 'react';
import { formatNgn } from '@/lib/drinks/catalog';
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/commerce/status';
import OrdersLedger from './OrdersLedger';
import { useDialogs } from './ui/DialogProvider';
import { AdminField, AdminInput, AdminSelect, AdminTextArea } from './ui/Fields';
import Modal from './ui/Modal';
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
  const { orders, statuses, error, setError, patchOrder, removeOrder, reload, loadMore, total, hasMore, loading } = store;
  const [updatingOrder, setUpdatingOrder] = useState('');
  const [refunding, setRefunding] = useState<AdminOrder | null>(null);
  const [editing, setEditing] = useState<AdminOrder | null>(null);

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

  async function refundOrder(order: AdminOrder, amountNgn: number, reason: string) {
    const remaining = order.totalNgn - order.refundedNgn;
    const partial = amountNgn < remaining;
    const data = await patch(order, { action: 'refund', amountNgn, reason }, 'Could not refund this order.');
    if (!data) return false;
    patchOrder(order.id, partial ? { refundedNgn: data.refundedNgn } : { status: 'refunded', refundedNgn: data.refundedNgn });
    notify(`${partial ? 'Partially refunded' : 'Refunded'} ${formatNgn(amountNgn)}.`);
    onChanged?.();
    return true;
  }

  async function saveEdit(order: AdminOrder, fields: EditFields) {
    const data = await patch(order, { action: 'edit', ...fields }, 'Could not save the details.');
    if (!data) return false;
    patchOrder(order.id, {
      fullName: data.fullName,
      phone: data.phone,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      area: data.area,
      city: data.city,
      notes: data.notes,
    });
    notify('Delivery details saved.');
    return true;
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
        onRefund={setRefunding}
        onDelete={deleteOrder}
        onEdit={setEditing}
        onFilter={(f) => reload(f)}
        total={total}
        hasMore={hasMore}
        loading={loading}
        onLoadMore={loadMore}
        renderTracking={(order) => (
          <TrackingForm
            order={order}
            saving={updatingOrder === order.id}
            onSave={(tracking) => saveTracking(order, tracking)}
          />
        )}
      />
      {refunding && (
        <RefundDialog
          order={refunding}
          busy={updatingOrder === refunding.id}
          onClose={() => setRefunding(null)}
          onConfirm={async (amount, reason) => {
            if (await refundOrder(refunding, amount, reason)) setRefunding(null);
          }}
        />
      )}
      {editing && (
        <EditDialog
          order={editing}
          busy={updatingOrder === editing.id}
          onClose={() => setEditing(null)}
          onSave={async (fields) => {
            if (await saveEdit(editing, fields)) setEditing(null);
          }}
        />
      )}
    </>
  );
}

type EditFields = { fullName: string; phone: string; addressLine1: string; addressLine2: string; area: string; city: string; notes: string };

/** Full or partial refund. Partial leaves the order running; full closes it and releases stock. */
function RefundDialog({ order, busy, onClose, onConfirm }: { order: AdminOrder; busy: boolean; onClose: () => void; onConfirm: (amountNgn: number, reason: string) => void }) {
  const remaining = Math.max(0, order.totalNgn - order.refundedNgn);
  const [amount, setAmount] = useState(String(remaining));
  const [reason, setReason] = useState('');
  const n = Number(amount);
  const valid = Number.isFinite(n) && n > 0 && n <= remaining;
  const partial = valid && n < remaining;
  return (
    <Modal
      open
      size="sm"
      tone="danger"
      title={`Refund ${order.fullName.split(' ')[0]}'s order`}
      description={`${formatNgn(remaining)} is refundable${order.refundedNgn > 0 ? ` (${formatNgn(order.refundedNgn)} already returned)` : ''}. Money goes back through Flutterwave; this cannot be undone.`}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-lg border border-obsidian/15 px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/70">Cancel</button>
          <button type="button" disabled={!valid || busy} onClick={() => onConfirm(n, reason)} className="rounded-lg bg-ember px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-white disabled:opacity-40">
            {busy ? '…' : partial ? `Refund ${formatNgn(n)} · keep order open` : 'Refund in full · close order'}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex gap-2">
          <button type="button" onClick={() => setAmount(String(remaining))} className={`rounded-full border px-3 py-1.5 text-[12px] font-bold ${n === remaining ? 'border-ember bg-ember text-white' : 'border-obsidian/12 text-obsidian/60'}`}>Full {formatNgn(remaining)}</button>
          <button type="button" onClick={() => setAmount(String(Math.round(remaining / 2)))} className={`rounded-full border px-3 py-1.5 text-[12px] font-bold ${n === Math.round(remaining / 2) ? 'border-ember bg-ember text-white' : 'border-obsidian/12 text-obsidian/60'}`}>Half</button>
        </div>
        <AdminInput label="Amount (NGN)" type="number" min={1} max={remaining} value={amount} onChange={(e) => setAmount(e.target.value)} />
        <AdminInput label="Reason" hint={partial ? 'shown to the customer' : 'optional'} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. one bottle arrived broken" />
        {partial && <p className="text-[12px] text-obsidian/55">Partial: the order keeps its status, stock and points. Only the refunded total changes.</p>}
      </div>
    </Modal>
  );
}

function EditDialog({ order, busy, onClose, onSave }: { order: AdminOrder; busy: boolean; onClose: () => void; onSave: (f: EditFields) => void }) {
  const [f, setF] = useState<EditFields>({
    fullName: order.fullName,
    phone: order.phone || '',
    addressLine1: order.addressLine1,
    addressLine2: order.addressLine2 || '',
    area: order.area || '',
    city: order.city || '',
    notes: order.notes || '',
  });
  const set = (k: keyof EditFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((x) => ({ ...x, [k]: e.target.value }));
  return (
    <Modal
      open
      title={`Edit delivery · ${order.id.slice(0, 8).toUpperCase()}`}
      description="Fixes a wrong address or phone without cancelling the order. The change is stamped on the order's timeline."
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-lg border border-obsidian/15 px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/70">Cancel</button>
          <button type="button" disabled={busy || !f.fullName.trim() || !f.addressLine1.trim()} onClick={() => onSave(f)} className="btn-brand rounded-lg px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] disabled:opacity-40">
            {busy ? '…' : 'Save details'}
          </button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <AdminInput label="Customer name" value={f.fullName} onChange={set('fullName')} required />
        <AdminInput label="Phone" value={f.phone} onChange={set('phone')} placeholder="+234…" />
        <AdminInput label="Address line 1" value={f.addressLine1} onChange={set('addressLine1')} required className="sm:col-span-2" />
        <AdminInput label="Address line 2" value={f.addressLine2} onChange={set('addressLine2')} />
        <AdminInput label="Area" value={f.area} onChange={set('area')} />
        <AdminInput label="City" value={f.city} onChange={set('city')} />
        <AdminTextArea label="Notes" rows={2} value={f.notes} onChange={set('notes')} className="min-h-[60px] sm:col-span-2" />
      </div>
    </Modal>
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
