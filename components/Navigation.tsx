'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';

const LINKS = [
  { label: 'Shop', href: '/shop' },
  { label: 'Circles', href: '/circles' },
  { label: 'Crews', href: '/crews' },
  { label: 'For venues', href: '/venues' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/shop') return pathname === '/shop' || pathname.startsWith('/shop/');
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(10,10,10,0.08)]'
            : 'bg-white border-b border-obsidian/6'
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0 flex items-center" aria-label="Convivia24">
            <img
              src="/convivia24.png"
              alt="Convivia24"
              className="h-9 sm:h-10 w-auto rounded-sm"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-0.5">
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
                      className="absolute inset-x-2 bottom-1 h-0.5 bg-ember"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                </Link>
              );
            })}

            <Link
              href="/shop"
              className="ml-1 p-2.5 text-obsidian/40 hover:text-obsidian transition-colors"
              aria-label="Search"
            >
              <Search size={18} />
            </Link>

            <Link
              href="/cart"
              className="relative p-2.5 text-obsidian/40 hover:text-obsidian transition-colors"
              aria-label={`Cart${count ? `, ${count} items` : ''}`}
            >
              <ShoppingBag size={18} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-ember text-white text-[9px] font-black flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>

            <Link
              href="/shop"
              className="ml-2 px-5 py-2 btn-brand text-[11px] font-black uppercase tracking-[0.12em]"
            >
              Order drinks
            </Link>
          </nav>

          <div className="flex items-center gap-1 md:hidden">
            <Link href="/shop" className="p-2 text-obsidian/50" aria-label="Search">
              <Search size={20} />
            </Link>
            <Link href="/cart" className="relative p-2 text-obsidian/50" aria-label="Cart">
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[14px] h-3.5 px-0.5 rounded-full bg-ember text-white text-[8px] font-black flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="p-2 text-obsidian/50"
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
              className="fixed top-16 inset-x-0 z-50 bg-white border-b border-obsidian/10 shadow-lg md:hidden"
            >
              <nav className="px-5 py-3 divide-y divide-obsidian/8">
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
                <div className="pt-4 pb-2">
                  <Link
                    href="/shop"
                    className="block w-full text-center py-3.5 btn-brand text-[12px] font-black uppercase tracking-[0.12em]"
                  >
                    Order drinks
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
