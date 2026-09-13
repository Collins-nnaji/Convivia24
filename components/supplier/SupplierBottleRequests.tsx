'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { CATEGORIES, CATEGORY_LABELS, formatNgn } from '@/lib/drinks/catalog';
import { useDialogs } from '@/components/admin/ui/DialogProvider';
import { AdminInput, AdminSelect, AdminTextArea } from '@/components/admin/ui/Fields';
import { readError } from './types';

type Req = { id: string; name: string; brand: string | null; category: string | null; volume: string | null; costNgn: number | null; onHand: number; status: 'pending' | 'approved' | 'declined'; decisionNote: string | null; createdSlug: string | null; createdAt: string };

const EMPTY = { name: '', brand: '', category: '', volume: '', abv: '', costNgn: '', onHand: '', note: '' };
const TONE = { pending: 'bg-amber-50 text-amber-700', approved: 'bg-emerald-50 text-emerald-700', declined: 'bg-red-50 text-red-600' } as const;

/** "We stock this, you don't list it." The desk decides; the supplier sees the answer here. */
export default function SupplierBottleRequests({ base, onApproved }: { base: string; onApproved: () => Promise<unknown> }) {
  const { notify } = useDialogs();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [requests, setRequests] = useState<Req[]>([]);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof typeof EMPTY>(k: K, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    const res = await fetch(`${base}/requests`);
    if (res.ok) setRequests((await res.json()).requests || []);
  }, [base]);
  useEffect(() => {
    load();
  }, [load]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch(`${base}/requests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) {
        notify(await readError(res, 'Could not send.'), 'error');
        return;
      }
      notify('Sent to the Convivia24 desk — you will see the decision here.');
      setForm(EMPTY);
      setOpen(false);
      await load();
    } finally {
      setBusy(false);
    }
  }

  const pending = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="mt-6 rounded-2xl border border-obsidian/10 bg-white">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-ember/10 text-ember"><Plus size={16} /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-obsidian">Suggest a bottle we don&apos;t list yet</span>
          <span className="block text-xs text-obsidian/50">{pending > 0 ? `${pending} waiting for the desk` : 'Tell us what you stock; the desk adds it to the shop.'}</span>
        </span>
      </button>
      {open && (
        <form onSubmit={submit} className="space-y-3 border-t border-obsidian/8 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminInput label="Bottle name" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Martell Blue Swift 70cl" />
            <AdminInput label="Brand" value={form.brand} onChange={(e) => set('brand', e.target.value)} />
            <AdminSelect label="Category" value={form.category} onChange={(v) => set('category', v)} placeholder="Choose…" options={CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))} />
            <AdminInput label="Size" value={form.volume} onChange={(e) => set('volume', e.target.value)} placeholder="70CL" />
            <AdminInput label="Your price per bottle (₦)" type="number" min={0} value={form.costNgn} onChange={(e) => set('costNgn', e.target.value)} />
            <AdminInput label="Bottles you hold" type="number" min={0} value={form.onHand} onChange={(e) => set('onHand', e.target.value)} />
          </div>
          <AdminTextArea label="Anything else" rows={2} value={form.note} onChange={(e) => set('note', e.target.value)} className="min-h-[52px]" />
          <button type="submit" disabled={busy || !form.name.trim()} className="btn-brand rounded-lg px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] disabled:opacity-40">
            {busy ? 'Sending…' : 'Send to the desk'}
          </button>
        </form>
      )}
      {requests.length > 0 && (
        <ul className="divide-y divide-obsidian/6 border-t border-obsidian/8">
          {requests.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${TONE[r.status]}`}>{r.status}</span>
              <span className="font-semibold">{r.name}</span>
              <span className="text-xs text-obsidian/45">{[r.brand, r.volume, r.costNgn != null ? formatNgn(r.costNgn) : null].filter(Boolean).join(' · ')}</span>
              {r.decisionNote && <span className="text-xs text-obsidian/55">— {r.decisionNote}</span>}
              {r.status === 'approved' && (
                <button type="button" onClick={() => onApproved()} className="ml-auto text-[11px] font-bold text-ember">Now on your shelf →</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
