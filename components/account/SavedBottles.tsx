'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import DrinkPlaceholder from '@/components/shop/DrinkPlaceholder';
import { useSaved } from '@/lib/shop/wishlist';
import { findSellable } from '@/lib/catalog/sellable';
import { formatNgn, type DrinkProduct } from '@/lib/drinks/catalog';

/**
 * The bottles saved from product pages. The list lives in this browser, so it
 * says so rather than implying it follows the account around.
 */
export default function SavedBottles() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const { addProduct } = useCart();

  useEffect(() => {
    const read = () => {
      try {
        const parsed = JSON.parse(localStorage.getItem('convivia_wishlist') || '[]');
        setSlugs(Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : []);
      } catch {
        setSlugs([]);
      }
    };
    read();
    window.addEventListener('convivia:saved', read);
    return () => window.removeEventListener('convivia:saved', read);
  }, []);

  const products = slugs
    .map((slug) => findSellable(slug))
    .filter((p): p is DrinkProduct => Boolean(p));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-logo font-black uppercase tracking-tight text-2xl sm:text-3xl">
          <span className="brand-text">Saved bottles</span>
        </h1>
        <p className="text-obsidian/50 mt-2 text-sm">
          Kept in this browser — saving does not need an account, and it does not follow you to another
          device.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="bg-white border border-obsidian/8 p-10 text-center">
          <Heart size={28} className="mx-auto text-ember/30 mb-3" />
          <p className="text-sm text-obsidian/55">Nothing saved yet.</p>
          <Link
            href="/shop"
            className="mt-4 inline-block px-5 py-2.5 btn-brand text-[10px] font-black uppercase tracking-[0.14em]"
          >
            Browse the shop
          </Link>
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {products.map((product, i) => (
            <SavedCard key={product.slug} product={product} index={i} onAdd={() => addProduct(product.slug, 1)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function SavedCard({
  product,
  index,
  onAdd,
}: {
  product: DrinkProduct;
  index: number;
  onAdd: () => void;
}) {
  const { toggle } = useSaved(product.slug, 'bottles');

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 6) * 0.04, duration: 0.3 }}
      className="bg-white border border-obsidian/8 hover:border-ember/35 transition-colors"
    >
      <div className="relative">
        <Link href={`/shop/${product.slug}`} className="relative block aspect-[4/3] bg-white overflow-hidden">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill sizes="280px" className="object-contain p-4" />
          ) : (
            <DrinkPlaceholder
              category={product.category}
              name={product.name}
              className="absolute inset-0 w-full h-full"
              watermark={false}
            />
          )}
        </Link>
        <button
          type="button"
          onClick={toggle}
          aria-label={`Remove ${product.name} from saved`}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 border border-obsidian/8 flex items-center justify-center text-obsidian/35 hover:text-ember transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-4">
        <Link href={`/shop/${product.slug}`} className="block">
          <p className="font-semibold text-sm leading-snug line-clamp-2 hover:text-ember transition-colors">
            {product.name}
          </p>
        </Link>
        <p className="text-[12px] text-obsidian/40 mt-0.5">{product.volume}</p>
        <p className="font-bold mt-1.5">{formatNgn(product.priceNgn)}</p>
        <button
          type="button"
          onClick={onAdd}
          className="w-full mt-3 py-2.5 btn-brand text-[10px] font-black uppercase tracking-[0.12em]"
        >
          Add to cart
        </button>
      </div>
    </motion.li>
  );
}
