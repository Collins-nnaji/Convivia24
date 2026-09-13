import type { OrderStatus } from '@/lib/commerce/status';

/**
 * What a supplier may do to an order from their portal: move it forward through packing and
 * delivery. Cancelling and refunding stay with the desk — they touch the customer's money.
 */
export const SUPPLIER_SETTABLE_STATUSES: readonly OrderStatus[] = ['processing', 'packed', 'out_for_delivery', 'delivered'];
