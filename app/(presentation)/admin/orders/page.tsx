'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdmin } from '../layout';
import { formatMoney } from '@/lib/money';

interface Order {
  reference: string; event_title: string; event_slug: string; buyer_name: string;
  buyer_email: string; total: string; currency: string; status: string;
  ticket_count: number; created_at: string;
}

export default function OrdersAdmin() {
  const { secret } = useAdmin();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders', { headers: { 'x-admin-secret': secret } })
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []))
      .finally(() => setLoading(false));
  }, [secret]);

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-light italic text-[#f5f0e8] mb-1">Orders</h1>
      <p className="text-[#f5f0e8]/40 text-sm mb-8">Every ticket order across your events.</p>

      <div className="border border-[#c9a84c]/15 divide-y divide-[#c9a84c]/10">
        {loading ? (
          <p className="p-5 text-[#f5f0e8]/30 text-sm">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="p-5 text-[#f5f0e8]/30 text-sm">No orders yet.</p>
        ) : (
          orders.map((o) => (
            <div key={o.reference} className="flex flex-wrap items-center gap-4 p-4">
              <div className="flex-1 min-w-[180px]">
                <p className="text-[#f5f0e8] text-sm font-medium">{o.buyer_name}</p>
                <p className="text-[#f5f0e8]/30 text-xs">{o.buyer_email}</p>
              </div>
              <Link href={`/events/${o.event_slug}`} className="text-[#c9a84c]/80 hover:text-[#c9a84c] text-sm min-w-[120px] truncate">{o.event_title}</Link>
              <div className="text-center"><p className="text-[#f5f0e8] text-sm">{o.ticket_count}</p><p className="text-[9px] uppercase tracking-wider text-[#f5f0e8]/30">tix</p></div>
              <div className="text-right min-w-[90px]"><p className="text-[#f5f0e8] text-sm">{Number(o.total) > 0 ? formatMoney(o.total, o.currency) : 'Free'}</p><p className="text-[9px] uppercase tracking-wider text-emerald-400/70">{o.status}</p></div>
              <Link href={`/orders/${o.reference}`} className="font-mono text-xs text-[#f5f0e8]/40 hover:text-[#c9a84c]">{o.reference}</Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
