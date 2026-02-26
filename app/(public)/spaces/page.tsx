'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';

const SPACES = [
  {
    num: '01',
    name: 'The Floor',
    tagline: 'The arrival experience.',
    desc: 'Not a lobby — it\'s called The Floor. Open plan, warm lighting, low furniture, the smell of good coffee and something cooking. You don\'t rush through it. You slow down. There\'s a bar visible from the entrance. People are already talking.',
    details: ['Open-plan arrival lounge', 'Full-service bar from 7am', 'Concierge and introductions desk', 'The first impression of the brand'],
    image: '/The Spaces.png',
  },
  {
    num: '02',
    name: 'The Table',
    tagline: 'A destination restaurant.',
    desc: 'The Table is a destination independent of the hotel. Open to non-guests, reservations-only in the evening, walk-in for breakfast and lunch. Long communal tables alongside private booths. The menu rotates around the host city\'s food culture interpreted at the highest level.',
    details: ['Communal and private dining', 'Reservations-only evenings', 'Rotating seasonal menu', 'Where the city comes to be seen'],
    image: '/Convivium3.png',
  },
  {
    num: '03',
    name: 'Chambers',
    tagline: 'Built for recovery and performance.',
    desc: 'Not "deluxe" or "superior" — Chambers, Suites, and Residences. Inside: a proper desk that feels like a command centre, a reading chair, blackout blinds, a bed engineered for recovery, and zero unnecessary decoration. Functional beauty. No clutter.',
    details: ['Command-centre desk', 'Blackout recovery environment', 'Reading chair and curated library', 'The room exists to restore you'],
    image: '/The Spaces2.png',
  },
  {
    num: '04',
    name: 'Deal Rooms',
    tagline: 'Where conversations become commitments.',
    desc: 'A floor of private meeting rooms available to guests and members. Each one named after an African city. Each one designed differently — some for boardroom energy, some for informal creative sessions, some for one-on-ones. Whiteboards, great AV, and someone who brings you excellent coffee without being asked.',
    details: ['Named after African cities', 'Boardroom and creative configurations', 'Full AV and whiteboard setup', 'Dedicated service without interruption'],
    image: '/dealrooms.png',
  },
  {
    num: '05',
    name: 'The Library',
    tagline: 'A quiet floor for thinking.',
    desc: 'A quiet floor with curated books on business, history, philosophy, and African literature. No phones on this floor. A place to think before the meeting or decompress after it.',
    details: ['Curated business and African literature', 'No-phone policy', 'Pre-meeting preparation space', 'Post-meeting decompression'],
    image: '/Convivium.png',
  },
  {
    num: '06',
    name: 'Wellness & Relaxation',
    tagline: 'Restoration between the work.',
    desc: 'A sanctuary designed for recovery. Spa treatments rooted in African botanicals, a plunge pool, steam rooms, and quiet spaces to decompress after the deal or prepare for the next one. Performance starts with restoration.',
    details: ['Spa with African botanical treatments', 'Plunge pool and steam rooms', 'Quiet decompression spaces', 'Designed for recovery and renewal'],
    image: '/The Spaces3.png',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export default function SpacesPage() {
  return (
    <>
      {/* ═══════════ HERO WITH IMAGE ═══════════ */}
      <section className="relative bg-obsidian -mt-16 pt-16 overflow-hidden">
        <div className="relative">
          <img
            src="/The Spaces.png"
            alt="The Floor — Convivia24 lobby"
            className="w-full h-[50vh] sm:h-[60vh] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/60 to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 -mt-32 pb-20 z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel>The Property</SectionLabel>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light italic tracking-tight text-cream leading-[0.9] mb-6 sm:mb-8"
            >
              The Spaces.
            </motion.h1>

            <motion.p variants={fadeUp} className="text-cream/60 text-base sm:text-lg max-w-2xl leading-relaxed">
              Every design decision asks one question: does this create the conditions for a great conversation?
              Six distinct spaces, each built with purpose.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ SPACES ═══════════ */}
      {SPACES.map((space, i) => {
        const isLight = i % 2 === 1;
        return (
          <section key={space.num} className={isLight ? 'bg-cream py-24 sm:py-32' : 'bg-obsidian py-24 sm:py-32'}>
            <div className="max-w-6xl mx-auto px-5 sm:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                className={`grid md:grid-cols-2 gap-12 items-start ${i % 2 === 1 ? 'md:grid-flow-dense' : ''}`}
              >
                {/* Text side */}
                <div className={i % 2 === 1 ? 'md:col-start-2' : ''}>
                  <motion.span
                    variants={fadeUp}
                    className={`text-[10px] font-black uppercase tracking-[0.3em] block mb-4 ${
                      isLight ? 'text-gold-dark' : 'text-gold/50'
                    }`}
                  >
                    {space.num}
                  </motion.span>

                  <motion.h2
                    variants={fadeUp}
                    className={`font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl italic tracking-tight mb-3 ${
                      isLight ? 'text-obsidian' : 'text-cream'
                    }`}
                  >
                    {space.name}
                  </motion.h2>

                  <motion.p
                    variants={fadeUp}
                    className={`text-[11px] font-black uppercase tracking-[0.2em] mb-6 ${
                      isLight ? 'text-obsidian/40' : 'text-cream/40'
                    }`}
                  >
                    {space.tagline}
                  </motion.p>

                  <motion.p
                    variants={fadeUp}
                    className={`text-base leading-relaxed mb-8 ${
                      isLight ? 'text-obsidian/60' : 'text-cream/60'
                    }`}
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

                {/* Visual side — image if available, styled card otherwise */}
                <motion.div
                  variants={fadeUp}
                  className={`relative overflow-hidden ${i % 2 === 1 ? 'md:col-start-1' : ''}`}
                >
                  {space.image ? (
                    <div className="relative">
                      <img
                        src={space.image}
                        alt={space.name}
                        className="w-full aspect-[4/3] object-cover"
                      />
                      <div className={`absolute top-0 left-0 right-0 h-1 ${isLight ? 'bg-gold-dark' : 'bg-gold'}`} />
                    </div>
                  ) : (
                    <div className={`relative p-8 border ${
                      isLight
                        ? 'bg-cream-dark border-obsidian/10'
                        : 'bg-obsidian-50 border-gold/10'
                    }`}>
                      <div className={`absolute top-0 left-0 right-0 h-px ${isLight ? 'bg-gold-dark' : 'bg-gold'}`} />

                      <span className={`font-display text-[120px] md:text-[160px] italic leading-none select-none ${
                        isLight ? 'text-obsidian/[0.04]' : 'text-gold/[0.06]'
                      }`}>
                        {space.num}
                      </span>

                      <p className={`font-display text-2xl italic mt-4 ${isLight ? 'text-obsidian' : 'text-cream'}`}>
                        {space.name}
                      </p>
                      <p className={`text-xs mt-2 ${isLight ? 'text-obsidian/40' : 'text-cream/40'}`}>
                        {space.tagline}
                      </p>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </section>
        );
      })}

      {/* ═══════════ CTA ═══════════ */}
      <section className="bg-gold">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="font-display text-2xl sm:text-4xl italic text-obsidian mb-2">
              Interested in a space?
            </h2>
            <p className="text-obsidian/60 text-sm">Stays, memberships, and private bookings.</p>
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
