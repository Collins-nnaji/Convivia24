'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import { formatNgn } from '@/lib/drinks/catalog';

type VerifyState =
  | { phase: 'loading' }
  | { phase: 'paid'; orderId: string; subtotalNgn?: number }
  | { phase: 'manual'; orderId: string; subtotalNgn?: number }
  | { phase: 'pending'; orderId: string }
  | { phase: 'failed'; orderId?: string; message: string };

function SuccessBody() {
  const params = useSearchParams();
  const orderId = params.get('order');
  const mode = params.get('mode');
  const reference = params.get('reference') || params.get('trxref');
  const { clear } = useCart();
  const [state, setState] = useState<VerifyState>({ phase: 'loading' });

  /**
   * Order points are awarded server-side when the payment verifies, so nothing
   * is banked in the browser here — this only clears the hand-off record.
   */
  function applyLoyalty(_subtotal?: number) {
    try {
      sessionStorage.removeItem('convivia_loyalty_apply');
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    if (!orderId && !reference) {
      setState({ phase: 'failed', message: 'No order to verify.' });
      return;
    }

    let cancelled = false;

    async function verify() {
      try {
        const qs = new URLSearchParams();
        if (orderId) qs.set('orderId', orderId);
        if (reference) qs.set('reference', reference);
        const res = await fetch(`/api/stripe/verify?${qs.toString()}`);
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setState({
            phase: 'failed',
            orderId: orderId || undefined,
            message: data.error || 'Could not verify payment.',
          });
          return;
        }

        if (data.status === 'paid' || data.status === 'fulfilled' || data.verified === true) {
          if (mode === 'manual' || data.mode === 'manual') {
            clear();
            sessionStorage.removeItem('convivia_pending_order');
            applyLoyalty(data.subtotalNgn);
            setState({
              phase: 'manual',
              orderId: data.orderId,
              subtotalNgn: data.subtotalNgn,
            });
            return;
          }
          clear();
          sessionStorage.removeItem('convivia_pending_order');
          applyLoyalty(data.subtotalNgn);
          setState({
            phase: 'paid',
            orderId: data.orderId,
            subtotalNgn: data.subtotalNgn,
          });
          return;
        }

        if (mode === 'manual' || data.mode === 'manual') {
          clear();
          sessionStorage.removeItem('convivia_pending_order');
          applyLoyalty(data.subtotalNgn);
          setState({
            phase: 'manual',
            orderId: data.orderId,
            subtotalNgn: data.subtotalNgn,
          });
          return;
        }

        setState({ phase: 'pending', orderId: data.orderId });
      } catch {
        if (!cancelled) {
          setState({
            phase: 'failed',
            orderId: orderId || undefined,
            message: 'Unable to reach payment verification.',
          });
        }
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [orderId, reference, mode, clear]);

  if (state.phase === 'loading') {
    return (
      <section className="bg-paper min-h-[70vh] -mt-16 pt-28 pb-20">
        <div className="max-w-xl mx-auto px-5 sm:px-8">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-ember mb-3">Confirming</p>
          <h1 className="text-3xl font-bold text-obsidian mb-4">Checking your payment…</h1>
        </div>
      </section>
    );
  }

  if (state.phase === 'failed') {
    return (
      <section className="bg-paper min-h-[70vh] -mt-16 pt-28 pb-20">
        <div className="max-w-xl mx-auto px-5 sm:px-8">
          <h1 className="text-3xl font-bold text-obsidian mb-4">Payment not confirmed</h1>
          <p className="text-obsidian/60 leading-relaxed mb-6">{state.message}</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/checkout" className="px-6 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em]">
              Return to checkout
            </Link>
            <Link
              href="/cart"
              className="px-6 py-3 border border-obsidian/15 text-[11px] font-black uppercase tracking-[0.14em]"
            >
              View cart
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (state.phase === 'pending') {
    return (
      <section className="bg-paper min-h-[70vh] -mt-16 pt-28 pb-20">
        <div className="max-w-xl mx-auto px-5 sm:px-8">
          <h1 className="text-3xl font-bold text-obsidian mb-4">Payment still processing</h1>
          <p className="text-obsidian/60 leading-relaxed mb-6">
            If you completed Paystack, refresh in a moment. Your cart is kept until we confirm payment.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em]"
          >
            Refresh status
          </button>
        </div>
      </section>
    );
  }

  const isManual = state.phase === 'manual';

  return (
    <section className="bg-paper min-h-[70vh] -mt-16 pt-28 pb-20">
      <div className="max-w-xl mx-auto px-5 sm:px-8">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-ember mb-3">
          {isManual ? 'Received' : 'Paid'}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-obsidian mb-4">
          {isManual ? 'We have your drop.' : 'Your drinks are on the way.'}
        </h1>
        <p className="text-obsidian/60 leading-relaxed mb-6">
          {isManual
            ? 'Order saved. Our Lagos team will confirm payment and a delivery window shortly.'
            : 'Payment confirmed. We’ll follow up with delivery timing for Lagos.'}
        </p>
        {typeof state.subtotalNgn === 'number' && (
          <p className="text-2xl font-bold text-obsidian mb-2">{formatNgn(state.subtotalNgn)}</p>
        )}
        {state.orderId && (
          <p className="text-xs text-obsidian/40 mb-8 font-mono break-all">Order {state.orderId}</p>
        )}
        <div className="flex flex-wrap gap-4">
          <Link href="/shop" className="px-6 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em]">
            Shop more
          </Link>
          <Link
            href="/events"
            className="px-6 py-3 border border-obsidian/15 text-[11px] font-black uppercase tracking-[0.14em]"
          >
            Tonight&apos;s events
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] bg-paper" />}>
      <SuccessBody />
    </Suspense>
  );
}
