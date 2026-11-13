'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';
import type { CatalogProduct } from '@/lib/shop/use-catalog';
import SectionHeading from './SectionHeading';

/** Horizontal product rail with edge arrows and a progress track. */
export default function ProductRail({
  title,
  intro,
  href,
  products,
  tone = 'white',
}: {
  title: string;
  intro?: string;
  href?: string;
  products: CatalogProduct[];
  tone?: 'white' | 'shell';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  function sync() {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < max - 4);
  }

  useEffect(() => {
    sync();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [products]);

  const page = (d: -1 | 1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: d * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  if (products.length === 0) return null;

  return (
    <section className={tone === 'shell' ? 'bg-shell' : ''}>
      <div className="mx-auto max-w-[1600px] px-3 py-14 sm:px-4 sm:py-20 lg:px-5">
        <SectionHeading title={title} intro={intro} href={href} />
        <div className="relative">
          <div ref={ref} onScroll={sync} className="-mx-3 flex snap-x snap-mandatory gap-4 overflow-x-auto px-3 pb-2 scrollbar-hide sm:mx-0 sm:gap-5 sm:px-0">
            {products.map((p) => (
              <div key={p.slug} className="w-[46%] shrink-0 snap-start sm:w-[30%] lg:w-[calc((100%-5*1.25rem)/6)]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
          {[
            { side: 'left' as const, show: canLeft, d: -1 as const, Icon: ChevronLeft },
            { side: 'right' as const, show: canRight, d: 1 as const, Icon: ChevronRight },
          ].map(({ side, show, d, Icon }) => (
            <button
              key={side}
              type="button"
              onClick={() => page(d)}
              aria-label={`Scroll ${title} ${side}`}
              tabIndex={show ? 0 : -1}
              className={`absolute top-[32%] z-10 hidden h-11 w-11 place-items-center rounded-full bg-white text-obsidian shadow-[0_6px_20px_rgba(0,0,0,0.15)] ring-1 ring-obsidian/10 transition hover:text-ember sm:grid ${
                side === 'left' ? '-left-4' : '-right-4'
              } ${show ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            >
              <Icon size={20} />
            </button>
          ))}
        </div>
        <div className="mx-auto mt-6 h-1 max-w-md overflow-hidden rounded-full bg-obsidian/10" aria-hidden>
          <div className="h-full w-1/4 rounded-full bg-obsidian/60 transition-transform" style={{ transform: `translateX(${progress * 300}%)` }} />
        </div>
      </div>
    </section>
  );
}
