import { CATEGORY_LABELS, DRINKS, type DrinkCategory, type DrinkProduct, formatNgn } from '@/lib/drinks/catalog';

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
  spendPerGuest: number;
  sizeLabel: string;
  tips: string[];
};

export const MIN_GUESTS = 2;
export const MAX_GUESTS = 50_000;
export const MIN_HOURS = 1;
export const MAX_HOURS = 18;
export const MAX_LINE_QTY = 50_000;

export const SIZE_PRESETS = [
  { id: 'intimate', guests: 8, label: 'Intimate', hint: 'Dinner, small hangout' },
  { id: 'house', guests: 25, label: 'House party', hint: 'Home, rooftop, compound' },
  { id: 'celebration', guests: 60, label: 'Celebration', hint: 'Birthday, after-party' },
  { id: 'big-night', guests: 150, label: 'Big night', hint: 'Lounge, club tables' },
  { id: 'large', guests: 400, label: 'Large event', hint: 'Wedding, hall' },
  { id: 'scale', guests: 1000, label: '1,000+', hint: 'Corporate, outdoor' },
  { id: 'mega', guests: 2500, label: '2,500+', hint: 'Stadium, festival' },
  { id: 'stadium', guests: 5000, label: '5,000+', hint: 'Arena, open ground' },
] as const;

export type EventSizeId = (typeof SIZE_PRESETS)[number]['id'] | 'custom';

const VIBE_LABELS: Record<PartyVibe, string> = {
  balanced: 'Balanced bar',
  nightlife: 'Nightlife heavy',
  dining: 'Dining & wine',
  sober: 'Low / no alcohol',
};

const VIBE_HELP: Record<PartyVibe, string> = {
  balanced: 'Spirits, a splash of bubbles, RTDs, and mixers.',
  nightlife: 'More cognac, whisky, and Champagne for tables.',
  dining: 'Wine and Champagne first, spirits for after.',
  sober: 'Soft drinks, mixers, and light RTDs only.',
};

export { VIBE_LABELS, VIBE_HELP, CATEGORY_LABELS };

/** Share of total pours by category. */
const VIBE_MIX: Record<PartyVibe, Partial<Record<DrinkCategory, number>>> = {
  balanced: {
    whisky: 0.22,
    cognac: 0.12,
    spirits: 0.18,
    champagne: 0.08,
    cocktails: 0.22,
    mixers: 0.18,
  },
  nightlife: {
    whisky: 0.2,
    cognac: 0.18,
    spirits: 0.2,
    champagne: 0.1,
    cocktails: 0.2,
    mixers: 0.12,
  },
  dining: {
    wines: 0.38,
    champagne: 0.22,
    cognac: 0.1,
    whisky: 0.1,
    mixers: 0.2,
  },
  sober: {
    mixers: 0.62,
    cocktails: 0.38,
  },
};

const POUR_RATE: Record<PartyVibe, number> = {
  balanced: 0.48,
  nightlife: 0.62,
  dining: 0.36,
  sober: 0.32,
};

function clampGuests(n: number): number {
  return Math.max(MIN_GUESTS, Math.min(MAX_GUESTS, Math.floor(n || 0)));
}

function clampHours(n: number): number {
  return Math.max(MIN_HOURS, Math.min(MAX_HOURS, Math.floor(n || 0)));
}

export function eventSizeMeta(guests: number): { id: EventSizeId; label: string; hint: string } {
  const g = clampGuests(guests);
  if (g <= 12) return { id: 'intimate', label: 'Intimate', hint: 'A few bottles and mixers go a long way.' };
  if (g <= 40) return { id: 'house', label: 'House party', hint: 'A full bar without filling a warehouse.' };
  if (g <= 100) return { id: 'celebration', label: 'Celebration', hint: 'Variety across spirits, bubbles, and RTDs.' };
  if (g <= 250) return { id: 'big-night', label: 'Big night', hint: 'Several SKUs per category so tables don’t run dry.' };
  if (g <= 700) return { id: 'large', label: 'Large event', hint: 'Volume mixers + a premium rail for VIP tables.' };
  if (g <= 1500) return { id: 'scale', label: '1,000+', hint: 'Bulk RTDs and mixers, with spirits for host tables.' };
  if (g <= 3500) return { id: 'mega', label: '2,500+', hint: 'Stage delivery — mixers first, premium bottles for VIP.' };
  return { id: 'stadium', label: '5,000+', hint: 'Wholesale volumes — assign restock leads per drink station.' };
}

export function nearestSizePreset(guests: number): (typeof SIZE_PRESETS)[number] | null {
  const g = clampGuests(guests);
  const hit = SIZE_PRESETS.find((p) => p.guests === g);
  return hit || null;
}

/** Longer events drink more, but not linearly — people taper after the first stretch. */
function hourFactor(hours: number): number {
  const h = clampHours(hours);
  return 0.72 + Math.log2(Math.max(h, 1.5)) * 0.42;
}

function packCount(volume: string): number {
  const m = volume.match(/×\s*(\d+)/i);
  return m ? Number(m[1]) : 1;
}

/** How many guest-drinks one unit of this product covers. */
function servingsPerUnit(product: DrinkProduct): number {
  if (product.category === 'cocktails' || product.category === 'mixers') {
    return packCount(product.volume);
  }
  if (product.category === 'wines' || product.category === 'champagne') return 6;
  if (product.category === 'party-packs') {
    const n = Number((product.servesHint || '').replace(/[^\d]/g, ''));
    return (n || 10) * 2.5;
  }
  return 14; // typical 70cl spirit
}

function varietyCount(guests: number, category: DrinkCategory): number {
  if (category === 'mixers') return guests >= 80 ? 2 : 1;
  if (guests <= 12) return 1;
  if (guests <= 60) return category === 'whisky' || category === 'spirits' || category === 'cocktails' ? 2 : 1;
  if (guests <= 250) return 2;
  return category === 'cocktails' ? 3 : 2;
}

function maxSkuCount(guests: number): number {
  if (guests <= 12) return 4;
  if (guests <= 40) return 7;
  if (guests <= 100) return 10;
  if (guests <= 250) return 14;
  if (guests <= 1500) return 18;
  return 22;
}

function pickProducts(category: DrinkCategory, variety: number): DrinkProduct[] {
  const list = DRINKS.filter((d) => d.category === category && !d.sample);
  if (!list.length) return [];
  const featured = list.filter((d) => d.featured || d.deal);
  const rest = list
    .filter((d) => !d.featured && !d.deal)
    .sort((a, b) => a.priceNgn - b.priceNgn);
  const ordered = [...featured, ...rest];
  return ordered.slice(0, Math.min(variety, ordered.length));
}

function splitQty(total: number, n: number): number[] {
  if (n <= 1) return [Math.max(1, total)];
  const parts = Array.from({ length: n }, () => 0);
  // Heavier on the first (featured) SKU, then spread volume.
  const weights = n === 2 ? [0.6, 0.4] : n === 3 ? [0.5, 0.3, 0.2] : Array.from({ length: n }, () => 1 / n);
  let remaining = total;
  for (let i = 0; i < n; i++) {
    const q = i === n - 1 ? remaining : Math.max(0, Math.round(total * weights[i]));
    parts[i] = q;
    remaining -= q;
  }
  return parts.map((q) => Math.max(q, 0));
}

function mixForOccasion(
  mix: Partial<Record<DrinkCategory, number>>,
  occasion?: string
): Partial<Record<DrinkCategory, number>> {
  if (!occasion) return mix;
  const next = { ...mix };
  const bump = (key: DrinkCategory, by: number) => {
    next[key] = (next[key] || 0) + by;
  };
  if (/wedding/i.test(occasion)) {
    bump('champagne', 0.08);
    bump('wines', 0.06);
  } else if (/club/i.test(occasion)) {
    bump('cognac', 0.06);
    bump('champagne', 0.05);
  } else if (/corporate/i.test(occasion)) {
    bump('wines', 0.08);
    bump('mixers', 0.08);
  } else if (/chill/i.test(occasion)) {
    bump('cocktails', 0.08);
    bump('mixers', 0.06);
  }
  return next;
}

function hostingTips(input: {
  guests: number;
  hours: number;
  vibe: PartyVibe;
  sizeLabel: string;
  drinksPerGuest: number;
  spendPerGuest: number;
}): string[] {
  const { guests, vibe, spendPerGuest } = input;
  const tips: string[] = [];

  if (guests <= 12) {
    tips.push('Keep the list short — two spirits plus mixers usually beats filling every category.');
  } else if (guests <= 40) {
    tips.push('Set one main spirit, one mixer station, and a cooler of RTDs so people self-serve.');
  } else if (guests <= 100) {
    tips.push('Run two drink stations (spirits + RTDs/mixers) so the bar does not bottleneck.');
  } else if (guests <= 250) {
    tips.push('Split the order: mixers and RTDs on ice first, premium bottles for host / VIP tables.');
  } else {
    tips.push('For this scale, stage delivery — bulk mixers early, premium spirits closer to start time.');
    tips.push('Assign someone to restock ice and soft drinks every hour; that is what runs out first.');
  }

  if (vibe === 'nightlife') {
    tips.push('Nightlife tables go through Champagne and cognac fastest — keep a backup bottle of each.');
  } else if (vibe === 'dining') {
    tips.push('Open wine with food; hold spirits until after plates clear so the rail lasts.');
  } else if (vibe === 'sober') {
    tips.push('Chill everything. Low-ABV nights live or die on cold mixers and enough volume.');
  }

  if (guests >= 20 && guests <= 30) {
    tips.push('Shortcut: Party Pack · 20 plus mixers covers a house party if you do not want to pick bottles.');
  } else if (guests >= 45 && guests <= 70) {
    tips.push('A Party Pack · 50 can lock the VIP table while this basket covers the rest of the room.');
  }

  tips.push(`Budget cue: this list is about ${formatNgn(spendPerGuest)} per guest before delivery.`);
  return tips.slice(0, 4);
}

function fitBudget(lines: DrinkPlanLine[], budget: number): DrinkPlanLine[] {
  let next = lines.map((l) => ({ ...l }));
  let total = next.reduce((n, l) => n + l.priceNgn * l.qty, 0);
  let guard = 0;
  const protectedCat = new Set(['mixers']);

  while (total > budget && next.length && guard < 400) {
    guard += 1;
    const candidates = next.filter((l) => !protectedCat.has(l.category) && l.qty > 1);
    const pool = candidates.length ? candidates : next.filter((l) => l.qty > 1);
    if (!pool.length) break;
    const largest = [...pool].sort((a, b) => b.priceNgn * b.qty - a.priceNgn * a.qty)[0];
    next = next.map((l) => (l.slug === largest.slug ? { ...l, qty: l.qty - 1 } : l)).filter((l) => l.qty > 0);
    total = next.reduce((n, l) => n + l.priceNgn * l.qty, 0);
  }
  return next;
}

function roundVolume(qty: number, guests: number): number {
  if (guests < 80 || qty < 6) return qty;
  if (qty >= 24) return Math.round(qty / 6) * 6;
  if (qty >= 8) return Math.round(qty / 2) * 2;
  return qty;
}

/** Recommend bottles, RTDs, and mixers from guest count, hours, vibe, and optional budget. */
export function recommendDrinks(input: {
  guests: number;
  hours?: number;
  vibe?: PartyVibe;
  budgetNgn?: number;
  occasion?: string;
}): DrinkPlan {
  const guests = clampGuests(input.guests);
  const hours = clampHours(input.hours ?? 5);
  const vibe: PartyVibe = input.vibe || 'balanced';
  const size = eventSizeMeta(guests);
  const factor = hourFactor(hours);

  const servingsEstimate = Math.max(guests, Math.round(guests * hours * POUR_RATE[vibe] * (factor / 1.2)));
  const drinksPerGuest = Math.round((servingsEstimate / guests) * 10) / 10;

  const mix = mixForOccasion(VIBE_MIX[vibe], input.occasion);
  const entries = Object.entries(mix) as [DrinkCategory, number][];
  entries.sort((a, b) => b[1] - a[1]);

  const raw: DrinkPlanLine[] = [];
  const skuCap = maxSkuCount(guests);

  for (const [category, share] of entries) {
    if (raw.length >= skuCap) break;
    const variety = varietyCount(guests, category);
    const products = pickProducts(category, variety);
    if (!products.length) continue;

    const categoryPours = Math.max(1, Math.round(servingsEstimate * share));
    const avgServings = products.reduce((n, p) => n + servingsPerUnit(p), 0) / products.length;
    let totalUnits = Math.max(1, Math.round(categoryPours / avgServings));

    // Intimate nights should not buy one of everything at qty 1 across 7 categories.
    if (guests <= 12 && category === 'champagne' && vibe !== 'dining' && vibe !== 'nightlife') {
      continue;
    }

    const parts = splitQty(totalUnits, products.length);
    products.forEach((product, i) => {
      if (raw.length >= skuCap) return;
      const qty = roundVolume(Math.max(parts[i], 0), guests);
      if (qty <= 0) return;
      raw.push({
        slug: product.slug,
        name: product.name,
        priceNgn: product.priceNgn,
        qty,
        category,
        reason: CATEGORY_LABELS[category],
      });
    });
  }

  let lines = raw.filter((l) => l.qty > 0);
  const budget = input.budgetNgn && input.budgetNgn > 0 ? input.budgetNgn : null;
  if (budget) lines = fitBudget(lines, budget);

  const totalNgn = lines.reduce((n, l) => n + l.priceNgn * l.qty, 0);
  const spendPerGuest = guests > 0 ? Math.round(totalNgn / guests) : 0;
  const tips = hostingTips({
    guests,
    hours,
    vibe,
    sizeLabel: size.label,
    drinksPerGuest,
    spendPerGuest,
  });

  return {
    lines,
    totalNgn,
    drinksPerGuest,
    servingsEstimate,
    spendPerGuest,
    sizeLabel: size.label,
    tips,
  };
}

function retotal(plan: DrinkPlan, lines: DrinkPlanLine[], guests: number): DrinkPlan {
  const totalNgn = lines.reduce((n, l) => n + l.priceNgn * l.qty, 0);
  const spendPerGuest = guests > 0 ? Math.round(totalNgn / guests) : 0;
  return { ...plan, lines, totalNgn, spendPerGuest };
}

export function planWithQty(plan: DrinkPlan, slug: string, qty: number, guests: number): DrinkPlan {
  const nextQty = Math.max(0, Math.min(MAX_LINE_QTY, Math.floor(qty)));
  const lines = plan.lines
    .map((l) => (l.slug === slug ? { ...l, qty: nextQty } : l))
    .filter((l) => l.qty > 0);
  return retotal(plan, lines, guests);
}

/** Replace one suggested bottle with another from the shop; keeps the quantity. */
export function planSwapProduct(
  plan: DrinkPlan,
  fromSlug: string,
  toSlug: string,
  guests: number
): DrinkPlan {
  if (fromSlug === toSlug) return plan;
  const product = DRINKS.find((d) => d.slug === toSlug);
  const from = plan.lines.find((l) => l.slug === fromSlug);
  if (!product || !from) return plan;

  const existing = plan.lines.find((l) => l.slug === toSlug);
  let lines: DrinkPlanLine[];
  if (existing) {
    lines = plan.lines
      .filter((l) => l.slug !== fromSlug)
      .map((l) =>
        l.slug === toSlug
          ? { ...l, qty: Math.min(MAX_LINE_QTY, l.qty + from.qty) }
          : l
      );
  } else {
    lines = plan.lines.map((l) =>
      l.slug === fromSlug
        ? {
            slug: product.slug,
            name: product.name,
            priceNgn: product.priceNgn,
            qty: from.qty,
            category: product.category,
            reason: CATEGORY_LABELS[product.category],
          }
        : l
    );
  }
  return retotal(plan, lines, guests);
}

/** Add a shop product to the plan (or bump qty if already listed). */
export function planAddProduct(plan: DrinkPlan, slug: string, guests: number, qty = 1): DrinkPlan {
  const product = DRINKS.find((d) => d.slug === slug);
  if (!product) return plan;
  const add = Math.max(1, Math.min(MAX_LINE_QTY, Math.floor(qty)));
  const existing = plan.lines.find((l) => l.slug === slug);
  const lines = existing
    ? plan.lines.map((l) =>
        l.slug === slug ? { ...l, qty: Math.min(MAX_LINE_QTY, l.qty + add) } : l
      )
    : [
        ...plan.lines,
        {
          slug: product.slug,
          name: product.name,
          priceNgn: product.priceNgn,
          qty: add,
          category: product.category,
          reason: CATEGORY_LABELS[product.category],
        },
      ];
  return retotal(plan, lines, guests);
}

export { formatNgn };
