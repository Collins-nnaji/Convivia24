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
