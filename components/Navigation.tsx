'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LogOut, Menu, ShoppingBag, UserRound, X } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { useUser } from '@/components/auth/AuthProvider';
import { formatNgn } from '@/lib/drinks/catalog';

const LINKS = [
  { label: 'Shop', href: '/shop' },
  { label: 'Events', href: '/events' },
  { label: 'Plan', href: '/plan' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { count, subtotalNgn } = useCart();
  const { user, loading, signOut } = useUser();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/shop') return pathname === '/shop' || pathname.startsWith('/shop/');
    if (href === '/events') return pathname === '/events' || pathname.startsWith('/events/');
    if (href === '/plan') return pathname === '/plan' || pathname.startsWith('/plan/') || pathname.startsWith('/rsvp/');
    if (href === '/partners') return pathname === '/partners' || pathname.startsWith('/partners/');
    if (href === '/cart') return pathname === '/cart' || pathname.startsWith('/checkout');
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Account';

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(10,10,10,0.08)]'
            : 'bg-white border-b border-obsidian/6'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="shrink-0 flex items-center" aria-label="Convivia24">
            <img src="/convivia24.png" alt="Convivia24" className="h-8 sm:h-10 w-auto rounded-sm" />
          </Link>

          <nav className="hidden md:flex items-center gap-0.5 ml-auto">
            {LINKS.map(({ label, href }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-3.5 py-2 text-[13px] font-medium tracking-wide transition-colors ${
                    active ? 'text-obsidian' : 'text-obsidian/45 hover:text-obsidian'
                  }`}
                >
                  {label}
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-x-2 bottom-1 h-0.5 brand-gradient"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                </Link>
              );
            })}

            <CartButton count={count} subtotalNgn={subtotalNgn} active={isActive('/cart')} />

            <Link
              href="/partners"
              className={`ml-2 px-5 py-2 text-[11px] font-black uppercase tracking-[0.12em] ${
                isActive('/partners') ? 'badge-brand' : 'btn-brand'
              }`}
            >
              Partners
            </Link>

            {!loading && user ? (
              <div className="relative ml-2">
                <button
                  type="button"
                  onClick={() => setAccountOpen((v) => !v)}
                  className="inline-flex items-center gap-2 h-10 pl-2 pr-3 border border-ember/30 bg-ember/8 text-obsidian"
                  aria-expanded={accountOpen}
                >
                  {user.image ? (
                    <img src={user.image} alt="" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <span className="w-6 h-6 rounded-full badge-brand flex items-center justify-center text-[10px] font-black">
                      {firstName.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="text-[11px] font-black uppercase tracking-[0.1em] max-w-[7rem] truncate">
                    {firstName}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Signed in" />
                  <ChevronDown size={12} className={`opacity-50 transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {accountOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white border border-obsidian/10 shadow-lg py-2 z-50"
                    >
                      <p className="px-4 py-2 text-[11px] text-obsidian/45 truncate border-b border-obsidian/6 mb-1">
                        {user.email}
                      </p>
                      <Link href="/plan" className="block px-4 py-2.5 text-sm hover:bg-ember/5" onClick={() => setAccountOpen(false)}>
                        My parties
                      </Link>
                      <Link href="/orders" className="block px-4 py-2.5 text-sm hover:bg-ember/5" onClick={() => setAccountOpen(false)}>
                        Order history
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setAccountOpen(false);
                          signOut();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-ember inline-flex items-center gap-2 hover:bg-ember/5"
                      >
                        <LogOut size={14} /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href={`/signin?next=${encodeURIComponent(pathname || '/')}`}
                className="ml-2 inline-flex items-center gap-1.5 h-10 px-4 border border-obsidian/20 text-[11px] font-black uppercase tracking-[0.1em] text-obsidian hover:border-ember hover:text-ember"
              >
                <UserRound size={14} /> Sign in
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2 md:hidden ml-auto">
            <CartButton count={count} subtotalNgn={subtotalNgn} active={isActive('/cart')} showSubtotal={false} />
            {!loading && user ? (
              <span className="w-8 h-8 rounded-full badge-brand flex items-center justify-center text-[10px] font-black shrink-0">
                {firstName.slice(0, 1).toUpperCase()}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="p-2 text-obsidian"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
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
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="fixed top-16 inset-x-0 z-50 bg-white border-b border-obsidian/10 shadow-lg md:hidden max-h-[calc(100dvh-4rem)] overflow-y-auto"
            >
              <nav className="px-5 py-3 divide-y divide-obsidian/8">
                {user && (
                  <div className="py-3.5 flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full badge-brand flex items-center justify-center text-xs font-black">
                      {firstName.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{firstName}</p>
                      <p className="text-[11px] text-obsidian/40 truncate">{user.email}</p>
                    </div>
                    <span className="ml-auto text-[9px] font-black uppercase tracking-wider text-emerald-600">Signed in</span>
                  </div>
                )}
                {LINKS.map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center justify-between py-3.5 text-[15px] font-medium ${
                      isActive(href) ? 'text-ember' : 'text-obsidian/70'
                    }`}
                  >
                    {label}
                    <span className="text-ember/40 text-lg">&rsaquo;</span>
                  </Link>
                ))}
                <Link
                  href="/partners"
                  className={`flex items-center justify-between py-3.5 text-[15px] font-medium ${
                    isActive('/partners') ? 'text-ember' : 'text-obsidian/70'
                  }`}
                >
                  Partners
                  <span className="text-ember/40 text-lg">&rsaquo;</span>
                </Link>
                {user ? (
                  <>
                    <Link href="/orders" className="flex items-center justify-between py-3.5 text-[15px] font-medium text-obsidian/70">
                      Order history
                      <span className="text-ember/40 text-lg">&rsaquo;</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => signOut()}
                      className="flex w-full items-center justify-between py-3.5 text-[15px] font-medium text-ember"
                    >
                      Sign out
                      <LogOut size={16} />
                    </button>
                  </>
                ) : (
                  <div className="pt-4 pb-2">
                    <Link
                      href={`/signin?next=${encodeURIComponent(pathname || '/')}`}
                      className="block w-full text-center py-3.5 btn-brand text-[12px] font-black uppercase tracking-[0.12em]"
                    >
                      Sign in
                    </Link>
                  </div>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function CartButton({
  count,
  subtotalNgn,
  active,
  showSubtotal = true,
}: {
  count: number;
  subtotalNgn: number;
  active: boolean;
  showSubtotal?: boolean;
}) {
  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} items`}
      className={`ml-1 sm:ml-2 inline-flex items-center gap-1.5 sm:gap-2 h-10 px-2 sm:px-3 border transition-colors ${
        active
          ? 'border-ember bg-ember/8 text-obsidian'
          : 'border-obsidian/20 bg-white text-obsidian hover:border-ember'
      }`}
    >
      <ShoppingBag size={16} strokeWidth={2.2} />
      <span className="hidden sm:inline text-[11px] font-black uppercase tracking-[0.12em]">Cart</span>
      <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-obsidian text-white text-[10px] font-black flex items-center justify-center">
        {count}
      </span>
      {showSubtotal && count > 0 && (
        <span className="hidden lg:inline text-[11px] font-semibold text-obsidian/70">
          {formatNgn(subtotalNgn)}
        </span>
      )}
    </Link>
  );
}
