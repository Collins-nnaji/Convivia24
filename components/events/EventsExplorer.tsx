'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  allEvents,
  formatEventWhen,
  isThisWeekend,
  isTonight,
  type ResolvedEvent,
} from '@/lib/events/catalog';
import { VENUES, VENUE_KIND_LABELS, type Venue } from '@/lib/venues/catalog';
import { venueRating } from '@/lib/venues/reviews';
import { formatNgn } from '@/lib/drinks/catalog';

type Tab = 'events' | 'venues';
type WhenFilter = 'all' | 'tonight' | 'weekend';

const SHADOWS = [
  'shadow-[0_18px_50px_-22px_rgba(10,10,10,0.45)]',
  'shadow-[0_22px_55px_-20px_rgba(74,21,18,0.38)]',
  'shadow-[0_16px_48px_-18px_rgba(10,10,10,0.4)]',
  'shadow-[0_20px_52px_-24px_rgba(139,42,34,0.32)]',
  'shadow-[0_24px_60px_-26px_rgba(10,10,10,0.42)]',
];

export default function EventsExplorer() {
  const params = useSearchParams();
  const initialTab = params.get('tab') === 'venues' ? 'venues' : 'events';
  const [tab, setTab] = useState<Tab>(initialTab);
  const [area, setArea] = useState<string>(params.get('area') || 'all');
  const [when, setWhen] = useState<WhenFilter>('all');
  const [here, setHere] = useState<{ lat: number; lng: number } | null>(null);
  const [geoMsg, setGeoMsg] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [nowLabel, setNowLabel] = useState('');
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (params.get('tab') === 'venues') setTab('venues');
  }, [params]);

  useEffect(() => {
    const tick = () => {
      setNowLabel(
        new Date().toLocaleTimeString('en-NG', {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setPulse((n) => n + 1);
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
    let list = allEvents();
    if (area !== 'all') list = list.filter((e) => e.venue.areaId === area);
    if (when === 'tonight') list = list.filter(isTonight);
    if (when === 'weekend') list = list.filter(isThisWeekend);
    if (here) {
      list = [...list].sort((a, b) => haversineKm(here, a.venue) - haversineKm(here, b.venue));
    }
    return list;
  }, [area, when, here]);

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

  const tonightCount = useMemo(() => allEvents().filter(isTonight).length, []);
  const activeFilterCount =
    (area !== 'all' ? 1 : 0) + (tab === 'events' && when !== 'all' ? 1 : 0) + (here ? 1 : 0);

  const areaLabel = area === 'all' ? 'All Lagos' : LAGOS_AREAS.find((a) => a.id === area)?.name || area;
  const whenLabel = when === 'all' ? 'Any time' : when === 'tonight' ? 'Tonight' : 'This weekend';

  function clearFilters() {
    setArea('all');
    setWhen('all');
    setHere(null);
    setGeoMsg('');
  }

  return (
    <div className="bg-paper min-h-[70vh]">
      <div className="relative overflow-hidden border-b border-obsidian/8">
        <div className="absolute inset-0 brand-gradient opacity-[0.07]" />
        <div className="absolute -right-16 -top-20 w-72 h-72 rounded-full bg-ember/10 blur-3xl" />
        <div className="absolute -left-10 bottom-0 w-56 h-56 rounded-full bg-obsidian/5 blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 pt-10 pb-8 sm:pt-14 sm:pb-12 live-sweep">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-obsidian text-white text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="w-2 h-2 rounded-full bg-ember live-beep" />
              Live
            </span>
            <span className="text-sm font-mono text-obsidian/45 live-tick tabular-nums">{nowLabel}</span>
            <span className="hidden sm:inline text-sm text-obsidian/30">· Lagos board</span>
          </div>

          <h1 className="font-logo font-black tracking-tight uppercase text-3xl sm:text-5xl lg:text-6xl text-obsidian leading-none mb-4 whitespace-nowrap overflow-hidden text-ellipsis">
            What&apos;s on <span className="brand-text">tonight</span>
          </h1>
          <p className="text-base sm:text-lg text-obsidian/55 max-w-2xl leading-relaxed mb-6">
            Doors, rooms, and drops updating across the city. Pick a night, then order to the table.
          </p>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs sm:text-sm font-black uppercase tracking-[0.14em] text-obsidian/50">
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-ember live-beep" style={{ animationDelay: '0.4s' }} />
              {tonightCount} tonight
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-obsidian/40 live-tick" />
              {VENUES.length} rooms
            </span>
            <span className="text-obsidian/30 tabular-nums" aria-hidden>
              · {String(pulse % 60).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-7 sm:py-10">
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {(['events', 'venues'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-xs font-black uppercase tracking-[0.14em] transition-colors ${
                tab === t ? 'badge-brand' : 'bg-white border border-obsidian/10 text-obsidian/50'
              }`}
            >
              {t === 'events' ? 'Events' : 'Venues'}
            </button>
          ))}

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
        </div>

        {!filtersOpen && activeFilterCount > 0 && (
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
                      When
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          ['all', 'Any time'],
                          ['tonight', 'Tonight'],
                          ['weekend', 'This weekend'],
                        ] as const
                      ).map(([id, label]) => (
                        <Chip key={id} active={when === id} onClick={() => setWhen(id)}>
                          {label}
                        </Chip>
                      ))}
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

        {tab === 'events' ? (
          events.length === 0 ? (
            <p className="text-base text-obsidian/45 py-12">
              No events in this window. Open filters and try another cut.
            </p>
          ) : (
            <div className="space-y-5 sm:space-y-6">
              {events.map((event, i) => (
                <EventRow key={event.id} event={event} here={here} index={i} />
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
