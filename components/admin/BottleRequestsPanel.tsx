'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatNgn } from '@/lib/drinks/catalog';
import { useDialogs } from './ui/DialogProvider';
import { AdminInput } from './ui/Fields';
import { readError, formatWhen } from './types';

type Req = {
  id: string;
  supplierName: string;
  name: string;
  brand: string | null;
  category: string | null;
  volume: string | null;
  abv: number | null;
  costNgn: number | null;
  onHand: number;
  note: string | null;
  status: 'pending' | 'approved' | 'declined';
  decisionNote: string | null;
  createdSlug: string | null;
  createdAt: string;
};

/** Bottles suppliers want to stock that the shop does not list. Approve = new SKU at the price you set. */
export default function BottleRequestsPanel({ onChanged }: { onChanged?: () => void }) {
  const { notify } = useDialogs();
  const [requests, setRequests] = useState<Req[]>([]);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/suppliers/requests');
    if (res.ok) setRequests((await res.json()).requests || []);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function decide(r: Req, action: 'approve' | 'decline') {
    setBusy(r.id);
    try {
      const res = await fetch('/api/admin/suppliers/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: r.id, action, priceNgn: Number(prices[r.id]), note: notes[r.id] || '' }),
      });
      if (!res.ok) {
        notify(await readError(res, 'Could not update the request.'), 'error');
        return;
      }
      notify(action === 'approve' ? `${r.name} is now in the shop.` : `${r.name} declined.`);
      await load();
      onChanged?.();
    } finally {
      setBusy('');
    }
  }

  const pending = requests.filter((r) => r.status === 'pending');
  const decided = requests.filter((r) => r.status !== 'pending');

  return (
    <div className="space-y-4">
      {pending.length === 0 ? (
        <p className="text-sm text-obsidian/45">No bottle requests waiting.</p>
      ) : (
        <ul className="space-y-3">
          {pending.map((r) => {
            const suggestedMargin = r.costNgn != null && Number(prices[r.id]) > 0 ? Math.round(((Number(prices[r.id]) - r.costNgn) / Number(prices[r.id])) * 100) : null;
            return (
              <li key={r.id} className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-bold text-obsidian">
                    {r.name} <span className="font-normal text-obsidian/50">· {[r.brand, r.category, r.volume, r.abv != null ? `${r.abv}%` : null].filter(Boolean).join(' · ')}</span>
                  </p>
                  <span className="text-xs text-obsidian/45">{r.supplierName} · {formatWhen(r.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm text-obsidian/60">
                  They hold <strong>{r.onHand}</strong>{r.costNgn != null ? <> and quote <strong>{formatNgn(r.costNgn)}</strong> per bottle</> : ' (no quote given)'}.
                  {r.note ? ` “${r.note}”` : ''}
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)_auto] sm:items-end">
                  <AdminInput label="Retail price (₦)" hint={suggestedMargin != null ? `${suggestedMargin}% margin` : undefined} type="number" min={1} value={prices[r.id] || ''} onChange={(e) => setPrices((p) => ({ ...p, [r.id]: e.target.value }))} />
                  <AdminInput label="Note to supplier" hint="optional" value={notes[r.id] || ''} onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))} />
                  <div className="flex gap-2">
                    <button type="button" disabled={busy === r.id || !(Number(prices[r.id]) > 0)} onClick={() => decide(r, 'approve')} className="btn-brand rounded-lg px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-40">
                      List it
                    </button>
                    <button type="button" disabled={busy === r.id} onClick={() => decide(r, 'decline')} className="rounded-lg border border-obsidian/15 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/60 hover:border-ember hover:text-ember disabled:opacity-40">
                      Decline
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {decided.length > 0 && (
        <ul className="divide-y divide-obsidian/6 rounded-xl border border-obsidian/10 bg-white text-sm">
          {decided.slice(0, 20).map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-3 px-3 py-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${r.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{r.status}</span>
              <span className="font-semibold">{r.name}</span>
              <span className="text-xs text-obsidian/45">{r.supplierName}{r.createdSlug ? ` · ${r.createdSlug}` : ''}{r.decisionNote ? ` · ${r.decisionNote}` : ''}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
