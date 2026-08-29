'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import DrinkPlaceholder from '@/components/shop/DrinkPlaceholder';
import { formatNgn, type DrinkProduct } from '@/lib/drinks/catalog';

export default function RelatedProducts({ products }: { products: DrinkProduct[] }) {
  const { addProduct } = useCart();
  if (products.length === 0) return null;

  return (
    <div className="bg-white border border-obsidian/8">
      <div className="px-5 py-4 border-b border-obsidian/8 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold">You may also like</h2>
        <Link
          href="/shop"
          className="text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/40 hover:text-ember transition-colors"
        >
          View all
        </Link>
      </div>

      <ul className="divide-y divide-obsidian/6">
        {products.map((product, i) => (
          <motion.li
            key={product.slug}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            className="flex items-center gap-4 p-4"
          >
            <Link href={`/shop/${product.slug}`} className="relative w-14 h-16 shrink-0 bg-white overflow-hidden">
              {product.image ? (
                <Image src={product.image} alt={product.name} fill sizes="56px" className="object-contain" />
              ) : (
                <DrinkPlaceholder
                  category={product.category}
                  name={product.name}
                  className="absolute inset-0 w-full h-full"
                  watermark={false}
                />
              )}
            </Link>

            <div className="min-w-0 flex-1">
              <Link href={`/shop/${product.slug}`} className="block">
                <p className="text-sm font-semibold leading-snug truncate hover:text-ember transition-colors">
                  {product.name}
                </p>
                <p className="text-[11px] text-obsidian/40 mt-0.5">{product.volume}</p>
                <p className="text-sm font-bold mt-1">{formatNgn(product.priceNgn)}</p>
              </Link>
            </div>

            <button
              type="button"
              onClick={() => addProduct(product.slug, 1)}
              aria-label={`Add ${product.name} to cart`}
              className="w-9 h-9 border border-obsidian/12 flex items-center justify-center text-obsidian/50 hover:border-ember hover:text-ember transition-colors shrink-0"
            >
              <Plus size={16} />
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
