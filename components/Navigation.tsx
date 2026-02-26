'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const LINKS = [
  { label: 'The Spaces',    href: '/spaces' },
  { label: 'The Convivium',  href: '/convivium' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-obsidian/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(201,168,76,0.1)]'
          : 'bg-obsidian/80 backdrop-blur-sm border-b border-gold/5'
      }`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
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

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-1">
            {LINKS.map(({ label, href }) => {
              const active = pathname === href;
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
              href="/inquire"
              className="ml-2 px-5 py-2 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.15em] transition-colors duration-150"
            >
              Inquire
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className="md:hidden p-2 text-cream/70 hover:text-cream transition-colors"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
          </button>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-16" />

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={() => setOpen(false)}
            />

            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 inset-x-0 z-50 bg-obsidian border-b border-gold/20 shadow-lg md:hidden"
            >
              <div className="border-b border-gold/10 px-5 py-2.5 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gold animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-cream/40">
                  Lagos · Abuja · London
                </span>
              </div>

              <nav className="px-5 py-3 divide-y divide-gold/10">
                {LINKS.map(({ label, href }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center justify-between py-3.5 text-[15px] font-medium transition-colors ${
                        active ? 'text-gold' : 'text-cream/70 hover:text-cream'
                      }`}
                    >
                      {label}
                      <span className="text-gold/30 text-lg leading-none">&rsaquo;</span>
                    </Link>
                  );
                })}

                <div className="pt-4 pb-2">
                  <Link
                    href="/inquire"
                    className="block w-full text-center py-3.5 bg-gold hover:bg-gold-light text-obsidian text-[12px] font-black uppercase tracking-[0.15em] transition-colors"
                  >
                    Inquire
                  </Link>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
