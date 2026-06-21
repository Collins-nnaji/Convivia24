'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useUser } from '@/components/auth/AuthProvider';
import CalendarAppPreview from '@/components/landing/CalendarAppPreview';
import CompanionPopout from '@/components/landing/CompanionPopout';

const HERO_POINTS = [
  'You don\u2019t need more time in a day \u2014 you need a better 24 hours.',
  'Convivia24 is the calendar that protects your peace of mind.',
  'Auto-buffers your back-to-back days.',
  'Helps you destress with one tap.',
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

export default function HomePage() {
  const { user, loading } = useUser();
  const primaryHref = user ? '/my24' : '/signin?next=/my24';
  const primaryLabel = user ? 'Open My 24' : 'Get started';

  return (
    <section className="relative bg-paper overflow-hidden min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] flex items-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-gold/15 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -left-32 w-[24rem] h-[24rem] rounded-full bg-champagne/10 blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 py-4 sm:py-5 w-full">
        <div className="grid lg:grid-cols-[1.05fr_1.3fr] gap-6 lg:gap-6 items-stretch">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="max-w-xl lg:-translate-x-2 flex flex-col justify-start lg:pt-6"
          >
            <motion.div variants={fadeUp}>
              <SectionLabel>The Mindful Calendar</SectionLabel>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-[4.75rem] font-light italic tracking-tight text-obsidian leading-none mb-3 sm:mb-4 whitespace-nowrap"
            >
              Take back your{' '}
              <span className="inline-flex items-center gap-2 sm:gap-3">
                24
                <Clock className="text-gold-dark shrink-0 w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10" strokeWidth={1.5} aria-hidden />
              </span>
              .
            </motion.h1>

            <motion.div variants={fadeUp} className="flex items-center gap-2 mb-4 sm:mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-gold-dark">
                Lower your stress · Optimize your hours · Love your day
              </span>
            </motion.div>

            <motion.ul variants={fadeUp} className="text-sm sm:text-base text-obsidian/70 max-w-lg space-y-2 mb-6 sm:mb-7 list-none">
              {HERO_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="mt-[0.55rem] w-1.5 h-1.5 rounded-full bg-gold shrink-0" aria-hidden />
                  <span>{point}</span>
                </li>
              ))}
            </motion.ul>

            <motion.div variants={fadeUp}>
              <Link
                href={loading ? '#' : primaryHref}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] transition-colors"
              >
                {primaryLabel} <ArrowRight size={14} />
              </Link>
            </motion.div>
          </motion.div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-4">
            <CalendarAppPreview />
            <CompanionPopout />
          </div>
        </div>
      </div>
    </section>
  );
}
