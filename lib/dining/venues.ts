/**
 * Venue + menu catalogue.
 *
 * Menus are the reason the split works: prices are known *before* anyone sits
 * down, so a table can plan the meal and see the damage in the same place.
 * Prices are in whole naira.
 */

export type MenuKind = 'food' | 'drink';

export interface MenuItem {
  id: string;
  name: string;
  /** The short description that runs under the name on a printed menu. */
  note?: string;
  price: number;
  /** Marked in the UI so a table can scan for the obvious orders. */
  signature?: boolean;
  veg?: boolean;
  /** Plates built to be pushed into the middle of the table. */
  shareable?: boolean;
}

export interface MenuSection {
  name: string;
  kind: MenuKind;
  items: MenuItem[];
}

export interface Venue {
  slug: string;
  name: string;
  area: string;
  city: string;
  cuisine: string;
  blurb: string;
  image: string;
  /** 1–4, rendered as ₦ … ₦₦₦₦. */
  priceBand: number;
  /** Typical spend per head, for the "before you go" estimate. */
  typicalPerHead: number;
  serviceChargePct: number;
  vatPct: number;
  sections: MenuSection[];
}

export const VENUES: Venue[] = [
  {
    slug: 'the-terrace',
    name: 'The Terrace',
    area: 'Victoria Island',
    city: 'Lagos',
    cuisine: 'West African · Farm to table',
    blurb:
      'Open-air dining on the upper floor, water views, and a kitchen that treats pepper soup with the seriousness of a stock. The long tables are made for eight.',
    image: '/The Spaces.png',
    priceBand: 3,
    typicalPerHead: 24000,
    serviceChargePct: 10,
    vatPct: 7.5,
    sections: [
      {
        name: 'Small Plates',
        kind: 'food',
        items: [
          { id: 'ter-asun', name: 'Asun Skewers', note: 'scotch bonnet glaze, red onion', price: 8500, signature: true, shareable: true },
          { id: 'ter-dumpling', name: 'Pepper Soup Dumplings', note: 'ukpaka dipping sauce', price: 7500, shareable: true },
          { id: 'ter-akara', name: 'Crab Akara', note: 'mango avocado, pickled cucumber', price: 9500 },
          { id: 'ter-puff', name: 'Puff Puff', note: 'truffle honey, aged parmesan', price: 6000, veg: true, shareable: true },
          { id: 'ter-plantain', name: 'Burnt Plantain', note: 'smoked scotch bonnet crème', price: 5500, veg: true, shareable: true },
        ],
      },
      {
        name: 'Mains',
        kind: 'food',
        items: [
          { id: 'ter-wagyu', name: 'Wagyu Suya', note: 'suya spice rub, tiger nut salsa', price: 32000, signature: true },
          { id: 'ter-bream', name: 'Whole Bream', note: 'jollof-smoked butter, yam purée', price: 26000, shareable: true },
          { id: 'ter-egusi', name: 'Ẹ̀gúsí Risotto', note: 'toasted melon seed, parmesan', price: 18500, veg: true },
          { id: 'ter-oha', name: 'Oha Leaf Pasta', note: 'crayfish, crispy garlic', price: 19500 },
          { id: 'ter-jollof', name: 'Party Jollof', note: 'for the table, bottom-of-the-pot', price: 12000, veg: true, shareable: true },
        ],
      },
      {
        name: 'From the Bar',
        kind: 'drink',
        items: [
          { id: 'ter-negroni', name: 'Convivia Negroni', note: 'palm wine-washed gin', price: 9000, signature: true },
          { id: 'ter-sour', name: 'Lagos Sour', note: 'Nigerian rum, tamarind, lime', price: 8500 },
          { id: 'ter-zobo', name: 'Zobo Smash', note: 'hibiscus gin, mint, cucumber', price: 8000 },
          { id: 'ter-24', name: 'The 24', note: 'daily-changing, ask the bar', price: 9500 },
          { id: 'ter-wine', name: 'House Red / White', note: 'by the bottle', price: 28000, shareable: true },
          { id: 'ter-water', name: 'Still or Sparkling', note: 'large bottle', price: 2500, shareable: true },
        ],
      },
    ],
  },
  {
    slug: 'ounje',
    name: 'Ọ̀únjẹ',
    area: 'Yaba',
    city: 'Lagos',
    cuisine: 'Yoruba home cooking',
    blurb:
      'Plastic chairs, enamel bowls, and the best ofada in the city. Cash-cheap and loud — the sort of place a group of six can eat properly for the price of two cocktails elsewhere.',
    image: '/conv1.png',
    priceBand: 1,
    typicalPerHead: 7500,
    serviceChargePct: 0,
    vatPct: 7.5,
    sections: [
      {
        name: 'From the Pot',
        kind: 'food',
        items: [
          { id: 'oun-ofada', name: 'Ofada & Ayamase', note: 'green pepper stew, assorted meat', price: 5500, signature: true },
          { id: 'oun-efo', name: 'Ẹ̀fọ́ Rirọ̀', note: 'with pounded yam', price: 4800 },
          { id: 'oun-egusi', name: 'Ẹ̀gúsí & Eba', note: 'goat meat, stockfish', price: 5200 },
          { id: 'oun-ewa', name: 'Ẹ̀wà Agoyin', note: 'agoyin sauce, agege bread', price: 3000, veg: true },
          { id: 'oun-asaro', name: 'Àsáró', note: 'yam porridge, smoked fish', price: 4200 },
        ],
      },
      {
        name: 'Sides & Extras',
        kind: 'food',
        items: [
          { id: 'oun-goat', name: 'Extra Goat Meat', price: 2500 },
          { id: 'oun-fish', name: 'Grilled Titus', price: 3500 },
          { id: 'oun-dodo', name: 'Dodo', note: 'fried plantain', price: 1500, veg: true, shareable: true },
          { id: 'oun-moi', name: 'Moi Moi', price: 1800, veg: true },
        ],
      },
      {
        name: 'Drinks',
        kind: 'drink',
        items: [
          { id: 'oun-palm', name: 'Fresh Palm Wine', note: 'by the jug', price: 4000, shareable: true, signature: true },
          { id: 'oun-zobo', name: 'Chilled Zobo', price: 1200, veg: true },
          { id: 'oun-malt', name: 'Malt', price: 1500 },
          { id: 'oun-star', name: 'Star / Trophy', note: 'big bottle', price: 2000 },
        ],
      },
    ],
  },
  {
    slug: 'the-lounge',
    name: 'The Lounge',
    area: 'Ikoyi',
    city: 'Lagos',
    cuisine: 'Cocktails · Listening room',
    blurb:
      'Candlelit bar and listening room. Live sets Thursday to Saturday. Bar snacks exist, but nobody comes here for the food — plan the drinks and the ₦ adds up fast.',
    image: '/Convivium.png',
    priceBand: 4,
    typicalPerHead: 32000,
    serviceChargePct: 12.5,
    vatPct: 7.5,
    sections: [
      {
        name: 'Signatures',
        kind: 'drink',
        items: [
          { id: 'lng-smoke', name: 'Smoke & Suya', note: 'mezcal, suya tincture, agave', price: 12000, signature: true },
          { id: 'lng-agbo', name: 'Agbo Old Fashioned', note: 'bitters steeped in agbo herbs', price: 13500, signature: true },
          { id: 'lng-tiger', name: 'Tiger Nut Colada', note: 'kunu aya, aged rum', price: 11000 },
          { id: 'lng-chapman', name: 'Grown Chapman', note: 'the childhood one, with teeth', price: 9500 },
        ],
      },
      {
        name: 'Bottles',
        kind: 'drink',
        items: [
          { id: 'lng-champ', name: 'Champagne', note: 'bottle, for the table', price: 180000, shareable: true },
          { id: 'lng-whisky', name: 'Single Malt', note: '12yr, bottle service', price: 145000, shareable: true },
          { id: 'lng-wine', name: 'Red Burgundy', note: 'bottle', price: 65000, shareable: true },
        ],
      },
      {
        name: 'Bar Snacks',
        kind: 'food',
        items: [
          { id: 'lng-gizzard', name: 'Peppered Gizzard', price: 9000, shareable: true },
          { id: 'lng-nuts', name: 'Spiced Kuli Kuli', price: 4500, veg: true, shareable: true },
          { id: 'lng-slider', name: 'Suya Sliders', note: 'three per order', price: 11500, shareable: true },
        ],
      },
    ],
  },
  {
    slug: 'the-brunch-house',
    name: 'The Brunch House',
    area: 'Lekki Phase 1',
    city: 'Lagos',
    cuisine: 'All-day brunch',
    blurb:
      'Saturday jazz, bottomless mimosas, and the slowest morning of the week. Splits get messy here because half the table drinks and half does not — which is exactly the point.',
    image: '/Homepage2.png',
    priceBand: 2,
    typicalPerHead: 15000,
    serviceChargePct: 10,
    vatPct: 7.5,
    sections: [
      {
        name: 'Plates',
        kind: 'food',
        items: [
          { id: 'brn-shakshuka', name: 'Suya Shakshuka', note: 'two eggs, agege toast', price: 11000, signature: true },
          { id: 'brn-pancake', name: 'Plantain Pancakes', note: 'coconut cream, palm sugar', price: 9500, veg: true },
          { id: 'brn-benedict', name: 'Smoked Fish Benedict', note: 'hollandaise, dodo hash', price: 13000 },
          { id: 'brn-akara', name: 'Akara & Ogi', note: 'the classic, done properly', price: 6500, veg: true },
          { id: 'brn-bowl', name: 'Green Bowl', note: 'ugu, avocado, poached egg', price: 10000, veg: true },
        ],
      },
      {
        name: 'Bottomless',
        kind: 'drink',
        items: [
          { id: 'brn-mimosa', name: 'Bottomless Mimosa', note: '90 minutes, per person', price: 18000, signature: true },
          { id: 'brn-bloody', name: 'Bloody Mary', price: 8000 },
          { id: 'brn-juice', name: 'Cold Press', note: 'pineapple, ginger, mint', price: 4500, veg: true },
          { id: 'brn-coffee', name: 'Flat White', price: 3500, veg: true },
        ],
      },
    ],
  },
];

export function getVenue(slug: string): Venue | undefined {
  return VENUES.find((v) => v.slug === slug);
}

/** Flat lookup across every venue — the split needs prices by item id. */
export function getMenuItem(venue: Venue, itemId: string): MenuItem | undefined {
  for (const section of venue.sections) {
    const hit = section.items.find((i) => i.id === itemId);
    if (hit) return hit;
  }
  return undefined;
}

export function formatNaira(amount: number): string {
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}
