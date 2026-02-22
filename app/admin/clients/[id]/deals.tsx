'use client';

import { useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';

const STAGES = ['lead','qualified','proposal','negotiation','closed_won','closed_lost'];
const STAGE_COLORS: Record<string, string> = {
  lead: 'bg-zinc-700', qualified: 'bg-blue-700', proposal: 'bg-yellow-600',
  negotiation: 'bg-orange-600', closed_won: 'bg-green-700', closed_lost: 'bg-zinc-600',
};

type Deal = { id: string; title: string; stage: string; value?: string; currency: string; notes?: string };

export default function AdminDealManager({ clientId, deals: initialDeals }: { clientId: string; deals: Deal[] }) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: '', stage: 'lead', value: '', currency: 'GBP', notes: '' });
  const [saving, setSaving] = useState(false);

  async function addDeal(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const res = await fetch('/api/admin/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, clientId }),
    });
    if (res.ok) {
      const deal = await res.json();
      setDeals((prev) => [deal, ...prev]);
      setForm({ title: '', stage: 'lead', value: '', currency: 'GBP', notes: '' });
      setAdding(false);
    }
    setSaving(false);
  }

  async function updateStage(dealId: string, stage: string) {
    await fetch(`/api/admin/deals/${dealId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    });
    setDeals((prev) => prev.map((d) => d.id === dealId ? { ...d, stage } : d));
  }

  return (
    <div>
      <div className="divide-y divide-zinc-100 max-h-56 overflow-auto">
        {deals.length === 0 && !adding && (
          <p className="text-zinc-500 text-sm text-center py-6">No deals yet</p>
        )}
        {deals.map((deal) => (
          <div key={deal.id} className="flex items-center justify-between px-6 py-3 gap-3">
            <div className="min-w-0">
              <p className="text-sm text-zinc-900 truncate">{deal.title}</p>
              {deal.value && <p className="text-[11px] text-zinc-500">{deal.currency} {parseFloat(deal.value).toLocaleString()}</p>}
            </div>
            <select
              value={deal.stage}
              onChange={(e) => updateStage(deal.id, e.target.value)}
              className="bg-white border border-zinc-300 text-zinc-900 text-[11px] font-black uppercase px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-red-500 shrink-0"
            >
              {STAGES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
        ))}
      </div>

      {adding ? (
        <form onSubmit={addDeal} className="p-4 border-t border-zinc-200 space-y-2">
          <input
            placeholder="Deal title*"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-white border border-zinc-300 text-zinc-900 text-sm px-3 py-2 rounded placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <div className="flex gap-2">
            <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}
              className="flex-1 bg-white border border-zinc-300 text-zinc-900 text-sm px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-red-500">
              {STAGES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <input placeholder="Value" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })}
              className="w-24 bg-white border border-zinc-300 text-zinc-900 text-sm px-3 py-2 rounded placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500" />
            <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="bg-white border border-zinc-300 text-zinc-900 text-sm px-2 py-2 rounded focus:outline-none focus:ring-1 focus:ring-red-500">
              {['GBP','USD','EUR','NGN'].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <textarea placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className="w-full bg-white border border-zinc-300 text-zinc-900 text-sm px-3 py-2 rounded placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none" />
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-black uppercase tracking-[0.1em] py-2 rounded transition-colors disabled:opacity-50">
              {saving ? 'Saving…' : 'Add Deal'}
            </button>
            <button type="button" onClick={() => setAdding(false)}
              className="px-4 py-2 text-zinc-600 hover:text-zinc-900 text-sm transition-colors">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 border-t border-zinc-200">
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-[11px] text-red-600 hover:text-red-700 font-black uppercase tracking-[0.1em] transition-colors">
            <Plus size={12} /> Add Deal
          </button>
        </div>
      )}
    </div>
  );
}
