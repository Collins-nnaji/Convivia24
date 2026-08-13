'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Search } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import VenueCard from '@/components/meetup/VenueCard';
import { VENUES } from '@/lib/dining/venues';

const BANDS = [
  { label: 'Any price', value: 0 },
  { label: '₦', value: 1 },
  { label: '₦₦', value: 2 },
  { label: '₦₦₦', value: 3 },
  { label: '₦₦₦₦', value: 4 },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export default function PlacesPage() {
  const [query, setQuery] = useState('');
  const [band, setBand] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return VENUES.filter((v) => {
      if (band && v.priceBand !== band) return false;
      if (!q) return true;
      const haystack = [v.name, v.area, v.city, v.cuisine, v.blurb]
        .concat(v.sections.flatMap((s) => s.items.map((i) => i.name)))
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, band]);

  return (
    <div className="bg-obsidian min-h-screen">
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-20 sm:pb-28">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
          <motion.div variants={fadeUp}>
            <SectionLabel>The places</SectionLabel>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-display text-4xl sm:text-6xl md:text-7xl font-light italic text-cream tracking-tight mb-4 sm:mb-6"
          >
            Every menu,<br />every price.
          </motion.h1>
          <motion.p variants={fadeUp} className="text-cream/50 text-base sm:text-lg max-w-2xl leading-relaxed mb-10">
            Search by dish, by neighbourhood, or by what the table can afford. Open a place to read the
            full menu and see what an evening there actually comes to, all in.
          </motion.p>

          {/* Filters */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mb-10 sm:mb-12">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/30" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Suya, Yaba, bottomless mimosa…"
                aria-label="Search places and dishes"
                className="w-full bg-transparent border border-gold/20 focus:border-gold/60 text-cream placeholder:text-cream/25 text-sm pl-11 pr-4 py-3.5 outline-none focus:ring-0 transition-colors"
              />
            </div>
            <div className="flex gap-px bg-gold/10 border border-gold/20 overflow-x-auto scrollbar-hide">
              {BANDS.map((b) => (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => setBand(b.value)}
                  className={`px-4 sm:px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-colors ${
                    band === b.value ? 'bg-gold text-obsidian' : 'bg-obsidian text-cream/45 hover:text-cream'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </motion.div>

          {results.length === 0 ? (
            <motion.div variants={fadeUp} className="border border-gold/10 p-12 text-center">
              <p className="font-display text-2xl italic text-cream mb-2">Nothing matches that.</p>
              <p className="text-cream/40 text-sm">Try a dish name, or clear the price filter.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {results.map((v) => (
                <motion.div key={v.slug} variants={fadeUp}>
                  <VenueCard venue={v} />
                </motion.div>
              ))}
            </div>
          )}

          <motion.div variants={fadeUp} className="mt-12 border-t border-gold/10 pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-cream/40 text-sm">
              Know a place that belongs here? Menus are added city by city.
            </p>
            <Link
              href="/meetups/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] transition-colors self-start"
            >
              Start a meetup <ArrowRight size={14} />
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
