'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Radio, Sparkles } from 'lucide-react';
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

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All signals' },
    ...(Object.entries(CATEGORY_META) as [InsightCategory, (typeof CATEGORY_META)[InsightCategory]][]).map(
      ([id, m]) => ({ id, label: m.label }),
    ),
  ];

  return (
    <div className="min-h-screen bg-[#f8f6f2] text-neutral-900 overflow-x-hidden">
      <InsightsNav />

      {/* Masthead ticker */}
      <div className="pt-14 overflow-hidden border-b border-neutral-200/60 bg-neutral-900">
        <motion.div
          className="flex gap-12 whitespace-nowrap py-3 w-max"
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

      {/* Hero */}
      <section className="relative px-5 sm:px-10 pt-16 sm:pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 landing-hero-mesh pointer-events-none" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[min(70%,380px)] h-[280px] pointer-events-none select-none">
          <img
            src={BRAND_LOGO_SRC}
            alt=""
            className="w-full h-full object-contain object-right opacity-[0.07]"
            draggable={false}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOut }}
            className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12"
          >
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.35em] text-gold-dark mb-6">
                <Sparkles size={12} />
                Convivia24 · Field intelligence
              </p>
              <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.02] tracking-tight">
                The <span className="text-gold">Signal</span>
                <br />
                <span className="text-neutral-500 text-[0.55em] not-italic font-sans font-bold uppercase tracking-[0.2em] block mt-3">
                  Insights from the activation floor
                </span>
              </h1>
              <p className="mt-6 text-neutral-600 text-base sm:text-lg leading-relaxed max-w-lg">
                Essays, data cuts, and ops truths from FMCG activations across Nigeria — published when the
                numbers are interesting, not when the calendar says so.
              </p>
              <Link
                href={`/insights/${featured.slug}`}
                className="mt-8 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest
                           text-neutral-900 hover:text-gold-dark transition-colors group"
              >
                Read latest issue
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="lg:w-72 flex flex-col items-center gap-4">
              <WaveformHero />
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-neutral-400 text-center">
                Broadcasting · Issue {featured.issue}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-14 z-40 px-5 sm:px-10 py-4 bg-[#f8f6f2]/95 backdrop-blur-xl border-y border-neutral-200/60">
        <div className="max-w-6xl mx-auto flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {filters.map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`relative shrink-0 px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors
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
      <section className="px-5 sm:px-10 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: easeOut }}
            >
              {filtered.length === 0 ? (
                <p className="text-center text-neutral-500 py-20 font-medium">
                  No signals in this band yet — try another filter.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-fr">
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

      {/* Newsletter-style CTA */}
      <section className="px-5 sm:px-10 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: easeOut }}
          className="max-w-6xl mx-auto rounded-[2rem] bg-neutral-900 p-10 sm:p-14 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'linear-gradient(rgba(201,168,76,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.08) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gold mb-3">
                Stay on frequency
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">
                Building something big?
              </h2>
              <p className="mt-3 text-white/50 max-w-md text-sm sm:text-base">
                Tell us about your next activation — we&apos;ll share relevant field notes and a tailored brief.
              </p>
            </div>
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gold text-white
                         text-[11px] font-black uppercase tracking-widest hover:bg-gold-light transition-colors shrink-0"
            >
              Get in touch <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="px-5 sm:px-10 py-10 border-t border-neutral-200/80 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-neutral-400">
          © 2025 Convivia24 · Insights
        </p>
      </footer>
    </div>
  );
}
