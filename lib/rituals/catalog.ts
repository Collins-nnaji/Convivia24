export type AbvTrack = 'spirit' | 'zero' | 'mixed';
export type RitualMood = 'restore' | 'gather' | 'celebrate' | 'focus' | 'late-night';

export type KitItem = {
  name: string;
  role: string;
  abv: 'spirit' | 'zero' | 'mixer';
  canSwapTo?: string;
};

export type RitualKit = {
  slug: string;
  name: string;
  tagline: string;
  story: string;
  mood: RitualMood;
  timeOfDay: string;
  serves: number;
  track: AbvTrack;
  priceNgn: number;
  image: string;
  playlistCue: string;
  serveSteps: string[];
  snackPairing?: string;
  glassware: string;
  items: KitItem[];
  zeroProofAlt?: string;
  featured?: boolean;
  shipsTo: 'lagos';
};

export const MOOD_LABELS: Record<RitualMood, string> = {
  restore: 'Restore',
  gather: 'Gather',
  celebrate: 'Celebrate',
  focus: 'Focus',
  'late-night': 'Late Night',
};

export const TRACK_LABELS: Record<AbvTrack, string> = {
  spirit: 'Spirit',
  zero: 'Zero-proof',
  mixed: 'Mixed table',
};

export const RITUAL_KITS: RitualKit[] = [
  {
    slug: 'sunday-restore',
    name: 'Sunday Restore',
    tagline: 'Slow pours after a loud week.',
    story:
      'Hibiscus, ginger, and a quiet spirit track for the afternoon when the city finally exhales. Built for two — or one, unhurried.',
    mood: 'restore',
    timeOfDay: 'Afternoon → dusk',
    serves: 2,
    track: 'mixed',
    priceNgn: 48500,
    image: '/Homepage2.png',
    playlistCue: 'Warm jazz, low volume. No lyrics until sunset.',
    serveSteps: [
      'Chill the hibiscus cordial 20 minutes.',
      'Build over ice: cordial, ginger, citrus.',
      'Spirit track: float the palm-washed gin. Zero track: skip the float, add soda.',
      'Serve with the citrus salt rim only on the first round.',
    ],
    snackPairing: 'Plantain chips · roasted groundnuts',
    glassware: 'Two rocks glasses',
    items: [
      { name: 'Palm-washed gin mini', role: 'Spirit float', abv: 'spirit', canSwapTo: 'Omit for zero-proof' },
      { name: 'House zobo cordial', role: 'Base', abv: 'zero' },
      { name: 'Ginger-citrus mixer', role: 'Lengthener', abv: 'mixer' },
    ],
    zeroProofAlt: 'Omit the gin float — the cordial carries the ritual.',
    featured: true,
    shipsTo: 'lagos',
  },
  {
    slug: 'late-night-terrace',
    name: 'Late Night Terrace',
    tagline: 'The kitchen is closed. The bar is not.',
    story:
      'A Lagos Sour kit for the hours after dinner — rum depth, tamarind bite, lime bright enough to keep the conversation going.',
    mood: 'late-night',
    timeOfDay: '11pm → 2am',
    serves: 4,
    track: 'spirit',
    priceNgn: 72000,
    image: '/conv1.png',
    playlistCue: 'Afro-house, mid-tempo. Lights low.',
    serveSteps: [
      'Shake rum, tamarind syrup, and lime hard with ice.',
      'Double-strain into chilled coupe or rocks.',
      'Dash bitters. Garnish with dehydrated lime.',
      'Batch the second round before the first is empty.',
    ],
    snackPairing: 'Peppered suya bites · dark chocolate',
    glassware: 'Four coupes or rocks glasses',
    items: [
      { name: 'Nigerian rum', role: 'Base spirit', abv: 'spirit', canSwapTo: 'Zero rum alternative' },
      { name: 'Tamarind sour syrup', role: 'Sweet-acid', abv: 'mixer' },
      { name: 'House bitters + lime', role: 'Finish', abv: 'mixer' },
    ],
    zeroProofAlt: 'Swap rum for the zero rum — same shake, same glass.',
    featured: true,
    shipsTo: 'lagos',
  },
  {
    slug: 'convivia-dinner-for-four',
    name: 'Convivia Dinner for 4',
    tagline: 'One table. One evening. Shipped.',
    story:
      'The monthly Convivia Dinner, distilled into a host kit: aperitif, table wine alternative or spirit pour, and a zero-proof lane so every seat is equal.',
    mood: 'gather',
    timeOfDay: 'Dinner',
    serves: 4,
    track: 'mixed',
    priceNgn: 145000,
    image: '/Convivium.png',
    playlistCue: 'Soft highlife into neo-soul. Conversation volume wins.',
    serveSteps: [
      'Open with the aperitif while guests arrive.',
      'Move to the table pour with the first course.',
      'Keep zero-proof glasses filled on the same rhythm — never as an afterthought.',
      'Close with The 24 mini: one shared pour or NA nightcap.',
    ],
    snackPairing: 'Charcuterie-adjacent: asun skewers energy, fruit, cheese',
    glassware: 'Stemware for 4 + rocks for nightcap',
    items: [
      { name: 'Aperitif set (spirit + zero)', role: 'Welcome', abv: 'spirit', canSwapTo: 'All-zero aperitif' },
      { name: 'Table pour', role: 'Dinner companion', abv: 'spirit' },
      { name: 'The 24 nightcap mini', role: 'Close', abv: 'mixer' },
    ],
    featured: true,
    shipsTo: 'lagos',
  },
  {
    slug: 'focus-afternoon',
    name: 'Focus Afternoon',
    tagline: 'Clarity without the crash.',
    story:
      'Zero-proof by design. Green citrus, bitter botanicals, and a ritual that marks deep work — not a mocktail apology.',
    mood: 'focus',
    timeOfDay: 'Late morning → afternoon',
    serves: 1,
    track: 'zero',
    priceNgn: 28000,
    image: '/The Spaces3.png',
    playlistCue: 'Instrumental only. One album, no shuffle.',
    serveSteps: [
      'Build tall over ice: botanical tonic, citrus, pinch of salt.',
      'Stir once. No garnish theatre — this is a tool.',
      'Drink at the start of a 90-minute block.',
    ],
    glassware: 'One highball',
    items: [
      { name: 'Botanical zero spirit', role: 'Base', abv: 'zero' },
      { name: 'Citrus-tonic lengthener', role: 'Build', abv: 'mixer' },
    ],
    shipsTo: 'lagos',
  },
  {
    slug: 'the-24-tonight',
    name: 'The 24 — Tonight',
    tagline: 'The daily cocktail, shipped for your bar.',
    story:
      'Whatever The 24 is pouring this week at the lounge — a rotating house recipe with spirit and zero tracks, so you can keep the ritual at home.',
    mood: 'celebrate',
    timeOfDay: 'Golden hour',
    serves: 2,
    track: 'mixed',
    priceNgn: 52000,
    image: '/Convivium2.png',
    playlistCue: 'Whatever the lounge is playing Thursday.',
    serveSteps: [
      'Follow the sealed recipe card for this week’s build.',
      'Spirit and zero versions share the same glass and garnish.',
      'Make two. One for you, one for the person across from you.',
    ],
    snackPairing: 'Whatever is in the fridge — this ritual is flexible',
    glassware: 'Two Nick & Nora or coupe',
    items: [
      { name: 'Weekly The 24 spirit base', role: 'Core', abv: 'spirit', canSwapTo: 'Weekly zero base' },
      { name: 'House modifiers', role: 'Balance', abv: 'mixer' },
    ],
    featured: true,
    shipsTo: 'lagos',
  },
  {
    slug: 'palm-negroni-evening',
    name: 'Palm Negroni Evening',
    tagline: 'Our signature, for two.',
    story:
      'Palm wine–washed gin, bitter orange, and the slow bitterness of a proper Negroni. Equal respect for the zero-proof twin in the box.',
    mood: 'celebrate',
    timeOfDay: 'Evening',
    serves: 2,
    track: 'spirit',
    priceNgn: 61000,
    image: '/The Spaces.png',
    playlistCue: 'Something Italian-adjacent meeting Lagos — unexpected, correct.',
    serveSteps: [
      'Stir spirit (or zero) with bitter and vermouth over ice.',
      'Strain into rocks over a large cube.',
      'Orange peel expressed over the glass.',
    ],
    glassware: 'Two rocks glasses · large cubes',
    items: [
      { name: 'Palm-washed gin', role: 'Base', abv: 'spirit', canSwapTo: 'Zero Negroni base' },
      { name: 'Bitter + vermouth set', role: 'Structure', abv: 'mixer' },
    ],
    zeroProofAlt: 'Use the zero Negroni base — same stir, same peel.',
    shipsTo: 'lagos',
  },
  {
    slug: 'gather-for-six',
    name: 'Gather for 6',
    tagline: 'The bar for the night, one tap.',
    story:
      'Hosting without the bottle-shop panic. A mixed table kit sized for six: welcome pours, a batchable punch, and zero-proof that looks like it belongs.',
    mood: 'gather',
    timeOfDay: 'Evening gathering',
    serves: 6,
    track: 'mixed',
    priceNgn: 168000,
    image: '/Convivium3.png',
    playlistCue: 'Start warm, end danceable. You know your people.',
    serveSteps: [
      'Set welcome pours at the door.',
      'Batch the punch in the provided vessel before guests arrive.',
      'Keep zero-proof punch beside spirit punch — twin bowls, twin ladles.',
      'Replenish ice once, mid-evening.',
    ],
    snackPairing: 'Finger food that survives a crowd',
    glassware: 'Punch cups or rocks for 6+',
    items: [
      { name: 'Welcome aperitif duo', role: 'Door', abv: 'spirit' },
      { name: 'Batch punch concentrate', role: 'Centrepiece', abv: 'mixer' },
      { name: 'Zero punch twin', role: 'Equal seat', abv: 'zero' },
    ],
    shipsTo: 'lagos',
  },
  {
    slug: 'restore-solo',
    name: 'Restore — Solo',
    tagline: 'One chair. One pour. Done.',
    story:
      'A single-serve unwind kit for the night you cancelled everything. Soft botanicals, optional spirit, no performance.',
    mood: 'restore',
    timeOfDay: 'Night',
    serves: 1,
    track: 'zero',
    priceNgn: 22000,
    image: '/The Spaces2.png',
    playlistCue: 'Silence, or rain sounds. Your call.',
    serveSteps: [
      'Warm the cup if you want heat; ice if you want cold.',
      'Build simply. Sit down before the first sip.',
    ],
    glassware: 'One favourite mug or rocks glass',
    items: [
      { name: 'Restore botanical blend', role: 'Base', abv: 'zero' },
      { name: 'Optional spirit dram', role: 'Float', abv: 'spirit', canSwapTo: 'Leave sealed' },
    ],
    shipsTo: 'lagos',
  },
];

export function getRitualBySlug(slug: string): RitualKit | undefined {
  return RITUAL_KITS.find((k) => k.slug === slug);
}

export function formatNgn(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function filterRituals(opts: {
  mood?: RitualMood | 'all';
  track?: AbvTrack | 'all';
}): RitualKit[] {
  return RITUAL_KITS.filter((k) => {
    if (opts.mood && opts.mood !== 'all' && k.mood !== opts.mood) return false;
    if (opts.track && opts.track !== 'all' && k.track !== opts.track) return false;
    return true;
  });
}
