'use client';

/**
 * Moments — the point of the whole thing.
 *
 * A meetup is a plan; a moment is what the plan turned into. A photo, a line
 * about the night, who was there. Moments outlive the bill: the split is
 * housekeeping, this is the reason anyone opened the app.
 *
 * Metadata sits in localStorage next to the meetups. The photos themselves are
 * far too big for that and live in IndexedDB (`lib/moments/photos.ts`), keyed
 * by `photoId`.
 */

import { useSyncExternalStore } from 'react';
import { newId } from '@/lib/meetup/store';
import { deletePhoto } from '@/lib/moments/photos';

export interface Moment {
  id: string;
  /** The meetup this came out of, when it came out of one. */
  meetupId?: string;
  venueSlug?: string;
  /** Free-text place, for a moment posted without a meetup behind it. */
  place?: string;
  caption: string;
  /** Names, not ids — a moment should survive the meetup being deleted. */
  people: string[];
  photoId?: string;
  photoRatio?: number;
  /** ISO timestamp of when the moment happened, which is when it was posted. */
  at: string;
  /** Reactions from the table. Emoji → count, since there are no accounts yet. */
  reactions: Record<string, number>;
}

const KEY = 'convivia24.moments.v1';

/* ── persistence ─────────────────────────────────────────────────────── */

let cache: Moment[] | null = null;
const listeners = new Set<() => void>();

function read(): Moment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Moment[];
    const seeded = seedMoments();
    window.localStorage.setItem(KEY, JSON.stringify(seeded));
    return seeded;
  } catch {
    return [];
  }
}

function write(moments: Moment[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(moments));
  } catch {
    /* private browsing or quota — the session still works */
  }
  cache = moments;
  listeners.forEach((l) => l());
}

function snapshot(): Moment[] {
  if (cache === null) cache = read();
  return cache;
}

const EMPTY: Moment[] = [];

export function useMoments(): Moment[] {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    snapshot,
    () => EMPTY,
  );
}

/** Newest first — a feed only ever reads one way. */
export function useFeed(): Moment[] {
  return [...useMoments()].sort((a, b) => b.at.localeCompare(a.at));
}

export function useMomentsFor(meetupId: string): Moment[] {
  return useFeed().filter((m) => m.meetupId === meetupId);
}

/* ── mutations ───────────────────────────────────────────────────────── */

export function addMoment(input: Omit<Moment, 'id' | 'at' | 'reactions'> & { at?: string }): Moment {
  const moment: Moment = {
    ...input,
    id: newId('mo'),
    at: input.at ?? new Date().toISOString(),
    reactions: {},
  };
  write([moment, ...snapshot()]);
  return moment;
}

export function removeMoment(id: string) {
  const moment = snapshot().find((m) => m.id === id);
  if (moment?.photoId) void deletePhoto(moment.photoId);
  write(snapshot().filter((m) => m.id !== id));
}

/** Tapping an emoji you already gave takes it back. */
export function toggleReaction(id: string, emoji: string) {
  write(
    snapshot().map((m) => {
      if (m.id !== id) return m;
      const next = { ...m.reactions };
      if (next[emoji]) delete next[emoji];
      else next[emoji] = 1;
      return { ...m, reactions: next };
    }),
  );
}

export const REACTIONS = ['🔥', '😂', '🥂', '❤️', '👏'] as const;

/* ── first-run seed ──────────────────────────────────────────────────── */

/** A feed with something in it, so the idea reads on first open. */
function seedMoments(): Moment[] {
  const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

  return [
    {
      id: 'mo_seed_1',
      venueSlug: 'the-terrace',
      caption:
        'Amara ordered the wagyu suya “for the table” and then ate most of it. Noted for next time.',
      people: ['Amara', 'Tobi', 'Kene'],
      at: hoursAgo(20),
      reactions: { '😂': 1 },
    },
    {
      id: 'mo_seed_2',
      venueSlug: 'ounje',
      caption:
        'Six of us, one jug of palm wine, ₦6,200 each. The best value night out in Lagos and I will not be taking questions.',
      people: ['Tobi', 'Kene', 'Ifeoma'],
      at: hoursAgo(52),
      reactions: { '🔥': 1, '🥂': 1 },
    },
    {
      id: 'mo_seed_3',
      venueSlug: 'the-brunch-house',
      caption: 'Jazz brunch ran four hours. Nobody looked at a phone once.',
      people: ['Amara', 'Seyi'],
      at: hoursAgo(96),
      reactions: { '❤️': 1 },
    },
  ];
}
