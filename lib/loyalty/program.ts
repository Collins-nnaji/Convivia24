export type LoyaltyTierId = 'guest' | 'regular' | 'resident' | 'patron';

export type LoyaltyTier = {
  id: LoyaltyTierId;
  name: string;
  minPoints: number;
  shopDiscountPct: number;
  blurb: string;
};

export const LOYALTY_TIERS: LoyaltyTier[] = [
  { id: 'guest', name: 'Guest', minPoints: 0, shopDiscountPct: 0, blurb: 'Earn on every drop, RSVP, and review.' },
  { id: 'regular', name: 'Regular', minPoints: 2500, shopDiscountPct: 5, blurb: '5% off shop · venue card perks unlock.' },
  { id: 'resident', name: 'Resident', minPoints: 8000, shopDiscountPct: 10, blurb: '10% off shop · skip the line at partners.' },
  { id: 'patron', name: 'Patron', minPoints: 20000, shopDiscountPct: 15, blurb: '15% off shop · table credit at partner rooms.' },
];

/**
 * How points convert to a naira liability on the books.
 * Kept at ₦2.50 so a redeemed bottle or merch item is never cheaper in points
 * than its shelf price (see `pointsForNgn` in the rewards catalog).
 */
export const NGN_PER_POINT = 2.5;

/**
 * Earn rates by bottle price band.
 *
 * Liability as a share of the line (points × NGN_PER_POINT / spend):
 *   Entry   under ₦35k  → 1.25%
 *   Core    ₦35–80k     → 2.0%
 *   Premium ₦80–200k    → 2.5%
 *   Icon    ₦200k+      → 3.0%
 *
 * Entry stays lean because those SKUs carry the thinnest margin; icon bottles
 * can fund a slightly richer earn without eating the order.
 */
export type SpendPointBand = {
  upToNgn: number;
  /** Points awarded per ₦100 of that line. */
  pointsPerHundred: number;
  label: string;
};

export const SPEND_POINT_BANDS: SpendPointBand[] = [
  { upToNgn: 35_000, pointsPerHundred: 0.5, label: 'Entry' },
  { upToNgn: 80_000, pointsPerHundred: 0.8, label: 'Core' },
  { upToNgn: 200_000, pointsPerHundred: 1.0, label: 'Premium' },
  { upToNgn: Number.POSITIVE_INFINITY, pointsPerHundred: 1.2, label: 'Icon' },
];

/** Mid-band rate used when only an order total is known (no line items). */
const FALLBACK_POINTS_PER_HUNDRED = 0.8;

export function spendBandForPrice(unitPriceNgn: number): SpendPointBand {
  const price = Math.max(0, unitPriceNgn);
  return SPEND_POINT_BANDS.find((b) => price < b.upToNgn) ?? SPEND_POINT_BANDS[SPEND_POINT_BANDS.length - 1];
}

/** Points for one cart/order line, from the unit's price band. */
export function pointsFromLine(unitPriceNgn: number, qty = 1): number {
  const units = Math.max(0, Math.floor(qty));
  if (units === 0) return 0;
  const band = spendBandForPrice(unitPriceNgn);
  const lineNgn = Math.max(0, unitPriceNgn) * units;
  return Math.floor((lineNgn / 100) * band.pointsPerHundred);
}

/**
 * Points for a basket. When `chargedNgn` is below the list subtotal (tier
 * discount), the award scales down so discounts do not inflate the liability.
 */
export function pointsFromOrderItems(
  items: { unitPriceNgn: number; qty: number }[],
  chargedNgn?: number
): number {
  const listPoints = items.reduce((n, item) => n + pointsFromLine(item.unitPriceNgn, item.qty), 0);
  if (listPoints <= 0) return 0;
  const listTotal = items.reduce((n, item) => n + Math.max(0, item.unitPriceNgn) * Math.max(0, item.qty), 0);
  if (chargedNgn == null || listTotal <= 0 || chargedNgn >= listTotal) return listPoints;
  return Math.floor(listPoints * (Math.max(0, chargedNgn) / listTotal));
}

/** Fallback when line items are unavailable — Core-band rate on the charged total. */
export function pointsFromSpend(ngn: number): number {
  return Math.floor((Math.max(0, ngn) / 100) * FALLBACK_POINTS_PER_HUNDRED);
}

/** Book value of an unredeemed point balance. */
export function pointsLiabilityNgn(points: number): number {
  return Math.round(Math.max(0, points) * NGN_PER_POINT);
}

export const POINTS_RSVP = 200;
export const POINTS_REVIEW = 150;
export const POINTS_CHECKIN = 100;

export function tierForPoints(points: number): LoyaltyTier {
  let current = LOYALTY_TIERS[0];
  for (const t of LOYALTY_TIERS) {
    if (points >= t.minPoints) current = t;
  }
  return current;
}

export function nextTier(points: number): LoyaltyTier | null {
  return LOYALTY_TIERS.find((t) => t.minPoints > points) || null;
}

export function shopDiscountPct(points: number): number {
  return tierForPoints(points).shopDiscountPct;
}
