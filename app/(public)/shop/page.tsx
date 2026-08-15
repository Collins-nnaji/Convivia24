import { Suspense } from 'react';
import ShopCatalog from '@/components/shop/ShopCatalog';

export const metadata = {
  title: 'Shop | Convivia24',
  description: 'Order drinks for parties, clubs, and lounges — Lagos delivery.',
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
