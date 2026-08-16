'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/components/auth/AuthProvider';
import { formatNgn } from '@/lib/drinks/catalog';

type OrderItem = {
  slug: string;
  name: string;
  qty: number;
  unitPriceNgn: number;
};

type Order = {
  id: string;
  status: string;
  subtotalNgn: number;
  addressLine1: string;
  area: string | null;
  createdAt: string;
  items: OrderItem[];
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  awaiting_payment: 'Awaiting payment',
  paid: 'Paid',
  fulfilled: 'Delivered',
  cancelled: 'Cancelled',
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch('/api/orders')
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Could not load orders');
        setOrders(data.orders || []);
      })
      .catch((err) => setError(err.message || 'Could not load orders'))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  return (
    <section className="bg-paper min-h-[60vh]">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <p className="text-[10px] font-wordmark-sm text-ember mb-2">Account</p>
        <h1 className="font-wordmark text-3xl sm:text-4xl text-obsidian mb-2">Order history</h1>
        <p className="text-sm text-obsidian/50 mb-8 font-light">Past drinks drops tied to your signed-in email.</p>

        {authLoading || loading ? (
          <p className="text-sm text-obsidian/45">Loading…</p>
        ) : !user ? (
          <div className="bg-white p-6 sm:p-8 shadow-sm">
            <p className="text-sm text-obsidian/60 mb-4">Sign in to see your orders.</p>
            <Link
              href="/signin?next=/orders"
              className="inline-block px-5 py-2.5 btn-brand text-[11px] font-wordmark-sm"
            >
              Sign in
            </Link>
          </div>
        ) : error ? (
          <p className="text-sm text-ember">{error}</p>
        ) : orders.length === 0 ? (
          <div className="bg-white p-6 sm:p-8 shadow-sm">
            <p className="text-sm text-obsidian/55 mb-4">No orders yet.</p>
            <Link href="/shop" className="inline-block px-5 py-2.5 btn-brand text-[11px] font-wordmark-sm">
              Shop drinks
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order.id} className="bg-white p-5 sm:p-6 shadow-sm border border-obsidian/6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-[10px] font-wordmark-sm text-obsidian/40">
                      {new Date(order.createdAt).toLocaleString('en-NG', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                    <p className="text-sm font-medium text-obsidian mt-0.5">
                      {formatNgn(order.subtotalNgn)}
                    </p>
                    <p className="text-xs text-obsidian/45 mt-0.5 truncate max-w-[16rem] sm:max-w-md">
                      {order.addressLine1}
                      {order.area ? ` · ${order.area}` : ''}
                    </p>
                  </div>
                  <span className="text-[10px] font-wordmark-sm px-2.5 py-1 border border-obsidian/15 text-obsidian/70">
                    {STATUS_LABEL[order.status] || order.status}
                  </span>
                </div>
                <ul className="divide-y divide-obsidian/6 border-t border-obsidian/6">
                  {(order.items || []).map((item) => (
                    <li key={`${order.id}-${item.slug}`} className="py-2 flex justify-between gap-3 text-sm">
                      <span className="text-obsidian/80 min-w-0 truncate">
                        {item.name} <span className="text-obsidian/40">×{item.qty}</span>
                      </span>
                      <span className="shrink-0 text-obsidian/55">
                        {formatNgn(item.unitPriceNgn * item.qty)}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
