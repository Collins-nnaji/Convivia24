import type { Metadata } from 'next';
import { Suspense } from 'react';
import ShopCatalog from '@/components/shop/ShopCatalog';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Shop drinks',
  description:
    'Order spirits, Champagne, tequila, vodka, and Party Packs for parties, clubs, and lounges. Nationwide delivery across Nigeria. Adults 18+.',
  alternates: { canonical: absoluteUrl('/shop') },
  openGraph: {
    title: 'Shop drinks | Convivia24',
    description: 'Bottles and Party Packs delivered nationwide across Nigeria.',
    url: absoluteUrl('/shop'),
  },
};

export default function ShopPage() {
  return (
    <section className="bg-paper min-h-[70vh]">
      <Suspense fallback={<div className="max-w-6xl mx-auto px-5 py-20 text-sm text-obsidian/40">Loading shop…</div>}>
        <ShopCatalog />
      </Suspense>
    </section>
  );
}
