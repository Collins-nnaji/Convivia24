'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronLeft,
  Minus,
  Plus,
  QrCode,
  ShieldCheck,
  Star,
  Tag,
  Trash2,
  Truck,
  Wine,
} from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import DrinkPhoto from '@/components/shop/DrinkPhoto';
import DrinkInfoButton from '@/components/shop/DrinkInfoButton';
import GuestCardStrip from '@/components/loyalty/GuestCardStrip';
import RelatedProducts from '@/components/shop/RelatedProducts';
import { formatNgn, relatedDrinks, type DrinkProduct } from '@/lib/drinks/catalog';
import { findSellable } from '@/lib/catalog/sellable';
import { pointsFromSpend } from '@/lib/loyalty/program';
import { MIN_ORDER_BOTTLES, bottlesShort, orderBottleCount } from '@/lib/commerce/minimum-order';
import { eventsEnabled } from '@/lib/features';
import { eventsFallbackHref } from '@/lib/nav';

export default function CartPage() {
  const { lines, subtotalNgn, setQty, remove } = useCart();
  const [discountPct, setDiscountPct] = useState(0);

  const bottles = orderBottleCount(lines);
  const short = bottlesShort(lines);

  // The tier discount comes from the server's points record — the same source
  // the order is priced from — so the cart cannot promise a rate checkout wont
  // honour.
  useEffect(() => {
    fetch('/api/loyalty/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setDiscountPct(Number(data?.standing?.discountPct) || 0))
      .catch(() => {});
  }, []);

  const discountNgn = Math.round((subtotalNgn * discountPct) / 100);
  const totalNgn = Math.max(0, subtotalNgn - discountNgn);
  const pointsEarned = pointsFromSpend(totalNgn);

  /** Suggestions come off whatever is already in the cart. */
  const suggestions = useMemo(() => {
    const first = lines.map((l) => findSellable(l.slug)).find(Boolean) as DrinkProduct | undefined;
    if (!first) return [];
    const inCart = new Set(lines.map((l) => l.slug));
    return relatedDrinks(first, 6)
      .filter((d) => !inCart.has(d.slug))
      .slice(0, 3);
  }, [lines]);

  if (lines.length === 0) {
    return (
      <section className="bg-paper min-h-[70vh]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
          <h1 className="font-logo font-black uppercase tracking-tight text-3xl brand-text">Your cart</h1>
          <p className="text-obsidian/55 mt-4">Nothing in the cart yet.</p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3.5 btn-brand text-[11px] font-black uppercase tracking-[0.14em]"
          >
            Shop drinks <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-logo font-black uppercase tracking-tight text-3xl sm:text-4xl">
              <span className="brand-text">Your cart</span>{' '}
              <span className="text-obsidian/30 tabular-nums">({lines.length})</span>
            </h1>
            <p className="text-obsidian/50 mt-2 text-sm">Review your items and proceed to checkout.</p>
          </div>
          <p className="inline-flex items-center gap-2 text-[12px] text-emerald-700">
            <ShieldCheck size={15} /> Secure checkout
          </p>
        </div>

        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/45 hover:text-ember mt-5"
        >
          <ChevronLeft size={14} /> Continue shopping
        </Link>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start mt-6">
          <div className="min-w-0 space-y-6">
            <div className="bg-white border border-obsidian/8">
              <div className="hidden sm:grid grid-cols-[1fr_110px_130px_110px] gap-4 px-5 py-3 border-b border-obsidian/8 text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/35">
                <span>Item</span>
                <span className="text-right">Price</span>
                <span className="text-center">Quantity</span>
                <span className="text-right">Total</span>
              </div>

              <ul className="divide-y divide-obsidian/6">
                {lines.map((line, i) => (
                  <motion.li
                    key={line.slug}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i, 5) * 0.05, duration: 0.3 }}
                    className="p-4 sm:px-5 sm:grid sm:grid-cols-[1fr_110px_130px_110px] gap-4 items-center"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <Link
                        href={`/shop/${line.slug}`}
                        className="relative shrink-0 w-14 h-[72px] border border-obsidian/8 bg-white overflow-hidden"
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
                            className="font-semibold text-obsidian hover:text-ember leading-snug"
                          >
                            {line.name}
                          </Link>
                          <DrinkInfoButton slug={line.slug} />
                        </div>
                        <p className="text-[12px] text-obsidian/40 mt-0.5">
                          {findSellable(line.slug)?.volume}
                        </p>
                        <button
                          type="button"
                          onClick={() => remove(line.slug)}
                          className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-obsidian/35 hover:text-ember transition-colors"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>

                    <p className="hidden sm:block text-sm text-right tabular-nums text-obsidian/60">
                      {formatNgn(line.priceNgn)}
                    </p>

                    <div className="flex items-center justify-between sm:justify-center gap-4 mt-4 sm:mt-0">
                      <div className="flex items-center border border-obsidian/15">
                        <button
                          type="button"
                          aria-label="Decrease"
                          className="p-2.5 text-obsidian/50 hover:text-obsidian"
                          onClick={() => setQty(line.slug, line.qty - 1)}
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-9 text-center text-sm font-semibold tabular-nums">{line.qty}</span>
                        <button
                          type="button"
                          aria-label="Increase"
                          className="p-2.5 text-obsidian/50 hover:text-obsidian"
                          onClick={() => setQty(line.slug, line.qty + 1)}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <p className="sm:hidden font-semibold tabular-nums">
                        {formatNgn(line.priceNgn * line.qty)}
                      </p>
                    </div>

                    <p className="hidden sm:block font-semibold text-right tabular-nums">
                      {formatNgn(line.priceNgn * line.qty)}
                    </p>
                  </motion.li>
                ))}
              </ul>
            </div>

            {suggestions.length > 0 && <RelatedProducts products={suggestions} />}

            <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 p-5 sm:p-6 bg-white border border-obsidian/8">
              <Assurance icon={ShieldCheck} label="Secure payment" detail="Encrypted checkout" />
              <Assurance icon={Truck} label="Nationwide delivery" detail="Across Nigeria" />
              <Assurance icon={Wine} label="Authentic products" detail="No parallel imports" />
              <Assurance icon={QrCode} label="Scan to verify" detail="Every order, checkable" />
            </ul>
          </div>

          <aside className="lg:sticky lg:top-24 space-y-4">
            <GuestCardStrip />

            <div className="bg-white border border-obsidian/8 p-5 sm:p-6">
              <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50 mb-4">
                Order summary
              </h2>

              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-obsidian/50">
                    Subtotal <span className="text-obsidian/35">({bottles} bottles)</span>
                  </dt>
                  <dd className="tabular-nums">{formatNgn(subtotalNgn)}</dd>
                </div>
                {discountNgn > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-obsidian/50">Guest Card {discountPct}%</dt>
                    <dd className="text-ember tabular-nums">−{formatNgn(discountNgn)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 text-[12px]">
                  <dt className="text-obsidian/40">Delivery</dt>
                  <dd className="text-obsidian/50">Quoted after your address</dd>
                </div>
              </dl>

              <div className="flex justify-between items-baseline gap-4 mt-4 pt-4 border-t border-obsidian/10">
                <span className="font-semibold">Total</span>
                <span className="font-logo font-black text-2xl tabular-nums">{formatNgn(totalNgn)}</span>
              </div>

              {pointsEarned > 0 && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-obsidian/50">
                  You&apos;ll earn
                  <span className="inline-flex items-center gap-1 font-bold text-ember tabular-nums">
                    <Star size={12} className="fill-ember" /> {pointsEarned.toLocaleString()} pts
                  </span>
                </p>
              )}

              <div className="mt-5 pt-5 border-t border-obsidian/10">
                <p className="text-[12px] text-obsidian/45 flex items-center gap-1.5">
                  <Tag size={13} className="text-ember" /> Have a gift card?
                </p>
                <p className="text-[12px] text-obsidian/40 mt-1.5 leading-relaxed">
                  Enter your <span className="font-mono">CV24</span> code at checkout — it comes off the total
                  before payment.
                </p>
              </div>

              {short > 0 ? (
                <>
                  <span
                    aria-disabled="true"
                    className="mt-5 flex items-center justify-center gap-2 w-full py-3.5 bg-obsidian/10 text-obsidian/40 text-[11px] font-black uppercase tracking-[0.14em] cursor-not-allowed"
                  >
                    Proceed to checkout
                  </span>
                  <p className="text-[12px] text-ember mt-3 leading-relaxed">
                    Minimum order is {MIN_ORDER_BOTTLES} bottles — add {short} more.{' '}
                    <Link href="/shop" className="underline hover:no-underline">
                      Keep shopping
                    </Link>
                    , or take an{' '}
                    <Link href="/shop?section=packages" className="underline hover:no-underline">
                      event package
                    </Link>
                    .
                  </p>
                </>
              ) : (
                <Link
                  href="/checkout"
                  className="mt-5 flex items-center justify-center gap-2 w-full py-3.5 btn-brand text-[11px] font-black uppercase tracking-[0.14em]"
                >
                  Proceed to checkout <ArrowRight size={14} />
                </Link>
              )}

              <Link
                href={eventsFallbackHref()}
                className="block text-center text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/35 hover:text-ember mt-3"
              >
                {eventsEnabled ? 'Or drop to an event →' : 'Or plan your party →'}
              </Link>

              <p className="text-[11px] text-obsidian/35 mt-4 leading-relaxed">
                Adults 18+. We may ask for ID at delivery.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Assurance({
  icon: Icon,
  label,
  detail,
}: {
  icon: typeof Truck;
  label: string;
  detail: string;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <Icon size={18} className="text-ember shrink-0 mt-0.5" />
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold leading-tight">{label}</span>
        <span className="block text-[11px] text-obsidian/45 mt-0.5">{detail}</span>
      </span>
    </li>
  );
}
