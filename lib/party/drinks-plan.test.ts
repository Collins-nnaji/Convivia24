import { describe, expect, it } from 'vitest';
import {
  BUDGET_TOLERANCE_NGN,
  budgetBand,
  recommendDrinks,
} from '@/lib/party/drinks-plan';

describe('budgetBand', () => {
  it('is ±20k around the target', () => {
    expect(budgetBand(200_000)).toEqual({
      targetNgn: 200_000,
      minNgn: 200_000 - BUDGET_TOLERANCE_NGN,
      maxNgn: 200_000 + BUDGET_TOLERANCE_NGN,
    });
  });

  it('does not go below zero on the floor', () => {
    expect(budgetBand(10_000).minNgn).toBe(0);
  });
});

describe('recommendDrinks budget range', () => {
  it('lands the basket inside ±20k of the chosen budget', () => {
    const target = 200_000;
    const plan = recommendDrinks({
      guests: 20,
      hours: 5,
      vibe: 'balanced',
      budgetNgn: target,
    });
    const band = budgetBand(target);
    expect(plan.budget?.withinRange).toBe(true);
    expect(plan.totalNgn).toBeGreaterThanOrEqual(band.minNgn);
    expect(plan.totalNgn).toBeLessThanOrEqual(band.maxNgn);
  });

  it('fills upward when the uncapped list would underspend', () => {
    const target = 500_000;
    const plan = recommendDrinks({
      guests: 8,
      hours: 3,
      vibe: 'balanced',
      budgetNgn: target,
    });
    expect(plan.totalNgn).toBeGreaterThanOrEqual(budgetBand(target).minNgn);
    expect(plan.totalNgn).toBeLessThanOrEqual(budgetBand(target).maxNgn);
  });

  it('trims or swaps when the uncapped list would overspend', () => {
    const target = 80_000;
    const plan = recommendDrinks({
      guests: 40,
      hours: 6,
      vibe: 'nightlife',
      budgetNgn: target,
    });
    expect(plan.totalNgn).toBeLessThanOrEqual(budgetBand(target).maxNgn);
  });

  it('picks priced lines (not empty) when a budget is set', () => {
    const plan = recommendDrinks({
      guests: 15,
      hours: 5,
      vibe: 'dining',
      budgetNgn: 180_000,
    });
    expect(plan.lines.length).toBeGreaterThan(0);
    expect(plan.lines.every((l) => l.priceNgn > 0 && l.qty > 0)).toBe(true);
  });
});
