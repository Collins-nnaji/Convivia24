import { describe, expect, it } from 'vitest';
import { EVENT_PACKAGES } from '@/lib/packages/catalog';
import { derivedPackCost, isDerivedCostSku } from './pack-cost';

describe('derivedPackCost', () => {
  const pkg = EVENT_PACKAGES[0];

  it('treats event packages, and only them, as derived-cost SKUs', () => {
    expect(isDerivedCostSku(pkg.slug)).toBe(true);
    expect(isDerivedCostSku('hennessy-vs')).toBe(false);
  });

  it('sums bottle cost × quantity across the pack', () => {
    const cost = derivedPackCost(pkg.slug, () => 1000);
    const bottles = pkg.components.reduce((n, c) => n + c.qty, 0);
    expect(cost).toBe(bottles * 1000);
  });

  it('has no cost at all while any bottle is unpriced — a partial sum would look like a real quote', () => {
    const missing = pkg.components[0].slug;
    expect(derivedPackCost(pkg.slug, (s) => (s === missing ? null : 1000))).toBeNull();
  });

  it('is null for anything that is not a pack', () => {
    expect(derivedPackCost('hennessy-vs', () => 1000)).toBeNull();
  });
});
