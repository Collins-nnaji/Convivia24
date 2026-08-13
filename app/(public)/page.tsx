'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Users, UtensilsCrossed, Receipt } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import VenueCard from '@/components/meetup/VenueCard';
import SplitTable from '@/components/meetup/SplitTable';
import { VENUES, getVenue, formatNaira } from '@/lib/dining/venues';
import { computeBill } from '@/lib/split/compute';

const TICKER_ITEMS = [
  'Gather · Order · Split',
  'Nobody pays here — everybody just knows',
  'Real menus, real prices',
  'Set a budget before you sit down',
  'Shared plates, split properly',
  'Lagos · Abuja · London',
  'Conviviality, costed',
];

const STEPS = [
  {
    num: '01',
    icon: Users,
    title: 'Pick the place and the people',
    desc: 'Start a meetup, choose a venue, invite the table. Everyone can say up front what they are willing to spend tonight — the number nobody normally says out loud.',
  },
  {
    num: '02',
    icon: UtensilsCrossed,
    title: 'Build the order from the real menu',
    desc: 'The venue\'s actual menu, with actual prices, right there. Plan the meal together before you arrive — who is having the wagyu, who is on zobo, which plates land in the middle of the table.',
  },
  {
    num: '03',
    icon: Receipt,
    title: 'Everyone sees their number',
    desc: 'Shared plates divide across whoever is eating them. Service charge and VAT ride along on each share. The total updates as the order does, and every person watches their own line move.',
  },
];

const PRINCIPLES = [
  {
    title: 'No money moves through us',
    desc: 'Convivia24 is not a wallet, not an escrow, and not a payment app. You settle at the till the way you always have. What we remove is the arithmetic, the awkwardness, and the surprise.',
  },
  {
    title: 'The bill stops being a negotiation',
    desc: 'Nobody subsidises the person who ordered three cocktails. Nobody quietly eats the cost of the wine they did not drink. Everyone arrives already agreed, because everyone could see it coming.',
  },
  {
    title: 'The menu is the plan',
    desc: 'Meal planning and bill splitting are the same act, done in the same place. Decide what the evening is, and the cost of that evening is simply the other side of the decision.',
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
      <section className="relative min-h-[90vh] sm:min-h-[100vh] bg-obsidian flex items-center overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0">
          <img src="/Homepage.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/90 via-obsidian/55 to-obsidian/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-obsidian/30" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-32 w-full">
          <div className="max-w-2xl">
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
              <motion.div variants={fadeUp}>
                <SectionLabel>Gather &middot; Order &middot; Split</SectionLabel>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] font-light italic tracking-tight text-cream leading-[0.9] mb-6 sm:mb-8"
              >
                Know what<br />dinner costs<br />before you go.
              </motion.h1>

              <motion.div variants={fadeUp} className="flex items-center gap-2 mb-4 sm:mb-6">
                <span className="w-1 h-1 rounded-full bg-gold animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold">Lagos &middot; Abuja &middot; London</span>
              </motion.div>

              <motion.p variants={fadeUp} className="text-base sm:text-lg text-cream/70 max-w-lg leading-relaxed mb-8 sm:mb-10">
                Convivia24 is where a table plans the meal and sees the split in the same place.
                Pull up the real menu, build the order together, and watch everyone&apos;s share settle
                in real time. No money changes hands here &mdash; you just stop guessing.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href="/meetups/new"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] transition-colors"
                >
                  Start a meetup <ArrowRight size={14} />
                </Link>
                <Link
                  href="/places"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-cream/30 text-cream text-[11px] font-black uppercase tracking-[0.2em] hover:border-cream/60 hover:bg-cream/5 transition-colors backdrop-blur-sm"
                >
                  Browse menus
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
              <SectionLabel variant="light">How it works</SectionLabel>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl sm:text-5xl md:text-7xl font-light italic text-obsidian tracking-tight mb-4 sm:mb-6"
            >
              Three steps, and<br />the bill is solved.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-obsidian/60 text-base sm:text-lg max-w-2xl leading-relaxed mb-12 sm:mb-16">
              Eating out with friends fails in one predictable place: the end. Convivia24 moves that
              moment to the beginning, where it costs nothing.
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
              <SectionLabel>A real table</SectionLabel>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
              <div>
                <motion.h2
                  variants={fadeUp}
                  className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-cream tracking-tight mb-5"
                >
                  Four people.<br />One evening.<br />No arguments.
                </motion.h2>
                <motion.p variants={fadeUp} className="text-cream/50 text-base sm:text-lg leading-relaxed mb-8">
                  Amara ordered the wagyu and split a bottle with Kene. Tobi had the ẹ̀gúsí and a zobo,
                  and told the table he had {formatNaira(25000)} in him tonight. The asun and the puff puff
                  went to the middle, so all four carry a quarter each.
                </motion.p>
                <motion.div variants={fadeUp} className="space-y-3 mb-9">
                  {[
                    'Shared plates divide only across the people actually eating them',
                    `${DEMO_VENUE.serviceChargePct}% service and ${DEMO_VENUE.vatPct}% VAT ride on each share, not on a flat quarter`,
                    'Anyone over their stated budget is flagged while there is still time to change the order',
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
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] transition-colors"
                  >
                    Open this meetup <ArrowRight size={14} />
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
              <SectionLabel>The places</SectionLabel>
            </motion.div>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 sm:mb-12">
              <motion.h2
                variants={fadeUp}
                className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-cream tracking-tight"
              >
                Menus you can<br />plan against.
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
          <img src="/Convivium2.png" alt="" className="w-full h-[40vh] sm:h-[50vh] object-cover" />
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
              <SectionLabel variant="light">What we are</SectionLabel>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl sm:text-5xl md:text-7xl font-light italic text-obsidian tracking-tight mb-12 sm:mb-16 max-w-3xl"
            >
              Conviviality is easier when the maths is already done.
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
            <h2 className="font-display text-2xl sm:text-4xl italic text-obsidian mb-2">Who is eating?</h2>
            <p className="text-obsidian/60 text-sm">Gather &middot; Order &middot; Split &middot; Nobody pays here</p>
          </div>
          <Link
            href="/meetups/new"
            className="inline-flex items-center gap-2 px-8 py-4 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors shrink-0"
          >
            Start a meetup <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
