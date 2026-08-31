'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import HeroGuestCard from '@/components/loyalty/HeroGuestCard';
import TrustBadges from '@/components/shop/TrustBadges';
import { eventsEnabled } from '@/lib/features';

/** One cycle of distinct lines — duplicated only so the marquee loops seamlessly. */
const LINES = eventsEnabled
  ? [
      'Drinks to the party.',
      'Events around you.',
      'Bottles to the table.',
      'Guest Card perks.',
      'Clubs & lounges.',
      'Partner wholesale.',
      'Nationwide delivery.',
      "Tonight's drop.",
    ]
  : [
      'Drinks for your event.',
      'Plan the guest list.',
      'Bottles to the table.',
      'Party packs delivered.',
      'Guest Card perks.',
      'Build your basket.',
      'Nationwide delivery.',
      'Spirits & Champagne.',
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
      <div className="relative overflow-hidden py-3 sm:py-5">
        <div className="absolute inset-0 brand-gradient opacity-70" aria-hidden />
        <div className="relative flex whitespace-nowrap animate-marquee" aria-hidden>
          {loop.map((line, i) => (
            <span
              key={`${line}-${i}`}
              className="mx-7 sm:mx-10 font-wordmark text-2xl sm:text-4xl md:text-5xl text-white"
            >
              {line}
            </span>
          ))}
        </div>
        <h1 className="sr-only">
          {eventsEnabled
            ? 'Drinks to the party. Events around you.'
            : 'Drinks for your event. Plan it. Order it.'}
        </h1>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-5 sm:py-8 border-b border-ember/10 grid md:grid-cols-2 gap-6 md:gap-8 items-center">
        <div className="flex flex-col items-center md:items-start gap-3.5 sm:gap-5">
          <div className="relative">
            <motion.img
              src="/Logo2.png"
              alt="Convivia24"
              className="w-20 h-20 sm:w-28 sm:h-28 object-contain"
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
            />
            <span className="absolute -right-1 -bottom-1 sm:right-0 sm:bottom-0 bg-paper rounded-full p-0.5">
              <Age18Badge />
            </span>
          </div>
          <p className="font-wordmark-md text-sm sm:text-base text-obsidian/55 text-center md:text-left tracking-[0.12em]">
            {eventsEnabled ? 'Your premium beverage partner' : 'Drink supplies for events'}
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 btn-brand text-[10px] font-wordmark-sm"
            >
              Shop drinks <ArrowRight size={12} />
            </Link>
            {eventsEnabled ? (
              <Link
                href="/party-planner"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-obsidian/15 text-obsidian hover:border-ember hover:text-ember text-[10px] font-wordmark-sm transition-colors"
              >
                Party Planner
              </Link>
            ) : (
              <Link
                href="/party-planner"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 btn-brand text-[10px] font-wordmark-sm"
              >
                Party Planner <ArrowRight size={12} />
              </Link>
            )}
            <Link
              href="/shop?section=packages"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-obsidian/15 text-obsidian hover:border-ember hover:text-ember text-[10px] font-wordmark-sm transition-colors"
            >
              Event packages
            </Link>
          </div>
          <TrustBadges className="justify-center md:justify-start" />
        </div>

        <div className="hidden md:block">
          <HeroGuestCard />
        </div>
      </div>
    </section>
  );
}
