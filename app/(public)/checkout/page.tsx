'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import { formatNgn } from '@/lib/drinks/catalog';
import { isEnrolled } from '@/lib/loyalty/store';

const PENDING_ORDER_KEY = 'convivia_pending_order';

function CheckoutForm() {
  const { lines, subtotalNgn, refreshPrices } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event') || '';
  const venuePrefill = searchParams.get('venue') || '';
  const areaPrefill = searchParams.get('area') || '';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<'address' | 'venue'>(venuePrefill ? 'venue' : 'address');
  // Tier discount comes from the server's points record — the same source the
  // order is priced from — so the amount shown is the amount charged.
  const [discountPct, setDiscountPct] = useState(0);
  const [enrolled, setEnrolled] = useState(false);
  const discountNgn = Math.round((subtotalNgn * discountPct) / 100);
  const payableNgn = Math.max(0, subtotalNgn - discountNgn);

  useEffect(() => {
    refreshPrices();
  }, [refreshPrices]);

  useEffect(() => {
    setEnrolled(isEnrolled());
    fetch('/api/loyalty/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setDiscountPct(Number(data?.standing?.discountPct) || 0))
      .catch(() => {});
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lines.length === 0) return;
    setLoading(true);
    setError('');

    const fd = new FormData(e.currentTarget);
    const payload = {
      email: String(fd.get('email') || ''),
      fullName: String(fd.get('fullName') || ''),
      phone: String(fd.get('phone') || ''),
      deliveryMode,
      venueName: String(fd.get('venueName') || ''),
      addressLine1: String(fd.get('addressLine1') || ''),
      addressLine2: String(fd.get('addressLine2') || ''),
      area: String(fd.get('area') || ''),
      notes: String(fd.get('notes') || ''),
      eventId: eventId || undefined,
      items: lines.map((l) => ({
        slug: l.slug,
        qty: l.qty,
      })),
    };

    let orderId: string | null = null;

    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        setError(orderData.error || 'Could not create order.');
        return;
      }

      orderId = orderData.orderId as string;
      sessionStorage.setItem(PENDING_ORDER_KEY, orderId);
      sessionStorage.setItem(
        'convivia_loyalty_apply',
        JSON.stringify({ subtotalNgn, discountNgn: orderData.loyaltyDiscountNgn ?? 0 })
      );

      const payRes = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) {
        await fetch('/api/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });
        sessionStorage.removeItem(PENDING_ORDER_KEY);
        setError(payData.error || 'Payment could not start. Your cart is intact — try again.');
        return;
      }

      if (payData.redirectUrl) {
        window.location.href = payData.redirectUrl;
        return;
      }
      router.push(`/checkout/success?order=${orderId}`);
    } catch {
      if (orderId) {
        await fetch('/api/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        }).catch(() => {});
        sessionStorage.removeItem(PENDING_ORDER_KEY);
      }
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (lines.length === 0) {
    return (
      <section className="bg-paper min-h-[60vh] -mt-16 pt-28 px-5">
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <Link href="/shop" className="text-[11px] font-black uppercase tracking-[0.2em] text-ember">
            Shop drinks →
          </Link>
        </div>
      </section>
    );
  }

  const inputClass =
    'w-full bg-transparent border-0 border-b border-obsidian/20 focus:border-ember focus:ring-0 text-obsidian text-sm py-2.5 px-0 placeholder-obsidian/25';

  return (
    <>
      <section className="bg-white border-b border-obsidian/5 -mt-16 pt-28 pb-12">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-ember mb-2">Lagos delivery</p>
          <h1 className="text-3xl sm:text-4xl font-bold brand-text">Checkout</h1>
          {eventId && (
            <p className="mt-2 text-xs text-obsidian/45">
              Dropping to event <span className="font-mono text-ember">{eventId}</span>
            </p>
          )}
        </div>
      </section>

      <section className="bg-paper py-12 sm:py-14">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-12 gap-12">
          <form onSubmit={onSubmit} className="lg:col-span-7 space-y-6">
            <div className="flex gap-2 mb-2">
              {(['address', 'venue'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDeliveryMode(mode)}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] ${
                    deliveryMode === mode
                      ? 'bg-obsidian text-white'
                      : 'bg-white border border-obsidian/10 text-obsidian/45'
                  }`}
                >
                  {mode === 'address' ? 'Home / party address' : 'Club / lounge'}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 block mb-1">
                  Full name
                </label>
                <input name="fullName" required className={inputClass} placeholder="Ada Okafor" />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 block mb-1">
                  Email
                </label>
                <input name="email" type="email" required className={inputClass} placeholder="you@email.com" />
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 block mb-1">
                Phone
              </label>
              <input name="phone" type="tel" required className={inputClass} placeholder="+234…" />
            </div>

            {deliveryMode === 'venue' ? (
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 block mb-1">
                  Venue / lounge name
                </label>
                <input
                  name="venueName"
                  required
                  defaultValue={venuePrefill}
                  className={inputClass}
                  placeholder="e.g. Lumen Lounge, Harbour House"
                />
                <input type="hidden" name="addressLine1" value="" />
              </div>
            ) : (
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 block mb-1">
                  Address
                </label>
                <input name="addressLine1" required className={inputClass} placeholder="Street, building" />
                <input type="hidden" name="venueName" value="" />
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 block mb-1">
                  Area
                </label>
                <input name="area" required defaultValue={areaPrefill} className={inputClass} placeholder="Victoria Island, Lekki…" />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 block mb-1">
                  Landmark / table note
                </label>
                <input name="addressLine2" className={inputClass} placeholder="Optional" />
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 block mb-1">
                Notes
              </label>
              <input name="notes" className={inputClass} placeholder="Gate codes, preferred window…" />
            </div>

            <p className="text-xs text-obsidian/45 leading-relaxed">
              By ordering you confirm you are 18+ if alcohol is included.
            </p>

            {error && <p className="text-ember text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 btn-brand text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-60"
            >
              {loading ? 'Placing order…' : `Pay ${formatNgn(payableNgn)}`}
            </button>
          </form>

          <aside className="lg:col-span-5">
            <div className="border border-obsidian/8 p-6 space-y-4 bg-white">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40">Order</p>
              <ul className="space-y-3">
                {lines.map((l) => (
                  <li key={l.slug} className="flex justify-between gap-4 text-sm">
                    <span className="text-obsidian/70">
                      {l.name} × {l.qty}
                    </span>
                    <span>{formatNgn(l.priceNgn * l.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-obsidian/10 space-y-2">
                {discountNgn > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-obsidian/45">Guest Card {discountPct}%</span>
                    <span className="text-ember">−{formatNgn(discountNgn)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline">
                  <span className="text-obsidian/45 text-sm">Total</span>
                  <span className="text-2xl font-bold">{formatNgn(payableNgn)}</span>
                </div>
                {!enrolled && (
                  <Link href="/card" className="block text-[10px] font-black uppercase tracking-[0.14em] text-ember pt-1">
                    Activate Guest Card for perks →
                  </Link>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] bg-paper" />}>
      <CheckoutForm />
    </Suspense>
  );
}
