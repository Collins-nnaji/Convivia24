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
  { name: 'Johnnie Walker', kicker: 'Scotch' },
  { name: 'Jameson', kicker: 'Irish whiskey' },
  { name: 'Glenfiddich', kicker: 'Single malt' },
  { name: 'Moët & Chandon', kicker: 'Champagne' },
  { name: 'Cîroc', kicker: 'Vodka' },
  { name: 'Don Julio', kicker: 'Tequila' },
].map((h) => ({ ...h, href: `/shop?q=${encodeURIComponent(h.name)}` }));

export default function BrandStrip() {
  return (
    <section className="bg-obsidian text-white p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-white/70">
          Top brands. Exclusive offers.
        </h2>
        <Link
          href="/shop"
          className="text-[11px] font-black uppercase tracking-[0.12em] text-white/45 hover:text-white inline-flex items-center gap-1 transition-colors"
        >
          View all brands <ChevronRight size={13} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-x-4 gap-y-6">
        {HOUSES.map((house, i) => (
          <motion.div
            key={house.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
          >
            <Link href={house.href} className="group block text-center">
              <p className="font-logo font-light uppercase tracking-[0.08em] text-sm sm:text-[15px] text-white/85 group-hover:text-white transition-colors leading-tight">
                {house.name}
              </p>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30 mt-1.5">
                {house.kicker}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
