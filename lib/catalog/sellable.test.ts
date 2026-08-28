import { describe, expect, it } from 'vitest';
import { DRINKS } from '@/lib/drinks/catalog';
import { EVENT_PACKAGES, bottleCount } from '@/lib/packages/catalog';
import { findSellable } from './sellable';

describe('findSellable', () => {
  it('resolves every shop bottle', () => {
    for (const d of DRINKS) {
      expect(findSellable(d.slug)?.slug, d.slug).toBe(d.slug);
    }
  });

  it('resolves every event package', () => {
    for (const pkg of EVENT_PACKAGES) {
      const product = findSellable(pkg.slug);
      expect(product, `${pkg.slug} did not resolve`).toBeDefined();
      expect(product!.name).toBe(pkg.name);
      expect(product!.priceNgn).toBe(pkg.priceNgn);
      expect(product!.category).toBe('party-packs');
    }
  });

  it('gives a package a usable pick list and serving hint', () => {
    const pkg = EVENT_PACKAGES[0];
    const product = findSellable(pkg.slug)!;
    expect(product.includes).toHaveLength(pkg.components.length);
    expect(product.servesHint).toContain(String(pkg.guests));
    expect(product.volume).toContain(String(bottleCount(pkg)));
    expect(product.partyPack).toBe(true);
  });

  it('reports a package ABV inside the range of its components', () => {
    for (const pkg of EVENT_PACKAGES) {
      const product = findSellable(pkg.slug)!;
      const abvs = pkg.components.map((c) => DRINKS.find((d) => d.slug === c.slug)!.abv);
      expect(product.abv).toBeGreaterThanOrEqual(Math.min(...abvs));
      expect(product.abv).toBeLessThanOrEqual(Math.max(...abvs));
    }
  });

  it('misses an unknown slug', () => {
    expect(findSellable('not-a-real-thing')).toBeUndefined();
    expect(findSellable('')).toBeUndefined();
  });
});
