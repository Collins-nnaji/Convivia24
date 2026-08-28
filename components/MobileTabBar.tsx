'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { CalendarDays, Gift, PartyPopper, ShoppingBag, Store } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { eventsEnabled } from '@/lib/features';
import { isNavActive } from '@/lib/nav';

const TABS = [
  { href: '/shop', label: 'Shop', icon: Store },
  eventsEnabled
    ? { href: '/events', label: 'Events', icon: CalendarDays }
    : { href: '/shop?section=plan', label: 'Plan', icon: PartyPopper },
  // Accented: a prize draw, not a shopping step.
  { href: '/trivia', label: 'Trivia', icon: Gift, accent: true },
  { href: '/cart', label: 'Cart', icon: ShoppingBag },
];

export default function MobileTabBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const section = searchParams.get('section');
  const { count } = useCart();

  function tabActive(href: string): boolean {
    if (href === '/shop') return pathname === '/shop' && section !== 'plan';
    if (href === '/shop?section=plan') return pathname === '/shop' && section === 'plan';
    return isNavActive(pathname, href);
  }

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-obsidian/10 pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <div className="grid grid-cols-4 h-16">
        {TABS.map((tab) => {
          const { href, label, icon: Icon } = tab;
          const accent = 'accent' in tab && tab.accent === true;
          const active = tabActive(href);
          return (
            <Link
              key={href}
              href={href}
              scroll
              className="relative flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.4 : 1.8}
                className={active ? 'text-ember' : accent ? 'text-ember/60' : 'text-obsidian/40'}
              />
              <span
                className={`text-[10px] sm:text-xs font-black uppercase tracking-[0.08em] ${
                  active ? 'text-ember' : accent ? 'text-ember/55' : 'text-obsidian/35'
                }`}
              >
                {label}
              </span>
              {href === '/cart' && (
                <span className="absolute top-1.5 right-[18%] min-w-[16px] h-4 px-1 rounded-full bg-obsidian text-white text-[8px] font-black flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
