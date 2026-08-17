'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, ArrowUpRight, Plus, Trash2, TrendingUp } from 'lucide-react';
import { DRINKS, formatNgn } from '@/lib/drinks/catalog';
import { WHOLESALE_OFF_PCT } from '@/lib/partners/store';
import type { ItemAnalysis, PortfolioAnalysis } from '@/lib/partners/pricing';

const inputClass =
  'w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-sm py-1.5 bg-transparent tabular-nums';

const VERDICT_COPY: Record<ItemAnalysis['verdict'], { label: string; className: string }> = {
  under: { label: 'Under target', className: 'bg-ember text-white' },
  'on-target': { label: 'On target', className: 'bg-paper text-obsidian/50' },
  premium: { label: 'Premium', className: 'bg-obsidian text-white' },
};

/**
 * Menu margin desk. Owners enter what a bottle costs them and what they charge
 * per serving; everything else — pour cost, suggested price, monthly profit,
 * wholesale saving — is computed server-side and shown back.
 */
export default function PricingDesk() {
  const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null);
  const [target, setTarget] = useState(72);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [addSlug, setAddSlug] = useState(DRINKS[0]?.slug || '');

  const load = useCallback(async () => {
    const res = await fetch('/api/partners/pricing');
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || 'Could not load pricing.');
      return;
    }
    setError('');
    setAnalysis(data.analysis);
    if (data.analysis?.targetMarginPct) setTarget(data.analysis.targetMarginPct);
  }, []);

  useEffect(() => {
    load().catch(() => setError('Could not load pricing.'));
  }, [load]);

  async function post(body: Record<string, unknown>) {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/partners/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not save.');
        return;
      }
      setAnalysis(data.analysis);
    } finally {
      setBusy(false);
    }
  }

  async function removeLine(id: string) {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/partners/pricing?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not remove the line.');
        return;
      }
      setAnalysis(data.analysis);
    } finally {
      setBusy(false);
    }
  }

  const items = analysis?.items ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-logo font-extrabold uppercase tracking-tight text-2xl">Menu margin desk</h2>
        <p className="text-sm text-obsidian/55 mt-1 max-w-2xl">
          Put in what a bottle costs you and what you charge a guest. We work out your pour cost, the price that hits
          your target margin, what each line earns per month, and what you would save buying the same bottles wholesale
          from us.
        </p>
      </div>

      {error && <p className="text-sm text-ember">{error}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Monthly revenue" value={analysis ? formatNgn(analysis.monthlyRevenueNgn) : '—'} />
        <Stat label="Monthly gross profit" value={analysis ? formatNgn(analysis.monthlyProfitNgn) : '—'} accent />
        <Stat
          label="Blended margin"
          value={analysis ? `${analysis.blendedMarginPct}%` : '—'}
          note={analysis ? `Pour cost ${analysis.blendedPourCostPct}%` : undefined}
        />
        <Stat
          label="Cost of goods"
          value={analysis ? formatNgn(analysis.monthlyCostNgn) : '—'}
          note="Bottles bought per month"
        />
      </div>

      {analysis && (analysis.upliftNgn > 0 || analysis.wholesaleSavingNgn > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {analysis.upliftNgn > 0 && (
            <div className="bg-white p-5 border-l-2 border-ember shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-ember mb-1 flex items-center gap-1.5">
                <TrendingUp size={13} /> Pricing headroom
              </p>
              <p className="text-2xl font-bold">{formatNgn(analysis.upliftNgn)}</p>
              <p className="text-[12px] text-obsidian/50 mt-1">
                Extra gross profit a month if every under-target line moved to its suggested price.
              </p>
            </div>
          )}
          {analysis.wholesaleSavingNgn > 0 && (
            <div className="bg-white p-5 border-l-2 border-obsidian shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-obsidian/60 mb-1 flex items-center gap-1.5">
                <ArrowUpRight size={13} /> Wholesale saving
              </p>
              <p className="text-2xl font-bold">{formatNgn(analysis.wholesaleSavingNgn)}</p>
              <p className="text-[12px] text-obsidian/50 mt-1">
                Per month, buying the same bottles at Convivia24 wholesale ({WHOLESALE_OFF_PCT}% off retail).
              </p>
            </div>
          )}
        </div>
      )}

      <div className="bg-white p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-end gap-5">
        <label className="flex-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-2">
            Target gross margin · {target}%
          </span>
          <input
            type="range"
            min={40}
            max={90}
            step={1}
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            onMouseUp={() => post({ action: 'target-margin', targetMarginPct: target })}
            onTouchEnd={() => post({ action: 'target-margin', targetMarginPct: target })}
            className="w-full accent-ember"
          />
          <span className="text-[11px] text-obsidian/45">
            Most Lagos bars run 65–78% on spirits. Pour cost is the mirror of this number.
          </span>
        </label>
        <div className="flex items-end gap-2">
          <label className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">
              Add from our catalog
            </span>
            <select value={addSlug} onChange={(e) => setAddSlug(e.target.value)} className={inputClass}>
              {DRINKS.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={busy || !addSlug}
            onClick={() => post({ action: 'add-from-catalog', slug: addSlug })}
            className="px-4 py-2.5 btn-brand text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-40 inline-flex items-center gap-1.5 shrink-0"
          >
            <Plus size={13} /> Add
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <PricingRow key={item.id} item={item} busy={busy} onSave={post} onRemove={removeLine} />
        ))}
        {items.length === 0 && !error && (
          <p className="text-sm text-obsidian/45">
            No lines yet — add a bottle from the catalog above, then edit the cost and menu price to match your room.
          </p>
        )}
      </div>

      {analysis && analysis.underPriced.length > 0 && (
        <div className="bg-white p-5 sm:p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-ember mb-3 flex items-center gap-1.5">
            <AlertTriangle size={13} /> Lines below your target
          </p>
          <ul className="space-y-2">
            {analysis.underPriced.map((item) => (
              <li key={item.id} className="text-sm flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="font-medium">{item.name}</span>
                <span className="text-obsidian/45">
                  at {formatNgn(item.sellPriceNgn)} a serving runs {item.grossMarginPct}% margin
                </span>
                <span className="text-ember font-medium">
                  → {formatNgn(item.suggestedPriceNgn)} hits {analysis.targetMarginPct}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: string;
  note?: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-white p-5 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-obsidian/35">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent ? 'brand-text' : ''}`}>{value}</p>
      {note && <p className="text-[11px] text-obsidian/40 mt-1">{note}</p>}
    </div>
  );
}

function PricingRow({
  item,
  busy,
  onSave,
  onRemove,
}: {
  item: ItemAnalysis;
  busy: boolean;
  onSave: (body: Record<string, unknown>) => void;
  onRemove: (id: string) => void;
}) {
  const [cost, setCost] = useState(String(item.bottleCostNgn));
  const [price, setPrice] = useState(String(item.sellPriceNgn));
  const [servings, setServings] = useState(String(item.servingsPerBottle));
  const [volume, setVolume] = useState(String(item.bottlesPerMonth));

  useEffect(() => {
    setCost(String(item.bottleCostNgn));
    setPrice(String(item.sellPriceNgn));
    setServings(String(item.servingsPerBottle));
    setVolume(String(item.bottlesPerMonth));
  }, [item.bottleCostNgn, item.sellPriceNgn, item.servingsPerBottle, item.bottlesPerMonth]);

  const dirty =
    cost !== String(item.bottleCostNgn) ||
    price !== String(item.sellPriceNgn) ||
    servings !== String(item.servingsPerBottle) ||
    volume !== String(item.bottlesPerMonth);

  const verdict = VERDICT_COPY[item.verdict];

  return (
    <div className="bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p className="font-medium truncate">{item.name}</p>
          <p className="text-[11px] text-obsidian/40">
            {item.category || 'uncategorised'} · {formatNgn(item.costPerServingNgn)} cost per serving ·{' '}
            {item.markupMultiple}× markup
          </p>
        </div>
        <span className={`text-[9px] font-black uppercase tracking-[0.12em] px-2 py-0.5 shrink-0 ${verdict.className}`}>
          {verdict.label}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <label className="block">
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-obsidian/40 block mb-1">
            Bottle cost
          </span>
          <input type="number" min={0} inputMode="numeric" value={cost} onChange={(e) => setCost(e.target.value)} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-obsidian/40 block mb-1">
            Menu price / serving
          </span>
          <input type="number" min={0} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-obsidian/40 block mb-1">
            Servings / bottle
          </span>
          <input type="number" min={1} inputMode="numeric" value={servings} onChange={(e) => setServings(e.target.value)} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-obsidian/40 block mb-1">
            Bottles / month
          </span>
          <input type="number" min={0} inputMode="numeric" value={volume} onChange={(e) => setVolume(e.target.value)} className={inputClass} />
        </label>
      </div>

      <div className="mt-4 pt-4 border-t border-obsidian/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <Metric label="Margin" value={`${item.grossMarginPct}%`} sub={`Pour cost ${item.pourCostPct}%`} />
        <Metric label="Suggested price" value={formatNgn(item.suggestedPriceNgn)} sub={
          item.priceGapNgn === 0
            ? 'Matches your price'
            : item.priceGapNgn > 0
              ? `${formatNgn(item.priceGapNgn)} above yours`
              : `${formatNgn(Math.abs(item.priceGapNgn))} below yours`
        } />
        <Metric label="Profit / bottle" value={formatNgn(item.profitPerBottleNgn)} sub={`Breakeven at ${item.breakevenServings} servings`} />
        <Metric
          label="Monthly profit"
          value={formatNgn(item.monthlyProfitNgn)}
          sub={
            item.wholesaleCostNgn != null
              ? item.monthlySavingNgn > 0
                ? `Save ${formatNgn(item.monthlySavingNgn)} on wholesale`
                : 'Already at or below our wholesale'
              : 'Not in our catalog'
          }
        />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          disabled={busy || !dirty}
          onClick={() =>
            onSave({
              id: item.id,
              slug: item.slug,
              name: item.name,
              category: item.category,
              bottleCostNgn: cost,
              sellPriceNgn: price,
              servingsPerBottle: servings,
              bottlesPerMonth: volume,
            })
          }
          className="px-4 py-2.5 btn-brand text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-35"
        >
          Save line
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.name}`}
          className="p-2.5 border border-obsidian/15 text-obsidian/40 hover:text-ember disabled:opacity-40"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-obsidian/35">{label}</p>
      <p className="font-semibold tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-obsidian/40">{sub}</p>}
    </div>
  );
}
