'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import ConviviumCard from '@/components/ConviviumCard';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

const TIERS = [
  {
    name: 'The Resident',
    price: '₦1.2M',
    period: 'per year',
    tagline: 'For the regular.',
    featured: false,
    perks: [
      'Priority reservations, even when full',
      'Full wellness circuit access, always',
      'Member rate on all treatments & rooms',
      'The monthly Convivia Dinner',
    ],
  },
  {
    name: 'The Founding Member',
    price: '₦2.8M',
    period: 'per year',
    tagline: 'The permanent seat.',
    featured: true,
    perks: [
      'Everything in The Resident, plus —',
      'A guaranteed suite on no notice',
      'Two complimentary nights each quarter',
      'A standing table & dedicated concierge',
      "The Chef's Table, before the public",
      'Priority late-night entry to The Lounge',
    ],
  },
  {
    name: 'The Patron',
    price: 'By invitation',
    period: '',
    tagline: 'For the house.',
    featured: false,
    perks: [
      'Everything in Founding Member, plus —',
      'Private hire priority across all sites',
      'A named table & annual founder’s dinner',
      'First access in every new city we open',
    ],
  },
];

export default function ConviviumPage() {
  return (
    <>
      {/* HERO — no photo, dark gold-lit gradient */}
      <section className="relative min-h-[62vh] bg-obsidian flex items-center overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(150deg, #14110b 0%, #221a0e 35%, #0a0a0a 70%, #1c1810 100%)' }} />
          <div className="absolute -top-24 -right-24 w-[32rem] h-[32rem] rounded-full bg-gold/15 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'repeating-radial-gradient(circle at 85% 110%, rgba(226,201,126,0.6) 0, rgba(226,201,126,0.6) 1px, transparent 1px, transparent 14px)' }} />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-20 w-full">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel>Membership</SectionLabel></motion.div>
            <motion.h1 variants={fadeUp} className="font-display text-5xl sm:text-7xl md:text-8xl font-light italic tracking-tight text-cream leading-[0.9] mb-6">
              The Convivium.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-base sm:text-lg text-cream/70 max-w-lg leading-relaxed">
              Annual membership for guests who want Convivia24 as a permanent home &mdash; a guaranteed suite, a standing table, and the spa on call. Not a loyalty card. A permanent seat.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* CARD + INTRO */}
      <section className="bg-obsidian py-20 sm:py-28 overflow-hidden border-t border-gold/10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center"
          >
            <motion.div variants={fadeUp} className="order-2 lg:order-1">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/60 mb-6">Member Access Card</p>
              <ConviviumCard tier="FOUNDING MEMBER" name="A. ADEYEMI" />
              <p className="text-cream/40 text-xs mt-6 max-w-[360px]">
                One card. Every table, every treatment, every city. Recognised at the door in Lagos, Abuja, and London.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="order-1 lg:order-2">
              <div className="max-w-md">
                <p className="font-display text-3xl md:text-4xl italic text-cream leading-snug mb-3">
                  Convivium <span className="text-cream/30">(n.)</span>
                </p>
                <p className="text-cream/55 text-base leading-relaxed mb-3">
                  Latin. A feast, a gathering of companions. From <em>con-</em> (together) + <em>vivere</em> (to live).
                </p>
                <p className="text-cream/55 text-base leading-relaxed mb-8">
                  Membership turns Convivia24 from a place you visit into a place you belong. A guaranteed home, a standing table, and the spa on call &mdash; all year, across every city.
                </p>
                <div className="flex flex-wrap gap-x-10 gap-y-4">
                  <div>
                    <p className="font-display text-3xl italic text-gold">3</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cream/40">Cities</p>
                  </div>
                  <div>
                    <p className="font-display text-3xl italic text-gold">24/7</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cream/40">Concierge</p>
                  </div>
                  <div>
                    <p className="font-display text-3xl italic text-gold">By application</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cream/40">Membership</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* TIERS */}
      <section className="bg-cream py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={fadeUp}><SectionLabel variant="light">Membership Tiers</SectionLabel></motion.div>
            <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-obsidian tracking-tight mb-12">
              Choose your<br />seat at the table.
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-5 items-start">
              {TIERS.map((t) => (
                <motion.div
                  key={t.name}
                  variants={fadeUp}
                  className={`relative flex flex-col rounded-2xl p-8 ${
                    t.featured ? 'bg-obsidian text-cream shadow-[0_30px_60px_-24px_rgba(10,10,10,0.6)]' : 'bg-white text-obsidian border border-obsidian/10'
                  }`}
                >
                  {t.featured && (
                    <span className="absolute -top-3 left-8 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold text-obsidian text-[9px] font-black uppercase tracking-[0.2em]">
                      Most chosen
                    </span>
                  )}
                  <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${t.featured ? 'text-gold/70' : 'text-gold-dark/70'}`}>{t.tagline}</p>
                  <h3 className="font-display text-2xl sm:text-3xl italic mb-4">{t.name}</h3>
                  <div className={`flex items-baseline gap-1.5 mb-6 pb-6 border-b ${t.featured ? 'border-white/10' : 'border-obsidian/10'}`}>
                    <span className="font-display text-4xl italic">{t.price}</span>
                    {t.period && <span className={`text-xs ${t.featured ? 'text-cream/40' : 'text-obsidian/40'}`}>{t.period}</span>}
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {t.perks.map((p) => (
                      <li key={p} className={`flex items-start gap-2.5 text-sm leading-relaxed ${t.featured ? 'text-cream/75' : 'text-obsidian/65'}`}>
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/inquire"
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${
                      t.featured ? 'bg-gold hover:bg-gold-light text-obsidian' : 'bg-obsidian hover:bg-obsidian-50 text-cream'
                    }`}
                  >
                    Apply <ArrowRight size={13} />
                  </Link>
                </motion.div>
              ))}
            </div>
            <motion.p variants={fadeUp} className="mt-8 text-xs text-obsidian/40 max-w-md leading-relaxed">
              All memberships are by application. Annual rates are indicative; a member of the team will confirm on enquiry.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gold">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="font-display text-2xl sm:text-4xl italic text-obsidian mb-2">Take your seat at the table.</h2>
            <p className="text-obsidian/60 text-sm">Membership by application &middot; Lagos &middot; Abuja &middot; London</p>
          </div>
          <Link href="/inquire" className="inline-flex items-center gap-2 px-8 py-4 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors shrink-0">
            Apply for Membership <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
