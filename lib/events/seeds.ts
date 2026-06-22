// Launch content for Discover — curated by hand for now, the same shape the
// AI-curation pipeline will write into `curated_events` once it's live.
// getCuratedEvents() in repo.ts prefers real DB rows and falls back to this
// list per city, so the feed is never empty while curation catches up.

export interface CuratedEvent {
  id: string;
  city: string;
  title: string;
  venue: string;
  category: 'nightlife' | 'music' | 'food_drink' | 'culture' | 'comedy' | 'pop_up';
  vibeTags: string[];
  summary: string;
  startsAt: string; // ISO
  priceLabel: string;
  sourceUrl: string | null;
  source: 'manual' | 'ai_curated';
}

function nextWeekday(dayOfWeek: number, hour: number, minute = 0): string {
  const d = new Date();
  const diff = (dayOfWeek - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + (diff === 0 ? 7 : diff));
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const CURATED_EVENT_SEEDS: CuratedEvent[] = [
  {
    id: 'ldn-rooftop-1', city: 'London', title: 'Golden Hour Rooftop Sessions',
    venue: 'Skylark, Shoreditch', category: 'nightlife',
    vibeTags: ['rooftop', 'cocktails', 'house'],
    summary: 'A slow-build rooftop set into sunset — go for the first hour if you want a table.',
    startsAt: nextWeekday(5, 19), priceLabel: 'Free entry, bar tab',
    sourceUrl: null, source: 'ai_curated',
  },
  {
    id: 'ldn-jazz-1', city: 'London', title: 'Late Night Jazz & Natural Wine',
    venue: 'The Crypt, Soho', category: 'music',
    vibeTags: ['live music', 'wine', 'intimate'],
    summary: 'Three-piece trio, candlelit basement, a wine list that turns over weekly — book a table, it fills fast.',
    startsAt: nextWeekday(6, 21), priceLabel: '£12 cover',
    sourceUrl: null, source: 'ai_curated',
  },
  {
    id: 'ldn-comedy-1', city: 'London', title: 'New Material Night',
    venue: 'Backyard Comedy Club', category: 'comedy',
    vibeTags: ['stand-up', 'low-key'],
    summary: 'Working comedians testing new sets before tour — rougher and funnier than the polished show, half the price.',
    startsAt: nextWeekday(4, 20), priceLabel: '£8',
    sourceUrl: null, source: 'manual',
  },
  {
    id: 'nyc-warehouse-1', city: 'New York', title: 'Afterhours: Brooklyn Warehouse',
    venue: 'The Foundry, Bushwick', category: 'nightlife',
    vibeTags: ['techno', 'late', 'dancefloor'],
    summary: 'Runs till 6am, sound system over the lighting rig — come after midnight, it doesn’t get going before.',
    startsAt: nextWeekday(6, 23), priceLabel: '$25 advance',
    sourceUrl: null, source: 'ai_curated',
  },
  {
    id: 'nyc-speakeasy-1', city: 'New York', title: 'Hidden Bar: Back Room at Marlowe’s',
    venue: 'Marlowe’s, Lower East Side', category: 'food_drink',
    vibeTags: ['cocktails', 'speakeasy', 'date night'],
    summary: 'No sign, knock twice — a six-seat bar pouring pre-Prohibition cocktails, ask for the off-menu list.',
    startsAt: nextWeekday(5, 20), priceLabel: '$18 cocktails',
    sourceUrl: null, source: 'ai_curated',
  },
  {
    id: 'nyc-popup-1', city: 'New York', title: 'Supper Club Pop-Up: Strangers’ Table',
    venue: 'Undisclosed loft, Williamsburg', category: 'pop_up',
    vibeTags: ['dinner', 'strangers', 'communal'],
    summary: 'A long table, eight strangers, a chef cooking for the room — address sent the morning of.',
    startsAt: nextWeekday(0, 19), priceLabel: '$85 incl. wine',
    sourceUrl: null, source: 'manual',
  },
  {
    id: 'lis-rooftop-1', city: 'Lisbon', title: 'Sunset to Sunrise: Park Bar',
    venue: 'Park, Bairro Alto', category: 'nightlife',
    vibeTags: ['rooftop', 'sunset', 'low-key'],
    summary: 'Famously hard to find above a car park — get there for sunset, stay for the DJ after dark.',
    startsAt: nextWeekday(5, 18, 30), priceLabel: 'Free entry, bar tab',
    sourceUrl: null, source: 'ai_curated',
  },
  {
    id: 'lis-fado-1', city: 'Lisbon', title: 'Fado Night, No Tourists Allowed (Mostly)',
    venue: 'Tasca do Chico, Bairro Alto', category: 'culture',
    vibeTags: ['live music', 'traditional', 'intimate'],
    summary: 'Unannounced singers walk in off the street and take the floor — arrive by 9 or stand in the doorway.',
    startsAt: nextWeekday(3, 21), priceLabel: 'No cover, cash bar',
    sourceUrl: null, source: 'ai_curated',
  },
  {
    id: 'lis-wine-1', city: 'Lisbon', title: 'Natural Wine & Petiscos Crawl',
    venue: 'Cais do Sodré strip', category: 'food_drink',
    vibeTags: ['wine', 'crawl', 'small plates'],
    summary: 'Four bars, one ticket, a local host who actually knows the winemakers — caps at 12 people.',
    startsAt: nextWeekday(6, 18), priceLabel: '€35 ticket',
    sourceUrl: null, source: 'manual',
  },
];

export function citiesFromSeeds(): string[] {
  return Array.from(new Set(CURATED_EVENT_SEEDS.map((e) => e.city))).sort();
}
