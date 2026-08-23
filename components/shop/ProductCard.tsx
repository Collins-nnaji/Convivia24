'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import DrinkPhoto from '@/components/shop/DrinkPhoto';
import DrinkInfoButton from '@/components/shop/DrinkInfoButton';
import { formatNgn, type DrinkProduct } from '@/lib/drinks/catalog';

export function ProductCard({ product }: { product: DrinkProduct }) {
  const { addProduct } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addProduct(product.slug, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="group flex flex-col">
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden mb-3 border border-obsidian/10 bg-paper">
          <DrinkPhoto product={product} className="absolute inset-0 w-full h-full" />
          {product.deal && (
            <span className="absolute top-2 left-2 badge-brand text-[8px] font-black uppercase tracking-wider px-2 py-0.5 z-10">
              Deal
            </span>
          )}
          {product.partyPack && (
            <span className="absolute top-2 right-2 bg-obsidian text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 z-10">
              Pack
            </span>
          )}
          <span className="absolute bottom-2 right-2 z-10" onClick={(e) => e.preventDefault()}>
            <DrinkInfoButton slug={product.slug} brand={product.brand} />
          </span>
        </div>
        <p className="text-xs text-obsidian/75 leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.name} · {product.abv}% · {product.volume}
        </p>
        <p className="text-sm font-semibold text-obsidian mt-1">{formatNgn(product.priceNgn)}</p>
      </Link>

      <div className="mt-2 flex items-center gap-2">
        <div className="flex items-center border border-obsidian/15 shrink-0">
          <button
            type="button"
            aria-label="Decrease quantity"
            className="p-2 text-obsidian/50 hover:text-obsidian"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            <Minus size={12} />
          </button>
          <span className="w-7 text-center text-xs font-semibold tabular-nums">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            className="p-2 text-obsidian/50 hover:text-obsidian"
            onClick={() => setQty((q) => Math.min(24, q + 1))}
          >
            <Plus size={12} />
          </button>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex-1 py-2 border border-obsidian/15 text-[10px] font-black uppercase tracking-[0.12em] text-obsidian hover:border-ember hover:text-ember transition-colors"
        >
          {added ? 'Added' : 'Add'}
        </button>
      </div>
    </article>
  );
}
