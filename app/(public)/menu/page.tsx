'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

type Section = 'food' | 'drinks';

const FOOD_SECTIONS = [
  {
    id: 'brunch',
    label: 'Brunch',
    note: 'Saturday & Sunday · 11am – 4pm',
    items: [
      { name: 'Suya Benedict', desc: 'Poached eggs, suya-spiced beef, toasted brioche, hollandaise', price: '₦8,500' },
      { name: 'Agege French Toast', desc: 'Thick-cut brioche, bone marrow butter, soft-boiled egg, bottarga', price: '₦7,500' },
      { name: 'The Floor Shakshuka', desc: 'Ewa agoyin tomatoes, berbere spice, West African peppers, feta, sourdough', price: '₦7,000' },
      { name: 'Plantain Stack', desc: 'Caramelised plantain, smoked salmon, crème fraîche, pickled shallot', price: '₦9,000' },
      { name: 'Akara & Eggs', desc: 'Black-eyed pea fritters, scrambled eggs, scotch bonnet butter, herbs', price: '₦6,500' },
    ],
  },
  {
    id: 'small',
    label: 'Small Plates',
    note: 'Available all day',
    items: [
      { name: 'Asun Skewers', desc: 'Spiced goat, scotch bonnet glaze, cucumber yogurt, flatbread', price: '₦6,000' },
      { name: 'Pepper Soup Dumplings', desc: 'Catfish and uziza, ukpaka dipping sauce, crispy shallot', price: '₦7,500' },
      { name: 'Puff Puff', desc: 'Truffle honey, aged parmesan, aleppo pepper', price: '₦4,500' },
      { name: 'Crab Akara', desc: 'Blue crab fritters, mango avocado, pickled cucumber, sour cream', price: '₦9,000' },
      { name: 'Barbecued Yam', desc: 'Charred yam, smoked butter, egusi crumble, fresh herbs', price: '₦5,500' },
    ],
  },
  {
    id: 'mains',
    label: 'Mains',
    note: 'Lunch & Dinner',
    items: [
      { name: 'Wagyu Suya', desc: 'Wagyu beef tenderloin, suya spice rub, tiger nut salsa, roasted pepper sauce', price: '₦32,000' },
      { name: 'Whole Bream', desc: 'Jollof-smoked butter, charred spring onion, yam purée, palm oil beurre blanc', price: '₦18,000' },
      { name: 'Ẹ̀gúsí Risotto', desc: 'Toasted melon seed, confit tomato, parmesan, soft herbs, truffle oil', price: '₦16,000' },
      { name: 'Whole Chicken Yassa', desc: 'Caramelised onion, Dijon mustard, lemon, jollof rice — served family-style', price: '₦22,000' },
      { name: 'Oha Leaf Pasta', desc: 'Handmade pappardelle, oha leaf pesto, crayfish, crispy garlic, parmesan', price: '₦14,000' },
    ],
  },
  {
    id: 'desserts',
    label: 'Desserts',
    note: '',
    items: [
      { name: 'Puff Puff Donut', desc: 'Condensed milk ice cream, palmnut caramel, sesame brittle', price: '₦5,500' },
      { name: 'Chocolate Fondant', desc: '72% dark chocolate, cocoa nib praline, baobab cream, cocoa powder', price: '₦6,000' },
      { name: 'Chin Chin Cheesecake', desc: 'Vanilla cream, chin chin crust, mango coulis, fresh mango', price: '₦5,500' },
    ],
  },
];

const DRINK_SECTIONS = [
  {
    id: 'cocktails',
    label: 'Cocktails',
    note: 'The Bar · Opens 4pm',
    items: [
      { name: 'Convivia Negroni', desc: 'Palm wine-washed gin, Campari, sweet vermouth, orange bitters', price: '₦7,500' },
      { name: 'Lagos Sour', desc: 'Nigerian rum, tamarind syrup, lime juice, egg white, Angostura bitters', price: '₦8,000' },
      { name: 'The 24', desc: 'A daily-changing cocktail made with whatever the bar is obsessing over. Just ask.', price: 'Ask' },
      { name: 'Zobo Smash', desc: 'Hibiscus-infused gin, fresh mint, cucumber, lime, soda', price: '₦7,000' },
      { name: 'Palm Wine Spritz', desc: 'Traditional palm wine, elderflower cordial, prosecco, fresh cucumber', price: '₦8,500' },
      { name: 'Afrobeats Martini', desc: 'Vodka, Cointreau, hibiscus syrup, fresh lime, champagne float', price: '₦9,000' },
      { name: 'Eko Mule', desc: 'Nigerian ginger beer, bourbon, fresh lime, ginger, mint', price: '₦7,000' },
    ],
  },
  {
    id: 'spirits',
    label: 'Spirits',
    note: 'Ask your bartender for the current pour list',
    highlights: [
      { name: 'Whisky', desc: 'Scotch, Irish, American, and Japanese. Single malts, small-batch bourbons. The list rotates.' },
      { name: 'Cognac & Brandy', desc: 'The continent\'s boardroom spirit. Hennessy, Rémy Martin, and rare expressions for those who know.' },
      { name: 'Rum', desc: 'Nigerian sugarcane rum, Jamaican and Barbadian classics, aged agricole from Martinique.' },
      { name: 'Gin', desc: 'African botanical gins, London dry classics, and seasonal house infusions.' },
    ],
  },
  {
    id: 'wine',
    label: 'Wine',
    note: 'Rotating seasonally · Ask for the current list',
    highlights: [
      { name: 'By the Glass', desc: 'Six reds, six whites, two champagnes. The selection rotates quarterly with the season.' },
      { name: 'Champagne & Sparkling', desc: 'Moët, Veuve Clicquot, and a curated selection of grower champagnes by glass and bottle.' },
      { name: 'By the Bottle', desc: 'South African, French, and Italian selections. Private dining menus available on request.' },
      { name: 'Natural Wine', desc: 'A growing list of minimal-intervention wines. Ask the floor team for the current edit.' },
    ],
  },
  {
    id: 'nonalc',
    label: 'Non-Alcoholic',
    note: 'All day',
    items: [
      { name: 'Zobo Rouge', desc: 'House-brewed hibiscus, fresh ginger, citrus, mint', price: '₦3,500' },
      { name: 'Alata', desc: 'Spiced ginger beer, lime, turmeric, black pepper', price: '₦3,500' },
      { name: 'Chapman Special', desc: 'The Nigerian classic — Fanta, Sprite, grenadine, cucumber, citrus — elevated', price: '₦4,000' },
      { name: 'African Botanical', desc: 'A non-alcoholic spirit made from West African botanicals. Served long over ice.', price: '₦5,000' },
      { name: 'Cold Brew', desc: 'Single-origin Nigerian coffee, cold-brewed for 24 hours', price: '₦4,500' },
    ],
  },
];

function MenuItem({ name, desc, price }: { name: string; desc: string; price: string }) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex items-start justify-between gap-6 py-5 border-b border-gold/10 last:border-0 group"
    >
      <div className="flex-1 min-w-0">
        <p className="font-display text-xl italic text-cream group-hover:text-gold transition-colors duration-200">{name}</p>
        <p className="text-cream/40 text-sm leading-relaxed mt-1">{desc}</p>
      </div>
      <p className="text-cream/60 text-sm font-medium shrink-0 mt-1">{price}</p>
    </motion.div>
  );
}

function HighlightItem({ name, desc }: { name: string; desc: string }) {
  return (
    <motion.div variants={fadeUp} className="border-l border-gold/20 pl-5 py-1">
      <p className="font-display text-xl italic text-cream mb-1">{name}</p>
      <p className="text-cream/40 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

export default function MenuPage() {
  const [section, setSection] = useState<Section>('food');

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative bg-obsidian -mt-16 pt-16 overflow-hidden">
        <div className="relative">
          <img src="/The Spaces.png" alt="Convivia24 dining room" className="w-full h-[40vh] sm:h-[50vh] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/60 to-transparent" />
        </div>
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 -mt-32 pb-16 z-10">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
            <motion.div variants={fadeUp}>
              <SectionLabel>Restaurant & Bar</SectionLabel>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light italic tracking-tight text-cream leading-[0.9] mb-6"
            >
              The Menu.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-cream/60 text-base sm:text-lg max-w-xl leading-relaxed">
              African food culture elevated to its highest expression.
              The kitchen is open from brunch through dinner. The bar runs from 4pm until late.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═══ SECTION TOGGLE ═══ */}
      <div className="sticky top-16 z-40 bg-obsidian border-b border-gold/10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex gap-0">
          {(['food', 'drinks'] as Section[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSection(s)}
              className={`relative px-8 py-4 text-[11px] font-black uppercase tracking-[0.25em] transition-colors ${
                section === s ? 'text-gold' : 'text-cream/40 hover:text-cream/70'
              }`}
            >
              {s === 'food' ? 'Food' : 'Drinks & Bar'}
              {section === s && (
                <motion.div
                  layoutId="menu-tab"
                  className="absolute bottom-0 left-0 right-0 h-px bg-gold"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ FOOD ═══ */}
      <AnimatePresence mode="wait">
        {section === 'food' && (
          <motion.div
            key="food"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {FOOD_SECTIONS.map((sec, i) => (
              <section key={sec.id} className={i % 2 === 0 ? 'bg-obsidian py-16 sm:py-20' : 'bg-obsidian-50 py-16 sm:py-20'}>
                <div className="max-w-6xl mx-auto px-5 sm:px-8">
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                    variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-8 pb-6 border-b border-gold/15">
                      <h2 className="font-display text-3xl sm:text-4xl italic text-cream">{sec.label}</h2>
                      {sec.note && <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/50">{sec.note}</p>}
                    </div>
                    <div className="max-w-3xl">
                      {sec.items.map((item) => (
                        <MenuItem key={item.name} {...item} />
                      ))}
                    </div>
                  </motion.div>
                </div>
              </section>
            ))}
          </motion.div>
        )}

        {/* ═══ DRINKS ═══ */}
        {section === 'drinks' && (
          <motion.div
            key="drinks"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {DRINK_SECTIONS.map((sec, i) => (
              <section key={sec.id} className={i % 2 === 0 ? 'bg-obsidian py-16 sm:py-20' : 'bg-obsidian-50 py-16 sm:py-20'}>
                <div className="max-w-6xl mx-auto px-5 sm:px-8">
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                    variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-8 pb-6 border-b border-gold/15">
                      <h2 className="font-display text-3xl sm:text-4xl italic text-cream">{sec.label}</h2>
                      {sec.note && <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/50">{sec.note}</p>}
                    </div>

                    {'items' in sec && sec.items ? (
                      <div className="max-w-3xl">
                        {sec.items.map((item) => (
                          <MenuItem key={item.name} {...item} />
                        ))}
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-8 max-w-3xl">
                        {sec.highlights?.map((h) => (
                          <HighlightItem key={h.name} {...h} />
                        ))}
                      </div>
                    )}
                  </motion.div>
                </div>
              </section>
            ))}

            {/* Responsible service note */}
            <section className="bg-obsidian py-10 border-t border-gold/10">
              <div className="max-w-6xl mx-auto px-5 sm:px-8">
                <p className="text-cream/25 text-xs leading-relaxed max-w-xl">
                  Convivia24 is committed to responsible service of alcohol. We reserve the right to decline service.
                  Please drink responsibly. Alcohol is served to guests aged 18 and over only.
                </p>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ CTA ═══ */}
      <section className="bg-gold">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="font-display text-2xl sm:text-4xl italic text-obsidian mb-2">Ready to come to the table?</h2>
            <p className="text-obsidian/60 text-sm">Reservations recommended · Walk-ins welcome for lunch</p>
          </div>
          <Link href="/inquire" className="inline-flex items-center gap-2 px-8 py-4 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors shrink-0">
            Reserve <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
