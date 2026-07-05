'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BedDouble, Waves, Coffee, Wifi } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

const ROOMS = [
  {
    num: '01',
    name: 'The Garden Room',
    tagline: 'Ground floor. Opens to the gardens.',
    desc: 'A calm, generous room that opens straight onto the botanical gardens. King bed, deep soaking tub, and a private terrace for morning coffee. The quietest way to start.',
    details: ['King bed · 42m²', 'Private garden terrace', 'Deep soaking tub', 'Complimentary breakfast'],
    from: '₦180,000',
  },
  {
    num: '02',
    name: 'The Waterfront Suite',
    tagline: 'Full water views. Sunset side.',
    desc: 'A one-bedroom suite on the water. Floor-to-ceiling glass, a separate lounge, and a balcony positioned for the sunset. Turndown, robes, and a nightly ritual tray.',
    details: ['King suite · 68m²', 'Full waterfront balcony', 'Separate living lounge', 'Evening turndown & ritual tray'],
    from: '₦320,000',
  },
  {
    num: '03',
    name: 'The Garden Villa',
    tagline: 'Standalone. Private plunge pool.',
    desc: 'A standalone villa with its own walled garden and heated plunge pool. Two bedrooms, an outdoor shower, and total privacy. Made for a couple who wants nothing, or a family who wants everything.',
    details: ['Two bedrooms · 120m²', 'Private heated plunge pool', 'Walled garden & outdoor shower', 'Dedicated host on call'],
    from: '₦560,000',
  },
];

const AMENITIES = [
  { icon: Waves, t: 'Infinity pool', s: 'Heated, open to residents until 10pm' },
  { icon: Coffee, t: 'In-room dining', s: 'Kitchen open 24 hours for guests' },
  { icon: BedDouble, t: 'Turndown ritual', s: 'Nightly, with a botanical sleep tray' },
  { icon: Wifi, t: 'Connected, quietly', s: 'Fast Wi-Fi, hidden tech, no clutter' },
];

export default function StaysPage() {
  return (
    <>
      <section className="bg-paper">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 pt-14 pb-10 sm:pt-20 sm:pb-14">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel>The Stay</SectionLabel></motion.div>
            <motion.h1 variants={fadeUp} className="font-display text-5xl sm:text-6xl lg:text-7xl font-light brand-text leading-[0.95] mb-6">
              Rooms made
              <br />
              for <em className="italic">resting.</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-obsidian/60 max-w-lg leading-relaxed">
              Rooms, suites, and standalone villas &mdash; each positioned for light, quiet, and a view worth waking up to. Rates are nightly and include breakfast and full use of the wellness circuit.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="bg-paper-dark">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20 space-y-5">
          {ROOMS.map((room) => (
            <motion.div
              key={room.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="grid md:grid-cols-[auto_1fr_auto] gap-6 md:gap-10 items-start bg-cream rounded-2xl p-7 sm:p-9"
            >
              <span className="font-display text-4xl text-gold-dark/50 leading-none">{room.num}</span>
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-medium text-obsidian mb-1">{room.name}</h2>
                <p className="text-sm font-black uppercase tracking-[0.15em] text-gold-dark/70 mb-4">{room.tagline}</p>
                <p className="text-obsidian/65 leading-relaxed mb-5 max-w-xl">{room.desc}</p>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                  {room.details.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm text-obsidian/70">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold shrink-0" aria-hidden />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:text-right md:min-w-[9rem]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40">From</p>
                <p className="font-display text-2xl text-obsidian mb-4">{room.from}<span className="text-sm text-obsidian/40"> /night</span></p>
                <Link href="/inquire" className="btn-brand inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.15em]">
                  Reserve <ArrowRight size={13} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-obsidian text-cream">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
          <h2 className="font-display text-3xl sm:text-4xl font-light mb-10">Every stay includes</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {AMENITIES.map(({ icon: Icon, t, s }) => (
              <div key={t} className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
                <span className="inline-flex w-11 h-11 items-center justify-center rounded-xl bg-white/10 text-gold mb-5">
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <h3 className="font-display text-lg font-medium mb-2">{t}</h3>
                <p className="text-sm text-cream/60 leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
