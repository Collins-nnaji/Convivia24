import { describe, expect, it } from 'vitest';
import {
  EMPTY_FILTERS,
  appliedChips,
  filtersFromParams,
  paramsFromFilters,
  searchCatalog,
  sizeBucket,
  type FacetProduct,
  type FilterState,
} from './facets';

const base = { tagline: '', description: '', abv: 40, volume: '70CL' };
const P: FacetProduct[] = [
  { ...base, slug: 'hen-vs', name: 'Hennessy VS', brand: 'Hennessy', origin: 'France', category: 'cognac', priceNgn: 78_000 },
  { ...base, slug: 'hen-vsop', name: 'Hennessy VSOP', brand: 'Hennessy', origin: 'France', category: 'cognac', priceNgn: 120_000, compareAtNgn: 140_000 },
  { ...base, slug: 'jw-black', name: 'Johnnie Walker Black', brand: 'Johnnie Walker', origin: 'Scotland', category: 'whisky', priceNgn: 52_000, rating: 4.6 },
  { ...base, slug: 'jameson', name: 'Jameson', brand: 'Jameson', origin: 'Ireland', category: 'whisky', priceNgn: 42_000, available: 0 },
  { ...base, slug: 'tonic', name: 'Schweppes Tonic', brand: 'Schweppes', category: 'mixers', priceNgn: 1_500, abv: 0, volume: '33CL × 12', badge: 'staff-pick' },
];

const f = (patch: Partial<FilterState>): FilterState => ({ ...EMPTY_FILTERS, ...patch });

describe('searchCatalog', () => {
  it('ORs within a group and ANDs across groups', () => {
    const r = searchCatalog(P, f({ type: ['cognac', 'whisky'], price: ['50-100'] }));
    expect(r.items.map((p) => p.slug).sort()).toEqual(['hen-vs', 'jw-black']);
  });

  it('keeps sibling counts when an option in the same group is ticked', () => {
    const r = searchCatalog(P, f({ type: ['whisky'] }));
    const type = r.groups.find((g) => g.key === 'type')!;
    expect(type.options.find((o) => o.value === 'cognac')?.count).toBe(2);
    // Other groups are narrowed by the type selection.
    const brand = r.groups.find((g) => g.key === 'brand')!;
    expect(brand.options.map((o) => o.value)).toEqual(['Jameson', 'Johnnie Walker']);
  });

  it('treats a higher compare-at price as on offer and sorts by saving', () => {
    const r = searchCatalog(P, f({ offer: ['on-offer'], sort: 'saving' }));
    expect(r.items.map((p) => p.slug)).toEqual(['hen-vsop']);
  });

  it('filters in-stock, staff picks and rating', () => {
    expect(searchCatalog(P, f({ offer: ['in-stock'] })).items.some((p) => p.slug === 'jameson')).toBe(false);
    expect(searchCatalog(P, f({ offer: ['staff-pick'] })).items.map((p) => p.slug)).toEqual(['tonic']);
    expect(searchCatalog(P, f({ rating: 4 })).items.map((p) => p.slug)).toEqual(['jw-black']);
  });

  it('matches every search word', () => {
    expect(searchCatalog(P, f({ q: 'hennessy vsop' })).items.map((p) => p.slug)).toEqual(['hen-vsop']);
    expect(searchCatalog(P, f({ q: 'scotland' })).items.map((p) => p.slug)).toEqual(['jw-black']);
  });

  it('ranks best sellers from order data', () => {
    const r = searchCatalog(P, f({ sort: 'best-selling' }), { bestSellers: ['jameson', 'hen-vs'] });
    expect(r.items.slice(0, 2).map((p) => p.slug)).toEqual(['jameson', 'hen-vs']);
  });

  it('paginates and clamps the page', () => {
    const r = searchCatalog(P, f({ per: 2, page: 9 }));
    expect(r.pages).toBe(3);
    expect(r.page).toBe(3);
    expect(r.items).toHaveLength(1);
  });

  it('puts out-of-stock bottles last in Recommended', () => {
    const r = searchCatalog(P, f({}));
    expect(r.items.at(-1)?.slug).toBe('jameson');
  });
});

describe('url state', () => {
  it('round-trips filters and accepts the legacy category param', () => {
    const state = filtersFromParams(new URLSearchParams('category=whisky&brand=Jameson,Hennessy&sort=price-asc&page=2'));
    expect(state.type).toEqual(['whisky']);
    expect(state.brand).toEqual(['Jameson', 'Hennessy']);
    expect(paramsFromFilters(state)).toBe('type=whisky&brand=Jameson%2CHennessy&sort=price-asc&page=2');
  });

  it('ignores unknown sorts and page sizes', () => {
    const state = filtersFromParams(new URLSearchParams('sort=bogus&per=7'));
    expect(state.sort).toBe('recommended');
    expect(state.per).toBe(24);
  });

  it('labels applied chips', () => {
    expect(appliedChips(f({ type: ['whisky'], price: ['u25'], rating: 4 })).map((c) => c.label)).toEqual([
      'Whisky',
      'Under ₦25,000',
      '4★ & up',
    ]);
  });
});

describe('sizeBucket', () => {
  it('groups packs and normalises sizes', () => {
    expect(sizeBucket('33CL × 12')).toBe('Packs');
    expect(sizeBucket('70cl')).toBe('70CL');
    expect(sizeBucket('4 bottles')).toBe('Packs');
    expect(sizeBucket('—')).toBe('Other');
  });
});
