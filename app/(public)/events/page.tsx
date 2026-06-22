'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } },
};

const WEEKLY = [
  {
    day: 'Saturday & Sunday',
    name: 'Jazz Brunch',
    time: '12pm – 5pm',
    desc: 'A live jazz quartet, an extended brunch menu, and bottomless mimosas. The slowest, best morning of your week. Walk-ins welcome.',
    image: '/Convivium3.png',
    booking: true,
  },
  {
    day: 'Thursday',
    name: 'The Listening Room',
    time: '9pm – 1am',
    desc: 'Curated vinyl sets in The Lounge. The kitchen runs a late-night bar menu. A quieter, more considered night than the weekend — but just as long.',
    image: '/Convivium.png',
    booking: false,
  },
  {
    day: 'Friday & Saturday',
    name: 'Late Night',
    time: '11pm – 3am',
    desc: 'The kitchen closes. The bar does not. DJs on the floor, bar menu until 2am, The Lounge open until 3am. Dress for the occasion.',
    image: '/The Spaces2.png',
    booking: false,
  },
];

const SIGNATURE = [
  {
    freq: 'Monthly',
    name: 'Convivia Dinner',
    desc: 'Twelve people. One table. A menu written the morning of. The guest list is curated — Convivium members may bring one guest. No menus printed. No phones on the table. One of the best nights you will have this month.',
    access: 'Member & guest invitations only',
  },
  {
    freq: 'Quarterly',
    name: 'Founder\'s Table',
    desc: 'An intimate dinner for six founders, convened by a Convivium member host. The format is simple: everyone brings a problem; everyone leaves with at least one solution. Dinner is included.',
    access: 'By application — Convivium members only',
  },
  {
    freq: 'Annual',
    name: 'The Gathering',
    desc: 'Our annual dinner-summit. One evening, one room, the people who matter most in the city that night. A keynote address, a long table, and the kind of conversation you only have once a year.',
    access: 'Invitation only — waitlist open',
  },
];

const PRIVATE_SPACES = [
  { name: 'The Whole Restaurant', capacity: 'Up to 200 guests', desc: 'Exclusive buyout. Full kitchen, bar, and floor staff. The entire Convivia24 experience — yours alone.' },
  { name: 'Private Dining Room A', capacity: '12 – 24 guests', desc: 'Named after an African city. Boardroom-style or long table. AV, dedicated service, bespoke menu.' },
  { name: 'Private Dining Room B', capacity: '10 – 16 guests', desc: 'More intimate. Better for working dinners, celebrations, and anything that requires focus.' },
  { name: 'The Terrace', capacity: 'Up to 80 guests', desc: 'Open-air. Lagos skyline. Canapé receptions, standing drinks, or seated dinner under the sky.' },
  { name: 'The Bar', capacity: 'Up to 60 guests', desc: 'Cocktail reception or exclusive bar hire. Our team designs a bespoke drinks programme for your event.' },
];

export default function EventsPage() {
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative bg-obsidian -mt-16 pt-16 overflow-hidden">
        <div className="relative">
          <img src="/conv1.png" alt="Convivia24 events" className="w-full h-[45vh] sm:h-[55vh] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/70 to-transparent" />
        </div>
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 -mt-36 pb-16 z-10">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
            <motion.div variants={fadeUp}>
              <SectionLabel>Programming & Events</SectionLabel>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light italic tracking-tight text-cream leading-[0.9] mb-6"
            >
              Life at<br />the table.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-cream/60 text-base sm:text-lg max-w-xl leading-relaxed">
              Convivia24 is not just a restaurant. It is a calendar. A season. A reason to be in the room.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═══ WEEKLY PROGRAMMING ═══ */}
      <section className="bg-obsidian py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp}><SectionLabel>Every Week</SectionLabel></motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-cream tracking-tight mb-10 sm:mb-14"
            >
              The regular table.
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-px bg-gold/10">
              {WEEKLY.map((event) => (
                <motion.div key={event.name} variants={fadeUp} className="bg-obsidian group relative overflow-hidden">
                  <div className="relative overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.name}
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent" />
                  </div>
                  <div className="p-7">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/50 mb-1">{event.day}</p>
                    <h3 className="font-display text-2xl italic text-cream mb-1">{event.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cream/30 mb-4">{event.time}</p>
                    <p className="text-cream/50 text-sm leading-relaxed mb-5">{event.desc}</p>
                    {event.booking && (
                      <Link
                        href="/inquire"
                        className="inline-flex items-center gap-1.5 text-gold/60 hover:text-gold text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
                      >
                        Reserve <ArrowRight size={10} />
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ SIGNATURE EVENTS ═══ */}
      <section className="bg-cream py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel variant="light">Signature Programming</SectionLabel>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-obsidian tracking-tight mb-10 sm:mb-14"
            >
              The tables worth<br />waiting for.
            </motion.h2>

            <div className="space-y-0 divide-y divide-obsidian/10">
              {SIGNATURE.map((event) => (
                <motion.div
                  key={event.name}
                  variants={fadeUp}
                  className="grid md:grid-cols-[180px_1fr_240px] gap-6 md:gap-10 items-start py-8 group"
                >
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-dark mb-1">{event.freq}</p>
                    <h3 className="font-display text-2xl italic text-obsidian">{event.name}</h3>
                  </div>
                  <p className="text-obsidian/60 text-sm leading-relaxed">{event.desc}</p>
                  <div className="flex flex-col gap-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/30 leading-relaxed">{event.access}</p>
                    <Link
                      href="/inquire"
                      className="inline-flex items-center gap-1.5 text-gold-dark hover:text-gold text-[10px] font-black uppercase tracking-[0.2em] transition-colors group"
                    >
                      Express interest <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ IMAGE BREAK ═══ */}
      <section className="relative">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <img src="/Convivium2.png" alt="Convivia24 space" className="w-full h-[35vh] sm:h-[45vh] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/60 via-transparent to-obsidian/30" />
        </motion.div>
      </section>

      {/* ═══ PRIVATE HIRE ═══ */}
      <section className="bg-obsidian py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.div variants={fadeUp}><SectionLabel>Private Hire</SectionLabel></motion.div>
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start mb-12">
              <motion.h2
                variants={fadeUp}
                className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-cream tracking-tight"
              >
                Make the whole<br />room yours.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-cream/60 text-base sm:text-lg leading-relaxed pt-2">
                From intimate working dinners for ten to full restaurant buyouts for two hundred.
                Every private event is given a dedicated event manager, a bespoke menu, and the
                full Convivia24 service team.
              </motion.p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRIVATE_SPACES.map((space) => (
                <motion.div
                  key={space.name}
                  variants={fadeUp}
                  className="bg-obsidian-50 border border-gold/10 hover:border-gold/25 p-7 transition-colors duration-300"
                >
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/50 mb-2">{space.capacity}</p>
                  <h3 className="font-display text-xl italic text-cream mb-3">{space.name}</h3>
                  <p className="text-cream/40 text-sm leading-relaxed">{space.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp} className="mt-10">
              <Link
                href="/inquire"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] transition-colors"
              >
                Enquire about private hire <ArrowRight size={14} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="bg-gold">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="font-display text-2xl sm:text-4xl italic text-obsidian mb-2">Reserve your place at the table.</h2>
            <p className="text-obsidian/60 text-sm">Dining reservations · Private events · Membership enquiries</p>
          </div>
          <Link href="/inquire" className="inline-flex items-center gap-2 px-8 py-4 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors shrink-0">
            Get in touch <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
