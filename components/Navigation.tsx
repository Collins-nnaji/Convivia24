'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Gift, Heart, LogOut, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { useUser } from '@/components/auth/AuthProvider';
import AnnouncementBar from '@/components/nav/AnnouncementBar';
import CategoryNav from '@/components/nav/CategoryNav';
import SearchBox from '@/components/nav/SearchBox';
import { CATEGORIES, CATEGORY_LABELS, formatNgn } from '@/lib/drinks/catalog';
import { isNavActive, primaryNavLinks } from '@/lib/nav';

const LINKS = primaryNavLinks();
/** The category row covers Shop, so the utility row carries the rest of the app. */
const UTILITY_LINKS = LINKS.filter((l) => l.href !== '/shop');

const NAV_ICONS = { gift: Gift } as const;

/**
 * Storefront header:
 *   announcement bar (scrolls away) → sticky main row (logo · search · account · basket)
 *   → department row with mega menus (scrolls away).
 * Only the main row is sticky and it keeps the 4.5rem height every `sticky top-24` aside and the
 * admin shell were built around. Staff areas get the main row only.
 */
export default function Navigation() {
  const pathname = usePathname() || '/';
  const { count, subtotalNgn } = useCart();
  const { user, loading, signOut } = useUser();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const staff = pathname.startsWith('/admin') || pathname.startsWith('/supplier');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // On mobile #app-scroll scrolls (see PublicShell); on desktop the window does.
    const appScroll = document.getElementById('app-scroll');
    const handler = () => setScrolled(window.scrollY > 8 || (appScroll?.scrollTop ?? 0) > 8);
    window.addEventListener('scroll', handler, { passive: true });
    appScroll?.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => {
      window.removeEventListener('scroll', handler);
      appScroll?.removeEventListener('scroll', handler);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
    setAccountOpen(false);
    setMobileSearch(false);
  }, [pathname]);

  const isActive = (href: string) => isNavActive(pathname, href);
  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Account';
  const authReady = mounted && !loading;
  const signedIn = authReady && Boolean(user);
  const signInHref = `/signin?next=${encodeURIComponent(pathname)}`;

  return (
    <>
      {!staff && <AnnouncementBar />}

      <header
        className={`sticky top-0 z-50 shrink-0 bg-white transition-shadow duration-300 ${
          scrolled ? 'shadow-[0_1px_0_0_rgba(10,10,10,0.08),0_8px_24px_-16px_rgba(10,10,10,0.25)]' : 'border-b border-obsidian/[0.06]'
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-2 px-3 sm:px-4 md:h-[4.5rem] lg:gap-6 lg:px-5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="-ml-1 grid h-10 w-10 place-items-center text-obsidian lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <Link href="/" className="flex shrink-0 items-center" aria-label="Convivia24 home">
            <Image src="/convivia24.png" alt="Convivia24" width={299} height={55} priority className="h-7 w-auto rounded-sm sm:h-9 lg:h-10" />
          </Link>

          {!staff && <SearchBox className="mx-auto hidden w-full max-w-xl flex-1 md:block" />}

          <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Main">
            {UTILITY_LINKS.map(({ label, href, icon }) => {
              const Icon = icon ? NAV_ICONS[icon] : null;
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-medium transition-colors ${
                    active ? 'bg-obsidian/[0.06] text-obsidian' : 'text-obsidian/65 hover:text-obsidian'
                  }`}
                >
                  {Icon && <Icon size={15} strokeWidth={2.2} className="text-ember" />}
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-0.5 lg:ml-0">
            {!staff && (
              <button
                type="button"
                onClick={() => setMobileSearch((v) => !v)}
                className="grid h-10 w-10 place-items-center text-obsidian md:hidden"
                aria-label={mobileSearch ? 'Close search' : 'Search'}
                aria-expanded={mobileSearch}
              >
                {mobileSearch ? <X size={21} /> : <Search size={21} />}
              </button>
            )}

            <Link href="/my-account?section=saved" className="hidden h-10 w-10 place-items-center text-obsidian/70 hover:text-obsidian sm:grid" aria-label="Saved bottles">
              <Heart size={20} />
            </Link>

            {!authReady ? (
              <span className="hidden h-10 w-10 sm:inline-block" aria-hidden />
            ) : signedIn && user ? (
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setAccountOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 text-obsidian transition-colors hover:bg-obsidian/[0.04]"
                  aria-expanded={accountOpen}
                  aria-label="Your account"
                >
                  {user.image ? (
                    <Image src={user.image} alt="" width={28} height={28} className="h-7 w-7 rounded-full object-cover ring-1 ring-obsidian/10" />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ember/10 text-xs font-semibold text-ember ring-1 ring-ember/15">
                      {firstName.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="hidden max-w-[6rem] truncate text-[13px] font-semibold xl:inline">{firstName}</span>
                  <ChevronDown size={14} className={`text-obsidian/40 transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {accountOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-obsidian/10 bg-white py-2 shadow-lg"
                    >
                      <p className="mb-1 truncate border-b border-obsidian/6 px-4 py-2 text-[11px] text-obsidian/45">{user.email}</p>
                      {[
                        ['My profile', '/my-account'],
                        ['Order history', '/orders'],
                        ['My night plans', '/party-planner'],
                        ['Refer & earn', '/shop/refer-and-earn'],
                      ].map(([label, href]) => (
                        <Link key={href} href={href} onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm font-medium hover:bg-shell">
                          {label}
                        </Link>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setAccountOpen(false);
                          signOut();
                        }}
                        className="inline-flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-ember hover:bg-shell"
                      >
                        <LogOut size={14} /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href={signInHref} className="hidden h-10 w-10 place-items-center text-obsidian/70 hover:text-obsidian sm:grid" aria-label="Sign in">
                <UserRound size={20} />
              </Link>
            )}

            <CartButton count={count} subtotalNgn={subtotalNgn} active={isActive('/cart')} showCounts={mounted} />
          </div>
        </div>

        {mobileSearch && !staff && (
          <div className="px-3 pb-3 md:hidden">
            <SearchBox autoFocus onNavigate={() => setMobileSearch(false)} />
          </div>
        )}
      </header>

      {!staff && (
        <Suspense fallback={<div className="hidden h-11 border-b border-obsidian/10 md:block" />}>
          <CategoryNav />
        </Suspense>
      )}

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/45 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              className="fixed inset-y-0 left-0 z-[70] flex w-[86vw] max-w-sm flex-col bg-white shadow-2xl lg:hidden"
              aria-label="Menu"
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-obsidian/8 px-4">
                <Image src="/convivia24.png" alt="Convivia24" width={299} height={55} className="h-7 w-auto" />
                <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center" aria-label="Close menu">
                  <X size={22} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
                {signedIn && user ? (
                  <div className="flex items-center gap-3 border-b border-obsidian/8 px-5 py-4">
                    <span className="badge-brand flex h-10 w-10 items-center justify-center rounded-full text-sm font-black">
                      {firstName.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">Hi, {firstName}</p>
                      <p className="truncate text-xs text-obsidian/45">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="border-b border-obsidian/8 px-5 py-4">
                    <Link href={signInHref} className="block w-full rounded-full bg-obsidian py-3 text-center text-sm font-bold text-white">
                      Sign in or create account
                    </Link>
                  </div>
                )}

                <p className="px-5 pb-1 pt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-obsidian/40">Shop</p>
                <ul>
                  <DrawerLink href="/shop" label="All drinks" />
                  <DrawerLink href="/shop?offer=new" label="New in" />
                  <DrawerLink href="/shop?offer=on-offer" label="Deals" accent />
                  {CATEGORIES.filter((c) => c !== 'party-packs').map((c) => (
                    <DrawerLink key={c} href={`/shop?type=${c}`} label={CATEGORY_LABELS[c]} />
                  ))}
                  <DrawerLink href="/shop?section=packages" label="Party packs" />
                </ul>

                <p className="px-5 pb-1 pt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-obsidian/40">Explore</p>
                <ul>
                  {UTILITY_LINKS.map((l) => (
                    <DrawerLink key={l.href} href={l.href} label={l.label} />
                  ))}
                </ul>

                {signedIn && (
                  <>
                    <p className="px-5 pb-1 pt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-obsidian/40">Account</p>
                    <ul>
                      <DrawerLink href="/my-account" label="My profile" />
                      <DrawerLink href="/orders" label="Order history" />
                      <DrawerLink href="/my-account?section=saved" label="Saved bottles" />
                    </ul>
                    <button
                      type="button"
                      onClick={() => signOut()}
                      className="mx-5 mb-6 mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ember"
                    >
                      <LogOut size={15} /> Sign out
                    </button>
                  </>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function DrawerLink({ href, label, accent }: { href: string; label: string; accent?: boolean }) {
  return (
    <li>
      <Link
        href={href}
        className={`flex items-center justify-between px-5 py-3 text-[15px] font-medium hover:bg-shell ${accent ? 'text-ember' : 'text-obsidian'}`}
      >
        {label}
        <ChevronRight size={16} className="text-obsidian/25" />
      </Link>
    </li>
  );
}

function CartButton({
  count,
  subtotalNgn,
  active,
  showCounts = true,
}: {
  count: number;
  subtotalNgn: number;
  active: boolean;
  showCounts?: boolean;
}) {
  const filled = showCounts && count > 0;
  return (
    <Link
      href="/cart"
      aria-label={filled ? `Basket, ${count} items, ${formatNgn(subtotalNgn)}` : 'Basket'}
      className={`relative inline-flex h-10 items-center gap-1.5 rounded-full px-2 transition-colors ${
        active ? 'bg-obsidian/[0.06] text-obsidian' : 'text-obsidian hover:bg-obsidian/[0.04]'
      }`}
    >
      <span className="relative">
        <ShoppingBag size={21} strokeWidth={2} />
        {filled && (
          <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ember px-1 text-[10px] font-bold leading-none text-white">
            {count}
          </span>
        )}
      </span>
      {filled && <span className="hidden pl-1 text-[13px] font-semibold tabular-nums text-obsidian xl:inline">{formatNgn(subtotalNgn)}</span>}
    </Link>
  );
}
