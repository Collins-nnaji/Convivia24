'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';
import DrinkPlaceholder from '@/components/shop/DrinkPlaceholder';
import type { DrinkProduct } from '@/lib/drinks/catalog';
import { galleryFor } from '@/lib/drinks/catalog';

/**
 * Product photography: a thumbnail rail beside the main frame, and a lightbox
 * on click. The rail only appears when the product genuinely has more than one
 * shot — most bottles ship with a single image.
 */
export default function ProductGallery({ product }: { product: DrinkProduct }) {
  const shots = galleryFor(product);
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomed(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoomed]);

  const current = shots[active];

  return (
    <div className="flex gap-3 sm:gap-4">
      {shots.length > 1 && (
        <div className="flex flex-col gap-2.5 shrink-0 w-[62px] sm:w-[74px]">
          {shots.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              className={`relative aspect-square bg-white border transition-colors ${
                i === active ? 'border-ember' : 'border-obsidian/10 hover:border-obsidian/30'
              }`}
            >
              <Image src={src} alt="" fill sizes="74px" className="object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}

      <div className="relative flex-1 min-w-0">
        <div className="relative aspect-square bg-white border border-obsidian/8 overflow-hidden">
          {current ? (
            <>
              <motion.div
                key={current}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <Image
                  src={current}
                  alt={product.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 520px, 90vw"
                  className="object-contain p-6 sm:p-10"
                />
              </motion.div>
              <button
                type="button"
                onClick={() => setZoomed(true)}
                aria-label="Zoom image"
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 border border-obsidian/10 flex items-center justify-center text-obsidian/50 hover:text-ember transition-colors"
              >
                <ZoomIn size={16} />
              </button>
            </>
          ) : (
            <DrinkPlaceholder
              category={product.category}
              name={product.name}
              className="absolute inset-0 w-full h-full"
            />
          )}

          {product.deal && (
            <span className="absolute top-4 left-4 badge-brand text-[9px] font-black uppercase tracking-wider px-2.5 py-1">
              Hot deal
            </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {zoomed && current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-obsidian/85 flex items-center justify-center p-6"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setZoomed(false)}
              className="absolute inset-0"
            />
            <button
              type="button"
              onClick={() => setZoomed(false)}
              aria-label="Close"
              className="absolute top-5 right-5 text-white/70 hover:text-white z-10"
            >
              <X size={24} />
            </button>
            <motion.div
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.94 }}
              className="relative w-full max-w-2xl aspect-square bg-white"
            >
              <Image src={current} alt={product.name} fill sizes="90vw" className="object-contain p-8" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
