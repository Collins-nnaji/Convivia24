'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Camera, Compass, Receipt } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import SmartImage from '@/components/ui/SmartImage';
import VenueCard from '@/components/meetup/VenueCard';
import SplitTable from '@/components/meetup/SplitTable';
import { VENUES, getVenue, formatNaira } from '@/lib/dining/venues';
import { OPEN_TABLES, seatsLeft, tableDate, tableVenue } from '@/lib/social/tables';
import { computeBill } from '@/lib/split/compute';

const TICKER_ITEMS = [
  'Gather · Share · Remember',
  'Open tables, and a seat spare',
  'The night, kept',
  'Come alone — most people do',
  'The bill sorts itself out',
  'Lagos · Abuja · London',
  'Conviviality, on purpose',
];

const STEPS = [
  {
    num: '01',
    icon: Compass,
    title: 'Find a table',
    desc: 'Open tables are gatherings with a seat spare — a stated vibe, a place, a time, and who is already going. Some are old friends. Some are for people who moved here in January and have eaten alone since. Come with people, or come alone; most do.',
  },
  {
    num: '02',
    icon: Camera,
    title: 'Keep the night',
    desc: 'The food lands, somebody says something worth repeating, and it is gone by Tuesday. Post a photo and a line while you are still at the table, and it stays in the feed long after anyone remembers what it cost.',
  },
  {
    num: '03',
    icon: Receipt,
    title: 'Let the bill sort itself out',
    desc: 'Underneath, quietly, the real menu is doing the arithmetic — shared plates split across whoever ate them, service and VAT on each share. Nobody does maths at the end of a good evening. That is the whole job of it.',
  },
];

const PRINCIPLES = [
  {
    title: 'The table is the product',
    desc: 'Everything here exists to get more people around one, more often. Convivia24 is not a payments app that grew a social feed — it is a way to gather that happens to have done the maths already.',
  },
  {
    title: 'Money should be boring',
    desc: 'Money is what stops people saying yes: not knowing what a night costs, or dreading the end of it. Say the number at the start, out loud, once. Then nobody thinks about it again.',
  },
  {
    title: 'Nights are worth keeping',
    desc: 'A receipt is the least interesting record of an evening. The photo of the table at the point everyone stopped taking pictures — that is the one you will want in a year.',
  },
];

/* A worked example, computed with the same maths the app runs on. */
const DEMO_VENUE = getVenue('the-terrace')!;
const DEMO_PEOPLE = [
  { id: 'a', name: 'You', budget: 40000 },
  { id: 'b', name: 'Tobi', budget: 25000 },
  { id: 'c', name: 'Amara', budget: 60000 },
  { id: 'd', name: 'Kene' },
];
const DEMO_TABLE = DEMO_PEOPLE.map((p) => p.id);
const DEMO_BILL = computeBill(
  DEMO_VENUE,
  DEMO_PEOPLE,
  [
    { id: '1', itemId: 'ter-asun', qty: 2, payerIds: DEMO_TABLE },
    { id: '2', itemId: 'ter-puff', qty: 1, payerIds: DEMO_TABLE },
    { id: '3', itemId: 'ter-wagyu', qty: 1, payerIds: ['c'] },
    { id: '4', itemId: 'ter-bream', qty: 1, payerIds: ['a', 'd'] },
    { id: '5', itemId: 'ter-egusi', qty: 1, payerIds: ['b'] },
    { id: '6', itemId: 'ter-negroni', qty: 1, payerIds: ['a'] },
    { id: '7', itemId: 'ter-zobo', qty: 1, payerIds: ['b'] },
    { id: '8', itemId: 'ter-wine', qty: 1, payerIds: ['c', 'd'] },
  ],
  {},
);

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

export default function HomePage() {
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[88svh] sm:min-h-[100vh] bg-obsidian flex items-center overflow-hidden md:-mt-16 md:pt-16">
        <div className="absolute inset-0">
          <SmartImage
            src="/Homepage.png"
            alt=""
            priority
            sizes="100vw"
            wrapperClassName="w-full h-full"
            className="w-full h-full object-cover"
          />
          {/* Phone copy runs the full width, so it needs the scrim underneath it
              rather than beside it; desktop keeps the left-to-right wash. */}
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/75 to-obsidian/35 md:bg-gradient-to-r md:from-obsidian/90 md:via-obsidian/55 md:to-obsidian/15" />
          <div className="absolute inset-0 hidden md:block bg-gradient-to-t from-obsidian/70 via-transparent to-obsidian/30" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-32 w-full">
          <div className="max-w-2xl">
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
              <motion.div variants={fadeUp}>
                <SectionLabel>Gather &middot; Share &middot; Remember</SectionLabel>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] font-light italic tracking-tight text-cream leading-[0.9] mb-6 sm:mb-8"
              >
                The best nights<br />start with<br />a spare seat.
              </motion.h1>

              <motion.div variants={fadeUp} className="flex items-center gap-2 mb-4 sm:mb-6">
                <span className="w-1 h-1 rounded-full bg-gold animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold">Lagos &middot; Abuja &middot; London</span>
              </motion.div>

              <motion.p variants={fadeUp} className="text-base sm:text-lg text-cream/70 max-w-lg leading-relaxed mb-8 sm:mb-10">
                Convivia24 is for eating and drinking with people. Find a table with room at it,
                keep what happens there, and let the bill work itself out in the background &mdash;
                everyone already knows their number before the food arrives.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href="/discover"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] transition-colors"
                >
                  Find a table <ArrowRight size={14} />
                </Link>
                <Link
                  href="/moments"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-cream/30 text-cream text-[11px] font-black uppercase tracking-[0.2em] hover:border-cream/60 hover:bg-cream/5 transition-colors backdrop-blur-sm"
                >
                  See the moments
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ TICKER ═══ */}
      <div className="bg-obsidian border-y border-gold/10 overflow-hidden py-4">
        <motion.div
          className="flex whitespace-nowrap w-max"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="mx-8 text-[11px] font-black uppercase tracking-[0.3em] text-cream/20 flex items-center gap-8">
              {item}
              <span className="w-1 h-1 rounded-full bg-gold/30 inline-block" />
            </span>
          ))}
        </motion.div>
      </div>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="bg-cream py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel variant="light">What it is for</SectionLabel>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl sm:text-5xl md:text-7xl font-light italic text-obsidian tracking-tight mb-4 sm:mb-6"
            >
Show up. Stay<br />longer. Keep it.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-obsidian/60 text-base sm:text-lg max-w-2xl leading-relaxed mb-12 sm:mb-16">
              Nobody has ever gone home from a good dinner talking about the bill. They talk about who
              was there. Convivia24 is built around that, and quietly handles the rest.
            </motion.p>

            <div className="grid md:grid-cols-3 gap-8">
              {STEPS.map(({ num, icon: Icon, title, desc }) => (
                <motion.div key={num} variants={fadeUp} className="border-t border-obsidian/10 pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Icon size={16} className="text-gold-dark" strokeWidth={2} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-dark">{num}</span>
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl italic text-obsidian mb-3 leading-tight">{title}</h3>
                  <p className="text-obsidian/50 text-sm leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ OPEN TABLES ═══ */}
      <section className="bg-obsidian py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel>Open tables</SectionLabel>
            </motion.div>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <motion.h2
                variants={fadeUp}
                className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-cream tracking-tight"
              >
                Somebody is<br />already going.
              </motion.h2>
              <motion.div variants={fadeUp}>
                <Link
                  href="/discover"
                  className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-gold/70 hover:text-gold transition-colors group"
                >
                  All open tables <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>

            <div className="grid sm:grid-cols-2 gap-px bg-gold/10 border border-gold/10">
              {OPEN_TABLES.map((t) => {
                const venue = tableVenue(t);
                const left = seatsLeft(t);
                return (
                  <motion.div key={t.id} variants={fadeUp} className="bg-obsidian">
                    <Link
                      href={`/discover/${t.id}`}
                      className="group flex flex-col h-full p-6 sm:p-8 hover:bg-obsidian-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gold/60">
                          Hosted by {t.host}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-[0.12em] text-cream/35 shrink-0">
                          {left} seat{left === 1 ? '' : 's'} left
                        </span>
                      </div>
                      <h3 className="font-display text-2xl sm:text-3xl italic text-cream mb-2 group-hover:text-gold transition-colors">
                        {t.title}
                      </h3>
                      <p className="text-cream/45 text-sm leading-relaxed mb-6 flex-1">{t.vibe}</p>
                      <div className="flex items-center justify-between gap-4 border-t border-gold/10 pt-4 text-[11px]">
                        <span className="text-cream/40 truncate">
                          {venue?.name} &middot;{' '}
                          {tableDate(t).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                        <span className="font-display text-lg italic text-gold shrink-0 tabular-nums">
                          {formatNaira(t.budgetGuide)}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ WORKED EXAMPLE ═══ */}
      <section className="bg-obsidian py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel>The quiet part</SectionLabel>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
              <div>
                <motion.h2
                  variants={fadeUp}
                  className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-cream tracking-tight mb-5"
                >
                  Four people.<br />One evening.<br />No maths.
                </motion.h2>
                <motion.p variants={fadeUp} className="text-cream/50 text-base sm:text-lg leading-relaxed mb-8">
                  This runs underneath every gathering, and most of the time nobody opens it. Amara had
                  the wagyu and split a bottle with Kene. Tobi said {formatNaira(25000)} was his limit
                  before they sat down. The asun went to the middle, so all four carry a quarter of it.
                </motion.p>
                <motion.div variants={fadeUp} className="space-y-3 mb-9">
                  {[
                    'Shared plates divide only across the people actually eating them',
                    `${DEMO_VENUE.serviceChargePct}% service and ${DEMO_VENUE.vatPct}% VAT ride on each share, not on a flat quarter`,
                    'Tobi gets a nudge before he passes his number, not a shock after',
                  ].map((point) => (
                    <div key={point} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" />
                      <p className="text-cream/60 text-sm leading-relaxed">{point}</p>
                    </div>
                  ))}
                </motion.div>
                <motion.div variants={fadeUp}>
                  <Link
                    href="/meetups"
                    className="inline-flex items-center gap-2 px-7 py-3.5 border border-cream/30 text-cream text-[11px] font-black uppercase tracking-[0.2em] hover:border-cream/60 hover:bg-cream/5 transition-colors"
                  >
                    See how it works <ArrowRight size={14} />
                  </Link>
                </motion.div>
              </div>

              <motion.div variants={fadeUp} className="border border-gold/20 bg-obsidian-100 p-6 sm:p-8">
                <div className="flex items-baseline justify-between gap-4 border-b border-gold/10 pb-4 mb-2">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/60 mb-1.5">Friday, properly</p>
                    <p className="font-display text-2xl italic text-cream leading-none">{DEMO_VENUE.name}</p>
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-cream/30 shrink-0">
                    {DEMO_VENUE.area} &middot; 19:30
                  </p>
                </div>
                <SplitTable bill={DEMO_BILL} variant="dark" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ PLACES ═══ */}
      <section className="bg-obsidian py-20 sm:py-28 border-t border-gold/10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel>Where people gather</SectionLabel>
            </motion.div>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 sm:mb-12">
              <motion.h2
                variants={fadeUp}
                className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-cream tracking-tight"
              >
Rooms worth<br />sitting in.
              </motion.h2>
              <motion.div variants={fadeUp}>
                <Link
                  href="/places"
                  className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-gold/70 hover:text-gold transition-colors group"
                >
                  Every place <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {VENUES.map((v) => (
                <motion.div key={v.slug} variants={fadeUp}>
                  <VenueCard venue={v} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ IMAGE BREAK ═══ */}
      <section className="relative bg-obsidian">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <SmartImage
            src="/Convivium2.png"
            alt=""
            sizes="100vw"
            wrapperClassName="w-full h-[32vh] sm:h-[50vh]"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-obsidian/40" />
        </motion.div>
      </section>

      {/* ═══ PRINCIPLES ═══ */}
      <section className="bg-cream py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel variant="light">What we believe</SectionLabel>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl sm:text-5xl md:text-7xl font-light italic text-obsidian tracking-tight mb-12 sm:mb-16 max-w-3xl"
            >
Conviviality is a habit. This is the app that keeps it.
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-px bg-obsidian/10 border border-obsidian/10">
              {PRINCIPLES.map((p) => (
                <motion.div key={p.title} variants={fadeUp} className="bg-cream p-8 sm:p-10">
                  <h3 className="font-display text-2xl italic text-obsidian mb-4 leading-tight">{p.title}</h3>
                  <p className="text-obsidian/50 text-sm leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="bg-gold">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="font-display text-2xl sm:text-4xl italic text-obsidian mb-2">There is a seat spare.</h2>
            <p className="text-obsidian/60 text-sm">Gather &middot; Share &middot; Remember &middot; Lagos &middot; Abuja &middot; London</p>
          </div>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 px-8 py-4 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors shrink-0"
          >
            Find a table <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
