'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import ConviviumCard from '@/components/ConviviumCard';
import WaitlistForm, { type MembershipTier } from '@/components/WaitlistForm';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

const TIERS = [
  {
    name: 'The Resident',
    tierKey: 'resident' as const,
    price: '₦1.2M',
    period: 'per year',
    tagline: 'For the regular.',
    featured: false,
    perks: [
      'Monthly expert-curated ritual drop (spirit + zero + mixer)',
      'Member rate on all ritual kits',
      'Early access to limited maker bottles',
      'Ship-a-bottle guest invite (2 / year)',
    ],
  },
  {
    name: 'The Founding Member',
    tierKey: 'founding' as const,
    price: '₦2.8M',
    period: 'per year',
    tagline: 'The permanent seat.',
    featured: true,
    perks: [
      'Everything in The Resident, plus —',
      'Priority allocation on every drop',
      'Quarterly Convivia Dinner kit for 4',
      'Dedicated drinks expert concierge (Lagos)',
      'Guest invites (6 / year)',
      'First pour of house bottlings',
    ],
  },
  {
    name: 'The Patron',
    tierKey: 'patron' as const,
    price: 'By invitation',
    period: '',
    tagline: 'For the house.',
    featured: false,
    perks: [
      'Everything in Founding Member, plus —',
      'Named allocation on ultra-limited drops',
      'Private tasting hosted by our drinks specialists (annual)',
      'First access when we open new cities',
    ],
  },
];

export default function ConviviumPage() {
  const [applyTier, setApplyTier] = useState<MembershipTier>('founding');

  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'apply-resident') setApplyTier('resident');
      else if (hash === 'apply-patron') setApplyTier('patron');
      else if (hash === 'apply-founding') setApplyTier('founding');
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  return (
    <>
      <section className="relative min-h-[62vh] bg-obsidian flex items-center overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(150deg, #14110b 0%, #221a0e 35%, #0a0a0a 70%, #1c1810 100%)',
            }}
          />
          <div className="absolute -top-24 -right-24 w-[32rem] h-[32rem] rounded-full bg-gold/15 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-20 w-full">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="max-w-2xl"
          >
            <motion.div variants={fadeUp}>
              <SectionLabel>Membership · Drinks experts</SectionLabel>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl sm:text-7xl md:text-8xl font-light italic tracking-tight text-cream leading-[0.9] mb-6"
            >
              The Convivium.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-base sm:text-lg text-cream/70 max-w-lg leading-relaxed">
              A permanent seat with beverage experts behind it — monthly ritual drops curated by cocktail
              specialists, maker bottles, and the privilege of shipping a bottle as a guest gesture. Not a
              loyalty card. Belonging.
            </motion.p>
          </motion.div>
        </div>
      </section>

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
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/60 mb-6">
                Member Access Card
              </p>
              <ConviviumCard tier="FOUNDING MEMBER" name="A. ADEYEMI" />
              <p className="text-cream/40 text-xs mt-6 max-w-[360px]">
                One seat. Monthly drops. Lagos first — then every city we open.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="order-1 lg:order-2">
              <div className="max-w-md">
                <p className="font-display text-3xl md:text-4xl italic text-cream leading-snug mb-3">
                  Convivium <span className="text-cream/30">(n.)</span>
                </p>
                <p className="text-cream/55 text-base leading-relaxed mb-3">
                  Latin. A feast, a gathering of companions. From <em>con-</em> (together) + <em>vivere</em> (to
                  live).
                </p>
                <p className="text-cream/55 text-base leading-relaxed mb-8">
                  Membership turns Convivia from a shop you visit into a table you keep. Rituals arrive. Guests
                  are invited. Zero-proof sits equal.
                </p>
                <div className="flex flex-wrap gap-x-10 gap-y-4">
                  <div>
                    <p className="font-display text-3xl italic text-gold">Lagos</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cream/40">First city</p>
                  </div>
                  <div>
                    <p className="font-display text-3xl italic text-gold">Monthly</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cream/40">Ritual drop</p>
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

      <section className="bg-cream py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel variant="light">Membership Tiers</SectionLabel>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-obsidian tracking-tight mb-12"
            >
              Choose your<br />seat at the table.
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-5 items-start">
              {TIERS.map((t) => (
                <motion.div
                  key={t.name}
                  variants={fadeUp}
                  className={`relative flex flex-col rounded-2xl p-8 ${
                    t.featured
                      ? 'bg-obsidian text-cream shadow-[0_30px_60px_-24px_rgba(10,10,10,0.6)]'
                      : 'bg-white text-obsidian border border-obsidian/10'
                  }`}
                >
                  {t.featured && (
                    <span className="absolute -top-3 left-8 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold text-obsidian text-[9px] font-black uppercase tracking-[0.2em]">
                      Most chosen
                    </span>
                  )}
                  <p
                    className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${
                      t.featured ? 'text-gold/70' : 'text-gold-dark/70'
                    }`}
                  >
                    {t.tagline}
                  </p>
                  <h3 className="font-display text-2xl sm:text-3xl italic mb-4">{t.name}</h3>
                  <div
                    className={`flex items-baseline gap-1.5 mb-6 pb-6 border-b ${
                      t.featured ? 'border-white/10' : 'border-obsidian/10'
                    }`}
                  >
                    <span className="font-display text-4xl italic">{t.price}</span>
                    {t.period && (
                      <span className={`text-xs ${t.featured ? 'text-cream/40' : 'text-obsidian/40'}`}>
                        {t.period}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {t.perks.map((p) => (
                      <li
                        key={p}
                        className={`flex items-start gap-2.5 text-sm leading-relaxed ${
                          t.featured ? 'text-cream/75' : 'text-obsidian/65'
                        }`}
                      >
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`#apply-${t.tierKey}`}
                    onClick={() => setApplyTier(t.tierKey)}
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${
                      t.featured
                        ? 'bg-gold hover:bg-gold-light text-obsidian'
                        : 'bg-obsidian hover:bg-obsidian/90 text-cream'
                    }`}
                  >
                    Apply <ArrowRight size={13} />
                  </a>
                </motion.div>
              ))}
            </div>
            <motion.p variants={fadeUp} className="mt-8 text-xs text-obsidian/40 max-w-md leading-relaxed">
              All memberships are by application. Annual rates are indicative; we confirm on enquiry. Lagos
              fulfillment for drops in v1.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section id={`apply-${applyTier}`} className="bg-obsidian py-20 sm:py-24 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <SectionLabel>Apply</SectionLabel>
            <h2 className="font-display text-4xl sm:text-5xl italic text-cream mb-4">
              Join the waitlist.
            </h2>
            <p className="text-cream/55 leading-relaxed max-w-md mb-6">
              Tell us where to reach you. Choose a tier above, then apply. Meanwhile,{' '}
              <Link href="/rituals" className="text-gold hover:underline">
                shop tonight&apos;s rituals
              </Link>
              .
            </p>
            <div className="flex flex-wrap gap-2">
              {(['resident', 'founding', 'patron'] as MembershipTier[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setApplyTier(t);
                    window.history.replaceState(null, '', `#apply-${t}`);
                  }}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] transition-colors ${
                    applyTier === t
                      ? 'bg-gold text-obsidian'
                      : 'border border-gold/30 text-cream/50 hover:text-cream'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div id="apply-resident">
            <div id="apply-founding">
              <div id="apply-patron" className="border border-gold/20 p-6 sm:p-8">
                <WaitlistForm key={applyTier} variant="convivium" tier={applyTier} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gold">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="font-display text-2xl sm:text-4xl italic text-obsidian mb-2">
              Prefer a single evening?
            </h2>
            <p className="text-obsidian/60 text-sm">Browse ritual kits — no membership required</p>
          </div>
          <Link
            href="/rituals"
            className="inline-flex items-center gap-2 px-8 py-4 bg-obsidian hover:bg-obsidian/90 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors shrink-0"
          >
            Shop rituals <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
