'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, MapPin } from 'lucide-react';
import NightArt, { tagToArt } from '@/components/graphics/NightArt';
import { formatEventWhen, isPast, type ResolvedEvent } from '@/lib/events/catalog';
import { useEventFeed } from '@/lib/events/use-feed';

/** Tag groups that read as plain-English filters rather than schema values. */
const FILTERS: { id: string; label: string; tags: string[] | null }[] = [
  { id: 'all', label: 'All', tags: null },
  { id: 'tastings', label: 'Tastings', tags: ['Whisky', 'Dining'] },
  { id: 'rooms', label: 'Bars & lounges', tags: ['Lounge', 'Rooftop', 'Club'] },
  { id: 'live', label: 'Live', tags: ['Live', 'Beach'] },
];

export default function TrendingPanel() {
  const events = useEventFeed();
  const [filter, setFilter] = useState('all');

  const shown = useMemo(() => {
    const active = FILTERS.find((f) => f.id === filter);
    return events
      .filter((e) => !isPast(e))
      .filter((e) => !active?.tags || active.tags.includes(e.tag))
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
      .slice(0, 3);
  }, [events, filter]);

  return (
    <section className="bg-white border border-obsidian/8 h-full flex flex-col">
      <div className="px-5 sm:px-6 py-4 border-b border-obsidian/8 flex items-center justify-between gap-4">
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50">Trending near you</h2>
        <Link
          href="/plan"
          className="text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/40 hover:text-ember inline-flex items-center gap-1 transition-colors"
        >
          View all <ChevronRight size={13} />
        </Link>
      </div>

      <div className="px-5 sm:px-6 pt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-full transition-colors ${
              filter === f.id
                ? 'bg-ember/8 text-ember ring-1 ring-inset ring-ember/20'
                : 'bg-obsidian/[0.04] text-obsidian/55 hover:bg-obsidian/8'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="p-3 sm:p-4 space-y-2 flex-1">
        {shown.length === 0 && (
          <li className="px-2 py-8 text-center text-sm text-obsidian/40">
            Nothing listed under this filter yet.
          </li>
        )}
        {shown.map((event, i) => (
          <TrendingRow key={event.id} event={event} index={i} />
        ))}
      </ul>
    </section>
  );
}

function TrendingRow({ event, index }: { event: ResolvedEvent; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
    >
      <Link
        href={`/events/${event.id}`}
        className="group flex items-center gap-3 sm:gap-4 p-2 hover:bg-paper transition-colors"
      >
        <NightArt
          kind={tagToArt(event.tag)}
          label={event.tag}
          className="w-20 h-16 sm:w-24 sm:h-[68px] shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm leading-snug truncate">{event.title}</p>
          <p className="text-[12px] text-obsidian/45 mt-1 flex items-center gap-1 truncate">
            <MapPin size={11} className="shrink-0" /> {event.venue.name} · {event.venue.area}
          </p>
          <p className="text-[11px] font-black uppercase tracking-[0.1em] text-ember mt-1">
            {formatEventWhen(event)}
          </p>
        </div>
        <span className="hidden sm:inline-flex px-3.5 py-2 border border-obsidian/12 text-[10px] font-black uppercase tracking-[0.1em] text-obsidian/60 group-hover:border-ember/40 group-hover:text-ember transition-colors shrink-0">
          View
        </span>
      </Link>
    </motion.li>
  );
}
