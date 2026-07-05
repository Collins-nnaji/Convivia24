'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';

const TICKER_ITEMS = [
  'Stay · Restore · Gather',
  'Waterfront Suites & Garden Villas',
  'The Spa · Thermal Circuit · Movement',
  'Farm to Table · Bar · Lounge',
  'The Convivium',
  'Lagos · Abuja · London',
  'A Resort, Spa & Lounge',
  'Stay · Restore · Gather',
];

const SPACES = [
  { num: '01', name: 'The Suites', desc: 'Waterfront rooms and suites with private balconies, deep soaking tubs, and a view worth waking up to.', image: '/The Spaces2.png', href: '/stays#stays' },
  { num: '02', name: 'Garden Villas', desc: 'Standalone villas with a walled garden and heated plunge pool. Total privacy, for a couple or a family.', image: '/Homepage2.png', href: '/stays#stays' },
  { num: '03', name: 'The Spa', desc: 'Treatment suites, a thermal circuit, and a relaxation deck. The signature Convivia Ritual runs half a day.', image: '/The Spaces3.png', href: '/stays#wellness' },
  { num: '04', name: 'The Terrace', desc: 'Open-air, farm-to-table dining on the upper floor. Water views. Walk in for drinks; reserve for dinner.', image: '/The Spaces.png', href: '/stays#dining' },
  { num: '05', name: 'The Lounge', desc: 'Candlelit bar and listening room. The 24 cocktail changes daily. Live sets, Thursday to Saturday.', image: '/conv1.png', href: '/stays#dining' },
  { num: '06', name: 'Private Dining', desc: 'Intimate rooms for long-table dinners and celebrations, from ten guests to forty, under the trees.', image: '/Convivium.png', href: '/stays#dining' },
];

const PILLARS = [
  { num: '01', title: 'The Stay', desc: 'Waterfront suites and standalone garden villas. Slow mornings, turndown at dusk, and a bed you will not want to leave. Rest is the first thing we get right.' },
  { num: '02', title: 'The Spa', desc: 'A full thermal circuit, treatments rooted in African botanicals, and movement at sunrise. You should leave lighter than you arrived.' },
  { num: '03', title: 'The Table', desc: 'Farm-to-table dining by day, a candlelit lounge by night. The food is serious. The bar is open. The room selects itself.' },
];

const MENU_PREVIEW = [
  {
    category: 'Small Plates',
    items: ['Asun Skewers · scotch bonnet glaze', 'Pepper Soup Dumplings · ukpaka dipping sauce', 'Crab Akara · mango avocado, pickled cucumber', 'Puff Puff · truffle honey, aged parmesan'],
  },
  {
    category: 'Mains',
    items: ['Wagyu Suya · suya spice rub, tiger nut salsa', 'Whole Bream · jollof-smoked butter, yam purée', 'Ẹ̀gúsí Risotto · toasted melon seed, parmesan', 'Oha Leaf Pasta · crayfish, crispy garlic'],
  },
  {
    category: 'From the Bar',
    items: ['Convivia Negroni · palm wine-washed gin', 'Lagos Sour · Nigerian rum, tamarind, lime', 'Zobo Smash · hibiscus gin, mint, cucumber', 'The 24 · daily-changing. Ask the bar.'],
  },
];

const PROGRAMMING = [
  {
    frequency: 'Saturday & Sunday',
    name: 'Jazz Brunch',
    desc: 'Live jazz quartet, extended brunch menu, bottomless mimosas, and the slowest morning you\'ve had all week. 12pm to 5pm.',
  },
  {
    frequency: 'Thursday – Saturday',
    name: 'Late Night',
    desc: 'The kitchen closes. The bar does not. DJs from 11pm. Bar menu until 2am. The Lounge open until 3am.',
  },
  {
    frequency: 'Monthly',
    name: 'Convivia Dinner',
    desc: 'Twelve people. One table. A menu written for the evening. Not advertised — member and guest invitations only.',
  },
];

const QUOTES = [
  {
    text: 'I have eaten at restaurants on four continents. I have never been at a table where the food and the room are both this good.',
    name: 'Chidi O.',
    role: 'Managing Director · Lagos',
  },
  {
    text: 'The Wagyu Suya is the best thing I have eaten in Lagos in ten years. I have ordered it on every visit since.',
    name: 'Amara K.',
    role: 'Founder · Abuja',
  },
];

const LOCATIONS = [
  { city: 'Lagos', label: 'The Flagship', desc: 'Victoria Island. The mother house. Where the deals move and the culture is loudest.' },
  { city: 'Abuja', label: 'The Capital', desc: 'Political energy. Diplomatic corridors. A different table, the same philosophy.' },
  { city: 'London', label: 'The Bridge', desc: 'Mayfair. The diaspora\'s home. The bridge for African business and international guests.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export default function HomePage() {
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[90vh] sm:min-h-[100vh] bg-obsidian flex items-center overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0">
          <img src="/Homepage.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/90 via-obsidian/55 to-obsidian/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-obsidian/30" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-32 w-full">
          <div className="max-w-2xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            >
              <motion.div variants={fadeUp}>
                <SectionLabel>Resort &middot; Spa &middot; Lounge</SectionLabel>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light italic tracking-tight text-cream leading-[0.9] mb-6 sm:mb-8"
              >
                Stay. Restore.<br />Gather.
              </motion.h1>

              <motion.div variants={fadeUp} className="flex items-center gap-2 mb-4 sm:mb-6">
                <span className="w-1 h-1 rounded-full bg-gold animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold">Lagos &middot; Abuja &middot; London</span>
              </motion.div>

              <motion.p variants={fadeUp} className="text-base sm:text-lg text-cream/70 max-w-lg leading-relaxed mb-8 sm:mb-10">
                Convivia24 is a resort, spa, and lounge in one &mdash; waterfront suites, a full wellness circuit,
                farm-to-table dining, and rooms made for gathering the people who matter. A place to slow down,
                and a reason to stay the night.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href="/inquire"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] transition-colors"
                >
                  Book a Stay <ArrowRight size={14} />
                </Link>
                <Link
                  href="/stays#wellness"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-cream/30 text-cream text-[11px] font-black uppercase tracking-[0.2em] hover:border-cream/60 hover:bg-cream/5 transition-colors backdrop-blur-sm"
                >
                  Explore Wellness
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ TICKER ═══ */}
      <div className="bg-obsidian border-y border-gold/10 overflow-hidden py-4">
        <motion.div
          className="flex whitespace-nowrap w-max"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="mx-8 text-[11px] font-black uppercase tracking-[0.3em] text-cream/20 flex items-center gap-8">
              {item}
              <span className="w-1 h-1 rounded-full bg-gold/30 inline-block" />
            </span>
          ))}
        </motion.div>
      </div>

      {/* ═══ THE EXPERIENCE ═══ */}
      <section className="bg-cream py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel variant="light">The Experience</SectionLabel>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center mb-12 sm:mb-16">
              <div>
                <motion.h2
                  variants={fadeUp}
                  className="font-display text-3xl sm:text-5xl md:text-7xl font-light italic text-obsidian tracking-tight mb-4 sm:mb-6"
                >
                  One place for<br />the whole escape.
                </motion.h2>
                <motion.p variants={fadeUp} className="text-obsidian/60 text-base sm:text-lg max-w-2xl leading-relaxed">
                  Convivia24 isn&apos;t a hotel with a spa bolted on. It is a resort built around three things
                  done properly &mdash; where you rest, how you restore, and the table you gather around after.
                  Come for a night. Leave a week lighter.
                </motion.p>
              </div>
              <motion.div variants={fadeUp} className="relative">
                <img src="/Homepage2.png" alt="Convivia24 dining room" className="w-full aspect-[4/3] object-cover" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gold" />
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {PILLARS.map((p) => (
                <motion.div key={p.num} variants={fadeUp} className="border-t border-obsidian/10 pt-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-dark mb-3 block">{p.num}</span>
                  <h3 className="font-display text-2xl md:text-3xl italic text-obsidian mb-3">{p.title}</h3>
                  <p className="text-obsidian/50 text-sm leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ MENU PREVIEW ═══ */}
      <section className="bg-obsidian py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel>The Menu</SectionLabel>
            </motion.div>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
              <motion.h2
                variants={fadeUp}
                className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-cream tracking-tight"
              >
                A taste of what<br />is on the table.
              </motion.h2>
              <motion.div variants={fadeUp}>
                <Link
                  href="/stays#dining"
                  className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-gold/70 hover:text-gold transition-colors group"
                >
                  Full menu <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-px bg-gold/10">
              {MENU_PREVIEW.map((section) => (
                <motion.div
                  key={section.category}
                  variants={fadeUp}
                  className="bg-obsidian p-8 sm:p-10"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/50 mb-6">{section.category}</p>
                  <ul className="space-y-4">
                    {section.items.map((item) => {
                      const [name, rest] = item.split(' · ');
                      return (
                        <li key={item} className="border-b border-gold/10 pb-4 last:border-0 last:pb-0">
                          <p className="font-display text-lg italic text-cream leading-snug">{name}</p>
                          {rest && <p className="text-cream/35 text-xs mt-1">{rest}</p>}
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ THE WELLNESS ═══ */}
      <section className="bg-cream py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel variant="light">The Wellness</SectionLabel>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <motion.div variants={fadeUp} className="relative order-2 lg:order-1">
                <img src="/The Spaces3.png" alt="The spa at Convivia24" className="w-full aspect-[4/5] object-cover" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gold" />
              </motion.div>

              <div className="order-1 lg:order-2">
                <motion.h2
                  variants={fadeUp}
                  className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-obsidian tracking-tight mb-4 sm:mb-6"
                >
                  Leave lighter<br />than you arrived.
                </motion.h2>
                <motion.p variants={fadeUp} className="text-obsidian/60 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
                  The heart of Convivia24 is its spa. A full thermal circuit, treatments rooted in African botanicals,
                  and movement at sunrise &mdash; sequenced so a weekend feels like a week away.
                </motion.p>
                <motion.div variants={fadeUp} className="space-y-3 mb-9">
                  {[
                    'Thermal circuit — sauna, steam, cold plunge, and a heated infinity pool',
                    'Signature treatments built on marula, baobab, and rooibos',
                    'Sunrise movement — yoga, breathwork, and sound baths on the deck',
                  ].map((point) => (
                    <div key={point} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" />
                      <p className="text-obsidian/70 text-sm leading-relaxed">{point}</p>
                    </div>
                  ))}
                </motion.div>
                <motion.div variants={fadeUp}>
                  <Link href="/stays#wellness" className="inline-flex items-center gap-2 px-7 py-3.5 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors">
                    The Spa &amp; Rituals <ArrowRight size={14} />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ THE SPACES ═══ */}
      <section className="bg-obsidian py-20 sm:py-28 border-t border-gold/10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel>The Spaces</SectionLabel>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl sm:text-5xl md:text-7xl font-light italic text-cream tracking-tight mb-4 sm:mb-6"
            >
              Six spaces.<br />One philosophy.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-cream/50 text-base sm:text-lg max-w-2xl leading-relaxed mb-10 sm:mb-12">
              Every space asks one question: does this create the conditions to rest, restore, or gather well?
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {SPACES.map((space) => (
                <motion.div
                  key={space.num}
                  variants={fadeUp}
                  className="group relative overflow-hidden bg-obsidian border border-gold/10 hover:border-gold/30 p-7 transition-all duration-500"
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 bg-cover bg-center"
                    style={{ backgroundImage: `url(${space.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="absolute top-4 right-5 font-display text-6xl italic text-gold/[0.06] leading-none select-none">{space.num}</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/50 block mb-3 relative z-10">{space.num}</span>
                  <h3 className="font-display text-xl italic text-cream mb-2 relative z-10 group-hover:text-gold transition-colors duration-300">{space.name}</h3>
                  <p className="text-cream/40 text-sm leading-relaxed mb-5 relative z-10">{space.desc}</p>
                  <Link href={space.href} className="text-gold/60 hover:text-gold text-[10px] font-black uppercase tracking-[0.2em] transition-colors inline-flex items-center gap-1.5 relative z-10">
                    Explore <ArrowRight size={11} />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ PROGRAMMING / EVENTS ═══ */}
      <section className="bg-obsidian py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel>Events & Programming</SectionLabel>
            </motion.div>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-end mb-12">
              <motion.h2
                variants={fadeUp}
                className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-cream tracking-tight"
              >
                Life at<br />the table.
              </motion.h2>
              <motion.div variants={fadeUp} className="flex flex-col gap-3">
                <p className="text-cream/60 text-base sm:text-lg leading-relaxed">
                  Convivia24 is not just a restaurant. It is a calendar. A season. A reason to be in the room.
                </p>
                <Link href="/stays#dining" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-gold/70 hover:text-gold transition-colors group self-start">
                  Explore dining <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-px bg-gold/10">
              {PROGRAMMING.map((p) => (
                <motion.div key={p.name} variants={fadeUp} className="bg-obsidian p-8 sm:p-10 group hover:bg-obsidian-50 transition-colors duration-300">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/50 mb-4">{p.frequency}</p>
                  <h3 className="font-display text-2xl sm:text-3xl italic text-cream mb-4">{p.name}</h3>
                  <p className="text-cream/50 text-sm leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ IMAGE BREAK ═══ */}
      <section className="relative bg-obsidian">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <img src="/Convivium2.png" alt="Convivia24 interior" className="w-full h-[40vh] sm:h-[50vh] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-obsidian/40" />
        </motion.div>
      </section>

      {/* ═══ CONVIVIUM TEASER ═══ */}
      <section className="bg-cream py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel variant="light">Membership</SectionLabel>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl sm:text-5xl md:text-7xl font-light italic text-obsidian tracking-tight mb-4 sm:mb-6"
            >
              Not a loyalty card.<br />A permanent table.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-obsidian/60 text-lg leading-relaxed mb-8 max-w-3xl">
              The Convivium is Convivia24&apos;s membership programme. Annual access to guaranteed reservations,
              monthly member dinners, exclusive bar programmes, and priority late-night entry.
              Membership is by application.
            </motion.p>
            <motion.div variants={fadeUp} className="space-y-3 mb-10 max-w-3xl">
              {[
                'Guaranteed table — even when fully booked',
                'Monthly Convivia Dinner — exclusive menu, not available to the public',
                'Member wine programme — curated selections delivered quarterly',
                'Priority late-night entry to The Lounge on sold-out nights',
              ].map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" />
                  <p className="text-obsidian/70 text-sm">{benefit}</p>
                </div>
              ))}
            </motion.div>
            <motion.div variants={fadeUp}>
              <Link href="/convivium" className="inline-flex items-center gap-2 px-7 py-3.5 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors">
                The Convivium <ArrowRight size={14} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ SOCIAL PROOF ═══ */}
      <section className="bg-obsidian py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.div variants={fadeUp}><SectionLabel>At the table</SectionLabel></motion.div>
            <div className="grid md:grid-cols-2 gap-10 lg:gap-20 mt-8">
              {QUOTES.map((q) => (
                <motion.div key={q.name} variants={fadeUp} className="border-l border-gold/20 pl-7">
                  <p className="font-display text-2xl sm:text-3xl lg:text-4xl italic text-cream leading-snug mb-8">
                    &ldquo;{q.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-px bg-gold/30" />
                    <div>
                      <p className="text-cream/70 text-sm font-medium">{q.name}</p>
                      <p className="text-cream/30 text-[10px] uppercase tracking-[0.2em] mt-0.5">{q.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ LOCATIONS ═══ */}
      <section className="bg-obsidian border-t border-gold/10 py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp}><SectionLabel>Locations</SectionLabel></motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl sm:text-5xl md:text-7xl font-light italic text-cream tracking-tight mb-10 sm:mb-14"
            >
              Where the table is set.
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mb-10 sm:mb-14 border border-gold/10 divide-y md:divide-y-0 md:divide-x divide-gold/10">
              {LOCATIONS.map((loc, i) => (
                <motion.div
                  key={loc.city}
                  variants={fadeUp}
                  className="p-8 sm:p-10 group hover:bg-obsidian-50 transition-colors duration-300 relative overflow-hidden"
                >
                  <span className="absolute bottom-4 right-6 font-display text-[7rem] sm:text-[9rem] italic text-gold/[0.04] leading-none select-none pointer-events-none group-hover:text-gold/[0.07] transition-colors duration-500">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/50 mb-2">{loc.label}</p>
                  <h3 className="font-display text-4xl md:text-5xl lg:text-6xl italic text-cream mb-4 group-hover:text-gold transition-colors duration-300">{loc.city}</h3>
                  <p className="text-cream/40 text-sm leading-relaxed relative z-10">{loc.desc}</p>
                </motion.div>
              ))}
            </div>
            <motion.div variants={fadeUp}>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cream/20">Coming &middot; Accra &middot; Nairobi &middot; Kigali</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="bg-gold">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="font-display text-2xl sm:text-4xl italic text-obsidian mb-2">Plan your escape.</h2>
            <p className="text-obsidian/60 text-sm">Stay &middot; Restore &middot; Gather &middot; Lagos &middot; Abuja &middot; London</p>
          </div>
          <Link href="/inquire" className="inline-flex items-center gap-2 px-8 py-4 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors shrink-0">
            Book a Stay <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
