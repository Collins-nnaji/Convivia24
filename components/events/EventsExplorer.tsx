'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bookmark,
  Calendar,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Heart,
  Image as ImageIcon,
  LayoutGrid,
  List,
  MapPin,
  Navigation as NavIcon,
  Percent,
  Search,
  Sparkles,
  Star,
  Ticket,
  X,
} from 'lucide-react';
import NightArt, { tagToArt } from '@/components/graphics/NightArt';
import CirclesPanel from '@/components/events/CirclesPanel';
import EventsNewsletter from '@/components/events/EventsNewsletter';
import { LAGOS_AREAS, formatKm, haversineKm } from '@/lib/geo/lagos';
import {
  EVENT_TAGS,
  formatEventWhen,
  isPast,
  isThisWeekend,
  isTonight,
  type EventTag,
  type ResolvedEvent,
} from '@/lib/events/catalog';
import { useEventFeed } from '@/lib/events/use-feed';
import { useSaved } from '@/lib/shop/wishlist';
import { formatNgn } from '@/lib/drinks/catalog';

type Tab = 'events' | 'venues' | 'circles';
type WhenFilter = 'all' | 'tonight' | 'weekend';
type ViewMode = 'grid' | 'list';
type VenueKind = 'all' | 'club' | 'lounge' | 'rooftop' | 'beach' | 'live' | 'restaurant' | 'bar';

type APIVenue = {
  id: string;
  slug: string;
  name: string;
  kind: string;
  areaId: string;
  area: string;
  tagline: string;
  about: string;
  photoUrl: string | null;
  followerCount: number;
  reviewCount: number;
  avgRating: number;
  followed: boolean;
  hours: string;
  cardPerk: string;
};

const VENUE_KIND_OPTIONS: { id: VenueKind; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'club', label: 'Clubs' },
  { id: 'lounge', label: 'Lounges' },
  { id: 'rooftop', label: 'Rooftops' },
  { id: 'beach', label: 'Beach' },
  { id: 'live', label: 'Live' },
  { id: 'restaurant', label: 'Restaurants' },
  { id: 'bar', label: 'Bars' },
];

/** How many upcoming rows to show before "Load more". */
const PAGE_SIZE = 5;

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

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
  const [category, setCategory] = useState<EventTag | 'all'>('all');
  const [view, setView] = useState<ViewMode>('grid');
  const [here, setHere] = useState<{ lat: number; lng: number } | null>(null);
  const [geoMsg, setGeoMsg] = useState('');
  const [venueKind, setVenueKind] = useState<VenueKind>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [venues, setVenues] = useState<APIVenue[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [shown, setShown] = useState(PAGE_SIZE);

  useEffect(() => {
    const next = params.get('tab');
    if (next === 'venues' || next === 'circles') setTab(next);
    else if (!next) setTab('events');
  }, [params]);

  useEffect(() => {
    if (tab !== 'venues') return;
    setVenuesLoading(true);
    fetch(`/api/venues${area !== 'all' ? `?area=${area}` : ''}`)
      .then((r) => r.json())
      .then((d) => setVenues(d.venues || []))
      .catch(() => {})
      .finally(() => setVenuesLoading(false));
  }, [tab, area]);

  function selectTab(next: Tab) {
    setTab(next);
    const qs = new URLSearchParams(params.toString());
    if (next === 'events') qs.delete('tab');
    else qs.set('tab', next);
    const suffix = qs.toString();
    router.replace(suffix ? `/events?${suffix}` : '/events', { scroll: false });
  }

  function nearMe() {
    if (!navigator.geolocation) {
      setGeoMsg('Location is not available on this device.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setHere({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoMsg('Sorted by distance.');
      },
      () => setGeoMsg('Could not read location.')
    );
  }

  const upcoming = useMemo(() => {
    let list = feed.filter((e) => !isPast(e));
    if (area !== 'all') list = list.filter((e) => e.venue.areaId === area);
    if (category !== 'all') list = list.filter((e) => e.tag === category);
    if (date) list = list.filter((e) => dayKey(e.startsAt) === date);
    else if (when === 'tonight') list = list.filter(isTonight);
    else if (when === 'weekend') list = list.filter(isThisWeekend);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.venue.name.toLowerCase().includes(q) ||
          e.blurb.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
    if (here) {
      list = [...list].sort((a, b) => {
        const day = dayKey(a.startsAt).localeCompare(dayKey(b.startsAt));
        return day !== 0 ? day : haversineKm(here, a.venue) - haversineKm(here, b.venue);
      });
    }
    return list;
  }, [feed, area, when, date, category, here, searchQuery]);

  // The soonest nights lead the page; the rest fall into the list below.
  const featured = upcoming.slice(0, 3);
  const rest = upcoming.slice(3);

  const filteredVenues = useMemo(() => {
    let list = venues;
    if (venueKind !== 'all') list = list.filter((v) => v.kind === venueKind);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.area.toLowerCase().includes(q) ||
          v.tagline.toLowerCase().includes(q)
      );
    }
    return list;
  }, [venues, venueKind, searchQuery]);

  /** Live counts per tag, from the feed itself rather than a hardcoded list. */
  const categoryCounts = useMemo(() => {
    const live = feed.filter((e) => !isPast(e));
    const counts = new Map<EventTag, number>();
    for (const e of live) counts.set(e.tag, (counts.get(e.tag) ?? 0) + 1);
    return { total: live.length, counts };
  }, [feed]);

  const filtersOn =
    area !== 'all' || when !== 'all' || Boolean(date) || category !== 'all' || Boolean(here) || Boolean(searchQuery);

  function clearFilters() {
    setArea('all');
    setWhen('all');
    setDate('');
    setCategory('all');
    setHere(null);
    setGeoMsg('');
    setVenueKind('all');
    setSearchQuery('');
  }

  return (
    <div className="bg-paper min-h-screen">
      <EventsHero tonightCount={feed.filter(isTonight).length} />

      <div className="border-b border-obsidian/8 bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex gap-1">
            {(['events', 'venues', 'circles'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => selectTab(t)}
                className={`relative px-4 py-3.5 text-sm transition-colors ${
                  tab === t ? 'text-obsidian font-semibold' : 'text-obsidian/45 hover:text-obsidian/70'
                }`}
              >
                {t === 'events' ? 'Events' : t === 'venues' ? 'Venues' : 'Circles'}
                {tab === t && (
                  <motion.span layoutId="events-tab" className="absolute inset-x-3 bottom-0 h-0.5 bg-ember" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {tab === 'circles' ? (
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
          <CirclesPanel />
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6 sm:py-8">
          <Toolbar
            tab={tab}
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
            when={when}
            date={date}
            onWhen={(w) => {
              setWhen(w);
              setDate('');
            }}
            onDate={(d) => {
              setDate(d);
              setWhen('all');
            }}
            area={area}
            onArea={setArea}
            onNearMe={nearMe}
            geoMsg={geoMsg}
            category={category}
            onCategory={setCategory}
            venueKind={venueKind}
            onVenueKind={setVenueKind}
            view={view}
            onView={setView}
            filtersOn={filtersOn}
            onClear={clearFilters}
          />

          {tab === 'venues' ? (
            venuesLoading ? (
              <p className="text-center py-20 text-obsidian/40">Loading venues…</p>
            ) : filteredVenues.length === 0 ? (
              <div className="text-center py-20">
                <ImageIcon size={38} className="mx-auto text-obsidian/15 mb-4" />
                <p className="text-obsidian/50">No venues match your filters.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
                {filteredVenues.map((venue) => (
                  <VenueCard key={venue.id} venue={venue} />
                ))}
              </div>
            )
          ) : (
            <>
              {featured.length > 0 && (
                <section className="mt-8">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50">
                      Featured events
                    </h2>
                    <span className="text-[11px] text-obsidian/35">Soonest first</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {featured.map((event, i) => (
                      <FeaturedEventCard key={event.id} event={event} index={i} here={here} />
                    ))}
                  </div>
                </section>
              )}

              <div className="grid lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 items-start mt-10">
                <section className="bg-white border border-obsidian/8">
                  <div className="px-5 py-4 border-b border-obsidian/8 flex items-center justify-between gap-4">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50">
                      Upcoming events
                    </h2>
                    <span className="text-[11px] text-obsidian/35 tabular-nums">
                      {upcoming.length} listed
                    </span>
                  </div>

                  {upcoming.length === 0 ? (
                    <div className="text-center py-16 px-5">
                      <Calendar size={38} className="mx-auto text-obsidian/15 mb-4" />
                      <p className="text-obsidian/50">No events match your filters.</p>
                      {filtersOn && (
                        <button type="button" onClick={clearFilters} className="mt-3 text-sm text-ember font-medium">
                          Clear filters
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <ul className={view === 'grid' ? 'divide-y divide-obsidian/6' : 'divide-y divide-obsidian/6'}>
                        {rest.slice(0, shown).map((event, i) => (
                          <UpcomingRow key={event.id} event={event} index={i} here={here} />
                        ))}
                        {rest.length === 0 && (
                          <li className="px-5 py-10 text-center text-sm text-obsidian/40">
                            Everything on right now is in the featured row above.
                          </li>
                        )}
                      </ul>

                      {rest.length > shown && (
                        <div className="p-4 border-t border-obsidian/8">
                          <button
                            type="button"
                            onClick={() => setShown((n) => n + PAGE_SIZE)}
                            className="w-full py-3 border border-obsidian/12 text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/60 hover:border-ember hover:text-ember transition-colors inline-flex items-center justify-center gap-2"
                          >
                            Load more events <ChevronDown size={14} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </section>

                <div className="space-y-6">
                  <CategoryPanel
                    total={categoryCounts.total}
                    counts={categoryCounts.counts}
                    active={category}
                    onSelect={setCategory}
                  />
                  <PerksPanel />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-14 sm:pb-20">
        <EventsNewsletter />
      </div>
    </div>
  );
}

function EventsHero({ tonightCount }: { tonightCount: number }) {
  return (
    <div className="relative overflow-hidden border-b border-obsidian/8">
      <div className="absolute inset-0 brand-gradient opacity-[0.05]" />
      <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden md:block opacity-[0.55]">
        <NightArt kind="lounge" label="" className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/70 to-transparent" />
      </div>

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-10 pb-9 sm:pt-14 sm:pb-12">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="font-wordmark text-3xl sm:text-5xl leading-tight"
        >
          <span className="brand-text">Events</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="text-lg font-semibold text-obsidian/70 mt-3"
        >
          Discover unforgettable experiences
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.14 }}
          className="text-base text-obsidian/50 mt-2 max-w-md leading-relaxed"
        >
          From tastings and masterclasses to parties and brand nights. Find an experience near you.
        </motion.p>

        {tonightCount > 0 && (
          <p className="mt-5 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-ember">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-ember"
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            {tonightCount} on tonight
          </p>
        )}
      </div>
    </div>
  );
}

function Toolbar(props: {
  tab: Tab;
  searchQuery: string;
  onSearch: (v: string) => void;
  when: WhenFilter;
  date: string;
  onWhen: (w: WhenFilter) => void;
  onDate: (d: string) => void;
  area: string;
  onArea: (a: string) => void;
  onNearMe: () => void;
  geoMsg: string;
  category: EventTag | 'all';
  onCategory: (c: EventTag | 'all') => void;
  venueKind: VenueKind;
  onVenueKind: (k: VenueKind) => void;
  view: ViewMode;
  onView: (v: ViewMode) => void;
  filtersOn: boolean;
  onClear: () => void;
}) {
  const isEvents = props.tab === 'events';

  return (
    <div className="bg-white border border-obsidian/8 p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian/30" />
          <input
            type="text"
            value={props.searchQuery}
            onChange={(e) => props.onSearch(e.target.value)}
            placeholder={isEvents ? 'Search events, venues, brands…' : 'Search venues…'}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-obsidian/12 focus:border-ember focus:ring-0 bg-white"
          />
        </div>

        {isEvents && (
          <SelectField icon={CalendarDays} label="Date">
            <select
              value={props.date ? 'custom' : props.when}
              onChange={(e) => {
                const v = e.target.value;
                if (v === 'custom') return;
                props.onWhen(v as WhenFilter);
              }}
              className="appearance-none bg-transparent bg-none text-sm pr-6 focus:ring-0 border-0 py-0"
            >
              <option value="all">Any time</option>
              <option value="tonight">Tonight</option>
              <option value="weekend">This weekend</option>
              {props.date && <option value="custom">{props.date}</option>}
            </select>
          </SelectField>
        )}

        <SelectField icon={MapPin} label="Location">
          <select
            value={props.area}
            onChange={(e) => props.onArea(e.target.value)}
            className="appearance-none bg-transparent bg-none text-sm pr-6 focus:ring-0 border-0 py-0"
          >
            <option value="all">All Lagos</option>
            {LAGOS_AREAS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </SelectField>

        {isEvents ? (
          <SelectField icon={Sparkles} label="Category">
            <select
              value={props.category}
              onChange={(e) => props.onCategory(e.target.value as EventTag | 'all')}
              className="appearance-none bg-transparent bg-none text-sm pr-6 focus:ring-0 border-0 py-0"
            >
              <option value="all">All</option>
              {EVENT_TAGS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </SelectField>
        ) : (
          <SelectField icon={Sparkles} label="Type">
            <select
              value={props.venueKind}
              onChange={(e) => props.onVenueKind(e.target.value as VenueKind)}
              className="appearance-none bg-transparent bg-none text-sm pr-6 focus:ring-0 border-0 py-0"
            >
              {VENUE_KIND_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </SelectField>
        )}

        <button
          type="button"
          onClick={props.onNearMe}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-obsidian/12 text-[11px] font-black uppercase tracking-[0.1em] text-obsidian/60 hover:border-ember hover:text-ember transition-colors"
        >
          <NavIcon size={13} /> Near me
        </button>

        {isEvents && (
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[11px] text-obsidian/35 mr-1 hidden sm:inline">View</span>
            {(
              [
                ['grid', LayoutGrid],
                ['list', List],
              ] as [ViewMode, typeof LayoutGrid][]
            ).map(([mode, Icon]) => (
              <button
                key={mode}
                type="button"
                aria-label={`${mode} view`}
                aria-pressed={props.view === mode}
                onClick={() => props.onView(mode)}
                className={`w-9 h-9 flex items-center justify-center border transition-colors ${
                  props.view === mode
                    ? 'border-ember/30 bg-ember/8 text-ember'
                    : 'border-obsidian/12 text-obsidian/45 hover:border-obsidian/30'
                }`}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        )}
      </div>

      {isEvents && (
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-obsidian/6 flex-wrap">
          <label className="text-[11px] text-obsidian/40 inline-flex items-center gap-2">
            Pick a date
            <input
              type="date"
              value={props.date}
              onChange={(e) => props.onDate(e.target.value)}
              className="text-xs border border-obsidian/12 px-2.5 py-1.5 focus:border-ember focus:ring-0"
            />
          </label>
          {props.geoMsg && <span className="text-[11px] text-obsidian/35">{props.geoMsg}</span>}
          {props.filtersOn && (
            <button
              type="button"
              onClick={props.onClear}
              className="ml-auto text-[11px] font-black uppercase tracking-[0.1em] text-obsidian/35 hover:text-ember inline-flex items-center gap-1"
            >
              <X size={11} /> Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SelectField({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="relative inline-flex items-center gap-2 px-3.5 py-2.5 border border-obsidian/12 bg-white">
      <Icon size={14} className="text-obsidian/35 shrink-0" />
      <span className="sr-only">{label}</span>
      {children}
      <ChevronDown size={13} className="text-obsidian/30 absolute right-2.5 pointer-events-none" />
    </div>
  );
}

function SaveButton({ id, className = '' }: { id: string; className?: string }) {
  const { saved, toggle } = useSaved(id, 'events');
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        toggle();
      }}
      aria-label={saved ? 'Remove from saved' : 'Save this night'}
      aria-pressed={saved}
      className={`transition-colors ${saved ? 'text-ember' : 'text-obsidian/25 hover:text-ember'} ${className}`}
    >
      <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
    </button>
  );
}

function FeaturedEventCard({
  event,
  index,
  here,
}: {
  event: ResolvedEvent;
  index: number;
  here: { lat: number; lng: number } | null;
}) {
  const km = here ? haversineKm(here, event.venue) : null;
  const tonight = isTonight(event);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="bg-white border border-obsidian/8 hover:border-ember/35 transition-colors flex flex-col"
    >
      <div className="relative">
        <NightArt kind={tagToArt(event.tag)} label={event.tag} className="aspect-[16/10]" />
        <span className="absolute top-3 left-3 badge-brand text-[9px] font-black uppercase tracking-[0.14em] px-2.5 py-1">
          {tonight ? 'Tonight' : 'Featured'}
        </span>
        <span className="absolute top-3 right-3 w-8 h-8 bg-white/90 flex items-center justify-center">
          <SaveButton id={event.id} />
        </span>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <h3 className="font-bold leading-snug">{event.title}</h3>
        <p className="text-[12px] text-obsidian/45 mt-2 flex items-center gap-1.5">
          <MapPin size={12} className="shrink-0" /> {event.venue.name} · {event.venue.area}
          {km != null && <span className="text-obsidian/30">· {formatKm(km)}</span>}
        </p>
        <p className="text-[12px] text-ember font-medium mt-1 flex items-center gap-1.5">
          <CalendarDays size={12} className="shrink-0" /> {formatEventWhen(event)}
        </p>
        <p className="text-sm text-obsidian/55 mt-3 leading-relaxed line-clamp-2">{event.blurb}</p>

        <div className="mt-4 pt-4 border-t border-obsidian/8 flex items-center justify-between gap-3">
          <p className="text-[12px] text-obsidian/45">
            {event.coverNgn != null ? (
              <>
                Cover <span className="font-semibold text-obsidian/70">{formatNgn(event.coverNgn)}</span>
              </>
            ) : (
              'Free entry'
            )}
          </p>
          <Link
            href={`/events/${event.id}`}
            className="px-4 py-2.5 btn-brand text-[10px] font-black uppercase tracking-[0.12em]"
          >
            View & RSVP
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function UpcomingRow({
  event,
  index,
  here,
}: {
  event: ResolvedEvent;
  index: number;
  here: { lat: number; lng: number } | null;
}) {
  const km = here ? haversineKm(here, event.venue) : null;
  const month = event.startsAt.toLocaleDateString('en-NG', { month: 'short' }).toUpperCase();
  const day = event.startsAt.getDate();
  const weekday = event.startsAt.toLocaleDateString('en-NG', { weekday: 'short' }).toUpperCase();

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 6) * 0.05, duration: 0.3 }}
      className="p-4 flex items-center gap-3 sm:gap-4"
    >
      <div className="w-12 shrink-0 text-center border border-obsidian/10 py-2">
        <p className="text-[9px] font-black uppercase tracking-[0.1em] text-ember">{month}</p>
        <p className="font-logo font-black text-lg leading-none tabular-nums">{day}</p>
        <p className="text-[9px] font-black uppercase tracking-[0.1em] text-obsidian/35 mt-0.5">{weekday}</p>
      </div>

      <NightArt
        kind={tagToArt(event.tag)}
        label={event.tag}
        className="w-20 h-16 sm:w-28 sm:h-[68px] shrink-0 hidden sm:block"
      />

      <div className="min-w-0 flex-1">
        <Link href={`/events/${event.id}`} className="block">
          <p className="font-semibold text-sm leading-snug truncate hover:text-ember transition-colors">
            {event.title}
          </p>
        </Link>
        <p className="text-[12px] text-obsidian/45 mt-1 flex items-center gap-1.5 truncate">
          <MapPin size={11} className="shrink-0" /> {event.venue.name} · {event.venue.area}
          {km != null && <span className="text-obsidian/30">· {formatKm(km)}</span>}
        </p>
        <p className="text-[11px] text-obsidian/40 mt-1 flex items-center gap-1.5">
          <CalendarDays size={11} className="shrink-0" /> {formatEventWhen(event)}
        </p>
        <span className="inline-block mt-2 px-2.5 py-1 bg-obsidian/[0.04] text-[10px] font-medium text-obsidian/50">
          {event.tag}
        </span>
      </div>

      <div className="shrink-0 flex flex-col items-end gap-2">
        <Link
          href={`/events/${event.id}`}
          className="px-4 py-2.5 btn-brand text-[10px] font-black uppercase tracking-[0.12em] whitespace-nowrap"
        >
          View & RSVP
        </Link>
        <p className="text-[11px] text-obsidian/40">
          {event.coverNgn != null ? `From ${formatNgn(event.coverNgn)}` : 'Free entry'}
        </p>
      </div>

      <SaveButton id={event.id} className="shrink-0 self-start" />
    </motion.li>
  );
}

function CategoryPanel({
  total,
  counts,
  active,
  onSelect,
}: {
  total: number;
  counts: Map<EventTag, number>;
  active: EventTag | 'all';
  onSelect: (c: EventTag | 'all') => void;
}) {
  const rows: [EventTag | 'all', string, number][] = [
    ['all', 'All events', total],
    ...EVENT_TAGS.map((t) => [t, t, counts.get(t) ?? 0] as [EventTag, string, number]),
  ];

  return (
    <section className="bg-white border border-obsidian/8">
      <div className="px-5 py-4 border-b border-obsidian/8">
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50">
          Event categories
        </h2>
      </div>
      <ul className="divide-y divide-obsidian/6">
        {rows.map(([id, label, count]) => (
          <li key={id}>
            <button
              type="button"
              onClick={() => onSelect(id)}
              disabled={count === 0 && id !== 'all'}
              className={`w-full px-5 py-3 flex items-center justify-between gap-3 text-sm transition-colors disabled:opacity-35 ${
                active === id ? 'text-ember font-semibold' : 'text-obsidian/65 hover:text-ember'
              }`}
            >
              <span>{label}</span>
              <span className="text-[11px] tabular-nums px-2 py-0.5 bg-obsidian/[0.04] text-obsidian/50">
                {count}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Perks are the real programme benefits — each one links to where it is spent. */
const PERKS = [
  {
    icon: Star,
    title: 'Earn points',
    detail: 'Every RSVP you make adds points to your Guest Card.',
  },
  {
    icon: Percent,
    title: 'Tier discounts',
    detail: 'Regular tier and up takes 5–15% off every shop order.',
  },
  {
    icon: Ticket,
    title: 'Spend them here',
    detail: 'Turn points into door credit, tasting seats and bottles.',
  },
];

function PerksPanel() {
  return (
    <section className="bg-white border border-obsidian/8">
      <div className="px-5 py-4 border-b border-obsidian/8">
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50">
          Your event perks
        </h2>
      </div>
      <ul className="divide-y divide-obsidian/6">
        {PERKS.map(({ icon: Icon, title, detail }) => (
          <li key={title} className="px-5 py-4 flex items-start gap-3">
            <span className="w-9 h-9 rounded-full bg-ember/6 flex items-center justify-center shrink-0">
              <Icon size={15} className="text-ember" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{title}</span>
              <span className="block text-[12px] text-obsidian/45 mt-0.5 leading-relaxed">{detail}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="p-4 border-t border-obsidian/8">
        <Link
          href="/discover?tab=rewards-shop"
          className="w-full py-3 btn-brand text-[10px] font-black uppercase tracking-[0.12em] inline-flex items-center justify-center gap-1.5"
        >
          Explore rewards <ChevronRight size={13} />
        </Link>
      </div>
    </section>
  );
}

function VenueCard({ venue }: { venue: APIVenue }) {
  return (
    <Link
      href={`/events/venues/${venue.slug}`}
      className="group block bg-white border border-obsidian/8 hover:border-ember/35 transition-colors overflow-hidden"
    >
      <div className="relative aspect-[4/3] bg-paper overflow-hidden">
        {venue.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={venue.photoUrl}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <NightArt kind={tagToArt(venue.kind)} label={venue.kind} className="w-full h-full" />
        )}
        <span className="absolute top-3 right-3 bg-white/90 text-[10px] font-semibold text-obsidian/70 px-2.5 py-1 capitalize">
          {venue.kind}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-obsidian group-hover:text-ember transition-colors truncate">
              {venue.name}
            </h3>
            <p className="text-xs text-obsidian/40 mt-0.5 flex items-center gap-1">
              <MapPin size={11} /> {venue.area}
            </p>
          </div>
          {venue.avgRating > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <Star size={12} className="text-amber-400" fill="currentColor" />
              <span className="text-xs font-semibold text-obsidian/70">{venue.avgRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-obsidian/50 mt-2 line-clamp-2 leading-relaxed">{venue.tagline}</p>

        <div className="mt-3 flex items-center gap-4 text-xs text-obsidian/40">
          <span className="inline-flex items-center gap-1">
            <Heart size={11} /> {venue.followerCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <Star size={11} /> {venue.reviewCount} reviews
          </span>
          {venue.hours && <span className="ml-auto truncate max-w-[120px]">{venue.hours}</span>}
        </div>
      </div>
    </Link>
  );
}
