import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { BRANDS } from '@/lib/brands/catalog';
import { formatNgn } from '@/lib/drinks/catalog';
import { absoluteUrl } from '@/lib/seo';
import BrandEnquiryForm from '@/components/trivia/BrandEnquiryForm';

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
    <section className="min-h-[70vh] bg-paper">
      <header className="border-b border-obsidian/8 bg-white">
        <div className="mx-auto max-w-6xl px-4 pb-5 pt-6 sm:px-6 sm:pb-6 sm:pt-8">
          <h1 className="font-wordmark text-3xl leading-tight sm:text-5xl">
            <span className="brand-text">Brands</span>
          </h1>
          <p className="mt-1.5 text-[15px] font-semibold text-obsidian/65 sm:text-base">
            {BRANDS.length} houses — history, style, and the bottles we carry when they are in.
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {BRANDS.map((brand) => {
            const hero = brand.products.find((p) => p.image);
            const from = brand.products[0];
            return (
              <li key={brand.slug}>
                <Link
                  href={`/brands/${brand.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-obsidian/10 bg-white transition-colors hover:border-ember/40"
                >
                  <span className="relative block aspect-[16/9] overflow-hidden rounded-t-2xl bg-paper">
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
                  <span className="flex flex-1 flex-col p-4">
                    <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-obsidian/45">
                      {brand.info.origin}
                    </span>
                    <span className="block font-logo font-extrabold uppercase tracking-tight text-lg mt-1">
                      {brand.name}
                    </span>
                    <span className="block text-[13px] text-obsidian/55 mt-2 leading-relaxed line-clamp-2">
                      {brand.info.style}
                    </span>
                    <span className="mt-auto pt-4 flex items-center justify-between gap-3">
                      <span className="text-[12px] text-obsidian/45">
                        {brand.products.length > 0 ? (
                          <>
                            {brand.products.length} bottle{brand.products.length === 1 ? '' : 's'}
                            {from && <> · from {formatNgn(from.priceNgn)}</>}
                          </>
                        ) : (
                          'Range between drops'
                        )}
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

        <div className="mt-10">
          <BrandEnquiryForm />
        </div>
      </div>
    </section>
  );
}
