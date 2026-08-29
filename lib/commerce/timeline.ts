import sql from '@/lib/db';
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/commerce/status';

/** The steps a customer is shown, in the order they happen. */
export const TRACKING_PIPELINE: OrderStatus[] = [
  'paid',
  'processing',
  'packed',
  'out_for_delivery',
  'delivered',
];

export type OrderEvent = { status: OrderStatus; note: string | null; at: string };

export type TrackingStep = {
  status: OrderStatus;
  label: string;
  /** When it happened. Null means the step has not been reached. */
  at: string | null;
  done: boolean;
  current: boolean;
};

/**
 * Record a status transition. Idempotent per status, so re-saving the same
 * status from the desk does not add a second entry to a customer's timeline.
 */
export async function recordOrderEvent(
  orderId: string,
  status: OrderStatus,
  note?: string | null
): Promise<void> {
  await sql`
    INSERT INTO order_events (order_id, status, note)
    VALUES (${orderId}, ${status}, ${note || null})
    ON CONFLICT (order_id, status) DO NOTHING
  `;
}

export async function listOrderEvents(orderId: string): Promise<OrderEvent[]> {
  const rows = await sql`
    SELECT status, note, created_at FROM order_events
    WHERE order_id = ${orderId}
    ORDER BY created_at ASC
  `;
  return rows.map((r) => ({
    status: String(r.status) as OrderStatus,
    note: (r.note as string) || null,
    at: new Date(r.created_at as string).toISOString(),
  }));
}

/**
 * Build the customer-facing stepper.
 *
 * A step is marked done from the order's current status, but its timestamp only
 * appears if we actually recorded that transition — orders placed before the
 * timeline existed show the step without a time rather than a made-up one.
 */
export function buildTrackingSteps(
  status: OrderStatus,
  events: OrderEvent[],
  placedAt: string
): TrackingStep[] {
  const effective = status === 'fulfilled' ? 'delivered' : status;
  const reached = TRACKING_PIPELINE.indexOf(effective);
  const byStatus = new Map(events.map((e) => [e.status, e.at]));

  return TRACKING_PIPELINE.map((step, i) => ({
    status: step,
    label: ORDER_STATUS_LABELS[step],
    // 'paid' is the moment the order exists, so it always has a time.
    at: byStatus.get(step) ?? (step === 'paid' && reached >= 0 ? placedAt : null),
    done: reached >= 0 && i <= reached,
    current: i === reached,
  }));
}

/** Orders that have stopped moving — nothing further will happen to them. */
export function isTerminal(status: OrderStatus): boolean {
  return status === 'cancelled' || status === 'refunded';
}
