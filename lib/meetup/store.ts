'use client';

/**
 * Meetups live in the browser.
 *
 * There is no account, no server round-trip and no payment rail — a table
 * plans in one place and settles at the till, exactly as it always has. Swap
 * the four `read`/`write` calls below for API routes when meetups need to be
 * shared across devices.
 */

import { useSyncExternalStore } from 'react';
import type { Attendee, OrderLine } from '@/lib/split/compute';

export interface Meetup {
  id: string;
  title: string;
  venueSlug: string;
  /** yyyy-mm-dd */
  date: string;
  /** HH:mm, 24h */
  time: string;
  note: string;
  attendees: Attendee[];
  lines: OrderLine[];
  tipPct: number;
  createdAt: string;
}

const KEY = 'convivia24.meetups.v2';

export function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/* ── persistence ─────────────────────────────────────────────────────── */

function read(): Meetup[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Meetup[];
    const seeded = seedMeetups();
    window.localStorage.setItem(KEY, JSON.stringify(seeded));
    return seeded;
  } catch {
    return [];
  }
}

function write(meetups: Meetup[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(meetups));
  } catch {
    /* private browsing, quota — the session still works, it just won't persist */
  }
  cache = meetups;
  listeners.forEach((l) => l());
}

/* ── subscription ────────────────────────────────────────────────────── */

let cache: Meetup[] | null = null;
const listeners = new Set<() => void>();

function snapshot(): Meetup[] {
  if (cache === null) cache = read();
  return cache;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Reads are client-only; the server renders the empty state. */
const EMPTY: Meetup[] = [];

export function useMeetups(): Meetup[] {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}

export function useMeetup(id: string): Meetup | undefined {
  return useMeetups().find((m) => m.id === id);
}

/* ── mutations ───────────────────────────────────────────────────────── */

export function createMeetup(input: Omit<Meetup, 'id' | 'createdAt' | 'lines'>): Meetup {
  const meetup: Meetup = {
    ...input,
    id: newId('mt'),
    lines: [],
    createdAt: new Date().toISOString(),
  };
  write([meetup, ...snapshot()]);
  return meetup;
}

export function updateMeetup(id: string, patch: (m: Meetup) => Meetup) {
  write(snapshot().map((m) => (m.id === id ? patch(m) : m)));
}

export function deleteMeetup(id: string) {
  write(snapshot().filter((m) => m.id !== id));
}

export function addAttendee(meetupId: string, name: string, budget?: number) {
  const attendee: Attendee = { id: newId('p'), name, budget };
  updateMeetup(meetupId, (m) => ({ ...m, attendees: [...m.attendees, attendee] }));
}

export function updateAttendee(meetupId: string, attendeeId: string, patch: Partial<Attendee>) {
  updateMeetup(meetupId, (m) => ({
    ...m,
    attendees: m.attendees.map((a) => (a.id === attendeeId ? { ...a, ...patch } : a)),
  }));
}

/** Removing someone also drops them off every line they were carrying. */
export function removeAttendee(meetupId: string, attendeeId: string) {
  updateMeetup(meetupId, (m) => {
    const lines = m.lines
      .map((l) => ({ ...l, payerIds: l.payerIds.filter((id) => id !== attendeeId) }))
      .filter((l) => l.payerIds.length > 0);
    return { ...m, attendees: m.attendees.filter((a) => a.id !== attendeeId), lines };
  });
}

/**
 * Ordering the same item for the same set of people bumps the quantity rather
 * than stacking duplicate lines.
 */
export function addLine(meetupId: string, itemId: string, payerIds: string[], qty = 1) {
  if (payerIds.length === 0) return;
  updateMeetup(meetupId, (m) => {
    const key = [...payerIds].sort().join(',');
    const existing = m.lines.find(
      (l) => l.itemId === itemId && [...l.payerIds].sort().join(',') === key,
    );
    if (existing) {
      return {
        ...m,
        lines: m.lines.map((l) => (l.id === existing.id ? { ...l, qty: l.qty + qty } : l)),
      };
    }
    const line: OrderLine = { id: newId('ln'), itemId, qty, payerIds };
    return { ...m, lines: [...m.lines, line] };
  });
}

export function setLineQty(meetupId: string, lineId: string, qty: number) {
  updateMeetup(meetupId, (m) => ({
    ...m,
    lines: qty <= 0 ? m.lines.filter((l) => l.id !== lineId)
                    : m.lines.map((l) => (l.id === lineId ? { ...l, qty } : l)),
  }));
}

export function setLinePayers(meetupId: string, lineId: string, payerIds: string[]) {
  if (payerIds.length === 0) return;
  updateMeetup(meetupId, (m) => ({
    ...m,
    lines: m.lines.map((l) => (l.id === lineId ? { ...l, payerIds } : l)),
  }));
}

export function removeLine(meetupId: string, lineId: string) {
  updateMeetup(meetupId, (m) => ({ ...m, lines: m.lines.filter((l) => l.id !== lineId) }));
}

export function setTip(meetupId: string, tipPct: number) {
  updateMeetup(meetupId, (m) => ({ ...m, tipPct }));
}

/* ── first-run seed ──────────────────────────────────────────────────── */

/** One worked example, so an empty install still shows the idea. */
function seedMeetups(): Meetup[] {
  const friday = new Date();
  friday.setDate(friday.getDate() + ((5 - friday.getDay() + 7) % 7 || 7));

  const me = { id: 'p_seed_you', name: 'You', budget: 40000 };
  const tobi = { id: 'p_seed_tobi', name: 'Tobi', budget: 25000 };
  const amara = { id: 'p_seed_amara', name: 'Amara', budget: 60000 };
  const kene = { id: 'p_seed_kene', name: 'Kene' };
  const table = [me.id, tobi.id, amara.id, kene.id];

  return [
    {
      id: 'mt_seed',
      title: 'Friday, properly',
      venueSlug: 'the-terrace',
      date: friday.toISOString().slice(0, 10),
      time: '19:30',
      note: 'Booked under Amara. Table by the rail.',
      attendees: [me, tobi, amara, kene],
      tipPct: 0,
      createdAt: new Date().toISOString(),
      lines: [
        { id: 'ln_seed_1', itemId: 'ter-asun', qty: 2, payerIds: table },
        { id: 'ln_seed_2', itemId: 'ter-puff', qty: 1, payerIds: table },
        { id: 'ln_seed_3', itemId: 'ter-wagyu', qty: 1, payerIds: [amara.id] },
        { id: 'ln_seed_4', itemId: 'ter-bream', qty: 1, payerIds: [me.id, kene.id] },
        { id: 'ln_seed_5', itemId: 'ter-egusi', qty: 1, payerIds: [tobi.id] },
        { id: 'ln_seed_6', itemId: 'ter-negroni', qty: 1, payerIds: [me.id] },
        { id: 'ln_seed_7', itemId: 'ter-zobo', qty: 1, payerIds: [tobi.id] },
        { id: 'ln_seed_8', itemId: 'ter-wine', qty: 1, payerIds: [amara.id, kene.id] },
      ],
    },
  ];
}
