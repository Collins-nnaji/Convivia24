/**
 * Open tables.
 *
 * The other half of the idea: not everyone you eat with is already in your
 * phone. An open table is a gathering someone is hosting with room left — a
 * stated vibe, a place, a time, and an honest number for what the evening will
 * cost, so nobody has to guess whether they can afford to say yes.
 *
 * These are seeded rather than fetched. Joining one is real: it creates a local
 * meetup with the table already at it (`joinTable` in `lib/meetup/store.ts`).
 */

import { getVenue, type Venue } from '@/lib/dining/venues';

export interface OpenTable {
  id: string;
  title: string;
  /** One line on what kind of evening this is — the thing people actually pick on. */
  vibe: string;
  host: string;
  hostNote: string;
  venueSlug: string;
  /** Days from today, so the seed never goes stale. */
  inDays: number;
  time: string;
  seats: number;
  taken: number;
  /** Names already at the table. */
  going: string[];
  tags: string[];
  /** Rough spend per head the host is setting expectations at. */
  budgetGuide: number;
}

export const OPEN_TABLES: OpenTable[] = [
  {
    id: 'ot_sunday_long',
    title: 'The Long Sunday',
    vibe: 'One table, four hours, nobody checks their phone.',
    host: 'Amara',
    hostNote:
      'I do this most months. Bring an appetite and a story. We order for the table and split it evenly — no maths at the end.',
    venueSlug: 'the-brunch-house',
    inDays: 3,
    time: '13:00',
    seats: 8,
    taken: 5,
    going: ['Amara', 'Seyi', 'Kene', 'Ifeoma', 'Bode'],
    tags: ['Brunch', 'Slow', 'New faces welcome'],
    budgetGuide: 18000,
  },
  {
    id: 'ot_first_friday',
    title: 'First Friday',
    vibe: 'Loud, cheap, excellent. The ofada is the whole reason.',
    host: 'Tobi',
    hostNote:
      'Plastic chairs and enamel bowls. Come straight from work. Everyone pays for what they ate — it usually lands under ₦8k.',
    venueSlug: 'ounje',
    inDays: 5,
    time: '18:30',
    seats: 10,
    taken: 4,
    going: ['Tobi', 'Chidi', 'Nkechi', 'Femi'],
    tags: ['After work', 'Cheap', 'Loud'],
    budgetGuide: 8000,
  },
  {
    id: 'ot_listening_room',
    title: 'Listening Room',
    vibe: 'Live set, low light, conversation that goes somewhere.',
    host: 'Kene',
    hostNote:
      'Six of us, a bottle in the middle, and a set that starts at nine. It is not a cheap night — say so now if that is not your week.',
    venueSlug: 'the-lounge',
    inDays: 8,
    time: '21:00',
    seats: 6,
    taken: 4,
    going: ['Kene', 'Amara', 'Zainab', 'Uche'],
    tags: ['Live music', 'Late', 'Splurge'],
    budgetGuide: 35000,
  },
  {
    id: 'ot_new_in_town',
    title: 'New in Town',
    vibe: 'For people who just moved and know nobody yet.',
    host: 'Ifeoma',
    hostNote:
      'I moved here in January and ate alone for a month. This is the table I wish had existed. Come on your own — most people do.',
    venueSlug: 'the-terrace',
    inDays: 11,
    time: '19:00',
    seats: 12,
    taken: 7,
    going: ['Ifeoma', 'Bode', 'Zainab', 'Seyi', 'Uche', 'Chidi', 'Nkechi'],
    tags: ['New faces welcome', 'Come alone', 'Big table'],
    budgetGuide: 25000,
  },
];

export function getTable(id: string): OpenTable | undefined {
  return OPEN_TABLES.find((t) => t.id === id);
}

export function tableVenue(table: OpenTable): Venue | undefined {
  return getVenue(table.venueSlug);
}

export function seatsLeft(table: OpenTable): number {
  return Math.max(0, table.seats - table.taken);
}

/** Resolves `inDays` against today so a seeded table is always in the future. */
export function tableDate(table: OpenTable): Date {
  const d = new Date();
  d.setDate(d.getDate() + table.inDays);
  const [h, m] = table.time.split(':').map(Number);
  d.setHours(h ?? 19, m ?? 0, 0, 0);
  return d;
}

export function tableDateKey(table: OpenTable): string {
  const d = tableDate(table);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** All the tags across every table, for the discover filter row. */
export function allTags(): string[] {
  return [...new Set(OPEN_TABLES.flatMap((t) => t.tags))];
}
