'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

/**
 * The houses stocked on Convivia24. Set as type rather than logo files — we do
 * not have licensed brand marks, and a wordmark row reads cleaner than
 * mismatched logos anyway.
 */
const HOUSES = [
  { name: 'Hennessy', kicker: 'Cognac' },
  { name: 'Martell', kicker: 'Cognac' },
  { name: 'Johnnie Walker', kicker: 'Scotch' },
  { name: 'The Macallan', kicker: 'Single malt' },
  { name: 'Jameson', kicker: 'Irish whiskey' },
  { name: 'Glenfiddich', kicker: 'Single malt' },
  { name: 'Moët & Chandon', kicker: 'Champagne' },
  { name: 'Cîroc', kicker: 'Vodka' },
  { name: 'Don Julio', kicker: 'Tequila' },
  { name: 'Rémy Martin', kicker: 'Cognac' },
].map((h) => ({ ...h, href: `/shop?q=${encodeURIComponent(h.name)}` }));

export default function BrandStrip() {
  return (
    <section className="bg-obsidian text-white p-6 sm:p-8">
      <Link
        href="/brands"
        className="group mb-6 flex items-center justify-between gap-4"
        aria-label="View all brands"
      >
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-white/70 transition-colors group-hover:text-white">
          Top brands. Exclusive offers.
        </h2>
        <span className="text-[11px] font-black uppercase tracking-[0.12em] text-white/45 group-hover:text-white inline-flex items-center gap-1 transition-colors">
          View all brands <ChevronRight size={13} />
        </span>
      </Link>

      <div className="grid grid-cols-5 gap-x-2 gap-y-4 sm:gap-x-4 sm:gap-y-6">
        {HOUSES.map((house, i) => (
          <motion.div
            key={house.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="min-w-0"
          >
            <Link href={house.href} className="group block text-center px-0.5 sm:px-0">
              <p className="font-logo font-light uppercase tracking-[0.06em] sm:tracking-[0.08em] text-[10px] sm:text-[15px] text-white/85 group-hover:text-white transition-colors leading-tight">
                {house.name}
              </p>
              <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.14em] sm:tracking-[0.18em] text-white/30 mt-1 sm:mt-1.5 line-clamp-1">
                {house.kicker}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
