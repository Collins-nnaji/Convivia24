'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Radio, Sparkles, X } from 'lucide-react';
import type { InsightCategory } from '@/lib/insights/types';
import { CATEGORY_META } from '@/lib/insights/types';
import type { InsightPost } from '@/lib/insights/types';
import { BRAND_LOGO_SRC } from '@/lib/brand';
import { InsightsNav } from './InsightsNav';
import { WaveformHero } from './WaveformHero';
import { InsightCard } from './InsightCard';

const easeOut = [0.16, 1, 0.3, 1] as const;

const TICKER = [
  'Field truth',
  'Live ROI',
  'Guest passes',
  'Lagos · Abuja · PH',
  'Sampling science',
  'UGC moderation',
  'Agent deploy',
  '1M+ reach',
];

type Filter = 'all' | InsightCategory;

export function InsightsIndex({ posts, featured }: { posts: InsightPost[]; featured: InsightPost }) {
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return posts;
    return posts.filter(p => p.category === filter);
  }, [posts, filter]);

  const showFeatured = filter === 'all' || featured.category === filter;
  const gridPosts = showFeatured
    ? filtered.filter(p => p.slug !== featured.slug)
    : filtered;

  const categoryFilters = (Object.entries(CATEGORY_META) as [InsightCategory, (typeof CATEGORY_META)[InsightCategory]][]).map(
    ([id, m]) => ({ id, label: m.label }),
  );

  function toggleFilter(id: InsightCategory) {
    setFilter(prev => (prev === id ? 'all' : id));
  }

  return (
    <div className="min-h-screen bg-[#f8f6f2] text-neutral-900 overflow-x-hidden">
      <InsightsNav />

      {/* Masthead ticker */}
      <div className="pt-14 overflow-hidden border-b border-neutral-200/60 bg-neutral-900">
        <motion.div
          className="flex gap-12 whitespace-nowrap py-2.5 w-max"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
        >
          {[...TICKER, ...TICKER].map((t, i) => (
            <span
              key={i}
              className="text-[10px] font-black uppercase tracking-[0.35em] text-gold/90 flex items-center gap-4"
            >
              <Radio size={10} className="text-gold animate-pulse" />
              {t}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Hero — compact editorial */}
      <section className="relative px-5 sm:px-10 pt-10 sm:pt-14 pb-8 overflow-hidden bg-[#f8f6f2]">
        <div className="absolute inset-0 landing-hero-mesh pointer-events-none" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[min(60%,340px)] h-[240px] pointer-events-none select-none">
          <img
            src={BRAND_LOGO_SRC}
            alt=""
            className="w-full h-full object-contain object-right opacity-[0.06]"
            draggable={false}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-16"
          >
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.35em] text-gold-dark mb-4">
                <Sparkles size={11} />
                Convivia24 · Field intelligence
              </p>
              <h1 className="font-display text-[clamp(2.2rem,5.5vw,4rem)] font-bold leading-[1.05] tracking-tight">
                The <span className="text-gold">Signal</span>
                <span className="text-neutral-400 text-[0.52em] not-italic font-sans font-bold uppercase tracking-[0.18em] block mt-2">
                  Insights from the activation floor
                </span>
              </h1>
              <p className="mt-4 text-neutral-500 text-sm sm:text-base leading-relaxed max-w-md">
                Essays, data cuts, and ops truths from FMCG activations across Nigeria —
                published when the numbers are interesting, not when the calendar says so.
              </p>
              <Link
                href={`/insights/${featured.slug}`}
                className="mt-5 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest
                           text-neutral-900 hover:text-gold-dark transition-colors group"
              >
                Read latest issue
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="flex items-center gap-8 lg:flex-col lg:items-end lg:gap-4 shrink-0">
              <WaveformHero />
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-neutral-400">
                  Broadcasting
                </p>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold mt-0.5">
                  Issue {featured.issue}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="sticky top-14 z-40 px-5 sm:px-10 py-2.5 bg-[#f8f6f2]/95 backdrop-blur-xl border-y border-neutral-200/60">
        <div className="max-w-6xl mx-auto flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          <AnimatePresence>
            {filter !== 'all' && (
              <motion.button
                key="clear"
                initial={{ opacity: 0, scale: 0.85, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: 'auto' }}
                exit={{ opacity: 0, scale: 0.85, width: 0 }}
                transition={{ duration: 0.2 }}
                type="button"
                onClick={() => setFilter('all')}
                className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-black
                           uppercase tracking-widest bg-neutral-900 text-white overflow-hidden"
              >
                <X size={9} />
                Clear
              </motion.button>
            )}
          </AnimatePresence>
          {categoryFilters.map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => toggleFilter(f.id as InsightCategory)}
              className={`relative shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors
                ${filter === f.id ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              {filter === f.id && (
                <motion.span
                  layoutId="insight-filter-pill"
                  className="absolute inset-0 rounded-full bg-white border border-neutral-200 shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10">{f.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Bento grid */}
      <section className="px-5 sm:px-10 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: easeOut }}
            >
              {filtered.length === 0 ? (
                <p className="text-center text-neutral-500 py-16 font-medium text-sm">
                  No signals in this band yet — try another filter.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
                  {showFeatured && (
                    <InsightCard post={featured} variant="hero" index={0} />
                  )}
                  {gridPosts.map((post, i) => {
                    const variant =
                      i === 0 && !showFeatured ? 'wide' : i === 1 && showFeatured ? 'wide' : 'default';
                    return (
                      <InsightCard
                        key={post.slug}
                        post={post}
                        variant={variant}
                        index={i + (showFeatured ? 1 : 0)}
                      />
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 sm:px-10 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="max-w-6xl mx-auto rounded-[1.75rem] bg-neutral-900 p-8 sm:p-10 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'linear-gradient(rgba(201,168,76,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.08) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gold mb-2">
                Stay on frequency
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
                Building something big?
              </h2>
              <p className="mt-2 text-white/50 max-w-md text-sm leading-relaxed">
                Tell us about your next activation — we&apos;ll share relevant field notes and a tailored brief.
              </p>
            </div>
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gold text-white
                         text-[11px] font-black uppercase tracking-widest hover:bg-gold-light transition-colors shrink-0"
            >
              Get in touch <ArrowRight size={13} />
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="px-5 sm:px-10 py-8 border-t border-neutral-200/80 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-neutral-400">
          © 2025 Convivia24 · Insights
        </p>
      </footer>
    </div>
  );
}
