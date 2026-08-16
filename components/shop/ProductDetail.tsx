'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Minus, Plus } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import DrinkPhoto from '@/components/shop/DrinkPhoto';
import { formatNgn, CATEGORY_LABELS, type DrinkProduct } from '@/lib/drinks/catalog';

export default function ProductDetail({ product }: { product: DrinkProduct }) {
  const { addProduct } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addProduct(product.slug, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.15em] text-obsidian/40 hover:text-ember mb-8"
        >
          <ArrowLeft size={14} /> Back to shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="relative aspect-[3/4] sm:aspect-square overflow-hidden border border-obsidian/10 bg-paper">
            <DrinkPhoto product={product} className="absolute inset-0 w-full h-full" />
            {product.deal && (
              <span className="absolute top-4 left-4 badge-brand text-[9px] font-black uppercase tracking-wider px-2.5 py-1 z-10">
                Hot deal
              </span>
            )}
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-ember mb-2">
              {CATEGORY_LABELS[product.category]}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-obsidian mb-2">{product.name}</h1>
            <p className="text-sm text-obsidian/45 mb-4">
              {[product.brand, product.origin, `${product.abv}% ABV`, product.volume, product.servesHint]
                .filter(Boolean)
                .join(' · ')}
            </p>
            <p className="text-2xl font-bold brand-text mb-6">{formatNgn(product.priceNgn)}</p>
            <p className="text-obsidian/60 leading-relaxed mb-2">{product.tagline}</p>
            <p className="text-sm text-obsidian/50 leading-relaxed mb-6">{product.description}</p>
            {product.includes && product.includes.length > 0 ? (
              <ul className="mb-8 space-y-1.5">
                {product.includes.map((item) => (
                  <li key={item} className="text-sm text-obsidian/70 flex gap-2">
                    <span className="text-ember">▸</span> {item}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mb-8" />
            )}

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-obsidian/15">
                <button
                  type="button"
                  aria-label="Decrease"
                  className="p-3 text-obsidian/50 hover:text-obsidian"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                <button
                  type="button"
                  aria-label="Increase"
                  className="p-3 text-obsidian/50 hover:text-obsidian"
                  onClick={() => setQty((q) => Math.min(24, q + 1))}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 py-3.5 btn-brand text-[11px] font-black uppercase tracking-[0.14em]"
              >
                {added ? 'Added ✓' : 'Add to cart'}
              </button>
              <Link
                href="/events"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 border border-obsidian/15 text-obsidian text-[11px] font-black uppercase tracking-[0.14em] hover:border-ember hover:text-ember transition-colors"
              >
                <CalendarDays size={14} /> Drop to an event
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
