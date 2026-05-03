'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, LogIn } from 'lucide-react';

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

  // Don't show top Nav on the dashboard (root /)
  if (pathname === '/') return null;

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(0,0,0,0.07)]'
          : 'bg-white/85 backdrop-blur-sm border-b border-black/[0.06]'
      }`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group" aria-label="Convivia24">
            <img
              src="/convivia24.png"
              alt="Convivia24"
              className="h-7 w-auto"
              style={{ filter: 'brightness(0)' }}
            />
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-gold animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-ink/30">Lagos · Abuja · London</span>
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
                    active ? 'text-ink' : 'text-ink/45 hover:text-ink'
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
              className="ml-2 px-5 py-2 bg-gold hover:bg-gold-dark text-white text-[11px] font-black uppercase tracking-[0.15em] transition-colors duration-150 rounded-full shadow-sm"
            >
              Inquire
            </Link>

            {/* Sign In / Dashboard */}
            <Link
              href="/auth/sign-in"
              className="ml-3 px-4 py-2 border border-black/[0.1] hover:border-gold/40 text-ink/60 hover:text-gold-dark text-[11px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 rounded-full"
            >
              <LogIn size={14} /> Sign In
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className="md:hidden p-2 text-ink/50 hover:text-ink transition-colors"
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
              className="fixed inset-0 z-40 bg-black/30 md:hidden"
              onClick={() => setOpen(false)}
            />

            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 inset-x-0 z-50 bg-white border-b border-black/[0.07] shadow-lg md:hidden"
            >
              <div className="border-b border-gold/10 px-5 py-2.5 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gold animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-ink/30">
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
                        active ? 'text-gold-dark' : 'text-ink/60 hover:text-ink'
                      }`}
                    >
                      {label}
                      <span className="text-gold/30 text-lg leading-none">&rsaquo;</span>
                    </Link>
                  );
                })}

                <div className="pt-4 space-y-3 pb-2">
                  <Link
                    href="/inquire"
                    className="block w-full text-center py-3.5 bg-gold hover:bg-gold-dark text-white text-[12px] font-black uppercase tracking-[0.15em] transition-colors rounded-full"
                  >
                    Inquire
                  </Link>
                  <Link
                    href="/auth/sign-in"
                    className="block w-full text-center py-3.5 border border-black/[0.1] text-ink/60 text-[12px] font-black uppercase tracking-[0.15em] transition-colors hover:border-gold/40 hover:text-gold-dark rounded-full"
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
