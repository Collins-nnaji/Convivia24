'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Headset,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Star,
  Truck,
  Users,
} from 'lucide-react';
import DrinkPhoto from '@/components/shop/DrinkPhoto';
import { useUser } from '@/components/auth/AuthProvider';
import { findSellable } from '@/lib/catalog/sellable';
import { formatNgn } from '@/lib/drinks/catalog';
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/commerce/status';

type Item = { slug: string; name: string; qty: number; unitPriceNgn: number };

export type TrackedOrder = {
  id: string;
  status: OrderStatus;
  subtotalNgn: number;
  loyaltyDiscountNgn: number;
  giftCardDiscountNgn: number;
  totalNgn: number;
  pointsAwarded: number;
  fullName: string;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  area: string | null;
  courierName: string | null;
  riderPhone: string | null;
  etaAt: string | null;
  trackingNote: string | null;
  createdAt: string;
  items: Item[];
};

export type TrackingStepView = {
  status: OrderStatus;
  label: string;
  at: string | null;
  done: boolean;
  current: boolean;
};

/** Human reference for an order — the full uuid is unreadable on a receipt. */
function reference(id: string): string {
  return `CV24-${id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
}

function formatStamp(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function OrderTracking({ orderId }: { orderId: string }) {
  const { user, loading: authLoading } = useUser();
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [steps, setSteps] = useState<TrackingStepView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetch(`/api/orders/${encodeURIComponent(orderId)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Could not load that order.');
        setOrder(data.order);
        setSteps(data.steps || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [orderId, user, authLoading]);

  if (authLoading || loading) {
    return <Shell>Loading your order…</Shell>;
  }

  if (!user) {
    return (
      <Shell>
        <p className="text-sm text-obsidian/60 mb-4">Sign in to track this order.</p>
        <Link
          href={`/signin?next=${encodeURIComponent(`/orders/${orderId}`)}`}
          className="inline-block px-5 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em]"
        >
          Sign in
        </Link>
      </Shell>
    );
  }

  if (error || !order) {
    return (
      <Shell>
        <p className="text-sm text-ember mb-4">{error || 'Order not found.'}</p>
        <Link href="/orders" className="text-[11px] font-black uppercase tracking-[0.14em] text-ember">
          Back to orders →
        </Link>
      </Shell>
    );
  }

  return <OrderTrackingView order={order} steps={steps} />;
}

/** The view itself, given an order. Split out so it can be rendered from data. */
export function OrderTrackingView({ order, steps }: { order: TrackedOrder; steps: TrackingStepView[] }) {
  const [copied, setCopied] = useState(false);

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(reference(order.id));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  }

  const current = steps.find((s) => s.current) ?? steps[0];
  const terminal = order.status === 'cancelled' || order.status === 'refunded';
  const itemCount = order.items.reduce((n, i) => n + i.qty, 0);

  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex items-center gap-1.5 text-[12px] text-obsidian/40 flex-wrap">
            <li>
              <Link href="/" className="hover:text-ember transition-colors">
                Home
              </Link>
            </li>
            <ChevronRight size={12} className="text-obsidian/25" />
            <li>
              <Link href="/orders" className="hover:text-ember transition-colors">
                Orders
              </Link>
            </li>
            <ChevronRight size={12} className="text-obsidian/25" />
            <li className="text-obsidian/70">{reference(order.id)}</li>
          </ol>
        </nav>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-logo font-black uppercase tracking-tight text-3xl sm:text-4xl">
              <span className="brand-text">Track your order</span>
            </h1>
            <p className="text-sm text-obsidian/55 mt-2 inline-flex items-center gap-2">
              Order {reference(order.id)}
              <button
                type="button"
                onClick={copyReference}
                aria-label="Copy order reference"
                className="text-obsidian/30 hover:text-ember transition-colors"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </p>
            <p className="text-[12px] text-obsidian/40 mt-1">
              Placed {formatStamp(order.createdAt)} · {itemCount} item{itemCount === 1 ? '' : 's'} ·{' '}
              {formatNgn(order.totalNgn)}
            </p>
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-obsidian/12 text-[11px] font-black uppercase tracking-[0.12em] hover:border-ember hover:text-ember transition-colors"
          >
            <Headset size={15} /> Need help? Contact support
          </Link>
        </div>

        {/* Status + stepper */}
        <div className="bg-white border border-obsidian/8 p-5 sm:p-7 mt-6">
          {terminal ? (
            <div className="flex items-center gap-4">
              <span className="w-14 h-14 rounded-full bg-obsidian/8 flex items-center justify-center shrink-0">
                <Package size={22} className="text-obsidian/40" />
              </span>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/35">Status</p>
                <p className="font-logo font-black uppercase tracking-tight text-xl mt-0.5">
                  {ORDER_STATUS_LABELS[order.status]}
                </p>
                <p className="text-sm text-obsidian/50 mt-1">
                  Nothing further will happen to this order. Contact support if that looks wrong.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-10 items-center">
              <div className="flex items-center gap-4">
                <span className="w-14 h-14 rounded-full bg-ember flex items-center justify-center shrink-0">
                  <Truck size={22} className="text-white" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/35">Status</p>
                  <p className="font-logo font-black uppercase tracking-tight text-xl mt-0.5 leading-tight">
                    {ORDER_STATUS_LABELS[order.status]}
                  </p>
                  {order.trackingNote && (
                    <p className="text-[12px] text-obsidian/50 mt-1.5 leading-relaxed">{order.trackingNote}</p>
                  )}
                </div>
              </div>

              <ol className="flex items-start overflow-x-auto scrollbar-hide">
                {steps.map((step, i) => {
                  const last = i === steps.length - 1;
                  return (
                    <li key={step.status} className={`flex items-start ${last ? '' : 'flex-1 min-w-[86px]'}`}>
                      <div className="flex flex-col items-center shrink-0 w-[86px]">
                        <span
                          className={`w-9 h-9 rounded-full border-2 flex items-center justify-center ${
                            step.done
                              ? 'border-ember bg-ember text-white'
                              : 'border-obsidian/15 bg-white text-obsidian/25'
                          }`}
                        >
                          {step.current ? <Truck size={15} /> : step.done ? <Check size={15} /> : <Package size={14} />}
                        </span>
                        <span
                          className={`mt-2 text-[11px] font-semibold text-center leading-tight ${
                            step.done ? 'text-obsidian/75' : 'text-obsidian/30'
                          }`}
                        >
                          {step.label}
                        </span>
                        <span className="mt-0.5 text-[10px] text-obsidian/35 text-center leading-tight h-6">
                          {formatStamp(step.at)}
                        </span>
                      </div>
                      {!last && (
                        <span
                          className={`h-0.5 flex-1 mt-[18px] ${step.done ? 'bg-ember' : 'bg-obsidian/10'}`}
                        />
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {order.etaAt && !terminal && (
            <p className="mt-5 pt-5 border-t border-obsidian/8 inline-flex items-center gap-2 px-3.5 py-2 bg-ember/6 text-ember text-[12px] font-semibold">
              Estimated delivery {formatStamp(order.etaAt)}
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 items-start mt-6">
          <div className="min-w-0 space-y-6">
            {!terminal && <DeliveryPanel order={order} current={current} />}

            <section className="bg-white border border-obsidian/8">
              <div className="px-5 py-4 border-b border-obsidian/8">
                <h2 className="text-lg font-bold">
                  Order items <span className="text-obsidian/30 tabular-nums">({order.items.length})</span>
                </h2>
              </div>
              <ul className="divide-y divide-obsidian/6">
                {order.items.map((item) => {
                  const product = findSellable(item.slug);
                  return (
                    <li key={item.slug} className="p-4 sm:px-5 flex items-center gap-4">
                      <Link
                        href={`/shop/${item.slug}`}
                        className="relative w-12 h-16 shrink-0 bg-white border border-obsidian/8 overflow-hidden"
                      >
                        <DrinkPhoto
                          product={product ?? { name: item.name, category: 'spirits' }}
                          className="absolute inset-0 w-full h-full"
                          watermark={false}
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link href={`/shop/${item.slug}`} className="block">
                          <p className="font-semibold text-sm truncate hover:text-ember transition-colors">
                            {item.name}
                          </p>
                        </Link>
                        <p className="text-[12px] text-obsidian/40 mt-0.5">{product?.volume}</p>
                      </div>
                      <p className="text-[12px] text-obsidian/45 shrink-0">Qty {item.qty}</p>
                      <p className="font-semibold tabular-nums shrink-0 w-24 text-right">
                        {formatNgn(item.unitPriceNgn * item.qty)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="bg-ember/[0.04] border border-ember/15 p-5 sm:p-6 flex items-center gap-5 flex-wrap">
              <span className="w-12 h-12 rounded-full bg-ember/10 flex items-center justify-center shrink-0">
                <Users size={20} className="text-ember" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold">Share &amp; earn rewards</p>
                <p className="text-[12px] text-obsidian/50 mt-1 leading-relaxed">
                  Invite friends and earn points when they shop.
                </p>
              </div>
              <Link
                href="/refer"
                className="px-5 py-3 border border-ember/40 text-ember text-[10px] font-black uppercase tracking-[0.12em] hover:bg-ember/5 transition-colors"
              >
                Invite friends
              </Link>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-white border border-obsidian/8">
              <div className="px-5 py-4 border-b border-obsidian/8 flex items-center gap-2.5">
                <MapPin size={16} className="text-ember" />
                <h2 className="font-bold text-sm">Delivery address</h2>
              </div>
              <div className="p-5 text-sm text-obsidian/65 leading-relaxed">
                <p className="font-semibold text-obsidian">{order.fullName}</p>
                <p className="mt-1">
                  {[order.addressLine1, order.addressLine2, order.area, order.city]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                {order.phone && <p className="mt-1.5 text-obsidian/50">{order.phone}</p>}
              </div>
            </section>

            <section className="bg-white border border-obsidian/8">
              <div className="px-5 py-4 border-b border-obsidian/8 flex items-center justify-between gap-4">
                <h2 className="font-bold text-sm">Order summary</h2>
                <Link
                  href={`/verify/${order.id}`}
                  className="text-[11px] font-black uppercase tracking-[0.1em] text-ember hover:underline"
                >
                  Verify order
                </Link>
              </div>
              <dl className="p-5 space-y-2.5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-obsidian/50">Subtotal</dt>
                  <dd className="tabular-nums">{formatNgn(order.subtotalNgn)}</dd>
                </div>
                {order.loyaltyDiscountNgn > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-obsidian/50">Guest Card discount</dt>
                    <dd className="text-ember tabular-nums">−{formatNgn(order.loyaltyDiscountNgn)}</dd>
                  </div>
                )}
                {order.giftCardDiscountNgn > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-obsidian/50">Gift card</dt>
                    <dd className="text-ember tabular-nums">−{formatNgn(order.giftCardDiscountNgn)}</dd>
                  </div>
                )}
                <div className="flex justify-between items-baseline gap-4 pt-3 border-t border-obsidian/10">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-logo font-black text-xl tabular-nums">{formatNgn(order.totalNgn)}</dd>
                </div>
              </dl>

              {order.pointsAwarded > 0 && (
                <p className="mx-5 mb-5 px-3.5 py-2.5 bg-ember/6 text-[12px] text-obsidian/65 inline-flex items-center gap-1.5">
                  <Star size={13} className="text-ember fill-ember shrink-0" />
                  You earned{' '}
                  <span className="font-bold text-ember tabular-nums">
                    {order.pointsAwarded.toLocaleString()} pts
                  </span>{' '}
                  on this order
                </p>
              )}
            </section>

            <section className="bg-white border border-obsidian/8">
              <div className="px-5 py-4 border-b border-obsidian/8 flex items-center gap-2.5">
                <Headset size={16} className="text-ember" />
                <h2 className="font-bold text-sm">Need help?</h2>
              </div>
              <div className="p-5">
                <p className="text-[12px] text-obsidian/50 leading-relaxed">
                  We&apos;re here to help with this order. Quote {reference(order.id)}.
                </p>
                <Link
                  href="/contact"
                  className="mt-4 w-full py-3 btn-brand text-[10px] font-black uppercase tracking-[0.12em] inline-flex items-center justify-center gap-1.5"
                >
                  Contact support <ChevronRight size={13} />
                </Link>
              </div>
            </section>

            <p className="flex items-start gap-2 text-[12px] text-obsidian/40 leading-relaxed">
              <ShieldCheck size={14} className="text-ember shrink-0 mt-0.5" />
              Every order ships with an authenticity stamp — scan the code on your bottle or receipt to
              confirm it came from us.
            </p>
          </div>
        </div>

        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/40 hover:text-ember mt-8"
        >
          <ChevronLeft size={14} /> All orders
        </Link>
      </div>
    </section>
  );
}

/**
 * Courier details, shown only when the desk has actually assigned them. There
 * is no live GPS feed behind this order, so it reports what we know rather
 * than drawing a map with a position we cannot source.
 */
function DeliveryPanel({ order, current }: { order: TrackedOrder; current: TrackingStepView | undefined }) {
  const hasCourier = Boolean(order.courierName || order.riderPhone);

  return (
    <section className="bg-white border border-obsidian/8">
      <div className="px-5 py-4 border-b border-obsidian/8 flex items-center gap-2.5">
        <Truck size={16} className="text-ember" />
        <h2 className="font-bold">Delivery</h2>
      </div>

      <div className="p-5 sm:p-6">
        {hasCourier ? (
          <div className="grid sm:grid-cols-2 gap-5">
            {order.courierName && (
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/35">
                  Delivery partner
                </p>
                <p className="font-semibold mt-1.5">{order.courierName}</p>
              </div>
            )}
            {order.riderPhone && (
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/35">Rider</p>
                <a
                  href={`tel:${order.riderPhone}`}
                  className="mt-1.5 inline-flex items-center gap-2 font-semibold text-ember hover:underline"
                >
                  <Phone size={14} /> {order.riderPhone}
                </a>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-obsidian/50 leading-relaxed">
            {current?.status === 'out_for_delivery'
              ? 'Your order is on the way. Rider details appear here once the courier is assigned.'
              : 'A courier and rider are assigned once your order leaves us — their details show up here.'}
          </p>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-5 pt-5 border-t border-obsidian/8 text-[12px] text-obsidian/45 leading-relaxed"
        >
          Live rider location is not tracked on this order — call the rider directly if you need to find
          them.
        </motion.div>
      </div>
    </section>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-paper min-h-[60vh]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
        <h1 className="font-logo font-black uppercase tracking-tight text-3xl brand-text mb-4">
          Track your order
        </h1>
        {children}
      </div>
    </section>
  );
}
