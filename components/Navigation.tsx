'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LINKS = [
  { label: 'Places',  href: '/places' },
  { label: 'Meetups', href: '/meetups' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hash, setHash] = useState('');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [pathname]);

  // Active when the link's path matches; for hash links, the hash must match too.
  const isActive = (href: string) => {
    const [path, frag] = href.split('#');
    // Section links stay lit on their detail pages (/places → /places/the-terrace).
    if (pathname !== path && !pathname.startsWith(`${path}/`)) return false;
    return frag ? hash === `#${frag}` : true;
  };

  return (
    <>
      <header className={`hidden md:block fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-obsidian/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(201,168,76,0.1)]'
          : 'bg-obsidian/80 backdrop-blur-sm border-b border-gold/5'
      }`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">

          <Link href="/" className="flex items-center gap-3 shrink-0 group" aria-label="Convivia24">
            <img
              src="/convivia24.png"
              alt="Convivia24"
              className="h-7 w-auto"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-gold animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-cream/40">Lagos · Abuja · London</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {LINKS.map(({ label, href }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-4 py-2 text-[13px] font-medium tracking-wide transition-colors duration-150 ${
                    active ? 'text-cream' : 'text-cream/50 hover:text-cream'
                  }`}
                >
                  {label}
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-gold/10 border border-gold/20 -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                </Link>
              );
            })}

            <Link
              href="/meetups/new"
              className="ml-2 px-5 py-2 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.15em] transition-colors duration-150"
            >
              Start a meetup
            </Link>
          </nav>

        </div>
      </header>

      <div className="hidden md:block h-16" />

    </>
  );
}
