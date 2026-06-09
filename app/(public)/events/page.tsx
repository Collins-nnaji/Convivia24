'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import EventCard, { type EventCardData } from '@/components/EventCard';
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/categories';

function DiscoverInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(params.get('q') ?? '');

  const category = params.get('category') ?? '';
  const city = params.get('city') ?? '';

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (params.get('q')) qs.set('q', params.get('q')!);
    if (category) qs.set('category', category);
    if (city) qs.set('city', city);
    fetch(`/api/events?${qs.toString()}`)
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [params, category, city]);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    router.push(`/events?${next.toString()}`);
  }

  const cities = Array.from(new Set(events.map((e) => e.city))).sort();
  const hasFilters = !!(category || city || params.get('q'));

  return (
    <>
      {/* HERO */}
      <section className="relative bg-obsidian -mt-16 pt-16 overflow-hidden">
        <img src="/conv1.png" alt="" className="w-full h-[32vh] sm:h-[40vh] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/80 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 -mt-28 pb-10 z-10">
          <SectionLabel>Discover</SectionLabel>
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-light italic tracking-tight text-cream leading-[0.9] mb-6">
            Every event<br />worth your night.
          </h1>

          {/* SEARCH */}
          <form
            onSubmit={(e) => { e.preventDefault(); setParam('q', query.trim()); }}
            className="flex items-center gap-3 max-w-xl bg-obsidian/80 backdrop-blur border border-gold/20 focus-within:border-gold/50 px-4 py-3"
          >
            <Search size={18} className="text-gold/60 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events, venues, cities…"
              className="flex-1 bg-transparent border-0 focus:ring-0 text-cream text-sm placeholder-cream/30 outline-none p-0"
            />
            <button type="submit" className="text-[10px] font-black uppercase tracking-[0.2em] text-gold hover:text-gold-light shrink-0">Search</button>
          </form>
        </div>
      </section>

      {/* FILTERS */}
      <section className="bg-obsidian border-y border-gold/10 sticky top-16 z-20 backdrop-blur">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setParam('category', '')}
            className={`shrink-0 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] border transition-colors ${!category ? 'bg-gold text-obsidian border-gold' : 'border-gold/20 text-cream/50 hover:text-cream'}`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setParam('category', c)}
              className={`shrink-0 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] border transition-colors ${category === c ? 'bg-gold text-obsidian border-gold' : 'border-gold/20 text-cream/50 hover:text-cream'}`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </section>

      {/* RESULTS */}
      <section className="bg-obsidian py-12 sm:py-16 min-h-[40vh]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <p className="text-cream/40 text-sm">
              {loading ? 'Loading…' : `${events.length} event${events.length === 1 ? '' : 's'}`}
              {category && <span className="text-gold"> · {CATEGORY_LABELS[category]}</span>}
              {city && <span className="text-gold"> · {city}</span>}
            </p>
            <div className="flex items-center gap-2">
              {cities.length > 1 && (
                <select
                  value={city}
                  onChange={(e) => setParam('city', e.target.value)}
                  className="bg-obsidian-100 border border-gold/20 text-cream/70 text-xs py-1.5 pl-3 pr-8 focus:ring-0 focus:border-gold/50"
                >
                  <option value="">All cities</option>
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
              {hasFilters && (
                <button onClick={() => router.push('/events')} className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] text-cream/40 hover:text-gold">
                  <X size={12} /> Clear
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="aspect-[16/10] bg-obsidian-100 border border-gold/10 animate-pulse" />)}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 border border-gold/10">
              <p className="font-display text-2xl italic text-cream mb-2">No events match that.</p>
              <p className="text-cream/40 text-sm mb-6">Try a different vibe or clear your filters.</p>
              <button onClick={() => router.push('/events')} className="px-6 py-3 bg-gold text-obsidian text-[11px] font-black uppercase tracking-[0.2em]">Show all events</button>
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
    <Suspense fallback={<div className="bg-obsidian min-h-screen" />}>
      <DiscoverInner />
    </Suspense>
  );
}
