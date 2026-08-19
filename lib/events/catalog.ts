export type EventTag = 'Rooftop' | 'Club' | 'Lounge' | 'Dining' | 'Beach' | 'Live' | 'Whisky';

export const EVENT_TAGS: EventTag[] = ['Rooftop', 'Club', 'Lounge', 'Dining', 'Beach', 'Live', 'Whisky'];

export type NightEvent = {
  id: string;
  title: string;
  venueSlug: string;
  startsAtIso?: string;
  endsAtIso?: string;
  tag: EventTag;
  blurb: string;
  expected: string;
  coverNgn?: number;
  source?: 'admin';
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

export function resolveEvent(raw: NightEvent, venue: VenueSnapshot): ResolvedEvent {
  const startsAt = raw.startsAtIso ? new Date(raw.startsAtIso) : new Date();
  const endsAt = raw.endsAtIso ? new Date(raw.endsAtIso) : new Date(startsAt.getTime() + 4 * 3600000);
  return { ...raw, venue, startsAt, endsAt };
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

export function eventsAtVenue(slug: string): ResolvedEvent[] {
  return [];
}
