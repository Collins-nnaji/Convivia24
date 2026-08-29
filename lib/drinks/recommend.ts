import { CATEGORY_LABELS, DRINKS, type DrinkCategory, type DrinkProduct } from '@/lib/drinks/catalog';
import { matchScore, hasTasteProfile, type TasteProfile } from '@/lib/trivia/taste';
import { TASTE_NOTES } from '@/lib/drinks/brand-guide';

/**
 * Bottles matched against a taste profile.
 *
 * Each SKU's signature is read off the catalog — its category is the spirit,
 * its price sets the band — plus whatever flavour words appear in its written
 * taste note. Nothing here invents a characteristic the catalog does not state.
 */
const CATEGORY_TO_SPIRIT: Partial<Record<DrinkCategory, string>> = {
  cognac: 'cognac',
  whisky: 'whisky',
  champagne: 'champagne',
  wines: 'wines',
};

const FLAVOUR_WORDS: Record<string, string[]> = {
  smooth: ['smooth', 'soft', 'silky', 'gentle', 'easy', 'creamy', 'rounded'],
  rich: ['rich', 'dense', 'full', 'deep', 'layered'],
  smoky: ['smoky', 'smoke', 'peat', 'char'],
  sweet: ['sweet', 'honey', 'vanilla', 'caramel', 'toffee', 'fruit'],
  citrus: ['citrus', 'lemon', 'orange', 'zest', 'apple', 'bright', 'crisp'],
  oak: ['oak', 'cask', 'barrel', 'wood', 'sherry'],
};

const SPIRIT_KEYWORDS: Record<string, string[]> = {
  vodka: ['vodka'],
  tequila: ['tequila', 'agave', 'mezcal'],
};

export function drinkSignature(product: DrinkProduct) {
  const note = (TASTE_NOTES[product.slug] || product.description || '').toLowerCase();
  const name = `${product.name} ${product.tagline}`.toLowerCase();

  const spirits: string[] = [];
  const fromCategory = CATEGORY_TO_SPIRIT[product.category];
  if (fromCategory) spirits.push(fromCategory);
  for (const [spirit, words] of Object.entries(SPIRIT_KEYWORDS)) {
    if (words.some((w) => name.includes(w) || note.includes(w))) spirits.push(spirit);
  }

  const flavours = Object.entries(FLAVOUR_WORDS)
    .filter(([, words]) => words.some((w) => note.includes(w)))
    .map(([flavour]) => flavour);

  return { spirits, flavours, occasions: [] as string[], priceNgn: product.priceNgn };
}

export type Recommendation = { product: DrinkProduct; match: number };

export function recommendDrinks(profile: TasteProfile | null, limit = 4): Recommendation[] {
  if (!hasTasteProfile(profile)) return [];
  return DRINKS.filter((d) => !d.sample && !d.partyPack)
    .map((product) => ({ product, match: matchScore(profile, drinkSignature(product)) }))
    .sort((a, b) => b.match - a.match || b.product.priceNgn - a.product.priceNgn)
    .slice(0, limit);
}

export type CategoryAffinity = { category: DrinkCategory; label: string; match: number };

/** How well each stocked category fits the profile — drives the category tiles. */
export function categoryAffinity(profile: TasteProfile | null): CategoryAffinity[] {
  if (!hasTasteProfile(profile)) return [];
  const byCategory = new Map<DrinkCategory, number[]>();
  for (const product of DRINKS) {
    if (product.sample || product.partyPack) continue;
    const scores = byCategory.get(product.category) ?? [];
    scores.push(matchScore(profile, drinkSignature(product)));
    byCategory.set(product.category, scores);
  }
  return [...byCategory.entries()]
    .map(([category, scores]) => ({
      category,
      label: CATEGORY_LABELS[category],
      // The best bottle in a category is what makes it worth browsing.
      match: Math.max(...scores),
    }))
    .sort((a, b) => b.match - a.match)
    .slice(0, 5);
}
