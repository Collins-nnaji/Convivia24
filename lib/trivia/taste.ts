/**
 * The taste profile behind the match percentages on /trivia.
 *
 * Four cheap questions — what you drink, how you like it, when you drink it,
 * and what you spend — scored against a brand round or a bottle. It is a
 * preference signal, not a recommendation engine: the score exists to explain
 * *why* a bottle is being surfaced, so every axis is legible to the drinker.
 */

export type TasteOption = { value: string; label: string };

export const SPIRIT_OPTIONS: TasteOption[] = [
  { value: 'cognac', label: 'Cognac' },
  { value: 'whisky', label: 'Whisky' },
  { value: 'champagne', label: 'Champagne' },
  { value: 'vodka', label: 'Vodka' },
  { value: 'tequila', label: 'Tequila' },
  { value: 'wines', label: 'Wine' },
];

export const FLAVOUR_OPTIONS: TasteOption[] = [
  { value: 'smooth', label: 'Smooth' },
  { value: 'rich', label: 'Rich' },
  { value: 'smoky', label: 'Smoky' },
  { value: 'sweet', label: 'Sweet' },
  { value: 'citrus', label: 'Citrus' },
  { value: 'oak', label: 'Oak' },
];

export const OCCASION_OPTIONS: TasteOption[] = [
  { value: 'evening', label: 'Evening Drinks' },
  { value: 'celebrations', label: 'Celebrations' },
  { value: 'house-party', label: 'House Party' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'solo', label: 'Slow & Solo' },
];

export type PriceBand = 'under-30' | '30-70' | '70-150' | '150-plus';

export const PRICE_OPTIONS: { value: PriceBand; label: string; maxNgn: number }[] = [
  { value: 'under-30', label: 'Under ₦30,000', maxNgn: 30_000 },
  { value: '30-70', label: '₦30,000 – ₦70,000', maxNgn: 70_000 },
  { value: '70-150', label: '₦70,000 – ₦150,000', maxNgn: 150_000 },
  { value: '150-plus', label: '₦150,000+', maxNgn: Number.MAX_SAFE_INTEGER },
];

export type TasteProfile = {
  spirits: string[];
  flavours: string[];
  occasions: string[];
  priceBand: PriceBand | null;
};

export const EMPTY_TASTE_PROFILE: TasteProfile = {
  spirits: [],
  flavours: [],
  occasions: [],
  priceBand: null,
};

/** A profile only counts once the drinker has told us what they drink. */
export function hasTasteProfile(p: TasteProfile | null): p is TasteProfile {
  return Boolean(p && p.spirits.length > 0);
}

/** What a round or bottle offers, scored against a profile. */
export type TasteSignature = {
  spirits: string[];
  flavours: string[];
  occasions: string[];
  priceNgn?: number;
};

const LABELS = new Map<string, string>(
  [...SPIRIT_OPTIONS, ...FLAVOUR_OPTIONS, ...OCCASION_OPTIONS].map((o) => [o.value, o.label])
);

export function tasteLabel(value: string): string {
  return LABELS.get(value) || value;
}

/** The chips shown on the profile card — what "you love", in priority order. */
export function tasteHighlights(p: TasteProfile, limit = 5): string[] {
  return [...p.flavours, ...p.spirits, ...p.occasions].slice(0, limit).map(tasteLabel);
}

function overlap(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const set = new Set(b);
  const hits = a.filter((v) => set.has(v)).length;
  return hits / a.length;
}

function priceFit(band: PriceBand | null, priceNgn?: number): number {
  if (!band || priceNgn === undefined) return 0.5;
  const idx = PRICE_OPTIONS.findIndex((o) => o.value === band);
  const bottleIdx = PRICE_OPTIONS.findIndex((o) => priceNgn <= o.maxNgn);
  if (idx < 0 || bottleIdx < 0) return 0.5;
  // One band either side still reads as affordable; further out drops off fast.
  const distance = Math.abs(idx - bottleIdx);
  return distance === 0 ? 1 : distance === 1 ? 0.6 : 0.2;
}

const WEIGHTS = { spirit: 0.46, flavour: 0.34, occasion: 0.12, price: 0.08 };

/**
 * 0–100. Floored at 55 so a weak match still reads as a suggestion rather than
 * a rejection — the drinker asked to be shown something, not scored.
 */
export function matchScore(profile: TasteProfile | null, sig: TasteSignature): number {
  if (!hasTasteProfile(profile)) return 0;
  const raw =
    overlap(profile.spirits, sig.spirits) * WEIGHTS.spirit +
    overlap(profile.flavours, sig.flavours) * WEIGHTS.flavour +
    overlap(profile.occasions, sig.occasions) * WEIGHTS.occasion +
    priceFit(profile.priceBand, sig.priceNgn) * WEIGHTS.price;
  return Math.round(55 + raw * 45);
}

/** Average match across the rounds on offer — the headline number on the card. */
export function overallMatch(profile: TasteProfile | null, sigs: TasteSignature[]): number {
  if (!hasTasteProfile(profile) || sigs.length === 0) return 0;
  const best = sigs.map((s) => matchScore(profile, s)).sort((a, b) => b - a);
  // Weighted to the top few — the profile is judged on what it surfaces first.
  const top = best.slice(0, Math.max(1, Math.ceil(best.length / 2)));
  return Math.round(top.reduce((n, v) => n + v, 0) / top.length);
}

const VALUES = {
  spirits: new Set(SPIRIT_OPTIONS.map((o) => o.value)),
  flavours: new Set(FLAVOUR_OPTIONS.map((o) => o.value)),
  occasions: new Set(OCCASION_OPTIONS.map((o) => o.value)),
  price: new Set(PRICE_OPTIONS.map((o) => o.value as string)),
};

/** Trust nothing off the wire — drop anything not in the catalog. */
export function sanitizeProfile(input: unknown): TasteProfile {
  const raw = (input || {}) as Record<string, unknown>;
  const list = (v: unknown, allowed: Set<string>) =>
    (Array.isArray(v) ? v : [])
      .map((x) => String(x))
      .filter((x) => allowed.has(x))
      .slice(0, 6);
  const band = String(raw.priceBand ?? '');
  return {
    spirits: list(raw.spirits, VALUES.spirits),
    flavours: list(raw.flavours, VALUES.flavours),
    occasions: list(raw.occasions, VALUES.occasions),
    priceBand: VALUES.price.has(band) ? (band as PriceBand) : null,
  };
}

/**
 * A readable name for the shape of someone's profile.
 *
 * Deliberately derived from what they picked rather than stored: the label has
 * to change the moment they edit their answers, and there is nothing to keep
 * in sync if it is computed.
 */
export type TastePersonality = {
  name: string;
  blurb: string;
  traits: string[];
};

const RICH = new Set(['rich', 'oak', 'smoky']);
const BRIGHT = new Set(['citrus', 'sweet']);

export function tastePersonality(profile: TasteProfile | null): TastePersonality | null {
  if (!hasTasteProfile(profile)) return null;

  const rich = profile.flavours.filter((f) => RICH.has(f)).length;
  const bright = profile.flavours.filter((f) => BRIGHT.has(f)).length;
  const premium = profile.priceBand === '70-150' || profile.priceBand === '150-plus';
  const social =
    profile.occasions.includes('house-party') || profile.occasions.includes('celebrations');
  const broad = profile.spirits.length >= 3;

  const traits = [
    premium ? 'Quality seeker' : 'Value minded',
    broad ? 'Adventurous' : 'Loyal',
    social ? 'Social' : 'Considered',
    rich > bright ? 'Refined' : 'Bright',
  ];

  if (premium && broad) {
    return {
      name: 'The Sophisticated Explorer',
      blurb:
        'You enjoy refined, complex flavours and like exploring premium options. You appreciate quality and are open to trying new houses.',
      traits,
    };
  }
  if (rich > bright) {
    return {
      name: 'The Slow Sipper',
      blurb:
        'Rich, oaked and smoky is where you live. You would rather have one good pour than three easy ones.',
      traits,
    };
  }
  if (social) {
    return {
      name: 'The Host',
      blurb:
        'You buy for a room, not just for yourself — bright, easy bottles that keep a table moving.',
      traits,
    };
  }
  return {
    name: 'The Easy Drinker',
    blurb: 'Smooth and approachable over heavy and complex. You know what you like and you stick with it.',
    traits,
  };
}

/** The labelled bars on the profile page — each one reports a real answer. */
export type PreferenceRow = { label: string; value: string; strength: number };

export function preferenceBreakdown(profile: TasteProfile | null): PreferenceRow[] {
  if (!hasTasteProfile(profile)) return [];
  const band = PRICE_OPTIONS.find((o) => o.value === profile.priceBand);

  const rows: PreferenceRow[] = [
    {
      label: 'Spirit type',
      value: profile.spirits.map(tasteLabel).join(', '),
      // Strength reads how decided they are: one pick is a strong signal,
      // six is barely a preference at all.
      strength: strengthFor(profile.spirits.length, 3),
    },
    {
      label: 'Flavour profile',
      value: profile.flavours.map(tasteLabel).join(', ') || 'Not set',
      strength: strengthFor(profile.flavours.length, 3),
    },
    {
      label: 'Occasion',
      value: profile.occasions.map(tasteLabel).join(', ') || 'Not set',
      strength: strengthFor(profile.occasions.length, 2),
    },
    {
      label: 'Price range',
      value: band?.label ?? 'Not set',
      strength: band ? 100 : 0,
    },
  ];

  return rows;
}

function strengthFor(picked: number, max: number): number {
  if (picked === 0) return 0;
  // One pick out of the allowed maximum is the most decisive answer there is.
  return Math.round((1 - (picked - 1) / Math.max(1, max)) * 40 + 60);
}
