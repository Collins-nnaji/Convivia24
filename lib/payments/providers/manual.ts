import type { CreatePaymentSessionInput, PaymentSession } from '../types';

/** Instant fulfilment — used for free tickets and demo / pre-integration mode. */
export async function createManualSession(input: CreatePaymentSessionInput): Promise<PaymentSession> {
  const isFree = input.totals.total <= 0;
  return {
    provider: 'manual',
    requiresPayment: !isFree,
    instantFulfill: true,
    message: isFree
      ? 'Free registration — your tickets will be issued immediately.'
      : 'Demo checkout — tickets issued without a live payment charge. Connect Paystack or Stripe to collect payments.',
  };
}
