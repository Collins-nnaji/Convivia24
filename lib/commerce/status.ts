export const ORDER_STATUSES = [
  'pending',
  'awaiting_payment',
  'paid',
  'processing',
  'packed',
  'out_for_delivery',
  'delivered',
  'fulfilled',
  'cancelled',
  'refunded',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Order received',
  awaiting_payment: 'Awaiting payment',
  paid: 'Paid',
  processing: 'Preparing',
  packed: 'Packed',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  fulfilled: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

/**
 * Where the desk may move an order from each status. Forward-only through the delivery chain,
 * with cancel available until the bottle has left and refund available once money has moved.
 * A closed order (delivered, cancelled, refunded) is final — each of those transitions has
 * side effects (stock consumed or released, points reconciled, customer notified) that must
 * not run twice.
 */
export const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: [],
  awaiting_payment: [],
  paid: ['processing', 'packed', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
  processing: ['packed', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
  packed: ['out_for_delivery', 'delivered', 'cancelled', 'refunded'],
  out_for_delivery: ['delivered', 'cancelled', 'refunded'],
  delivered: ['refunded'],
  fulfilled: ['refunded'],
  cancelled: [],
  refunded: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Statuses that close an order for good. */
export const TERMINAL_ORDER_STATUSES: readonly OrderStatus[] = ['delivered', 'fulfilled', 'cancelled', 'refunded'];
