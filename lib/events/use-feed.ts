'use client';

import { useEffect, useState } from 'react';
import { mergeEvents, seedEvents, type NightEvent, type ResolvedEvent } from '@/lib/events/catalog';

/** Seeded nights plus whatever the admin desk has published, once it loads. */
export function useEventFeed(): ResolvedEvent[] {
  const [events, setEvents] = useState<ResolvedEvent[]>(seedEvents);

  useEffect(() => {
    let cancelled = false;
    fetchRemote()
      .then((remote) => {
        if (!cancelled) setEvents(mergeEvents(remote));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return events;
}

export function useEvent(id: string): ResolvedEvent | undefined {
  const [event, setEvent] = useState<ResolvedEvent | undefined>(() =>
    seedEvents().find((e) => e.id === id)
  );

  useEffect(() => {
    let cancelled = false;
    setEvent(seedEvents().find((e) => e.id === id));
    fetchRemote()
      .then((remote) => {
        if (cancelled) return;
        setEvent(mergeEvents(remote).find((e) => e.id === id));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id]);

  return event;
}

async function fetchRemote(): Promise<NightEvent[]> {
  const res = await fetch('/api/events');
  if (!res.ok) return [];
  const body = (await res.json()) as { events?: NightEvent[] };
  return Array.isArray(body.events) ? body.events : [];
}
