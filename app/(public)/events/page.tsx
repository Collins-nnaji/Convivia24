'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import EventCard, { type EventCardData } from '@/components/EventCard';
import DiscoverFilters, { WHEN_OPTIONS, SORT_OPTIONS } from '@/components/discover/DiscoverFilters';
import { CATEGORY_LABELS } from '@/lib/categories';

interface CityMeta { city: string; country: string; count: number }

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
  const sort = params.get('sort') ?? 'soonest';
  const searchQ = params.get('q') ?? '';

  // Keep search input in sync when URL changes (back button, shared links).
  useEffect(() => {
    setQuery(searchQ);
  }, [searchQ]);

  useEffect(() => {
    fetch('/api/meta')
      .then((r) => r.json())
      .then((d) => setCities(d.cities ?? []))
      .catch(() => setCities([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (searchQ) qs.set('q', searchQ);
    if (category) qs.set('category', category);
    if (city) qs.set('city', city);
    if (when) qs.set('when', when);
    if (sort && sort !== 'soonest') qs.set('sort', sort);
    fetch(`/api/events?${qs.toString()}`)
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [searchQ, category, city, when, sort]);

  const setParam = useCallback((key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/events?${next.toString()}`, { scroll: false });
  }, [params, router]);

  function clearAll() {
    setQuery('');
    router.push('/events', { scroll: false });
  }

  const hasFilters = !!(category || city || when || searchQ || (sort && sort !== 'soonest'));

  return (
    <>
      {/* HERO */}
      <section className="relative bg-paper -mt-16 pt-16 overflow-hidden">
        <img src="/conv1.png" alt="" className="w-full h-[28vh] sm:h-[34vh] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-paper/70 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-8 -mt-16 sm:-mt-20 pb-6 sm:pb-8 z-10">
          <SectionLabel>Discover</SectionLabel>
          <h1 className="font-display text-3xl min-[400px]:text-4xl sm:text-6xl md:text-7xl font-light italic tracking-tight text-obsidian leading-[0.92] mb-5 sm:mb-6 text-balance">
            Every event,<br />everywhere.
          </h1>

          <form
            onSubmit={(e) => { e.preventDefault(); setParam('q', query.trim()); }}
            className="flex flex-col min-[420px]:flex-row min-[420px]:items-center gap-2 min-[420px]:gap-3 max-w-xl bg-white border border-obsidian/15 focus-within:border-gold shadow-sm px-4 py-3"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Search size={18} className="text-gold-dark shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events, venues, cities…"
                className="flex-1 min-w-0 bg-transparent border-0 focus:ring-0 text-obsidian text-base sm:text-sm placeholder-obsidian/35 outline-none p-0"
              />
              {query && (
                <button type="button" onClick={() => { setQuery(''); setParam('q', ''); }} className="touch-target flex items-center justify-center text-obsidian/30 hover:text-obsidian shrink-0" aria-label="Clear search">
                  <X size={15} />
                </button>
              )}
            </div>
            <button type="submit" className="min-[420px]:shrink-0 w-full min-[420px]:w-auto text-center text-[10px] font-black uppercase tracking-[0.2em] text-gold-dark hover:text-gold py-2 min-[420px]:py-0 border-t min-[420px]:border-t-0 border-obsidian/10 min-[420px]:border-0 pt-2 min-[420px]:pt-0">Search</button>
          </form>
        </div>
      </section>

      {/* RESULTS + FILTERS */}
      <section className="bg-paper py-8 sm:py-12 min-h-[40vh]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8 lg:items-start">
            {/* Mobile / tablet: filter card above results */}
            <div className="lg:hidden mb-6">
              <DiscoverFilters
                variant="bar"
                cities={cities}
                city={city}
                when={when}
                category={category}
                sort={sort}
                onChange={setParam}
                onClear={clearAll}
                hasFilters={hasFilters}
              />
            </div>

            {/* Desktop: sticky left sidebar */}
            <aside className="hidden lg:block lg:sticky lg:top-below-nav lg:self-start">
              <DiscoverFilters
                variant="sidebar"
                cities={cities}
                city={city}
                when={when}
                category={category}
                sort={sort}
                onChange={setParam}
                onClear={clearAll}
                hasFilters={hasFilters}
              />
            </aside>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <p className="text-obsidian/50 text-sm">
                  {loading ? 'Loading…' : `${events.length} event${events.length === 1 ? '' : 's'}`}
                  {searchQ && <span className="text-gold-dark"> · &ldquo;{searchQ}&rdquo;</span>}
                  {city && <span className="text-gold-dark"> · {city}</span>}
                  {category && <span className="text-gold-dark"> · {CATEGORY_LABELS[category]}</span>}
                  {when && <span className="text-gold-dark"> · {WHEN_OPTIONS.find((w) => w.value === when)?.label}</span>}
                  {sort && sort !== 'soonest' && (
                    <span className="text-gold-dark"> · {SORT_OPTIONS.find((s) => s.value === sort)?.label}</span>
                  )}
                </p>
                {hasFilters && (
                  <button onClick={clearAll} className="lg:hidden inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/50 hover:text-gold-dark">
                    <X size={12} /> Clear all
                  </button>
                )}
              </div>

              {loading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-2 gap-5">
                  {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="aspect-[16/10] bg-white border border-obsidian/10 animate-pulse rounded-2xl" />)}
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-16 sm:py-20 bg-white border border-obsidian/10 rounded-2xl">
                  <p className="font-display text-2xl italic text-obsidian mb-2">No events match that.</p>
                  <p className="text-obsidian/50 text-sm mb-6">Try different filters or clear them to see everything.</p>
                  <button onClick={clearAll} className="px-6 py-3 bg-gold text-obsidian text-[11px] font-black uppercase tracking-[0.2em]">Show all events</button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-2 gap-5">
                  {events.map((e, i) => <EventCard key={e.slug} event={e} index={i} />)}
                </div>
              )}
            </div>
          </div>
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
