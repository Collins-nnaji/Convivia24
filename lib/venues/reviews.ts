import { getVenue } from '@/lib/venues/catalog';

export type VenueReview = {
  id: string;
  venueSlug: string;
  author: string;
  rating: number;
  body: string;
  at: string;
  local?: boolean;
};

const SEED: VenueReview[] = [
  {
    id: 'r1',
    venueSlug: 'lumen-lounge',
    author: 'Ada',
    rating: 5,
    body: 'Skyline tables actually get the bottles you ordered. Door knew the card.',
    at: '2026-08-10',
  },
  {
    id: 'r2',
    venueSlug: 'lumen-lounge',
    author: 'Tunde',
    rating: 4,
    body: 'Thursdays are the move. Lift queue is real without the card.',
    at: '2026-08-08',
  },
  {
    id: 'r3',
    venueSlug: 'harbour-house',
    author: 'Chioma',
    rating: 5,
    body: 'Late room still hits. Booth restock from Convivia landed before 1.',
    at: '2026-08-12',
  },
  {
    id: 'r4',
    venueSlug: 'harbour-house',
    author: 'Emeka',
    rating: 4,
    body: 'Loud, tight, worth it. Guest list for Resident cards is not a rumour.',
    at: '2026-08-03',
  },
  {
    id: 'r5',
    venueSlug: 'terrace-14',
    author: 'Zainab',
    rating: 5,
    body: 'Golden hour on Admiralty. Mixer flight perk is the quiet win.',
    at: '2026-08-14',
  },
  {
    id: 'r6',
    venueSlug: 'terrace-14',
    author: 'Fola',
    rating: 4,
    body: 'Booths fill by 8. Order the pack before you sit.',
    at: '2026-08-01',
  },
  {
    id: 'r7',
    venueSlug: 'afterlight',
    author: 'Kemi',
    rating: 5,
    body: 'GRA does not sleep. Door credit on the card paid for itself.',
    at: '2026-08-09',
  },
  {
    id: 'r8',
    venueSlug: 'palm-court',
    author: 'David',
    rating: 5,
    body: 'Dinner that became a night. Two-top perk is why we keep the card.',
    at: '2026-08-11',
  },
  {
    id: 'r9',
    venueSlug: 'fifth-floor',
    author: 'Seyi',
    rating: 4,
    body: 'Best mainland sunset right now. Cover is light if you arrive early.',
    at: '2026-08-13',
  },
  {
    id: 'r10',
    venueSlug: 'saltwater',
    author: 'Amaka',
    rating: 5,
    body: 'Cabanas, sand, Party Packs. Sundays are the whole point.',
    at: '2026-08-03',
  },
  {
    id: 'r11',
    venueSlug: 'naija-house',
    author: 'Uche',
    rating: 5,
    body: 'Live room, honest bar. Bar credit is better than a fake VIP stamp.',
    at: '2026-08-07',
  },
  {
    id: 'r12',
    venueSlug: 'copper-bar',
    author: 'Ngozi',
    rating: 4,
    body: 'Midweek whisky done properly. Quiet enough to hear yourself.',
    at: '2026-08-05',
  },
];

const KEY = 'convivia_venue_reviews';

function loadLocal(): VenueReview[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as VenueReview[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocal(rows: VenueReview[]) {
  localStorage.setItem(KEY, JSON.stringify(rows));
}

export function reviewsForVenue(slug: string): VenueReview[] {
  const local = loadLocal().filter((r) => r.venueSlug === slug);
  return [...local, ...SEED.filter((r) => r.venueSlug === slug)].sort((a, b) => b.at.localeCompare(a.at));
}

export function venueRating(slug: string): { avg: number; count: number } {
  const rows = reviewsForVenue(slug);
  if (rows.length === 0) return { avg: 0, count: 0 };
  const avg = rows.reduce((n, r) => n + r.rating, 0) / rows.length;
  return { avg: Math.round(avg * 10) / 10, count: rows.length };
}

export function addReview(input: { venueSlug: string; author: string; rating: number; body: string }): VenueReview | null {
  if (!getVenue(input.venueSlug)) return null;
  const review: VenueReview = {
    id: `local_${Date.now().toString(36)}`,
    venueSlug: input.venueSlug,
    author: input.author.trim() || 'Guest',
    rating: Math.min(5, Math.max(1, Math.round(input.rating))),
    body: input.body.trim(),
    at: new Date().toISOString().slice(0, 10),
    local: true,
  };
  if (!review.body) return null;
  const all = loadLocal();
  all.unshift(review);
  saveLocal(all);
  return review;
}
