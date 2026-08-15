'use client';

import Link from 'next/link';
import { useCart } from '@/components/cart/CartProvider';
import DrinkPlaceholder from '@/components/shop/DrinkPlaceholder';
import { formatNgn, type DrinkProduct } from '@/lib/drinks/catalog';

export function ProductCard({ product }: { product: DrinkProduct }) {
  const { addProduct } = useCart();

  return (
    <article className="group flex flex-col">
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden mb-3 border border-obsidian/10 bg-paper">
          <DrinkPlaceholder
            category={product.category}
            name={product.name}
            className="absolute inset-0 w-full h-full"
          />
          {product.deal && (
            <span className="absolute top-2 left-2 bg-ember text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 z-10">
              Deal
            </span>
          )}
          {product.partyPack && (
            <span className="absolute top-2 right-2 bg-obsidian text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 z-10">
              Pack
            </span>
          )}
        </div>
        <p className="text-xs text-obsidian/75 leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.name} · {product.abv}% · {product.volume}
        </p>
        <p className="text-sm font-semibold text-obsidian mt-1">{formatNgn(product.priceNgn)}</p>
      </Link>
      <button
        type="button"
        onClick={() => addProduct(product.slug)}
        className="mt-2 w-full py-2 border border-obsidian/15 text-[10px] font-black uppercase tracking-[0.14em] text-obsidian hover:border-ember hover:text-ember transition-colors"
      >
        Add to cart
      </button>
    </article>
  );
}
