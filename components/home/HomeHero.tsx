'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import HeroGuestCard from '@/components/loyalty/HeroGuestCard';

/** One cycle of distinct lines — duplicated only so the marquee loops seamlessly. */
const LINES = [
  'Drinks to the party.',
  'Events around you.',
  'Bottles to the table.',
  'Guest Card perks.',
  'Clubs & lounges.',
  'Partner wholesale.',
  'Lagos · ~90 mins.',
  "Tonight's drop.",
];

function Age18Badge() {
  return (
    <span
      className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-ember text-ember"
      title="18+"
      aria-label="Ages 18 and over"
    >
      <span className="font-wordmark-sm text-[9px] sm:text-[10px] tracking-[0.06em] leading-none">18+</span>
    </span>
  );
}

export default function HomeHero() {
  const loop = [...LINES, ...LINES];

  return (
    <section className="relative overflow-hidden bg-paper">
      <div className="relative overflow-hidden py-5 sm:py-7">
        <div className="absolute inset-0 brand-gradient opacity-70" aria-hidden />
        <div className="relative flex whitespace-nowrap animate-marquee" aria-hidden>
          {loop.map((line, i) => (
            <span
              key={`${line}-${i}`}
              className="mx-8 sm:mx-12 font-wordmark text-3xl sm:text-5xl md:text-[3.35rem] text-white"
            >
              {line}
            </span>
          ))}
        </div>
        <h1 className="sr-only">Drinks to the party. Events around you.</h1>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-10 border-b border-ember/10 grid md:grid-cols-2 gap-10 md:gap-8 items-center">
        <div className="flex flex-col items-center md:items-start gap-5">
          <div className="relative">
            <motion.img
              src="/Logo2.png"
              alt="Convivia24"
              className="w-28 h-28 sm:w-36 sm:h-36 object-contain"
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
            />
            <span className="absolute -right-1 -bottom-1 sm:right-0 sm:bottom-0 bg-paper rounded-full p-0.5">
              <Age18Badge />
            </span>
          </div>
          <p className="font-wordmark-md text-sm sm:text-base text-obsidian/55 text-center md:text-left tracking-[0.12em]">
            Your premium beverage partner
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 btn-brand text-[10px] font-wordmark-sm"
            >
              Shop drinks <ArrowRight size={12} />
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-obsidian/15 text-obsidian hover:border-ember hover:text-ember text-[10px] font-wordmark-sm transition-colors"
            >
              Tonight&apos;s events
            </Link>
          </div>
        </div>

        <HeroGuestCard />
      </div>
    </section>
  );
}
