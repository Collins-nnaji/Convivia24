'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  MapPin,
  Navigation as NavIcon,
  SlidersHorizontal,
  Star,
  X,
} from 'lucide-react';
import NightArt, { tagToArt } from '@/components/graphics/NightArt';
import { LAGOS_AREAS, formatKm, haversineKm } from '@/lib/geo/lagos';
import {
  formatEventWhen,
  isThisWeekend,
  isTonight,
  type ResolvedEvent,
} from '@/lib/events/catalog';
import { useEventFeed } from '@/lib/events/use-feed';
import { VENUES, VENUE_KIND_LABELS, type Venue } from '@/lib/venues/catalog';
import { venueRating } from '@/lib/venues/reviews';
import { formatNgn } from '@/lib/drinks/catalog';
import CirclesPanel from '@/components/events/CirclesPanel';

type Tab = 'events' | 'venues' | 'circles';
type WhenFilter = 'all' | 'tonight' | 'weekend';

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function todayKey(): string {
  return dayKey(new Date());
}

function tomorrowKey(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return dayKey(d);
}

function dayHeading(d: Date): string {
  const key = dayKey(d);
  if (key === todayKey()) return 'Tonight';
  if (key === tomorrowKey()) return 'Tomorrow';
  return d.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'short' });
}

function formatChipDate(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (key === todayKey()) return 'Tonight';
  if (key === tomorrowKey()) return 'Tomorrow';
  return date.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' });
}

const SHADOWS = [
  'shadow-[0_18px_50px_-22px_rgba(10,10,10,0.45)]',
  'shadow-[0_22px_55px_-20px_rgba(74,21,18,0.38)]',
  'shadow-[0_16px_48px_-18px_rgba(10,10,10,0.4)]',
  'shadow-[0_20px_52px_-24px_rgba(139,42,34,0.32)]',
  'shadow-[0_24px_60px_-26px_rgba(10,10,10,0.42)]',
];

export default function EventsExplorer() {
  const params = useSearchParams();
  const router = useRouter();
  const feed = useEventFeed();
  const tabParam = params.get('tab');
  const initialTab: Tab = tabParam === 'venues' || tabParam === 'circles' ? tabParam : 'events';
  const [tab, setTab] = useState<Tab>(initialTab);
  const [area, setArea] = useState<string>(params.get('area') || 'all');
  const [when, setWhen] = useState<WhenFilter>('all');
  const [date, setDate] = useState('');
  const [here, setHere] = useState<{ lat: number; lng: number } | null>(null);
  const [geoMsg, setGeoMsg] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [nowLabel, setNowLabel] = useState('');

  useEffect(() => {
    const next = params.get('tab');
    if (next === 'venues' || next === 'circles') setTab(next);
    else if (!next) setTab('events');
  }, [params]);

  function selectTab(next: Tab) {
    setTab(next);
    const qs = new URLSearchParams(params.toString());
    if (next === 'events') qs.delete('tab');
    else qs.set('tab', next);
    const suffix = qs.toString();
    router.replace(suffix ? `/events?${suffix}` : '/events', { scroll: false });
  }

  useEffect(() => {
    const tick = () => {
      setNowLabel(
        new Date().toLocaleTimeString('en-NG', {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  function nearMe() {
    if (!navigator.geolocation) {
      setGeoMsg('Location is not available on this device.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setHere({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoMsg('Sorted by distance from you.');
        setFiltersOpen(false);
      },
      () => setGeoMsg('Could not read location — showing Lagos citywide.')
    );
  }

  const events = useMemo(() => {
    let list = feed;
    if (area !== 'all') list = list.filter((e) => e.venue.areaId === area);
    if (date) {
      list = list.filter((e) => dayKey(e.startsAt) === date);
    } else if (when === 'tonight') {
      list = list.filter(isTonight);
    } else if (when === 'weekend') {
      list = list.filter(isThisWeekend);
    }
    list = [...list].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
    if (here) {
      list = [...list].sort((a, b) => {
        const day = dayKey(a.startsAt).localeCompare(dayKey(b.startsAt));
        if (day !== 0) return day;
        return haversineKm(here, a.venue) - haversineKm(here, b.venue);
      });
    }
    return list;
  }, [feed, area, when, date, here]);

  const eventDays = useMemo(() => {
    const keys = new Set<string>();
    for (const e of feed) keys.add(dayKey(e.startsAt));
    return [...keys].sort();
  }, [feed]);

  const eventGroups = useMemo(() => {
    const map = new Map<string, ResolvedEvent[]>();
    for (const e of events) {
      const key = dayKey(e.startsAt);
      const rows = map.get(key) || [];
      rows.push(e);
      map.set(key, rows);
    }
    return [...map.entries()].map(([key, items]) => ({
      key,
      label: dayHeading(items[0].startsAt),
      items,
    }));
  }, [events]);

  const venues = useMemo(() => {
    let list: (Venue & { km?: number })[] =
      area === 'all' ? [...VENUES] : VENUES.filter((v) => v.areaId === area);
    if (here) {
      list = list
        .map((v) => ({ ...v, km: haversineKm(here, v) }))
        .sort((a, b) => (a.km || 0) - (b.km || 0));
    }
    return list;
  }, [area, here]);

  const tonightCount = useMemo(() => feed.filter(isTonight).length, [feed]);
  const activeFilterCount =
    (area !== 'all' ? 1 : 0) +
    (tab === 'events' && when !== 'all' ? 1 : 0) +
    (tab === 'events' && date ? 1 : 0) +
    (here ? 1 : 0);

  const areaLabel = area === 'all' ? 'All Lagos' : LAGOS_AREAS.find((a) => a.id === area)?.name || area;
  const whenLabel = date
    ? formatChipDate(date)
    : when === 'all'
      ? 'Any time'
      : when === 'tonight'
        ? 'Tonight'
        : 'This weekend';

  function clearFilters() {
    setArea('all');
    setWhen('all');
    setDate('');
    setHere(null);
    setGeoMsg('');
  }

  function pickWhen(next: WhenFilter) {
    setWhen(next);
    setDate('');
  }

  function pickDate(next: string) {
    setDate(next);
    setWhen('all');
  }

  return (
    <div className="bg-paper min-h-[70vh]">
      <div className="relative overflow-hidden border-b border-obsidian/8">
        <div className="absolute inset-0 brand-gradient opacity-[0.05]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-4 sm:py-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h1 className="font-logo font-black tracking-tight uppercase text-xl sm:text-2xl text-obsidian leading-none">
              What&apos;s on <span className="brand-text">tonight</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-obsidian text-white text-[9px] font-black uppercase tracking-[0.16em]">
              <span className="w-1.5 h-1.5 rounded-full bg-ember live-beep" />
              Live
            </span>
            <span className="text-xs font-mono text-obsidian/40 tabular-nums">{nowLabel}</span>
            <span className="ml-auto hidden sm:flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/45">
              <span>{tonightCount} tonight</span>
              <span>{VENUES.length} rooms</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-7 sm:py-10">
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {(['events', 'venues', 'circles'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => selectTab(t)}
              className={`px-5 py-2.5 text-xs font-black uppercase tracking-[0.14em] transition-colors ${
                tab === t ? 'badge-brand' : 'bg-white border border-obsidian/10 text-obsidian/50'
              }`}
            >
              {t === 'events' ? 'Events' : t === 'venues' ? 'Venues' : 'Circles'}
            </button>
          ))}

          {tab !== 'circles' && (
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className={`ml-auto inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] border transition-colors ${
              filtersOpen || activeFilterCount > 0
                ? 'border-ember text-ember bg-ember/5'
                : 'border-obsidian/15 text-obsidian/55 hover:border-ember hover:text-ember'
            }`}
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="min-w-[18px] h-5 px-1.5 rounded-full bg-obsidian text-white text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown size={14} className={`transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
          </button>
          )}
        </div>

        {tab !== 'circles' && !filtersOpen && activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-5 text-sm text-obsidian/45">
            <span>
              {areaLabel}
              {tab === 'events' ? ` · ${whenLabel}` : ''}
              {here ? ' · Near me' : ''}
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-ember font-semibold uppercase tracking-[0.1em] text-xs"
            >
              <X size={12} /> Clear
            </button>
          </div>
        )}

        {tab !== 'circles' && (
        <AnimatePresence initial={false}>
          {filtersOpen && (
            <motion.div
              key="filters"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white p-5 sm:p-6 space-y-5 shadow-[0_14px_40px_-20px_rgba(10,10,10,0.3)]">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/35 mb-2.5">
                    Area
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Chip active={area === 'all'} onClick={() => setArea('all')}>
                      All Lagos
                    </Chip>
                    {LAGOS_AREAS.map((a) => (
                      <Chip key={a.id} active={area === a.id} onClick={() => setArea(a.id)}>
                        {a.name}
                      </Chip>
                    ))}
                  </div>
                </div>

                {tab === 'events' && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/35 mb-2.5">
                      Date
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(
                        [
                          ['all', 'Any day'],
                          ['tonight', 'Tonight'],
                          ['weekend', 'This weekend'],
                        ] as const
                      ).map(([id, label]) => (
                        <Chip key={id} active={!date && when === id} onClick={() => pickWhen(id)}>
                          {label}
                        </Chip>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {eventDays.map((key) => (
                        <Chip key={key} active={date === key} onClick={() => pickDate(key)}>
                          {formatChipDate(key)}
                        </Chip>
                      ))}
                      <label className="inline-flex items-center gap-2 px-3 py-2 bg-paper border border-obsidian/10 text-xs font-black uppercase tracking-[0.12em] text-obsidian/50">
                        Pick date
                        <input
                          type="date"
                          value={date}
                          min={eventDays[0] || todayKey()}
                          onChange={(e) => (e.target.value ? pickDate(e.target.value) : pickWhen('all'))}
                          className="border-0 bg-transparent p-0 text-obsidian/70 font-medium uppercase tracking-normal text-xs focus:ring-0"
                        />
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={nearMe}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] border border-obsidian/15 hover:border-ember hover:text-ember"
                  >
                    <NavIcon size={13} /> Near me
                  </button>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs font-black uppercase tracking-[0.12em] text-obsidian/40 hover:text-ember"
                    >
                      Reset
                    </button>
                  )}
                  {geoMsg && <p className="text-sm text-obsidian/40 w-full sm:w-auto">{geoMsg}</p>}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        )}

        {tab === 'circles' ? (
          <CirclesPanel />
        ) : tab === 'events' ? (
          events.length === 0 ? (
            <p className="text-base text-obsidian/45 py-12">
              No events in this window. Open filters and try another cut.
            </p>
          ) : (
            <div className="space-y-8 sm:space-y-10">
              {eventGroups.map((group) => (
                <section key={group.key}>
                  <div className="flex items-baseline justify-between gap-3 mb-3 sm:mb-4">
                    <h2 className="font-logo font-extrabold uppercase tracking-tight text-sm sm:text-base text-obsidian">
                      {group.label}
                    </h2>
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/35">
                      {group.items.length} {group.items.length === 1 ? 'night' : 'nights'}
                    </span>
                  </div>
                  <div className="space-y-4 sm:space-y-5">
                    {group.items.map((event, i) => (
                      <EventRow key={event.id} event={event} here={here} index={i} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {venues.map((venue, i) => (
              <VenueRow key={venue.slug} venue={venue} km={venue.km} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 px-3.5 py-2 text-xs font-black uppercase tracking-[0.12em] ${
        active ? 'bg-obsidian text-white' : 'bg-paper border border-obsidian/10 text-obsidian/50'
      }`}
    >
      {children}
    </button>
  );
}

function EventRow({
  event,
  here,
  index,
}: {
  event: ResolvedEvent;
  here: { lat: number; lng: number } | null;
  index: number;
}) {
  const km = here ? haversineKm(here, event.venue) : null;
  const live = isTonight(event);
  const shadow = SHADOWS[index % SHADOWS.length];

  return (
    <Link
      href={`/events/${event.id}`}
      className={`group relative block bg-white ${shadow} hover:-translate-y-0.5 transition-all duration-300`}
    >
      <div className="flex flex-col sm:flex-row sm:items-stretch gap-0">
        <div className="relative w-full sm:w-36 md:w-44 lg:w-52 shrink-0 aspect-[16/10] sm:aspect-auto sm:min-h-[140px]">
          <NightArt kind={tagToArt(event.tag)} className="absolute inset-0 h-full" label={event.tag} />
          {live && (
            <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 bg-obsidian/85 text-white text-[10px] font-black uppercase tracking-[0.14em] px-2 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-ember live-beep" />
              Doors open
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 p-5 sm:p-6 lg:p-7 flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-2">
            <p className="text-xs sm:text-sm font-black uppercase tracking-[0.14em] text-ember">
              {formatEventWhen(event)}
            </p>
            {!live && (
              <span
                className="w-2 h-2 rounded-full bg-obsidian/20"
                style={undefined}
                aria-hidden
              />
            )}
          </div>

          <h2 className="font-logo font-extrabold uppercase tracking-tight text-xl sm:text-2xl lg:text-[1.7rem] text-obsidian group-hover:text-ember transition-colors leading-snug">
            {event.title}
          </h2>

          <p className="text-base text-obsidian/55 mt-2 max-w-3xl leading-relaxed line-clamp-2">
            {event.blurb}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-obsidian/50">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={15} />
              {event.venue.name} · {event.venue.area}
              {km != null && <span className="text-obsidian/35">· {formatKm(km)}</span>}
            </span>
            <span className="tabular-nums font-medium text-obsidian/60">{event.expected}</span>
            {event.coverNgn != null && (
              <span className="tabular-nums">Door from {formatNgn(event.coverNgn)}</span>
            )}
          </div>
        </div>

        <span className="hidden lg:flex items-center shrink-0 pr-7 text-ember/35 text-2xl group-hover:text-ember group-hover:translate-x-1 transition-all">
          →
        </span>
      </div>
    </Link>
  );
}

function VenueRow({ venue, km, index }: { venue: Venue; km?: number; index: number }) {
  const { avg, count } = venueRating(venue.slug);
  const shadow = SHADOWS[index % SHADOWS.length];

  return (
    <Link
      href={`/events/venues/${venue.slug}`}
      className={`group relative block bg-white ${shadow} hover:-translate-y-0.5 transition-all duration-300`}
    >
      <div className="flex flex-col sm:flex-row sm:items-stretch gap-0">
        <div className="relative w-full sm:w-36 md:w-44 lg:w-52 shrink-0 aspect-[16/10] sm:aspect-auto sm:min-h-[140px]">
          <NightArt kind={venue.kind} className="absolute inset-0 h-full" label={VENUE_KIND_LABELS[venue.kind]} />
        </div>

        <div className="min-w-0 flex-1 p-5 sm:p-6 lg:p-7 flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-2">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-obsidian/40">
              {VENUE_KIND_LABELS[venue.kind]}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-obsidian/50">
              <Star size={14} className="text-ember" fill="currentColor" />
              {avg.toFixed(1)} · {count} reviews
            </span>
          </div>

          <h2 className="font-logo font-extrabold uppercase tracking-tight text-xl sm:text-2xl text-obsidian group-hover:text-ember transition-colors">
            {venue.name}
          </h2>
          <p className="text-base text-obsidian/55 mt-2 max-w-3xl leading-relaxed">{venue.tagline}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-obsidian/50">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={15} />
              {venue.area}
              {km != null && <span className="text-obsidian/35">· {formatKm(km)}</span>}
            </span>
            <span className="text-ember font-medium">{venue.cardPerk}</span>
          </div>
        </div>

        <span className="hidden lg:flex items-center shrink-0 pr-7 text-ember/35 text-2xl group-hover:text-ember group-hover:translate-x-1 transition-all">
          →
        </span>
      </div>
    </Link>
  );
}
