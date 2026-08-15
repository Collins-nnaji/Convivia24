export type DrinkCategory =
  | 'champagne'
  | 'whisky'
  | 'cognac'
  | 'wines'
  | 'spirits'
  | 'mixers'
  | 'party-packs';

export type DrinkProduct = {
  slug: string;
  name: string;
  category: DrinkCategory;
  abv: number;
  volume: string;
  priceNgn: number;
  tagline: string;
  description: string;
  featured?: boolean;
  deal?: boolean;
  partyPack?: boolean;
  servesHint?: string;
};

export const CATEGORY_LABELS: Record<DrinkCategory, string> = {
  champagne: 'Champagne',
  whisky: 'Whisky',
  cognac: 'Cognac',
  wines: 'Wines',
  spirits: 'Spirits',
  mixers: 'Mixers & Soft',
  'party-packs': 'Party packs',
};

export const CATEGORIES: DrinkCategory[] = [
  'champagne',
  'whisky',
  'cognac',
  'wines',
  'spirits',
  'mixers',
  'party-packs',
];

export function formatNgn(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const DRINKS: DrinkProduct[] = [
  {
    slug: 'moet-imperial',
    name: 'Moët & Chandon Impérial',
    category: 'champagne',
    abv: 12,
    volume: '75CL',
    priceNgn: 185000,
    tagline: 'The club table classic.',
    description: 'Bright citrus and brioche — the bottle that opens the night on VI dancefloors and rooftop lounges.',
    featured: true,
  },
  {
    slug: 'veuve-yellow-label',
    name: 'Veuve Clicquot Yellow Label',
    category: 'champagne',
    abv: 12,
    volume: '75CL',
    priceNgn: 210000,
    tagline: 'Orange label energy.',
    description: 'Full-bodied Champagne for birthday tables and lounge bottle service.',
    featured: true,
    deal: true,
  },
  {
    slug: 'jameson-original',
    name: 'Jameson Original',
    category: 'whisky',
    abv: 40,
    volume: '70CL',
    priceNgn: 42000,
    tagline: 'Smooth Irish for the crew.',
    description: 'Triple-distilled Irish whiskey — mixable, shareable, always on the party list.',
    featured: true,
  },
  {
    slug: 'jameson-black-barrel',
    name: 'Jameson Black Barrel',
    category: 'whisky',
    abv: 40,
    volume: '70CL',
    priceNgn: 58000,
    tagline: 'Hot deal · richer oak.',
    description: 'Double-charred barrels bring spice and vanilla — a lounge pour that punches above.',
    deal: true,
  },
  {
    slug: 'glenmorangie-original',
    name: 'Glenmorangie Original',
    category: 'whisky',
    abv: 40,
    volume: '70CL',
    priceNgn: 72000,
    tagline: 'Single malt for late sets.',
    description: 'Floral Highland malt — soft enough for first-timers, serious enough for the host.',
  },
  {
    slug: 'martell-vs',
    name: 'Martell VS',
    category: 'cognac',
    abv: 40,
    volume: '70CL',
    priceNgn: 65000,
    tagline: 'Cognac for the toast.',
    description: 'Fruit-forward Cognac built for VIP tables and after-party pours.',
    featured: true,
  },
  {
    slug: 'martell-blue-swift',
    name: 'Martell Blue Swift',
    category: 'cognac',
    abv: 40,
    volume: '70CL',
    priceNgn: 95000,
    tagline: 'Bourbon-finished flex.',
    description: 'Cognac finished in bourbon casks — smooth, modern, club-ready.',
    deal: true,
  },
  {
    slug: 'casamigos-reposado',
    name: 'Casamigos Reposado',
    category: 'spirits',
    abv: 40,
    volume: '70CL',
    priceNgn: 110000,
    tagline: 'Tequila for the terrace.',
    description: 'Oak-aged reposado — sip neat or build margaritas for the whole lounge booth.',
    featured: true,
  },
  {
    slug: 'hennessy-vs',
    name: 'Hennessy VS',
    category: 'cognac',
    abv: 40,
    volume: '70CL',
    priceNgn: 78000,
    tagline: 'The unmistakable drop.',
    description: 'The Cognac Lagos parties still request by name.',
  },
  {
    slug: 'ballantines-finest',
    name: "Ballantine's Finest",
    category: 'whisky',
    abv: 40,
    volume: '70CL',
    priceNgn: 38000,
    tagline: 'Blended Scotch staple.',
    description: 'Approachable Scotch for big crews and long nights.',
  },
  {
    slug: 'chardonnay-house',
    name: 'House Chardonnay',
    category: 'wines',
    abv: 13,
    volume: '75CL',
    priceNgn: 28000,
    tagline: 'White for the balcony.',
    description: 'Crisp, citrusy white — perfect with outdoor hangouts before the club.',
  },
  {
    slug: 'prosecco-brut',
    name: 'Prosecco Brut',
    category: 'wines',
    abv: 11,
    volume: '75CL',
    priceNgn: 32000,
    tagline: 'Sparkle without the wait.',
    description: 'Italian bubbles for day parties, rooftops, and brunch-to-night transitions.',
    featured: true,
  },
  {
    slug: 'tiger-cranberry',
    name: 'Tiger Cranberry',
    category: 'mixers',
    abv: 0,
    volume: '33CL × 6',
    priceNgn: 8500,
    tagline: 'Energy for the outdoor set.',
    description: 'Zero-ABV mixer pack — keep the circle hydrated between pours.',
  },
  {
    slug: 'schweppes-tonic-pack',
    name: 'Schweppes Tonic Pack',
    category: 'mixers',
    abv: 0,
    volume: '33CL × 12',
    priceNgn: 12000,
    tagline: 'Gin’s best friend.',
    description: 'Tonic six-packs doubled for party volume.',
  },
  {
    slug: 'party-pack-10',
    name: 'Party Pack · 10',
    category: 'party-packs',
    abv: 0,
    volume: 'Mixed',
    priceNgn: 185000,
    tagline: 'Small crew, sorted.',
    description: 'Curated mix of whisky, Cognac, Champagne, and mixers sized for ~10 guests.',
    partyPack: true,
    featured: true,
    servesHint: '~10 guests',
  },
  {
    slug: 'party-pack-20',
    name: 'Party Pack · 20',
    category: 'party-packs',
    abv: 0,
    volume: 'Mixed',
    priceNgn: 345000,
    tagline: 'House party ready.',
    description: 'Bigger drop for backyard, beach, or lounge takeover — ~20 guests.',
    partyPack: true,
    deal: true,
    servesHint: '~20 guests',
  },
  {
    slug: 'party-pack-50',
    name: 'Party Pack · 50',
    category: 'party-packs',
    abv: 0,
    volume: 'Mixed',
    priceNgn: 780000,
    tagline: 'Club / lounge takeover.',
    description: 'Full venue energy — Champagne, spirits, mixers for ~50. Host locks the crew cart.',
    partyPack: true,
    servesHint: '~50 guests',
  },
];

export function getDrinkBySlug(slug: string): DrinkProduct | undefined {
  return DRINKS.find((d) => d.slug === slug);
}

export function drinksByCategory(category: DrinkCategory): DrinkProduct[] {
  return DRINKS.filter((d) => d.category === category);
}

export function searchDrinks(query: string): DrinkProduct[] {
  const q = query.trim().toLowerCase();
  if (!q) return DRINKS;
  return DRINKS.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.category.includes(q) ||
      CATEGORY_LABELS[d.category].toLowerCase().includes(q) ||
      d.tagline.toLowerCase().includes(q)
  );
}
