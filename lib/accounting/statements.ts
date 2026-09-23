/**
 * Operating accounts for the admin desk.
 *
 * The shop never kept a double-entry ledger. What it does keep — collected orders, supplier
 * cost, referral payouts, gift cards, rewards and stock — is enough to state profit, payouts
 * and a position. Cash here is "customers paid us, less refunds and commissions we marked
 * paid". It is not a bank balance: supplier invoices are not recorded as paid.
 */

import { processingCostNgn } from '@/lib/pricing/checkout-fees';

export const PERIODS = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
  { key: 'mtd', label: 'This month' },
  { key: 'ytd', label: 'This year' },
  { key: 'all', label: 'All time' },
] as const;

export type PeriodKey = (typeof PERIODS)[number]['key'];
export type Grain = 'day' | 'week' | 'month';

const LAGOS = 'Africa/Lagos';
const LAGOS_OFFSET = '+01:00';

export function isPeriodKey(value: string): value is PeriodKey {
  return PERIODS.some((p) => p.key === value);
}

export function booksAmount(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

/** Margin as a share of revenue, one decimal. Zero when there is nothing to divide by. */
export function booksPct(part: number, whole: number): number {
  if (whole === 0) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

type Ymd = { year: number; month: number; day: number };

function lagosYmd(date: Date): Ymd {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: LAGOS,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get('year'), month: get('month'), day: get('day') };
}

function lagosKey(date: Date): string {
  const { year, month, day } = lagosYmd(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function lagosStart(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}T00:00:00${LAGOS_OFFSET}`;
}

function lagosClock(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: LAGOS,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  return `${get('hour')}:${get('minute')}:${get('second')}`;
}

/** Days in a calendar month. `month` is 1–12. */
function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function addDays(key: string, days: number): string {
  const next = new Date(new Date(`${key}T00:00:00${LAGOS_OFFSET}`).getTime() + days * 86_400_000);
  return lagosKey(next);
}

function nextMonth(key: string): string {
  const year = Number(key.slice(0, 4));
  const month = Number(key.slice(5, 7));
  const m = month === 12 ? 1 : month + 1;
  const y = month === 12 ? year + 1 : year;
  return `${y}-${String(m).padStart(2, '0')}-01`;
}

export type PeriodRange = { from: string; to: string; label: string };

export function periodRange(key: PeriodKey, now = new Date()): PeriodRange {
  const to = now.toISOString();
  const { year, month } = lagosYmd(now);
  if (key === 'all') return { from: '1970-01-01T00:00:00.000Z', to, label: 'All time' };
  if (key === '7d' || key === '30d' || key === '90d') {
    const days = key === '7d' ? 7 : key === '30d' ? 30 : 90;
    return { from: new Date(now.getTime() - days * 86_400_000).toISOString(), to, label: `Last ${days} days` };
  }
  if (key === 'ytd') return { from: lagosStart(year, 1, 1), to, label: String(year) };
  return { from: lagosStart(year, month, 1), to, label: 'This month' };
}

/**
 * The stretch we compare the current window against. Rolling windows step straight back.
 * Month- and year-to-date step back a calendar period so "this month" is not compared
 * with a slice that straddles two months.
 */
export function comparisonRange(key: PeriodKey, now = new Date()): PeriodRange | null {
  if (key === 'all') return null;
  const current = periodRange(key, now);
  if (key === '7d' || key === '30d' || key === '90d') {
    const fromMs = new Date(current.from).getTime();
    const toMs = new Date(current.to).getTime();
    return {
      from: new Date(fromMs - (toMs - fromMs)).toISOString(),
      to: current.from,
      label: 'previous period',
    };
  }
  const { year, month, day } = lagosYmd(now);
  const clock = lagosClock(now);
  if (key === 'ytd') {
    const endDay = Math.min(day, daysInMonth(year - 1, month));
    return {
      from: lagosStart(year - 1, 1, 1),
      to: `${year - 1}-${pad(month)}-${pad(endDay)}T${clock}${LAGOS_OFFSET}`,
      label: 'same dates last year',
    };
  }
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const endDay = Math.min(day, daysInMonth(prevYear, prevMonth));
  return {
    from: lagosStart(prevYear, prevMonth, 1),
    to: `${prevYear}-${pad(prevMonth)}-${pad(endDay)}T${clock}${LAGOS_OFFSET}`,
    label: 'same days last month',
  };
}

export type ChartWindow = { from: string; to: string; grain: Grain; capped: boolean };

/** How finely to plot the window. All-time is capped so a long history stays readable. */
export function chartWindow(key: PeriodKey, now = new Date()): ChartWindow {
  const period = periodRange(key, now);
  if (key === 'all') {
    const { year, month } = lagosYmd(now);
    const index = year * 12 + (month - 1) - 23;
    const y = Math.floor(index / 12);
    const m = (index % 12) + 1;
    return { from: lagosStart(y, m, 1), to: period.to, grain: 'month', capped: true };
  }
  if (key === '90d') return { from: period.from, to: period.to, grain: 'week', capped: false };
  if (key === 'ytd') return { from: period.from, to: period.to, grain: 'month', capped: false };
  return { from: period.from, to: period.to, grain: 'day', capped: false };
}

const WEEKDAY_OFFSET: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

export function bucketStart(grain: Grain, iso: string): string {
  const date = new Date(iso);
  const key = lagosKey(date);
  if (grain === 'day') return key;
  if (grain === 'month') return `${key.slice(0, 7)}-01`;
  const weekday = new Intl.DateTimeFormat('en-GB', { timeZone: LAGOS, weekday: 'short' }).format(date);
  return addDays(key, -(WEEKDAY_OFFSET[weekday] ?? 0));
}

export function bucketLabel(grain: Grain, key: string): string {
  const date = new Date(`${key}T12:00:00${LAGOS_OFFSET}`);
  if (grain === 'month') {
    return date.toLocaleDateString('en-NG', { month: 'short', year: 'numeric', timeZone: LAGOS });
  }
  const short = date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', timeZone: LAGOS });
  return grain === 'week' ? `w/c ${short}` : short;
}

const GRAIN_CAP: Record<Grain, number> = { day: 32, week: 16, month: 24 };

export type Bucket = { key: string; label: string };

/** Inclusive buckets from the window start through the bucket that contains the last instant. */
export function chartBuckets(grain: Grain, fromIso: string, toIso: string): { buckets: Bucket[]; capped: boolean } {
  const endMs = new Date(toIso).getTime() - 1;
  const start = bucketStart(grain, fromIso);
  const end = bucketStart(grain, new Date(endMs).toISOString());
  const keys: string[] = [];
  let cursor = start;
  while (cursor <= end && keys.length < 400) {
    keys.push(cursor);
    cursor = grain === 'month' ? nextMonth(cursor) : addDays(cursor, grain === 'week' ? 7 : 1);
  }
  const cap = GRAIN_CAP[grain];
  const capped = keys.length > cap;
  const kept = capped ? keys.slice(-cap) : keys;
  return { buckets: kept.map((key) => ({ key, label: bucketLabel(grain, key) })), capped };
}

export type OrderTotals = {
  orderCount: number;
  grossSalesNgn: number;
  loyaltyDiscountNgn: number;
  giftCardDiscountNgn: number;
  chargedNgn: number;
  refundedNgn: number;
  supplierCostNgn: number;
  estimatedCostNgn: number;
  sourcedOrders: number;
  unsourcedOrders: number;
  /** Gross collected by transfer into the Access Bank account. Flutterwave is not taken on this. */
  bankChargedNgn: number;
  bankOrderCount: number;
};

export type ProfitAndLoss = OrderTotals & {
  otherAdjustmentsNgn: number;
  netRevenueNgn: number;
  cogsNgn: number;
  grossProfitNgn: number;
  grossMarginPct: number;
  commissionsAccruedNgn: number;
  commissionsPaidNgn: number;
  /** Face value of rewards handed over in the period. */
  rewardCostNgn: number;
  /** Points spent on those redemptions, valued at NGN_PER_POINT — releases the liability. */
  loyaltyReleasedNgn: number;
  /** Points awarded on delivered orders, valued at NGN_PER_POINT — the new liability. */
  loyaltyAccruedNgn: number;
  /** Points awarded in the period (for the admin hint). */
  loyaltyPointsAwarded: number;
  flutterwaveNgn: number;
  accessNgn: number;
  netProfitNgn: number;
  netMarginPct: number;
  avgOrderNgn: number;
};

export function buildProfitAndLoss(
  orders: OrderTotals,
  commissions: { accruedNgn: number; paidNgn: number },
  rewards: { costNgn: number; releasedNgn: number },
  loyalty: { accruedNgn: number; pointsAwarded: number }
): ProfitAndLoss {
  const explained = orders.grossSalesNgn - orders.loyaltyDiscountNgn - orders.giftCardDiscountNgn;
  const netRevenueNgn = orders.chargedNgn - orders.refundedNgn;
  const cogsNgn = orders.supplierCostNgn + orders.estimatedCostNgn;
  const grossProfitNgn = netRevenueNgn - cogsNgn;
  const fees = processingCostNgn({
    chargedNgn: orders.chargedNgn,
    bankChargedNgn: orders.bankChargedNgn,
    cogsNgn,
    orderCount: orders.orderCount,
  });
  // Accrue the promise when points are earned. On redeem, release that liability and only
  // expense any fulfilment cost above the points already booked.
  const rewardFulfillmentNgn = Math.max(0, rewards.costNgn - rewards.releasedNgn);
  const netProfitNgn =
    grossProfitNgn - commissions.accruedNgn - loyalty.accruedNgn - rewardFulfillmentNgn - fees.totalNgn;
  return {
    ...orders,
    otherAdjustmentsNgn: orders.chargedNgn - explained,
    netRevenueNgn,
    cogsNgn,
    grossProfitNgn,
    grossMarginPct: booksPct(grossProfitNgn, netRevenueNgn),
    commissionsAccruedNgn: commissions.accruedNgn,
    commissionsPaidNgn: commissions.paidNgn,
    rewardCostNgn: rewards.costNgn,
    loyaltyReleasedNgn: rewards.releasedNgn,
    loyaltyAccruedNgn: loyalty.accruedNgn,
    loyaltyPointsAwarded: loyalty.pointsAwarded,
    flutterwaveNgn: fees.flutterwaveNgn,
    accessNgn: fees.accessNgn,
    netProfitNgn,
    netMarginPct: booksPct(netProfitNgn, netRevenueNgn),
    avgOrderNgn: orders.orderCount > 0 ? Math.round(netRevenueNgn / orders.orderCount) : 0,
  };
}

export type TrendPoint = {
  key: string;
  label: string;
  orderCount: number;
  netRevenueNgn: number;
  cogsNgn: number;
  refundedNgn: number;
  grossProfitNgn: number;
  commissionsAccruedNgn: number;
  commissionsPaidNgn: number;
  netProfitNgn: number;
};

export function buildTrend(
  buckets: Bucket[],
  revenue: { key: string; orderCount: number; netRevenueNgn: number; cogsNgn: number; refundedNgn: number; bankChargedNgn?: number }[],
  commissions: { key: string; accruedNgn: number; paidNgn: number }[]
): TrendPoint[] {
  const byRevenue = new Map(revenue.map((row) => [row.key, row]));
  const byCommission = new Map(commissions.map((row) => [row.key, row]));
  return buckets.map((bucket) => {
    const sales = byRevenue.get(bucket.key);
    const cut = byCommission.get(bucket.key);
    const netRevenueNgn = sales?.netRevenueNgn ?? 0;
    const cogsNgn = sales?.cogsNgn ?? 0;
    const commissionsAccruedNgn = cut?.accruedNgn ?? 0;
    const grossProfitNgn = netRevenueNgn - cogsNgn;
    const fees = processingCostNgn({
      chargedNgn: netRevenueNgn + (sales?.refundedNgn ?? 0),
      bankChargedNgn: sales?.bankChargedNgn ?? 0,
      cogsNgn,
      orderCount: sales?.orderCount ?? 0,
    });
    return {
      key: bucket.key,
      label: bucket.label,
      orderCount: sales?.orderCount ?? 0,
      netRevenueNgn,
      cogsNgn,
      refundedNgn: sales?.refundedNgn ?? 0,
      grossProfitNgn,
      commissionsAccruedNgn,
      commissionsPaidNgn: cut?.paidNgn ?? 0,
      netProfitNgn: grossProfitNgn - commissionsAccruedNgn - fees.totalNgn,
    };
  });
}

/** Drop empty buckets before the first movement. Quiet months after that stay, so a gap is visible. */
export function trimQuietLead(points: TrendPoint[]): TrendPoint[] {
  const start = points.findIndex(
    (point) =>
      point.orderCount !== 0 ||
      point.netRevenueNgn !== 0 ||
      point.cogsNgn !== 0 ||
      point.commissionsAccruedNgn !== 0 ||
      point.commissionsPaidNgn !== 0
  );
  return start < 0 ? [] : points.slice(start);
}

export type BalanceSheet = {
  cashCollectedNgn: number;
  commissionsPaidLifetimeNgn: number;
  cashRetainedNgn: number;
  inventoryNgn: number;
  costedUnits: number;
  uncostedUnits: number;
  receivablesNgn: number;
  receivableOrders: number;
  assetsNgn: number;
  commissionsPayableNgn: number;
  giftCardsNgn: number;
  giftCardCount: number;
  rewardsOutstandingNgn: number;
  rewardsOutstandingCount: number;
  /** Unredeemed member points × NGN_PER_POINT — a real liability. */
  loyaltyPointsLiabilityNgn: number;
  loyaltyPointsOutstanding: number;
  loyaltyMemberCount: number;
  liabilitiesNgn: number;
  equityNgn: number;
  /** Recorded supplier cost across recognized orders. Not subtracted from cash — payment is not tracked. */
  supplierCostLifetimeNgn: number;
  lifetimeNetProfitNgn: number;
};

export function buildBalanceSheet(input: {
  cashCollectedNgn: number;
  commissionsPaidLifetimeNgn: number;
  inventoryNgn: number;
  costedUnits: number;
  uncostedUnits: number;
  receivablesNgn: number;
  receivableOrders: number;
  commissionsPayableNgn: number;
  giftCardsNgn: number;
  giftCardCount: number;
  rewardsOutstandingNgn: number;
  rewardsOutstandingCount: number;
  loyaltyPointsLiabilityNgn: number;
  loyaltyPointsOutstanding: number;
  loyaltyMemberCount: number;
  supplierCostLifetimeNgn: number;
  rewardsLifetimeNgn: number;
}): BalanceSheet {
  const cashRetainedNgn = input.cashCollectedNgn - input.commissionsPaidLifetimeNgn;
  const assetsNgn = cashRetainedNgn + input.inventoryNgn + input.receivablesNgn;
  const liabilitiesNgn =
    input.commissionsPayableNgn +
    input.giftCardsNgn +
    input.rewardsOutstandingNgn +
    input.loyaltyPointsLiabilityNgn;
  const commissionsAccrued = input.commissionsPayableNgn + input.commissionsPaidLifetimeNgn;
  // Outstanding points are still a promise; fulfilled rewards are already spent. Both cut profit.
  const lifetimeNetProfitNgn =
    input.cashCollectedNgn -
    input.supplierCostLifetimeNgn -
    commissionsAccrued -
    input.rewardsLifetimeNgn -
    input.loyaltyPointsLiabilityNgn;
  return {
    cashCollectedNgn: input.cashCollectedNgn,
    commissionsPaidLifetimeNgn: input.commissionsPaidLifetimeNgn,
    cashRetainedNgn,
    inventoryNgn: input.inventoryNgn,
    costedUnits: input.costedUnits,
    uncostedUnits: input.uncostedUnits,
    receivablesNgn: input.receivablesNgn,
    receivableOrders: input.receivableOrders,
    assetsNgn,
    commissionsPayableNgn: input.commissionsPayableNgn,
    giftCardsNgn: input.giftCardsNgn,
    giftCardCount: input.giftCardCount,
    rewardsOutstandingNgn: input.rewardsOutstandingNgn,
    rewardsOutstandingCount: input.rewardsOutstandingCount,
    loyaltyPointsLiabilityNgn: input.loyaltyPointsLiabilityNgn,
    loyaltyPointsOutstanding: input.loyaltyPointsOutstanding,
    loyaltyMemberCount: input.loyaltyMemberCount,
    liabilitiesNgn,
    equityNgn: assetsNgn - liabilitiesNgn,
    supplierCostLifetimeNgn: input.supplierCostLifetimeNgn,
    lifetimeNetProfitNgn,
  };
}

export type PayoutRow = {
  id: string;
  name: string;
  kind: string;
  paidNgn: number;
  owedNgn: number;
  referredNgn: number;
};

export type MixRow = {
  name: string;
  orders: number;
  netNgn: number;
  costNgn?: number;
};

export type AccountingReport = {
  period: PeriodRange & { key: PeriodKey };
  comparisonLabel: string | null;
  pnl: ProfitAndLoss;
  previous: ProfitAndLoss | null;
  trend: TrendPoint[];
  trendGrain: Grain;
  trendCapped: boolean;
  balance: BalanceSheet;
  payouts: PayoutRow[];
  providers: MixRow[];
  suppliers: MixRow[];
  wholesaleOrders: number;
  wholesaleNgn: number;
  giftCardsIssuedCount: number;
  giftCardsIssuedNgn: number;
};
