'use client';
import { useCallback, useEffect, useState } from 'react';
import { formatNgn } from '@/lib/drinks/catalog';
type Row = { id: string; venue_name?: string; email?: string; approval_status?: string; status?: string; total_ngn?: number; reward_name?: string; code?: string; points_spent?: number; tracking_reference?: string };
export default function OperationsDesk() {
  const [data, setData] = useState<{ outlets: Row[]; wholesale: Row[]; rewards: Row[] }>({ outlets: [], wholesale: [], rewards: [] });
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [reference, setReference] = useState('');
  const load = useCallback(async () => { try { const res = await fetch('/api/admin/operations'); const payload = await res.json(); if (!res.ok) throw new Error(payload.error); setData(payload); } catch (err) { setError(err instanceof Error ? err.message : 'Could not load operations.'); } }, []);
  useEffect(() => { void load(); }, [load]);
  async function update(kind: string, id: string, status: string, amountNgn?: number) {
    setBusy(true); setError('');
    try { const res = await fetch('/api/admin/operations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, id, status, reference, amountNgn, note: reference }) }); const payload = await res.json(); if (!res.ok) throw new Error(payload.error); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not update.'); } finally { setBusy(false); }
  }
  const button = (kind: string, row: Row, status: string, label: string) => <button key={status} disabled={busy} onClick={() => update(kind, row.id, status)} className="rounded border px-3 py-1 text-sm disabled:opacity-40">{label}</button>;
  return <div className="space-y-6"><p role="status" className="text-ember">{error}</p>
    <label className="block text-sm">Payment / dispatch reference or fulfillment note<input className="ml-3 rounded border px-3 py-2" value={reference} onChange={e => setReference(e.target.value)} /></label>
    <section className="bg-white rounded-xl p-5 space-y-3"><h3 className="font-bold text-lg">Partner approvals</h3>{data.outlets.length === 0 && <p>No outlets yet.</p>}{data.outlets.map(row => <div key={row.id} className="border-t pt-3 flex flex-wrap gap-3 items-center"><span className="flex-1">{row.venue_name} · {row.email} · {row.approval_status}</span>{button('outlet', row, 'approved', 'Approve')}{button('outlet', row, 'suspended', 'Suspend')}</div>)}</section>
    <section className="bg-white rounded-xl p-5 space-y-3"><h3 className="font-bold text-lg">Wholesale fulfillment</h3><p className="text-sm text-obsidian/60">Confirm payment against bank records, pack, then record dispatch. Partners confirm receipt in their portal. Record a full refund only after returning funds through the bank; returned goods require a physical stock count.</p>{data.wholesale.length === 0 && <p>No wholesale orders yet.</p>}{data.wholesale.map(row => <div key={row.id} className="border-t pt-3 flex flex-wrap gap-3 items-center"><span className="flex-1">{row.venue_name} · {formatNgn(Number(row.total_ngn))} · {row.status}</span>{row.status === 'awaiting_payment' && <>{button('wholesale', row, 'paid', 'Confirm payment')}{button('wholesale', row, 'cancelled', 'Cancel')}</>}{row.status === 'paid' && button('wholesale', row, 'packed', 'Packed')}{row.status === 'packed' && button('wholesale', row, 'dispatched', 'Dispatch')}{['paid','packed','dispatched','delivered'].includes(row.status || '') && <button disabled={busy || !reference.trim()} className="rounded border px-3 py-1 text-sm" onClick={() => update('wholesale', row.id, 'refunded', Number(row.total_ngn))}>Confirm full bank refund</button>}</div>)}</section>
    <section className="bg-white rounded-xl p-5 space-y-3"><h3 className="font-bold text-lg">Reward fulfillment</h3>{data.rewards.length === 0 && <p>No rewards to fulfill.</p>}{data.rewards.map(row => <div key={row.id} className="border-t pt-3 flex flex-wrap gap-3 items-center"><span className="flex-1">{row.reward_name} · {row.code} · {row.email} · {row.status}</span>{row.status === 'issued' && <>{button('reward', row, 'fulfilled', 'Confirm fulfilled')}{button('reward', row, 'cancelled', 'Cancel and return points')}</>}</div>)}</section>
  </div>;
}
