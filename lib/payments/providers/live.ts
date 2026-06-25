import type { CreatePaymentSessionInput, PaymentProviderName, PaymentSession } from '../types';
import { absoluteUrl } from '@/lib/url';

/**
 * Placeholder for live provider sessions.
 * Wire Paystack Initialize Transaction or Stripe PaymentIntent here when keys are set.
 */
export async function createLiveSession(
  provider: PaymentProviderName,
  input: CreatePaymentSessionInput,
): Promise<PaymentSession> {
  const callbackUrl = absoluteUrl(`/orders/${input.orderReference}?payment=return`);

  if (provider === 'paystack' && process.env.PAYSTACK_SECRET_KEY) {
    // TODO: POST https://api.paystack.co/transaction/initialize
    return {
      provider: 'paystack',
      requiresPayment: true,
      instantFulfill: false,
      checkoutUrl: callbackUrl,
      message: 'Paystack integration ready — implement initialize call in lib/payments/providers/live.ts',
    };
  }

  if (provider === 'stripe' && process.env.STRIPE_SECRET_KEY) {
    // TODO: stripe.paymentIntents.create(...)
    return {
      provider: 'stripe',
      requiresPayment: true,
      instantFulfill: false,
      clientSecret: 'pending_stripe_setup',
      message: 'Stripe integration ready — implement PaymentIntent in lib/payments/providers/live.ts',
    };
  }

  throw new Error(`${provider} is configured but API keys are missing.`);
}
