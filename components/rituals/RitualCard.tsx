'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '@/components/cart/CartProvider';
import {
  RITUAL_KITS,
  MOOD_LABELS,
  TRACK_LABELS,
  formatNgn,
  type RitualMood,
  type AbvTrack,
  type RitualKit,
} from '@/lib/rituals/catalog';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

export function RitualCard({ kit, index = 0 }: { kit: RitualKit; index?: number }) {
  const { addKit } = useCart();
  const [added, setAdded] = useState(false);

  function quickAdd() {
    addKit(kit.slug, kit.track);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <motion.article
      variants={fadeUp}
      custom={index}
      className="group border-b border-obsidian/10 pb-10"
    >
      <Link href={`/rituals/${kit.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden mb-5 bg-obsidian">
          <img
            src={kit.image}
            alt=""
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/50 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-obsidian/80 text-cream px-2.5 py-1">
              {MOOD_LABELS[kit.mood]}
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-gold/90 text-obsidian px-2.5 py-1">
              {TRACK_LABELS[kit.track]}
            </span>
          </div>
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-gold-dark/70 mb-2">
          Serves {kit.serves} · {kit.timeOfDay}
        </p>
        <h3 className="font-display text-2xl sm:text-3xl italic text-obsidian leading-tight mb-2 group-hover:text-gold-dark transition-colors">
          {kit.name}
        </h3>
        <p className="text-sm text-obsidian/55 leading-relaxed mb-4 max-w-md">{kit.tagline}</p>
      </Link>
      <div className="flex items-center justify-between gap-4">
        <p className="font-display text-xl italic text-obsidian">{formatNgn(kit.priceNgn)}</p>
        <button
          type="button"
          onClick={quickAdd}
          className="shrink-0 px-3 py-2 text-[10px] font-black uppercase tracking-[0.15em] border border-obsidian/15 text-obsidian/60 hover:border-obsidian hover:text-obsidian transition-colors"
        >
          {added ? 'Added' : 'Add'}
        </button>
      </div>
    </motion.article>
  );
}

export function RitualFilters({
  mood,
  track,
  onMood,
  onTrack,
}: {
  mood: RitualMood | 'all';
  track: AbvTrack | 'all';
  onMood: (m: RitualMood | 'all') => void;
  onTrack: (t: AbvTrack | 'all') => void;
}) {
  const moods: (RitualMood | 'all')[] = ['all', 'restore', 'gather', 'celebrate', 'focus', 'late-night'];
  const tracks: (AbvTrack | 'all')[] = ['all', 'spirit', 'zero', 'mixed'];

  return (
    <div className="space-y-4 mb-12">
      <div className="flex flex-wrap gap-2">
        {moods.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onMood(m)}
            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] transition-colors ${
              mood === m
                ? 'bg-obsidian text-cream'
                : 'bg-transparent text-obsidian/45 hover:text-obsidian border border-obsidian/10'
            }`}
          >
            {m === 'all' ? 'All moods' : MOOD_LABELS[m]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {tracks.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onTrack(t)}
            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] transition-colors ${
              track === t
                ? 'bg-gold text-obsidian'
                : 'bg-transparent text-obsidian/45 hover:text-obsidian border border-obsidian/10'
            }`}
          >
            {t === 'all' ? 'All tracks' : TRACK_LABELS[t]}
          </button>
        ))}
      </div>
      <p className="text-xs text-obsidian/40">
        {RITUAL_KITS.length} expert-curated rituals · Ships within Lagos
      </p>
    </div>
  );
}
