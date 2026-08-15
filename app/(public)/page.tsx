'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, MapPin, ShoppingBag, Users } from 'lucide-react';
import DrinkPlaceholder from '@/components/shop/DrinkPlaceholder';
import {
  DRINKS,
  CATEGORIES,
  CATEGORY_LABELS,
  formatNgn,
  type DrinkCategory,
} from '@/lib/drinks/catalog';

const featured = DRINKS.filter((d) => d.featured).slice(0, 4);

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

const STEPS = [
  {
    icon: MapPin,
    title: 'Address or venue',
    body: 'Drop to a home, party, club, or lounge across Lagos.',
  },
  {
    icon: ShoppingBag,
    title: 'Place your order',
    body: 'Bottles, mixers, or Party Packs — solo or with a Crew.',
  },
  {
    icon: Clock,
    title: 'Delivery in a snap',
    body: 'Most drops land in under ~90 minutes with rider updates.',
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative h-[48vh] min-h-[320px] max-h-[480px] sm:h-[50vh] sm:max-h-[520px] flex items-end overflow-hidden bg-obsidian">
        <div className="absolute inset-0">
          <img
            src="/Homepage.png"
            alt=""
            className="w-full h-full object-cover object-[center_78%] opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pb-8 sm:pb-10 w-full">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="max-w-xl"
          >
            <motion.div variants={fadeUp} className="mb-3">
              <img
                src="/convivia24.png"
                alt="Convivia24"
                className="h-10 sm:h-12 md:h-14 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="text-[9px] font-black uppercase tracking-[0.28em] text-ember mb-2 flex items-center gap-1.5"
            >
              <Users size={12} /> Standout · Circles &amp; Crews
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 text-balance leading-tight"
            >
              Drinks to the party — and crews for outdoor people.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-sm text-white/80 max-w-md leading-relaxed mb-5"
            >
              Lagos delivery for clubs and lounges. Join Circles for beach-to-afterparty hangs, then spin a Party
              Crew so everyone adds bottles and you check out once.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-2.5">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-5 py-2.5 btn-brand text-[11px] font-black uppercase tracking-[0.14em]"
              >
                Shop drinks <ArrowRight size={14} />
              </Link>
              <Link
                href="/circles"
                className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-white text-white hover:bg-white hover:text-obsidian text-[11px] font-black uppercase tracking-[0.14em] transition-colors"
              >
                Join Circles
              </Link>
              <Link
                href="/crews"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/40 text-white/90 hover:border-white hover:text-white text-[11px] font-black uppercase tracking-[0.14em] transition-colors"
              >
                Start a Crew
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="bg-ember overflow-hidden py-2.5">
        <div className="flex whitespace-nowrap animate-marquee">
          {[
            'Parties',
            'Clubs',
            'Lounges',
            'Outdoor Circles',
            'Party Crews',
            'Lagos · ~90 mins',
            '18+',
            'Parties',
            'Clubs',
            'Lounges',
            'Outdoor Circles',
            'Party Crews',
            'Lagos · ~90 mins',
            '18+',
          ].map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="mx-7 text-[10px] font-black uppercase tracking-[0.32em] text-white"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <section className="bg-paper py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-ember mb-3">How it works</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-obsidian mb-10">Three steps to the drop</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <div key={title} className="flex gap-4">
                <div className="shrink-0 w-11 h-11 rounded-full bg-ember/10 flex items-center justify-center">
                  <Icon size={20} className="text-ember" strokeWidth={2} />
                </div>
                <div>
                  <p className="font-semibold text-obsidian mb-1">
                    {i + 1}. {title}
                  </p>
                  <p className="text-sm text-obsidian/60 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20 border-y border-obsidian/5">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-ember mb-2">Recommended</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-obsidian">Tonight&apos;s picks</h2>
            </div>
            <Link
              href="/shop"
              className="text-[11px] font-black uppercase tracking-[0.15em] text-ember hover:text-ember-dark"
            >
              View all →
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-5 px-5 sm:mx-0 sm:px-0">
            {featured.map((p) => (
              <Link
                key={p.slug}
                href={`/shop/${p.slug}`}
                className="shrink-0 w-[160px] sm:w-[180px] group"
              >
                <div className="aspect-[3/4] overflow-hidden relative mb-3 border border-obsidian/10 bg-paper">
                  <DrinkPlaceholder
                    category={p.category}
                    name={p.name}
                    className="absolute inset-0 w-full h-full"
                  />
                  {p.deal && (
                    <span className="absolute top-2 left-2 bg-ember text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 z-10">
                      Deal
                    </span>
                  )}
                </div>
                <p className="text-xs text-obsidian leading-snug line-clamp-2 font-medium">
                  {p.name}
                </p>
                <p className="text-[11px] text-obsidian/50 mt-0.5">
                  {p.abv}% · {p.volume}
                </p>
                <p className="text-sm font-bold text-obsidian mt-1">{formatNgn(p.priceNgn)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-ember mb-2">Explore</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-obsidian mb-8">Popular categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {CATEGORIES.map((cat: DrinkCategory) => (
              <Link
                key={cat}
                href={`/shop?category=${cat}`}
                className="group relative aspect-[4/3] overflow-hidden border border-obsidian/10 bg-white hover:border-ember/40 transition-colors"
              >
                <DrinkPlaceholder
                  category={cat}
                  watermark={false}
                  className="absolute inset-0 w-full h-full"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-3 pt-8">
                  <span className="text-sm font-semibold text-white flex items-center gap-1">
                    {CATEGORY_LABELS[cat]}
                    <span className="text-ember group-hover:translate-x-0.5 transition-transform">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
