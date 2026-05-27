'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';

const SPACES = [
  {
    num: '01',
    name: 'The Floor',
    tagline: 'The main dining room.',
    desc: 'Not a lobby — it\'s called The Floor. Open plan, 80 covers, warm lighting, and always moving. Communal energy without the noise. Full-service bar visible from the entrance. You come here for dinner. You stay for the room.',
    details: ['80 covers, open plan', 'Full-service bar from 11am', 'Open for brunch, lunch, and dinner', 'Walk-ins welcome for lunch and early dinner'],
    image: '/The Spaces.png',
  },
  {
    num: '02',
    name: 'The Table',
    tagline: "The chef's table. Six seats.",
    desc: 'Six seats. One sitting. A prix fixe menu written for the evening. The chef cooks in front of you. The menu is not printed in advance. You find out what you\'re eating when it arrives. Reserve six weeks ahead — it is always full.',
    details: ['Six seats, one sitting per evening', 'Prix fixe menu — seasonal, unannounced', 'Chef-hosted, fully interactive', 'Reservations required — enquire for availability'],
    image: '/Convivium3.png',
  },
  {
    num: '03',
    name: 'The Bar',
    tagline: 'Cocktails. Conversation. Late nights.',
    desc: 'A full cocktail bar with its own character — separate from the main dining room, with its own menu, its own music, and its own crowd. Opens at 4pm daily. Late night from Thursday to Saturday. The 24 cocktail changes daily.',
    details: ['Opens 4pm daily', 'Late night Thurs–Sat until 3am', 'Daily-changing cocktail programme', 'Bar menu served all hours'],
    image: '/The Spaces2.png',
  },
  {
    num: '04',
    name: 'The Terrace',
    tagline: 'Open air. City views.',
    desc: 'Open-air dining on the upper floor. Views of the city. The terrace runs a dedicated menu — lighter, more relaxed. Walk-in for drinks anytime. Reservations for dinner service. When it rains, the kitchen moves inside.',
    details: ['Open-air, upper floor', 'City skyline views', 'Dedicated terrace menu', 'Reservations for dinner; walk-in for drinks'],
    image: '/The Spaces3.png',
  },
  {
    num: '05',
    name: 'Private Dining',
    tagline: 'Three rooms. Every occasion.',
    desc: 'Three private dining rooms named after African cities. Each designed differently — one for boardroom energy, one for long-table celebrations, one for intimate dinners for ten. Bespoke menus on request. A dedicated event manager for every booking.',
    details: ['Three rooms: 10, 16, and 40 covers', 'Named after African cities', 'Bespoke menus on request', 'Full AV, dedicated staff'],
    image: '/dealrooms.png',
  },
  {
    num: '06',
    name: 'The Lounge',
    tagline: 'Late night. Low lights. Good music.',
    desc: 'The late-night bar and listening room. DJs Thursday to Saturday from 11pm. Bar menu until 2am. Open until 3am. A different crowd from the dinner service — but the same standards. Convivium members have priority entry on sold-out nights.',
    details: ['DJs Thursday–Saturday from 11pm', 'Bar menu until 2am', 'Open until 3am on DJ nights', 'Convivium members: priority entry'],
    image: '/Convivium.png',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export default function SpacesPage() {
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative bg-obsidian -mt-16 pt-16 overflow-hidden">
        <div className="relative">
          <img src="/The Spaces.png" alt="The Floor — Convivia24 dining room" className="w-full h-[50vh] sm:h-[60vh] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/60 to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 -mt-32 pb-20 z-10">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
            <motion.div variants={fadeUp}><SectionLabel>The Restaurant</SectionLabel></motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light italic tracking-tight text-cream leading-[0.9] mb-6 sm:mb-8"
            >
              The Spaces.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-cream/60 text-base sm:text-lg max-w-2xl leading-relaxed">
              Six distinct spaces. The main dining room, the chef&apos;s table, the cocktail bar, the terrace,
              private dining, and the late-night lounge. One building. One philosophy.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═══ SPACES ═══ */}
      {SPACES.map((space, i) => {
        const isLight = i % 2 === 1;
        return (
          <section key={space.num} className={isLight ? 'bg-cream py-18 sm:py-24' : 'bg-obsidian py-18 sm:py-24'}>
            <div className="max-w-6xl mx-auto px-5 sm:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                className={`grid md:grid-cols-2 gap-12 items-start ${i % 2 === 1 ? 'md:grid-flow-dense' : ''}`}
              >
                <div className={i % 2 === 1 ? 'md:col-start-2' : ''}>
                  <motion.span
                    variants={fadeUp}
                    className={`text-[10px] font-black uppercase tracking-[0.3em] block mb-4 ${isLight ? 'text-gold-dark' : 'text-gold/50'}`}
                  >
                    {space.num}
                  </motion.span>
                  <motion.h2
                    variants={fadeUp}
                    className={`font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl italic tracking-tight mb-3 ${isLight ? 'text-obsidian' : 'text-cream'}`}
                  >
                    {space.name}
                  </motion.h2>
                  <motion.p
                    variants={fadeUp}
                    className={`text-[11px] font-black uppercase tracking-[0.2em] mb-6 ${isLight ? 'text-obsidian/40' : 'text-cream/40'}`}
                  >
                    {space.tagline}
                  </motion.p>
                  <motion.p
                    variants={fadeUp}
                    className={`text-base leading-relaxed mb-8 ${isLight ? 'text-obsidian/60' : 'text-cream/60'}`}
                  >
                    {space.desc}
                  </motion.p>
                  <motion.div variants={fadeUp} className="space-y-3">
                    {space.details.map((detail) => (
                      <div key={detail} className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" />
                        <p className={`text-sm ${isLight ? 'text-obsidian/50' : 'text-cream/50'}`}>{detail}</p>
                      </div>
                    ))}
                  </motion.div>
                </div>

                <motion.div variants={fadeUp} className={`relative overflow-hidden ${i % 2 === 1 ? 'md:col-start-1' : ''}`}>
                  <div className="relative">
                    <img src={space.image} alt={space.name} className="w-full aspect-[4/3] object-cover" />
                    <div className={`absolute top-0 left-0 right-0 h-1 ${isLight ? 'bg-gold-dark' : 'bg-gold'}`} />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>
        );
      })}

      {/* ═══ CTA ═══ */}
      <section className="bg-gold">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="font-display text-2xl sm:text-4xl italic text-obsidian mb-2">Ready to see the room?</h2>
            <p className="text-obsidian/60 text-sm">Dining reservations · Private bookings · The Chef&apos;s Table</p>
          </div>
          <Link href="/inquire" className="inline-flex items-center gap-2 px-8 py-4 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors shrink-0">
            Reserve <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
