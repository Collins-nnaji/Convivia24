'use client';

import { useState } from 'react';
import { formatNgn } from '@/lib/drinks/catalog';
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/commerce/status';
import { useDialogs } from './ui/DialogProvider';
import { AdminInput, AdminTextArea } from './ui/Fields';
import Modal from './ui/Modal';
import DeliveredDialog from './ui/DeliveredDialog';
import { readError, type AdminOrder } from './types';
import type { useAdminOrders } from './useAdminOrders';

export type TrackingPatch = { courierName?: string; riderPhone?: string; etaAt?: string | null; trackingNote?: string; courierReference?: string; trackingUrl?: string; deliveryProof?: string; recipientAgeChecked?: boolean; courierCostNgn?: number | null };

type OrdersStore = ReturnType<typeof useAdminOrders>;

/**
 * Every write the desk makes to an order, shared by the Fulfil queue and the All orders ledger so
 * both behave identically. Render `dialogs` once; the refund / edit / delivered modals live there.
 *
 * `mirrors` are the other order lists on the desk: every successful change is applied to them too,
 * so a status set in All orders shows in Fulfil at once, and the other way round.
 */
export function useOrderActions(store: OrdersStore, onChanged?: () => void, mirrors: OrdersStore[] = []) {
  const { setError } = store;
  const patchOrder: OrdersStore['patchOrder'] = (id, patch) => {
    store.patchOrder(id, patch);
    for (const m of mirrors) m.patchOrder(id, patch);
  };
  const removeOrder: OrdersStore['removeOrder'] = (id) => {
    store.removeOrder(id);
    for (const m of mirrors) m.removeOrder(id);
  };
  const [updatingOrder, setUpdatingOrder] = useState('');
  const [refunding, setRefunding] = useState<AdminOrder | null>(null);
  const [editing, setEditing] = useState<AdminOrder | null>(null);
  const [delivering, setDelivering] = useState<AdminOrder | null>(null);
  const { confirm, notify } = useDialogs();

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

  async function updateOrderStatus(order: AdminOrder, status: OrderStatus, proof?: { deliveryProof: string; recipientAgeChecked: boolean }) {
    // Delivered needs the handover evidence; collect it first instead of letting the save fail.
    if ((status === 'delivered' || status === 'fulfilled') && !proof) {
      setDelivering(order);
      return false;
    }
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
    const data = await patch(order, { status, ...(proof ?? {}) }, 'Could not update the order.');
    if (!data) return false;
    patchOrder(order.id, { status, ...(proof ?? {}) });
    notify(`${order.fullName.split(' ')[0]}'s order → ${ORDER_STATUS_LABELS[status]}`);
    onChanged?.();
    return true;
  }

  async function recordBankTransfer(order: AdminOrder, reference: string) {
    const data = await patch(order, { action: 'bank_transfer', reference }, 'Could not record the transfer.');
    if (!data) return false;
    patchOrder(order.id, {
      status: data.status,
      paymentProvider: data.paymentProvider,
      paymentRef: data.paymentRef,
    });
    notify(`Recorded Access Bank transfer for ${order.fullName.split(' ')[0]}.`);
    onChanged?.();
    return true;
  }

  async function saveTracking(order: AdminOrder, tracking: TrackingPatch, opts: { quiet?: boolean } = {}) {
    const data = await patch(order, { action: 'tracking', ...tracking }, 'Could not save tracking info.');
    if (!data) return false;
    patchOrder(order.id, {
      ...tracking,
      courierName: data.courierName ?? null,
      riderPhone: data.riderPhone ?? null,
      etaAt: data.etaAt ?? null,
      trackingNote: data.trackingNote ?? null,
    });
    if (!opts.quiet) notify('Delivery details saved.');
    return true;
  }

  async function refundOrder(order: AdminOrder, amountNgn: number, reason: string) {
    const remaining = order.totalNgn - order.refundedNgn;
    const partial = amountNgn < remaining;
    const data = await patch(order, { action: 'refund', amountNgn, reason, requestId: crypto.randomUUID() }, 'Could not refund this order.');
    if (!data) return false;
    if (data.pending) { notify('Refund requested. Track completion in the refund queue.'); return true; }
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

  /** Copies a signed rider link for this order (valid 48h) and returns it. */
  async function riderLink(order: AdminOrder) {
    const data = await patch(order, { action: 'rider-link' }, 'Could not create a rider link.');
    if (!data?.path) return null;
    const url = `${window.location.origin}${data.path}`;
    try {
      await navigator.clipboard.writeText(url);
      notify(`Rider link copied — valid ${data.hours}h. Send it to the rider.`);
    } catch {
      notify('Rider link ready — copy it from the box.');
    }
    return url;
  }

  /** Which supplier filled the order and what they charged — the real margin and supplier balance. */
  async function saveSourcing(order: AdminOrder, supplierId: string, costNgn: number, note?: string) {
    const data = await patch(order, { action: 'source', supplierId, supplierCostNgn: costNgn, sourcingNote: note ?? order.sourcingNote ?? '' }, 'Could not save the supplier cost.');
    if (!data) return false;
    patchOrder(order.id, { supplierId, supplierCostNgn: costNgn, sourcedAt: new Date().toISOString() });
    notify('Supplier cost saved.');
    onChanged?.();
    return true;
  }

  const dialogs = (
    <>
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
      {delivering && (
        <DeliveredDialog
          customerName={delivering.fullName}
          initialProof={delivering.deliveryProof}
          initialAgeChecked={delivering.recipientAgeChecked}
          busy={updatingOrder === delivering.id}
          onClose={() => setDelivering(null)}
          onConfirm={async (proof) => {
            if (await updateOrderStatus(delivering, 'delivered', proof)) setDelivering(null);
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

  return {
    updatingOrder,
    updateOrderStatus,
    recordBankTransfer,
    saveTracking,
    saveSourcing,
    riderLink,
    refund: setRefunding,
    edit: setEditing,
    deleteOrder,
    dialogs,
  };
}

type EditFields = { fullName: string; phone: string; addressLine1: string; addressLine2: string; area: string; city: string; notes: string };

/** Full or partial refund. Partial leaves the order running; full closes it and releases stock. */
function RefundDialog({ order, busy, onClose, onConfirm }: { order: AdminOrder; busy: boolean; onClose: () => void; onConfirm: (amountNgn: number, reason: string) => void }) {
  const remaining = Math.max(0, order.totalNgn - order.refundedNgn);
  const [amount, setAmount] = useState(String(remaining));
  const [reason, setReason] = useState('');
  const n = Number(amount);
  const valid = Number.isSafeInteger(n) && (n > 0 && n <= remaining || n === 0 && order.paymentProvider === 'gift_card');
  const partial = valid && n < remaining;
  return (
    <Modal
      open
      size="sm"
      tone="danger"
      title={`Refund ${order.fullName.split(' ')[0]}'s order`}
      description={`${formatNgn(remaining)} is refundable${order.refundedNgn > 0 ? ` (${formatNgn(order.refundedNgn)} already returned)` : ''}. Flutterwave refunds are reconciled with the provider. Bank refunds need staff evidence; gift credit is restored.`}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-full border border-obsidian/15 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-obsidian/70">Cancel</button>
          <button type="button" disabled={!valid || busy} onClick={() => onConfirm(n, reason)} className="rounded-full bg-ember px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white disabled:opacity-40">
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
        {partial && <p className="text-[12px] text-obsidian/55">Partial: the order stays open. Its refundable balance and earned points adjust when the refund completes.</p>}
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
          <button type="button" onClick={onClose} className="rounded-full border border-obsidian/15 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-obsidian/70">Cancel</button>
          <button type="button" disabled={busy || !f.fullName.trim() || !f.addressLine1.trim()} onClick={() => onSave(f)} className="btn-brand rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] disabled:opacity-40">
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

