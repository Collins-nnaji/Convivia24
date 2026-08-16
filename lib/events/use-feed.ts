'use client';

import { useEffect, useState } from 'react';
import { feedEvents, findFeedEvent } from '@/lib/events/created';
import { seedEvents, type NightEvent, type ResolvedEvent } from '@/lib/events/catalog';
import { mergeEvents } from '@/lib/events/catalog';

export function useEventFeed() {
  const [events, setEvents] = useState<ResolvedEvent[]>(seedEvents);

  useEffect(() => {
    let cancelled = false;
    setEvents(feedEvents());
    fetch('/api/events')
      .then((r) => (r.ok ? r.json() : { events: [] }))
      .then((body: { events?: NightEvent[] }) => {
        if (cancelled) return;
        const remote = Array.isArray(body.events) ? body.events : [];
        setEvents(mergeEvents([...remote, ...feedEvents().map(toNight)]));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return events;
}

function toNight(e: ResolvedEvent): NightEvent {
  return {
    id: e.id,
    title: e.title,
    venueSlug: e.venueSlug,
    tag: e.tag,
    blurb: e.blurb,
    expected: e.expected,
    coverNgn: e.coverNgn,
    startsAtIso: e.startsAt.toISOString(),
    endsAtIso: e.endsAt.toISOString(),
    source: e.source,
  };
}

export function useEvent(id: string) {
  const [event, setEvent] = useState<ResolvedEvent | undefined>(() => findFeedEvent(id) || seedEvents().find((e) => e.id === id));

  useEffect(() => {
    setEvent(findFeedEvent(id) || seedEvents().find((e) => e.id === id));
    fetch('/api/events')
      .then((r) => (r.ok ? r.json() : { events: [] }))
      .then((body: { events?: NightEvent[] }) => {
        const remote = Array.isArray(body.events) ? body.events : [];
        const merged = mergeEvents([...remote, ...feedEvents().map(toNight)]);
        setEvent(merged.find((e) => e.id === id));
      })
      .catch(() => {});
  }, [id]);

  return event;
}
