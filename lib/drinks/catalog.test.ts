import { describe, expect, it } from 'vitest';
import {
  CATEGORIES,
  DRINKS,
  formatNgn,
  galleryFor,
  getDrinkBySlug,
  preferTrackForCategory,
  relatedDrinks,
  searchDrinks,
  sizeOptionsFor,
} from './catalog';

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

  it('maps every shop category onto an allowed order prefer_track', () => {
    const allowed = new Set(['spirit', 'zero', 'mixed']);
    for (const category of CATEGORIES) {
      expect(allowed.has(preferTrackForCategory(category))).toBe(true);
    }
    expect(preferTrackForCategory('cocktails')).toBe('mixed');
    expect(preferTrackForCategory('mixers')).toBe('zero');
    expect(preferTrackForCategory('whisky')).toBe('spirit');
  });

  it('includes the ₦500 Convivia Cocktail sample for payment tests', () => {
    const sample = getDrinkBySlug('convivia-cocktail');
    expect(sample?.name).toBe('Convivia Cocktail');
    expect(sample?.priceNgn).toBe(500);
    expect(sample?.sample).toBe(true);
  });

  it('searchDrinks matches by name case-insensitively', () => {
    const target = DRINKS[0];
    const term = target.name.slice(0, 4).toLowerCase();
    const results = searchDrinks(term);
    expect(results.some((d) => d.slug === target.slug)).toBe(true);
  });
});

describe('product detail helpers', () => {
  const hennessyVsop = getDrinkBySlug('hennessy-vsop')!;

  it('builds a gallery from the images a product genuinely has, main shot first', () => {
    expect(galleryFor(hennessyVsop)).toEqual([hennessyVsop.image]);

    const pack = getDrinkBySlug('party-pack-20')!;
    const gallery = galleryFor(pack);
    expect(gallery.length).toBeGreaterThan(1);
    expect(new Set(gallery).size).toBe(gallery.length);
  });

  it('always offers the current size, and only ever real SKUs', () => {
    const sizes = sizeOptionsFor(hennessyVsop);
    expect(sizes.some((s) => s.slug === hennessyVsop.slug)).toBe(true);
    for (const size of sizes) {
      expect(getDrinkBySlug(size.slug)).toBeDefined();
      expect(size.volume).toBe(getDrinkBySlug(size.slug)!.volume);
    }
  });

  it('does not treat different bottles from one house as sizes of each other', () => {
    const slugs = sizeOptionsFor(hennessyVsop).map((s) => s.slug);
    expect(slugs).not.toContain('hennessy-vs');
    expect(slugs).not.toContain('hennessy-xo');
  });

  it('recommends other bottles — never the one being viewed, packs, or samples', () => {
    for (const product of DRINKS) {
      for (const related of relatedDrinks(product, 3)) {
        expect(related.slug).not.toBe(product.slug);
        expect(related.partyPack).toBeFalsy();
        expect(related.sample).toBeFalsy();
      }
    }
  });

  it('leads recommendations with the same house when it has other bottles', () => {
    const [first] = relatedDrinks(hennessyVsop, 3);
    expect(first.brand).toBe('Hennessy');
  });
});
