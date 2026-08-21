'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, MapPin } from 'lucide-react';
import DrinkPhoto from '@/components/shop/DrinkPhoto';
import { DRINKS, formatNgn } from '@/lib/drinks/catalog';
import { BRAND_INFO, TASTE_NOTES } from '@/lib/drinks/brand-guide';

const brands = Array.from(new Set(DRINKS.filter((d) => !d.partyPack && d.brand).map((d) => d.brand as string)))
  .filter((b) => BRAND_INFO[b])
  .sort((a, b) => a.localeCompare(b));

export default function BrandGuide() {
  const [active, setActive] = useState<string | null>(null);

  const products = useMemo(
    () => (active ? DRINKS.filter((d) => d.brand === active && !d.partyPack) : []),
    [active]
  );
  const info = active ? BRAND_INFO[active] : null;

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16 border-t border-obsidian/8">
      <div className="flex items-center gap-2 mb-1">
        <BookOpen size={16} className="text-ember" />
        <h2 className="font-logo font-extrabold uppercase tracking-tight text-xl">Brand guide</h2>
      </div>
      <p className="text-sm text-obsidian/50 mb-6">
        The taste and the story behind every house we stock — pick a brand to read up before you order.
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        {brands.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setActive(active === b ? null : b)}
            className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] transition-colors border ${
              active === b
                ? 'bg-obsidian text-white border-obsidian'
                : 'bg-white text-obsidian/60 border-obsidian/12 hover:border-ember hover:text-ember'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {info && active && (
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white border border-obsidian/8 shadow-sm p-5 sm:p-7"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <h3 className="font-logo font-extrabold uppercase tracking-tight text-2xl">{active}</h3>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-obsidian/45">
              <MapPin size={12} /> {info.origin} · est. {info.founded}
            </span>
          </div>
          <p className="text-sm text-obsidian/70 leading-relaxed mb-3">{info.history}</p>
          <p className="text-[12px] text-obsidian/45 mb-6">
            <span className="font-semibold text-obsidian/60">Style — </span>
            {info.style}
          </p>

          {products.length > 0 && (
            <>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/35 mb-3">
                In stock
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {products.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/shop/${p.slug}`}
                    className="flex gap-3 p-3 border border-obsidian/8 hover:border-ember/40 transition-colors"
                  >
                    <div className="relative w-14 h-14 shrink-0 bg-paper border border-obsidian/8">
                      <DrinkPhoto product={p} className="absolute inset-0 w-full h-full" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-obsidian truncate">{p.name}</p>
                      <p className="text-[11px] text-obsidian/45 mb-1">{formatNgn(p.priceNgn)}</p>
                      {TASTE_NOTES[p.slug] && (
                        <p className="text-[11px] text-obsidian/50 line-clamp-2">{TASTE_NOTES[p.slug]}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
