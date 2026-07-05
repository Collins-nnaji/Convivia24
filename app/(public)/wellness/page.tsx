'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

const CIRCUIT = [
  { num: '01', t: 'Heated infinity pool', s: 'Water views, open from sunrise until 10pm.' },
  { num: '02', t: 'Cold plunge', s: '11°C — for recovery, circulation, and clarity.' },
  { num: '03', t: 'Sauna & steam', s: 'A Finnish sauna and a eucalyptus steam room.' },
  { num: '04', t: 'Relaxation deck', s: 'Loungers, herbal tea, and unhurried quiet.' },
];

const TREATMENTS = [
  { name: 'The Botanical Massage', dur: '60 / 90 min', desc: 'Cold-pressed oils infused with marula, baobab, and rooibos. Deep, unhurried, grounding.', from: '₦45,000' },
  { name: 'The Convivia Ritual', dur: '120 min', desc: 'Our signature journey — dry-brush, thermal circuit, hot-stone massage, and a scalp treatment to close.', from: '₦95,000' },
  { name: 'The Recovery', dur: '75 min', desc: 'Built for tired bodies. Lymphatic work, targeted deep tissue, and a guided cold plunge.', from: '₦58,000' },
  { name: 'The Couple’s Retreat', dur: '90 min', desc: 'Side-by-side in the garden suite, closing with tea on your own private terrace.', from: '₦120,000' },
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
      {/* HERO */}
      <section className="relative min-h-[75vh] bg-obsidian flex items-center overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0">
          <img src="/Convivium3.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/90 via-obsidian/60 to-obsidian/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-obsidian/30" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-24 w-full">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }} className="max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel>The Wellness</SectionLabel></motion.div>
            <motion.h1 variants={fadeUp} className="font-display text-5xl sm:text-7xl md:text-8xl font-light italic tracking-tight text-cream leading-[0.9] mb-6">
              The spa is<br />the whole point.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-base sm:text-lg text-cream/70 max-w-lg leading-relaxed mb-9">
              A full-service spa, a thermal circuit, and a daily rhythm of movement &mdash; designed as one continuous ritual.
              Residents enjoy the circuit at no charge; day passes are available for visitors.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/inquire" className="inline-flex items-center gap-2 px-7 py-3.5 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] transition-colors">
                Book a Treatment <ArrowRight size={14} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* THERMAL CIRCUIT */}
      <section className="bg-cream py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={fadeUp}><SectionLabel variant="light">The Thermal Circuit</SectionLabel></motion.div>
            <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-obsidian tracking-tight mb-4">
              Hot, cold,<br />and back again.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-obsidian/50 text-base sm:text-lg max-w-2xl leading-relaxed mb-12">
              A guided sequence through heat and cold that leaves the body loose and the mind quiet. Move at your own pace, or let a therapist lead you.
            </motion.p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {CIRCUIT.map((c) => (
                <motion.div key={c.num} variants={fadeUp} className="border-t border-obsidian/10 pt-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-dark mb-3 block">{c.num}</span>
                  <h3 className="font-display text-2xl italic text-obsidian mb-3">{c.t}</h3>
                  <p className="text-obsidian/50 text-sm leading-relaxed">{c.s}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* TREATMENTS */}
      <section className="bg-obsidian py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={fadeUp}><SectionLabel>Signature Treatments</SectionLabel></motion.div>
            <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-cream tracking-tight mb-12">
              Rooted in the<br />continent.
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-px bg-gold/10">
              {TREATMENTS.map((tr) => (
                <motion.div key={tr.name} variants={fadeUp} className="bg-obsidian p-8 sm:p-10">
                  <div className="flex items-baseline justify-between gap-4 mb-3">
                    <h3 className="font-display text-2xl sm:text-3xl italic text-cream">{tr.name}</h3>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/50 shrink-0">{tr.dur}</span>
                  </div>
                  <p className="text-cream/50 text-sm leading-relaxed mb-6">{tr.desc}</p>
                  <div className="flex items-center justify-between border-t border-gold/10 pt-4">
                    <span className="text-cream/40 text-sm">from <span className="text-cream font-medium">{tr.from}</span></span>
                    <Link href="/inquire" className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-gold/70 hover:text-gold transition-colors">
                      Book <ArrowRight size={11} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* IMAGE BREAK */}
      <section className="relative bg-obsidian">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <img src="/Convivium2.png" alt="The spa at Convivia24" className="w-full h-[40vh] sm:h-[50vh] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian/40" />
        </motion.div>
      </section>

      {/* MOVEMENT */}
      <section className="bg-obsidian py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={fadeUp}><SectionLabel>Daily Movement</SectionLabel></motion.div>
            <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-cream tracking-tight mb-6">
              Open the day.<br />Close the day.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-cream/60 text-base leading-relaxed max-w-md mb-8">
              Every day opens and closes with a session on the deck &mdash; free to residents, no booking needed.
              Come to all of them, or none. The point is that they&apos;re there.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/inquire" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-gold/70 hover:text-gold transition-colors group">
                Plan a wellness stay <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="space-y-3">
            {MOVEMENT.map((m) => (
              <motion.div key={m.time} variants={fadeUp} className="flex items-center gap-5 border border-gold/10 hover:border-gold/25 transition-colors px-6 py-5">
                <span className="font-display text-2xl italic text-gold/70 w-14 shrink-0">{m.time}</span>
                <div>
                  <p className="text-cream font-medium">{m.t}</p>
                  <p className="text-cream/40 text-xs mt-0.5">{m.s}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gold">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="font-display text-2xl sm:text-4xl italic text-obsidian mb-2">Leave lighter than you arrived.</h2>
            <p className="text-obsidian/60 text-sm">Treatments, day passes &amp; wellness stays</p>
          </div>
          <Link href="/inquire" className="inline-flex items-center gap-2 px-8 py-4 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors shrink-0">
            Book the Spa <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
