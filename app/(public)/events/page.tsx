'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Users, Briefcase, Music } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

const WEEKLY = [
  { day: 'Fri', name: 'Sunset Sessions', desc: 'Live music on the terrace as the sun goes down. No cover, no reservation.' },
  { day: 'Sat', name: 'The Long Table', desc: 'A shared feast under the trees — one menu, one seating, strangers who leave as friends.' },
  { day: 'Sun', name: 'Wellness Brunch', desc: 'Sunrise yoga, then a slow brunch by the pool. The gentlest way to end a weekend.' },
];

const SPACES = [
  { icon: Heart, name: 'Weddings', capacity: 'Up to 200', desc: 'The gardens, the waterfront lawn, and a marquee if the sky turns. Full planning, one dedicated coordinator.' },
  { icon: Users, name: 'Celebrations', capacity: '10 – 120', desc: 'Birthdays, anniversaries, naming ceremonies. Private dining rooms or the whole terrace, yours for the night.' },
  { icon: Briefcase, name: 'Retreats & offsites', capacity: '8 – 40', desc: 'Meeting space, full AV, breakout on the deck, and wellness sessions built into the agenda. Stay on-site.' },
  { icon: Music, name: 'Private hire', capacity: 'The full resort', desc: 'Buy out Convivia24 in its entirety — every room, the spa, the lounge. For the occasions that deserve everything.' },
];

export default function EventsPage() {
  return (
    <>
      <section className="bg-paper">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 pt-14 pb-10 sm:pt-20 sm:pb-14">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel>Events &amp; Private Hire</SectionLabel></motion.div>
            <motion.h1 variants={fadeUp} className="font-display text-5xl sm:text-6xl lg:text-7xl font-light brand-text leading-[0.95] mb-6">
              Gather the
              <br />
              people who <em className="italic">matter.</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-obsidian/60 max-w-lg leading-relaxed">
              A weekly rhythm of things worth showing up for &mdash; and spaces built for the moments you plan around. Weddings, retreats, or the whole resort to yourself.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Weekly programming */}
      <section className="bg-obsidian text-cream">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
          <h2 className="font-display text-3xl sm:text-4xl font-light mb-3">On the calendar</h2>
          <p className="text-cream/55 mb-10 max-w-md">Every week, open to guests and visitors alike.</p>
          <div className="grid md:grid-cols-3 gap-5">
            {WEEKLY.map((e) => (
              <motion.div
                key={e.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5 }}
                className="bg-white/[0.04] border border-white/10 rounded-2xl p-7"
              >
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gold text-obsidian font-display text-lg font-medium mb-5">
                  {e.day}
                </span>
                <h3 className="font-display text-xl font-medium mb-2">{e.name}</h3>
                <p className="text-sm text-cream/60 leading-relaxed">{e.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Private hire */}
      <section className="bg-paper-dark">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
          <h2 className="font-display text-3xl sm:text-4xl font-light text-obsidian mb-3">Make it yours</h2>
          <p className="text-obsidian/55 mb-10 max-w-md">Four ways to take over Convivia24, in part or in full.</p>
          <div className="grid sm:grid-cols-2 gap-5">
            {SPACES.map(({ icon: Icon, name, capacity, desc }) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5 }}
                className="bg-cream rounded-2xl p-7 sm:p-8"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="inline-flex w-11 h-11 items-center justify-center rounded-xl bg-gold/15 text-gold-dark">
                    <Icon size={20} strokeWidth={1.75} />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-obsidian/40">{capacity}</span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-medium text-obsidian mb-3">{name}</h3>
                <p className="text-obsidian/60 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 py-16 sm:py-24 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-light text-obsidian mb-5">Plan your event</h2>
          <p className="text-obsidian/60 leading-relaxed mb-8 max-w-md mx-auto">
            Tell us the occasion and the numbers. A dedicated coordinator will take it from there.
          </p>
          <Link href="/inquire" className="btn-brand inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em]">
            Start an enquiry <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
