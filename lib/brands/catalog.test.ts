import { describe, expect, it } from 'vitest';
import { BRANDS, brandSlug, brandStats, getBrand } from './catalog';
import { BRAND_INFO } from '@/lib/drinks/brand-guide';
import { DRINKS } from '@/lib/drinks/catalog';

describe('brandSlug', () => {
  it('makes a URL-safe slug from a house name', () => {
    expect(brandSlug('Hennessy')).toBe('hennessy');
    expect(brandSlug('Johnnie Walker')).toBe('johnnie-walker');
    expect(brandSlug("Jack Daniel's")).toBe('jack-daniels');
    expect(brandSlug('The Famous Grouse')).toBe('the-famous-grouse');
  });

  it('spells out the ampersand rather than dropping it', () => {
    expect(brandSlug('Moët & Chandon')).toContain('and');
  });
});

describe('brand pages', () => {
  it('gives every brand a unique, resolvable slug', () => {
    const seen = new Set<string>();
    for (const brand of BRANDS) {
      expect(seen.has(brand.slug)).toBe(false);
      seen.add(brand.slug);
      expect(getBrand(brand.slug)).toBe(brand);
    }
    expect(getBrand('not-a-brand')).toBeUndefined();
  });

  it('only builds a page for a house we have written up', () => {
    for (const brand of BRANDS) {
      expect(BRAND_INFO[brand.name]).toBeDefined();
      expect(brand.info.history || brand.info.style).toBeTruthy();
    }
  });

  it('lists only real, sellable bottles from that house, cheapest first', () => {
    for (const brand of BRANDS) {
      expect(brand.products.length).toBeGreaterThan(0);
      for (const product of brand.products) {
        expect(product.brand).toBe(brand.name);
        expect(product.sample).toBeFalsy();
        expect(product.partyPack).toBeFalsy();
      }
      for (let i = 1; i < brand.products.length; i++) {
        expect(brand.products[i - 1].priceNgn).toBeLessThanOrEqual(brand.products[i].priceNgn);
      }
    }
  });

  it('never loses a stocked bottle from a written-up house', () => {
    const claimed = new Set(BRANDS.flatMap((b) => b.products.map((p) => p.slug)));
    const expected = DRINKS.filter(
      (d) => d.brand && BRAND_INFO[d.brand] && !d.sample && !d.partyPack
    );
    for (const product of expected) expect(claimed.has(product.slug)).toBe(true);
  });

  it('attaches trivia rounds to the house they are about', () => {
    for (const brand of BRANDS) {
      for (const round of brand.rounds) expect(round.brand).toBe(brand.name);
    }
  });
});

describe('brandStats', () => {
  it('counts what it reports, and reports the follower count it is given', () => {
    const brand = getBrand('hennessy')!;
    const stats = brandStats(brand, 42);
    const byLabel = new Map(stats.map((s) => [s.label, s.value]));
    expect(byLabel.get('Bottles stocked')).toBe(String(brand.products.length));
    expect(byLabel.get('Followers')).toBe('42');
  });

  it('derives years of heritage from the founding year', () => {
    const brand = getBrand('hennessy')!;
    const years = brandStats(brand, 0).find((s) => s.label === 'Years of heritage');
    expect(Number(years?.value)).toBe(new Date().getFullYear() - Number(brand.info.founded));
  });

  it('omits the trivia stat for a house with no rounds', () => {
    const noRounds = BRANDS.find((b) => b.rounds.length === 0);
    if (!noRounds) return;
    expect(brandStats(noRounds, 0).some((s) => s.label === 'Trivia rounds')).toBe(false);
  });
});
