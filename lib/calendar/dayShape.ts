// Pure "shape of the day" logic for the My 24 cockpit — no AI, no React.

import type { CalendarItem } from '@/lib/calendar/buffers';

export type EnergyType = 'rest' | 'work' | 'social' | 'open';

/** Buckets a calendar item into a broad "energy type" for the day-shape arc. */
export function classifyEnergy(item: CalendarItem): EnergyType {
  if (item.is_rest_block) return 'rest';
  if (item.kind === 'gathering') return 'social';
  return 'work';
}

function activeSorted(items: CalendarItem[]): CalendarItem[] {
  return items
    .filter((i) => i.status === 'active')
    .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at));
}

/** The item covering `now`, if any. */
export function findCurrentItem(items: CalendarItem[], now: Date): CalendarItem | null {
  const t = +now;
  return activeSorted(items).find((i) => +new Date(i.starts_at) <= t && t < +new Date(i.ends_at)) ?? null;
}

/** Up to `count` items starting at/after `now`. */
export function upcomingItems(items: CalendarItem[], now: Date, count: number): CalendarItem[] {
  const t = +now;
  return activeSorted(items).filter((i) => +new Date(i.starts_at) >= t).slice(0, count);
}

const MS_PER_MIN = 60000;

/**
 * The next open gap of at least `minMinutes`, scanning from `now` to `dayEnd`
 * across the spaces between (and after) already-scheduled items.
 */
export function findNextGap(
  items: CalendarItem[],
  now: Date,
  dayEnd: Date,
  minMinutes: number,
): { starts_at: string; ends_at: string } | null {
  const busy = activeSorted(items).filter((i) => +new Date(i.ends_at) > +now);
  let cursor = +now;
  for (const item of busy) {
    if (cursor >= +dayEnd) break;
    const itemStart = Math.min(+new Date(item.starts_at), +dayEnd);
    if (itemStart > cursor && (itemStart - cursor) / MS_PER_MIN >= minMinutes) {
      return { starts_at: new Date(cursor).toISOString(), ends_at: new Date(itemStart).toISOString() };
    }
    cursor = Math.max(cursor, +new Date(item.ends_at));
  }
  if (+dayEnd > cursor && (+dayEnd - cursor) / MS_PER_MIN >= minMinutes) {
    return { starts_at: new Date(cursor).toISOString(), ends_at: dayEnd.toISOString() };
  }
  return null;
}

/** "1h 30m" / "45m" style duration label. */
export function formatMinutes(mins: number): string {
  const m = Math.max(0, Math.round(mins));
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}
