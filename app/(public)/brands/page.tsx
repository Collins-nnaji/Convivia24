import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { BRANDS } from '@/lib/brands/catalog';
import { formatNgn } from '@/lib/drinks/catalog';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Brands',
  description:
    'The houses stocked on Convivia24 — cognac, Scotch, Irish whiskey, champagne, tequila and vodka. House histories, tasting notes, and every bottle we carry. Adults 18+.',
  alternates: { canonical: absoluteUrl('/brands') },
  openGraph: {
    title: 'Brands | Convivia24',
    description: 'Every house we stock, written up honestly.',
    url: absoluteUrl('/brands'),
  },
};

export default function BrandsPage() {
  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="relative overflow-hidden border-b border-obsidian/8">
        <div className="absolute inset-0 brand-gradient opacity-[0.05]" />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-10 pb-10 sm:pt-14 sm:pb-12">
          <h1 className="font-logo font-black tracking-tight uppercase text-4xl sm:text-6xl leading-[0.9]">
            <span className="brand-text">Brands</span>
          </h1>
          <p className="text-lg font-semibold text-obsidian/70 mt-3">The houses behind the bottles.</p>
          <p className="text-base text-obsidian/50 mt-2 max-w-lg leading-relaxed">
            Every house we stock, with its history, its range, and the rounds you can play on it. Written
            and maintained by Convivia24.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {BRANDS.map((brand) => {
            const hero = brand.products.find((p) => p.image);
            const from = brand.products[0];
            return (
              <li key={brand.slug}>
                <Link
                  href={`/brands/${brand.slug}`}
                  className="group h-full bg-white border border-obsidian/8 hover:border-ember/35 transition-colors flex flex-col"
                >
                  <span className="relative block aspect-[16/10] bg-paper overflow-hidden">
                    {hero?.image && (
                      <Image
                        src={hero.image}
                        alt={brand.name}
                        fill
                        sizes="360px"
                        className="object-contain p-6"
                      />
                    )}
                  </span>
                  <span className="p-5 flex-1 flex flex-col">
                    <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-obsidian/35">
                      {brand.info.origin}
                    </span>
                    <span className="block font-logo font-extrabold uppercase tracking-tight text-lg mt-1">
                      {brand.name}
                    </span>
                    <span className="block text-[12px] text-obsidian/50 mt-2 leading-relaxed line-clamp-2">
                      {brand.info.style}
                    </span>
                    <span className="mt-auto pt-4 flex items-center justify-between gap-3">
                      <span className="text-[12px] text-obsidian/45">
                        {brand.products.length} bottle{brand.products.length === 1 ? '' : 's'}
                        {from && <> · from {formatNgn(from.priceNgn)}</>}
                      </span>
                      <ChevronRight
                        size={16}
                        className="text-obsidian/20 group-hover:text-ember transition-colors"
                      />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
