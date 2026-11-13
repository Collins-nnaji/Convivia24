'use client';

import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import DrinkPhoto from '@/components/shop/DrinkPhoto';
import DrinkInfoButton from '@/components/shop/DrinkInfoButton';
import Stars from '@/components/shop/Stars';
import {
  BADGE_LABELS,
  CATEGORY_LABELS,
  formatNgn,
  formatNgnShort,
  savingNgn,
  type DrinkProduct,
} from '@/lib/drinks/catalog';
import { tasteNoteForSlug } from '@/lib/drinks/taste-note';
import { useSaved } from '@/lib/shop/wishlist';

export type ProductCardData = DrinkProduct & {
  tasteNote?: string | null;
  onHand?: number;
  available?: number;
  lowStock?: boolean;
  /** Published-review average, 0 when nobody has rated it yet. */
  rating?: number;
  ratingCount?: number;
};

/**
 * The storefront's one product tile — shop grid, home rails, related products.
 * Cream image well, SAVE roundel when the desk sets a higher "was" price, one ribbon,
 * and a single add-to-basket action (min-qty SKUs add their minimum).
 */
export function ProductCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  const { addProduct } = useCart();
  const { saved, toggle } = useSaved(product.slug);
  const minQty = Math.max(1, Math.min(24, Math.floor(product.minOrderQty ?? 1)));
  const tasteNote = tasteNoteForSlug(product.slug, product.tasteNote);
  const saving = savingNgn(product);
  const soldOut = typeof product.available === 'number' && product.available <= 0;
  const ribbon = product.badge ? BADGE_LABELS[product.badge] : product.partyPack ? 'Party pack' : null;
  const href = `/shop/${product.slug}`;

  return (
    <article className="group/card relative flex h-full flex-col">
      <div className="relative mb-3 aspect-[4/5] overflow-hidden rounded-2xl bg-shell ring-1 ring-inset ring-obsidian/[0.04]">
        <Link href={href} aria-label={product.name} className="absolute inset-0" prefetch={priority}>
          <DrinkPhoto
            product={product}
            className={`absolute inset-0 h-full w-full !bg-transparent mix-blend-multiply transition-transform duration-500 ease-out group-hover/card:scale-[1.05] ${
              soldOut ? 'opacity-50 grayscale' : ''
            }`}
          />
        </Link>

        {(saving > 0 || product.deal) && (
          <span
            className="pointer-events-none absolute left-2.5 top-2.5 z-10 grid h-14 w-14 -rotate-12 place-items-center rounded-full bg-lilac text-center font-serif text-[11px] font-semibold uppercase leading-[1.05] text-obsidian shadow-sm sm:h-16 sm:w-16 sm:text-[12px]"
            aria-label={saving > 0 ? `Save ${formatNgn(saving)}` : 'On offer'}
          >
            {saving > 0 ? (
              <span>
                Save
                <br />
                {formatNgnShort(saving)}
              </span>
            ) : (
              'Deal'
            )}
          </span>
        )}

        <button
          type="button"
          onClick={toggle}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from saved` : `Save ${product.name}`}
          className={`absolute right-2.5 top-2.5 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-sm ring-1 ring-obsidian/5 backdrop-blur transition hover:scale-105 ${
            saved ? 'text-ember' : 'text-obsidian/50 hover:text-obsidian'
          }`}
        >
          <Heart size={16} fill={saved ? 'currentColor' : 'none'} strokeWidth={2} />
        </button>

        <span className="absolute bottom-2.5 right-2.5 z-10">
          <DrinkInfoButton slug={product.slug} brand={product.brand} tasteNote={tasteNote} />
        </span>

        {soldOut ? (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-obsidian/80 py-1.5 text-center text-[10px] font-black uppercase tracking-[0.18em] text-white">
            Sold out
          </span>
        ) : (
          ribbon && (
            <span className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap bg-obsidian px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white [clip-path:polygon(4px_0,calc(100%-4px)_0,100%_50%,calc(100%-4px)_100%,4px_100%,0_50%)]">
              {ribbon}
            </span>
          )
        )}
      </div>

      <Link href={href} className="flex flex-1 flex-col px-0.5" prefetch={false}>
        <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-obsidian/45">
          {product.brand || CATEGORY_LABELS[product.category]}
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-[14px] font-semibold leading-snug text-obsidian group-hover/card:underline group-hover/card:decoration-obsidian/30 group-hover/card:underline-offset-2 sm:text-[15px]">
          {product.name}
        </h3>
        <p className="mt-0.5 text-xs text-obsidian/50">
          {product.volume} · {product.abv}%{product.origin ? ` · ${product.origin}` : ''}
        </p>
        {/* Only once a bottle has reviews — an empty star row reads as a bad score. */}
        {product.rating != null && product.rating > 0 && (
          <span className="mt-1 flex items-center gap-1">
            <Stars value={product.rating} size={12} />
            <span className="text-[11px] font-semibold text-obsidian/50">
              {product.rating.toFixed(1)}
              {product.ratingCount ? ` (${product.ratingCount})` : ''}
            </span>
          </span>
        )}
        <p className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-2">
          <span className={`text-base font-bold sm:text-lg ${saving > 0 ? 'text-ember' : 'text-obsidian'}`}>
            {formatNgn(product.priceNgn)}
          </span>
          {saving > 0 && product.compareAtNgn && (
            <span className="text-xs text-obsidian/40 line-through">{formatNgn(product.compareAtNgn)}</span>
          )}
        </p>
        {!soldOut && product.lowStock && typeof product.available === 'number' && (
          <p className="text-[11px] font-semibold text-ember">Only {product.available} left</p>
        )}
      </Link>

      <button
        type="button"
        onClick={() => addProduct(product.slug, minQty)}
        disabled={soldOut}
        className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-obsidian py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-ember active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-obsidian/15 disabled:text-obsidian/40"
      >
        <ShoppingBag size={14} />
        {soldOut ? 'Out of stock' : minQty > 1 ? `Add ${minQty} to basket` : 'Add to basket'}
      </button>
    </article>
  );
}
