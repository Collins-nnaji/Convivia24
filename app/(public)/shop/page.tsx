import type { Metadata } from 'next';
import { Suspense } from 'react';
import ShopCatalog from '@/components/shop/ShopCatalog';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Shop drinks & party packs',
  description:
    'Order spirits, Champagne, mixers, and ready-made party packs with nationwide delivery across Nigeria. Adults 18+.',
  alternates: { canonical: absoluteUrl('/shop') },
  openGraph: {
    title: 'Shop drinks | Convivia24',
    description: 'Bottles and party packages delivered nationwide across Nigeria.',
    url: absoluteUrl('/shop'),
  },
};

export default function ShopPage() {
  return (
    <section className="bg-paper min-h-[70vh]">
      <Suspense
        fallback={
          <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-5 py-20 text-base text-obsidian/40">
            Loading shop…
          </div>
        }
      >
        <ShopCatalog />
      </Suspense>
    </section>
  );
}
