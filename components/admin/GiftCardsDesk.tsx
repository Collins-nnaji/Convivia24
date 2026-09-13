'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { formatNgn } from '@/lib/drinks/catalog';
import { useDialogs } from './ui/DialogProvider';
import { AdminInput } from './ui/Fields';
import { formatWhen, readError } from './types';

type GiftCard = {
  id: string;
  code: string;
  valueNgn: number;
  status: 'active' | 'redeemed' | 'void';
  issuedBy: string;
  note: string | null;
  redeemedOrderId: string | null;
  createdAt: string;
};

const STATUS_TONE: Record<GiftCard['status'], string> = {
  active: 'bg-emerald-50 text-emerald-700',
  redeemed: 'bg-paper text-obsidian/50',
  void: 'bg-red-50 text-red-600 line-through',
};

export default function GiftCardsDesk({ onChanged }: { onChanged?: () => void }) {
  const { confirm, notify } = useDialogs();
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [error, setError] = useState('');
  const [issuing, setIssuing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/gift-cards');
    if (!res.ok) {
      setError(await readError(res, 'Could not load gift cards.'));
      return;
    }
    const data = await res.json();
    setCards(data.cards || []);
    setLoaded(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function issue(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setError('');
    setIssuing(true);
    const fd = new FormData(form);
    const res = await fetch('/api/admin/gift-cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valueNgn: Number(fd.get('valueNgn')), note: String(fd.get('note') || '') }),
    });
    setIssuing(false);
    if (!res.ok) {
      setError(await readError(res, 'Could not issue gift card.'));
      return;
    }
    const data = await res.json();
    setCards((rows) => [data.card, ...rows]);
    notify(`Issued ${data.card.code}`);
    form.reset();
    onChanged?.();
  }

  async function voidCard(card: GiftCard) {
    const ok = await confirm({
      title: 'Void this gift card?',
      message: (
        <>
          <code className="text-xs">{card.code}</code> stops working immediately and its {formatNgn(card.valueNgn)} is
          lost. The row stays for the record.
        </>
      ),
      confirmLabel: 'Void card',
      tone: 'danger',
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/gift-cards?id=${encodeURIComponent(card.id)}`, { method: 'DELETE' });
    if (!res.ok) {
      setError(await readError(res, 'Could not void gift card.'));
      return;
    }
    setCards((rows) => rows.map((r) => (r.id === card.id ? { ...r, status: 'void' } : r)));
    onChanged?.();
  }

  const active = cards.filter((c) => c.status === 'active');
  const outstandingNgn = active.reduce((n, c) => n + c.valueNgn, 0);

  return (
    <>
      {error && <p className="mb-6 text-sm text-ember">{error}</p>}

      <form onSubmit={issue} className="mb-10 space-y-4 bg-white p-6 shadow-[0_12px_40px_-18px_rgba(10,10,10,0.28)] sm:p-8">
        <h2 className="font-bold">Issue a gift card</h2>
        <p className="text-sm text-obsidian/50">
          Generates a real, single-use code backed by the database — a customer applies it at checkout to take the
          value straight off their order total.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminInput name="valueNgn" label="Value (NGN)" type="number" min={1} required />
          <AdminInput name="note" label="Note (internal)" placeholder="e.g. goodwill credit, order #1234" />
        </div>
        <button
          type="submit"
          disabled={issuing}
          className="btn-brand px-6 py-3 text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-60"
        >
          {issuing ? 'Issuing…' : 'Issue gift card'}
        </button>
      </form>

      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-bold">Issued codes</h2>
        <p className="text-xs text-obsidian/45">
          {active.length} active · {formatNgn(outstandingNgn)} outstanding
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border border-obsidian/8 bg-white text-sm">
          <thead>
            <tr className="border-b border-obsidian/8 text-left text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/40">
              <th className="p-3">Code</th>
              <th className="p-3">Value</th>
              <th className="p-3">Status</th>
              <th className="p-3">Note</th>
              <th className="p-3">Issued</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {cards.map((c) => (
              <tr key={c.id} className="border-b border-obsidian/6">
                <td className="p-3 font-mono text-xs">{c.code}</td>
                <td className="p-3">{formatNgn(c.valueNgn)}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${STATUS_TONE[c.status]}`}>
                    {c.status}
                  </span>
                </td>
                <td className="p-3 text-obsidian/50">
                  {c.note || '—'}
                  {c.redeemedOrderId && (
                    <span className="block font-mono text-[10px] text-obsidian/35">
                      order {c.redeemedOrderId.slice(0, 8).toUpperCase()}
                    </span>
                  )}
                </td>
                <td className="p-3 text-xs text-obsidian/40">{formatWhen(c.createdAt)}</td>
                <td className="p-3">
                  {c.status === 'active' && (
                    <button
                      type="button"
                      onClick={() => voidCard(c)}
                      className="text-[10px] font-black uppercase text-ember hover:text-ember/80"
                    >
                      Void
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loaded && cards.length === 0 && <p className="p-3 text-sm text-obsidian/45">No gift cards issued yet.</p>}
      </div>
    </>
  );
}
