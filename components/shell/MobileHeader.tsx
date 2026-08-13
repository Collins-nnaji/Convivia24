'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import type { Chrome } from '@/components/shell/routes';

/**
 * The phone header. Solid variants sit in the flow; overlay variants float over
 * a hero and only take on a background once you have scrolled past it.
 */
export default function MobileHeader({ chrome }: { chrome: Chrome }) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const overlay = chrome.mobileHeader === 'overlay';

  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 120);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [overlay]);

  const solidNow = !overlay || scrolled;

  return (
    <header
      className={`md:hidden z-40 h-14 pt-[env(safe-area-inset-top)] box-content transition-colors duration-300 ${
        overlay ? 'fixed inset-x-0 top-0' : 'sticky top-0'
      } ${
        solidNow
          ? 'bg-obsidian/95 backdrop-blur-md border-b border-gold/15'
          : 'bg-gradient-to-b from-obsidian/70 to-transparent'
      }`}
    >
      <div className="h-14 px-2 flex items-center gap-1">
        {chrome.back ? (
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? router.back() : router.push(chrome.back!))}
            aria-label="Back"
            className="p-2.5 -ml-0.5 text-cream/80 active:scale-90 active:text-gold transition-all"
          >
            <ChevronLeft size={24} strokeWidth={2.2} />
          </button>
        ) : (
          <Link href="/" className="pl-3 pr-2 py-2 shrink-0" aria-label="Convivia24">
            <img
              src="/convivia24.png"
              alt="Convivia24"
              width={112}
              height={28}
              className="h-6 w-auto"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </Link>
        )}

        {chrome.back && (
          <span
            className={`font-display text-lg italic text-cream truncate transition-opacity duration-300 ${
              solidNow ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {chrome.title}
          </span>
        )}

        <span className="flex-1" />

        {chrome.tabBar && (
          <Link
            href="/meetups/new"
            className="mr-2 px-3.5 py-2 bg-gold active:bg-gold-light text-obsidian text-[10px] font-black uppercase tracking-[0.12em] active:scale-95 transition-transform"
          >
            New
          </Link>
        )}
      </div>
    </header>
  );
}
