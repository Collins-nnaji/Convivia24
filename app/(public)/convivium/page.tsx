'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import WaitlistForm from '@/components/WaitlistForm';
import ConviviumCard from '@/components/ConviviumCard';

const BENEFITS = [
  'Skip the queue — instant approval on all hangout requests',
  'Priority booking at The Table across all three cities',
  'On-demand Deal Room access via the app',
  'Exclusive invitations to Convivia Black member dinners',
  'Founder Residency early access and priority registration',
  'The Gathering — annual summit access and VIP seating',
  'Gold verified badge across the Convivia platform',
  'Dedicated 24/7 concierge via in-app messaging',
];

const MEMBER_TYPES = [
  { type: 'The African Operator', desc: 'Building, scaling, and leading businesses across the continent. Needs frictionless access to the right rooms.' },
  { type: 'The Diaspora Returnee', desc: 'Coming home to build. Instantly plugged into the most powerful network on the continent.' },
  { type: 'The International Executive', desc: 'Coming to do business. Needs a trusted network and secure venues curated instantly via phone.' },
  { type: 'The Founder', desc: 'Closing their Series A. Needs immediate physical introductions, not just LinkedIn messages.' },
  { type: 'The Creative Director', desc: 'Shaping culture. Looking for collaborators at the intersection of taste and ambition.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export default function ConviviumPage() {
  return (
    <>
      <section className="relative bg-obsidian -mt-16 pt-16 overflow-hidden">
        <div className="relative">
          <img
            src="/conv1.png"
            alt="Convivia Black — rooftop gathering"
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
              <SectionLabel>Convivia Black</SectionLabel>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light italic tracking-tight text-cream leading-[0.9] mb-6 sm:mb-8"
            >
              The Black Tier.
            </motion.h1>

            <motion.p variants={fadeUp} className="text-cream/60 text-base sm:text-lg max-w-2xl leading-relaxed">
              The app is free. Black is for operators who need instant physical access — priority booking, Deal Rooms on demand, and concierge service across Lagos, Abuja, and London.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="bg-cream py-28 sm:py-36">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel variant="light">The Upgrade</SectionLabel>
            </motion.div>

            <motion.div variants={fadeUp} className="max-w-3xl mb-14">
              <p className="font-display text-3xl md:text-4xl italic text-obsidian leading-snug mb-4">
                Built for sitting down,<br/>not scrolling past.
              </p>
              <p className="text-obsidian/60 text-lg leading-relaxed">
                The app matches you with the right people. Black gives you the venues — instantly, seamlessly, across three cities.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="border-t border-obsidian/10 pt-10">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-dark mb-2">The Model</p>
                  <p className="font-display text-xl italic text-obsidian mb-2">Annual membership. Instant access.</p>
                  <p className="text-obsidian/50 text-sm leading-relaxed">
                    A flat annual fee added securely to your App account, transforming your in-app requests into instantaneous approvals.
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-dark mb-2">The Advantage</p>
                  <p className="font-display text-xl italic text-obsidian mb-2">A network with physical infrastructure.</p>
                  <p className="text-obsidian/50 text-sm leading-relaxed">
                    Most social apps exist purely in the cloud. Convivia Black grounds your social capital in the real world venues of Lagos and London.
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-dark mb-2">The Promise</p>
                  <p className="font-display text-xl italic text-obsidian mb-2">Leave with more than you arrived with.</p>
                  <p className="text-obsidian/50 text-sm leading-relaxed">
                    More relationships, more ideas, more deals. The Black tier accelerates the velocity of your network.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

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
              What Black unlocking means.
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

      <section className="bg-cream py-28 sm:py-36">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20"
          >
            <motion.div variants={fadeUp} className="flex-shrink-0">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-obsidian/40 mb-6 text-center lg:text-left">
                The App Pass
              </p>
              <ConviviumCard />
              <p className="text-obsidian/40 text-xs text-center lg:text-left mt-4 max-w-[340px] mx-auto lg:mx-0">
                Your Convivia Black digital card. One scan. Every table. Lagos, Abuja, London.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex-1 max-w-lg text-center lg:text-left">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold-dark mb-4">Tier Upgrade</p>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl italic text-obsidian mb-4">Convivia Black</h2>
              <p className="text-obsidian/60 text-base leading-relaxed mb-8">
                Full access to every Convivia24 table, space, and introduction feature across the platform. Upgrade is by application or direct invite only.
              </p>

              <div className="border-t border-obsidian/10 pt-6 mb-8">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 mb-1">Enquire for upgrade rates</p>
              </div>

              <Link
                href="/inquire"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors"
              >
                Apply for Black Tier <ArrowRight size={14} />
              </Link>

              <div className="mt-10 pt-8 border-t border-obsidian/10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 mb-3">Or join the App Waitlist</p>
                <p className="text-obsidian/50 text-sm mb-4">Start with the Standard App experience. Gain access via proof of work.</p>
                <WaitlistForm variant="convivium" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="bg-gold">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="font-display text-2xl sm:text-4xl italic text-obsidian mb-2">
              Ready to take your seat?
            </h2>
            <p className="text-obsidian/60 text-sm">App access by application. Begin your inquiry.</p>
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
