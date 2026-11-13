'use client';

import { useState } from 'react';
import { ProductCard } from '@/components/shop/ProductCard';
import type { CatalogProduct } from '@/lib/shop/use-catalog';
import SectionHeading from './SectionHeading';

const STEP = 6;

/** "Handpicked for you" — the desk's featured bottles, six at a time. */
export default function HandpickedGrid({ products }: { products: CatalogProduct[] }) {
  const [shown, setShown] = useState(STEP);
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-[1600px] px-3 py-14 sm:px-4 sm:py-20 lg:px-5">
      <SectionHeading title="Handpicked for you" />
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-6">
        {products.slice(0, shown).map((p, i) => (
          <ProductCard key={p.slug} product={p} priority={i < 6} />
        ))}
      </div>
      {shown < products.length && (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => setShown((n) => n + STEP)}
            className="rounded-lg bg-obsidian px-7 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-ember"
          >
            Load more products
          </button>
        </div>
      )}
    </section>
  );
}
