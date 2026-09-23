import { describe, expect, it } from 'vitest';
import {
  NGN_PER_POINT,
  pointsFromLine,
  pointsFromOrderItems,
  pointsFromSpend,
  pointsLiabilityNgn,
  spendBandForPrice,
  LOYALTY_TIERS,
  nextTier,
  shopDiscountPct,
  tierForPoints,
} from './program';

describe('tierForPoints', () => {
  it('starts everyone at guest', () => {
    expect(tierForPoints(0).id).toBe('guest');
    expect(tierForPoints(2499).id).toBe('guest');
  });

  it('promotes exactly at each tier threshold', () => {
    expect(tierForPoints(2500).id).toBe('regular');
    expect(tierForPoints(8000).id).toBe('resident');
    expect(tierForPoints(20000).id).toBe('patron');
  });

  it('never returns a tier above the highest defined', () => {
    expect(tierForPoints(1_000_000).id).toBe('patron');
  });
});

describe('nextTier', () => {
  it('points at the next threshold up', () => {
    expect(nextTier(0)?.id).toBe('regular');
    expect(nextTier(2500)?.id).toBe('resident');
  });

  it('is null once at the top tier — nothing left to unlock', () => {
    expect(nextTier(20000)).toBeNull();
    expect(nextTier(999_999)).toBeNull();
  });
});

describe('shopDiscountPct', () => {
  it('matches the discount on record for each tier', () => {
    for (const tier of LOYALTY_TIERS) {
      expect(shopDiscountPct(tier.minPoints)).toBe(tier.shopDiscountPct);
    }
  });
});

describe('spend bands', () => {
  it('places bottles in the right band', () => {
    expect(spendBandForPrice(28_000).label).toBe('Entry');
    expect(spendBandForPrice(55_000).label).toBe('Core');
    expect(spendBandForPrice(125_000).label).toBe('Premium');
    expect(spendBandForPrice(450_000).label).toBe('Icon');
  });

  it('keeps liability under 3% of the line on every band', () => {
    for (const price of [20_000, 50_000, 120_000, 300_000]) {
      const pts = pointsFromLine(price, 1);
      const liability = pts * NGN_PER_POINT;
      expect(liability / price).toBeLessThanOrEqual(0.03);
    }
  });

  it('awards more points on a dearer bottle than a cheaper one of equal count', () => {
    expect(pointsFromLine(250_000, 1)).toBeGreaterThan(pointsFromLine(30_000, 1));
  });
});

describe('pointsFromOrderItems', () => {
  it('sums lines and scales down when a discount cuts the charge', () => {
    const items = [{ unitPriceNgn: 50_000, qty: 2 }];
    const full = pointsFromOrderItems(items);
    const discounted = pointsFromOrderItems(items, 80_000);
    expect(full).toBe(pointsFromLine(50_000, 2));
    expect(discounted).toBe(Math.floor(full * 0.8));
  });
});

describe('pointsFromSpend', () => {
  it('uses the Core-band fallback on a bare total', () => {
    expect(pointsFromSpend(10_000)).toBe(80);
    expect(pointsFromSpend(150)).toBe(1);
    expect(pointsFromSpend(99)).toBe(0);
  });

  it('never awards negative points', () => {
    expect(pointsFromSpend(0)).toBe(0);
  });
});

describe('pointsLiabilityNgn', () => {
  it('values a balance at the published rate', () => {
    expect(pointsLiabilityNgn(2_000)).toBe(5_000);
    expect(pointsLiabilityNgn(0)).toBe(0);
  });
});
