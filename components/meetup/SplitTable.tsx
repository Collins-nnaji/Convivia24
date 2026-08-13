'use client';

import { AlertTriangle, Check } from 'lucide-react';
import { formatNaira } from '@/lib/dining/venues';
import type { BillSummary } from '@/lib/split/compute';

/**
 * The answer everyone came for: what each person is carrying, and whether it
 * has blown past what they said they'd spend.
 */
export default function SplitTable({
  bill,
  variant = 'light',
  compact = false,
}: {
  bill: BillSummary;
  variant?: 'light' | 'dark';
  compact?: boolean;
}) {
  const dark = variant === 'dark';
  const max = Math.max(1, ...bill.people.map((p) => p.total));

  const text = dark ? 'text-cream' : 'text-obsidian';
  const muted = dark ? 'text-cream/40' : 'text-obsidian/45';
  const rule = dark ? 'border-gold/10' : 'border-obsidian/10';

  return (
    <div className={text}>
      <ul className={`divide-y ${dark ? 'divide-gold/10' : 'divide-obsidian/10'}`}>
        {bill.people.map((p) => (
          <li key={p.attendeeId} className="py-4">
            <div className="flex items-baseline justify-between gap-4 mb-2">
              <span className="font-display text-xl italic leading-none truncate">{p.name}</span>
              <span className="font-display text-xl italic text-gold leading-none shrink-0 tabular-nums">
                {formatNaira(p.total)}
              </span>
            </div>

            <div className={`h-1 w-full ${dark ? 'bg-cream/10' : 'bg-obsidian/10'} mb-2 overflow-hidden`}>
              <div
                className={`h-full transition-[width] duration-500 ${p.overBudget ? 'bg-red-500/80' : 'bg-gold'}`}
                style={{ width: `${Math.max(2, (p.total / max) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-3 text-[11px]">
              <span className={muted}>
                {p.lines.length === 0
                  ? 'Nothing ordered yet'
                  : `${p.lines.length} item${p.lines.length === 1 ? '' : 's'} · ${formatNaira(p.subtotal)} + service & VAT`}
              </span>
              {p.budget != null && (
                <span
                  className={`inline-flex items-center gap-1 font-black uppercase tracking-[0.12em] shrink-0 ${
                    p.overBudget ? 'text-red-500' : 'text-emerald-600'
                  }`}
                >
                  {p.overBudget ? <AlertTriangle size={11} /> : <Check size={11} />}
                  {p.overBudget
                    ? `${formatNaira(Math.abs(p.remaining!))} over`
                    : `${formatNaira(p.remaining!)} left`}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className={`border-t ${rule} pt-4 mt-1 space-y-1.5`}>
        {!compact && (
          <>
            <Row label="Food & drink" value={bill.subtotal} muted={muted} />
            {bill.service > 0 && <Row label="Service charge" value={bill.service} muted={muted} />}
            <Row label="VAT" value={bill.vat} muted={muted} />
            {bill.tip > 0 && <Row label="Tip" value={bill.tip} muted={muted} />}
          </>
        )}
        <div className={`flex items-baseline justify-between gap-4 pt-2 border-t ${rule}`}>
          <span className="text-[10px] font-black uppercase tracking-[0.25em]">The bill</span>
          <span className="font-display text-2xl italic text-gold tabular-nums">{formatNaira(bill.total)}</span>
        </div>
        <p className={`text-[11px] ${muted}`}>
          An even split would be {formatNaira(bill.evenSplit)} a head. Nobody pays here — you settle at the till.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: number; muted: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-[13px]">
      <span className={muted}>{label}</span>
      <span className="tabular-nums">{formatNaira(value)}</span>
    </div>
  );
}
