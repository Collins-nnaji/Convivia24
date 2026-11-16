'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import { formatNgn } from '@/lib/drinks/catalog';
import PageHeader from './PageHeader';

export type PublicEvent = {
  id: string;
  title: string;
  tag: string;
  blurb: string;
  expected: string;
  coverNgn: number | null;
  startsAtIso: string;
  endsAtIso: string;
  venueName: string | null;
  venueArea: string | null;
  venueAddress: string | null;
  venuePhoto: string | null;
};

type When = 'all' | 'tonight' | 'weekend';

const TZ = 'Africa/Lagos';
const dayKey = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: TZ });

function isTonight(e: PublicEvent, now: Date) {
  const start = new Date(e.startsAtIso);
  const end = new Date(e.endsAtIso);
  return dayKey(start) === dayKey(now) || (start <= now && end >= now);
}

function isWeekend(e: PublicEvent, now: Date) {
  const start = new Date(e.startsAtIso);
  const weekday = new Date(start.toLocaleString('en-US', { timeZone: TZ })).getDay();
  const within = start.getTime() - now.getTime() < 7 * 86_400_000;
  return within && (weekday === 5 || weekday === 6 || weekday === 0);
}

function when(e: PublicEvent) {
  const start = new Date(e.startsAtIso);
  const end = new Date(e.endsAtIso);
  const day = start.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: TZ });
  const t = (d: Date) => d.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: TZ });
  return `${day} · ${t(start)} – ${t(end)}`;
}

export default function EventsPage({ events, unavailable }: { events: PublicEvent[]; unavailable: boolean }) {
  const [filter, setFilter] = useState<When>('all');
  const [tag, setTag] = useState('');
  const now = useMemo(() => new Date(), []);
  const tags = useMemo(() => [...new Set(events.map((e) => e.tag))].sort(), [events]);
  const shown = events.filter(
    (e) => (filter === 'all' || (filter === 'tonight' ? isTonight(e, now) : isWeekend(e, now))) && (!tag || e.tag === tag)
  );

  const chip = (on: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
      on ? 'border-obsidian bg-obsidian text-white' : 'border-obsidian/15 text-obsidian/70 hover:border-obsidian/40'
    }`;

  return (
    <>
      <PageHeader
        eyebrow="What's on"
        title="Events & nights out"
        lead="Upcoming nights from venues we work with. Order the drinks ahead and have them delivered before you go."
      />
      <div className="space-y-4 p-4 sm:p-6">
        {events.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {(['all', 'tonight', 'weekend'] as When[]).map((w) => (
              <button key={w} type="button" onClick={() => setFilter(w)} className={chip(filter === w)}>
                {w === 'all' ? 'All upcoming' : w === 'tonight' ? 'Tonight' : 'This weekend'}
              </button>
            ))}
            {tags.length > 1 && <span className="mx-1 h-5 w-px bg-obsidian/15" aria-hidden />}
            {tags.length > 1 &&
              tags.map((t) => (
                <button key={t} type="button" onClick={() => setTag(tag === t ? '' : t)} className={chip(tag === t)}>
                  {t}
                </button>
              ))}
          </div>
        )}

        {unavailable ? (
          <p className="rounded-xl border border-obsidian/10 bg-white p-6 text-sm text-obsidian/70">Events are unavailable right now. Please check back shortly.</p>
        ) : events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-obsidian/20 bg-white p-8 text-center">
            <CalendarDays className="mx-auto text-obsidian/40" size={28} />
            <p className="mt-3 font-semibold text-obsidian">No events listed yet</p>
            <p className="mt-1 text-sm text-obsidian/65">New nights are added here as venues confirm them. In the meantime, plan your own.</p>
            <Link href="/party-planner" className="btn-brand mt-4 inline-flex rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em]">
              Plan a night
            </Link>
          </div>
        ) : shown.length === 0 ? (
          <p className="rounded-xl border border-obsidian/10 bg-white p-6 text-sm text-obsidian/70">Nothing matches — try another filter.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {shown.map((e) => (
              <li key={e.id} className="overflow-hidden rounded-xl border border-obsidian/10 bg-white">
                {e.venuePhoto && (
                  <div className="relative h-36 bg-shell">
                    <Image src={e.venuePhoto} alt="" fill unoptimized sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
                  </div>
                )}
                <div className="space-y-2 p-4">
                  <p className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-ember">
                    {isTonight(e, now) && <span className="live-beep h-2 w-2 rounded-full bg-ember" aria-hidden />}
                    {when(e)}
                  </p>
                  <h3 className="text-lg font-bold leading-snug text-obsidian">{e.title}</h3>
                  {e.venueName && (
                    <p className="flex items-start gap-1.5 text-sm text-obsidian/75">
                      <MapPin size={14} className="mt-0.5 shrink-0" />
                      <span>
                        {e.venueName}
                        {e.venueArea ? ` · ${e.venueArea}` : ''}
                        {e.venueAddress && <span className="block text-xs text-obsidian/55">{e.venueAddress}</span>}
                      </span>
                    </p>
                  )}
                  {e.blurb && <p className="text-sm text-obsidian/70">{e.blurb}</p>}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="rounded bg-obsidian/[0.06] px-2 py-0.5 font-semibold text-obsidian/75">{e.tag}</span>
                    {e.coverNgn != null && e.coverNgn > 0 ? (
                      <span className="rounded bg-saffron/20 px-2 py-0.5 font-semibold text-obsidian">Entry {formatNgn(e.coverNgn)}</span>
                    ) : (
                      <span className="rounded bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800">Free entry</span>
                    )}
                    {e.expected && (
                      <span className="inline-flex items-center gap-1 text-obsidian/60">
                        <Users size={12} /> {e.expected}
                      </span>
                    )}
                  </div>
                  <Link href="/shop?section=packages" className="inline-flex pt-1 text-sm font-bold text-ember hover:underline">
                    Get drinks for this night →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
