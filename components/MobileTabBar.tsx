'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Store, Users, UsersRound } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';

const TABS = [
  { href: '/shop', label: 'Shop', icon: Store },
  { href: '/circles', label: 'Circles', icon: Users },
  { href: '/crews', label: 'Crews', icon: UsersRound },
  { href: '/cart', label: 'Cart', icon: ShoppingBag },
];

export default function MobileTabBar() {
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-obsidian/10 pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <div className="grid grid-cols-4 h-16">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/shop'
              ? pathname === '/shop' || pathname.startsWith('/shop/')
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.4 : 1.8}
                className={active ? 'text-ember' : 'text-obsidian/40'}
              />
              <span
                className={`text-[9px] font-black uppercase tracking-[0.1em] ${
                  active ? 'text-ember' : 'text-obsidian/35'
                }`}
              >
                {label}
              </span>
              {href === '/cart' && count > 0 && (
                <span className="absolute top-1.5 right-[22%] min-w-[14px] h-3.5 px-0.5 rounded-full bg-ember text-white text-[8px] font-black flex items-center justify-center">
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
