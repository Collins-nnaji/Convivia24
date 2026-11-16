'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { formatNgn } from '@/lib/drinks/catalog';
import { useDialogs } from './ui/DialogProvider';
import { PlusMinus, deskField } from './ui/DeskContent';
import { readError } from './types';

type Request = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  supplierId: string | null;
  supplierName: string | null;
  qty: number;
  costNgn: number | null;
  expectedAt: string | null;
  note: string | null;
  status: 'requested' | 'received' | 'cancelled';
  createdAt: string;
  receivedAt: string | null;
  receivedQty: number | null;
};

const field = `${deskField} h-9 py-1.5`;
const btn = 'h-8 rounded-md border border-obsidian/20 bg-white px-2.5 text-xs font-semibold text-obsidian/80 hover:border-obsidian disabled:opacity-40';

/**
 * Restock requests on the Drinks page: ask a supplier for bottles, see what is on its way, and
 * receive it into stock in one click. `prefill` opens the form for a bottle (from its row).
 */
export default function RestockPanel({
  bottles,
  suppliers,
  prefill,
  onReceived,
}: {
  bottles: { slug: string; name: string }[];
  suppliers: { id: string; name: string }[];
  prefill: { slug: string; nonce: number } | null;
  onReceived: () => void;
}) {
  const { notify } = useDialogs();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Request[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [slug, setSlug] = useState('');
  const [receiveQty, setReceiveQty] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/restock', { cache: 'no-store' });
    if (!res.ok) return setError(await readError(res, 'Could not load restock requests.'));
    setError('');
    setRows((await res.json()).requests || []);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (!prefill) return;
    setSlug(prefill.slug);
    setOpen(true);
    requestAnimationFrame(() => document.getElementById('restock-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, [prefill]);

  async function post(body: Record<string, unknown>, done: string) {
    const res = await fetch('/api/admin/restock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) {
      setError(await readError(res, 'Could not save.'));
      return false;
    }
    setError('');
    notify(done);
    await load();
    return true;
  }

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setBusy('create');
    const name = bottles.find((b) => b.slug === values.slug)?.name || 'bottle';
    if (await post({ action: 'create', ...values }, `Restock requested: ${values.qty} × ${name}.`)) {
      form.reset();
      setSlug('');
    }
    setBusy('');
  }

  const openRows = rows.filter((r) => r.status === 'requested');
  const recent = rows.filter((r) => r.status !== 'requested').slice(0, 8);
  const overdue = (r: Request) => r.expectedAt != null && r.expectedAt < new Date().toISOString().slice(0, 10);

  return (
    <section id="restock-panel" className="overflow-hidden rounded-lg border border-obsidian/15 bg-white">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-obsidian/[0.02]">
        <PlusMinus open={open} />
        <span className="flex-1 text-sm font-bold">Restock requests</span>
        {openRows.length > 0 && (
          <span className="rounded bg-ember px-1.5 py-px text-[11px] font-bold text-white">
            {openRows.length} on the way{openRows.some(overdue) ? ' · overdue' : ''}
          </span>
        )}
      </button>

      {open && (
        <div className="space-y-3 border-t border-obsidian/10 p-3">
          {error && <p role="alert" className="rounded-md border border-ember/30 bg-ember/5 px-3 py-2 text-sm text-ember">{error}</p>}

          <form onSubmit={create} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
            <label className="text-[11px] font-semibold text-obsidian/70 lg:col-span-2">
              Bottle
              <select name="slug" required value={slug} onChange={(e) => setSlug(e.target.value)} className={`${field} mt-1`}>
                <option value="">Choose…</option>
                {bottles.map((b) => (
                  <option key={b.slug} value={b.slug}>{b.name}</option>
                ))}
              </select>
            </label>
            <label className="text-[11px] font-semibold text-obsidian/70">
              From
              <select name="supplierId" defaultValue={suppliers[0]?.id || ''} className={`${field} mt-1`}>
                <option value="">Any supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>
            <label className="text-[11px] font-semibold text-obsidian/70">
              Quantity
              <input name="qty" type="number" min={1} required inputMode="numeric" className={`${field} mt-1 tabular-nums`} />
            </label>
            <label className="text-[11px] font-semibold text-obsidian/70">
              Cost each (₦)
              <input name="costNgn" type="number" min={0} inputMode="numeric" placeholder="Optional" className={`${field} mt-1 tabular-nums`} />
            </label>
            <label className="text-[11px] font-semibold text-obsidian/70">
              Expected
              <input name="expectedAt" type="date" className={`${field} mt-1`} />
            </label>
            <div className="flex items-end">
              <button type="submit" disabled={busy === 'create'} className="btn-brand h-9 w-full rounded-md px-3 text-xs font-bold disabled:opacity-40">
                Request
              </button>
            </div>
            <input name="note" maxLength={300} placeholder="Note to self — who you spoke to, the agreed price…" className={`${field} sm:col-span-2 lg:col-span-7`} />
          </form>

          {openRows.length > 0 && (
            <div className="overflow-x-auto rounded-md border border-obsidian/15">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-obsidian/[0.04] text-left text-[11px] font-semibold uppercase tracking-wider text-obsidian/65">
                  <tr>
                    <th className="px-3 py-1.5">Bottle</th>
                    <th className="px-2 py-1.5">Supplier</th>
                    <th className="px-2 py-1.5 text-right">Qty</th>
                    <th className="px-2 py-1.5">Expected</th>
                    <th className="px-3 py-1.5 text-right" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {openRows.map((r) => (
                    <tr key={r.id} className="border-t border-obsidian/10">
                      <td className="px-3 py-1.5">
                        <div className="flex items-center gap-2">
                          <span className="grid h-10 w-8 shrink-0 place-items-center overflow-hidden rounded bg-shell">
                            {r.imageUrl && <Image src={r.imageUrl} alt="" width={32} height={40} className="h-10 w-8 object-contain" />}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-semibold">{r.name}</span>
                            {r.note && <span className="block truncate text-[11px] text-obsidian/60">{r.note}</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-1.5 text-obsidian/75">{r.supplierName || 'Any'}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">
                        {r.qty}
                        {r.costNgn != null && <span className="block text-[11px] text-obsidian/60">{formatNgn(r.costNgn)} each</span>}
                      </td>
                      <td className={`px-2 py-1.5 text-xs ${overdue(r) ? 'font-bold text-red-700' : 'text-obsidian/70'}`}>
                        {r.expectedAt ? `${r.expectedAt}${overdue(r) ? ' · overdue' : ''}` : '—'}
                      </td>
                      <td className="px-3 py-1.5 text-right">
                        <span className="inline-flex items-center gap-1.5">
                          <input
                            type="number"
                            min={1}
                            aria-label="Quantity received"
                            title="How many arrived"
                            value={receiveQty[r.id] ?? String(r.qty)}
                            onChange={(e) => setReceiveQty((q) => ({ ...q, [r.id]: e.target.value }))}
                            className={`${deskField} h-8 w-16 py-1 text-right text-xs tabular-nums`}
                          />
                          <button
                            type="button"
                            disabled={busy === r.id}
                            onClick={async () => {
                              setBusy(r.id);
                              const qty = receiveQty[r.id] ?? String(r.qty);
                              if (await post({ action: 'receive', id: r.id, qty }, `${qty} × ${r.name} added to stock.`)) onReceived();
                              setBusy('');
                            }}
                            className="btn-brand h-8 rounded-md px-3 text-xs font-bold disabled:opacity-40"
                          >
                            Received
                          </button>
                          <button type="button" disabled={busy === r.id} onClick={() => void post({ action: 'cancel', id: r.id }, 'Request cancelled.')} className={btn}>
                            Cancel
                          </button>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {openRows.length === 0 && <p className="text-sm text-obsidian/60">Nothing on order.</p>}

          {recent.length > 0 && (
            <p className="text-[11px] text-obsidian/60">
              Recently:{' '}
              {recent
                .map((r) => `${r.status === 'received' ? `✓ ${r.receivedQty}` : '✕'} ${r.name}`)
                .join(' · ')}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
