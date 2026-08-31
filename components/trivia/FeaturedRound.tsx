'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronRight, Gift } from 'lucide-react';
import { HouseGlyph } from '@/components/trivia/TriviaIcons';
import type { TriviaRound } from '@/lib/trivia/catalog';
import { DRINKS } from '@/lib/drinks/catalog';

function BottleVisual({
  round,
  bottle,
  className = '',
}: {
  round: TriviaRound;
  bottle: (typeof DRINKS)[number] | undefined;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {bottle?.image ? (
        <motion.div
          className="absolute inset-[8%]"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image
            src={bottle.image}
            alt={bottle.name}
            fill
            sizes="(max-width: 768px) 120px, 260px"
            priority
            className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
          />
        </motion.div>
      ) : (
        <HouseGlyph glyph={round.glyph} className="w-full h-full text-white/20" />
      )}
    </div>
  );
}

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
        className="absolute -right-16 -top-20 w-64 h-64 sm:w-[420px] sm:h-[420px] rounded-full bg-ember/25 blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative p-4 sm:p-7 md:p-8">
        {/* Mobile: copy + compact bottle side by side */}
        <div className="flex gap-3 items-center md:hidden">
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/12 text-[8px] font-black uppercase tracking-[0.2em]">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-white"
                animate={{ opacity: [1, 0.25, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
              Featured
            </span>
            <h2 className="font-logo font-black uppercase tracking-tight text-xl leading-[0.95] mt-1.5">
              {round.brand}
            </h2>
            {match > 0 && (
              <p className="text-[10px] text-white/70 mt-1 tabular-nums">{match}% match</p>
            )}
            <p className="text-[12px] text-white/60 mt-1.5 leading-snug line-clamp-2">{round.pitch}</p>
          </div>
          <BottleVisual round={round} bottle={bottle} className="w-[104px] h-[140px] shrink-0" />
        </div>

        {/* Desktop: two-column layout */}
        <div className="hidden md:grid md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 min-w-0">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/12 text-[9px] font-black uppercase tracking-[0.2em]">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-white"
                animate={{ opacity: [1, 0.25, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
              Featured for you
            </span>
            <h2 className="font-logo font-black uppercase tracking-tight text-4xl lg:text-5xl leading-[0.95] mt-3">
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
            <p className="text-base text-white/65 mt-3 max-w-md leading-relaxed">{round.pitch}</p>
          </div>
          <div className="md:col-span-5">
            <BottleVisual round={round} bottle={bottle} className="aspect-square max-w-[260px] mx-auto" />
          </div>
        </div>

        <motion.div
          whileHover={{ y: -2 }}
          className="mt-3 sm:mt-5 bg-white text-obsidian p-3 sm:p-4 flex items-center gap-3 max-w-lg shadow-[0_20px_50px_-30px_rgba(0,0,0,0.9)]"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-ember/8 flex items-center justify-center shrink-0">
            <Gift size={16} className="text-ember sm:hidden" />
            <Gift size={18} className="text-ember hidden sm:block" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-[13px] sm:text-sm truncate">{round.brand} Challenge</p>
            <p className="text-[11px] sm:text-[12px] text-obsidian/50 mt-0.5">
              {round.questions.length} questions · 250 pts
            </p>
            <p className="hidden sm:block text-[11px] text-obsidian/40 mt-1">
              Pass to enter the draw for a {round.prizeLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onPlay}
            className="px-3.5 sm:px-5 py-2.5 sm:py-3 btn-brand text-[10px] font-black uppercase tracking-[0.12em] inline-flex items-center gap-1 shrink-0"
          >
            <span className="hidden sm:inline">Take the challenge</span>
            <span className="sm:hidden">Play</span>
            <ChevronRight size={14} />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
