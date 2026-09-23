import { cocktailDefaults, hasTasteProfile, tasteLabel, type TasteProfile } from '@/lib/trivia/taste';

export type DrinkMixIdea = {
  id: string;
  name: string;
  blurb: string;
  spirit: string;
  style: string;
  /** Comma-separated ingredients the cocktail maker can pre-select. */
  ingredients: string;
};

const STYLE_LABEL: Record<string, string> = {
  refreshing: 'Refreshing',
  fruity: 'Fruity',
  sweet: 'Sweet',
  'strong and spirit-forward': 'Spirit-forward',
  creamy: 'Creamy',
  'low-sugar': 'Low sugar',
};

const SPIRIT_TO_MAKER: Record<string, string> = {
  cognac: 'cognac',
  whisky: 'whisky',
  vodka: 'vodka',
  tequila: 'tequila',
  champagne: 'wine',
  wines: 'wine',
};

const FLAVOUR_INGREDIENTS: Record<string, string[]> = {
  citrus: ['Lime', 'Lemon'],
  sweet: ['Simple syrup', 'Orange juice'],
  smooth: ['Soda water'],
  rich: ['Ginger beer'],
  smoky: ['Cola'],
  oak: ['Orange juice'],
};

/**
 * Three distinct mix ideas from a taste profile — each opens the cocktail maker
 * with base, style and ingredients already filled.
 */
export function recommendDrinkMixes(profile: TasteProfile | null): DrinkMixIdea[] {
  if (!hasTasteProfile(profile)) return [];

  const base = cocktailDefaults(profile);
  const spirits = profile.spirits
    .map((s) => SPIRIT_TO_MAKER[s] || 'gin')
    .filter((v, i, a) => a.indexOf(v) === i);
  if (!spirits.includes(base.spirit)) spirits.unshift(base.spirit);
  while (spirits.length < 3) {
    for (const fallback of ['gin', 'vodka', 'rum', 'whisky']) {
      if (!spirits.includes(fallback)) spirits.push(fallback);
      if (spirits.length >= 3) break;
    }
  }

  const styles = [base.style];
  if (profile.flavours.includes('sweet') && !styles.includes('sweet')) styles.push('sweet');
  if (profile.flavours.includes('citrus') && !styles.includes('refreshing')) styles.push('refreshing');
  if (
    (profile.flavours.includes('rich') || profile.flavours.includes('smoky') || profile.flavours.includes('oak')) &&
    !styles.includes('strong and spirit-forward')
  ) {
    styles.push('strong and spirit-forward');
  }
  if (!styles.includes('fruity')) styles.push('fruity');
  while (styles.length < 3) styles.push('refreshing');

  const flavourBits = profile.flavours.flatMap((f) => FLAVOUR_INGREDIENTS[f] || []).slice(0, 4);
  const defaults = ['Lime', 'Mint', 'Soda water'];

  const ideas: DrinkMixIdea[] = [];
  for (let i = 0; i < 3; i++) {
    const spirit = spirits[i]!;
    const style = styles[i]!;
    const mixIns = [...new Set([...flavourBits.slice(i, i + 2), defaults[i] || 'Lime'])].filter(Boolean);
    const spiritName = spirit === 'no-alcohol' ? 'Zero-proof' : spirit.charAt(0).toUpperCase() + spirit.slice(1);
    const styleName = STYLE_LABEL[style] || style;
    const occasion = profile.occasions[0] ? tasteLabel(profile.occasions[0]) : 'tonight';
    ideas.push({
      id: `${spirit}-${style}-${i}`,
      name: `${spiritName} · ${styleName}`,
      blurb:
        i === 0
          ? `Your lead mix — tuned to what you drink for ${occasion.toLowerCase()}.`
          : i === 1
            ? 'A second direction from the same profile — same likes, different pour.'
            : 'A third mix to try when you want the room to feel different.',
      spirit,
      style,
      ingredients: mixIns.join(', '),
    });
  }

  return ideas;
}

export function mixHref(idea: DrinkMixIdea): string {
  const q = new URLSearchParams();
  q.set('spirit', idea.spirit);
  q.set('style', idea.style);
  if (idea.ingredients.trim()) q.set('ingredients', idea.ingredients);
  return `/discover/mix?${q.toString()}`;
}
