'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Copy, Mail, Search } from 'lucide-react';
import { formatNgn } from '@/lib/drinks/catalog';
import { useDialogs } from './ui/DialogProvider';
import { AdminInput, AdminSelect, AdminTextArea, adminInputClass } from './ui/Fields';
import { formatWhen, readError } from './types';

type GiftCard = {
  id: string;
  code: string;
  valueNgn: number;
  status: 'active' | 'redeemed' | 'void';
  issuedBy: string;
  note: string | null;
  redeemedOrderId: string | null;
  redeemedAt: string | null;
  createdAt: string;
  recipientName: string | null;
  recipientEmail: string | null;
  expiresAt: string | null;
  sentAt: string | null;
  expired: boolean;
};

type Stats = { activeCount: number; activeNgn: number; redeemedCount: number; redeemedNgn: number; voidCount: number; expiredCount: number };

const PRESETS = [5000, 10000, 25000, 50000, 100000];
const EMPTY = { valueNgn: '', recipientName: '', recipientEmail: '', expiresAt: '', note: '', message: '', sendEmail: true };

type View = 'all' | 'active' | 'redeemed' | 'expired' | 'void';

function tone(c: GiftCard): { label: string; cls: string } {
  if (c.status === 'void') return { label: 'void', cls: 'bg-red-50 text-red-600' };
  if (c.status === 'redeemed') return { label: 'redeemed', cls: 'bg-paper text-obsidian/55' };
  if (c.expired) return { label: 'expired', cls: 'bg-amber-50 text-amber-700' };
  return { label: 'active', cls: 'bg-emerald-50 text-emerald-700' };
}

export default function GiftCardsDesk({ onChanged }: { onChanged?: () => void }) {
  const { confirm, notify } = useDialogs();
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [mailOk, setMailOk] = useState(false);
  const [error, setError] = useState('');
  const [issuing, setIssuing] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [view, setView] = useState<View>('all');
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/gift-cards');
    if (!res.ok) {
      setError(await readError(res, 'Could not load gift cards.'));
      return;
    }
    const data = await res.json();
    setCards(data.cards || []);
    setStats(data.stats || null);
    setMailOk(Boolean(data.mailConfigured));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = <K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function issue(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIssuing(true);
    try {
      const res = await fetch('/api/admin/gift-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valueNgn: Number(form.valueNgn),
          note: form.note,
          recipientName: form.recipientName,
          recipientEmail: form.recipientEmail,
          expiresAt: form.expiresAt ? new Date(`${form.expiresAt}T23:59:59`).toISOString() : null,
          sendEmail: form.sendEmail && Boolean(form.recipientEmail),
          message: form.message,
        }),
      });
      if (!res.ok) {
        setError(await readError(res, 'Could not issue gift card.'));
        return;
      }
      const data = await res.json();
      setCards((rows) => [data.card, ...rows]);
      if (data.mail?.sent) notify(`Issued ${data.card.code} and emailed ${data.card.recipientEmail}.`);
      else if (data.mail && !data.mail.sent) notify(`Issued ${data.card.code} — email failed: ${data.mail.error}`, 'error');
      else notify(`Issued ${data.card.code}`);
      setForm(EMPTY);
      await load();
      onChanged?.();
    } finally {
      setIssuing(false);
    }
  }

  async function send(card: GiftCard) {
    setBusyId(card.id);
    try {
      const res = await fetch('/api/admin/gift-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', id: card.id }),
      });
      if (!res.ok) {
        notify(await readError(res, 'Could not send.'), 'error');
        return;
      }
      const data = await res.json();
      setCards((rows) => rows.map((r) => (r.id === card.id ? data.card : r)));
      notify(`Sent ${card.code} to ${card.recipientEmail}.`);
    } finally {
      setBusyId('');
    }
  }

  async function voidCard(card: GiftCard) {
    const ok = await confirm({
      title: 'Void this gift card?',
      message: (
        <>
          <code className="text-xs">{card.code}</code> stops working immediately and its {formatNgn(card.valueNgn)} is lost. The row stays for the record.
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
    await load();
    onChanged?.();
  }

  function copy(code: string) {
    navigator.clipboard?.writeText(code).then(() => notify(`${code} copied.`), () => notify('Could not copy.', 'error'));
  }

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards.filter((c) => {
      if (view === 'active' && !(c.status === 'active' && !c.expired)) return false;
      if (view === 'expired' && !c.expired) return false;
      if (view !== 'all' && view !== 'active' && view !== 'expired' && c.status !== view) return false;
      if (!q) return true;
      return `${c.code} ${c.recipientName ?? ''} ${c.recipientEmail ?? ''} ${c.note ?? ''} ${c.redeemedOrderId ?? ''}`.toLowerCase().includes(q);
    });
  }, [cards, view, query]);

  return (
    <>
      {error && <p className="mb-4 text-sm text-ember">{error}</p>}

      {stats && (
        <div className="mb-6 grid gap-px overflow-hidden rounded-2xl border border-obsidian/10 bg-obsidian/10 sm:grid-cols-4">
          {[
            ['Outstanding', `${formatNgn(stats.activeNgn)}`, `${stats.activeCount} active card${stats.activeCount === 1 ? '' : 's'}`],
            ['Redeemed', `${formatNgn(stats.redeemedNgn)}`, `${stats.redeemedCount} used at checkout`],
            ['Expired', String(stats.expiredCount), 'active but past expiry'],
            ['Voided', String(stats.voidCount), 'cancelled by the desk'],
          ].map(([label, value, hint]) => (
            <div key={label} className="bg-white p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/40">{label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-obsidian">{value}</p>
              <p className="text-[11px] text-obsidian/45">{hint}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={issue} className="mb-8 space-y-4 rounded-2xl border border-obsidian/10 bg-white p-5 sm:p-6">
        <div>
          <h2 className="font-bold">Issue a gift card</h2>
          <p className="text-sm text-obsidian/50">A single-use code backed by the database. Add a recipient to email it straight to them.</p>
        </div>
        <div>
          <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/45">Value</p>
          <div className="flex flex-wrap items-center gap-2">
            {PRESETS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => set('valueNgn', String(v))}
                className={`rounded-full border px-3 py-1.5 text-[12px] font-bold transition-colors ${
                  form.valueNgn === String(v) ? 'border-ember bg-ember text-white' : 'border-obsidian/12 text-obsidian/60 hover:border-ember/40'
                }`}
              >
                {formatNgn(v)}
              </button>
            ))}
            <input
              type="number"
              min={1}
              required
              value={form.valueNgn}
              onChange={(e) => set('valueNgn', e.target.value)}
              placeholder="Other amount"
              className={`${adminInputClass} w-40 py-1.5`}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <AdminInput label="Recipient name" value={form.recipientName} onChange={(e) => set('recipientName', e.target.value)} placeholder="Optional" />
          <AdminInput label="Recipient email" type="email" value={form.recipientEmail} onChange={(e) => set('recipientEmail', e.target.value)} placeholder="Optional — needed to send" />
          <AdminInput label="Expires" hint="optional" type="date" value={form.expiresAt} onChange={(e) => set('expiresAt', e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminInput label="Internal note" value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="e.g. goodwill credit, order #1234, trivia prize" />
          <AdminTextArea label="Message in the email" rows={2} value={form.message} onChange={(e) => set('message', e.target.value)} placeholder="Optional — a line the recipient sees" className="min-h-[44px]" />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={issuing} className="btn-brand px-6 py-3 text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-60">
            {issuing ? 'Issuing…' : form.sendEmail && form.recipientEmail ? 'Issue & email' : 'Issue gift card'}
          </button>
          <label className="flex items-center gap-2 text-sm text-obsidian/70">
            <input type="checkbox" checked={form.sendEmail} disabled={!mailOk} onChange={(e) => set('sendEmail', e.target.checked)} className="rounded border-obsidian/30 text-ember focus:ring-ember" />
            Email the code to the recipient{!mailOk && <span className="text-xs text-obsidian/40">(mail not configured)</span>}
          </label>
        </div>
      </form>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <label className="relative">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-obsidian/35" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Code, name, email, note…" aria-label="Search gift cards" className={`${adminInputClass} w-64 py-2 pl-8`} />
        </label>
        <AdminSelect
          value={view}
          onChange={(v) => setView(v as View)}
          options={[
            { value: 'all', label: `All (${cards.length})` },
            { value: 'active', label: 'Active' },
            { value: 'redeemed', label: 'Redeemed' },
            { value: 'expired', label: 'Expired' },
            { value: 'void', label: 'Void' },
          ]}
          className="w-auto py-2"
        />
        <span className="text-xs text-obsidian/45">{rows.length} shown</span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-obsidian/10 bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-paper text-left text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/45">
            <tr>
              <th className="px-3 py-3">Code</th>
              <th className="px-3 py-3 text-right">Value</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Recipient</th>
              <th className="px-3 py-3">Note</th>
              <th className="px-3 py-3">Issued</th>
              <th className="px-3 py-3">Expires</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-obsidian/6">
            {rows.map((c) => {
              const t = tone(c);
              return (
                <tr key={c.id} className={c.status !== 'active' || c.expired ? 'opacity-70' : ''}>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs">
                      {c.code}
                      <button type="button" onClick={() => copy(c.code)} title="Copy code" className="grid h-6 w-6 place-items-center rounded text-obsidian/35 hover:bg-obsidian/[0.06] hover:text-obsidian">
                        <Copy size={12} />
                      </button>
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{formatNgn(c.valueNgn)}</td>
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${t.cls}`}>{t.label}</span>
                    {c.status === 'redeemed' && c.redeemedOrderId && (
                      <span className="mt-1 block font-mono text-[10px] text-obsidian/40">order {c.redeemedOrderId.slice(0, 8).toUpperCase()}</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-xs">
                    {c.recipientName || c.recipientEmail ? (
                      <>
                        <span className="block font-semibold text-obsidian">{c.recipientName || '—'}</span>
                        <span className="block text-obsidian/50">{c.recipientEmail || ''}</span>
                        {c.sentAt && <span className="block text-[10px] text-emerald-700">emailed {formatWhen(c.sentAt)}</span>}
                      </>
                    ) : (
                      <span className="text-obsidian/35">—</span>
                    )}
                  </td>
                  <td className="max-w-[200px] truncate px-3 py-2.5 text-xs text-obsidian/55" title={c.note || ''}>{c.note || '—'}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs text-obsidian/45">{formatWhen(c.createdAt)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs text-obsidian/45">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right">
                    {c.status === 'active' && !c.expired && c.recipientEmail && mailOk && (
                      <button type="button" disabled={busyId === c.id} onClick={() => send(c)} title={c.sentAt ? 'Resend email' : 'Send email'} className="mr-2 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-obsidian/50 hover:text-ember disabled:opacity-40">
                        <Mail size={12} /> {c.sentAt ? 'Resend' : 'Send'}
                      </button>
                    )}
                    {c.status === 'active' && (
                      <button type="button" onClick={() => voidCard(c)} className="text-[10px] font-black uppercase tracking-wider text-ember hover:text-ember/80">
                        Void
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-4 text-sm text-obsidian/45">{cards.length === 0 ? 'No gift cards issued yet.' : 'Nothing matches.'}</p>}
      </div>
    </>
  );
}
