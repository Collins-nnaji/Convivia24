'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronRight, Gift } from 'lucide-react';
import { HouseGlyph } from '@/components/trivia/TriviaIcons';
import type { TriviaRound } from '@/lib/trivia/catalog';
import { DRINKS } from '@/lib/drinks/catalog';

/** The week's sponsoring house, sized like a brand takeover. */
export default function FeaturedRound({
  round,
  match,
  onPlay,
}: {
  round: TriviaRound;
  match: number;
  onPlay: () => void;
}) {
  const bottle = DRINKS.find((d) => d.slug === round.prizeSlug);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden brand-gradient text-white"
    >
      <motion.div
        aria-hidden
        className="absolute -right-20 -top-24 w-[420px] h-[420px] rounded-full bg-ember/25 blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <HouseGlyph
        glyph={round.glyph}
        className="absolute right-8 top-8 w-24 h-24 text-white/10 hidden sm:block"
      />

      <div className="relative grid md:grid-cols-12 gap-6 items-center p-6 sm:p-9">
        <div className="md:col-span-7 min-w-0">
          <span className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/12 text-[9px] font-black uppercase tracking-[0.2em]">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-white"
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            Featured for you
          </span>

          <h2 className="font-logo font-black uppercase tracking-tight text-3xl sm:text-5xl leading-[0.95] mt-4">
            {round.brand}
          </h2>

          {match > 0 && (
            <div className="flex items-center gap-3 mt-3 max-w-xs">
              <p className="text-[12px] text-white/70 whitespace-nowrap tabular-nums">
                {match}% match for your taste
              </p>
              <div className="h-[3px] flex-1 bg-white/15 overflow-hidden">
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${match}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
            </div>
          )}

          <p className="text-sm sm:text-base text-white/65 mt-4 max-w-md leading-relaxed">{round.pitch}</p>

          <motion.div
            whileHover={{ y: -2 }}
            className="mt-6 bg-white text-obsidian p-4 sm:p-5 flex items-center gap-4 max-w-lg shadow-[0_20px_50px_-30px_rgba(0,0,0,0.9)]"
          >
            <div className="w-11 h-11 rounded-full bg-ember/8 flex items-center justify-center shrink-0">
              <Gift size={19} className="text-ember" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm truncate">{round.brand} Challenge</p>
              <p className="text-[12px] text-obsidian/50 mt-0.5">
                {round.questions.length} questions · earn 250 pts
              </p>
              <p className="text-[11px] text-obsidian/40 mt-1">
                Pass to enter the draw for a {round.prizeLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={onPlay}
              className="px-4 sm:px-5 py-3 btn-brand text-[10px] font-black uppercase tracking-[0.12em] inline-flex items-center gap-1.5 shrink-0"
            >
              <span className="hidden sm:inline">Take the challenge</span>
              <span className="sm:hidden">Play</span>
              <ChevronRight size={14} />
            </button>
          </motion.div>
        </div>

        <div className="md:col-span-5">
          <div className="relative aspect-square max-w-[260px] mx-auto">
            {bottle?.image ? (
              <motion.div
                className="absolute inset-[8%]"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Image
                  src={bottle.image}
                  alt={bottle.name}
                  fill
                  sizes="260px"
                  priority
                  className="object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.5)]"
                />
              </motion.div>
            ) : (
              <HouseGlyph glyph={round.glyph} className="w-full h-full text-white/20" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
