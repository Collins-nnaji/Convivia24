'use client';

import { ArrowRight } from 'lucide-react';
import { formatNgn } from '@/lib/drinks/catalog';
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/commerce/status';
import { describeAudit } from '@/lib/suppliers/audit';
import { OPEN_STATUSES, type PortalData } from './types';

export default function SupplierOverview({ data, onGo }: { data: PortalData; onGo: (tab: string) => void }) {
  const open = data.orders.filter((o) => OPEN_STATUSES.has(o.status));
  const toPack = open.filter((o) => o.status === 'paid' || o.status === 'processing');
  const onRoad = open.filter((o) => o.status === 'out_for_delivery');
  const listed = data.shelf.filter((r) => r.onHand != null);
  const low = listed.filter((r) => r.available <= 2);
  const unquoted = listed.filter((r) => r.costNgn == null);
  const bottlesOnShelf = listed.reduce((n, r) => n + (r.onHand ?? 0), 0);

  const tiles = [
    { label: 'Orders to pack', value: toPack.length, hint: 'Paid and waiting on you', tab: 'orders', hot: toPack.length > 0 },
    { label: 'Out for delivery', value: onRoad.length, hint: 'Mark delivered once handed over', tab: 'orders', hot: false },
    { label: 'Running low', value: low.length, hint: '2 or fewer free bottles', tab: 'stock', hot: low.length > 0 },
    { label: 'Missing a price', value: unquoted.length, hint: 'Unquoted SKUs are routed last', tab: 'stock', hot: unquoted.length > 0 },
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-px overflow-hidden rounded-2xl border border-obsidian/10 bg-obsidian/10 sm:grid-cols-2">
        <div className="bg-white p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/40">SKUs you stock</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-obsidian">{listed.length}</p>
        </div>
        <div className="bg-white p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/40">Bottles on your shelf</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-obsidian">{bottlesOnShelf}</p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/40">Needs a hand</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {tiles.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => onGo(t.tab)}
              className={`group flex items-start justify-between gap-3 rounded-2xl border p-4 text-left transition-colors ${
                t.hot ? 'border-ember/30 bg-white hover:border-ember' : 'border-obsidian/10 bg-white/60 hover:border-obsidian/25'
              }`}
            >
              <span className="min-w-0">
                <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/45">{t.label}</span>
                <span className={`mt-1 block text-2xl font-bold tabular-nums ${t.hot ? 'text-ember' : 'text-obsidian/40'}`}>{t.value}</span>
                <span className="mt-1 block text-xs text-obsidian/45">{t.hint}</span>
              </span>
              <ArrowRight size={16} className="mt-1 shrink-0 text-obsidian/25 transition-transform group-hover:translate-x-0.5 group-hover:text-ember" />
            </button>
          ))}
        </div>
      </section>

      {toPack.length > 0 && (
        <section>
          <h2 className="mb-3 text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/40">Next up</h2>
          <ul className="divide-y divide-obsidian/8 rounded-2xl border border-obsidian/10 bg-white">
            {toPack.slice(0, 5).map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                <span className="font-mono text-xs text-obsidian/50">{o.id.slice(0, 8).toUpperCase()}</span>
                <span className="font-semibold">{o.fullName}</span>
                <span className="text-obsidian/50">{o.area || o.city || ''}</span>
                <span className="ml-auto text-xs text-obsidian/45">
                  {o.items.map((i) => `${i.name} × ${i.qty}`).join(' · ')}
                </span>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700 ring-1 ring-amber-200">
                  {ORDER_STATUS_LABELS[o.status as OrderStatus]}
                </span>
                {o.costNgn != null && <span className="text-xs tabular-nums text-obsidian/45">{formatNgn(o.costNgn)}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.activity.length > 0 && (
        <section>
          <h2 className="mb-3 text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/40">Recent activity</h2>
          <ul className="space-y-1.5 text-sm text-obsidian/70">
            {data.activity.slice(0, 6).map((e) => (
              <li key={e.id} className="flex gap-3">
                <span className="w-24 shrink-0 text-xs text-obsidian/40">
                  {new Date(e.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                </span>
                <span>
                  <span className="font-semibold">{e.actor === 'admin' ? 'Convivia24' : e.actor === 'system' ? 'System' : 'You'}</span>{' '}
                  {describeAudit(e)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
