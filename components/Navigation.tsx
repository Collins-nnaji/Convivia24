'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';

const LINKS = [
  { label: 'Discover',     href: '/events' },
  { label: 'AI Concierge', href: '/concierge' },
  { label: 'My Tickets',   href: '/tickets' },
  { label: 'Sell Tickets', href: '/create' },
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
          ? 'bg-paper/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(201,168,76,0.25)]'
          : 'bg-paper/80 backdrop-blur-sm border-b border-obsidian/5'
      }`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">

          <Link href="/" className="flex items-center gap-3 shrink-0 group" aria-label="Convivia24">
            <img
              src="/convivia24.png"
              alt="Convivia24"
              className="h-7 w-auto"
              style={{ filter: 'brightness(0)' }}
            />
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-gold animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-obsidian/40">Events · Tickets · AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {LINKS.map(({ label, href }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-4 py-2 text-[13px] font-medium tracking-wide transition-colors duration-150 ${
                    active ? 'text-obsidian' : 'text-obsidian/50 hover:text-obsidian'
                  }`}
                >
                  {label}
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-gold/15 border border-gold/30 -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                </Link>
              );
            })}

            <Link
              href="/events"
              className="ml-2 inline-flex items-center gap-1.5 px-5 py-2 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.15em] transition-colors duration-150"
            >
              <Sparkles size={13} /> Find Events
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className="md:hidden p-2 text-obsidian/70 hover:text-obsidian transition-colors"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
          </button>
        </div>
      </header>

      <div className="h-16" />

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-obsidian/30 md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 inset-x-0 z-50 bg-paper border-b border-gold/30 shadow-lg md:hidden"
            >
              <div className="border-b border-obsidian/10 px-5 py-2.5 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gold animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-obsidian/40">
                  Events · Tickets · AI · Lagos · Abuja · London
                </span>
              </div>
              <nav className="px-5 py-3 divide-y divide-obsidian/10">
                {LINKS.map(({ label, href }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center justify-between py-3.5 text-[15px] font-medium transition-colors ${
                        active ? 'text-gold-dark' : 'text-obsidian/70 hover:text-obsidian'
                      }`}
                    >
                      {label}
                      <span className="text-gold/50 text-lg leading-none">&rsaquo;</span>
                    </Link>
                  );
                })}
                <div className="pt-4 pb-2">
                  <Link
                    href="/events"
                    className="block w-full text-center py-3.5 bg-gold hover:bg-gold-light text-obsidian text-[12px] font-black uppercase tracking-[0.15em] transition-colors"
                  >
                    Find Events
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
