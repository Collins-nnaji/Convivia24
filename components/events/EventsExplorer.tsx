'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  ChevronDown,
  Heart,
  MapPin,
  Navigation as NavIcon,
  Search,
  SlidersHorizontal,
  Star,
  Users,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { LAGOS_AREAS, formatKm, haversineKm } from '@/lib/geo/lagos';
import {
  formatEventWhen,
  isThisWeekend,
  isTonight,
  type ResolvedEvent,
} from '@/lib/events/catalog';
import { useEventFeed } from '@/lib/events/use-feed';
import { formatNgn } from '@/lib/drinks/catalog';
import CirclesPanel from '@/components/events/CirclesPanel';

type Tab = 'events' | 'venues' | 'circles';
type WhenFilter = 'all' | 'tonight' | 'weekend';
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [venueKind, setVenueKind] = useState<VenueKind>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [venues, setVenues] = useState<APIVenue[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(false);

  useEffect(() => {
    const next = params.get('tab');
    if (next === 'venues' || next === 'circles') setTab(next);
    else if (!next) setTab('events');
  }, [params]);

  useEffect(() => {
    if (tab === 'venues') {
      setVenuesLoading(true);
      fetch(`/api/venues${area !== 'all' ? `?area=${area}` : ''}`)
        .then((r) => r.json())
        .then((d) => setVenues(d.venues || []))
        .catch(() => {})
        .finally(() => setVenuesLoading(false));
    }
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
        if (day !== 0) return day;
        return haversineKm(here, a.venue) - haversineKm(here, b.venue);
      });
    }
    return list;
  }, [feed, area, when, date, here, searchQuery]);

  const filteredVenues = useMemo(() => {
    let list = venues;
    if (venueKind !== 'all') list = list.filter((v) => v.kind === venueKind);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (v) => v.name.toLowerCase().includes(q) || v.area.toLowerCase().includes(q) || v.tagline.toLowerCase().includes(q)
      );
    }
    return list;
  }, [venues, venueKind, searchQuery]);

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

  const tonightCount = useMemo(() => feed.filter(isTonight).length, [feed]);

  function clearFilters() {
    setArea('all');
    setWhen('all');
    setDate('');
    setHere(null);
    setGeoMsg('');
    setVenueKind('all');
    setSearchQuery('');
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-4">
              <h1 className="font-bold text-lg sm:text-xl text-gray-900">
                Discover
              </h1>
              <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {tonightCount} tonight
              </div>
            </div>

            {/* Search bar */}
            <div className="relative w-full max-w-xs sm:max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={tab === 'venues' ? 'Search venues...' : 'Search events...'}
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-ember/20 focus:border-ember transition"
              />
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              className="sm:hidden p-2 text-gray-500"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 -mb-px">
            {(['events', 'venues', 'circles'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => selectTab(t)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === t
                    ? 'border-ember text-ember'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'events' ? 'Events' : t === 'venues' ? 'Venues' : 'Circles'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {tab === 'circles' ? (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CirclesPanel />
        </div>
      ) : (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-6">
            {/* Left sidebar filters */}
            <aside className={`shrink-0 w-60 ${sidebarOpen ? 'block' : 'hidden'} sm:block`}>
              <div className="sticky top-24 space-y-6">
                {/* Area filter */}
                <FilterSection title="Area">
                  <FilterChip active={area === 'all'} onClick={() => setArea('all')}>All Lagos</FilterChip>
                  {LAGOS_AREAS.map((a) => (
                    <FilterChip key={a.id} active={area === a.id} onClick={() => setArea(a.id)}>
                      {a.name}
                    </FilterChip>
                  ))}
                </FilterSection>

                {/* Date filter (events only) */}
                {tab === 'events' && (
                  <FilterSection title="When">
                    <FilterChip active={when === 'all' && !date} onClick={() => { setWhen('all'); setDate(''); }}>
                      Any time
                    </FilterChip>
                    <FilterChip active={when === 'tonight'} onClick={() => { setWhen('tonight'); setDate(''); }}>
                      Tonight
                    </FilterChip>
                    <FilterChip active={when === 'weekend'} onClick={() => { setWhen('weekend'); setDate(''); }}>
                      This weekend
                    </FilterChip>
                    <div className="pt-1">
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => { setDate(e.target.value); setWhen('all'); }}
                        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ember/20"
                      />
                    </div>
                  </FilterSection>
                )}

                {/* Venue kind filter (venues only) */}
                {tab === 'venues' && (
                  <FilterSection title="Type">
                    {VENUE_KIND_OPTIONS.map((opt) => (
                      <FilterChip key={opt.id} active={venueKind === opt.id} onClick={() => setVenueKind(opt.id)}>
                        {opt.label}
                      </FilterChip>
                    ))}
                  </FilterSection>
                )}

                {/* Near me */}
                <div>
                  <button
                    type="button"
                    onClick={nearMe}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-ember bg-ember/8 rounded-lg hover:bg-ember/15 transition"
                  >
                    <NavIcon size={14} /> Near me
                  </button>
                  {geoMsg && <p className="text-xs text-gray-400 mt-2 text-center">{geoMsg}</p>}
                </div>

                {/* Clear */}
                {(area !== 'all' || when !== 'all' || date || here || venueKind !== 'all') && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="w-full text-xs font-medium text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1"
                  >
                    <X size={12} /> Clear all filters
                  </button>
                )}
              </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">
              {tab === 'events' ? (
                events.length === 0 ? (
                  <div className="text-center py-20">
                    <Calendar size={40} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No events match your filters.</p>
                    <button type="button" onClick={clearFilters} className="mt-3 text-sm text-ember font-medium">
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {eventGroups.map((group) => (
                      <section key={group.key}>
                        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Calendar size={14} className="text-ember" />
                          {group.label}
                          <span className="text-xs font-normal text-gray-400 ml-auto">
                            {group.items.length} {group.items.length === 1 ? 'event' : 'events'}
                          </span>
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {group.items.map((event) => (
                            <EventCard key={event.id} event={event} here={here} />
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                )
              ) : venuesLoading ? (
                <div className="text-center py-20">
                  <p className="text-gray-400">Loading venues...</p>
                </div>
              ) : filteredVenues.length === 0 ? (
                <div className="text-center py-20">
                  <ImageIcon size={40} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No venues found.</p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredVenues.map((venue) => (
                    <VenueCard key={venue.id} venue={venue} />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
        active
          ? 'btn-brand shadow-sm'
          : 'bg-white text-gray-600 border border-gray-200 hover:border-ember hover:text-ember'
      }`}
    >
      {children}
    </button>
  );
}

function EventCard({ event, here }: { event: ResolvedEvent; here: { lat: number; lng: number } | null }) {
  const km = here ? haversineKm(here, event.venue) : null;
  const live = isTonight(event);
  const past = event.endsAt < new Date();

  return (
    <Link
      href={`/events/${event.id}`}
      className={`group block bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-ember hover:shadow-lg transition-all duration-300 ${past ? 'opacity-60' : ''}`}
    >
      {/* Photo placeholder */}
      <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-white/80 flex items-center justify-center mb-1">
              <Calendar size={20} className="text-slate-400" />
            </div>
          </div>
        </div>
        {past && (
          <div className="absolute top-3 left-3 bg-gray-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            Ended
          </div>
        )}
        {live && !past && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Live
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-gray-700 px-2.5 py-1 rounded-full">
          {event.tag}
        </div>
      </div>

      <div className="p-4">
        <p className="text-[11px] font-semibold text-ember mb-1">
          {formatEventWhen(event)}
        </p>
        <h3 className="font-bold text-gray-900 group-hover:text-ember transition-colors line-clamp-1">
          {event.title}
        </h3>
        <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
          {event.blurb}
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
          <span className="inline-flex items-center gap-1">
            <MapPin size={12} />
            {event.venue.name}
            {km != null && <span>· {formatKm(km)}</span>}
          </span>
          {event.coverNgn != null && (
            <span className="ml-auto font-medium text-gray-600">
              {formatNgn(event.coverNgn)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function VenueCard({ venue }: { venue: APIVenue }) {
  return (
    <Link
      href={`/events/venues/${venue.slug}`}
      className="group block bg-white rounded-xl overflow-hidden border-2 border-ember/25 hover:border-ember hover:shadow-lg transition-all duration-300"
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {venue.photoUrl ? (
          <img src={venue.photoUrl} alt={venue.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center">
              <ImageIcon size={24} className="text-gray-400" />
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-gray-700 px-2.5 py-1 rounded-full capitalize">
          {venue.kind}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 group-hover:text-ember transition-colors truncate">
              {venue.name}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <MapPin size={11} /> {venue.area}
            </p>
          </div>
          {venue.avgRating > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <Star size={12} className="text-amber-400" fill="currentColor" />
              <span className="text-xs font-semibold text-gray-700">{venue.avgRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
          {venue.tagline}
        </p>

        <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
          <span className="inline-flex items-center gap-1">
            <Heart size={11} /> {venue.followerCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <Star size={11} /> {venue.reviewCount} reviews
          </span>
          {venue.hours && (
            <span className="ml-auto text-gray-500 truncate max-w-[120px]">{venue.hours}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
