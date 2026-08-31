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
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image
            src={bottle.image}
            alt={bottle.name}
            fill
            sizes="(max-width: 768px) 120px, 260px"
            priority
            className="object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.5)]"
          />
        </motion.div>
      ) : (
        <HouseGlyph glyph={round.glyph} className="w-full h-full text-white/20" />
      )}
    </div>
  );
}

function PlayChallengeCard({
  round,
  onPlay,
  compact = false,
}: {
  round: TriviaRound;
  onPlay: () => void;
  compact?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`bg-white text-obsidian flex items-center gap-3 sm:gap-4 max-w-lg shadow-[0_20px_50px_-30px_rgba(0,0,0,0.9)] ${
        compact ? 'mt-3 p-3' : 'mt-6 p-4 sm:p-5'
      }`}
    >
      <div
        className={`rounded-full bg-ember/8 flex items-center justify-center shrink-0 ${
          compact ? 'w-9 h-9' : 'w-11 h-11'
        }`}
      >
        <Gift size={compact ? 16 : 19} className="text-ember" />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`font-bold truncate ${compact ? 'text-[13px]' : 'text-sm'}`}>
          {round.brand} Challenge
        </p>
        <p className={`text-obsidian/50 mt-0.5 ${compact ? 'text-[11px]' : 'text-[12px]'}`}>
          {round.questions.length} questions · {compact ? '250 pts' : 'earn 250 pts'}
        </p>
        {!compact && (
          <p className="text-[11px] text-obsidian/40 mt-1">
            Pass to enter the draw for a {round.prizeLabel}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onPlay}
        className={`btn-brand text-[10px] font-black uppercase tracking-[0.12em] inline-flex items-center gap-1 shrink-0 ${
          compact ? 'px-3.5 py-2.5' : 'px-4 sm:px-5 py-3 gap-1.5'
        }`}
      >
        <span className="hidden sm:inline">Take the challenge</span>
        <span className="sm:hidden">Play</span>
        <ChevronRight size={14} />
      </button>
    </motion.div>
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
        className="absolute -right-20 -top-24 w-[420px] h-[420px] rounded-full bg-ember/25 blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <HouseGlyph
        glyph={round.glyph}
        className="absolute right-8 top-8 w-24 h-24 text-white/10 hidden md:block"
      />

      {/* Mobile — compact side-by-side layout */}
      <div className="relative p-4 md:hidden">
        <div className="flex gap-3 items-center">
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
        <PlayChallengeCard round={round} onPlay={onPlay} compact />
      </div>

      {/* Desktop — original spacious two-column layout */}
      <div className="relative hidden md:grid md:grid-cols-12 gap-6 items-center p-6 sm:p-9">
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

          <PlayChallengeCard round={round} onPlay={onPlay} />
        </div>

        <div className="md:col-span-5">
          <BottleVisual round={round} bottle={bottle} className="aspect-square max-w-[260px] mx-auto" />
        </div>
      </div>
    </motion.div>
  );
}
