'use client';

import { useEffect, useState } from 'react';
import { type ResolvedEvent, type VenueSnapshot } from '@/lib/events/catalog';

type APIEvent = {
  id: string;
  title: string;
  venueSlug: string;
  tag: string;
  blurb: string;
  expected: string;
  coverNgn?: number;
  startsAtIso: string;
  endsAtIso: string;
  venue?: VenueSnapshot;
};

function toResolved(raw: APIEvent): ResolvedEvent {
  const venue: VenueSnapshot = raw.venue || {
    slug: raw.venueSlug,
    name: raw.venueSlug,
    kind: 'lounge',
    areaId: '',
    area: '',
    address: '',
    lat: 0,
    lng: 0,
    tagline: '',
    cardPerk: '',
  };
  return {
    ...raw,
    source: 'admin',
    venue,
    startsAt: new Date(raw.startsAtIso),
    endsAt: new Date(raw.endsAtIso),
  } as ResolvedEvent;
}

export function useEventFeed(): ResolvedEvent[] {
  const [events, setEvents] = useState<ResolvedEvent[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/events')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const list: APIEvent[] = data.events || [];
        setEvents(list.map(toResolved).sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime()));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return events;
}

export function useEvent(id: string): ResolvedEvent | undefined {
  const [event, setEvent] = useState<ResolvedEvent | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/events')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const list: APIEvent[] = data.events || [];
        const found = list.find((e) => e.id === id);
        if (found) setEvent(toResolved(found));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [id]);

  return event;
}
