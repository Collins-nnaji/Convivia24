import { describe, expect, it } from 'vitest';
import { marginSummary, orderMargin } from './margin';

describe('orderMargin', () => {
  it('computes the spread on a sourced order', () => {
    const m = orderMargin({ totalNgn: 420000, supplierCostNgn: 350000 });
    expect(m.revenueNgn).toBe(420000);
    expect(m.costNgn).toBe(350000);
    expect(m.marginNgn).toBe(70000);
    expect(m.marginPct).toBe(16.7);
    expect(m.sourced).toBe(true);
  });

  it('subtracts delivery and commission as well', () => {
    const m = orderMargin({
      totalNgn: 800000,
      supplierCostNgn: 600000,
      deliveryCostNgn: 20000,
      commissionNgn: 20000,
    });
    expect(m.costNgn).toBe(640000);
    expect(m.marginNgn).toBe(160000);
    expect(m.marginPct).toBe(20);
  });

  it('treats an unsourced order as full margin but flags it', () => {
    const m = orderMargin({ totalNgn: 100000 });
    expect(m.sourced).toBe(false);
    expect(m.marginNgn).toBe(100000);

    const zero = orderMargin({ totalNgn: 100000, supplierCostNgn: 0 });
    expect(zero.sourced).toBe(true);
    expect(zero.marginNgn).toBe(100000);
  });

  it('takes refunds off revenue', () => {
    const m = orderMargin({ totalNgn: 500000, supplierCostNgn: 400000, refundedNgn: 500000 });
    expect(m.revenueNgn).toBe(0);
    expect(m.marginNgn).toBe(-400000);
    expect(m.marginPct).toBe(0);
  });

  it('reports a loss when the supplier cost exceeds the sale', () => {
    const m = orderMargin({ totalNgn: 100000, supplierCostNgn: 130000 });
    expect(m.marginNgn).toBe(-30000);
    expect(m.marginPct).toBe(-30);
  });

  it('ignores junk and negative inputs rather than producing NaN', () => {
    const m = orderMargin({ totalNgn: Number.NaN, supplierCostNgn: -5000 });
    expect(m.revenueNgn).toBe(0);
    expect(m.costNgn).toBe(0);
    expect(m.marginNgn).toBe(0);
    expect(m.marginPct).toBe(0);
    // -5000 is not a usable cost, but a value *was* supplied, so the order counts as sourced.
    expect(m.sourced).toBe(true);
  });
});

describe('marginSummary', () => {
  it('is all zeroes for no orders', () => {
    const s = marginSummary([]);
    expect(s.orders).toBe(0);
    expect(s.revenueNgn).toBe(0);
    expect(s.marginPct).toBe(0);
    expect(s.avgMarginNgn).toBe(0);
  });

  it('rolls up revenue, cost and margin', () => {
    const s = marginSummary([
      { totalNgn: 420000, supplierCostNgn: 350000 },
      { totalNgn: 800000, supplierCostNgn: 620000, commissionNgn: 20000 },
    ]);
    expect(s.orders).toBe(2);
    expect(s.sourcedOrders).toBe(2);
    expect(s.revenueNgn).toBe(1220000);
    expect(s.supplierCostNgn).toBe(970000);
    expect(s.commissionNgn).toBe(20000);
    expect(s.marginNgn).toBe(230000);
    expect(s.avgMarginNgn).toBe(115000);
  });

  it('keeps unsourced orders out of the average but not out of revenue', () => {
    const s = marginSummary([
      { totalNgn: 400000, supplierCostNgn: 300000 }, // margin 100k, sourced
      { totalNgn: 600000 }, // not yet sourced
    ]);
    expect(s.orders).toBe(2);
    expect(s.sourcedOrders).toBe(1);
    expect(s.revenueNgn).toBe(1000000);
    expect(s.avgMarginNgn).toBe(100000);
    // Total margin still includes the un-costed order, so the desk can see what is outstanding.
    expect(s.marginNgn).toBe(700000);
  });

  it('summary margin equals the sum of the individual margins', () => {
    const rows = [
      { totalNgn: 250000, supplierCostNgn: 200000 },
      { totalNgn: 90000, supplierCostNgn: 100000 },
      { totalNgn: 1000000, supplierCostNgn: 700000, deliveryCostNgn: 15000, refundedNgn: 100000 },
    ];
    const s = marginSummary(rows);
    const sum = rows.reduce((n, r) => n + orderMargin(r).marginNgn, 0);
    expect(s.marginNgn).toBe(sum);
  });
});
