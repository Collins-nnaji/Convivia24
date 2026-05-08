'use client';

import { useEffect, useState } from 'react';
import { BrandLogo } from '@/components/BrandLogo';

const SPLASH_MS = 1000;

/**
 * Full-screen logo + tagline on first paint of the app shell, then unmounts.
 * Bounce animation is ~1s (see `.animate-convivia-logo-bounce` in globals.css).
 */
export function AppOpenSplash({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShowSplash(false);
      return;
    }
    const id = window.setTimeout(() => setShowSplash(false), SPLASH_MS);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      {showSplash ? (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#f8f6f2] gap-4 px-6"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)', paddingTop: 'env(safe-area-inset-top)' }}
          aria-hidden
        >
          <BrandLogo
            alt="Convivia24"
            variant="mark"
            className="h-[56px] w-auto max-w-[min(220px,72vw)] object-contain object-center select-none animate-convivia-logo-bounce"
          />
          <p className="text-center text-[11px] sm:text-xs font-medium text-neutral-600 tracking-[0.04em] max-w-[min(320px,92vw)] leading-snug px-1">
            Hospitality jobs — hotels, bars &amp; events · verified shifts · same-day pay
          </p>
        </div>
      ) : null}
      {children}
    </>
  );
}
