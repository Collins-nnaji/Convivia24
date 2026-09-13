'use client';

import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { formatNgn } from '@/lib/drinks/catalog';
import type { AdminSummary } from './types';

/**
 * The landing view: what needs a hand today, each tile jumping to the tab that handles it.
 * Nothing here is editable — it is the desk's to-do list, not another table.
 */
export default function OverviewDesk({
  summary,
  onGo,
}: {
  summary: AdminSummary;
  onGo: (tab: string) => void;
}) {
  const queue: { label: string; value: number | string; tab: string; hint: string; hot: boolean }[] = [
    {
      label: 'Orders to fulfil',
      value: summary.ordersToFulfil,
      tab: 'orders',
      hint: 'Paid and not yet delivered',
      hot: summary.ordersToFulfil > 0,
    },
    {
      label: 'Awaiting supplier cost',
      value: summary.ordersUnsourced,
      tab: 'sourcing',
      hint: 'Live orders with no margin recorded',
      hot: summary.ordersUnsourced > 0,
    },
    {
      label: 'Low stock',
      value: summary.lowStock,
      tab: 'drinks',
      hint: 'Listed SKUs at or under their threshold',
      hot: summary.lowStock > 0,
    },
    {
      label: 'Prizes to hand over',
      value: summary.prizesUnclaimed,
      tab: 'trivia',
      hint: 'Trivia winners not yet marked claimed',
      hot: summary.prizesUnclaimed > 0,
    },
    {
      label: 'New brand enquiries',
      value: summary.brandEnquiriesNew,
      tab: 'referrals',
      hint: `${summary.partnersPending} partner application${summary.partnersPending === 1 ? '' : 's'} pending`,
      hot: summary.brandEnquiriesNew > 0 || summary.partnersPending > 0,
    },
    {
      label: 'Supplier changes (24h)',
      value: summary.supplierChanges24h,
      tab: 'suppliers',
      hint: 'Stock, prices and orders edited from supplier portals',
      hot: false,
    },
    {
      label: 'Commissions owed',
      value: formatNgn(summary.commissionsOwedNgn),
      tab: 'referrals',
      hint: 'Approved and not yet paid out',
      hot: summary.commissionsOwedNgn > 0,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-px overflow-hidden rounded-2xl border border-obsidian/10 bg-obsidian/10 sm:grid-cols-2">
        <Stat label="Orders today">{summary.todayOrders}</Stat>
        <Stat label="Net revenue today">{formatNgn(summary.todayRevenueNgn)}</Stat>
      </section>

      <section>
        <h2 className="mb-3 text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/40">Needs a hand</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {queue.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => onGo(q.tab)}
              className={`group flex items-start justify-between gap-3 rounded-2xl border p-4 text-left transition-colors ${
                q.hot ? 'border-ember/30 bg-white hover:border-ember' : 'border-obsidian/10 bg-white/60 hover:border-obsidian/25'
              }`}
            >
              <span className="min-w-0">
                <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/45">{q.label}</span>
                <span className={`mt-1 block text-2xl font-bold tabular-nums ${q.hot ? 'text-ember' : 'text-obsidian/40'}`}>
                  {q.value}
                </span>
                <span className="mt-1 block text-xs text-obsidian/45">{q.hint}</span>
              </span>
              <ArrowRight size={16} className="mt-1 shrink-0 text-obsidian/25 transition-transform group-hover:translate-x-0.5 group-hover:text-ember" />
            </button>
          ))}
        </div>
      </section>

      <p className="text-[11px] text-obsidian/40">
        Image upload {summary.blobConfigured ? 'ready' : 'not configured'} · AI copy {summary.aiConfigured ? 'ready' : 'off'}
      </p>
    </div>
  );
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="bg-white p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/40">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-obsidian">{children}</p>
    </div>
  );
}
