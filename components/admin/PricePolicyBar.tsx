'use client';

import { useEffect, useState } from 'react';
import { formatNgn } from '@/lib/drinks/catalog';
import { DEFAULT_MARKUP, type MarkupPolicy } from '@/lib/pricing/checkout-fees';
import { readError } from './types';
import { AdminInput } from './ui/Fields';

/**
 * The only pricing lever we set by hand. Flutterwave and Access Bank rates stay as published;
 * this percent and flat naira are what we keep on top, and every suggested retail follows them.
 */
export default function PricePolicyBar({ onChange }: { onChange: (policy: MarkupPolicy) => void }) {
  const [markupPct, setMarkupPct] = useState(String(DEFAULT_MARKUP.markupPct));
  const [markupFlat, setMarkupFlat] = useState(String(DEFAULT_MARKUP.markupFlatNgn));
  const [saved, setSaved] = useState<MarkupPolicy>(DEFAULT_MARKUP);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/pricing-policy')
      .then(async (res) => {
        if (!res.ok) throw new Error(await readError(res, 'Unable to load the markup.'));
        return res.json();
      })
      .then((data: MarkupPolicy) => {
        if (cancelled) return;
        const policy = {
          markupPct: Number(data.markupPct) || 0,
          markupFlatNgn: Number(data.markupFlatNgn) || 0,
        };
        setMarkupPct(String(policy.markupPct));
        setMarkupFlat(String(policy.markupFlatNgn));
        setSaved(policy);
        onChange(policy);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load the markup.');
      });
    return () => {
      cancelled = true;
    };
  }, [onChange]);

  const draft: MarkupPolicy = {
    markupPct: markupPct === '' ? 0 : Number(markupPct),
    markupFlatNgn: markupFlat === '' ? 0 : Number(markupFlat),
  };
  const dirty = draft.markupPct !== saved.markupPct || draft.markupFlatNgn !== saved.markupFlatNgn;

  async function save() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/pricing-policy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error(await readError(res, 'Unable to save the markup.'));
      const policy = (await res.json()) as MarkupPolicy;
      const next = { markupPct: Number(policy.markupPct) || 0, markupFlatNgn: Number(policy.markupFlatNgn) || 0 };
      setSaved(next);
      setMarkupPct(String(next.markupPct));
      setMarkupFlat(String(next.markupFlatNgn));
      onChange(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save the markup.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mb-6 rounded-2xl border border-obsidian/10 bg-white p-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/40">Markup</h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-obsidian/55">
            Suggested retail covers the supplier cost, Flutterwave at 2% plus VAT, and Access Bank’s transfer, account
            fee and ₦4 alert. The markup below is ours, and each row can still take a different price.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <AdminInput
            label="Markup"
            hint="% of cost"
            type="number"
            min={0}
            step="0.1"
            value={markupPct}
            onChange={(e) => setMarkupPct(e.target.value)}
            className="w-28"
          />
          <AdminInput
            label="Plus"
            hint="₦ per bottle"
            type="number"
            min={0}
            step="1"
            value={markupFlat}
            onChange={(e) => setMarkupFlat(e.target.value)}
            className="w-36"
          />
          <button
            type="button"
            disabled={saving || !dirty}
            onClick={save}
            className="btn-brand px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-35"
          >
            {saving ? '…' : 'Save markup'}
          </button>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-obsidian/40">
        Now {saved.markupPct}%{saved.markupFlatNgn > 0 ? ` + ${formatNgn(saved.markupFlatNgn)}` : ''}. A suggestion prices
        the bottle as its own checkout, then rounds up to the next ₦100.
      </p>
      {error && <p className="mt-2 text-sm text-ember">{error}</p>}
    </section>
  );
}
