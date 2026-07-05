'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

const ROOMS = [
  {
    num: '01',
    name: 'The Garden Room',
    tagline: 'Ground floor. Opens to the gardens.',
    desc: 'A calm, generous room that opens straight onto the botanical gardens. King bed, deep soaking tub, and a private terrace for morning coffee. The quietest way to start.',
    details: ['King bed · 42m²', 'Private garden terrace', 'Deep soaking tub', 'Breakfast & spa circuit included'],
    from: '₦180,000',
    image: '/The Spaces.png',
  },
  {
    num: '02',
    name: 'The Waterfront Suite',
    tagline: 'Full water views. Sunset side.',
    desc: 'A one-bedroom suite on the water. Floor-to-ceiling glass, a separate lounge, and a balcony positioned for the sunset. Turndown, robes, and a nightly botanical ritual tray.',
    details: ['King suite · 68m²', 'Full waterfront balcony', 'Separate living lounge', 'Evening turndown & ritual tray'],
    from: '₦320,000',
    image: '/The Spaces3.png',
  },
  {
    num: '03',
    name: 'The Garden Villa',
    tagline: 'Standalone. Private plunge pool.',
    desc: 'A standalone villa with its own walled garden and heated plunge pool. Two bedrooms, an outdoor shower, and total privacy. Made for a couple who wants nothing, or a family who wants everything.',
    details: ['Two bedrooms · 120m²', 'Private heated plunge pool', 'Walled garden & outdoor shower', 'Dedicated host on call'],
    from: '₦560,000',
    image: '/Convivium.png',
  },
];

const INCLUDES = [
  { t: 'The wellness circuit', s: 'Every stay includes full daily access to the thermal circuit and infinity pool.' },
  { t: 'Breakfast, slow', s: 'Served on the terrace or in your room, from sunrise until late morning.' },
  { t: 'Turndown ritual', s: 'Nightly, with a botanical sleep tray and the lights set low.' },
  { t: 'A dedicated host', s: 'One person who knows your name and handles everything, start to finish.' },
];

export default function StaysPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[70vh] bg-obsidian flex items-center overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0">
          <img src="/The Spaces.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/90 via-obsidian/60 to-obsidian/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-obsidian/30" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-24 w-full">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }} className="max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel>The Stay</SectionLabel></motion.div>
            <motion.h1 variants={fadeUp} className="font-display text-5xl sm:text-7xl md:text-8xl font-light italic tracking-tight text-cream leading-[0.9] mb-6">
              Rooms made<br />for resting.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-base sm:text-lg text-cream/70 max-w-lg leading-relaxed">
              Rooms, suites, and standalone villas &mdash; each positioned for light, quiet, and a view worth waking up to.
              Every rate includes breakfast and full use of the wellness circuit.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ROOMS */}
      <section className="bg-cream py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-6">
          {ROOMS.map((room, i) => (
            <motion.div
              key={room.num}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
              className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${i % 2 === 1 ? 'lg:[direction:rtl]' : ''}`}
            >
              <motion.div variants={fadeUp} className="relative [direction:ltr]">
                <img src={room.image} alt={room.name} className="w-full aspect-[4/3] object-cover" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gold" />
                <span className="absolute bottom-4 right-5 font-display text-6xl italic text-cream/80 leading-none select-none drop-shadow-lg">{room.num}</span>
              </motion.div>
              <div className="[direction:ltr]">
                <motion.p variants={fadeUp} className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-dark mb-3">{room.tagline}</motion.p>
                <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl md:text-5xl italic text-obsidian tracking-tight mb-4">{room.name}</motion.h2>
                <motion.p variants={fadeUp} className="text-obsidian/60 text-base leading-relaxed mb-6 max-w-md">{room.desc}</motion.p>
                <motion.ul variants={fadeUp} className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mb-8">
                  {room.details.map((d) => (
                    <li key={d} className="flex items-start gap-2.5 text-sm text-obsidian/70">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                      {d}
                    </li>
                  ))}
                </motion.ul>
                <motion.div variants={fadeUp} className="flex items-center gap-6">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-obsidian/40 block">From</span>
                    <span className="font-display text-2xl italic text-obsidian">{room.from}<span className="text-sm not-italic text-obsidian/40"> / night</span></span>
                  </div>
                  <Link href="/inquire" className="inline-flex items-center gap-2 px-6 py-3 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors">
                    Reserve <ArrowRight size={13} />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* INCLUDES */}
      <section className="bg-obsidian py-20 sm:py-28 border-t border-gold/10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={fadeUp}><SectionLabel>Every Stay Includes</SectionLabel></motion.div>
            <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-cream tracking-tight mb-12">
              The details,<br />handled.
            </motion.h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-gold/10">
              {INCLUDES.map((item) => (
                <motion.div key={item.t} variants={fadeUp} className="bg-obsidian p-8">
                  <h3 className="font-display text-xl italic text-cream mb-3">{item.t}</h3>
                  <p className="text-cream/40 text-sm leading-relaxed">{item.s}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gold">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="font-display text-2xl sm:text-4xl italic text-obsidian mb-2">Stay the night. Or the week.</h2>
            <p className="text-obsidian/60 text-sm">Every rate includes breakfast &amp; the wellness circuit</p>
          </div>
          <Link href="/inquire" className="inline-flex items-center gap-2 px-8 py-4 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors shrink-0">
            Book a Stay <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
