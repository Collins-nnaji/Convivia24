'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { RITUAL_KITS, formatNgn, MOOD_LABELS, TRACK_LABELS } from '@/lib/rituals/catalog';

const TICKER_ITEMS = [
  'Experts in drinks',
  'Cocktail & spirits specialists',
  'Alcohol & zero-proof, equal craft',
  'Not a bottle shop',
  'Ship the evening',
  'The Convivium',
  'Lagos delivery',
];

const featured = RITUAL_KITS.filter((k) => k.featured).slice(0, 4);

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

export default function HomePage() {
  return (
    <>
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
                <SectionLabel>Drinks experts · Rituals · Membership</SectionLabel>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light italic tracking-tight text-cream leading-[0.9] mb-6 sm:mb-8"
              >
                Convivia24
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="font-display text-2xl sm:text-3xl italic text-cream/80 mb-4"
              >
                Experts in drinks. Not a bottle shop.
              </motion.p>

              <motion.p variants={fadeUp} className="text-base sm:text-lg text-cream/60 max-w-lg leading-relaxed mb-8">
                Cocktail and spirits specialists shipping ritual kits for how you restore, gather, and celebrate — alcohol and non-alcoholic, same craft. Lagos first.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                <Link
                  href="/rituals"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.15em] transition-colors"
                >
                  Tonight&apos;s rituals <ArrowRight size={14} />
                </Link>
                <Link
                  href="/convivium"
                  className="inline-flex items-center gap-2 px-7 py-3.5 border border-cream/25 text-cream hover:border-gold/50 hover:text-gold text-[11px] font-black uppercase tracking-[0.15em] transition-colors"
                >
                  The Convivium
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="bg-gold overflow-hidden py-3">
        <div className="flex whitespace-nowrap animate-[marquee_28s_linear_infinite]">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="mx-8 text-[10px] font-black uppercase tracking-[0.35em] text-obsidian/80"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <section className="bg-cream py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel variant="light">Curated by drinks experts</SectionLabel>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-obsidian tracking-tight mb-4"
            >
              Ship the evening.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-obsidian/55 max-w-xl mb-12 leading-relaxed">
              Browse moods, not aisles. Every kit is bartender-built — bottles, serve steps, playlist cue, and a zero-proof track when you want it. Expert taste, delivered.
            </motion.p>

            <div className="grid sm:grid-cols-2 gap-x-12 gap-y-14">
              {featured.map((kit) => (
                <motion.div key={kit.slug} variants={fadeUp}>
                  <Link href={`/rituals/${kit.slug}`} className="group block">
                    <div className="relative aspect-[16/10] overflow-hidden mb-5 bg-obsidian">
                      <img
                        src={kit.image}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian/55 via-transparent to-transparent" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-gold-dark/70 mb-2">
                      {MOOD_LABELS[kit.mood]} · {TRACK_LABELS[kit.track]}
                    </p>
                    <h3 className="font-display text-2xl sm:text-3xl italic text-obsidian group-hover:text-gold-dark transition-colors mb-2">
                      {kit.name}
                    </h3>
                    <p className="text-sm text-obsidian/50 mb-3">{kit.tagline}</p>
                    <p className="font-display text-xl italic">{formatNgn(kit.priceNgn)}</p>
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp} className="mt-14">
              <Link
                href="/rituals"
                className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-obsidian hover:text-gold-dark"
              >
                All rituals <ArrowRight size={14} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="bg-obsidian py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <SectionLabel>Beverage expertise</SectionLabel>
            <h2 className="font-display text-4xl sm:text-5xl italic text-cream leading-tight mb-5">
              Alcohol and non-alcoholic.<br />Same expertise.
            </h2>
            <p className="text-cream/55 leading-relaxed max-w-md">
              Our drinks experts treat zero-proof like a craft pour, not a compromise. Every ritual ships with a track choice — the other seat at the same table.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 text-cream">
            {[
              { n: '01', t: 'Restore', d: 'Slow pours after a loud week.' },
              { n: '02', t: 'Gather', d: 'The bar for the night, one tap.' },
              { n: '03', t: 'Celebrate', d: 'The 24 and signature evenings.' },
              { n: '04', t: 'Focus', d: 'Clarity kits — zero by design.' },
            ].map((x) => (
              <div key={x.n} className="border-t border-gold/20 pt-4">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gold/50 mb-2">{x.n}</p>
                <p className="font-display text-2xl italic mb-1">{x.t}</p>
                <p className="text-sm text-cream/45">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <div>
              <SectionLabel variant="light">Membership · Drinks experts on call</SectionLabel>
              <h2 className="font-display text-4xl sm:text-6xl italic text-obsidian mb-4">
                The Convivium.
              </h2>
              <p className="text-obsidian/55 max-w-md leading-relaxed mb-8">
                A permanent seat with cocktail specialists behind it — monthly ritual drops, early maker bottles, and the right to ship a bottle as a guest gesture. Not points. Belonging.
              </p>
              <Link
                href="/convivium"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-obsidian hover:bg-obsidian/90 text-cream text-[11px] font-black uppercase tracking-[0.15em] transition-colors"
              >
                Take your seat <ArrowRight size={14} />
              </Link>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden bg-obsidian">
              <img src="/Convivium.png" alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/40 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gold">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="font-display text-2xl sm:text-4xl italic text-obsidian mb-2">
              What are you pouring tonight?
            </h2>
            <p className="text-obsidian/60 text-sm">Lagos delivery · Experts in drinks · Alcohol &amp; zero-proof · 18+</p>
          </div>
          <Link
            href="/rituals"
            className="inline-flex items-center gap-2 px-8 py-4 bg-obsidian hover:bg-obsidian/90 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors shrink-0"
          >
            Shop rituals <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <style jsx global>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </>
  );
}
