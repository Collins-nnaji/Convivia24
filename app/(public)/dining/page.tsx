'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, UtensilsCrossed, Wine } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

const FOOD = [
  {
    section: 'To Start',
    items: [
      { name: 'Grilled prawns, suya butter', desc: 'Charred, smoky, with a squeeze of lime', price: '₦12,000' },
      { name: 'Garden salad, baobab dressing', desc: 'Leaves from the resort garden, toasted seeds', price: '₦8,500' },
      { name: 'Plantain & goat cheese', desc: 'Caramelised, with honey and thyme', price: '₦9,000' },
    ],
  },
  {
    section: 'Mains',
    items: [
      { name: 'Grilled catch of the day', desc: 'Whole fish, scotch bonnet, herb oil', price: '₦22,000' },
      { name: 'Jollof, done properly', desc: 'Smoked over wood, with grilled chicken', price: '₦16,000' },
      { name: 'Garden risotto', desc: 'Seasonal vegetables, aged parmesan', price: '₦15,000' },
    ],
  },
  {
    section: 'To Finish',
    items: [
      { name: 'Coconut & lime tart', desc: 'Toasted meringue, passionfruit', price: '₦7,500' },
      { name: 'Dark chocolate, sea salt', desc: 'With espresso and a spoon', price: '₦7,000' },
    ],
  },
];

const DRINKS = [
  {
    section: 'The Bar',
    items: [
      { name: 'The 24', desc: 'Our signature — it changes every single day', price: '₦9,000' },
      { name: 'Hibiscus negroni', desc: 'Zobo-infused gin, bitter, stirred', price: '₦8,500' },
      { name: 'Smoked palm old fashioned', desc: 'Aged spirit, palm sugar, orange', price: '₦9,500' },
    ],
  },
  {
    section: 'Wine & Bubbles',
    items: [
      { name: 'By the glass', desc: 'A rotating list — ask the sommelier', price: 'from ₦6,000' },
      { name: 'Champagne', desc: 'For the evenings that deserve it', price: 'from ₦18,000' },
    ],
  },
  {
    section: 'Zero Proof',
    items: [
      { name: 'Garden cooler', desc: 'Cucumber, mint, lime, soda', price: '₦5,000' },
      { name: 'Spiced zobo', desc: 'Hibiscus, ginger, clove — served hot or cold', price: '₦4,500' },
    ],
  },
];

export default function DiningPage() {
  const [tab, setTab] = useState<'food' | 'drinks'>('food');
  const menu = tab === 'food' ? FOOD : DRINKS;

  return (
    <>
      <section className="bg-paper">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 pt-14 pb-10 sm:pt-20 sm:pb-14">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="max-w-2xl">
            <motion.div variants={fadeUp}><SectionLabel>The Table &amp; Lounge</SectionLabel></motion.div>
            <motion.h1 variants={fadeUp} className="font-display text-5xl sm:text-6xl lg:text-7xl font-light brand-text leading-[0.95] mb-6">
              Farm to table.
              <br />
              Dusk till <em className="italic">late.</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-obsidian/60 max-w-lg leading-relaxed">
              A restaurant built around the resort garden by day, and a candlelit lounge with a daily-changing cocktail by night. Guests dine on the terrace; the lounge opens to all from 4pm.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="bg-paper-dark">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
          {/* Tabs */}
          <div className="flex items-center justify-center gap-2 mb-12">
            <button
              onClick={() => setTab('food')}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${
                tab === 'food' ? 'bg-obsidian text-cream' : 'bg-cream text-obsidian/60 hover:text-obsidian'
              }`}
            >
              <UtensilsCrossed size={14} /> Food
            </button>
            <button
              onClick={() => setTab('drinks')}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${
                tab === 'drinks' ? 'bg-obsidian text-cream' : 'bg-cream text-obsidian/60 hover:text-obsidian'
              }`}
            >
              <Wine size={14} /> From the Bar
            </button>
          </div>

          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-12">
            {menu.map((group) => (
              <div key={group.section}>
                <h2 className="font-display text-2xl sm:text-3xl font-light text-obsidian mb-6 pb-3 border-b border-obsidian/10">
                  {group.section}
                </h2>
                <div className="space-y-5">
                  {group.items.map((item) => (
                    <div key={item.name} className="flex items-baseline gap-4">
                      <div className="min-w-0">
                        <p className="font-display text-lg text-obsidian">{item.name}</p>
                        <p className="text-sm text-obsidian/55">{item.desc}</p>
                      </div>
                      <span className="flex-1 border-b border-dotted border-obsidian/20 translate-y-[-4px]" />
                      <span className="text-sm font-medium text-gold-dark shrink-0">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>

          {tab === 'drinks' && (
            <p className="mt-12 text-center text-xs text-obsidian/40 max-w-md mx-auto leading-relaxed">
              We serve responsibly. Guests must be 18 or over to be served alcohol. Please drink mindfully &mdash; and let us call you a car.
            </p>
          )}
        </div>
      </section>

      <section className="bg-obsidian text-cream">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-light mb-5">Reserve a table</h2>
          <p className="text-cream/65 leading-relaxed mb-8 max-w-md mx-auto">
            The terrace and lounge take reservations for dinner from 6pm. Walk in for drinks anytime after four.
          </p>
          <Link href="/inquire" className="btn-brand inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em]">
            Book a table <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
