import { describe, expect, it } from 'vitest';
import { SAMPLE_PAYMENT_SLUG } from '@/lib/drinks/catalog';
import { EVENT_PACKAGES, bottleCount } from '@/lib/packages/catalog';
import {
  MIN_ORDER_BOTTLES,
  bottleUnitsFor,
  bottlesShort,
  meetsMinimum,
  minimumOrderError,
  orderBottleCount,
} from './minimum-order';

describe('bottleUnitsFor', () => {
  it('counts an ordinary bottle as its quantity', () => {
    expect(bottleUnitsFor('jameson-original', 3)).toBe(3);
  });

  it('counts a package as all the bottles inside it', () => {
    const pkg = EVENT_PACKAGES[0];
    expect(bottleUnitsFor(pkg.slug, 1)).toBe(bottleCount(pkg));
    expect(bottleUnitsFor(pkg.slug, 2)).toBe(bottleCount(pkg) * 2);
  });

  it('treats junk quantities as nothing', () => {
    expect(bottleUnitsFor('jameson-original', 0)).toBe(0);
    expect(bottleUnitsFor('jameson-original', -4)).toBe(0);
    expect(bottleUnitsFor('jameson-original', Number.NaN)).toBe(0);
  });

  it('counts the Convivia Cocktail like any other bottle', () => {
    expect(bottleUnitsFor(SAMPLE_PAYMENT_SLUG, 1)).toBe(1);
    expect(bottleUnitsFor(SAMPLE_PAYMENT_SLUG, 3)).toBe(3);
  });

  it('counts an unknown slug at face value rather than dropping it', () => {
    expect(bottleUnitsFor('not-a-real-sku', 6)).toBe(6);
  });
});

describe('the minimum', () => {
  it('accepts a single bottle', () => {
    const cart = [{ slug: 'jameson-original', qty: 1 }];
    expect(orderBottleCount(cart)).toBe(1);
    expect(meetsMinimum(cart)).toBe(true);
    expect(bottlesShort(cart)).toBe(0);
    expect(minimumOrderError(cart)).toBeNull();
  });

  it('accepts any mixed cart with at least one bottle', () => {
    const cart = [{ slug: 'jameson-original', qty: 2 }, { slug: 'absolut-vodka', qty: 3 }];
    expect(meetsMinimum(cart)).toBe(true);
    expect(bottlesShort(cart)).toBe(0);
    expect(minimumOrderError(cart)).toBeNull();
  });

  it('lets any single package clear the minimum on its own', () => {
    for (const pkg of EVENT_PACKAGES) {
      const cart = [{ slug: pkg.slug, qty: 1 }];
      expect(meetsMinimum(cart), `${pkg.slug} should clear the minimum alone`).toBe(true);
    }
  });

  it('accepts a cart with only the Convivia Cocktail', () => {
    const cart = [{ slug: SAMPLE_PAYMENT_SLUG, qty: 1 }];
    expect(orderBottleCount(cart)).toBe(1);
    expect(meetsMinimum(cart)).toBe(true);
    expect(minimumOrderError(cart)).toBeNull();
  });

  it('treats an empty cart as empty, not as short', () => {
    expect(minimumOrderError([])).toBe('Your cart is empty.');
    expect(orderBottleCount([])).toBe(0);
  });

  it('survives malformed input without throwing', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(orderBottleCount(null as any)).toBe(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(orderBottleCount([{} as any])).toBe(0);
  });
});
