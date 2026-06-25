'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Sparkles, User, LogOut, Ticket, LayoutDashboard, Compass } from 'lucide-react';
import { useUser } from '@/components/auth/AuthProvider';

const LINKS = [
  { label: 'Discover', href: '/events', icon: Compass },
  { label: 'Concierge', href: '/concierge', icon: Sparkles },
  { label: 'Tickets', href: '/tickets', icon: Ticket },
  { label: 'Host', href: '/create', icon: Sparkles },
];

function initials(name: string | null, email: string) {
  const base = (name || email || '').trim();
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

export default function Navigation() {
  const pathname = usePathname();
  const { user, loading, signOut } = useUser();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setOpen(false); setMenu(false); }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 pt-safe transition-all duration-300 ${
          scrolled
            ? 'bg-surface/92 backdrop-blur-xl shadow-soft border-b border-ink/5'
            : 'bg-surface/75 backdrop-blur-md'
        }`}
      >
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="flex items-center shrink-0 min-w-0 group touch-target" aria-label="Convivia24 home">
            <img
              src="/convivia24.png"
              alt=""
              className="h-7 sm:h-8 w-auto max-w-[9.5rem] object-contain object-left transition-opacity group-hover:opacity-80"
              style={{ filter: 'brightness(0)' }}
            />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {LINKS.map(({ label, href }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    active ? 'text-ink' : 'text-ink-muted hover:text-ink hover:bg-ink/5'
                  }`}
                >
                  {label}
                  {active && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-xl bg-copper/10 -z-10"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {!loading && !user && (
              <Link href={`/signin?next=${encodeURIComponent(pathname)}`} className="btn-ghost text-sm">
                Sign in
              </Link>
            )}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenu((m) => !m)}
                  className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-ink/5 transition-colors"
                >
                  {user.image ? (
                    <img src={user.image} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-copper/20" />
                  ) : (
                    <span className="h-9 w-9 rounded-full bg-copper text-white text-xs font-bold flex items-center justify-center">
                      {initials(user.name, user.email)}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {menu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-60 rounded-2xl border border-ink/8 bg-surface-elevated shadow-lift py-2 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-ink/8">
                        <p className="text-sm font-semibold text-ink truncate">{user.name || 'Your account'}</p>
                        <p className="text-xs text-ink-muted truncate">{user.email}</p>
                      </div>
                      <Link href="/tickets" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-muted hover:bg-surface hover:text-ink"><Ticket size={16} className="text-copper" /> My tickets</Link>
                      <Link href="/create" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-muted hover:bg-surface hover:text-ink"><Sparkles size={16} className="text-copper" /> Host an event</Link>
                      {user.isAdmin && (
                        <Link href="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-muted hover:bg-surface hover:text-ink"><LayoutDashboard size={16} className="text-copper" /> Organizer console</Link>
                      )}
                      <button type="button" onClick={() => signOut()} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-muted hover:bg-surface hover:text-ink border-t border-ink/8 mt-1">
                        <LogOut size={16} className="text-copper" /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/events" className="btn-primary text-xs !px-4 !py-2.5">
                Find events
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden touch-target flex items-center justify-center rounded-xl text-ink-muted hover:bg-ink/5 active:bg-ink/10"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <div className="h-14 sm:h-16 pt-safe" aria-hidden />

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="fixed top-below-nav inset-x-3 z-50 max-h-[min(32rem,calc(100dvh-5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom)))] overflow-y-auto overscroll-contain rounded-2xl border border-ink/10 bg-surface-elevated shadow-lift md:hidden"
            >
              {user && (
                <div className="border-b border-ink/8 px-5 py-4 flex items-center gap-3">
                  {user.image ? (
                    <img src={user.image} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <span className="h-10 w-10 rounded-full bg-copper text-white text-sm font-bold flex items-center justify-center">{initials(user.name, user.email)}</span>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{user.name || 'Your account'}</p>
                    <p className="text-xs text-ink-muted truncate">{user.email}</p>
                  </div>
                </div>
              )}
              <nav className="p-3">
                {LINKS.map(({ label, href, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-medium transition-colors ${
                        active ? 'bg-copper/10 text-copper-deep' : 'text-ink-muted hover:bg-surface hover:text-ink'
                      }`}
                    >
                      <Icon size={18} />
                      {label}
                    </Link>
                  );
                })}
                {user?.isAdmin && (
                  <Link href="/admin" className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-medium text-ink-muted hover:bg-surface hover:text-ink">
                    <LayoutDashboard size={18} /> Organizer console
                  </Link>
                )}
                <div className="pt-3 mt-2 border-t border-ink/8">
                  {user ? (
                    <button type="button" onClick={() => signOut()} className="btn-secondary w-full">
                      <LogOut size={16} /> Sign out
                    </button>
                  ) : (
                    <Link href={`/signin?next=${encodeURIComponent(pathname)}`} className="btn-primary w-full">
                      <User size={16} /> Sign in
                    </Link>
                  )}
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
