export type PaymentProviderName = 'manual' | 'paystack' | 'stripe';

export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded' | 'failed' | 'expired';

export interface CheckoutLineItem {
  ticketTypeId: string;
  ticketTypeName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  currency: string;
  attendeeNames?: string[];
}

export interface CheckoutTotals {
  subtotal: number;
  fees: number;
  platformFee: number;
  total: number;
  currency: string;
}

export interface PaymentSession {
  provider: PaymentProviderName;
  requiresPayment: boolean;
  /** Demo / manual instant completion */
  instantFulfill: boolean;
  checkoutUrl?: string;
  clientSecret?: string;
  message?: string;
}

export interface CreatePaymentSessionInput {
  orderReference: string;
  orderId: string;
  totals: CheckoutTotals;
  buyerEmail: string;
  buyerName: string;
  eventTitle: string;
  returnUrl: string;
}
