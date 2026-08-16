import { DRINKS, type DrinkProduct, formatNgn } from '@/lib/drinks/catalog';

export type PartyVibe = 'balanced' | 'nightlife' | 'dining' | 'sober';

export type DrinkPlanLine = {
  slug: string;
  name: string;
  priceNgn: number;
  qty: number;
  reason: string;
  category: string;
};

export type DrinkPlan = {
  lines: DrinkPlanLine[];
  totalNgn: number;
  drinksPerGuest: number;
  servingsEstimate: number;
};

const VIBE_RATIOS: Record<PartyVibe, Partial<Record<string, number>>> = {
  // bottles (or packs) per guest
  balanced: {
    whisky: 0.04,
    cognac: 0.02,
    spirits: 0.03,
    champagne: 0.015,
    cocktails: 0.08,
    mixers: 0.06,
    'party-packs': 0.02,
  },
  nightlife: {
    whisky: 0.05,
    cognac: 0.035,
    spirits: 0.05,
    champagne: 0.02,
    cocktails: 0.12,
    mixers: 0.08,
    'party-packs': 0.03,
  },
  dining: {
    wines: 0.08,
    champagne: 0.03,
    cognac: 0.02,
    whisky: 0.02,
    mixers: 0.04,
  },
  sober: {
    cocktails: 0.02,
    mixers: 0.14,
    'party-packs': 0.04,
  },
};

const VIBE_LABELS: Record<PartyVibe, string> = {
  balanced: 'Balanced bar',
  nightlife: 'Nightlife heavy',
  dining: 'Dining & wine',
  sober: 'Low / no alcohol',
};

export { VIBE_LABELS };

function pickBest(category: string): DrinkProduct | undefined {
  const list = DRINKS.filter((d) => d.category === category);
  if (list.length === 0) return undefined;
  const featured = list.find((d) => d.featured || d.deal);
  return featured || [...list].sort((a, b) => a.priceNgn - b.priceNgn)[0];
}

/** Recommend bottles/packs from guest count, hours, vibe, and optional budget. */
export function recommendDrinks(input: {
  guests: number;
  hours?: number;
  vibe?: PartyVibe;
  budgetNgn?: number;
}): DrinkPlan {
  const guests = Math.max(4, Math.min(800, Math.floor(input.guests || 0)));
  const hours = Math.max(2, Math.min(12, input.hours ?? 5));
  const vibe: PartyVibe = input.vibe || 'balanced';
  const hourFactor = 0.7 + hours / 10; // longer party → more pours
  const ratios = VIBE_RATIOS[vibe];

  const raw: DrinkPlanLine[] = [];
  for (const [category, ratio] of Object.entries(ratios)) {
    const product = pickBest(category);
    if (!product || !ratio) continue;
    const qty = Math.max(1, Math.round(guests * ratio * hourFactor));
    raw.push({
      slug: product.slug,
      name: product.name,
      priceNgn: product.priceNgn,
      qty,
      category,
      reason: `${VIBE_LABELS[vibe]} · ~${Math.round(ratio * hourFactor * 100) / 100} / guest`,
    });
  }

  let lines = raw;
  let totalNgn = lines.reduce((n, l) => n + l.priceNgn * l.qty, 0);
  const budget = input.budgetNgn && input.budgetNgn > 0 ? input.budgetNgn : null;

  if (budget) {
    let guard = 0;
    while (totalNgn > budget && lines.length && guard < 200) {
      guard += 1;
      const largest = [...lines].sort((a, b) => b.priceNgn * b.qty - a.priceNgn * a.qty)[0];
      if (!largest || largest.qty <= 1) break;
      lines = lines.map((l) => (l.slug === largest.slug ? { ...l, qty: l.qty - 1 } : l));
      lines = lines.filter((l) => l.qty > 0);
      totalNgn = lines.reduce((n, l) => n + l.priceNgn * l.qty, 0);
    }
  }

  const servingsEstimate = Math.round(guests * hours * (vibe === 'sober' ? 1.2 : 2.4));
  const drinksPerGuest = Math.round((servingsEstimate / guests) * 10) / 10;

  return { lines, totalNgn, drinksPerGuest, servingsEstimate };
}

export { formatNgn };
