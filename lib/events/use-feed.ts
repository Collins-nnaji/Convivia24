'use client';

import { useEffect, useState } from 'react';
import { mergeEvents, seedEvents, type NightEvent, type ResolvedEvent, type VenueSnapshot } from '@/lib/events/catalog';

type APIEvent = NightEvent & {
  startsAtIso: string;
  endsAtIso: string;
  venue?: VenueSnapshot;
};

export function useEventFeed(): ResolvedEvent[] {
  const [events, setEvents] = useState<ResolvedEvent[]>(seedEvents);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/events')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const remote: APIEvent[] = data.events || [];
        if (remote.length === 0) {
          setEvents(seedEvents());
          return;
        }
        const normalized: NightEvent[] = remote.map((e) => ({
          id: e.id,
          title: e.title,
          venueSlug: e.venueSlug,
          tag: e.tag,
          blurb: e.blurb,
          expected: e.expected,
          coverNgn: e.coverNgn,
          startsAtIso: e.startsAtIso,
          endsAtIso: e.endsAtIso,
          source: 'admin',
          venue: e.venue,
        })) as NightEvent[];
        setEvents(mergeEvents(normalized as (NightEvent & { venue?: VenueSnapshot })[]));
      })
      .catch(() => {
        if (!cancelled) setEvents(seedEvents());
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return events;
}

export function useEvent(id: string): ResolvedEvent | undefined {
  const [event, setEvent] = useState<ResolvedEvent | undefined>(() => seedEvents().find((e) => e.id === id));

  useEffect(() => {
    let cancelled = false;
    setEvent(seedEvents().find((e) => e.id === id));
    fetch('/api/events')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const remote: APIEvent[] = data.events || [];
        const merged = remote.length > 0
          ? mergeEvents(
              remote.map((e) => ({
                id: e.id,
                title: e.title,
                venueSlug: e.venueSlug,
                tag: e.tag,
                blurb: e.blurb,
                expected: e.expected,
                coverNgn: e.coverNgn,
                startsAtIso: e.startsAtIso,
                endsAtIso: e.endsAtIso,
                source: 'admin' as const,
                venue: e.venue,
              }))
            )
          : seedEvents();
        setEvent(merged.find((e) => e.id === id));
      })
      .catch(() => {
        if (!cancelled) setEvent(seedEvents().find((e) => e.id === id));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return event;
}
