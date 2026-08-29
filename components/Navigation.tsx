'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Gift, LogOut, Menu, ShoppingBag, UserRound, X } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { useUser } from '@/components/auth/AuthProvider';
import { formatNgn } from '@/lib/drinks/catalog';
import { isNavActive, primaryNavLinks } from '@/lib/nav';

const LINKS = primaryNavLinks();

const NAV_ICONS = { gift: Gift } as const;

export default function Navigation() {
  const pathname = usePathname();
  const { count, subtotalNgn } = useCart();
  const { user, loading, signOut } = useUser();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // On mobile the page itself doesn't scroll — #app-scroll does (see the
    // (public) layout's app-shell wrapper) — so both need watching. On
    // desktop that element reverts to normal flow and window scroll fires.
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
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/shop') {
      return pathname === '/shop' || pathname.startsWith('/shop/');
    }
    return isNavActive(pathname, href);
  };

  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Account';
  const authReady = mounted && !loading;
  const signedIn = authReady && Boolean(user);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(10,10,10,0.08)]'
            : 'bg-white border-b border-obsidian/6'
        }`}
      >
        <div className="max-w-[1600px] w-full mx-auto px-3 sm:px-4 lg:px-5 h-[4.5rem] flex items-center justify-between gap-3">
          <Link href="/" className="shrink-0 flex items-center" aria-label="Convivia24">
            <Image
              src="/convivia24.png"
              alt="Convivia24"
              width={299}
              height={55}
              priority
              className="h-9 sm:h-11 w-auto rounded-sm"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-auto">
            {LINKS.map(({ label, href, icon, accent, children }) => (
              <DesktopNavLink
                key={href}
                href={href}
                label={label}
                active={isActive(href)}
                icon={icon ? NAV_ICONS[icon] : undefined}
                accent={accent}
                children={children}
              />
            ))}

            <DesktopNavLink href="/contact" label="Contact" active={isActive('/contact')} />

            <CartButton
              count={count}
              subtotalNgn={subtotalNgn}
              active={isActive('/cart')}
              showCounts={mounted}
            />

            {!authReady ? (
              <span
                className="ml-2 inline-block h-10 w-24 rounded-full bg-obsidian/[0.04]"
                aria-hidden
              />
            ) : signedIn && user ? (
              <div className="relative ml-1">
                <button
                  type="button"
                  onClick={() => setAccountOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 text-obsidian transition-colors hover:bg-obsidian/[0.04]"
                  aria-expanded={accountOpen}
                >
                  {user.image ? (
                    <Image src={user.image} alt="" width={28} height={28} className="w-7 h-7 rounded-full object-cover ring-1 ring-obsidian/10" />
                  ) : (
                    <span className="w-7 h-7 rounded-full bg-ember/10 text-ember flex items-center justify-center text-xs font-semibold ring-1 ring-ember/15">
                      {firstName.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="text-base font-semibold max-w-[6rem] truncate">{firstName}</span>
                  <ChevronDown size={14} className={`text-obsidian/40 transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
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
                      <Link href="/account" className="block px-4 py-2.5 text-sm hover:bg-ember/5" onClick={() => setAccountOpen(false)}>
                        My profile
                      </Link>
                      <Link href="/shop?section=plan" className="block px-4 py-2.5 text-sm hover:bg-ember/5" onClick={() => setAccountOpen(false)}>
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
                className="ml-2 inline-flex items-center gap-1.5 px-2 py-1.5 text-base font-semibold text-obsidian/55 transition-colors hover:text-obsidian"
              >
                <UserRound size={16} /> Sign in
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2 md:hidden ml-auto">
            <CartButton
              count={count}
              subtotalNgn={subtotalNgn}
              active={isActive('/cart')}
              showSubtotal={false}
              showCounts={mounted}
            />
            {signedIn && user ? (
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

      <div className="h-[4.5rem]" />

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
              className="fixed top-[4.5rem] inset-x-0 z-50 bg-white border-b border-obsidian/10 shadow-lg md:hidden max-h-[calc(100dvh-4.5rem)] overflow-y-auto"
            >
              <nav className="px-5 py-3 divide-y divide-obsidian/8">
                {signedIn && user && (
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
                {LINKS.map(({ label, href, icon, accent, children }) => {
                  const Icon = icon ? NAV_ICONS[icon] : null;
                  return (
                    <div key={href}>
                      <Link
                        href={href}
                        scroll
                        className={`flex items-center justify-between py-3.5 text-base font-semibold ${
                          isActive(href) || accent ? 'text-ember' : 'text-obsidian/70'
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          {Icon && <Icon size={15} strokeWidth={2.2} />}
                          {label}
                        </span>
                        <span className="text-ember/40 text-lg">&rsaquo;</span>
                      </Link>
                      {/* Tabs of the same page, indented rather than promoted. */}
                      {children && children.length > 1 && (
                        <div className="pl-7 pb-2 -mt-1 space-y-1">
                          {children.slice(1).map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              scroll
                              className="block py-1.5 text-sm text-obsidian/50 hover:text-ember transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                <Link
                  href="/contact"
                  scroll
                  className={`flex items-center justify-between py-3.5 text-base font-semibold ${
                    isActive('/contact') ? 'text-ember' : 'text-obsidian/70'
                  }`}
                >
                  Contact
                  <span className="text-ember/40 text-lg">&rsaquo;</span>
                </Link>
                <Link
                  href="/refer"
                  className={`flex items-center justify-between py-3.5 text-base font-semibold ${
                    isActive('/refer') ? 'text-ember' : 'text-obsidian/70'
                  }`}
                >
                  Refer &amp; earn
                  <span className="text-ember/40 text-lg">&rsaquo;</span>
                </Link>
                {signedIn && user ? (
                  <>
                    <Link href="/account" className="flex items-center justify-between py-3.5 text-base font-semibold text-obsidian/70">
                      My profile
                      <span className="text-ember/40 text-lg">&rsaquo;</span>
                    </Link>
                    <Link href="/orders" className="flex items-center justify-between py-3.5 text-base font-semibold text-obsidian/70">
                      Order history
                      <span className="text-ember/40 text-lg">&rsaquo;</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => signOut()}
                      className="flex w-full items-center justify-between py-3.5 text-base font-semibold text-ember"
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

function DesktopNavLink({
  href,
  label,
  active,
  icon: Icon,
  accent,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  icon?: typeof Gift;
  accent?: boolean;
  /** Renders a hover menu of the link's sub-destinations. */
  children?: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);

  const link = (
    <Link
      href={href}
      scroll
      className={`relative inline-flex items-center gap-2 px-3.5 py-2.5 text-base transition-colors ${
        active
          ? accent
            ? 'font-bold text-ember'
            : 'font-bold text-obsidian'
          : accent
            ? 'font-semibold text-ember/65 hover:text-ember'
            : 'font-semibold text-obsidian/55 hover:text-obsidian'
      }`}
    >
      {Icon && <Icon size={16} strokeWidth={2.2} />}
      {label}
      {active && (
        <motion.span
          layoutId="nav-underline"
          className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-ember"
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        />
      )}
    </Link>
  );

  if (!children || children.length === 0) return link;

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      {link}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-0 top-full w-48 bg-white border border-obsidian/10 shadow-lg py-2 z-50"
          >
            {children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                scroll
                className="block px-4 py-2.5 text-sm text-obsidian/65 hover:bg-ember/5 hover:text-ember transition-colors"
              >
                {child.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CartButton({
  count,
  subtotalNgn,
  active,
  showSubtotal = true,
  showCounts = true,
}: {
  count: number;
  subtotalNgn: number;
  active: boolean;
  showSubtotal?: boolean;
  showCounts?: boolean;
}) {
  return (
    <Link
      href="/cart"
      scroll
      aria-label={`Cart, ${count} items`}
      className={`relative ml-2 inline-flex items-center gap-2 px-2.5 py-2 text-base transition-colors ${
        active ? 'font-bold text-obsidian' : 'font-semibold text-obsidian/55 hover:text-obsidian'
      }`}
    >
      <ShoppingBag size={20} strokeWidth={2.2} />
      <span className="hidden sm:inline">Cart</span>
      {showCounts && count > 0 && (
        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-ember text-white text-[10px] font-bold flex items-center justify-center leading-none">
          {count}
        </span>
      )}
      {showCounts && showSubtotal && count > 0 && (
        <span className="hidden lg:inline text-xs text-obsidian/45 tabular-nums">
          {formatNgn(subtotalNgn)}
        </span>
      )}
    </Link>
  );
}
