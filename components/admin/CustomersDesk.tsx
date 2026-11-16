'use client';

import { useCallback, useEffect, useState } from 'react';
import { Mail, Phone, Search } from 'lucide-react';
import { formatNgn } from '@/lib/drinks/catalog';
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/commerce/status';
import { PlusMinus, deskField } from './ui/DeskContent';
import { readError } from './types';

type Customer = {
  email: string;
  name: string | null;
  phone: string | null;
  area: string | null;
  orders: number;
  spendNgn: number;
  unpaid: number;
  points: number;
  openTickets: number;
  firstAt: string;
  lastAt: string;
};
type History = {
  orders: { id: string; status: string; totalNgn: number; refundedNgn: number; createdAt: string; area: string; items: { name: string; qty: number }[] }[];
  tickets: { id: string; category: string; status: string; message: string; createdAt: string }[];
};

const day = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/** Everyone who has ordered, with spend, frequency, points and open support — one row each. */
export default function CustomersDesk({ initialQuery = '', onOpenOrder }: { initialQuery?: string; onOpenOrder: (orderId: string) => void }) {
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<'recent' | 'spend'>('recent');
  const [rows, setRows] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [history, setHistory] = useState<Record<string, History>>({});

  useEffect(() => setQuery(initialQuery), [initialQuery]);

  const load = useCallback(async (q: string, s: string) => {
    setLoading(true);
    const res = await fetch(`/api/admin/customers?${new URLSearchParams({ q, sort: s })}`, { cache: 'no-store' });
    setLoading(false);
    if (!res.ok) return setError(await readError(res, 'Could not load customers.'));
    setError('');
    setRows((await res.json()).customers || []);
  }, []);
  useEffect(() => {
    const t = setTimeout(() => void load(query, sort), 250);
    return () => clearTimeout(t);
  }, [query, sort, load]);

  async function toggle(email: string) {
    if (open === email) return setOpen(null);
    setOpen(email);
    if (!history[email]) {
      const res = await fetch(`/api/admin/customers?email=${encodeURIComponent(email)}`, { cache: 'no-store' });
      if (res.ok) {
        const data = (await res.json()) as History;
        setHistory((h) => ({ ...h, [email]: data }));
      }
    }
  }

  const totalSpend = rows.reduce((n, c) => n + c.spendNgn, 0);
  const repeat = rows.filter((c) => c.orders > 1).length;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-obsidian/15 bg-obsidian/15 md:grid-cols-4">
        {[
          ['Customers', rows.length],
          ['Repeat customers', `${repeat}${rows.length ? ` · ${Math.round((repeat / rows.length) * 100)}%` : ''}`],
          ['Total spend', formatNgn(totalSpend)],
          ['Avg per customer', formatNgn(rows.length ? Math.round(totalSpend / rows.length) : 0)],
        ].map(([l, v]) => (
          <div key={String(l)} className="bg-white px-3 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-obsidian/60">{l}</p>
            <p className="mt-0.5 text-xl font-bold tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-obsidian/50" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, email or phone" className={`${deskField} h-9 w-64 py-1.5 pl-8`} />
        </label>
        <div className="inline-flex overflow-hidden rounded-md border border-obsidian/20 text-sm font-semibold">
          {(['recent', 'spend'] as const).map((s) => (
            <button key={s} type="button" onClick={() => setSort(s)} className={`h-9 px-3 ${sort === s ? 'bg-obsidian text-white' : 'bg-white text-obsidian/75'}`}>
              {s === 'recent' ? 'Most recent' : 'Top spenders'}
            </button>
          ))}
        </div>
      </div>
      {error && <p role="alert" className="rounded-md border border-ember/30 bg-ember/5 px-3 py-2 text-sm text-ember">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-obsidian/15">
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead className="bg-obsidian/[0.04] text-left text-[11px] font-semibold uppercase tracking-wider text-obsidian/65">
            <tr>
              <th className="w-10 py-2 pl-3" aria-label="Expand" />
              <th className="px-2 py-2">Customer</th>
              <th className="px-2 py-2">Area</th>
              <th className="px-2 py-2 text-right">Orders</th>
              <th className="px-2 py-2 text-right">Spent</th>
              <th className="px-2 py-2 text-right">Points</th>
              <th className="px-2 py-2">Last order</th>
              <th className="py-2 pl-2 pr-3" aria-label="Contact" />
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const isOpen = open === c.email;
              const h = history[c.email];
              return [
                <tr key={c.email} className={`border-t border-obsidian/10 ${isOpen ? 'bg-shell' : 'bg-white hover:bg-obsidian/[0.02]'}`}>
                  <td className="py-2 pl-3">
                    <button type="button" onClick={() => void toggle(c.email)} aria-expanded={isOpen} aria-label={isOpen ? 'Hide history' : 'Show history'}>
                      <PlusMinus open={isOpen} />
                    </button>
                  </td>
                  <td className="max-w-[260px] px-2 py-2">
                    <p className="truncate font-semibold">{c.name || '—'}</p>
                    <p className="truncate text-xs text-obsidian/60">{c.email}</p>
                  </td>
                  <td className="px-2 py-2 text-obsidian/75">{c.area || '—'}</td>
                  <td className="px-2 py-2 text-right tabular-nums">
                    {c.orders}
                    {c.unpaid > 0 && <span className="block text-[11px] text-amber-700">{c.unpaid} unpaid</span>}
                  </td>
                  <td className="px-2 py-2 text-right font-semibold tabular-nums">{formatNgn(c.spendNgn)}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{c.points.toLocaleString()}</td>
                  <td className="px-2 py-2 text-xs text-obsidian/70">
                    {day(c.lastAt)}
                    {c.openTickets > 0 && <span className="ml-1 rounded bg-red-50 px-1.5 py-px font-semibold text-red-700">{c.openTickets} open request{c.openTickets === 1 ? '' : 's'}</span>}
                  </td>
                  <td className="py-2 pl-2 pr-3 text-right">
                    <span className="inline-flex gap-1">
                      {c.phone && (
                        <a href={`tel:${c.phone}`} title={c.phone} className="grid h-8 w-8 place-items-center rounded-md border border-obsidian/20 hover:border-obsidian">
                          <Phone size={14} />
                        </a>
                      )}
                      <a href={`mailto:${c.email}`} title={c.email} className="grid h-8 w-8 place-items-center rounded-md border border-obsidian/20 hover:border-obsidian">
                        <Mail size={14} />
                      </a>
                    </span>
                  </td>
                </tr>,
                isOpen && (
                  <tr key={`${c.email}-h`} className="bg-shell">
                    <td />
                    <td colSpan={7} className="pb-3 pr-3">
                      {!h ? (
                        <p className="text-sm text-obsidian/60">Loading history…</p>
                      ) : (
                        <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
                          <div className="overflow-hidden rounded-md border border-obsidian/15 bg-white">
                            <p className="border-b border-obsidian/10 px-3 py-1.5 text-xs font-bold">Orders since {day(c.firstAt)}</p>
                            <ul className="divide-y divide-obsidian/8 text-sm">
                              {h.orders.map((o) => (
                                <li key={o.id}>
                                  <button type="button" onClick={() => onOpenOrder(o.id)} className="flex w-full items-center gap-3 px-3 py-1.5 text-left hover:bg-obsidian/[0.03]">
                                    <span className="w-20 shrink-0 font-mono text-xs font-bold">#{o.id.slice(0, 8).toUpperCase()}</span>
                                    <span className="w-24 shrink-0 text-xs text-obsidian/60">{day(o.createdAt)}</span>
                                    <span className="min-w-0 flex-1 truncate text-xs text-obsidian/75">{o.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</span>
                                    <span className="w-24 shrink-0 text-xs">{ORDER_STATUS_LABELS[o.status as OrderStatus] ?? o.status}</span>
                                    <span className="w-24 shrink-0 text-right font-semibold tabular-nums">{formatNgn(o.totalNgn - o.refundedNgn)}</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="overflow-hidden rounded-md border border-obsidian/15 bg-white">
                            <p className="border-b border-obsidian/10 px-3 py-1.5 text-xs font-bold">Support requests</p>
                            {h.tickets.length === 0 ? (
                              <p className="px-3 py-2 text-sm text-obsidian/60">None.</p>
                            ) : (
                              <ul className="divide-y divide-obsidian/8 text-sm">
                                {h.tickets.map((t) => (
                                  <li key={t.id} className="px-3 py-1.5">
                                    <p className="text-xs font-semibold">
                                      {t.category} · <span className={t.status === 'resolved' ? 'text-emerald-700' : 'text-red-700'}>{t.status.replace('_', ' ')}</span>
                                    </p>
                                    <p className="truncate text-xs text-obsidian/65">{t.message}</p>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ),
              ];
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="px-4 py-6 text-center text-sm text-obsidian/65">{loading ? 'Loading customers…' : 'No customers match.'}</p>}
      </div>
    </div>
  );
}
