'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, LogIn, Sparkles } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

const LINKS: { label: string; href: string }[] = [
  { label: 'How it works', href: '/about' },
  { label: 'Templates',    href: '/templates' },
  { label: 'Pricing',      href: '/pricing' },
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

  // Full-screen pages — no marketing header
  if (pathname === '/' || pathname.startsWith('/e/') || pathname.startsWith('/rsvp/') || pathname.startsWith('/join/')) return null;

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[var(--cv-ivory)]/95 backdrop-blur-md shadow-[0_1px_0_0_var(--cv-hairline)]'
          : 'bg-[var(--cv-ivory)]/88 backdrop-blur-sm border-b border-[var(--cv-hairline)]'
      }`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">

          <Link
            href="/"
            className="flex items-center gap-3 shrink-0 group min-h-11 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cv-accent)] rounded"
            aria-label="Convivia24"
          >
            <BrandLogo className="h-8 w-auto object-contain" alt="Convivia24" />
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-1">
            {LINKS.map(({ label, href }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-4 py-2 text-[12.5px] font-medium tracking-wide transition-colors duration-150 ${
                    active ? 'text-[var(--cv-ink)]' : 'text-[var(--cv-muted)] hover:text-[var(--cv-ink)]'
                  }`}
                >
                  {label}
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-[var(--cv-ivory-2)] border border-[var(--cv-hairline)] -z-10 rounded"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                </Link>
              );
            })}

            <Link
              href="/auth/sign-in"
              className="ml-4 px-5 py-2 rounded-full border border-[var(--cv-hairline-strong)] text-[var(--cv-ink)] text-[10px] font-black uppercase tracking-[0.16em] transition-all hover:bg-[var(--cv-ink)] hover:text-[var(--cv-ivory)] flex items-center gap-2"
            >
              <LogIn size={13} /> Sign in
            </Link>

            <Link
              href="/"
              className="ml-2 px-5 py-2 bg-[var(--cv-ink)] text-[var(--cv-ivory)] rounded-full text-[10px] font-black uppercase tracking-[0.16em] transition-all hover:opacity-90 flex items-center gap-2"
            >
              <Sparkles size={13} /> Plan an event
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className="md:hidden p-2 text-[var(--cv-muted)] hover:text-[var(--cv-ink)] transition-colors"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
          </button>
        </div>
      </header>

      <div className="h-16" />

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 inset-x-0 z-50 bg-[var(--cv-ivory)] border-b border-[var(--cv-hairline)] shadow-lg md:hidden"
            >
              <nav className="px-5 py-3 divide-y divide-[var(--cv-hairline)]">
                {LINKS.map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center justify-between py-3.5 text-[14px] font-medium text-[var(--cv-muted)] hover:text-[var(--cv-ink)] transition-colors"
                  >
                    {label}
                    <span className="text-[var(--cv-muted-2)] text-lg leading-none">&rsaquo;</span>
                  </Link>
                ))}
                <div className="pt-4 pb-2 space-y-3">
                  <Link href="/" className="block w-full text-center py-3.5 bg-[var(--cv-ink)] text-[var(--cv-ivory)] rounded-full text-[11px] font-black uppercase tracking-[0.16em]">
                    Plan an event
                  </Link>
                  <Link href="/auth/sign-in" className="block w-full text-center py-3.5 border border-[var(--cv-hairline-strong)] text-[var(--cv-ink)] rounded-full text-[11px] font-black uppercase tracking-[0.16em]">
                    Sign in
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
