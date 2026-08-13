'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, ChevronDown, Check } from 'lucide-react';
import { formatNaira } from '@/lib/dining/venues';
import type { BillSummary } from '@/lib/split/compute';

/**
 * The number the person holding the phone actually came for. Everything else on
 * the screen is context for this figure.
 */
export default function YourShare({
  bill,
  youId,
  onPickYou,
}: {
  bill: BillSummary;
  youId?: string;
  onPickYou: () => void;
}) {
  const you = bill.people.find((p) => p.attendeeId === youId);

  if (!you) {
    return (
      <button
        type="button"
        onClick={onPickYou}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 bg-gold/15 border-y border-gold/40 active:bg-gold/25 transition-colors"
      >
        <span className="text-left">
          <span className="block font-display text-xl italic text-obsidian leading-none mb-1">
            Which one is you?
          </span>
          <span className="block text-obsidian/50 text-xs">
            Tap to pick, and your share stays pinned to the top.
          </span>
        </span>
        <ChevronDown size={18} className="text-gold-dark shrink-0" />
      </button>
    );
  }

  const pct = you.budget ? Math.min(100, (you.total / you.budget) * 100) : null;

  return (
    <button
      type="button"
      onClick={onPickYou}
      className="w-full text-left px-5 py-4 bg-obsidian border-b border-gold/20 active:bg-obsidian-100 transition-colors"
    >
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/70 mb-1.5">
            Your share &middot; {you.name}
          </p>
          <motion.p
            key={you.total}
            initial={{ opacity: 0.5, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="font-display text-4xl italic text-cream leading-none tabular-nums"
          >
            {formatNaira(you.total)}
          </motion.p>
        </div>

        {you.budget != null && (
          <div className="text-right shrink-0">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cream/30 mb-1.5">
              Budget {formatNaira(you.budget)}
            </p>
            <p
              className={`inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.1em] ${
                you.overBudget ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {you.overBudget ? <AlertTriangle size={11} /> : <Check size={11} />}
              {you.overBudget
                ? `${formatNaira(Math.abs(you.remaining!))} over`
                : `${formatNaira(you.remaining!)} left`}
            </p>
          </div>
        )}
      </div>

      {pct != null && (
        <div className="h-1 w-full bg-cream/10 mt-3 overflow-hidden">
          <motion.div
            className={`h-full ${you.overBudget ? 'bg-red-500' : 'bg-gold'}`}
            initial={false}
            animate={{ width: `${Math.max(2, pct)}%` }}
            transition={{ type: 'spring', stiffness: 260, damping: 32 }}
          />
        </div>
      )}
    </button>
  );
}
