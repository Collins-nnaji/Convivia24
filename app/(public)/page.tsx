'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Smile, Star, Users } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useUser } from '@/components/auth/AuthProvider';
import CalendarAppPreview from '@/components/landing/CalendarAppPreview';
import CompanionPopout from '@/components/landing/CompanionPopout';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

const TICKER = ['Plan your day', 'Match your mood', 'Find things to do', 'Plan it together'];

const FEATURES = [
  {
    n: '01',
    icon: Smile,
    title: 'Plans around your mood',
    body: 'Tell Convivia how you want to feel. It shapes the day to match — slow and quiet, or full and bright.',
    dark: false,
  },
  {
    n: '02',
    icon: Star,
    title: 'Finds things to do',
    body: 'Events, activities, places to be — surfaced for the time you actually have and the mood you’re in.',
    dark: true,
  },
  {
    n: '03',
    icon: Users,
    title: 'Better, together',
    body: 'Invite the people in your orbit. Plan, vote, and lock in plans without the endless back-and-forth.',
    dark: false,
  },
];

const COMPANION_POINTS = [
  'Reads your mood — and finds events and activities that fit it.',
  'Pulls in your people, so plans happen without the back-and-forth.',
  'Learns your rhythm, so the good days repeat themselves.',
];

export default function HomePage() {
  const { user, loading } = useUser();
  const primaryHref = user ? '/my24' : '/signin?next=/my24';
  const primaryLabel = user ? 'Open My 24' : 'Get started';

  return (
    <>
      {/* Hero */}
      <section className="relative bg-paper overflow-hidden min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] flex items-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-gold/15 blur-3xl animate-blob" />
          <div className="absolute top-1/3 -left-32 w-[24rem] h-[24rem] rounded-full bg-champagne/10 blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 py-8 sm:py-10 w-full">
          <div className="grid lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-10 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              className="max-w-xl flex flex-col justify-center"
            >
              <motion.div variants={fadeUp}>
                <SectionLabel>Your 24-Hour Companion</SectionLabel>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-[5.5rem] font-light text-obsidian leading-[0.95] mb-6 sm:mb-7"
              >
                Take back
                <br />
                your{' '}
                <span className="inline-flex items-center gap-3 sm:gap-4">
                  <em className="italic">24</em>
                  <Clock className="text-gold-dark shrink-0 w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12" strokeWidth={1.5} aria-hidden />
                  <span className="w-2.5 h-2.5 rounded-full bg-gold self-end mb-2" aria-hidden />
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-xl sm:text-2xl text-obsidian/80 max-w-md mb-5 sm:mb-6 leading-snug">
                You don&rsquo;t need more time in a day — you need a{' '}
                <em className="font-display italic">better</em> 24 hours.
              </motion.p>

              <motion.p variants={fadeUp} className="text-base sm:text-lg text-obsidian/60 max-w-md mb-8 sm:mb-9 leading-relaxed">
                Convivia24 is the companion for your whole day — it plans your events and activities, finds things that suit your mood, and brings your people along to make it happen.
              </motion.p>

              <motion.div variants={fadeUp} className="flex items-center gap-5 mb-10 sm:mb-12">
                <Link
                  href={loading ? '#' : primaryHref}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] transition-colors"
                >
                  {primaryLabel} <ArrowRight size={14} />
                </Link>
                <Link
                  href="/companion"
                  className="text-sm text-obsidian/70 hover:text-obsidian underline underline-offset-4 transition-colors"
                >
                  See how it works
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-center gap-3">
                <div className="flex items-center -space-x-2">
                  <span className="w-7 h-7 rounded-full bg-gold-light border-2 border-paper" />
                  <span className="w-7 h-7 rounded-full bg-gold-dark border-2 border-paper" />
                  <span className="w-7 h-7 rounded-full bg-obsidian border-2 border-paper" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-obsidian/45">
                  Reclaiming time for 12,000+ calm humans
                </span>
              </motion.div>
            </motion.div>

            <div className="relative flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-4">
              <CalendarAppPreview />
              <CompanionPopout />
            </div>
          </div>
        </div>
      </section>

      {/* Ticker bar */}
      <div className="border-t border-b border-obsidian/10 bg-paper-dark">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-4 flex items-center gap-8 overflow-x-auto">
          {TICKER.map((label, i) => (
            <span key={label} className="flex items-center gap-8 shrink-0">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-obsidian/50">{label}</span>
              {i < TICKER.length - 1 && <span className="text-gold-dark/60 text-sm">+</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="bg-paper-dark">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-8 mb-12 items-start">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-light text-obsidian leading-tight">
              A companion for
              <br />
              your <em className="italic">whole</em> 24.
            </h2>
            <p className="text-base text-obsidian/60 leading-relaxed max-w-md lg:justify-self-end">
              Convivia24 isn&rsquo;t just where your time lives — it&rsquo;s how you spend it well. It reads your mood, finds things worth doing, defends your downtime, and brings your people along for the good parts.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {FEATURES.map(({ n, icon: Icon, title, body, dark }) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`rounded-2xl p-7 sm:p-8 ${dark ? 'bg-obsidian text-cream' : 'bg-cream text-obsidian'}`}
              >
                <span className={`block text-xs font-black tracking-[0.2em] mb-8 ${dark ? 'text-gold/70' : 'text-gold-dark/70'}`}>
                  {n}
                </span>
                <span className={`inline-flex w-11 h-11 items-center justify-center rounded-xl mb-6 ${dark ? 'bg-white/10 text-gold' : 'bg-gold/15 text-gold-dark'}`}>
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-medium mb-3">{title}</h3>
                <p className={`text-sm leading-relaxed ${dark ? 'text-cream/70' : 'text-obsidian/60'}`}>{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Companion deep-dive */}
      <section className="bg-obsidian text-cream">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2.5 mb-8 text-gold border-b border-gold/30 pb-1">
              <div className="w-4 h-px bg-gold" />
              <span className="text-[9px] font-sans font-black uppercase tracking-[0.3em]">Meet Your Companion</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light text-cream leading-tight mb-6">
              Plan around what
              <br />
              <em className="italic">matters</em> to you.
            </h2>
            <p className="text-cream/65 text-base leading-relaxed mb-8 max-w-md">
              Convivia&rsquo;s Companion doesn&rsquo;t bark reminders. It asks how you&rsquo;re feeling, suggests things worth doing, and pulls your people in — shaping tomorrow around your answer. One conversation, one better day.
            </p>
            <ul className="space-y-3">
              {COMPANION_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-cream/75 leading-relaxed">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold shrink-0" aria-hidden />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
            className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-7"
          >
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-white/10">
              <span className="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-obsidian">
                <Star size={16} />
              </span>
              <div>
                <p className="text-sm font-medium text-cream">Companion</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/70">Planning tomorrow</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-white/[0.06] rounded-xl px-4 py-3 max-w-[85%]">
                <p className="text-sm italic text-cream/90">What kind of day do you want tomorrow?</p>
              </div>
              <div className="flex justify-end">
                <div className="bg-gold rounded-xl px-4 py-3 max-w-[85%]">
                  <p className="text-sm text-obsidian">Something easy and fun in the evening — with Sam.</p>
                </div>
              </div>
              <div className="bg-white/[0.06] rounded-xl px-4 py-3 max-w-[90%]">
                <p className="text-sm text-cream/90 leading-relaxed">
                  Found a rooftop dinner you&rsquo;ll both love at 7, kept your afternoon calm, and sent Sam an invite.{' '}
                  <span className="text-gold underline underline-offset-2">Your evening&rsquo;s set.</span>
                </p>
              </div>
              <div className="flex items-center gap-1 pl-1 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cream/30" />
                <span className="w-1.5 h-1.5 rounded-full bg-cream/30" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonial + CTA */}
      <section className="bg-paper">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 py-16 sm:py-24 text-center">
          <span className="font-display text-5xl text-gold-dark/70 block mb-2" aria-hidden>&ldquo;</span>
          <p className="font-display text-2xl sm:text-3xl lg:text-[2.25rem] text-obsidian leading-snug mb-6">
            I stopped negotiating with my own calendar. Now it{' '}
            <em className="italic text-gold-dark">negotiates for me</em> — and I actually have my evenings back.
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="w-10 h-10 rounded-full bg-gold-dark" />
            <div className="text-left">
              <p className="text-sm font-medium text-obsidian">Maya Ellison</p>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-obsidian/40">Design Lead &middot; 6 months in</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
