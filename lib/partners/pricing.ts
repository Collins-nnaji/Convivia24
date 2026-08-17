import { DRINKS, formatNgn } from '@/lib/drinks/catalog';
import { wholesalePriceNgn } from '@/lib/partners/store';

/**
 * Menu pricing analysis for outlet owners. All money in naira, all inputs are
 * what a bar actually knows: what a bottle costs them, what they charge per
 * serving, how many servings they get out of a bottle, and how many bottles
 * move in a month.
 */

export type PricingItem = {
  id: string;
  slug: string | null;
  name: string;
  category: string | null;
  /** What the outlet pays for one bottle. */
  bottleCostNgn: number;
  /** Menu price of one serving (a pour, glass, or the bottle itself). */
  sellPriceNgn: number;
  servingsPerBottle: number;
  bottlesPerMonth: number;
};

export type ItemAnalysis = PricingItem & {
  costPerServingNgn: number;
  marginPerServingNgn: number;
  grossMarginPct: number;
  /** Beverage-cost ratio — the number bar managers actually track. */
  pourCostPct: number;
  markupMultiple: number;
  profitPerBottleNgn: number;
  monthlyRevenueNgn: number;
  monthlyProfitNgn: number;
  /** Servings that must sell just to cover the bottle. */
  breakevenServings: number;
  suggestedPriceNgn: number;
  priceGapNgn: number;
  verdict: 'under' | 'on-target' | 'premium';
  /** Convivia24 wholesale for the same bottle, when we carry it. */
  wholesaleCostNgn: number | null;
  monthlySavingNgn: number;
};

export type PortfolioAnalysis = {
  items: ItemAnalysis[];
  targetMarginPct: number;
  monthlyRevenueNgn: number;
  monthlyProfitNgn: number;
  monthlyCostNgn: number;
  blendedMarginPct: number;
  blendedPourCostPct: number;
  /** Extra monthly profit if every under-target line moved to the suggested price. */
  upliftNgn: number;
  /** Monthly saving from buying the same bottles at Convivia24 wholesale. */
  wholesaleSavingNgn: number;
  underPriced: ItemAnalysis[];
  bestSellers: ItemAnalysis[];
  weakest: ItemAnalysis[];
};

export const DEFAULT_TARGET_MARGIN = 72;

/** Room types an outlet can sign up as. Client-safe: no server imports here. */
export const VENUE_KINDS = ['club', 'lounge', 'rooftop', 'restaurant', 'hotel', 'beach', 'events'] as const;

/** Rough servings per bottle by category — a starting point owners can edit. */
export const SERVINGS_BY_CATEGORY: Record<string, number> = {
  whisky: 16,
  cognac: 16,
  spirits: 16,
  champagne: 6,
  wines: 5,
  cocktails: 1,
  mixers: 4,
  'party-packs': 1,
};

export function defaultServings(category: string | null): number {
  return SERVINGS_BY_CATEGORY[category || ''] ?? 12;
}

function round(n: number, dp = 1): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

export function analyseItem(item: PricingItem, targetMarginPct: number): ItemAnalysis {
  const servings = Math.max(1, item.servingsPerBottle);
  const bottles = Math.max(0, item.bottlesPerMonth);
  const cost = Math.max(0, item.bottleCostNgn);
  const price = Math.max(0, item.sellPriceNgn);

  const costPerServing = cost / servings;
  const marginPerServing = price - costPerServing;
  const grossMarginPct = price > 0 ? (marginPerServing / price) * 100 : 0;
  const pourCostPct = price > 0 ? (costPerServing / price) * 100 : 0;
  const target = Math.min(95, Math.max(1, targetMarginPct));
  const suggested = Math.round(costPerServing / (1 - target / 100));

  const catalogMatch = item.slug ? DRINKS.find((d) => d.slug === item.slug) : undefined;
  const wholesale = catalogMatch ? wholesalePriceNgn(catalogMatch.priceNgn) : null;
  const saving = wholesale != null && cost > wholesale ? (cost - wholesale) * bottles : 0;

  const verdict: ItemAnalysis['verdict'] =
    grossMarginPct < target - 3 ? 'under' : grossMarginPct > target + 12 ? 'premium' : 'on-target';

  return {
    ...item,
    servingsPerBottle: servings,
    costPerServingNgn: Math.round(costPerServing),
    marginPerServingNgn: Math.round(marginPerServing),
    grossMarginPct: round(grossMarginPct),
    pourCostPct: round(pourCostPct),
    markupMultiple: costPerServing > 0 ? round(price / costPerServing, 2) : 0,
    profitPerBottleNgn: Math.round(price * servings - cost),
    monthlyRevenueNgn: Math.round(price * servings * bottles),
    monthlyProfitNgn: Math.round((price * servings - cost) * bottles),
    breakevenServings: price > 0 ? round(cost / price, 1) : 0,
    suggestedPriceNgn: suggested,
    priceGapNgn: suggested - Math.round(price),
    verdict,
    wholesaleCostNgn: wholesale,
    monthlySavingNgn: Math.round(saving),
  };
}

export function analysePortfolio(items: PricingItem[], targetMarginPct = DEFAULT_TARGET_MARGIN): PortfolioAnalysis {
  const analysed = items.map((i) => analyseItem(i, targetMarginPct));

  const monthlyRevenueNgn = analysed.reduce((n, i) => n + i.monthlyRevenueNgn, 0);
  const monthlyProfitNgn = analysed.reduce((n, i) => n + i.monthlyProfitNgn, 0);
  const monthlyCostNgn = analysed.reduce((n, i) => n + i.bottleCostNgn * Math.max(0, i.bottlesPerMonth), 0);

  const upliftNgn = analysed
    .filter((i) => i.verdict === 'under' && i.priceGapNgn > 0)
    .reduce((n, i) => n + i.priceGapNgn * i.servingsPerBottle * Math.max(0, i.bottlesPerMonth), 0);

  return {
    items: analysed,
    targetMarginPct,
    monthlyRevenueNgn,
    monthlyProfitNgn,
    monthlyCostNgn,
    blendedMarginPct: monthlyRevenueNgn > 0 ? round((monthlyProfitNgn / monthlyRevenueNgn) * 100) : 0,
    blendedPourCostPct: monthlyRevenueNgn > 0 ? round((monthlyCostNgn / monthlyRevenueNgn) * 100) : 0,
    upliftNgn: Math.round(upliftNgn),
    wholesaleSavingNgn: analysed.reduce((n, i) => n + i.monthlySavingNgn, 0),
    underPriced: analysed.filter((i) => i.verdict === 'under').sort((a, b) => b.priceGapNgn - a.priceGapNgn),
    bestSellers: [...analysed].sort((a, b) => b.monthlyProfitNgn - a.monthlyProfitNgn).slice(0, 3),
    weakest: [...analysed]
      .filter((i) => i.bottlesPerMonth > 0)
      .sort((a, b) => a.grossMarginPct - b.grossMarginPct)
      .slice(0, 3),
  };
}

/** Seed a line from our catalog so owners start with sane numbers. */
export function itemFromCatalogSlug(slug: string): Omit<PricingItem, 'id'> | null {
  const drink = DRINKS.find((d) => d.slug === slug);
  if (!drink) return null;
  const servings = defaultServings(drink.category);
  const cost = wholesalePriceNgn(drink.priceNgn);
  return {
    slug: drink.slug,
    name: drink.name,
    category: drink.category,
    bottleCostNgn: cost,
    // A common Lagos starting point: price the pour at roughly 3.5× its cost.
    sellPriceNgn: Math.round(((cost / servings) * 3.5) / 100) * 100,
    servingsPerBottle: servings,
    bottlesPerMonth: 8,
  };
}

export { formatNgn };
