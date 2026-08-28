import { DRINKS, formatNgn, getDrinkBySlug, type DrinkProduct } from '@/lib/drinks/catalog';

export type PackageOccasion =
  | 'party'
  | 'wedding'
  | 'birthday'
  | 'corporate'
  | 'bbq'
  | 'premium'
  | 'low-abv';

export type PackageComponent = {
  /** A slug from `DRINKS` in lib/drinks/catalog.ts. */
  slug: string;
  qty: number;
};

export type EventPackage = {
  slug: string;
  name: string;
  occasion: PackageOccasion;
  guests: number;
  /**
   * Bundle price, derived from the components in `buildPackage` — never hand-entered.
   * Always below `componentsTotalNgn(pkg)`; the saving is the pitch.
   */
  priceNgn: number;
  tagline: string;
  description: string;
  components: PackageComponent[];
};

export const OCCASION_LABELS: Record<PackageOccasion, string> = {
  party: 'Party',
  wedding: 'Wedding',
  birthday: 'Birthday',
  corporate: 'Corporate',
  bbq: 'BBQ & outdoor',
  premium: 'Premium',
  'low-abv': 'Low / no alcohol',
};

/**
 * Named event packages, sold as single SKUs.
 *
 * Each one seeds into `inventory` with `track_stock = false` (see lib/db/seed-packages.ts), so the
 * existing cart → checkout → order → Flutterwave path carries them with no special-casing. The
 * `components` list is what the packing team actually picks — surfaced on the PDP and in admin.
 */
/** Raw definition. `priceNgn` is derived from the components so the two can never drift apart. */
type PackageDef = Omit<EventPackage, 'priceNgn'> & {
  /** How far below the sum of the parts this package is priced. Bigger packages discount harder. */
  discountPct: number;
};

const PACKAGE_DEFS: PackageDef[] = [
  // ── PARTY ───────────────────────────────────────────────────
  {
    slug: 'convivia24-party-50',
    name: 'CONVIVIA24 PARTY 50',
    occasion: 'party',
    guests: 50,
    discountPct: 10,
    tagline: 'A full bar for fifty, in one line.',
    description:
      'Two whiskies, vodka, cognac, and enough RTDs and mixers to keep a fifty-guest room served all night. Pick it and stop thinking about bottles.',
    components: [
      { slug: 'jameson-original', qty: 2 },
      { slug: 'johnnie-walker-black', qty: 1 },
      { slug: 'absolut-vodka', qty: 2 },
      { slug: 'martell-vs', qty: 1 },
      { slug: 'smirnoff-ice-pack', qty: 4 },
      { slug: 'flying-fish-pack', qty: 4 },
      { slug: 'schweppes-tonic-pack', qty: 3 },
      { slug: 'tiger-cranberry', qty: 2 },
    ],
  },
  {
    slug: 'convivia24-party-100',
    name: 'CONVIVIA24 PARTY 100',
    occasion: 'party',
    guests: 100,
    discountPct: 11,
    tagline: 'The hundred-guest standard.',
    description:
      'Six spirits across whisky, vodka and cognac, plus RTDs and mixers at the volume a hundred guests actually drink over a full night.',
    components: [
      { slug: 'jameson-original', qty: 3 },
      { slug: 'johnnie-walker-black', qty: 2 },
      { slug: 'chivas-12', qty: 2 },
      { slug: 'absolut-vodka', qty: 3 },
      { slug: 'hennessy-vs', qty: 1 },
      { slug: 'martell-vs', qty: 1 },
      { slug: 'smirnoff-ice-pack', qty: 8 },
      { slug: 'flying-fish-pack', qty: 6 },
      { slug: 'orijin-rtd-pack', qty: 4 },
      { slug: 'schweppes-tonic-pack', qty: 5 },
      { slug: 'tiger-cranberry', qty: 4 },
    ],
  },
  {
    slug: 'convivia24-party-200',
    name: 'CONVIVIA24 PARTY 200',
    occasion: 'party',
    guests: 200,
    discountPct: 12,
    tagline: 'Hall-sized, with bottles for the host table.',
    description:
      'Volume spirits and mixers for the room, Champagne and Ciroc held back for the host and VIP tables. Sized for a two-hundred-guest hall.',
    components: [
      { slug: 'jameson-original', qty: 5 },
      { slug: 'johnnie-walker-black', qty: 4 },
      { slug: 'chivas-12', qty: 3 },
      { slug: 'monkey-shoulder', qty: 2 },
      { slug: 'absolut-vodka', qty: 5 },
      { slug: 'ciroc-snap-frost', qty: 2 },
      { slug: 'hennessy-vs', qty: 2 },
      { slug: 'martell-vs', qty: 2 },
      { slug: 'moet-imperial', qty: 2 },
      { slug: 'smirnoff-ice-pack', qty: 14 },
      { slug: 'flying-fish-pack', qty: 10 },
      { slug: 'orijin-rtd-pack', qty: 8 },
      { slug: 'schweppes-tonic-pack', qty: 10 },
      { slug: 'tiger-cranberry', qty: 8 },
    ],
  },
  // ── WEDDING ─────────────────────────────────────────────────
  {
    slug: 'convivia24-wedding-80',
    name: 'CONVIVIA24 WEDDING 80',
    occasion: 'wedding',
    guests: 80,
    discountPct: 9,
    tagline: 'A small wedding, properly poured.',
    description:
      'Champagne for the toast, Prosecco and Chardonnay through the meal, and a short spirits rail for after. Sized for eighty seated guests.',
    components: [
      { slug: 'moet-imperial', qty: 2 },
      { slug: 'prosecco-brut', qty: 5 },
      { slug: 'chardonnay-house', qty: 5 },
      { slug: 'hennessy-vsop', qty: 1 },
      { slug: 'jameson-original', qty: 2 },
      { slug: 'absolut-vodka', qty: 1 },
      { slug: 'schweppes-tonic-pack', qty: 5 },
      { slug: 'tiger-cranberry', qty: 4 },
      { slug: 'smirnoff-ice-pack', qty: 5 },
    ],
  },
  {
    slug: 'convivia24-wedding-150',
    name: 'CONVIVIA24 WEDDING 150',
    occasion: 'wedding',
    guests: 150,
    discountPct: 11,
    tagline: 'Champagne first, spirits after the plates clear.',
    description:
      'Moet and Mumm for the toast, Prosecco and Chardonnay through the meal, then VSOP cognac and whisky for the after-party. Built for a hundred and fifty seated guests.',
    components: [
      { slug: 'moet-imperial', qty: 4 },
      { slug: 'gh-mumm-cordon-rouge', qty: 2 },
      { slug: 'prosecco-brut', qty: 8 },
      { slug: 'chardonnay-house', qty: 8 },
      { slug: 'hennessy-vsop', qty: 2 },
      { slug: 'jameson-original', qty: 3 },
      { slug: 'johnnie-walker-black', qty: 2 },
      { slug: 'absolut-vodka', qty: 2 },
      { slug: 'schweppes-tonic-pack', qty: 8 },
      { slug: 'tiger-cranberry', qty: 6 },
      { slug: 'smirnoff-ice-pack', qty: 8 },
    ],
  },
  {
    slug: 'convivia24-wedding-300',
    name: 'CONVIVIA24 WEDDING 300',
    occasion: 'wedding',
    guests: 300,
    discountPct: 13,
    tagline: 'Three hundred guests, and nobody waits at the bar.',
    description:
      'Champagne across the room rather than the top table only, wine at real volume through the meal, and a full spirits rail for the after-party. Stage the delivery.',
    components: [
      { slug: 'moet-imperial', qty: 8 },
      { slug: 'gh-mumm-cordon-rouge', qty: 4 },
      { slug: 'veuve-yellow-label', qty: 2 },
      { slug: 'prosecco-brut', qty: 16 },
      { slug: 'chardonnay-house', qty: 16 },
      { slug: 'hennessy-vsop', qty: 4 },
      { slug: 'remy-martin-vsop', qty: 2 },
      { slug: 'jameson-original', qty: 6 },
      { slug: 'johnnie-walker-black', qty: 4 },
      { slug: 'absolut-vodka', qty: 4 },
      { slug: 'schweppes-tonic-pack', qty: 16 },
      { slug: 'tiger-cranberry', qty: 12 },
      { slug: 'smirnoff-ice-pack', qty: 16 },
    ],
  },
  // ── BIRTHDAY ────────────────────────────────────────────────
  {
    slug: 'convivia24-birthday-40',
    name: 'CONVIVIA24 BIRTHDAY 40',
    occasion: 'birthday',
    guests: 40,
    discountPct: 8,
    tagline: 'Forty people, one good table.',
    description:
      'One cognac, one Scotch, flavoured vodka, and cold RTDs. Enough to feel generous without buying a whole bar.',
    components: [
      { slug: 'hennessy-vs', qty: 1 },
      { slug: 'johnnie-walker-black', qty: 1 },
      { slug: 'jameson-original', qty: 1 },
      { slug: 'ciroc-red-berry', qty: 1 },
      { slug: 'smirnoff-ice-pack', qty: 4 },
      { slug: 'breezer-peach-pack', qty: 3 },
      { slug: 'schweppes-tonic-pack', qty: 3 },
      { slug: 'tiger-cranberry', qty: 2 },
    ],
  },
  {
    slug: 'convivia24-birthday-80',
    name: 'CONVIVIA24 BIRTHDAY 80',
    occasion: 'birthday',
    guests: 80,
    discountPct: 10,
    tagline: 'One bottle to bring out, the rest to keep it going.',
    description:
      'A Moet for the moment the lights go down, Hennessy and flavoured Ciroc for the table, and RTDs so the room never queues at the bar.',
    components: [
      { slug: 'moet-imperial', qty: 1 },
      { slug: 'hennessy-vs', qty: 2 },
      { slug: 'johnnie-walker-black', qty: 2 },
      { slug: 'jameson-original', qty: 2 },
      { slug: 'ciroc-red-berry', qty: 2 },
      { slug: 'smirnoff-ice-pack', qty: 6 },
      { slug: 'breezer-peach-pack', qty: 4 },
      { slug: 'brutal-fruit-pack', qty: 4 },
      { slug: 'schweppes-tonic-pack', qty: 4 },
      { slug: 'tiger-cranberry', qty: 3 },
    ],
  },
  {
    slug: 'convivia24-birthday-150',
    name: 'CONVIVIA24 BIRTHDAY 150',
    occasion: 'birthday',
    guests: 150,
    discountPct: 12,
    tagline: 'A milestone year, at full volume.',
    description:
      'Two Moets for the entrance, VSOP cognac and Scotch for the tables, and flavoured Ciroc plus RTDs across the floor. Built for a hundred and fifty.',
    components: [
      { slug: 'moet-imperial', qty: 2 },
      { slug: 'hennessy-vsop', qty: 2 },
      { slug: 'johnnie-walker-black', qty: 3 },
      { slug: 'jameson-original', qty: 4 },
      { slug: 'ciroc-red-berry', qty: 3 },
      { slug: 'ciroc-mango', qty: 2 },
      { slug: 'smirnoff-ice-pack', qty: 12 },
      { slug: 'breezer-peach-pack', qty: 8 },
      { slug: 'brutal-fruit-pack', qty: 8 },
      { slug: 'schweppes-tonic-pack', qty: 8 },
      { slug: 'tiger-cranberry', qty: 6 },
    ],
  },
  // ── CORPORATE ───────────────────────────────────────────────
  {
    slug: 'convivia24-corporate-50',
    name: 'CONVIVIA24 CORPORATE 50',
    occasion: 'corporate',
    guests: 50,
    discountPct: 8,
    tagline: 'A measured bar for a room of fifty.',
    description:
      'Prosecco and Chardonnay do the work, with one Scotch and one vodka behind the bar. Easy to sign off, easy to serve.',
    components: [
      { slug: 'prosecco-brut', qty: 4 },
      { slug: 'chardonnay-house', qty: 4 },
      { slug: 'chivas-12', qty: 1 },
      { slug: 'jameson-original', qty: 1 },
      { slug: 'absolut-vodka', qty: 1 },
      { slug: 'schweppes-tonic-pack', qty: 4 },
      { slug: 'tiger-cranberry', qty: 3 },
      { slug: 'smirnoff-ice-pack', qty: 3 },
    ],
  },
  {
    slug: 'convivia24-corporate-120',
    name: 'CONVIVIA24 CORPORATE 120',
    occasion: 'corporate',
    guests: 120,
    discountPct: 10,
    tagline: 'Wine-led, measured, and easy to sign off.',
    description:
      'Prosecco and Chardonnay do the work; single malt and blended Scotch sit behind the bar for the people who ask. Sized for a hundred and twenty at a conference or year-end.',
    components: [
      { slug: 'prosecco-brut', qty: 10 },
      { slug: 'chardonnay-house', qty: 10 },
      { slug: 'chivas-12', qty: 3 },
      { slug: 'glenfiddich-12', qty: 2 },
      { slug: 'jameson-original', qty: 2 },
      { slug: 'absolut-vodka', qty: 3 },
      { slug: 'schweppes-tonic-pack', qty: 8 },
      { slug: 'tiger-cranberry', qty: 6 },
      { slug: 'smirnoff-ice-pack', qty: 6 },
    ],
  },
  {
    slug: 'convivia24-corporate-250',
    name: 'CONVIVIA24 CORPORATE 250',
    occasion: 'corporate',
    guests: 250,
    discountPct: 13,
    tagline: 'Conference-scale, with a malt rail for the top table.',
    description:
      'Wine at volume for the room, three single malts and blended Scotch for the people who care, and mixers so the bar keeps moving. Two hundred and fifty guests.',
    components: [
      { slug: 'prosecco-brut', qty: 20 },
      { slug: 'chardonnay-house', qty: 20 },
      { slug: 'chivas-12', qty: 6 },
      { slug: 'glenfiddich-12', qty: 4 },
      { slug: 'glenlivet-12', qty: 2 },
      { slug: 'jameson-original', qty: 4 },
      { slug: 'absolut-vodka', qty: 6 },
      { slug: 'schweppes-tonic-pack', qty: 16 },
      { slug: 'tiger-cranberry', qty: 12 },
      { slug: 'smirnoff-ice-pack', qty: 12 },
    ],
  },
  // ── BBQ ─────────────────────────────────────────────────────
  {
    slug: 'convivia24-bbq-30',
    name: 'CONVIVIA24 BBQ 30',
    occasion: 'bbq',
    guests: 30,
    discountPct: 7,
    tagline: 'One cooler, thirty people, no bar needed.',
    description:
      'Desperados and RTDs people can grab themselves, plus a whisky and a vodka for whoever is mixing. Fits in a single cooler with ice.',
    components: [
      { slug: 'desperados-pack', qty: 5 },
      { slug: 'flying-fish-pack', qty: 5 },
      { slug: 'smirnoff-ice-pack', qty: 4 },
      { slug: 'ace-berry-pack', qty: 3 },
      { slug: 'jameson-original', qty: 1 },
      { slug: 'absolut-vodka', qty: 1 },
      { slug: 'schweppes-tonic-pack', qty: 2 },
      { slug: 'tiger-cranberry', qty: 2 },
    ],
  },
  {
    slug: 'convivia24-bbq-60',
    name: 'CONVIVIA24 BBQ 60',
    occasion: 'bbq',
    guests: 60,
    discountPct: 9,
    tagline: 'Cold, self-serve, and built for a cooler.',
    description:
      'Heavy on RTDs and Desperados that people can grab themselves, with whisky and vodka for whoever is mixing. Outdoor, daytime, sixty guests.',
    components: [
      { slug: 'desperados-pack', qty: 10 },
      { slug: 'flying-fish-pack', qty: 10 },
      { slug: 'smirnoff-ice-pack', qty: 8 },
      { slug: 'ace-berry-pack', qty: 6 },
      { slug: 'orijin-rtd-pack', qty: 6 },
      { slug: 'jameson-original', qty: 2 },
      { slug: 'absolut-vodka', qty: 2 },
      { slug: 'famous-grouse', qty: 2 },
      { slug: 'schweppes-tonic-pack', qty: 4 },
      { slug: 'tiger-cranberry', qty: 3 },
    ],
  },
  {
    slug: 'convivia24-bbq-120',
    name: 'CONVIVIA24 BBQ 120',
    occasion: 'bbq',
    guests: 120,
    discountPct: 12,
    tagline: 'A day-long outdoor party for a hundred and twenty.',
    description:
      'RTDs and Desperados by the crate so nobody queues, spirits for the mixing table, and enough tonic and cranberry to keep going after dark.',
    components: [
      { slug: 'desperados-pack', qty: 20 },
      { slug: 'flying-fish-pack', qty: 20 },
      { slug: 'smirnoff-ice-pack', qty: 16 },
      { slug: 'ace-berry-pack', qty: 12 },
      { slug: 'orijin-rtd-pack', qty: 12 },
      { slug: 'brutal-fruit-pack', qty: 8 },
      { slug: 'jameson-original', qty: 4 },
      { slug: 'absolut-vodka', qty: 4 },
      { slug: 'famous-grouse', qty: 3 },
      { slug: 'schweppes-tonic-pack', qty: 8 },
      { slug: 'tiger-cranberry', qty: 6 },
    ],
  },
  // ── PREMIUM ─────────────────────────────────────────────────
  {
    slug: 'convivia24-premium-20',
    name: 'CONVIVIA24 PREMIUM 20',
    occasion: 'premium',
    guests: 20,
    discountPct: 7,
    tagline: 'Twenty people, nothing off the bottom shelf.',
    description:
      'Hennessy XO, Remy 1738, Don Julio 1942 and two bottles of Veuve. A short list, all of it serious.',
    components: [
      { slug: 'hennessy-xo', qty: 1 },
      { slug: 'remy-martin-1738', qty: 1 },
      { slug: 'veuve-yellow-label', qty: 2 },
      { slug: 'don-julio-1942', qty: 1 },
      { slug: 'schweppes-tonic-pack', qty: 2 },
      { slug: 'tiger-cranberry', qty: 2 },
    ],
  },
  {
    slug: 'convivia24-premium-40',
    name: 'CONVIVIA24 PREMIUM 40',
    occasion: 'premium',
    guests: 40,
    discountPct: 9,
    tagline: 'Macallan 18, Blue Label, Veuve. Forty people who know.',
    description:
      'The top of the shelf, in one order - Macallan 18, Johnnie Walker Blue, Hennessy XO, Clase Azul, Don Julio 1942 and Veuve Clicquot, with mixers to match.',
    components: [
      { slug: 'macallan-18', qty: 1 },
      { slug: 'johnnie-walker-blue', qty: 1 },
      { slug: 'hennessy-xo', qty: 1 },
      { slug: 'remy-martin-1738', qty: 2 },
      { slug: 'veuve-yellow-label', qty: 3 },
      { slug: 'don-julio-1942', qty: 1 },
      { slug: 'clase-azul-reposado', qty: 1 },
      { slug: 'schweppes-tonic-pack', qty: 4 },
      { slug: 'tiger-cranberry', qty: 3 },
    ],
  },
  {
    slug: 'convivia24-premium-80',
    name: 'CONVIVIA24 PREMIUM 80',
    occasion: 'premium',
    guests: 80,
    discountPct: 12,
    tagline: 'The whole top shelf, twice over.',
    description:
      'Macallan 25 as the centrepiece, with 18-year Macallan, Blue Label, Martell XO, Signet, Clase Azul and Champagne across every table. For eighty guests who will notice.',
    components: [
      { slug: 'macallan-25', qty: 1 },
      { slug: 'macallan-18', qty: 2 },
      { slug: 'johnnie-walker-blue', qty: 2 },
      { slug: 'hennessy-xo', qty: 2 },
      { slug: 'martell-xo', qty: 1 },
      { slug: 'remy-martin-1738', qty: 3 },
      { slug: 'veuve-yellow-label', qty: 6 },
      { slug: 'moet-imperial', qty: 4 },
      { slug: 'clase-azul-reposado', qty: 2 },
      { slug: 'don-julio-1942', qty: 2 },
      { slug: 'glenmorangie-signet', qty: 1 },
      { slug: 'schweppes-tonic-pack', qty: 8 },
      { slug: 'tiger-cranberry', qty: 6 },
    ],
  },
  // ── LOW-ABV ─────────────────────────────────────────────────
  {
    slug: 'convivia24-low-abv-30',
    name: 'CONVIVIA24 LOW-ABV 30',
    occasion: 'low-abv',
    guests: 30,
    discountPct: 6,
    tagline: 'Thirty guests, nothing over 5%.',
    description:
      'Tonic, cranberry and light RTDs only. Small enough to chill properly, which is the whole game.',
    components: [
      { slug: 'schweppes-tonic-pack', qty: 4 },
      { slug: 'tiger-cranberry', qty: 4 },
      { slug: 'smirnoff-ice-pack', qty: 3 },
      { slug: 'flying-fish-pack', qty: 3 },
      { slug: 'ace-berry-pack', qty: 2 },
    ],
  },
  {
    slug: 'convivia24-low-abv-60',
    name: 'CONVIVIA24 LOW-ABV 60',
    occasion: 'low-abv',
    guests: 60,
    discountPct: 8,
    tagline: 'Mixers and light RTDs only. Nothing over 5%.',
    description:
      'For rooms that are not drinking spirits - tonic, cranberry, and low-ABV RTDs at real volume. Cold is the whole game here, so plan ice separately.',
    components: [
      { slug: 'schweppes-tonic-pack', qty: 8 },
      { slug: 'tiger-cranberry', qty: 8 },
      { slug: 'smirnoff-ice-pack', qty: 6 },
      { slug: 'flying-fish-pack', qty: 6 },
      { slug: 'ace-berry-pack', qty: 5 },
      { slug: 'brutal-fruit-pack', qty: 4 },
    ],
  },
  {
    slug: 'convivia24-low-abv-120',
    name: 'CONVIVIA24 LOW-ABV 120',
    occasion: 'low-abv',
    guests: 120,
    discountPct: 11,
    tagline: 'A dry room of a hundred and twenty, properly stocked.',
    description:
      'Tonic and cranberry by the crate with four light RTDs for variety. Assign someone to ice - that is what runs out, not the drinks.',
    components: [
      { slug: 'schweppes-tonic-pack', qty: 16 },
      { slug: 'tiger-cranberry', qty: 16 },
      { slug: 'smirnoff-ice-pack', qty: 12 },
      { slug: 'flying-fish-pack', qty: 12 },
      { slug: 'ace-berry-pack', qty: 10 },
      { slug: 'brutal-fruit-pack', qty: 8 },
      { slug: 'breezer-peach-pack', qty: 6 },
    ],
  },
];

/** Sum of the component list at shop prices. Used to derive the bundle price. */
function partsTotal(components: PackageComponent[]): number {
  return components.reduce((n, c) => {
    const product = getDrinkBySlug(c.slug);
    return product ? n + product.priceNgn * c.qty : n;
  }, 0);
}

/**
 * Packages are priced off their contents, rounded to the nearest ₦1,000 — never hand-entered.
 * Change a component or a shop price and the package price follows, so the advertised saving
 * stays true without anyone remembering to update it.
 */
function buildPackage(def: PackageDef): EventPackage {
  const { discountPct, ...rest } = def;
  const full = partsTotal(def.components);
  const priceNgn = Math.round((full * (100 - discountPct)) / 100 / 1000) * 1000;
  return { ...rest, priceNgn };
}

export const EVENT_PACKAGES: EventPackage[] = PACKAGE_DEFS.map(buildPackage);

export function getPackageBySlug(slug: string): EventPackage | undefined {
  return EVENT_PACKAGES.find((p) => p.slug === slug);
}

export function isPackageSlug(slug: string): boolean {
  return EVENT_PACKAGES.some((p) => p.slug === slug);
}

export function packagesByOccasion(occasion: PackageOccasion): EventPackage[] {
  return EVENT_PACKAGES.filter((p) => p.occasion === occasion);
}

export type ResolvedComponent = PackageComponent & {
  product: DrinkProduct;
  lineTotalNgn: number;
};

/** Components joined to the catalog. Unknown slugs are dropped — see the catalog test. */
export function resolveComponents(pkg: EventPackage): ResolvedComponent[] {
  return pkg.components.flatMap((c) => {
    const product = getDrinkBySlug(c.slug);
    if (!product) return [];
    return [{ ...c, product, lineTotalNgn: product.priceNgn * c.qty }];
  });
}

/** What the same bottles would cost bought one by one. */
export function componentsTotalNgn(pkg: EventPackage): number {
  return resolveComponents(pkg).reduce((n, c) => n + c.lineTotalNgn, 0);
}

export function savingsNgn(pkg: EventPackage): number {
  return Math.max(0, componentsTotalNgn(pkg) - pkg.priceNgn);
}

export function savingsPct(pkg: EventPackage): number {
  const full = componentsTotalNgn(pkg);
  if (full <= 0) return 0;
  return Math.round((savingsNgn(pkg) / full) * 100);
}

export function bottleCount(pkg: EventPackage): number {
  return pkg.components.reduce((n, c) => n + c.qty, 0);
}

export function spendPerGuestNgn(pkg: EventPackage): number {
  return pkg.guests > 0 ? Math.round(pkg.priceNgn / pkg.guests) : 0;
}

/** A one-line "3 whiskies, 2 cognacs, 12 RTDs" style summary for cards. */
export function componentSummary(pkg: EventPackage): string {
  const byCategory = new Map<string, number>();
  for (const c of resolveComponents(pkg)) {
    byCategory.set(c.product.category, (byCategory.get(c.product.category) || 0) + c.qty);
  }
  return [...byCategory.entries()].map(([cat, qty]) => `${qty} × ${cat}`).join(' · ');
}

/**
 * The package to suggest for a headcount, so `/plan` can offer a shortcut out of the basket it just
 * generated. Only the generic PARTY tiers compete here — occasion packages are chosen deliberately.
 */
export function packageForGuests(guests: number, occasion?: string): EventPackage | null {
  if (occasion) {
    const matches = EVENT_PACKAGES.filter(
      (p) => p.occasion !== 'party' && new RegExp(p.occasion, 'i').test(occasion)
    ).sort((a, b) => a.guests - b.guests);

    if (matches.length) {
      const pick = matches.find((p) => p.guests >= guests) || matches[matches.length - 1];
      // Only offer it when it is actually the right size for the room — otherwise a 25-guest
      // "wedding after-party" gets pitched the 80-guest WEDDING package.
      if (pick.guests >= guests * 0.5 && pick.guests <= guests * 2) return pick;
    }
  }
  const tiers = packagesByOccasion('party').slice().sort((a, b) => a.guests - b.guests);
  if (!tiers.length || guests < 30) return null;
  // Smallest tier that still covers the headcount, so a suggestion never under-supplies the room.
  // Past the largest tier we return it anyway — it is a starting point, not a complete answer.
  return tiers.find((p) => p.guests >= guests) || tiers[tiers.length - 1];
}

/**
 * A package rendered in the shape the cart, PDP and shop components already understand.
 *
 * Packages are not in `DRINKS` — they only exist here and as untracked `inventory` rows — so anything
 * that resolves a slug to a product needs this. Prefer `findSellable()` in lib/catalog/sellable.ts.
 */
export function packageAsProduct(pkg: EventPackage): DrinkProduct {
  const parts = resolveComponents(pkg);
  const units = parts.reduce((n, c) => n + c.qty, 0);
  const weightedAbv = units
    ? Math.round((parts.reduce((n, c) => n + c.product.abv * c.qty, 0) / units) * 10) / 10
    : 0;
  return {
    slug: pkg.slug,
    name: pkg.name,
    brand: 'Convivia24',
    category: 'party-packs',
    abv: weightedAbv,
    volume: `${bottleCount(pkg)} bottles · ~${pkg.guests} guests`,
    priceNgn: pkg.priceNgn,
    tagline: pkg.tagline,
    description: pkg.description,
    partyPack: true,
    servesHint: `~${pkg.guests} guests`,
    includes: parts.map((c) => (c.qty > 1 ? `${c.qty} × ${c.product.name}` : c.product.name)),
    packImages: parts.flatMap((c) => (c.product.image ? [c.product.image] : [])).slice(0, 4),
  };
}

export { formatNgn, DRINKS };
