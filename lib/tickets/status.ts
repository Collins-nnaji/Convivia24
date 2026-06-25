import type { OrderStatus } from '@/lib/payments/types';

export function orderStatusLabel(status: string): string {
  const map: Record<OrderStatus, string> = {
    pending: 'Awaiting payment',
    paid: 'Confirmed',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
    failed: 'Payment failed',
    expired: 'Expired',
  };
  return map[status as OrderStatus] ?? status;
}

export function canShowTickets(status: string): boolean {
  return status === 'paid';
}
