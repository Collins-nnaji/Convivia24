import type { PaymentProviderName } from './types';

export function getPaymentProviderName(): PaymentProviderName {
  const raw = (process.env.PAYMENT_PROVIDER || 'manual').toLowerCase();
  if (raw === 'paystack' || raw === 'stripe') return raw;
  return 'manual';
}

export function isLivePaymentsEnabled(): boolean {
  const provider = getPaymentProviderName();
  if (provider === 'manual') return false;
  if (provider === 'paystack') return !!process.env.PAYSTACK_SECRET_KEY;
  if (provider === 'stripe') return !!process.env.STRIPE_SECRET_KEY;
  return false;
}

export function platformFeePercent(): number {
  const n = parseFloat(process.env.CONVIVIA_PLATFORM_FEE_PERCENT || '0');
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function orderExpiryMinutes(): number {
  const n = parseInt(process.env.CONVIVIA_ORDER_EXPIRY_MINUTES || '30', 10);
  return Number.isFinite(n) && n > 0 ? n : 30;
}
