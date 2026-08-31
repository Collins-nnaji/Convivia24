'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import DrinkPhoto from '@/components/shop/DrinkPhoto';
import DrinkInfoButton from '@/components/shop/DrinkInfoButton';
import { formatNgn, type DrinkProduct } from '@/lib/drinks/catalog';
import { tasteNoteForSlug } from '@/lib/drinks/taste-note';

export type ProductCardData = DrinkProduct & {
  tasteNote?: string | null;
  onHand?: number;
  available?: number;
  lowStock?: boolean;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const { addProduct } = useCart();
  const [qty, setQty] = useState(1);
  const tasteNote = tasteNoteForSlug(product.slug, product.tasteNote);

  function handleAdd() {
    addProduct(product.slug, qty);
  }

  const stockLabel =
    typeof product.available === 'number'
      ? product.available <= 0
        ? 'Out of stock'
        : product.lowStock
          ? `Low · ${product.available} left`
          : `${product.available} in stock`
      : null;

  return (
    <article className="group/card flex h-full flex-col overflow-hidden rounded-2xl border border-obsidian/[0.07] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-ember/30 hover:shadow-[0_12px_32px_rgba(139,42,34,0.12)] active:scale-[0.99]">
      <Link href={`/shop/${product.slug}`} className="block flex-1 p-2 pb-1.5 sm:p-3 sm:pb-2">
        <div className="relative mb-2 aspect-[3/4] overflow-hidden rounded-xl bg-gradient-to-b from-[#f7f3ee] to-white ring-1 ring-inset ring-obsidian/[0.06] sm:mb-3">
          <DrinkPhoto
            product={product}
            className="absolute inset-0 h-full w-full transition-transform duration-500 ease-out group-hover/card:scale-[1.06]"
          />
          {product.deal && (
            <span className="absolute left-2 top-2 z-10 badge-brand px-2 py-0.5 text-[8px] font-black uppercase tracking-wider">
              Deal
            </span>
          )}
          {product.partyPack && (
            <span className="absolute right-2 top-2 z-10 bg-obsidian px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white">
              Pack
            </span>
          )}
          {stockLabel && (
            <span
              className={`absolute left-2 bottom-2 z-10 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                product.available! <= 0
                  ? 'bg-obsidian/70 text-white'
                  : product.lowStock
                    ? 'bg-ember text-white'
                    : 'bg-white/90 text-obsidian/60'
              }`}
            >
              {stockLabel}
            </span>
          )}
          <span
            className="absolute bottom-2 right-2 z-10"
            onClick={(e) => e.preventDefault()}
          >
            <DrinkInfoButton slug={product.slug} brand={product.brand} tasteNote={tasteNote} />
          </span>
        </div>
        <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-obsidian sm:text-[15px]">
          {product.name}
        </p>
        <p className="mt-0.5 text-[11px] text-obsidian/45 sm:mt-1 sm:text-xs">
          {product.abv}% · {product.volume}
        </p>
        <p className="mt-1 text-sm font-bold text-obsidian sm:mt-1.5 sm:text-base">{formatNgn(product.priceNgn)}</p>
      </Link>

      <div className="mt-auto flex items-center gap-1 border-t border-obsidian/[0.06] bg-paper/30 px-2 py-2 sm:gap-2 sm:px-3 sm:py-2.5">
        <div className="flex shrink-0 items-center overflow-hidden rounded-lg border border-obsidian/10 bg-white">
          <button
            type="button"
            aria-label="Decrease quantity"
            className="p-1.5 text-obsidian/45 transition-colors hover:bg-obsidian/[0.04] hover:text-obsidian active:scale-95 sm:p-2"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            <Minus size={13} />
          </button>
          <span className="w-5 text-center text-xs font-semibold tabular-nums sm:w-8 sm:text-sm">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            className="p-1.5 text-obsidian/45 transition-colors hover:bg-obsidian/[0.04] hover:text-obsidian active:scale-95 sm:p-2"
            onClick={() => setQty((q) => Math.min(24, q + 1))}
          >
            <Plus size={13} />
          </button>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={product.available === 0}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-obsidian/12 bg-white py-2 text-[10px] font-black uppercase tracking-[0.08em] text-obsidian transition-all duration-200 hover:border-ember/45 hover:bg-obsidian hover:text-white hover:shadow-md hover:shadow-black/15 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-obsidian/12 disabled:hover:bg-white disabled:hover:text-obsidian disabled:hover:shadow-none sm:gap-1.5 sm:py-2.5 sm:text-[11px] sm:tracking-[0.1em]"
        >
          <ShoppingBag size={13} className="opacity-60" />
          Add
        </button>
      </div>
    </article>
  );
}
