'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Wallet, Users, ArrowRight } from 'lucide-react';
import { useAdmin } from '../layout';
import { formatMoney } from '@/lib/money';

interface Summary {
  events: number;
  tickets_sold: number;
  orders: number;
  gross_revenue: number;
  pending_applications: number;
}

interface EventFinance {
  event_id: string;
  title: string;
  slug: string;
  currency: string;
  tickets_sold: number;
  tickets_checked_in: number;
  orders_count: number;
  gross_revenue: number;
  avg_order_value: number;
}

export default function FinancePage() {
  const { secret } = useAdmin();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [events, setEvents] = useState<{ id: string; title: string; slug: string }[]>([]);
  const [finances, setFinances] = useState<EventFinance[]>([]);

  useEffect(() => {
    fetch('/api/events/platform/finance', { headers: { 'x-admin-secret': secret } })
      .then((r) => r.json())
      .then((d) => setSummary(d.summary));
    fetch('/api/events?all=1', { headers: { 'x-admin-secret': secret } })
      .then((r) => r.json())
      .then(async (d) => {
        const evs = d.events ?? [];
        setEvents(evs);
        const results = await Promise.all(
          evs.slice(0, 12).map((e: { slug: string }) =>
            fetch(`/api/events/${e.slug}/finance`, { headers: { 'x-admin-secret': secret } })
              .then((r) => r.json())
              .then((fd) => fd.finance)
              .catch(() => null)
          )
        );
        setFinances(results.filter(Boolean));
      });
  }, [secret]);

  const cards = [
    { icon: Wallet, label: 'Gross revenue', value: formatMoney(summary?.gross_revenue ?? 0, 'NGN') },
    { icon: TrendingUp, label: 'Tickets sold', value: (summary?.tickets_sold ?? 0).toLocaleString() },
    { icon: Users, label: 'Pending applications', value: (summary?.pending_applications ?? 0).toLocaleString() },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-light italic text-obsidian mb-2">Financial flow</h1>
      <p className="text-obsidian/40 text-sm mb-8">Live revenue, conversion, and payout visibility across your events.</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="glass-card p-5">
            <c.icon size={18} className="text-gold-dark mb-3" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40">{c.label}</p>
            <p className="font-display text-3xl italic mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <h2 className="font-display text-xl italic mb-4">Per-event breakdown</h2>
      <div className="space-y-3">
        {finances.map((f) => (
          <div key={f.event_id} className="glass-card p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-display text-lg italic">{f.title}</p>
              <p className="text-xs text-obsidian/50 mt-1">
                {f.tickets_sold} sold · {f.tickets_checked_in} checked in · {f.orders_count} orders
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl italic text-gold-dark">{formatMoney(f.gross_revenue, f.currency)}</p>
              <p className="text-[10px] text-obsidian/40 uppercase tracking-wider">Avg {formatMoney(f.avg_order_value, f.currency)}</p>
            </div>
            <Link href={`/admin/events/${f.event_id}`} className="text-gold-dark text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
              Manage <ArrowRight size={12} />
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs text-obsidian/40">Co-host split payouts and payment-provider integration coming next.</p>
    </div>
  );
}
