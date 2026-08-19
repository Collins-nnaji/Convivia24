import { describe, expect, it } from 'vitest';
import { DRINKS, formatNgn, getDrinkBySlug, searchDrinks } from './catalog';

describe('formatNgn', () => {
  it('formats whole naira with the currency symbol and thousands separators', () => {
    expect(formatNgn(10_000)).toBe('₦10,000');
    expect(formatNgn(0)).toBe('₦0');
  });

  it('drops fractional kobo — the app only ever deals in whole naira', () => {
    expect(formatNgn(1234.9)).toBe('₦1,235');
  });
});

describe('catalog integrity', () => {
  it('every seeded drink has a positive price and a unique slug', () => {
    const seen = new Set<string>();
    for (const d of DRINKS) {
      expect(d.priceNgn).toBeGreaterThan(0);
      expect(seen.has(d.slug)).toBe(false);
      seen.add(d.slug);
    }
  });

  it('getDrinkBySlug finds a real product and misses a bogus one', () => {
    expect(getDrinkBySlug(DRINKS[0].slug)?.slug).toBe(DRINKS[0].slug);
    expect(getDrinkBySlug('not-a-real-product')).toBeUndefined();
  });

  it('searchDrinks matches by name case-insensitively', () => {
    const target = DRINKS[0];
    const term = target.name.slice(0, 4).toLowerCase();
    const results = searchDrinks(term);
    expect(results.some((d) => d.slug === target.slug)).toBe(true);
  });
});
