'use client';

import { useEffect, useState } from 'react';
import OrdersLedger from './OrdersLedger';
import { AdminField, AdminInput, AdminSelect } from './ui/Fields';
import type { AdminOrder } from './types';
import type { useAdminOrders } from './useAdminOrders';
import { useOrderActions, type TrackingPatch } from './useOrderActions';

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
  mirror,
  onChanged,
}: {
  store: ReturnType<typeof useAdminOrders>;
  /** The Fulfil queue's list — kept in step with every change made here. */
  mirror?: ReturnType<typeof useAdminOrders>;
  /** Fired after any write so the shell can refresh its counts. */
  onChanged?: () => void;
}) {
  const { orders, statuses, error, reload, loadMore, total, hasMore, loading } = store;
  const actions = useOrderActions(store, onChanged, mirror ? [mirror] : []);
  const { updatingOrder } = actions;

  return (
    <>
      {error && <p className="mb-4 text-sm text-ember">{error}</p>}
      <OrdersLedger
        orders={orders}
        settableStatuses={statuses}
        updatingOrder={updatingOrder}
        onStatusChange={actions.updateOrderStatus}
        onRefund={actions.refund}
        onDelete={actions.deleteOrder}
        onEdit={actions.edit}
        onRecordBank={actions.recordBankTransfer}
        onFilter={(f) => reload(f)}
        total={total}
        hasMore={hasMore}
        loading={loading}
        onLoadMore={loadMore}
        renderTracking={(order) => (
          <TrackingForm
            order={order}
            saving={updatingOrder === order.id}
            onSave={(tracking) => actions.saveTracking(order, tracking)}
          />
        )}
      />
      {actions.dialogs}
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
  const [providers, setProviders] = useState<string[]>([]);
  const [courierReference, setCourierReference] = useState(order.courierReference || '');
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl || '');
  const [deliveryProof, setDeliveryProof] = useState(order.deliveryProof || '');
  const [recipientAgeChecked, setRecipientAgeChecked] = useState(order.recipientAgeChecked || false);
  const [courierCost, setCourierCost] = useState(order.courierCostNgn == null ? '' : String(order.courierCostNgn));
  useEffect(() => { fetch('/api/admin/delivery').then(res => res.ok ? res.json() : null).then(data => setProviders(data?.providers?.filter((p: { active: boolean }) => p.active).map((p: { name: string }) => p.name) || [])).catch(() => {}); }, []);
  const [courierName, setCourierName] = useState(order.courierName || '');
  const [riderPhone, setRiderPhone] = useState(order.riderPhone || '');
  const [etaLocal, setEtaLocal] = useState(order.etaAt ? toLocalInput(order.etaAt) : '');
  const [trackingNote, setTrackingNote] = useState(order.trackingNote || '');

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 text-[10px] font-bold uppercase tracking-[0.1em] text-obsidian/55 hover:text-ember"
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
        options={[...new Set([...providers, ...(courierName ? [courierName] : [])])]}
      />
      <AdminInput label="Rider phone" value={riderPhone} onChange={(e) => setRiderPhone(e.target.value)} placeholder="+234…" />
      <AdminInput label="ETA" type="datetime-local" value={etaLocal} onChange={(e) => setEtaLocal(e.target.value)} />
      <AdminField label="Tracking note">
        <AdminInput value={trackingNote} onChange={(e) => setTrackingNote(e.target.value)} placeholder="Optional" />
      </AdminField>
      <AdminInput label="Booking reference" value={courierReference} onChange={(e) => setCourierReference(e.target.value)} />
      <AdminInput label="Tracking URL (HTTPS)" value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} />
      <AdminInput label="Courier cost (NGN)" type="number" min={0} step={1} value={courierCost} onChange={(e) => setCourierCost(e.target.value)} />
      <AdminInput label="Delivery proof / receipt" value={deliveryProof} onChange={(e) => setDeliveryProof(e.target.value)} />
      <label className="text-sm sm:col-span-4"><input type="checkbox" checked={recipientAgeChecked} onChange={(e) => setRecipientAgeChecked(e.target.checked)} /> Recipient age checked at delivery</label>
      <div className="flex gap-2 sm:col-span-4">
        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            const ok = await onSave({
              courierName,
              courierReference, trackingUrl, deliveryProof, recipientAgeChecked, courierCostNgn: courierCost === '' ? null : Number(courierCost),
              riderPhone,
              etaAt: etaLocal ? fromLocalInput(etaLocal) : null,
              trackingNote,
            });
            if (ok) setOpen(false);
          }}
          className="btn-brand px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] disabled:opacity-40"
        >
          {saving ? '…' : 'Save tracking'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-obsidian/55"
        >
          Close
        </button>
      </div>
    </div>
  );
}
