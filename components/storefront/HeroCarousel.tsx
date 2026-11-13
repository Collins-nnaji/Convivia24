'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { THEME_CLASSES, safeHref, type StorefrontBlock } from '@/lib/storefront/blocks';
import type { CatalogProduct } from '@/lib/shop/use-catalog';
import { bottlesForHref } from '@/lib/storefront/visuals';

const QUICK_LINKS = [
  { label: 'Party packs', href: '/shop?section=packages' },
  { label: 'Champagne', href: '/shop?type=champagne' },
  { label: 'Under ₦50,000', href: '/shop?price=u25,25-50' },
  { label: 'Deals', href: '/shop?offer=on-offer' },
  { label: 'Plan a party', href: '/party-planner' },
];

/**
 * Home hero. Slides come from the desk (Storefront → Hero banners). With an image the slide is
 * full-bleed photography; without one it is a branded panel with three real bottles on plinths.
 */
export default function HeroCarousel({ slides, products }: { slides: StorefrontBlock[]; products: CatalogProduct[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = slides.length;
  const featured = products.filter((p) => p.image && !p.partyPack && !p.sample).sort((a, b) => Number(!!b.featured) - Number(!!a.featured));

  const go = useCallback((n: number) => setIndex((n + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 7000);
    return () => clearInterval(t);
  }, [count, paused]);

  if (count === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[1600px] px-3 pt-4 sm:px-4 sm:pt-6 lg:px-5" aria-roledescription="carousel" aria-label="Featured">
      <div
        className="relative overflow-hidden rounded-t-3xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
          touchX.current = null;
        }}
      >
        <div className="flex transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)]" style={{ transform: `translateX(-${index * 100}%)` }}>
          {slides.map((slide, i) => {
            const t = THEME_CLASSES[slide.theme];
            const href = safeHref(slide.href);
            const bottles = slide.imageUrl ? [] : bottlesForHref(slide.href, products, featured);
            return (
              <div
                key={slide.id}
                className={`relative w-full shrink-0 ${slide.imageUrl ? 'bg-obsidian' : t.bg}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                aria-hidden={i !== index}
              >
                <div className="relative grid min-h-[420px] items-center sm:min-h-[440px] lg:min-h-[480px] lg:grid-cols-2 lg:items-stretch">
                  {slide.imageUrl ? (
                    <>
                      <Image src={slide.imageUrl} alt="" fill priority={i === 0} sizes="100vw" className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" />
                    </>
                  ) : (
                    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:22px_22px]" />
                  )}

                  <div className="relative z-10 px-6 pb-6 pt-10 sm:px-12 lg:px-16 lg:py-10">
                    <h2 className={`max-w-xl font-serif text-[2.1rem] font-light leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl ${slide.imageUrl ? 'text-white' : t.text}`}>
                      {slide.title}
                    </h2>
                    {slide.subtitle && (
                      <p className={`mt-4 max-w-md text-base leading-relaxed sm:text-lg ${slide.imageUrl ? 'text-white/80' : t.sub}`}>{slide.subtitle}</p>
                    )}
                    {href && (
                      <Link
                        href={href}
                        tabIndex={i === index ? 0 : -1}
                        className={`mt-7 inline-flex items-center rounded-full px-7 py-3 text-sm font-bold uppercase tracking-[0.1em] transition ${slide.imageUrl ? 'bg-white text-obsidian hover:bg-cream' : t.button}`}
                      >
                        {slide.ctaLabel || 'Shop now'}
                      </Link>
                    )}
                  </div>

                  {bottles.length > 0 && (
                    <div className="relative z-0 flex h-full items-end justify-center gap-2 px-6 pt-2 sm:gap-3 lg:px-8 lg:pt-8">
                      {bottles.map((p, b) => (
                        <div
                          key={p.slug}
                          className={`relative overflow-hidden rounded-t-[999px] bg-white shadow-2xl ${
                            b === 1
                              ? 'h-[210px] w-[104px] sm:h-[300px] sm:w-[150px] lg:h-[400px] lg:w-[190px]'
                              : 'h-[170px] w-[88px] sm:h-[250px] sm:w-[125px] lg:h-[330px] lg:w-[160px]'
                          }`}
                        >
                          <Image src={p.image!} alt={p.name} fill sizes="200px" priority={i === 0} className="object-contain p-4 pt-10" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {count > 1 && (
          <>
            <button type="button" onClick={() => go(index - 1)} aria-label="Previous slide" className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-obsidian shadow-lg hover:bg-white sm:grid">
              <ChevronLeft size={20} />
            </button>
            <button type="button" onClick={() => go(index + 1)} aria-label="Next slide" className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-obsidian shadow-lg hover:bg-white sm:grid">
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index}
                  className={`h-2 rounded-full transition-all ${i === index ? 'w-7 bg-white' : 'w-2 bg-white/45 hover:bg-white/70'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <nav aria-label="Quick links" className="flex justify-start gap-x-6 gap-y-2 overflow-x-auto rounded-b-3xl bg-shell px-5 py-3 scrollbar-hide sm:justify-center">
        {QUICK_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="shrink-0 text-[13px] font-semibold uppercase tracking-[0.06em] text-obsidian underline decoration-obsidian/30 underline-offset-4 hover:decoration-obsidian">
            {l.label}
          </Link>
        ))}
      </nav>
    </section>
  );
}
