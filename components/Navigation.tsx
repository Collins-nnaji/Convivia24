'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { UserButton } from '@/components/auth';
import { useSession } from '@/lib/auth/use-session';

const LINKS = [
  { label: 'What We Do', href: '/collective' },
  { label: 'Intel',      href: '/intel' },
  { label: 'Contact',    href: '/briefing' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    fetch('/api/me', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setIsAdmin(d?.role === 'admin'))
      .catch(() => setIsAdmin(false));
  }, [user]);

  return (
    <>
      {/* ── Header ── */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-[0_1px_0_0_#e4e4e7] backdrop-blur-sm'
          : 'bg-white border-b border-zinc-100'
      }`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group" aria-label="Convivia24">
            <img
              src="/convivia24.png"
              alt="Convivia24"
              className="h-7 w-auto"
            />
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-700 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400">24/7</span>
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
                  className={`relative px-4 py-2 text-[13px] font-semibold tracking-wide transition-colors duration-150 ${
                    active ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  {label}
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-zinc-100 rounded-sm -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                </Link>
              );
            })}

            {/* Admin link – visible only to admins, no extra auth step */}
            {user && isAdmin && (
              <Link
                href="/admin"
                className="px-4 py-2 text-[13px] font-semibold text-red-600 hover:text-red-700 tracking-wide transition-colors"
              >
                Admin
              </Link>
            )}
            {/* Auth: UserButton when signed in, Sign In link when not (Neon quickstart-style) */}
            {user ? (
              <UserButton />
            ) : (
              <Link
                href="/auth/sign-in"
                className="px-4 py-2 text-[13px] font-semibold text-zinc-400 hover:text-zinc-900 tracking-wide transition-colors duration-150"
              >
                Sign In
              </Link>
            )}

            {/* CTA */}
            <Link
              href="/audit"
              className="ml-2 px-5 py-2 bg-red-700 hover:bg-red-800 text-white text-[12px] font-black uppercase tracking-[0.15em] transition-colors duration-150"
            >
              Free Audit
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className="md:hidden p-2 text-zinc-700 hover:text-zinc-900 transition-colors"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
          </button>
        </div>
      </header>

      {/* Spacer so page content clears the fixed header */}
      <div className="h-16" />

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-black/25 md:hidden"
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 inset-x-0 z-50 bg-white border-b-2 border-red-700 shadow-lg md:hidden"
            >
              {/* Live badge */}
              <div className="bg-red-700 px-5 py-2.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/80">
                  Always On · 24/7 Revenue Management
                </span>
              </div>

              <nav className="px-5 py-3 divide-y divide-zinc-100">
                {LINKS.map(({ label, href }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center justify-between py-3.5 text-[15px] font-semibold transition-colors ${
                        active ? 'text-red-700' : 'text-zinc-800 hover:text-zinc-900'
                      }`}
                    >
                      {label}
                      <span className="text-zinc-300 text-lg leading-none">›</span>
                    </Link>
                  );
                })}

                {user && isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center justify-between py-3.5 text-[15px] font-semibold text-red-600 hover:text-red-700 transition-colors"
                  >
                    Admin
                    <span className="text-zinc-300 text-lg leading-none">›</span>
                  </Link>
                )}
                {user ? (
                  <div className="py-3.5 flex items-center justify-between">
                    <UserButton />
                  </div>
                ) : (
                  <Link
                    href="/auth/sign-in"
                    className="flex items-center justify-between py-3.5 text-[15px] font-semibold text-zinc-800 hover:text-zinc-900 transition-colors"
                  >
                    Sign In
                    <span className="text-zinc-300 text-lg leading-none">›</span>
                  </Link>
                )}

                <div className="pt-4 pb-2">
                  <Link
                    href="/audit"
                    className="block w-full text-center py-3.5 bg-red-700 hover:bg-red-800 text-white text-[13px] font-black uppercase tracking-[0.15em] transition-colors"
                  >
                    Free Sales Audit
                  </Link>
                </div>
              </nav>

              <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50">
                <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-400">Lagos · Abuja · London</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
