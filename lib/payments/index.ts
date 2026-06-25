import { getPaymentProviderName, isLivePaymentsEnabled } from './config';
import { createManualSession } from './providers/manual';
import { createLiveSession } from './providers/live';
import type { CreatePaymentSessionInput, PaymentSession } from './types';

export * from './types';
export * from './config';

export async function createPaymentSession(input: CreatePaymentSessionInput): Promise<PaymentSession> {
  const provider = getPaymentProviderName();
  const isFree = input.totals.total <= 0;

  // Free orders always fulfil instantly — no payment step.
  if (isFree) return createManualSession(input);

  if (isLivePaymentsEnabled()) {
    return createLiveSession(provider, input);
  }

  // Paid tickets without a live provider: demo instant fulfilment.
  return createManualSession(input);
}
