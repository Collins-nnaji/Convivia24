'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Flower2, Waves, Wind, Sparkles, Sun, Droplets } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

const TREATMENTS = [
  {
    name: 'The Botanical Massage',
    dur: '60 / 90 min',
    desc: 'A full-body massage using cold-pressed oils infused with African botanicals — marula, baobab, and rooibos. Deep, unhurried, and grounding.',
    from: '₦45,000',
  },
  {
    name: 'The Convivia Ritual',
    dur: '120 min',
    desc: 'Our signature journey — a dry-brush exfoliation, thermal circuit, hot-stone massage, and a scalp treatment to close. Half a day, entirely for you.',
    from: '₦95,000',
  },
  {
    name: 'The Recovery',
    dur: '75 min',
    desc: 'Built for tired bodies. Lymphatic work, targeted deep tissue, and a guided cold plunge. Leave loose, clear, and awake.',
    from: '₦58,000',
  },
  {
    name: 'The Couple’s Retreat',
    dur: '90 min',
    desc: 'A side-by-side treatment in the garden suite, closing with tea on your own private terrace. Two therapists, one quiet afternoon.',
    from: '₦120,000',
  },
];

const CIRCUIT = [
  { icon: Waves, t: 'Heated infinity pool', s: 'Water views, open sunrise to 10pm' },
  { icon: Droplets, t: 'Cold plunge', s: '11°C — for recovery and clarity' },
  { icon: Wind, t: 'Sauna & steam', s: 'Finnish sauna and eucalyptus steam room' },
  { icon: Sun, t: 'Relaxation deck', s: 'Loungers, herbal tea, and quiet' },
];

const MOVEMENT = [
  { time: '7:00', t: 'Sunrise yoga', s: 'On the deck, all levels' },
  { time: '8:30', t: 'Breathwork', s: 'Guided, 45 minutes' },
  { time: '17:30', t: 'Sound bath', s: 'Gong & singing bowls' },
  { time: '18:30', t: 'Restorative yin', s: 'Candlelit, before dinner' },
];

export default function WellnessPage() {
  return (
    <>
      <section className="relative bg-obsidian text-cream overflow-hidden">
        <div className="absolute -top-24 right-0 w-[30rem] h-[30rem] rounded-full bg-gold/10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 pt-16 pb-16 sm:pt-24 sm:pb-24">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="max-w-2xl">
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2.5 mb-8 text-gold border-b border-gold/30 pb-1">
                <div className="w-4 h-px bg-gold" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">The Wellness</span>
              </div>
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-display text-5xl sm:text-6xl lg:text-7xl font-light leading-[0.95] mb-6">
              The spa is the
              <br />
              <em className="italic text-gold">whole point.</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-cream/65 max-w-lg leading-relaxed mb-8">
              A full-service spa, a thermal circuit, and a daily rhythm of movement &mdash; designed as one continuous ritual. Residents enjoy the circuit at no charge; day passes are available for visitors.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/inquire" className="btn-brand inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em]">
                Book a treatment <ArrowRight size={14} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Thermal circuit */}
      <section className="bg-paper">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
          <div className="flex items-center gap-3 mb-10">
            <Waves className="text-gold-dark" size={22} />
            <h2 className="font-display text-3xl sm:text-4xl font-light text-obsidian">The thermal circuit</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CIRCUIT.map(({ icon: Icon, t, s }) => (
              <motion.div
                key={t}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5 }}
                className="bg-cream rounded-2xl p-6"
              >
                <span className="inline-flex w-11 h-11 items-center justify-center rounded-xl bg-gold/15 text-gold-dark mb-5">
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <h3 className="font-display text-lg font-medium text-obsidian mb-2">{t}</h3>
                <p className="text-sm text-obsidian/60 leading-relaxed">{s}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Treatments */}
      <section className="bg-paper-dark">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
          <div className="flex items-center gap-3 mb-10">
            <Flower2 className="text-gold-dark" size={22} />
            <h2 className="font-display text-3xl sm:text-4xl font-light text-obsidian">Signature treatments</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {TREATMENTS.map((tr) => (
              <motion.div
                key={tr.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5 }}
                className="bg-cream rounded-2xl p-7 sm:p-8"
              >
                <div className="flex items-baseline justify-between gap-4 mb-3">
                  <h3 className="font-display text-xl sm:text-2xl font-medium text-obsidian">{tr.name}</h3>
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gold-dark/70 shrink-0">{tr.dur}</span>
                </div>
                <p className="text-obsidian/65 leading-relaxed mb-5">{tr.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-obsidian/50">from <span className="font-medium text-obsidian">{tr.from}</span></span>
                  <Link href="/inquire" className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.15em] text-gold-dark hover:text-gold transition-colors">
                    Book <ArrowRight size={13} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Movement */}
      <section className="bg-obsidian text-cream">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="text-gold" size={22} />
              <h2 className="font-display text-3xl sm:text-4xl font-light">Daily movement</h2>
            </div>
            <p className="text-cream/65 leading-relaxed max-w-md mb-8">
              Every day opens and closes with a session on the deck &mdash; free to residents, no booking needed. Come to all of them, or none. The point is that they&rsquo;re there.
            </p>
            <Link href="/inquire" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-gold hover:text-gold-light transition-colors">
              See the full schedule <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {MOVEMENT.map(({ time, t, s }) => (
              <div key={time} className="flex items-center gap-4 bg-white/[0.04] border border-white/10 rounded-xl px-5 py-4">
                <span className="text-[11px] font-black tracking-[0.15em] text-gold/80 w-10 shrink-0">{time}</span>
                <div>
                  <p className="text-sm font-medium text-cream">{t}</p>
                  <p className="text-xs text-cream/50">{s}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
