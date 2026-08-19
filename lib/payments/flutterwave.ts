const FLW_API = 'https://api.flutterwave.com/v3';

export function flutterwaveSecret(): string | null {
  const key =
    process.env.FLUTTERWAVE_SECRET_KEY?.trim() || process.env.FLW_SECRET_KEY?.trim() || '';
  return key || null;
}

export function flutterwaveWebhookHash(): string | null {
  const hash =
    process.env.FLUTTERWAVE_SECRET_HASH?.trim() || process.env.FLW_SECRET_HASH?.trim() || '';
  return hash || null;
}

type FlwVerifyData = {
  id?: number;
  tx_ref?: string;
  flw_ref?: string;
  amount?: number;
  currency?: string;
  status?: string;
  meta?: { order_id?: string };
};

async function flwFetch(path: string, init: RequestInit = {}) {
  const secret = flutterwaveSecret();
  if (!secret) throw new Error('Flutterwave is not configured.');
  const res = await fetch(`${FLW_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

export async function initializeFlutterwavePayment(input: {
  txRef: string;
  amountNgn: number;
  email: string;
  name: string;
  phone?: string | null;
  redirectUrl: string;
  orderId: string;
}): Promise<{ link: string; txRef: string } | { error: string }> {
  try {
    const { res, data } = await flwFetch('/payments', {
      method: 'POST',
      body: JSON.stringify({
        tx_ref: input.txRef,
        amount: input.amountNgn,
        currency: 'NGN',
        redirect_url: input.redirectUrl,
        customer: {
          email: input.email,
          name: input.name,
          phonenumber: input.phone || undefined,
        },
        customizations: {
          title: 'Convivia24',
          description: 'Lagos drinks order',
        },
        meta: { order_id: input.orderId },
      }),
    });
    const link = data?.data?.link as string | undefined;
    if (!res.ok || data?.status !== 'success' || !link) {
      console.error('Flutterwave init failed', data);
      return { error: data?.message || 'Flutterwave is unavailable. Please try again.' };
    }
    return { link, txRef: input.txRef };
  } catch (err) {
    console.error('Flutterwave init error', err);
    return { error: 'Could not reach Flutterwave.' };
  }
}

export async function verifyFlutterwavePayment(opts: {
  txRef?: string | null;
  transactionId?: string | null;
}): Promise<FlwVerifyData | null> {
  try {
    if (opts.transactionId && /^\d+$/.test(opts.transactionId)) {
      const { res, data } = await flwFetch(`/transactions/${opts.transactionId}/verify`);
      if (res.ok && data?.status === 'success') return (data.data || null) as FlwVerifyData;
    }
    if (opts.txRef) {
      const { res, data } = await flwFetch(
        `/transactions/verify_by_reference?tx_ref=${encodeURIComponent(opts.txRef)}`
      );
      if (res.ok && data?.status === 'success') return (data.data || null) as FlwVerifyData;
    }
    return null;
  } catch (err) {
    console.error('Flutterwave verify error', err);
    return null;
  }
}

export function flutterwavePaid(data: FlwVerifyData | null, chargedNgn: number): boolean {
  if (!data) return false;
  const status = String(data.status || '').toLowerCase();
  if (status !== 'successful' && status !== 'completed') return false;
  return Math.round(Number(data.amount)) === Math.round(chargedNgn);
}

export async function refundFlutterwave(txRef: string, amountNgn: number): Promise<{ refundRef: string } | { error: string }> {
  try {
    const verified = await verifyFlutterwavePayment({ txRef });
    const id = verified?.id;
    if (!id) return { error: 'Could not find this Flutterwave transaction.' };
    const { res, data } = await flwFetch(`/transactions/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify({ amount: amountNgn }),
    });
    if (!res.ok || data?.status !== 'success') {
      return { error: data?.message || 'Flutterwave refund failed.' };
    }
    return { refundRef: String(data?.data?.id ?? id) };
  } catch (err) {
    console.error('Flutterwave refund error', err);
    return { error: 'Could not reach Flutterwave.' };
  }
}
