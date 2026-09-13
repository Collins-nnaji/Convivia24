import sql from '@/lib/db';
import { ORDER_STATUS_LABELS, canTransition, type OrderStatus } from '@/lib/commerce/status';
import { recordOrderEvent } from '@/lib/commerce/timeline';
import { notifyOrderStatus } from '@/lib/commerce/notify';
import { releaseOrderResources, fulfillOrderStock } from '@/lib/commerce/fulfillment';
import { reconcileOrderPoints } from '@/lib/loyalty/members';
import { logSupplierAction } from '@/lib/suppliers/audit';

export type TrackingPatch = {
  courierName?: string | null;
  riderPhone?: string | null;
  trackingNote?: string | null;
  /** ISO string to set, null to clear, undefined to leave alone. */
  etaAt?: string | null;
};

export type TransitionActor =
  | { kind: 'admin' }
  | { kind: 'supplier'; supplierId: string; label?: string | null };

export type TransitionResult =
  | { ok: true; orderId: string; status: OrderStatus; changed: boolean }
  | { ok: false; httpStatus: number; error: string };

/** Pulls the tracking fields out of a loosely-typed request body. */
export function readTrackingPatch(body: Record<string, unknown>): TrackingPatch {
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() || null : undefined);
  return {
    courierName: str(body.courierName),
    riderPhone: str(body.riderPhone),
    trackingNote: str(body.trackingNote),
    etaAt:
      typeof body.etaAt === 'string' && body.etaAt.trim()
        ? new Date(body.etaAt).toISOString()
        : body.etaAt === null
          ? null
          : undefined,
  };
}

async function supplierFor(orderId: string): Promise<string | null> {
  const [row] = await sql`SELECT COALESCE(supplier_id, routed_supplier_id) AS sid FROM ritual_orders WHERE id = ${orderId}`;
  return row?.sid ? String(row.sid) : null;
}

/**
 * Rider / ETA / note only — never touches status, never messages the customer.
 */
export async function applyOrderTracking(orderId: string, patch: TrackingPatch, actor: TransitionActor) {
  const [order] = await sql`
    UPDATE ritual_orders
    SET
      courier_name = COALESCE(${patch.courierName ?? null}, courier_name),
      rider_phone = COALESCE(${patch.riderPhone ?? null}, rider_phone),
      tracking_note = COALESCE(${patch.trackingNote ?? null}, tracking_note),
      eta_at = CASE WHEN ${patch.etaAt === undefined} THEN eta_at ELSE ${patch.etaAt ?? null}::timestamptz END,
      updated_at = NOW()
    WHERE id = ${orderId}
    RETURNING id, status, courier_name, rider_phone, eta_at, tracking_note
  `;
  if (!order) return null;

  const supplierId = actor.kind === 'supplier' ? actor.supplierId : await supplierFor(orderId);
  if (supplierId) {
    await logSupplierAction({
      supplierId,
      actor: actor.kind,
      actorLabel: actor.kind === 'supplier' ? actor.label : 'desk',
      action: 'order.tracking',
      orderId,
      detail: { courierName: order.courier_name, etaAt: order.eta_at },
    });
  }
  return {
    orderId: String(order.id),
    status: order.status as OrderStatus,
    courierName: (order.courier_name as string) || null,
    riderPhone: (order.rider_phone as string) || null,
    etaAt: order.eta_at ? String(order.eta_at) : null,
    trackingNote: (order.tracking_note as string) || null,
  };
}

/**
 * The one way an order's status changes by hand. Validates the transition, guards against a
 * concurrent move, stamps the timeline, runs stock/points side effects, tells the customer, and
 * records who did it against the supplier when one is attached.
 *
 * `refunded` is refused here on purpose — refunds move money and have their own path.
 */
export async function applyOrderStatus(
  orderId: string,
  status: OrderStatus,
  opts: { note?: string | null; tracking?: TrackingPatch; actor: TransitionActor; allowed?: readonly OrderStatus[] }
): Promise<TransitionResult> {
  if (status === 'refunded') {
    return { ok: false, httpStatus: 400, error: 'Use the refund action so the payment is actually returned.' };
  }
  if (opts.allowed && !opts.allowed.includes(status)) {
    return { ok: false, httpStatus: 403, error: `You cannot set an order to ${ORDER_STATUS_LABELS[status].toLowerCase()}.` };
  }

  const [current] = await sql`SELECT status FROM ritual_orders WHERE id = ${orderId} LIMIT 1`;
  if (!current) return { ok: false, httpStatus: 404, error: 'Order not found.' };
  const from = current.status as OrderStatus;
  if (from === status) return { ok: true, orderId, status, changed: false };
  if (!canTransition(from, status)) {
    return {
      ok: false,
      httpStatus: 409,
      error: `Cannot move a ${ORDER_STATUS_LABELS[from].toLowerCase()} order to ${ORDER_STATUS_LABELS[status].toLowerCase()}.`,
    };
  }

  const t = opts.tracking ?? {};
  const [order] = await sql`
    UPDATE ritual_orders
    SET
      status = ${status},
      courier_name = COALESCE(${t.courierName ?? null}, courier_name),
      rider_phone = COALESCE(${t.riderPhone ?? null}, rider_phone),
      tracking_note = COALESCE(${t.trackingNote ?? null}, tracking_note),
      eta_at = CASE WHEN ${t.etaAt === undefined} THEN eta_at ELSE ${t.etaAt ?? null}::timestamptz END,
      updated_at = NOW()
    WHERE id = ${orderId} AND status = ${from}
    RETURNING id
  `;
  // The `AND status = ${from}` guard means a second tab that already moved this order gets a
  // conflict instead of a silently repeated side effect.
  if (!order) return { ok: false, httpStatus: 409, error: 'Order changed in the meantime. Reload and try again.' };

  const note = opts.note?.trim() || null;
  await recordOrderEvent(orderId, status, note).catch(() => {});

  if (status === 'delivered' || status === 'fulfilled') {
    await fulfillOrderStock(orderId);
  } else if (status === 'cancelled') {
    await releaseOrderResources(orderId);
  }
  await reconcileOrderPoints(orderId);
  await notifyOrderStatus(orderId, status, note);

  const supplierId = opts.actor.kind === 'supplier' ? opts.actor.supplierId : await supplierFor(orderId);
  if (supplierId) {
    await logSupplierAction({
      supplierId,
      actor: opts.actor.kind,
      actorLabel: opts.actor.kind === 'supplier' ? opts.actor.label : 'desk',
      action: 'order.status',
      orderId,
      detail: { from, to: status, note },
    });
  }

  return { ok: true, orderId, status, changed: true };
}
