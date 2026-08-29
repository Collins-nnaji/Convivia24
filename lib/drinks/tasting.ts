/**
 * Structured tasting notes for the product page — colour, nose, palate, finish.
 *
 * Only bottles with a documented house profile are listed here. Anything not in
 * this map falls back to the single-line note in TASTE_NOTES, and the product
 * page renders the prose card instead of the four-row breakdown rather than
 * inventing notes for a bottle nobody has written up.
 */

export type TastingProfile = {
  colour: string;
  nose: string;
  palate: string;
  finish: string;
};

export const TASTING_PROFILES: Record<string, TastingProfile> = {
  'hennessy-vs': {
    colour: 'Bright amber',
    nose: 'Toasted oak, dried fruit, a lift of pepper',
    palate: 'Punchy and grape-forward, built to carry a mixer',
    finish: 'Short, warm, peppery',
  },
  'hennessy-vsop': {
    colour: 'Deep amber',
    nose: 'Vanilla, oak, dried fruits',
    palate: 'Smooth and fruity, with a touch of spice',
    finish: 'Long, warm and elegant',
  },
  'hennessy-xo': {
    colour: 'Dark mahogany',
    nose: 'Dark chocolate, leather, candied orange',
    palate: 'Dense and layered — dried fruit over decades of oak',
    finish: 'Very long, cocoa and spice',
  },
  'martell-vs': {
    colour: 'Pale gold',
    nose: 'Fresh grape and young oak',
    palate: 'Bright and clean, the lightest pour in the range',
    finish: 'Crisp, short, faintly floral',
  },
  'martell-blue-swift': {
    colour: 'Warm copper',
    nose: 'Vanilla and toasted bourbon oak',
    palate: 'Rounder and sweeter than a standard VSOP',
    finish: 'Soft, vanilla-led',
  },
  'martell-xo': {
    colour: 'Deep bronze',
    nose: 'Dried fig, cocoa, toasted spice',
    palate: 'Weighty and slow, built for a sipping table',
    finish: 'Long and spiced',
  },
  'remy-martin-vsop': {
    colour: 'Golden amber',
    nose: 'Vanilla, apricot, licorice',
    palate: 'Ripe fruit over a fine Champagne cognac base',
    finish: 'Soft and warming',
  },
  'remy-martin-1738': {
    colour: 'Rich copper',
    nose: 'Cocoa, toasted brioche, plum',
    palate: 'More weight than the VSOP — oak and dark fruit',
    finish: 'Long, cocoa and spice',
  },
  'johnnie-walker-black': {
    colour: 'Deep gold',
    nose: 'Smoke, dried fruit, toffee',
    palate: 'Rich and balanced, 12 years of malt and grain',
    finish: 'Long, warming, gently smoky',
  },
  'johnnie-walker-green': {
    colour: 'Pale gold',
    nose: 'Green apple, fresh mint, damp moss',
    palate: 'All-malt, grassier and more mineral than Black',
    finish: 'Dry and clean',
  },
  'johnnie-walker-gold': {
    colour: 'Bright gold',
    nose: 'Honey, soft fruit, cream',
    palate: 'Honeyed and creamy — richer than Black, gentler than the older labels',
    finish: 'Smooth, faintly sweet',
  },
  'johnnie-walker-blue': {
    colour: 'Burnished gold',
    nose: 'Dried fruit, honey, a wisp of smoke',
    palate: 'Silky and layered with almost no burn',
    finish: 'Very long and rounded',
  },
  'jameson-original': {
    colour: 'Light straw',
    nose: 'Green apple, vanilla, light florals',
    palate: 'Easy-going and triple-distilled — barely a bite',
    finish: 'Short, clean, faintly sweet',
  },
  'jameson-black-barrel': {
    colour: 'Warm gold',
    nose: 'Vanilla, dark toffee, toasted wood',
    palate: 'Fuller than the Original, double-charred cask spice',
    finish: 'Long, warm, spiced',
  },
  'glenfiddich-12': {
    colour: 'Pale straw',
    nose: 'Fresh pear and light oak',
    palate: 'Clean and light — the classic first single malt',
    finish: 'Crisp and short',
  },
  'glenlivet-12': {
    colour: 'Bright gold',
    nose: 'Orchard fruit, pineapple, vanilla',
    palate: 'The house style at its most balanced',
    finish: 'Clean, vanilla-led',
  },
  'macallan-12': {
    colour: 'Rich amber',
    nose: 'Vanilla, dried fruit, sherry oak',
    palate: 'Sweet and rounded from sherry and bourbon casks',
    finish: 'Warm and lingering',
  },
  'chivas-12': {
    colour: 'Warm gold',
    nose: 'Honey, ripe apple, soft malt',
    palate: 'Easy at any volume — malty and rounded',
    finish: 'Smooth and mellow',
  },
  'glenmorangie-original': {
    colour: 'Pale gold',
    nose: 'Lemon, peach, light honey',
    palate: 'Floral and citrus-led — the gentlest malt on the list',
    finish: 'Delicate and clean',
  },
  'moet-imperial': {
    colour: 'Pale straw with a fine bead',
    nose: 'Green apple, brioche, white flowers',
    palate: 'Bright rather than heavy, with a fast mousse',
    finish: 'Crisp and dry',
  },
  'veuve-yellow-label': {
    colour: 'Golden straw',
    nose: 'Toasted bread, ripe stone fruit',
    palate: 'Fuller-bodied than Moët, rounder in the middle',
    finish: 'Long and toasty',
  },
  'gh-mumm-cordon-rouge': {
    colour: 'Light gold',
    nose: 'Green apple and brioche',
    palate: 'Pinot-led and crisp, fine bubbles',
    finish: 'Dry and clean',
  },
  'don-julio-1942': {
    colour: 'Warm amber',
    nose: 'Roasted agave, caramel, vanilla',
    palate: 'Añejo weight — soft oak over cooked agave',
    finish: 'Long and smooth',
  },
  'casamigos-reposado': {
    colour: 'Light gold',
    nose: 'Vanilla, light caramel, agave',
    palate: 'Months not years in oak — easy to sip neat',
    finish: 'Soft and warm',
  },
  'ciroc-snap-frost': {
    colour: 'Clear',
    nose: 'Citrus zest and faint pear',
    palate: 'Softer than grain vodka — grape-distilled',
    finish: 'Clean exit',
  },
  'absolut-vodka': {
    colour: 'Clear',
    nose: 'Faint grain sweetness',
    palate: 'Neutral and smooth — built to disappear into a mix',
    finish: 'Short and clean',
  },
};

export function tastingProfile(slug: string): TastingProfile | null {
  return TASTING_PROFILES[slug] ?? null;
}

/**
 * Short badge facts shown under the description. Only stated where they are
 * true of the specific bottle — an age statement, a cask, a legal minimum.
 */
export const PRODUCT_FACTS: Record<string, string[]> = {
  'hennessy-vs': ['Aged 2+ years', 'French oak barrels', 'Double distilled'],
  'hennessy-vsop': ['Aged 4+ years', 'French oak barrels', 'Double distilled'],
  'hennessy-xo': ['Aged 10+ years', 'French oak barrels', 'Double distilled'],
  'martell-vs': ['Double distilled', 'French oak barrels'],
  'martell-blue-swift': ['Bourbon cask finish', 'Double distilled'],
  'martell-xo': ['Aged 10+ years', 'French oak barrels'],
  'remy-martin-vsop': ['Fine Champagne cognac', 'Aged 4+ years'],
  'remy-martin-1738': ['Aged 4+ years', 'Deep toasted oak'],
  'johnnie-walker-black': ['12 year age statement', 'Blended Scotch'],
  'johnnie-walker-green': ['15 year age statement', 'Blended malt — no grain'],
  'johnnie-walker-gold': ['Blended Scotch', 'Cask-matured'],
  'johnnie-walker-blue': ['Rare cask selection', 'Blended Scotch'],
  'jameson-original': ['Triple distilled', 'Aged 3+ years'],
  'jameson-black-barrel': ['Triple distilled', 'Double-charred bourbon barrels'],
  'glenfiddich-12': ['12 year age statement', 'Single malt'],
  'glenlivet-12': ['12 year age statement', 'Single malt'],
  'glenlivet-18': ['18 year age statement', 'Single malt'],
  'macallan-12': ['12 year age statement', 'Sherry & bourbon casks'],
  'macallan-18': ['18 year age statement', 'Sherry oak'],
  'macallan-25': ['25 year age statement', 'Sherry oak'],
  'chivas-12': ['12 year age statement', 'Blended Scotch'],
  'chivas-18': ['18 year age statement', 'Blended Scotch'],
  'glenmorangie-original': ['10 year age statement', 'Single malt'],
  'glenmorangie-lasanta': ['Sherry cask finish', 'Single malt'],
  'moet-imperial': ['Méthode champenoise', 'Non-vintage blend'],
  'veuve-yellow-label': ['Méthode champenoise', 'Pinot Noir led'],
  'gh-mumm-cordon-rouge': ['Méthode champenoise', 'Pinot Noir led'],
  'don-julio-1942': ['Aged 2.5 years', '100% blue agave'],
  'casamigos-reposado': ['Rested 7 months', '100% blue agave'],
  'casamigos-anejo': ['Aged 14 months', '100% blue agave'],
  'clase-azul-reposado': ['Hand-painted decanter', '100% blue agave'],
  'ciroc-snap-frost': ['Grape distilled', 'Five times distilled'],
};

export function productFacts(slug: string): string[] {
  return PRODUCT_FACTS[slug] ?? [];
}
