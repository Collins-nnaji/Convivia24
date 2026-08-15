'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useCart } from '@/components/cart/CartProvider';
import { formatNgn } from '@/lib/rituals/catalog';

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
            setState({
              phase: 'manual',
              orderId: data.orderId,
              subtotalNgn: data.subtotalNgn,
            });
            return;
          }
          clear();
          sessionStorage.removeItem('convivia_pending_order');
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
      <section className="bg-cream min-h-[70vh] -mt-16 pt-28 pb-20">
        <div className="max-w-xl mx-auto px-5 sm:px-8">
          <SectionLabel variant="light">Confirming</SectionLabel>
          <h1 className="font-display text-4xl italic text-obsidian mb-4">Checking your payment…</h1>
          <p className="text-obsidian/50 text-sm">This only takes a moment.</p>
        </div>
      </section>
    );
  }

  if (state.phase === 'failed') {
    return (
      <section className="bg-cream min-h-[70vh] -mt-16 pt-28 pb-20">
        <div className="max-w-xl mx-auto px-5 sm:px-8">
          <SectionLabel variant="light">Needs attention</SectionLabel>
          <h1 className="font-display text-4xl italic text-obsidian mb-4">Payment not confirmed</h1>
          <p className="text-obsidian/60 leading-relaxed mb-6">{state.message}</p>
          <p className="text-sm text-obsidian/45 mb-8">Your cart is still available if you want to try again.</p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/checkout"
              className="px-6 py-3 bg-obsidian text-cream text-[11px] font-black uppercase tracking-[0.2em]"
            >
              Return to checkout
            </Link>
            <Link
              href="/cart"
              className="px-6 py-3 border border-obsidian/20 text-obsidian text-[11px] font-black uppercase tracking-[0.2em]"
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
      <section className="bg-cream min-h-[70vh] -mt-16 pt-28 pb-20">
        <div className="max-w-xl mx-auto px-5 sm:px-8">
          <SectionLabel variant="light">Pending</SectionLabel>
          <h1 className="font-display text-4xl italic text-obsidian mb-4">Payment still processing</h1>
          <p className="text-obsidian/60 leading-relaxed mb-6">
            If you completed Paystack, refresh in a moment. Your cart is kept until we confirm payment.
          </p>
          {state.orderId && (
            <p className="text-xs text-obsidian/40 mb-8 font-mono break-all">Order {state.orderId}</p>
          )}
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-obsidian text-cream text-[11px] font-black uppercase tracking-[0.2em]"
            >
              Refresh status
            </button>
            <Link
              href="/cart"
              className="px-6 py-3 border border-obsidian/20 text-obsidian text-[11px] font-black uppercase tracking-[0.2em]"
            >
              View cart
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const isManual = state.phase === 'manual';

  return (
    <section className="bg-cream min-h-[70vh] -mt-16 pt-28 pb-20">
      <div className="max-w-xl mx-auto px-5 sm:px-8">
        <SectionLabel variant="light">{isManual ? 'Received' : 'Paid'}</SectionLabel>
        <h1 className="font-display text-5xl italic text-obsidian mb-4">
          {isManual ? 'We have your evening.' : 'Tonight is on its way.'}
        </h1>
        <p className="text-obsidian/60 leading-relaxed mb-6">
          {isManual
            ? 'Your ritual order is saved. Our Lagos concierge will confirm payment and a delivery window shortly.'
            : 'Payment confirmed. We’ll follow up with delivery timing for Lagos.'}
        </p>
        {typeof state.subtotalNgn === 'number' && (
          <p className="font-display text-2xl italic text-obsidian mb-2">{formatNgn(state.subtotalNgn)}</p>
        )}
        {state.orderId && (
          <p className="text-xs text-obsidian/40 mb-8 font-mono break-all">Order {state.orderId}</p>
        )}
        <div className="flex flex-wrap gap-4">
          <Link
            href="/rituals"
            className="px-6 py-3 bg-obsidian text-cream text-[11px] font-black uppercase tracking-[0.2em]"
          >
            Browse more rituals
          </Link>
          <Link
            href="/convivium"
            className="px-6 py-3 border border-obsidian/20 text-obsidian text-[11px] font-black uppercase tracking-[0.2em]"
          >
            The Convivium
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] bg-cream" />}>
      <SuccessBody />
    </Suspense>
  );
}
