'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useCart } from '@/components/cart/CartProvider';
import { formatNgn } from '@/lib/rituals/catalog';

const PENDING_ORDER_KEY = 'convivia_pending_order';

export default function CheckoutPage() {
  const { lines, subtotalNgn, refreshPrices } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    refreshPrices();
  }, [refreshPrices]);

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
      addressLine1: String(fd.get('addressLine1') || ''),
      addressLine2: String(fd.get('addressLine2') || ''),
      area: String(fd.get('area') || ''),
      notes: String(fd.get('notes') || ''),
      items: lines.map((l) => ({
        slug: l.slug,
        qty: l.qty,
        preferTrack: l.preferTrack,
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

      // Keep cart until success page verifies payment
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
      <section className="bg-cream min-h-[60vh] -mt-16 pt-28 px-5">
        <div className="max-w-lg mx-auto">
          <h1 className="font-display text-4xl italic mb-4">Your cart is empty</h1>
          <Link href="/rituals" className="text-[11px] font-black uppercase tracking-[0.2em] text-gold-dark">
            Browse rituals →
          </Link>
        </div>
      </section>
    );
  }

  const inputClass =
    'w-full bg-transparent border-0 border-b border-obsidian/20 focus:border-gold focus:ring-0 text-obsidian text-sm py-2.5 px-0 placeholder-obsidian/25';

  return (
    <>
      <section className="bg-obsidian -mt-16 pt-28 pb-14">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <SectionLabel>Lagos delivery</SectionLabel>
          <h1 className="font-display text-5xl italic text-cream">Checkout</h1>
        </div>
      </section>

      <section className="bg-cream py-14">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-12 gap-12">
          <form onSubmit={onSubmit} className="lg:col-span-7 space-y-6">
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
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 block mb-1">
                Address
              </label>
              <input name="addressLine1" required className={inputClass} placeholder="Street, building" />
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 block mb-1">
                  Area
                </label>
                <input name="area" required className={inputClass} placeholder="Victoria Island, Lekki…" />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 block mb-1">
                  Landmark / apt
                </label>
                <input name="addressLine2" className={inputClass} placeholder="Optional" />
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 block mb-1">
                Notes
              </label>
              <input name="notes" className={inputClass} placeholder="Gate codes, preferred evening window…" />
            </div>

            <p className="text-xs text-obsidian/45 leading-relaxed">
              By placing this order you confirm you are 18+ if any spirit track is included. Zero-proof kits still
              ship from our drinks house.
            </p>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] disabled:opacity-60"
            >
              {loading ? 'Placing order…' : `Pay ${formatNgn(subtotalNgn)}`}
            </button>
          </form>

          <aside className="lg:col-span-5">
            <div className="border border-obsidian/10 p-6 space-y-4 bg-white/40">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40">Order</p>
              <ul className="space-y-3">
                {lines.map((l) => (
                  <li key={l.slug} className="flex justify-between gap-4 text-sm">
                    <span className="text-obsidian/70">
                      {l.name} × {l.qty}
                      <span className="block text-[10px] uppercase tracking-wider text-obsidian/35">
                        {l.preferTrack}
                      </span>
                    </span>
                    <span>{formatNgn(l.priceNgn * l.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-obsidian/10 flex justify-between items-baseline">
                <span className="text-obsidian/45 text-sm">Total</span>
                <span className="font-display text-3xl italic">{formatNgn(subtotalNgn)}</span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
