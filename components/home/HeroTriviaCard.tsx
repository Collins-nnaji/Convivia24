'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Gift } from 'lucide-react';
import { DRINKS } from '@/lib/drinks/catalog';
import { TRIVIA_ROUNDS } from '@/lib/trivia/catalog';

/** Trivia promo that fills the landing hero’s right column (replaces the Guest Card showcase). */
export default function HeroTriviaCard() {
  const round = TRIVIA_ROUNDS[0];
  const bottle = DRINKS.find((drink) => drink.slug === round.prizeSlug);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="w-full max-w-[420px] mx-auto md:mx-0"
    >
      <Link
        href="/discover/trivia"
        className="group relative flex min-h-[220px] overflow-hidden rounded-2xl brand-gradient text-white sm:min-h-[260px]"
      >
        <div className="relative z-10 flex flex-1 flex-col justify-center p-5 sm:p-6">
          <p className="text-[9px] font-wordmark-sm text-white/60 mb-2">Drink trivia</p>
          <h2 className="font-wordmark text-2xl sm:text-3xl leading-tight">Know your {round.brand}?</h2>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/70">
            {round.questions.length} questions · 250 pts · draw for a {round.prizeLabel}.
          </p>
          <span className="mt-4 inline-flex w-fit items-center gap-1.5 bg-white px-4 py-2.5 text-[10px] font-wordmark-sm text-obsidian transition-transform group-hover:translate-x-1">
            Play trivia <ArrowRight size={12} />
          </span>
        </div>

        <div className="relative hidden w-[140px] shrink-0 sm:block">
          <div className="absolute inset-0 bg-ember/20 blur-3xl" aria-hidden />
          {bottle?.image && (
            <Image
              src={bottle.image}
              alt={bottle.name}
              fill
              sizes="140px"
              className="object-contain p-4 drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]"
            />
          )}
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 bg-white/10 px-2 py-1 text-[9px] font-wordmark-sm">
            <Gift size={11} /> Draw
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
