import { describe, expect, it } from 'vitest';
import { LOYALTY_TIERS, nextTier, pointsFromSpend, shopDiscountPct, tierForPoints } from './program';

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

describe('pointsFromSpend', () => {
  it('awards 1 point per ₦100, rounded down', () => {
    expect(pointsFromSpend(10_000)).toBe(100);
    expect(pointsFromSpend(150)).toBe(1);
    expect(pointsFromSpend(99)).toBe(0);
  });

  it('never awards negative points', () => {
    expect(pointsFromSpend(0)).toBe(0);
  });
});
