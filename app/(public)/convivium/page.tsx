'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import WaitlistForm from '@/components/WaitlistForm';
import ConviviumCard from '@/components/ConviviumCard';

const BENEFITS = [
  'Room-rate access across all Convivia24 properties',
  'Priority booking at The Table restaurant',
  'Deal Room availability on demand',
  'Invitations to monthly Convivia Dinners',
  'Founder Residency priority registration',
  'The Gathering summit access',
  'Member introductions via the Convivium network',
  'Dedicated concierge line',
];

const MEMBER_TYPES = [
  { type: 'The African Operator', desc: 'Building, scaling, and leading businesses across the continent.' },
  { type: 'The Diaspora Returnee', desc: 'Coming home to build. Looking for the right room and the right people.' },
  { type: 'The International Executive', desc: 'Coming to do business on the continent. Needs a trusted address.' },
  { type: 'The Founder', desc: 'Raising their Series A. Closing a brand deal. Needs introductions, not just a bed.' },
  { type: 'The Creative Director', desc: 'Shaping culture. Looking for collaborators at the intersection of taste and ambition.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export default function ConviviumPage() {
  return (
    <>
      {/* ═══════════ HERO WITH IMAGE ═══════════ */}
      <section className="relative bg-obsidian -mt-16 pt-16 overflow-hidden">
        <div className="relative">
          <img
            src="/conv1.png"
            alt="The Convivium — rooftop gathering"
            className="w-full h-[50vh] sm:h-[60vh] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/70 to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 -mt-32 pb-20 z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel>Membership</SectionLabel>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light italic tracking-tight text-cream leading-[0.9] mb-6 sm:mb-8"
            >
              The Convivium.
            </motion.h1>

            <motion.p variants={fadeUp} className="text-cream/60 text-base sm:text-lg max-w-2xl leading-relaxed">
              Membership for operators who move between Lagos, Abuja, and London. Not a loyalty programme. A permanent seat at the table.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ ETYMOLOGY — CREAM WITH IMAGE ═══════════ */}
      <section className="bg-cream py-28 sm:py-36">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel variant="light">Origin</SectionLabel>
            </motion.div>

            <motion.div variants={fadeUp} className="max-w-3xl mb-14">
              <p className="font-display text-3xl md:text-4xl italic text-obsidian leading-snug mb-4">
                Convivium <span className="text-obsidian/40">(n.)</span>
              </p>
              <p className="text-obsidian/60 text-lg leading-relaxed mb-2">
                Latin. A feast, a banquet, a gathering of companions. From <em>con-</em> (together) + <em>vivere</em> (to live).
              </p>
              <p className="text-obsidian/60 text-lg leading-relaxed">
                The act of bringing people together around a table. Not just to eat, but to think, to deal, to build.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="border-t border-obsidian/10 pt-10">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-dark mb-2">The Model</p>
                  <p className="font-display text-xl italic text-obsidian mb-2">Annual membership. One fee. Every table.</p>
                  <p className="text-obsidian/50 text-sm leading-relaxed">
                    Open to non-staying guests who pay an annual fee for access to The Floor, The Table, the Deal Rooms, and The Roof.
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-dark mb-2">The Advantage</p>
                  <p className="font-display text-xl italic text-obsidian mb-2">A network with a hotel attached.</p>
                  <p className="text-obsidian/50 text-sm leading-relaxed">
                    Convivia24 isn&apos;t just a hotel. It&apos;s a network. The Convivium is the community layer that makes everything defensible.
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-dark mb-2">The Promise</p>
                  <p className="font-display text-xl italic text-obsidian mb-2">Leave with more than you arrived with.</p>
                  <p className="text-obsidian/50 text-sm leading-relaxed">
                    More relationships, more ideas, more deals, more energy. The hotel is a catalyst, not just a container.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ BENEFITS WITH IMAGE ═══════════ */}
      <section className="bg-obsidian py-28 sm:py-36">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel>Access</SectionLabel>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-cream tracking-tight mb-10 sm:mb-14"
            >
              What the Convivium unlocks.
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
              {BENEFITS.map((benefit, i) => (
                <motion.div
                  key={benefit}
                  variants={fadeUp}
                  className="flex items-start gap-4 border-b border-gold/10 pb-5"
                >
                  <span className="text-[10px] font-black text-gold/40 mt-0.5 shrink-0 w-5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-cream/70 text-sm">{benefit}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ MEMBER ACCESS CARD — CREAM ═══════════ */}
      <section className="bg-cream py-28 sm:py-36">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20"
          >
            {/* Card visual */}
            <motion.div variants={fadeUp} className="flex-shrink-0">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-obsidian/40 mb-6 text-center lg:text-left">
                Member Access Card
              </p>
              <ConviviumCard />
              <p className="text-obsidian/40 text-xs text-center lg:text-left mt-4 max-w-[340px] mx-auto lg:mx-0">
                Your Convivium card. One card. Every table. Lagos, Abuja, London.
              </p>
            </motion.div>

            {/* Copy + CTAs */}
            <motion.div variants={fadeUp} className="flex-1 max-w-lg text-center lg:text-left">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold-dark mb-4">Annual Membership</p>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl italic text-obsidian mb-4">The Convivium</h2>
              <p className="text-obsidian/60 text-base leading-relaxed mb-8">
                Full access to every Convivia24 table, space, and introduction across Lagos, Abuja, and London. Membership is by application only.
              </p>

              <div className="border-t border-obsidian/10 pt-6 mb-8">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 mb-1">Enquire for rates</p>
              </div>

              <Link
                href="/inquire"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors"
              >
                Apply for Membership <ArrowRight size={14} />
              </Link>

              <div className="mt-10 pt-8 border-t border-obsidian/10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 mb-3">Or join the waitlist</p>
                <p className="text-obsidian/50 text-sm mb-4">Stay in the loop. No commitment. First access when we open.</p>
                <WaitlistForm variant="convivium" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ WHO IS AT THE TABLE ═══════════ */}
      <section className="bg-obsidian py-28 sm:py-36">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel>The Table</SectionLabel>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-cream tracking-tight mb-10 sm:mb-14"
            >
              Who is already at the table.
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {MEMBER_TYPES.map((m) => (
                <motion.div
                  key={m.type}
                  variants={fadeUp}
                  className="border-l-2 border-gold/20 pl-5 py-2"
                >
                  <p className="font-display text-lg italic text-cream mb-1">{m.type}</p>
                  <p className="text-cream/40 text-sm leading-relaxed">{m.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="bg-gold">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="font-display text-2xl sm:text-4xl italic text-obsidian mb-2">
              Ready to take your seat?
            </h2>
            <p className="text-obsidian/60 text-sm">Membership by application. Begin your inquiry.</p>
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
