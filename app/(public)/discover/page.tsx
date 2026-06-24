'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight, Clock, Flame, Landmark, MapPin, Mic2, Music2, PartyPopper, Sparkles, Wine,
} from 'lucide-react';
import type { CuratedEvent } from '@/lib/events/seeds';

const CATEGORY_META: Record<CuratedEvent['category'], { label: string; icon: typeof PartyPopper }> = {
  nightlife:  { label: 'Nightlife',    icon: PartyPopper },
  music:      { label: 'Live music',   icon: Music2 },
  food_drink: { label: 'Food & drink', icon: Wine },
  culture:    { label: 'Culture',      icon: Landmark },
  comedy:     { label: 'Comedy',       icon: Mic2 },
  pop_up:     { label: 'Pop-up',       icon: Sparkles },
};

const CATEGORY_ORDER: CuratedEvent['category'][] = ['nightlife', 'music', 'food_drink', 'culture', 'comedy', 'pop_up'];

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function DiscoverPage() {
  const [cities, setCities] = useState<string[]>([]);
  const [city, setCity] = useState<string>('');
  const [category, setCategory] = useState<CuratedEvent['category'] | 'all'>('all');
  const [events, setEvents] = useState<CuratedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const qs = city ? `?city=${encodeURIComponent(city)}` : '';
    fetch(`/api/events${qs}`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        setEvents(data.events || []);
        if (!city && data.cities?.length) {
          setCities(data.cities);
          setCity(data.cities[0]);
        } else if (data.cities?.length) {
          setCities(data.cities);
        }
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  const filtered = useMemo(
    () => (category === 'all' ? events : events.filter((e) => e.category === category)),
    [events, category]
  );

  return (
    <div className="bg-paper min-h-dvh pb-24 md:pb-0">
      {/* Hero */}
      <section className="discover-glow text-cream pt-20 sm:pt-28 pb-10 sm:pb-14">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10">
            <span className="w-2 h-2 rounded-full bg-ember live-dot" aria-hidden />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cream/80">
              Curated by AI &middot; refreshed daily
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light leading-[0.95] mb-4">
            What&rsquo;s <em className="italic text-gold">happening</em>
            <br />tonight.
          </h1>
          <p className="text-cream/65 text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
            Nightlife, live music, hidden bars, pop-ups — pulled from across the web and the people who actually
            know the scene, so you stop scrolling five apps to decide where to go.
          </p>

          {/* City chips */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {cities.map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  city === c
                    ? 'bg-gold text-obsidian border-gold'
                    : 'bg-white/[0.04] text-cream/70 border-white/10 hover:border-gold/40 hover:text-cream'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Category filter */}
      <div className="border-b border-obsidian/10 bg-paper-dark sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setCategory('all')}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-colors ${
              category === 'all' ? 'bg-obsidian text-cream' : 'bg-white text-obsidian/55 hover:text-obsidian border border-obsidian/10'
            }`}
          >
            <Flame size={13} /> All
          </button>
          {CATEGORY_ORDER.map((cat) => {
            const meta = CATEGORY_META[cat];
            const Icon = meta.icon;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-colors ${
                  category === cat ? 'bg-obsidian text-cream' : 'bg-white text-obsidian/55 hover:text-obsidian border border-obsidian/10'
                }`}
              >
                <Icon size={13} /> {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-obsidian/5 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-obsidian/45 py-16 text-sm">
            Nothing curated for this city and filter yet — check back soon, or try another city.
          </p>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filtered.map((event, i) => {
                const meta = CATEGORY_META[event.category];
                const Icon = meta.icon;
                return (
                  <motion.article
                    key={event.id}
                    layout
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: Math.min(i, 6) * 0.04, ease: 'easeOut' }}
                    className="group relative rounded-2xl bg-white border border-obsidian/10 p-5 hover:border-gold/40 hover:shadow-[0_8px_30px_-12px_rgba(201,168,76,0.35)] transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-gold-dark">
                        <Icon size={13} /> {meta.label}
                      </span>
                      {event.source === 'ai_curated' && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.12em] text-ember-dark bg-ember/10 px-2 py-0.5 rounded-full">
                          <Sparkles size={10} /> AI pick
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-xl font-medium text-obsidian leading-snug mb-1.5">
                      {event.title}
                    </h3>
                    <p className="text-sm text-obsidian/60 leading-relaxed mb-4">{event.summary}</p>

                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-1.5 text-xs text-obsidian/50">
                        <MapPin size={12} className="shrink-0" /> {event.venue}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-obsidian/50">
                        <Clock size={12} className="shrink-0" /> {formatWhen(event.startsAt)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-obsidian/8">
                      <div className="flex flex-wrap gap-1.5">
                        {event.vibeTags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-[10px] font-medium text-obsidian/45 bg-obsidian/5 px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-[11px] font-bold text-obsidian/55 shrink-0">{event.priceLabel}</span>
                    </div>

                    {event.sourceUrl && (
                      <a
                        href={event.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity text-obsidian/40 hover:text-gold-dark"
                        aria-label="Open source"
                      >
                        <ArrowUpRight size={16} />
                      </a>
                    )}
                  </motion.article>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </section>
    </div>
  );
}
