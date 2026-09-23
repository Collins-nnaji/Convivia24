/**
 * What a naira checkout actually costs us, and the shelf price that covers it.
 *
 * Flutterwave Nigeria, local collections (pricing page, fee change of 11 April 2025):
 * 2% of the amount the customer pays — 1.4% transaction fee plus 0.6% platform fee —
 * and 7.5% VAT on that fee. The old ₦2,000 cap was removed with that increase.
 *
 * Access Bank, once the money is ours:
 * - Paying a supplier by NIP: ₦10 / ₦25 / ₦50 by band, plus 7.5% VAT (bank rates guide).
 * - Current-account maintenance: ₦1 per mille of the debit.
 * - Transaction alert: ₦4 SMS.
 * Stamp duty of ₦50 on transfers of ₦10,000 and above is paid by the sender from
 * 1 January 2026, so it is not taken off what Access credits us.
 *
 * The shelf price assumes the bottle is its own checkout. A larger basket shares the
 * flat Access charges, so a single-bottle price is the safe one.
 */

export const FLUTTERWAVE_LOCAL_RATE = 0.02;
export const FEE_VAT_RATE = 0.075;
/** Share of the charged amount that remains after Flutterwave and VAT on the fee. */
export const FLUTTERWAVE_KEEP_RATE = 1 - FLUTTERWAVE_LOCAL_RATE * (1 + FEE_VAT_RATE);

export const ACCESS_CAMF_RATE = 0.001;
export const ACCESS_SMS_NGN = 4;

/** Starts here. The drinks desk stores whatever we change it to. */
export const DEFAULT_MARKUP_PCT = 15;

export type MarkupPolicy = {
  /** Percent of supplier cost we keep, on top of fees. */
  markupPct: number;
  /** Extra naira added on every bottle, after the percent. */
  markupFlatNgn: number;
};

export const DEFAULT_MARKUP: MarkupPolicy = { markupPct: DEFAULT_MARKUP_PCT, markupFlatNgn: 0 };

function naira(value: number): number {
  return Number.isFinite(value) ? Math.round(value) : 0;
}

/** Access NIP to another bank, VAT included. Zero when nothing is being paid out. */
export function accessNipNgn(amountNgn: number): number {
  const amount = naira(amountNgn);
  if (amount <= 0) return 0;
  const base = amount <= 5_000 ? 10 : amount <= 50_000 ? 25 : 50;
  return naira(base * (1 + FEE_VAT_RATE));
}

/** Flutterwave local collection, VAT included. Charged on what the customer pays. */
export function flutterwaveCollectionNgn(chargedNgn: number): number {
  const charged = naira(chargedNgn);
  if (charged <= 0) return 0;
  return naira(charged * FLUTTERWAVE_LOCAL_RATE * (1 + FEE_VAT_RATE));
}

export function accessOnPayoutNgn(costNgn: number): { nipNgn: number; camfNgn: number } {
  const cost = Math.max(0, naira(costNgn));
  return { nipNgn: accessNipNgn(cost), camfNgn: naira(cost * ACCESS_CAMF_RATE) };
}

export function markupAmountNgn(costNgn: number, policy: MarkupPolicy): number {
  const cost = Math.max(0, naira(costNgn));
  const pct = Number.isFinite(policy.markupPct) ? Math.max(0, policy.markupPct) : 0;
  const flat = Number.isFinite(policy.markupFlatNgn) ? Math.max(0, naira(policy.markupFlatNgn)) : 0;
  return naira(cost * (pct / 100)) + flat;
}

/**
 * Collection and bank charges on a stretch of orders.
 * Flutterwave is taken only on what was collected through Flutterwave.
 * A direct transfer into Access Bank is credited in full: the sender pays stamp duty,
 * and an inward credit is not a Flutterwave charge or an Access debit fee.
 * Access here is the cost of paying suppliers for that stock, plus one alert per order.
 */
export function processingCostNgn(input: {
  chargedNgn: number;
  /** Gross amount collected by transfer into the Access Bank account. */
  bankChargedNgn?: number;
  cogsNgn: number;
  orderCount: number;
}): {
  flutterwaveNgn: number;
  accessNgn: number;
  totalNgn: number;
} {
  const charged = Math.max(0, naira(input.chargedNgn));
  const bank = Math.min(charged, Math.max(0, naira(input.bankChargedNgn ?? 0)));
  const access = accessOnPayoutNgn(input.cogsNgn);
  const alerts = Math.max(0, naira(input.orderCount)) * ACCESS_SMS_NGN;
  const flutterwaveNgn = flutterwaveCollectionNgn(charged - bank);
  const accessNgn = access.nipNgn + access.camfNgn + alerts;
  return { flutterwaveNgn, accessNgn, totalNgn: flutterwaveNgn + accessNgn };
}

export type PriceQuote = {
  costNgn: number;
  nipNgn: number;
  camfNgn: number;
  smsNgn: number;
  markupNgn: number;
  /** What we need left after Flutterwave. */
  targetNetNgn: number;
  /** Shelf price, rounded up to the next ₦100 so rounding cannot eat the margin. */
  suggestedNgn: number;
  flutterwaveNgn: number;
  netAfterFeesNgn: number;
};

/** Retail that covers supplier cost, Access payout, our markup, then Flutterwave. */
export function quoteRetail(costNgn: number, policy: MarkupPolicy): PriceQuote | null {
  const cost = naira(costNgn);
  if (cost < 0) return null;
  const markupNgn = markupAmountNgn(cost, policy);
  if (cost === 0 && markupNgn === 0) return null;

  const { nipNgn, camfNgn } = accessOnPayoutNgn(cost);
  const targetNetNgn = cost + nipNgn + camfNgn + ACCESS_SMS_NGN + markupNgn;
  const raw = targetNetNgn / FLUTTERWAVE_KEEP_RATE;
  const suggestedNgn = Math.ceil(raw / 100) * 100;
  const flutterwaveNgn = flutterwaveCollectionNgn(suggestedNgn);
  return {
    costNgn: cost,
    nipNgn,
    camfNgn,
    smsNgn: ACCESS_SMS_NGN,
    markupNgn,
    targetNetNgn,
    suggestedNgn,
    flutterwaveNgn,
    netAfterFeesNgn: suggestedNgn - flutterwaveNgn,
  };
}
