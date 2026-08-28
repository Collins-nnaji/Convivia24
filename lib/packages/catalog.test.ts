import { describe, expect, it } from 'vitest';
import { getDrinkBySlug } from '@/lib/drinks/catalog';
import {
  EVENT_PACKAGES,
  OCCASION_LABELS,
  bottleCount,
  componentsTotalNgn,
  getPackageBySlug,
  packageForGuests,
  resolveComponents,
  savingsNgn,
  savingsPct,
  spendPerGuestNgn,
} from './catalog';

describe('event packages', () => {
  it('has unique slugs', () => {
    const slugs = EVENT_PACKAGES.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('does not collide with a shop product slug', () => {
    for (const pkg of EVENT_PACKAGES) {
      expect(getDrinkBySlug(pkg.slug), `${pkg.slug} collides with a DRINKS slug`).toBeUndefined();
    }
  });

  it.each(EVENT_PACKAGES.map((p) => [p.slug, p] as const))('%s resolves every component', (_slug, pkg) => {
    for (const c of pkg.components) {
      expect(getDrinkBySlug(c.slug), `${pkg.slug} references unknown slug ${c.slug}`).toBeDefined();
    }
    expect(resolveComponents(pkg)).toHaveLength(pkg.components.length);
  });

  it.each(EVENT_PACKAGES.map((p) => [p.slug, p] as const))('%s is cheaper than its parts', (_slug, pkg) => {
    const full = componentsTotalNgn(pkg);
    expect(full).toBeGreaterThan(0);
    expect(pkg.priceNgn).toBeLessThan(full);
    // A saving worth advertising, but not one that implies we are selling at a loss.
    expect(savingsPct(pkg)).toBeGreaterThanOrEqual(5);
    expect(savingsPct(pkg)).toBeLessThanOrEqual(20);
  });

  it.each(EVENT_PACKAGES.map((p) => [p.slug, p] as const))('%s has sane metadata', (_slug, pkg) => {
    expect(pkg.guests).toBeGreaterThan(0);
    expect(pkg.components.length).toBeGreaterThan(0);
    expect(pkg.components.every((c) => c.qty > 0)).toBe(true);
    expect(OCCASION_LABELS[pkg.occasion]).toBeTruthy();
    expect(pkg.name).toMatch(/^CONVIVIA24 /);
    expect(spendPerGuestNgn(pkg)).toBeGreaterThan(0);
    expect(bottleCount(pkg)).toBeGreaterThanOrEqual(pkg.components.length);
  });

  it('offers exactly three packages in every section', () => {
    const occasions = [...new Set(EVENT_PACKAGES.map((p) => p.occasion))];
    expect(occasions).toHaveLength(Object.keys(OCCASION_LABELS).length);
    for (const occasion of occasions) {
      const tier = EVENT_PACKAGES.filter((p) => p.occasion === occasion);
      expect(tier, `${occasion} has ${tier.length} packages`).toHaveLength(3);
      // Three distinct sizes, ascending, so the section reads as small / mid / large.
      const guests = tier.map((p) => p.guests);
      expect(new Set(guests).size).toBe(3);
      expect([...guests].sort((a, b) => a - b)).toEqual(guests);
      const prices = tier.map((p) => p.priceNgn);
      expect([...prices].sort((a, b) => a - b)).toEqual(prices);
    }
  });

  it('prices are derived from the components, rounded to the nearest thousand', () => {
    for (const pkg of EVENT_PACKAGES) {
      expect(pkg.priceNgn % 1000, `${pkg.slug} is not a round figure`).toBe(0);
      expect(pkg.priceNgn).toBeGreaterThan(0);
    }
  });

  it('savings and totals agree', () => {
    for (const pkg of EVENT_PACKAGES) {
      expect(savingsNgn(pkg)).toBe(componentsTotalNgn(pkg) - pkg.priceNgn);
    }
  });

  it('low-abv package contains nothing above 6% ABV', () => {
    const pkg = getPackageBySlug('convivia24-low-abv-60');
    expect(pkg).toBeDefined();
    for (const c of resolveComponents(pkg!)) {
      expect(c.product.abv, `${c.slug} is ${c.product.abv}% ABV`).toBeLessThanOrEqual(6);
    }
  });

  it('party tiers rise in both guests and price', () => {
    const tiers = EVENT_PACKAGES.filter((p) => p.occasion === 'party');
    for (let i = 1; i < tiers.length; i++) {
      expect(tiers[i].guests).toBeGreaterThan(tiers[i - 1].guests);
      expect(tiers[i].priceNgn).toBeGreaterThan(tiers[i - 1].priceNgn);
    }
  });
});

describe('packageForGuests', () => {
  it('returns nothing for small gatherings', () => {
    expect(packageForGuests(8)).toBeNull();
    expect(packageForGuests(29)).toBeNull();
  });

  it('never under-supplies while a larger tier exists', () => {
    const largest = Math.max(
      ...EVENT_PACKAGES.filter((p) => p.occasion === 'party').map((p) => p.guests)
    );
    for (const guests of [30, 50, 75, 100, 150, 200, 400]) {
      const pkg = packageForGuests(guests);
      expect(pkg).not.toBeNull();
      if (guests <= largest) expect(pkg!.guests).toBeGreaterThanOrEqual(guests);
      else expect(pkg!.guests).toBe(largest);
    }
  });

  it('picks the smallest tier that covers the headcount', () => {
    expect(packageForGuests(30)?.slug).toBe('convivia24-party-50');
    expect(packageForGuests(50)?.slug).toBe('convivia24-party-50');
    expect(packageForGuests(51)?.slug).toBe('convivia24-party-100');
    expect(packageForGuests(99)?.slug).toBe('convivia24-party-100');
    expect(packageForGuests(100)?.slug).toBe('convivia24-party-100');
    expect(packageForGuests(101)?.slug).toBe('convivia24-party-200');
  });

  it('caps at the largest tier past its headcount', () => {
    expect(packageForGuests(500)?.slug).toBe('convivia24-party-200');
    expect(packageForGuests(5000)?.slug).toBe('convivia24-party-200');
  });

  it('prefers an occasion package when the occasion names one', () => {
    expect(packageForGuests(150, 'Wedding')?.slug).toBe('convivia24-wedding-150');
    expect(packageForGuests(80, 'corporate end-of-year')?.slug).toBe('convivia24-corporate-120');
    // An occasion we have no package for falls back to the headcount tier.
    expect(packageForGuests(100, 'club night')?.slug).toBe('convivia24-party-100');
    expect(packageForGuests(20, 'club night')).toBeNull();
  });

  it('ignores an occasion package that is the wrong size for the room', () => {
    // A 25-guest wedding after-party must not be pitched the 150-guest WEDDING package.
    expect(packageForGuests(25, 'Wedding after-party')?.occasion).not.toBe('wedding');
    expect(packageForGuests(30, 'Wedding after-party')?.slug).toBe('convivia24-party-50');
    // At a plausible headcount the occasion package wins again.
    expect(packageForGuests(150, 'Wedding after-party')?.slug).toBe('convivia24-wedding-150');
    expect(packageForGuests(100, 'Wedding after-party')?.slug).toBe('convivia24-wedding-150');
  });
});
