'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { formatNgn } from '@/lib/drinks/catalog';

/** Persistent cart summary while browsing the shop. */
export default function ShopCartBar() {
  const pathname = usePathname();
  const { count, subtotalNgn } = useCart();

  const onShop = pathname === '/shop' || pathname.startsWith('/shop/');
  if (!onShop || count <= 0) return null;

  return (
    <div className="fixed bottom-16 md:bottom-3 inset-x-0 z-30 pointer-events-none">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-5 pointer-events-auto">
        <Link
          href="/cart"
          scroll
          className="flex items-center justify-between gap-3 rounded-xl border border-obsidian/10 bg-white/95 backdrop-blur-md px-3 py-2 text-obsidian shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-transform active:scale-[0.99]"
        >
          <span className="inline-flex min-w-0 items-center gap-2">
            <ShoppingBag size={16} className="shrink-0 text-ember" strokeWidth={2.2} />
            <span className="truncate text-sm font-semibold tabular-nums">
              {count} item{count === 1 ? '' : 's'} · {formatNgn(subtotalNgn)}
            </span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-obsidian px-3 py-1.5 text-xs font-bold text-white ring-1 ring-ember/20">
            Cart <ArrowRight size={13} />
          </span>
        </Link>
      </div>
    </div>
  );
}
