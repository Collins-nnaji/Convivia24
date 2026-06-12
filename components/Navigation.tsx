'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Sparkles, User, LogOut, Ticket, LayoutDashboard } from 'lucide-react';
import { useUser } from '@/components/auth/AuthProvider';

const LINKS = [
  { label: 'Discover',     href: '/events' },
  { label: 'AI Concierge', href: '/concierge' },
  { label: 'My Tickets',   href: '/tickets' },
  { label: 'Sell Tickets', href: '/create' },
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
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setOpen(false); setMenu(false); }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-paper/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(201,168,76,0.25)]'
          : 'bg-paper/80 backdrop-blur-sm border-b border-obsidian/5'
      }`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">

          <Link href="/" className="flex items-center gap-3 shrink-0 group" aria-label="Convivia24">
            <img src="/convivia24.png" alt="Convivia24" className="h-7 w-auto" style={{ filter: 'brightness(0)' }} />
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

            {/* Account */}
            {!loading && !user && (
              <Link href={`/signin?next=${encodeURIComponent(pathname)}`} className="ml-2 px-4 py-2 text-[13px] font-medium text-obsidian/60 hover:text-obsidian transition-colors">
                Sign in
              </Link>
            )}
            {user ? (
              <div className="relative ml-2" ref={menuRef}>
                <button onClick={() => setMenu((m) => !m)} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-obsidian/5 transition-colors">
                  {user.image ? (
                    <img src={user.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-gold text-obsidian text-[11px] font-black flex items-center justify-center">{initials(user.name, user.email)}</span>
                  )}
                </button>
                <AnimatePresence>
                  {menu && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white border border-obsidian/10 shadow-xl py-1.5"
                    >
                      <div className="px-4 py-2 border-b border-obsidian/8">
                        <p className="text-sm font-medium text-obsidian truncate">{user.name || 'Your account'}</p>
                        <p className="text-xs text-obsidian/45 truncate">{user.email}</p>
                      </div>
                      <Link href="/tickets" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-obsidian/70 hover:text-obsidian hover:bg-paper transition-colors"><Ticket size={14} className="text-gold-dark" /> My Tickets</Link>
                      <Link href="/create" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-obsidian/70 hover:text-obsidian hover:bg-paper transition-colors"><Sparkles size={14} className="text-gold-dark" /> Sell Tickets</Link>
                      {user.isAdmin && (
                        <Link href="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-obsidian/70 hover:text-obsidian hover:bg-paper transition-colors"><LayoutDashboard size={14} className="text-gold-dark" /> Organizer Console</Link>
                      )}
                      <button onClick={() => signOut()} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-obsidian/70 hover:text-obsidian hover:bg-paper transition-colors border-t border-obsidian/8 mt-1"><LogOut size={14} className="text-gold-dark" /> Sign out</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/events"
                className="ml-1 inline-flex items-center gap-1.5 px-5 py-2 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.15em] transition-colors duration-150"
              >
                <Sparkles size={13} /> Find Events
              </Link>
            )}
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
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-obsidian/30 md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
              className="fixed top-16 inset-x-0 z-50 bg-paper border-b border-gold/30 shadow-lg md:hidden"
            >
              {user && (
                <div className="border-b border-obsidian/10 px-5 py-3 flex items-center gap-3">
                  {user.image ? (
                    <img src={user.image} alt="" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <span className="w-9 h-9 rounded-full bg-gold text-obsidian text-xs font-black flex items-center justify-center">{initials(user.name, user.email)}</span>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-obsidian truncate">{user.name || 'Your account'}</p>
                    <p className="text-xs text-obsidian/45 truncate">{user.email}</p>
                  </div>
                </div>
              )}
              <nav className="px-5 py-3 divide-y divide-obsidian/10">
                {LINKS.map(({ label, href }) => {
                  const active = pathname === href;
                  return (
                    <Link key={href} href={href} className={`flex items-center justify-between py-3.5 text-[15px] font-medium transition-colors ${active ? 'text-gold-dark' : 'text-obsidian/70 hover:text-obsidian'}`}>
                      {label}
                      <span className="text-gold/50 text-lg leading-none">&rsaquo;</span>
                    </Link>
                  );
                })}
                {user?.isAdmin && (
                  <Link href="/admin" className="flex items-center justify-between py-3.5 text-[15px] font-medium text-obsidian/70 hover:text-obsidian">Organizer Console <span className="text-gold/50 text-lg leading-none">&rsaquo;</span></Link>
                )}
                <div className="pt-4 pb-2">
                  {user ? (
                    <button onClick={() => signOut()} className="w-full flex items-center justify-center gap-2 py-3.5 border border-obsidian/20 text-obsidian text-[12px] font-black uppercase tracking-[0.15em] hover:border-gold transition-colors">
                      <LogOut size={14} /> Sign out
                    </button>
                  ) : (
                    <Link href={`/signin?next=${encodeURIComponent(pathname)}`} className="flex items-center justify-center gap-2 w-full text-center py-3.5 bg-gold hover:bg-gold-light text-obsidian text-[12px] font-black uppercase tracking-[0.15em] transition-colors">
                      <User size={14} /> Sign in
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
