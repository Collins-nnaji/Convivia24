import { describe, expect, it } from 'vitest';
import {
  EMPTY_TASTE_PROFILE,
  hasTasteProfile,
  matchScore,
  overallMatch,
  preferenceBreakdown,
  sanitizeProfile,
  tasteHighlights,
  tastePersonality,
  type TasteProfile,
} from './taste';
import { TRIVIA_ROUNDS } from './catalog';

const cognacDrinker: TasteProfile = {
  spirits: ['cognac'],
  flavours: ['smooth', 'rich'],
  occasions: ['evening'],
  priceBand: '70-150',
};

describe('taste profiles', () => {
  it('treats a profile with no spirits as unbuilt', () => {
    expect(hasTasteProfile(EMPTY_TASTE_PROFILE)).toBe(false);
    expect(hasTasteProfile(null)).toBe(false);
    expect(hasTasteProfile(cognacDrinker)).toBe(true);
  });

  it('scores nothing without a profile — no fake personalisation', () => {
    const hennessy = TRIVIA_ROUNDS.find((r) => r.slug === 'hennessy')!;
    expect(matchScore(null, hennessy.taste)).toBe(0);
    expect(matchScore(EMPTY_TASTE_PROFILE, hennessy.taste)).toBe(0);
  });

  it('ranks the house that matches the profile above one that does not', () => {
    const hennessy = TRIVIA_ROUNDS.find((r) => r.slug === 'hennessy')!;
    const moet = TRIVIA_ROUNDS.find((r) => r.slug === 'moet-chandon')!;
    expect(matchScore(cognacDrinker, hennessy.taste)).toBeGreaterThan(
      matchScore(cognacDrinker, moet.taste)
    );
  });

  it('keeps every score inside the 55–100 band it advertises', () => {
    for (const round of TRIVIA_ROUNDS) {
      const score = matchScore(cognacDrinker, round.taste);
      expect(score).toBeGreaterThanOrEqual(55);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  it('summarises the overall match across the rounds on offer', () => {
    const overall = overallMatch(cognacDrinker, TRIVIA_ROUNDS.map((r) => r.taste));
    expect(overall).toBeGreaterThanOrEqual(55);
    expect(overall).toBeLessThanOrEqual(100);
    expect(overallMatch(null, TRIVIA_ROUNDS.map((r) => r.taste))).toBe(0);
  });

  it('leads the highlight chips with flavours, then spirits, then occasions', () => {
    expect(tasteHighlights(cognacDrinker)).toEqual(['Smooth', 'Rich', 'Cognac', 'Evening Drinks']);
  });
});

describe('sanitizeProfile', () => {
  it('drops values that are not in the catalog', () => {
    const dirty = sanitizeProfile({
      spirits: ['cognac', 'moonshine', 42],
      flavours: ['smoky'],
      occasions: ['nowhere'],
      priceBand: 'free',
    });
    expect(dirty).toEqual({
      spirits: ['cognac'],
      flavours: ['smoky'],
      occasions: [],
      priceBand: null,
    });
  });

  it('survives junk input', () => {
    expect(sanitizeProfile(null)).toEqual(EMPTY_TASTE_PROFILE);
    expect(sanitizeProfile('nope')).toEqual(EMPTY_TASTE_PROFILE);
  });

  it('caps each axis so a crafted payload cannot bloat a row', () => {
    const many = sanitizeProfile({
      spirits: ['cognac', 'whisky', 'champagne', 'vodka', 'tequila', 'wines', 'cognac', 'whisky'],
    });
    expect(many.spirits.length).toBeLessThanOrEqual(6);
  });
});

describe('taste personality', () => {
  it('has nothing to say without a profile', () => {
    expect(tastePersonality(null)).toBeNull();
    expect(tastePersonality(EMPTY_TASTE_PROFILE)).toBeNull();
    expect(preferenceBreakdown(null)).toEqual([]);
  });

  it('names a premium, broad drinker the Sophisticated Explorer', () => {
    const p = tastePersonality({
      spirits: ['cognac', 'whisky', 'champagne'],
      flavours: ['rich', 'oak'],
      occasions: ['celebrations'],
      priceBand: '70-150',
    });
    expect(p?.name).toBe('The Sophisticated Explorer');
    expect(p?.traits).toContain('Quality seeker');
  });

  it('reads a value-minded, single-spirit drinker differently', () => {
    const p = tastePersonality({
      spirits: ['whisky'],
      flavours: ['smoky'],
      occasions: ['solo'],
      priceBand: 'under-30',
    });
    expect(p?.name).not.toBe('The Sophisticated Explorer');
    expect(p?.traits).toContain('Value minded');
    expect(p?.traits).toContain('Loyal');
  });

  it('scores a decisive answer higher than a scattered one', () => {
    const decisive = preferenceBreakdown({
      spirits: ['cognac'],
      flavours: ['rich'],
      occasions: ['evening'],
      priceBand: '30-70',
    });
    const scattered = preferenceBreakdown({
      spirits: ['cognac', 'whisky', 'vodka'],
      flavours: ['rich', 'smoky', 'sweet'],
      occasions: ['evening', 'dinner'],
      priceBand: '30-70',
    });
    expect(decisive[0].strength).toBeGreaterThan(scattered[0].strength);
    for (const row of [...decisive, ...scattered]) {
      expect(row.strength).toBeGreaterThanOrEqual(0);
      expect(row.strength).toBeLessThanOrEqual(100);
    }
  });

  it('reports the price band it was given, not a guess', () => {
    const rows = preferenceBreakdown(cognacDrinker);
    const price = rows.find((r) => r.label === 'Price range')!;
    expect(price.value).toBe('₦70,000 – ₦150,000');
  });
});
