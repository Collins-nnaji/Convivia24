'use client';

import Link from 'next/link';
import { ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import DrinkPhoto from '@/components/shop/DrinkPhoto';
import DrinkInfoButton from '@/components/shop/DrinkInfoButton';
import GuestCardStrip from '@/components/loyalty/GuestCardStrip';
import { formatNgn } from '@/lib/drinks/catalog';
import { findSellable } from '@/lib/catalog/sellable';
import {
  MIN_ORDER_BOTTLES,
  bottlesShort,
  orderBottleCount,
} from '@/lib/commerce/minimum-order';
import { eventsEnabled } from '@/lib/features';
import { eventsFallbackHref } from '@/lib/nav';

export default function CartPage() {
  const { lines, subtotalNgn, setQty, remove } = useCart();

  const bottles = orderBottleCount(lines);
  const short = bottlesShort(lines);

  return (
    <>
      <section className="bg-white border-b border-obsidian/5 -mt-16 pt-28 pb-12">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-ember mb-2">Cart</p>
          <h1 className="text-3xl sm:text-4xl font-bold">
            <span className="brand-text">Your order</span>
          </h1>
          <p className="mt-2 text-obsidian/45 text-sm">Nationwide delivery · address or venue</p>
        </div>
      </section>

      <section className="bg-paper py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          {lines.length === 0 ? (
            <div className="max-w-md">
              <p className="text-xl font-semibold text-obsidian mb-4">Nothing in the cart yet.</p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-ember"
              >
                Shop drinks <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-12">
              <ul className="lg:col-span-8 space-y-6">
                {lines.map((line) => (
                  <li key={line.slug} className="border-b border-obsidian/10 pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <Link
                          href={`/shop/${line.slug}`}
                          className="relative shrink-0 w-16 h-20 border border-obsidian/10 bg-white overflow-hidden"
                        >
                          <DrinkPhoto
                            product={findSellable(line.slug) ?? { name: line.name, category: 'spirits' }}
                            className="absolute inset-0 w-full h-full"
                            watermark={false}
                          />
                        </Link>
                        <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/shop/${line.slug}`}
                            className="text-lg font-semibold text-obsidian hover:text-ember"
                          >
                            {line.name}
                          </Link>
                          <DrinkInfoButton slug={line.slug} />
                        </div>
                        <p className="text-sm text-obsidian/45 mt-0.5">{formatNgn(line.priceNgn)} each</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-obsidian/15">
                          <button
                            type="button"
                            aria-label="Decrease"
                            className="p-2 text-obsidian/50"
                            onClick={() => setQty(line.slug, line.qty - 1)}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm">{line.qty}</span>
                          <button
                            type="button"
                            aria-label="Increase"
                            className="p-2 text-obsidian/50"
                            onClick={() => setQty(line.slug, line.qty + 1)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="text-base font-semibold w-24 text-right">
                          {formatNgn(line.priceNgn * line.qty)}
                        </p>
                        <button
                          type="button"
                          aria-label="Remove"
                          onClick={() => remove(line.slug)}
                          className="p-2 text-obsidian/25 hover:text-obsidian"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <aside className="lg:col-span-4">
                <GuestCardStrip className="mb-6" />
                <div className="bg-white border border-obsidian/8 p-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-obsidian/50">Subtotal</span>
                    <span className="text-xl font-bold">{formatNgn(subtotalNgn)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-obsidian/50">Bottles</span>
                    <span
                      className={`font-semibold tabular-nums ${short > 0 ? 'text-ember' : 'text-obsidian/70'}`}
                    >
                      {bottles} of {MIN_ORDER_BOTTLES} minimum
                    </span>
                  </div>
                  <p className="text-xs text-obsidian/40 leading-relaxed">
                    Delivery nationwide across Nigeria — home, party, club, or lounge. Age 18+ for alcohol.
                  </p>

                  {short > 0 ? (
                    <>
                      <span
                        aria-disabled="true"
                        className="flex items-center justify-center gap-2 w-full py-4 bg-obsidian/10 text-obsidian/40 text-[11px] font-black uppercase tracking-[0.14em] cursor-not-allowed"
                      >
                        Checkout
                      </span>
                      <p className="text-xs text-ember leading-relaxed">
                        Minimum order is {MIN_ORDER_BOTTLES} bottles — add {short} more.{' '}
                        <Link href="/shop" className="underline hover:no-underline">
                          Keep shopping
                        </Link>
                        , or take an{' '}
                        <Link href="/packages" className="underline hover:no-underline">
                          event package
                        </Link>
                        .
                      </p>
                    </>
                  ) : (
                    <Link
                      href="/checkout"
                      className="flex items-center justify-center gap-2 w-full py-4 btn-brand text-[11px] font-black uppercase tracking-[0.14em]"
                    >
                      Checkout <ArrowRight size={14} />
                    </Link>
                  )}
                  <Link
                    href={eventsFallbackHref()}
                    className="block text-center text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/40 hover:text-ember"
                  >
                    {eventsEnabled ? 'Or drop to an event →' : 'Or plan your party →'}
                  </Link>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
