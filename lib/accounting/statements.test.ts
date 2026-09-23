import { describe, expect, it } from 'vitest';
import { processingCostNgn } from '@/lib/pricing/checkout-fees';
import {
  bucketStart,
  buildBalanceSheet,
  buildProfitAndLoss,
  buildTrend,
  chartBuckets,
  comparisonRange,
  periodRange,
  trimQuietLead,
} from './statements';

const orders = {
  orderCount: 2,
  grossSalesNgn: 1_000_000,
  loyaltyDiscountNgn: 50_000,
  giftCardDiscountNgn: 20_000,
  chargedNgn: 930_000,
  refundedNgn: 30_000,
  supplierCostNgn: 600_000,
  estimatedCostNgn: 40_000,
  sourcedOrders: 1,
  unsourcedOrders: 1,
  bankChargedNgn: 0,
  bankOrderCount: 0,
};

const emptyLoyalty = { accruedNgn: 0, pointsAwarded: 0 };

describe('buildProfitAndLoss', () => {
  const pnl = buildProfitAndLoss(
    orders,
    { accruedNgn: 25_000, paidNgn: 10_000 },
    { costNgn: 5_000, releasedNgn: 5_000 },
    emptyLoyalty
  );

  it('bridges gross sales down to what was charged', () => {
    expect(pnl.otherAdjustmentsNgn).toBe(0);
    expect(pnl.netRevenueNgn).toBe(900_000);
  });

  it('charges recorded and estimated cost, then commissions and checkout fees', () => {
    const fees = processingCostNgn({ chargedNgn: orders.chargedNgn, cogsNgn: 640_000, orderCount: orders.orderCount });
    expect(pnl.cogsNgn).toBe(640_000);
    expect(pnl.grossProfitNgn).toBe(260_000);
    expect(pnl.flutterwaveNgn).toBe(fees.flutterwaveNgn);
    expect(pnl.accessNgn).toBe(fees.accessNgn);
    // Released liability covers the reward face value, so fulfilment add-on is zero.
    expect(pnl.netProfitNgn).toBe(235_000 - fees.totalNgn);
    expect(pnl.avgOrderNgn).toBe(450_000);
  });

  it('accrues loyalty points as a cost when they are earned', () => {
    const withPoints = buildProfitAndLoss(
      orders,
      { accruedNgn: 0, paidNgn: 0 },
      { costNgn: 0, releasedNgn: 0 },
      { accruedNgn: 12_500, pointsAwarded: 5_000 }
    );
    const fees = processingCostNgn({ chargedNgn: orders.chargedNgn, cogsNgn: 640_000, orderCount: orders.orderCount });
    expect(withPoints.loyaltyAccruedNgn).toBe(12_500);
    expect(withPoints.netProfitNgn).toBe(260_000 - 12_500 - fees.totalNgn);
  });

  it('only expenses reward fulfilment above the points already accrued', () => {
    const rich = buildProfitAndLoss(
      orders,
      { accruedNgn: 0, paidNgn: 0 },
      { costNgn: 10_000, releasedNgn: 4_000 },
      emptyLoyalty
    );
    const fees = processingCostNgn({ chargedNgn: orders.chargedNgn, cogsNgn: 640_000, orderCount: orders.orderCount });
    expect(rich.netProfitNgn).toBe(260_000 - 6_000 - fees.totalNgn);
  });

  it('leaves a direct Access Bank transfer out of the Flutterwave fee', () => {
    const transfer = buildProfitAndLoss(
      {
        ...orders,
        chargedNgn: 50_000,
        bankChargedNgn: 50_000,
        bankOrderCount: 1,
        orderCount: 1,
        grossSalesNgn: 50_000,
        loyaltyDiscountNgn: 0,
        giftCardDiscountNgn: 0,
        refundedNgn: 0,
        supplierCostNgn: 0,
        estimatedCostNgn: 0,
      },
      { accruedNgn: 0, paidNgn: 0 },
      { costNgn: 0, releasedNgn: 0 },
      emptyLoyalty
    );
    expect(transfer.flutterwaveNgn).toBe(0);
    expect(transfer.netRevenueNgn).toBe(50_000);
  });

  it('keeps a gap when the charged amount is not explained by the discounts', () => {
    const odd = buildProfitAndLoss(
      { ...orders, chargedNgn: 900_000 },
      { accruedNgn: 0, paidNgn: 0 },
      { costNgn: 0, releasedNgn: 0 },
      emptyLoyalty
    );
    expect(odd.otherAdjustmentsNgn).toBe(-30_000);
  });
});

describe('buildBalanceSheet', () => {
  const sheet = buildBalanceSheet({
    cashCollectedNgn: 2_000_000,
    commissionsPaidLifetimeNgn: 100_000,
    inventoryNgn: 400_000,
    costedUnits: 20,
    uncostedUnits: 3,
    receivablesNgn: 50_000,
    receivableOrders: 1,
    commissionsPayableNgn: 80_000,
    giftCardsNgn: 25_000,
    giftCardCount: 2,
    rewardsOutstandingNgn: 5_000,
    rewardsOutstandingCount: 1,
    loyaltyPointsLiabilityNgn: 12_500,
    loyaltyPointsOutstanding: 5_000,
    loyaltyMemberCount: 4,
    supplierCostLifetimeNgn: 1_200_000,
    rewardsLifetimeNgn: 15_000,
  });

  it('retains cash after payouts and balances assets against liabilities', () => {
    expect(sheet.cashRetainedNgn).toBe(1_900_000);
    expect(sheet.assetsNgn).toBe(2_350_000);
    expect(sheet.liabilitiesNgn).toBe(122_500);
    expect(sheet.equityNgn).toBe(2_227_500);
  });

  it('states lifetime profit after supplier cost, commissions, rewards and open points', () => {
    expect(sheet.lifetimeNetProfitNgn).toBe(2_000_000 - 1_200_000 - 180_000 - 15_000 - 12_500);
  });
});

describe('buildTrend', () => {
  it('fills quiet buckets and nets profit after accrued commission', () => {
    const points = buildTrend(
      [
        { key: '2026-09-01', label: '1 Sep' },
        { key: '2026-09-02', label: '2 Sep' },
      ],
      [{ key: '2026-09-01', orderCount: 1, netRevenueNgn: 100, cogsNgn: 40, refundedNgn: 0 }],
      [{ key: '2026-09-01', accruedNgn: 10, paidNgn: 0 }]
    );
    const fees = processingCostNgn({ chargedNgn: 100, cogsNgn: 40, orderCount: 1 });
    expect(points[0].grossProfitNgn).toBe(60);
    expect(points[0].netProfitNgn).toBe(50 - fees.totalNgn);
    expect(points[1].orderCount).toBe(0);
  });
});

describe('period helpers', () => {
  const now = new Date('2026-09-15T12:00:00+01:00');

  it('builds rolling and calendar windows', () => {
    expect(periodRange('mtd', now).label).toBe('This month');
    expect(comparisonRange('all', now)).toBeNull();
  });

  it('starts a week bucket on Monday in Lagos', () => {
    expect(bucketStart('week', '2026-09-16T10:00:00+01:00')).toBe('2026-09-14');
  });

  it('caps a long chart window', () => {
    const { buckets, capped } = chartBuckets('day', '2026-01-01T00:00:00+01:00', '2026-03-01T00:00:00+01:00');
    expect(capped).toBe(true);
    expect(buckets.length).toBeLessThanOrEqual(32);
  });

  it('trims quiet lead buckets', () => {
    const trimmed = trimQuietLead([
      {
        key: 'a',
        label: 'a',
        orderCount: 0,
        netRevenueNgn: 0,
        cogsNgn: 0,
        refundedNgn: 0,
        grossProfitNgn: 0,
        commissionsAccruedNgn: 0,
        commissionsPaidNgn: 0,
        netProfitNgn: 0,
      },
      {
        key: 'b',
        label: 'b',
        orderCount: 1,
        netRevenueNgn: 10,
        cogsNgn: 0,
        refundedNgn: 0,
        grossProfitNgn: 10,
        commissionsAccruedNgn: 0,
        commissionsPaidNgn: 0,
        netProfitNgn: 10,
      },
    ]);
    expect(trimmed).toHaveLength(1);
    expect(trimmed[0].key).toBe('b');
  });
});
