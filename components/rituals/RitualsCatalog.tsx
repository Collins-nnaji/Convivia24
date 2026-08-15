'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { RitualCard, RitualFilters } from '@/components/rituals/RitualCard';
import {
  filterRituals,
  type AbvTrack,
  type RitualMood,
} from '@/lib/rituals/catalog';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export default function RitualsCatalog() {
  const [mood, setMood] = useState<RitualMood | 'all'>('all');
  const [track, setTrack] = useState<AbvTrack | 'all'>('all');
  const kits = useMemo(() => filterRituals({ mood, track }), [mood, track]);

  return (
    <>
      <section className="relative min-h-[58vh] bg-obsidian flex items-center overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0">
          <img src="/Homepage.png" alt="" className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/95 via-obsidian/75 to-obsidian/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-obsidian/40" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-20 w-full">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="max-w-2xl"
          >
            <motion.div variants={fadeUp}>
              <SectionLabel>Drinks experts · Lagos</SectionLabel>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl sm:text-7xl md:text-8xl font-light italic tracking-tight text-cream leading-[0.9] mb-6"
            >
              Ship the<br />evening.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-base sm:text-lg text-cream/65 max-w-lg leading-relaxed">
              Curated by cocktail and spirits specialists — not a bottle aisle. Rituals for how you restore,
              gather, and celebrate. Alcohol and non-alcoholic, same expertise. Delivery across Lagos.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="bg-cream py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <RitualFilters mood={mood} track={track} onMood={setMood} onTrack={setTrack} />
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-4"
          >
            {kits.map((kit, i) => (
              <RitualCard key={kit.slug} kit={kit} index={i} />
            ))}
          </motion.div>
          {kits.length === 0 && (
            <p className="text-obsidian/50 text-sm">No rituals match these filters. Reset and browse again.</p>
          )}
        </div>
      </section>
    </>
  );
}
