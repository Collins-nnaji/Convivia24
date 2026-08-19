import { getVenue, type Venue } from '@/lib/venues/catalog';

export type EventTag = 'Rooftop' | 'Club' | 'Lounge' | 'Dining' | 'Beach' | 'Live' | 'Whisky';

export const EVENT_TAGS: EventTag[] = ['Rooftop', 'Club', 'Lounge', 'Dining', 'Beach', 'Live', 'Whisky'];

export type NightEvent = {
  id: string;
  title: string;
  venueSlug: string;
  offsetDays?: number;
  startHour?: number;
  endHour?: number;
  startsAtIso?: string;
  endsAtIso?: string;
  tag: EventTag;
  blurb: string;
  expected: string;
  coverNgn?: number;
  source?: 'seed' | 'admin';
};

export type VenueSnapshot = {
  slug: string;
  name: string;
  kind: string;
  areaId: string;
  area: string;
  address: string;
  lat: number;
  lng: number;
  tagline: string;
  cardPerk: string;
  photoUrl?: string | null;
};

export type ResolvedEvent = NightEvent & {
  startsAt: Date;
  endsAt: Date;
  venue: VenueSnapshot;
};

function venueToSnapshot(v: Venue): VenueSnapshot {
  return {
    slug: v.slug,
    name: v.name,
    kind: v.kind,
    areaId: v.areaId,
    area: v.area,
    address: v.address,
    lat: v.lat,
    lng: v.lng,
    tagline: v.tagline,
    cardPerk: v.cardPerk,
  };
}

const RAW: NightEvent[] = [
  { id: 'lumen-thursdays', title: 'Lumen Thursdays', venueSlug: 'lumen-lounge', offsetDays: 0, startHour: 21, endHour: 2, tag: 'Rooftop', blurb: 'Resident selectors, bottle tables, VI skyline. Cardholders skip the lift queue.', expected: '~180 in', coverNgn: 15000 },
  { id: 'harbour-late', title: 'Harbour Late', venueSlug: 'harbour-house', offsetDays: 1, startHour: 23, endHour: 5, tag: 'Club', blurb: 'Main floor until the lights come up. Drop bottles to the booth before midnight.', expected: '~320 in', coverNgn: 20000 },
  { id: 'terrace-golden', title: 'Golden Hour · Terrace 14', venueSlug: 'terrace-14', offsetDays: 0, startHour: 17, endHour: 22, tag: 'Lounge', blurb: 'Admiralty terrace from 5. Tequila tables, then the room gets louder.', expected: '~90 in', coverNgn: 10000 },
  { id: 'afterlight-gra', title: 'Afterlight GRA', venueSlug: 'afterlight', offsetDays: 2, startHour: 22, endHour: 4, tag: 'Club', blurb: "Ikeja's Saturday room. Mainland first, VI later if you still have legs.", expected: '~250 in', coverNgn: 8000 },
  { id: 'palm-supper', title: 'Palm Court Supper', venueSlug: 'palm-court', offsetDays: 1, startHour: 19, endHour: 23, tag: 'Dining', blurb: 'Ikoyi courtyard dinner that becomes Cognac. Cardholders: two-top before 8.', expected: '~60 seats' },
  { id: 'fifth-sunset', title: 'Sunset on Five', venueSlug: 'fifth-floor', offsetDays: 0, startHour: 16, endHour: 21, tag: 'Rooftop', blurb: 'Yaba golden hour. Canned cocktails, then whoever is still standing moves.', expected: '~110 in', coverNgn: 5000 },
  { id: 'saltwater-sunday', title: 'Saltwater Sundays', venueSlug: 'saltwater', offsetDays: 3, startHour: 13, endHour: 21, tag: 'Beach', blurb: 'Elegushi stretch, cabanas, Party Packs in the sand. Afterparty listed at 9.', expected: '~200 in', coverNgn: 12000 },
  { id: 'naija-live', title: 'Live at Naija House', venueSlug: 'naija-house', offsetDays: 2, startHour: 20, endHour: 1, tag: 'Live', blurb: 'Surulere live set. No velvet rope — just a room that sings back.', expected: '~140 in', coverNgn: 4000 },
  { id: 'copper-midweek', title: 'Copper Midweek', venueSlug: 'copper-bar', offsetDays: 4, startHour: 18, endHour: 23, tag: 'Whisky', blurb: 'Maryland whisky night. Soft booths, member-rate flights.', expected: '~40 in' },
  { id: 'lumen-sunday', title: 'Lumen Sundays', venueSlug: 'lumen-lounge', offsetDays: 3, startHour: 18, endHour: 0, tag: 'Rooftop', blurb: 'Soft Sunday. Skyline, jazz into house, tables that stay.', expected: '~120 in', coverNgn: 10000 },
  { id: 'harbour-friday', title: 'Friday at Harbour', venueSlug: 'harbour-house', offsetDays: 5, startHour: 22, endHour: 4, tag: 'Club', blurb: "The week's first proper club night. Guest list for Resident cards after 11.", expected: '~280 in', coverNgn: 18000 },
  { id: 'terrace-late', title: 'Terrace After', venueSlug: 'terrace-14', offsetDays: 5, startHour: 21, endHour: 2, tag: 'Lounge', blurb: 'Lekki late lounge. Order the Tequila Terrace Pack to the booth.', expected: '~150 in', coverNgn: 12000 },
];

function atOffset(days: number, hour: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

export function resolveEvent(raw: NightEvent, venueOverride?: VenueSnapshot): ResolvedEvent | null {
  const staticVenue = getVenue(raw.venueSlug);
  const venue = venueOverride || (staticVenue ? venueToSnapshot(staticVenue) : null);
  if (!venue) return null;

  const startsAt = raw.startsAtIso
    ? new Date(raw.startsAtIso)
    : atOffset(raw.offsetDays ?? 0, raw.startHour ?? 20);
  const endsAt = raw.endsAtIso
    ? new Date(raw.endsAtIso)
    : atOffset(
        (raw.endHour ?? 23) < (raw.startHour ?? 20) ? (raw.offsetDays ?? 0) + 1 : raw.offsetDays ?? 0,
        raw.endHour ?? 23
      );
  return { ...raw, venue, startsAt, endsAt };
}

export function seedEvents(): ResolvedEvent[] {
  return RAW.map((e) => resolveEvent(e))
    .filter(Boolean)
    .sort((a, b) => a!.startsAt.getTime() - b!.startsAt.getTime()) as ResolvedEvent[];
}

export function mergeEvents(extra: NightEvent[]): ResolvedEvent[] {
  const extraResolved = extra
    .map((e) => {
      const v = e as NightEvent & { venue?: VenueSnapshot };
      return resolveEvent(e, v.venue);
    })
    .filter(Boolean) as ResolvedEvent[];
  const extraIds = new Set(extraResolved.map((e) => e.id));
  const seeds = seedEvents().filter((e) => !extraIds.has(e.id));
  return [...seeds, ...extraResolved].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

export function getEvent(id: string): ResolvedEvent | undefined {
  return seedEvents().find((e) => e.id === id);
}

export function eventsAtVenue(slug: string): ResolvedEvent[] {
  return seedEvents().filter((e) => e.venueSlug === slug);
}

export function isTonight(event: ResolvedEvent): boolean {
  const now = new Date();
  return (
    event.startsAt.getDate() === now.getDate() &&
    event.startsAt.getMonth() === now.getMonth() &&
    event.startsAt.getFullYear() === now.getFullYear()
  );
}

export function isThisWeekend(event: ResolvedEvent): boolean {
  const day = event.startsAt.getDay();
  return day === 5 || day === 6 || day === 0;
}

export function formatEventWhen(event: ResolvedEvent): string {
  const start = event.startsAt;
  const weekday = start.toLocaleDateString('en-NG', { weekday: 'short' });
  const month = start.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
  const time = start.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' });
  if (isTonight(event)) return `Tonight · ${time}`;
  return `${weekday} ${month} · ${time}`;
}

export function isPast(event: ResolvedEvent): boolean {
  return event.endsAt < new Date();
}
