'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, LogIn } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

const LINKS: { label: string; href: string }[] = [];

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

  // Full-screen app shells — no duplicate marketing header
  if (pathname === '/' || pathname === '/outlet') return null;

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#f8f6f2]/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(201,168,76,0.12)]'
          : 'bg-[#f8f6f2]/88 backdrop-blur-sm border-b border-gold/15'
      }`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group min-h-11 min-w-11 p-2 -m-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600" aria-label="Convivia24 — Now">
            <BrandLogo className="h-7 w-auto object-contain" alt="Convivia24" />
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
                    active ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {label}
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-red-50 border border-red-200/60 -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                </Link>
              );
            })}

            <Link
              href="/inquire"
              className="ml-2 px-5 py-2 bg-red-700 hover:bg-red-800 text-white text-[11px] font-black uppercase tracking-[0.15em] transition-colors duration-150"
            >
              Inquire
            </Link>

            {/* Sign In / Dashboard */}
            <Link
              href="/auth/sign-in"
              className="ml-3 px-4 py-2 border border-neutral-300 hover:border-red-400 text-neutral-600 hover:text-red-800 text-[11px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2"
            >
              <LogIn size={14} /> Sign In
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
              className="fixed top-16 inset-x-0 z-50 bg-[#f8f6f2] border-b border-gold/20 shadow-lg md:hidden"
            >
              <nav className="px-5 py-3 divide-y divide-neutral-100">
                {LINKS.map(({ label, href }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center justify-between py-3.5 text-[15px] font-medium transition-colors ${
                        active ? 'text-red-700' : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {label}
                      <span className="text-neutral-300 text-lg leading-none">&rsaquo;</span>
                    </Link>
                  );
                })}

                <div className="pt-4 pb-2 space-y-3">
                  <Link
                    href="/inquire"
                    className="block w-full text-center py-3.5 bg-red-700 hover:bg-red-800 text-white text-[12px] font-black uppercase tracking-[0.15em] transition-colors"
                  >
                    Inquire
                  </Link>
                  <Link
                    href="/auth/sign-in"
                    className="block w-full text-center py-3.5 border border-neutral-200 text-neutral-600 text-[12px] font-black uppercase tracking-[0.15em] transition-colors hover:border-red-300 hover:text-red-800"
                  >
                    Sign In →
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
