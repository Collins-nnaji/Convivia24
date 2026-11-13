'use client';

import Link from 'next/link';
import { formatEventWhen, isTonight } from '@/lib/events/catalog';
import { useEventFeed } from '@/lib/events/use-feed';
import SectionHeading from './SectionHeading';

/** Tonight's events — only rendered when the events feature flag is on. */
export default function TonightEvents() {
  const tonight = useEventFeed().filter(isTonight).slice(0, 3);
  if (tonight.length === 0) return null;
  return (
    <section className="mx-auto max-w-[1600px] px-3 py-14 sm:px-4 sm:py-20 lg:px-5">
      <SectionHeading title="Tonight around you" href="/events" linkLabel="All events" />
      <div className="grid gap-4 md:grid-cols-3">
        {tonight.map((event) => (
          <Link key={event.id} href={`/events/${event.id}`} className="group rounded-2xl bg-shell p-5 hover:bg-shell/70">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-ember">
              <span className="live-beep h-2 w-2 rounded-full bg-ember" /> {formatEventWhen(event)}
            </p>
            <p className="mt-2 font-serif text-xl text-obsidian group-hover:underline">{event.title}</p>
            <p className="mt-1 text-sm text-obsidian/55">
              {event.venue.name} · {event.venue.area}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
