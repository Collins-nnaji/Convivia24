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

  it('does not count the auto-injected sample bottle', () => {
    // Every cart is seeded with this ₦500 sample; counting it would make the real minimum five.
    expect(bottleUnitsFor(SAMPLE_PAYMENT_SLUG, 1)).toBe(0);
    expect(bottleUnitsFor(SAMPLE_PAYMENT_SLUG, 10)).toBe(0);
  });

  it('counts an unknown slug at face value rather than dropping it', () => {
    // The order route rejects unknown SKUs separately; the count must not silently under-report.
    expect(bottleUnitsFor('not-a-real-sku', 6)).toBe(6);
  });
});

describe('the minimum', () => {
  it('rejects a cart under six bottles', () => {
    const cart = [{ slug: 'jameson-original', qty: 2 }, { slug: 'absolut-vodka', qty: 3 }];
    expect(orderBottleCount(cart)).toBe(5);
    expect(meetsMinimum(cart)).toBe(false);
    expect(bottlesShort(cart)).toBe(1);
    expect(minimumOrderError(cart)).toBe('Minimum order is 6 bottles. You have 5 — add 1 more.');
  });

  it('accepts a mixed cart that reaches six', () => {
    const cart = [{ slug: 'jameson-original', qty: 2 }, { slug: 'smirnoff-ice-pack', qty: 4 }];
    expect(meetsMinimum(cart)).toBe(true);
    expect(bottlesShort(cart)).toBe(0);
    expect(minimumOrderError(cart)).toBeNull();
  });

  it('accepts exactly six', () => {
    const cart = [{ slug: 'jameson-original', qty: MIN_ORDER_BOTTLES }];
    expect(meetsMinimum(cart)).toBe(true);
    expect(minimumOrderError(cart)).toBeNull();
  });

  it('lets any single package clear the minimum on its own', () => {
    for (const pkg of EVENT_PACKAGES) {
      const cart = [{ slug: pkg.slug, qty: 1 }];
      expect(meetsMinimum(cart), `${pkg.slug} should clear the minimum alone`).toBe(true);
    }
  });

  it('still needs six real bottles alongside the sample', () => {
    const withSample = [
      { slug: SAMPLE_PAYMENT_SLUG, qty: 1 },
      { slug: 'jameson-original', qty: 5 },
    ];
    expect(orderBottleCount(withSample)).toBe(5);
    expect(meetsMinimum(withSample)).toBe(false);
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
