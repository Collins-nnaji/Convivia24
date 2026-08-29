import { describe, expect, it } from 'vitest';
import { categoryAffinity, drinkSignature, recommendDrinks } from './recommend';
import { EMPTY_TASTE_PROFILE, type TasteProfile } from '@/lib/trivia/taste';
import { getDrinkBySlug } from './catalog';

const cognacDrinker: TasteProfile = {
  spirits: ['cognac'],
  flavours: ['rich', 'oak'],
  occasions: ['evening'],
  priceBand: '70-150',
};

describe('drinkSignature', () => {
  it('reads the spirit off the product category', () => {
    expect(drinkSignature(getDrinkBySlug('hennessy-vsop')!).spirits).toContain('cognac');
    expect(drinkSignature(getDrinkBySlug('moet-imperial')!).spirits).toContain('champagne');
  });

  it('picks tequila and vodka out of the name, which the category does not carry', () => {
    expect(drinkSignature(getDrinkBySlug('don-julio-1942')!).spirits).toContain('tequila');
    expect(drinkSignature(getDrinkBySlug('absolut-vodka')!).spirits).toContain('vodka');
  });

  it('carries the real price so the band can be scored', () => {
    const product = getDrinkBySlug('hennessy-vsop')!;
    expect(drinkSignature(product).priceNgn).toBe(product.priceNgn);
  });
});

describe('recommendDrinks', () => {
  it('recommends nothing without a profile — no fake personalisation', () => {
    expect(recommendDrinks(null)).toEqual([]);
    expect(recommendDrinks(EMPTY_TASTE_PROFILE)).toEqual([]);
  });

  it('returns matches in descending order, capped at the limit', () => {
    const results = recommendDrinks(cognacDrinker, 4);
    expect(results).toHaveLength(4);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].match).toBeGreaterThanOrEqual(results[i].match);
    }
  });

  it('leads a cognac drinker with cognac', () => {
    expect(recommendDrinks(cognacDrinker, 3)[0].product.category).toBe('cognac');
  });

  it('never recommends samples or party packs', () => {
    for (const { product } of recommendDrinks(cognacDrinker, 12)) {
      expect(product.sample).toBeFalsy();
      expect(product.partyPack).toBeFalsy();
    }
  });
});

describe('categoryAffinity', () => {
  it('is empty without a profile', () => {
    expect(categoryAffinity(null)).toEqual([]);
  });

  it('ranks the drinker’s own spirit at the top', () => {
    const [best] = categoryAffinity(cognacDrinker);
    expect(best.category).toBe('cognac');
    expect(best.match).toBeGreaterThan(55);
  });
});
