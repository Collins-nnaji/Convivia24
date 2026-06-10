'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X, MapPin, CalendarDays } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import EventCard, { type EventCardData } from '@/components/EventCard';
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/categories';

interface CityMeta { city: string; country: string; count: number }

const WHEN_OPTIONS = [
  { value: '',        label: 'Any date' },
  { value: 'today',   label: 'Today' },
  { value: 'weekend', label: 'This weekend' },
  { value: 'week',    label: 'This week' },
  { value: 'month',   label: 'This month' },
];

function DiscoverInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [cities, setCities] = useState<CityMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(params.get('q') ?? '');

  const category = params.get('category') ?? '';
  const city = params.get('city') ?? '';
  const when = params.get('when') ?? '';

  // Full city list comes from /api/meta so it never shrinks when filters narrow results.
  useEffect(() => {
    fetch('/api/meta')
      .then((r) => r.json())
      .then((d) => setCities(d.cities ?? []))
      .catch(() => setCities([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (params.get('q')) qs.set('q', params.get('q')!);
    if (category) qs.set('category', category);
    if (city) qs.set('city', city);
    if (when) qs.set('when', when);
    fetch(`/api/events?${qs.toString()}`)
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [params, category, city, when]);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    router.push(`/events?${next.toString()}`);
  }

  const hasFilters = !!(category || city || when || params.get('q'));

  return (
    <>
      {/* HERO */}
      <section className="relative bg-paper -mt-16 pt-16 overflow-hidden">
        <img src="/conv1.png" alt="" className="w-full h-[30vh] sm:h-[38vh] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-paper/70 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 -mt-24 sm:-mt-28 pb-8 z-10">
          <SectionLabel>Discover</SectionLabel>
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-light italic tracking-tight text-obsidian leading-[0.9] mb-6">
            Every event,<br />everywhere.
          </h1>

          {/* SEARCH */}
          <form
            onSubmit={(e) => { e.preventDefault(); setParam('q', query.trim()); }}
            className="flex items-center gap-3 max-w-xl bg-white border border-obsidian/15 focus-within:border-gold shadow-sm px-4 py-3"
          >
            <Search size={18} className="text-gold-dark shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events, venues, cities…"
              className="flex-1 min-w-0 bg-transparent border-0 focus:ring-0 text-obsidian text-sm placeholder-obsidian/35 outline-none p-0"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); setParam('q', ''); }} className="text-obsidian/30 hover:text-obsidian shrink-0" aria-label="Clear search">
                <X size={15} />
              </button>
            )}
            <button type="submit" className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-dark hover:text-gold shrink-0">Search</button>
          </form>
        </div>
      </section>

      {/* FILTERS */}
      <section className="bg-cream border-y border-obsidian/10 sticky top-16 z-20 backdrop-blur">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3 space-y-2.5">
          {/* Row 1: where + when */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/35 shrink-0"><MapPin size={11} /> Where</span>
            <select
              value={city}
              onChange={(e) => setParam('city', e.target.value)}
              className="shrink-0 bg-white border border-obsidian/15 text-obsidian/75 text-xs py-1.5 pl-3 pr-8 focus:ring-0 focus:border-gold"
            >
              <option value="">Everywhere</option>
              {cities.map((c) => <option key={c.city} value={c.city}>{c.city}, {c.country} ({c.count})</option>)}
            </select>
            <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/35 shrink-0 ml-2"><CalendarDays size={11} /> When</span>
            {WHEN_OPTIONS.map((w) => (
              <button
                key={w.value}
                onClick={() => setParam('when', w.value)}
                className={`shrink-0 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] border transition-colors ${when === w.value ? 'bg-obsidian text-cream border-obsidian' : 'bg-white border-obsidian/15 text-obsidian/55 hover:text-obsidian hover:border-obsidian/40'}`}
              >
                {w.label}
              </button>
            ))}
          </div>
          {/* Row 2: categories */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setParam('category', '')}
              className={`shrink-0 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] border transition-colors ${!category ? 'bg-gold text-obsidian border-gold' : 'bg-white border-obsidian/15 text-obsidian/55 hover:text-obsidian hover:border-gold/50'}`}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setParam('category', c)}
                className={`shrink-0 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] border transition-colors ${category === c ? 'bg-gold text-obsidian border-gold' : 'bg-white border-obsidian/15 text-obsidian/55 hover:text-obsidian hover:border-gold/50'}`}
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="bg-paper py-10 sm:py-14 min-h-[40vh]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
            <p className="text-obsidian/50 text-sm">
              {loading ? 'Loading…' : `${events.length} event${events.length === 1 ? '' : 's'}`}
              {city && <span className="text-gold-dark"> · {city}</span>}
              {category && <span className="text-gold-dark"> · {CATEGORY_LABELS[category]}</span>}
              {when && <span className="text-gold-dark"> · {WHEN_OPTIONS.find((w) => w.value === when)?.label}</span>}
            </p>
            {hasFilters && (
              <button onClick={() => { setQuery(''); router.push('/events'); }} className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/50 hover:text-gold-dark">
                <X size={12} /> Clear all
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="aspect-[16/10] bg-white border border-obsidian/10 animate-pulse" />)}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 bg-white border border-obsidian/10">
              <p className="font-display text-2xl italic text-obsidian mb-2">No events match that.</p>
              <p className="text-obsidian/50 text-sm mb-6">Try a different city, date or vibe — or clear your filters.</p>
              <button onClick={() => { setQuery(''); router.push('/events'); }} className="px-6 py-3 bg-gold text-obsidian text-[11px] font-black uppercase tracking-[0.2em]">Show all events</button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map((e, i) => <EventCard key={e.slug} event={e} index={i} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="bg-paper min-h-screen" />}>
      <DiscoverInner />
    </Suspense>
  );
}
