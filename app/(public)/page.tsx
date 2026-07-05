'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BedDouble,
  Flower2,
  UtensilsCrossed,
  Sparkles,
  Wine,
  Leaf,
} from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

const TICKER = ['Stay', 'Restore', 'Dine', 'Gather'];

const PILLARS = [
  {
    n: '01',
    icon: BedDouble,
    title: 'The Stay',
    body: 'Suites and garden villas that open to the water. Slow mornings, turndown at dusk, and a bed you will not want to leave.',
    href: '/stays',
    dark: false,
  },
  {
    n: '02',
    icon: Flower2,
    title: 'The Wellness',
    body: 'A spa, thermal circuit, and movement studio built around one idea — you should leave lighter than you arrived.',
    href: '/wellness',
    dark: true,
  },
  {
    n: '03',
    icon: UtensilsCrossed,
    title: 'The Table & Lounge',
    body: 'Farm-to-table dining by day, a candlelit lounge by night. One cocktail changes daily. The room is always warm.',
    href: '/dining',
    dark: false,
  },
];

const WELLNESS_POINTS = [
  'Thermal circuit — sauna, steam, cold plunge, and a heated infinity pool.',
  'Signature treatments built on African botanicals and slow ritual.',
  'Sunrise movement — yoga, breathwork, and sound baths on the deck.',
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-paper overflow-hidden min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] flex items-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-gold/15 blur-3xl animate-blob" />
          <div className="absolute top-1/3 -left-32 w-[24rem] h-[24rem] rounded-full bg-champagne/10 blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 py-8 sm:py-10 w-full">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              className="max-w-xl flex flex-col justify-center"
            >
              <motion.div variants={fadeUp}>
                <SectionLabel>A Resort &amp; Lounge</SectionLabel>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-[5.5rem] font-light brand-text leading-[0.95] mb-6 sm:mb-7"
              >
                Stay.
                <br />
                Restore.
                <br />
                <span className="inline-flex items-center gap-3 sm:gap-4">
                  <em className="italic">Gather.</em>
                  <Leaf className="text-gold-dark shrink-0 w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12" strokeWidth={1.5} aria-hidden />
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-xl sm:text-2xl text-obsidian/80 max-w-md mb-5 sm:mb-6 leading-snug">
                A place to slow down &mdash; and a{' '}
                <em className="font-display italic">reason</em> to stay the night.
              </motion.p>

              <motion.p variants={fadeUp} className="text-base sm:text-lg text-obsidian/60 max-w-md mb-8 sm:mb-9 leading-relaxed">
                Convivia24 is a resort, spa, and lounge in one &mdash; waterfront suites, a full wellness circuit, farm-to-table dining, and rooms made for gathering the people who matter.
              </motion.p>

              <motion.div variants={fadeUp} className="flex items-center gap-5 mb-10 sm:mb-12">
                <Link
                  href="/inquire"
                  className="btn-brand inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em]"
                >
                  Book a stay <ArrowRight size={14} />
                </Link>
                <Link
                  href="/wellness"
                  className="text-sm text-obsidian/70 hover:text-obsidian underline underline-offset-4 transition-colors"
                >
                  Explore wellness
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-center gap-3">
                <div className="flex items-center -space-x-2">
                  <span className="w-7 h-7 rounded-full bg-gold-light border-2 border-paper" />
                  <span className="w-7 h-7 rounded-full bg-gold-dark border-2 border-paper" />
                  <span className="w-7 h-7 rounded-full bg-obsidian border-2 border-paper" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-obsidian/45">
                  A retreat for the well-rested
                </span>
              </motion.div>
            </motion.div>

            {/* Hero card — stay preview */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
              className="relative"
            >
              <div className="brand-gradient rounded-3xl p-7 sm:p-9 text-cream shadow-[0_30px_60px_-30px_rgba(10,10,10,0.6)]">
                <div className="flex items-center gap-2.5 mb-8 text-gold border-b border-gold/25 pb-4">
                  <div className="w-4 h-px bg-gold" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em]">Tonight at Convivia24</span>
                </div>

                <div className="space-y-5">
                  {[
                    { icon: BedDouble, t: 'Garden Villa', s: 'Waterfront · turndown at dusk' },
                    { icon: Flower2, t: 'Sunset thermal circuit', s: 'Sauna · plunge · infinity pool' },
                    { icon: Wine, t: 'The Lounge', s: 'Live set from 8 · the 24 cocktail' },
                  ].map(({ icon: Icon, t, s }) => (
                    <div key={t} className="flex items-center gap-4">
                      <span className="w-11 h-11 rounded-xl bg-white/10 text-gold flex items-center justify-center shrink-0">
                        <Icon size={19} strokeWidth={1.75} />
                      </span>
                      <div>
                        <p className="text-[15px] font-medium text-cream">{t}</p>
                        <p className="text-xs text-cream/55">{s}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/inquire"
                  className="mt-8 flex items-center justify-between rounded-xl bg-gold px-5 py-3.5 text-obsidian text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gold-light transition-colors"
                >
                  Reserve your evening <ArrowRight size={14} />
                </Link>
              </div>
              <div className="absolute -z-10 -bottom-6 -right-6 w-40 h-40 rounded-full bg-gold/20 blur-2xl" />
            </motion.div>
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

      {/* Pillars */}
      <section className="bg-paper-dark">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-8 mb-12 items-start">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-light text-obsidian leading-tight">
              One place for the
              <br />
              <em className="italic">whole</em> escape.
            </h2>
            <p className="text-base text-obsidian/60 leading-relaxed max-w-md lg:justify-self-end">
              Convivia24 isn&rsquo;t a hotel with a spa bolted on. It&rsquo;s a resort built around three things done properly &mdash; where you rest, how you restore, and the table you gather around after.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {PILLARS.map(({ n, icon: Icon, title, body, href, dark }) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <Link
                  href={href}
                  className={`group block h-full rounded-2xl p-7 sm:p-8 transition-transform hover:-translate-y-1 ${dark ? 'bg-obsidian text-cream' : 'bg-cream text-obsidian'}`}
                >
                  <span className={`block text-xs font-black tracking-[0.2em] mb-8 ${dark ? 'text-gold/70' : 'text-gold-dark/70'}`}>
                    {n}
                  </span>
                  <span className={`inline-flex w-11 h-11 items-center justify-center rounded-xl mb-6 ${dark ? 'bg-white/10 text-gold' : 'bg-gold/15 text-gold-dark'}`}>
                    <Icon size={20} strokeWidth={1.75} />
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-medium mb-3">{title}</h3>
                  <p className={`text-sm leading-relaxed mb-5 ${dark ? 'text-cream/70' : 'text-obsidian/60'}`}>{body}</p>
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.15em] ${dark ? 'text-gold' : 'text-gold-dark'}`}>
                    Discover <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Wellness deep-dive */}
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
              <span className="text-[9px] font-sans font-black uppercase tracking-[0.3em]">The Wellness</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light text-cream leading-tight mb-6">
              Leave lighter than
              <br />
              you <em className="italic">arrived.</em>
            </h2>
            <p className="text-cream/65 text-base leading-relaxed mb-8 max-w-md">
              The heart of Convivia24 is its spa. A full thermal circuit, treatments rooted in African botanicals, and movement at sunrise &mdash; sequenced so a weekend feels like a week away.
            </p>
            <ul className="space-y-3 mb-9">
              {WELLNESS_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-cream/75 leading-relaxed">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold shrink-0" aria-hidden />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/wellness"
              className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-gold hover:text-gold-light transition-colors"
            >
              See the spa &amp; rituals <ArrowRight size={14} />
            </Link>
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
                <Sparkles size={16} />
              </span>
              <div>
                <p className="text-sm font-medium text-cream">A day at the spa</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/70">Sample ritual</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { time: '7:00', t: 'Sunrise yoga on the deck' },
                { time: '9:30', t: 'Thermal circuit — sauna, steam, cold plunge' },
                { time: '11:00', t: 'Signature botanical massage · 90 min' },
                { time: '13:00', t: 'Lunch at the Garden Table' },
                { time: '17:30', t: 'Sound bath & breathwork' },
              ].map(({ time, t }) => (
                <div key={time} className="flex items-center gap-4 bg-white/[0.05] rounded-xl px-4 py-3">
                  <span className="text-[11px] font-black tracking-[0.15em] text-gold/80 w-10 shrink-0">{time}</span>
                  <span className="text-sm text-cream/85">{t}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonial + CTA */}
      <section className="bg-paper">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 py-16 sm:py-24 text-center">
          <span className="font-display text-5xl text-gold-dark/70 block mb-2" aria-hidden>&ldquo;</span>
          <p className="font-display text-2xl sm:text-3xl lg:text-[2.25rem] text-obsidian leading-snug mb-6">
            We came for one night and stayed for three. The spa, the food, the room by the water &mdash;{' '}
            <em className="italic text-gold-dark">I forgot what day it was,</em> in the best way.
          </p>
          <div className="flex items-center justify-center gap-3 mb-10">
            <span className="w-10 h-10 rounded-full bg-gold-dark" />
            <div className="text-left">
              <p className="text-sm font-medium text-obsidian">Maya Ellison</p>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-obsidian/40">Guest &middot; Garden Villa</p>
            </div>
          </div>
          <Link
            href="/inquire"
            className="btn-brand inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em]"
          >
            Plan your escape <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
