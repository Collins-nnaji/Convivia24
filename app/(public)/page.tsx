'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';

const TICKER_ITEMS = [
  'Come to the Table',
  'Lagos · Abuja · London',
  'The Convivium',
  'Where African Business Convenes',
  'The Floor · The Table · Wellness',
  'Chambers · Deal Rooms · The Library',
  'A Hotel. A Club. A Network.',
  'Come to the Table',
];

const SPACES = [
  { num: '01', name: 'The Floor', desc: 'Not a lobby. A living room for the continent\'s most ambitious.', image: '/The Spaces.png' },
  { num: '02', name: 'The Table', desc: 'A destination restaurant. Open to the city. Reserved for the serious.', image: '/Convivium3.png' },
  { num: '03', name: 'Chambers', desc: 'Rooms built for recovery and performance. Zero clutter. Total command.', image: '/The Spaces2.png' },
  { num: '04', name: 'Deal Rooms', desc: 'Private meeting rooms named after African cities. Every conversation matters.', image: '/dealrooms.png' },
  { num: '05', name: 'The Library', desc: 'A quiet floor for thinking. No phones. Just ideas.', image: '/Convivium.png' },
  { num: '06', name: 'Wellness & Relaxation', desc: 'A sanctuary for recovery. Spa, plunge pool, and quiet spaces to restore.', image: '/The Spaces3.png' },
];

const LOCATIONS = [
  { city: 'Lagos', label: 'The Flagship', desc: 'Victoria Island. The mother house. Where the deals move and the culture is loudest.' },
  { city: 'Abuja', label: 'The Capital', desc: 'Political energy. Diplomatic corridors. A different table, the same philosophy.' },
  { city: 'London', label: 'The Bridge', desc: 'Mayfair. The diaspora\'s home. The bridge for international partners engaging Africa.' },
];

const PILLARS = [
  { num: '01', title: 'The Hotel', desc: 'Not just accommodation. A headquarters for ambition. Every guest is here because they\'re building, closing, or celebrating.' },
  { num: '02', title: 'The Club', desc: 'The Convivium. A members\' network with a hotel attached. Annual access to every table, every room, every introduction.' },
  { num: '03', title: 'The Network', desc: 'You will leave with more than you arrived with. More relationships, more ideas, more deals, more energy.' },
];

const PROGRAMMING = [
  {
    frequency: 'Annual',
    name: 'The Gathering',
    desc: 'A three-day leadership summit bringing together Convivia24 members, partners, and thinkers across Africa and the diaspora. By invitation only.',
  },
  {
    frequency: 'Monthly',
    name: 'Convivia Dinners',
    desc: 'Twelve people. One table. An agenda set by a member with something to say. No phones. No panels. Just conversation.',
  },
  {
    frequency: 'Quarterly',
    name: 'Founder Residency',
    desc: 'Thirty days of space, structure, and introductions for founders at a critical moment in their build. Applications open to members.',
  },
];

const QUOTES = [
  {
    text: 'I have stayed in finer hotels. I have never been in a room that so reliably puts the right people in front of me.',
    name: 'Chidi O.',
    role: 'Managing Director · Lagos',
  },
  {
    text: 'The Convivium is the only subscription on my P&L I would never cut. Every visit returns more than it costs.',
    name: 'Amara K.',
    role: 'Founder · Abuja',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export default function HomePage() {
  return (
    <>
      {/* ═══════════════════════════ HERO ═══════════════════════════ */}
      <section className="relative min-h-[90vh] sm:min-h-[100vh] bg-obsidian flex items-center overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0">
          <img src="/Homepage.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/90 via-obsidian/55 to-obsidian/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-obsidian/30" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-32 w-full">
          <div className="max-w-2xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            >
              <motion.div variants={fadeUp}>
                <SectionLabel>A Hotel. A Club. A Table.</SectionLabel>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light italic tracking-tight text-cream leading-[0.9] mb-6 sm:mb-8"
              >
                Come to<br />the Table.
              </motion.h1>

              <motion.div variants={fadeUp} className="flex items-center gap-2 mb-4 sm:mb-6">
                <span className="w-1 h-1 rounded-full bg-gold animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold">Lagos &middot; Abuja &middot; London</span>
              </motion.div>

              <motion.p variants={fadeUp} className="text-base sm:text-lg text-cream/70 max-w-lg leading-relaxed mb-8 sm:mb-10">
                Convivia24 is a luxury hotel and members club built for the people shaping African business.
                Every person who walks through the door is here because they&apos;re building something,
                closing something, or celebrating something.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href="/inquire"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] transition-colors"
                >
                  Inquire <ArrowRight size={14} />
                </Link>
                <Link
                  href="/spaces"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-cream/30 text-cream text-[11px] font-black uppercase tracking-[0.2em] hover:border-cream/60 hover:bg-cream/5 transition-colors backdrop-blur-sm"
                >
                  The Spaces
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ TICKER ═══════════════════════════ */}
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

      {/* ═══════════════════════════ CONCEPT — CREAM ═══════════════════════════ */}
      <section className="bg-cream py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel variant="light">The Vision</SectionLabel>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center mb-12 sm:mb-16">
              <div>
                <motion.h2
                  variants={fadeUp}
                  className="font-display text-3xl sm:text-5xl md:text-7xl font-light italic text-obsidian tracking-tight mb-4 sm:mb-6"
                >
                  Where African business<br />is done.
                </motion.h2>
                <motion.p variants={fadeUp} className="text-obsidian/60 text-base sm:text-lg max-w-2xl leading-relaxed">
                  Other hotels offer stillness. Others perfect the art of service. Convivia24 is built for encounter &mdash;
                  the kind that turns a corridor conversation into a joint venture, and a dinner into a decade-long partnership.
                </motion.p>
              </div>

              <motion.div variants={fadeUp} className="relative">
                <img src="/Homepage2.png" alt="Convivia24 interior" className="w-full aspect-[4/3] object-cover" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gold" />
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {PILLARS.map((p) => (
                <motion.div key={p.num} variants={fadeUp} className="border-t border-obsidian/10 pt-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-dark mb-3 block">{p.num}</span>
                  <h3 className="font-display text-2xl md:text-3xl italic text-obsidian mb-3">{p.title}</h3>
                  <p className="text-obsidian/50 text-sm leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════ SPACES PREVIEW ═══════════════════════════ */}
      <section className="bg-obsidian py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel>The Spaces</SectionLabel>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl sm:text-5xl md:text-7xl font-light italic text-cream tracking-tight mb-4 sm:mb-6"
            >
              Six spaces. One philosophy.
            </motion.h2>

            <motion.p variants={fadeUp} className="text-cream/50 text-base sm:text-lg max-w-2xl leading-relaxed mb-10 sm:mb-12">
              Every design decision asks one question: does this create the conditions for a great conversation?
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {SPACES.map((space) => (
                <motion.div
                  key={space.num}
                  variants={fadeUp}
                  className="group relative overflow-hidden bg-obsidian-50 border border-gold/10 hover:border-gold/30 p-7 transition-all duration-500 cursor-default"
                >
                  {/* image reveal on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-700 bg-cover bg-center"
                    style={{ backgroundImage: `url(${space.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <span className="absolute top-4 right-5 font-display text-6xl italic text-gold/[0.06] leading-none select-none">
                    {space.num}
                  </span>

                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/50 block mb-3 relative z-10">{space.num}</span>
                  <h3 className="font-display text-xl italic text-cream mb-2 relative z-10 group-hover:text-gold transition-colors duration-300">{space.name}</h3>
                  <p className="text-cream/40 text-sm leading-relaxed mb-5 relative z-10">{space.desc}</p>

                  <Link
                    href="/spaces"
                    className="text-gold/60 hover:text-gold text-[10px] font-black uppercase tracking-[0.2em] transition-colors inline-flex items-center gap-1.5 relative z-10"
                  >
                    Explore <ArrowRight size={11} />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════ PROGRAMMING ═══════════════════════════ */}
      <section className="bg-cream py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel variant="light">Programming</SectionLabel>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-end mb-12">
              <motion.h2
                variants={fadeUp}
                className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-obsidian tracking-tight"
              >
                Life at<br />the table.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-obsidian/60 text-base sm:text-lg leading-relaxed">
                Convivia24 is not just a place to sleep. It is a calendar. A season. A reason to be in the room.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-3 gap-px bg-obsidian/10">
              {PROGRAMMING.map((p) => (
                <motion.div
                  key={p.name}
                  variants={fadeUp}
                  className="bg-cream p-8 sm:p-10 group hover:bg-cream-dark transition-colors duration-300"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-dark mb-4">{p.frequency}</p>
                  <h3 className="font-display text-2xl sm:text-3xl italic text-obsidian mb-4">{p.name}</h3>
                  <p className="text-obsidian/50 text-sm leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp} className="mt-8 flex justify-start">
              <Link
                href="/convivium"
                className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-obsidian/50 hover:text-obsidian transition-colors group"
              >
                View membership <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════ FULL-WIDTH IMAGE BREAK ═══════════════════════════ */}
      <section className="relative bg-obsidian">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <img
            src="/Convivium2.png"
            alt="Convivia24 arched corridor"
            className="w-full h-[40vh] sm:h-[50vh] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-obsidian/40" />
        </motion.div>
      </section>

      {/* ═══════════════════════════ CONVIVIUM TEASER — CREAM ═══════════════════════════ */}
      <section className="bg-cream py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel variant="light">Membership</SectionLabel>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl sm:text-5xl md:text-7xl font-light italic text-obsidian tracking-tight mb-4 sm:mb-6"
            >
              Not a membership.<br />A table.
            </motion.h2>

            <motion.p variants={fadeUp} className="text-obsidian/60 text-lg leading-relaxed mb-8 max-w-3xl">
              The Convivium is Convivia24&apos;s members club &mdash; open to non-staying guests who want permanent access
              to The Floor, The Table, the Deal Rooms, and The Roof. Your recurring seat at the table. Your network with a hotel attached.
            </motion.p>

            <motion.div variants={fadeUp} className="space-y-3 mb-10 max-w-3xl">
              {[
                'Priority booking across all properties and spaces',
                'Introductions to fellow members — operators, founders, executives',
                'Invitations to private Convivia Dinners and The Gathering',
              ].map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" />
                  <p className="text-obsidian/70 text-sm">{benefit}</p>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp}>
              <Link
                href="/convivium"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors"
              >
                The Convivium <ArrowRight size={14} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════ SOCIAL PROOF ═══════════════════════════ */}
      <section className="bg-obsidian py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel>At the table</SectionLabel>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-10 lg:gap-20 mt-8">
              {QUOTES.map((q) => (
                <motion.div key={q.name} variants={fadeUp} className="border-l border-gold/20 pl-7">
                  <p className="font-display text-2xl sm:text-3xl lg:text-4xl italic text-cream leading-snug mb-8">
                    &ldquo;{q.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-px bg-gold/30" />
                    <div>
                      <p className="text-cream/70 text-sm font-medium">{q.name}</p>
                      <p className="text-cream/30 text-[10px] uppercase tracking-[0.2em] mt-0.5">{q.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════ LOCATIONS ═══════════════════════════ */}
      <section className="bg-obsidian border-t border-gold/10 py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel>Locations</SectionLabel>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl sm:text-5xl md:text-7xl font-light italic text-cream tracking-tight mb-10 sm:mb-14"
            >
              Where the money moves.
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mb-10 sm:mb-14 border border-gold/10 divide-y md:divide-y-0 md:divide-x divide-gold/10">
              {LOCATIONS.map((loc, i) => (
                <motion.div
                  key={loc.city}
                  variants={fadeUp}
                  className="p-8 sm:p-10 group hover:bg-obsidian-50 transition-colors duration-300 relative overflow-hidden"
                >
                  <span className="absolute bottom-4 right-6 font-display text-[7rem] sm:text-[9rem] italic text-gold/[0.04] leading-none select-none pointer-events-none group-hover:text-gold/[0.07] transition-colors duration-500">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/50 mb-2">{loc.label}</p>
                  <h3 className="font-display text-4xl md:text-5xl lg:text-6xl italic text-cream mb-4 group-hover:text-gold transition-colors duration-300">{loc.city}</h3>
                  <p className="text-cream/40 text-sm leading-relaxed relative z-10">{loc.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp}>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cream/20">
                Coming &middot; Accra &middot; Nairobi &middot; Kigali
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════ FINAL CTA ═══════════════════════════ */}
      <section className="bg-gold">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="font-display text-2xl sm:text-4xl italic text-obsidian mb-2">
              Reserve your place at the table.
            </h2>
            <p className="text-obsidian/60 text-sm">Lagos &middot; Abuja &middot; London</p>
          </div>
          <Link
            href="/inquire"
            className="inline-flex items-center gap-2 px-8 py-4 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors shrink-0"
          >
            Inquire <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
