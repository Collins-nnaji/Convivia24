'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Gift, Wallet, Wine } from 'lucide-react';
import { REWARD_TIERS } from '@/lib/trivia/challenges';
import { rewardsIn } from '@/lib/loyalty/rewards';
import type { RewardTier } from '@/lib/trivia/challenges';

const ICONS = { Wine, Wallet, Gift } as const;

/** Cheapest real reward in the category — never a rounded-up marketing number. */
function fromPoints(category: RewardTier['category']): number | null {
  const costs = rewardsIn(category).map((r) => r.costPoints);
  return costs.length > 0 ? Math.min(...costs) : null;
}

export default function RedeemStrip({
  points,
  onExplore,
}: {
  points: number | null;
  /** Opens the rewards tab on this page rather than sending them off-site. */
  onExplore: () => void;
}) {
  return (
    <section className="rounded-2xl bg-white shadow-[0_8px_40px_-24px_rgba(10,10,10,0.18)] overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4 border-b border-obsidian/6">
        <h2 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50">Redeem your points</h2>
        <button
          type="button"
          onClick={onExplore}
          className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/40 hover:text-ember inline-flex items-center gap-0.5 sm:gap-1 transition-colors"
        >
          View all <ChevronRight size={12} className="sm:hidden" /><ChevronRight size={13} className="hidden sm:block" />
        </button>
      </div>

      <div className="grid grid-cols-3 divide-x divide-obsidian/6">
        {REWARD_TIERS.map((tier, i) => {
          const Icon = ICONS[tier.icon as keyof typeof ICONS] ?? Gift;
          const from = fromPoints(tier.category);
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="min-w-0"
            >
              <button
                type="button"
                onClick={onExplore}
                className="group block w-full text-left h-full p-3 sm:p-5 hover:bg-ember/[0.03] transition-colors"
              >
                <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-ember/6 flex items-center justify-center mb-1 sm:mb-3 mx-auto sm:mx-0">
                  <Icon size={14} className="text-ember sm:hidden" />
                  <Icon size={17} className="text-ember hidden sm:block" />
                </div>
                <p className="font-bold text-[11px] sm:text-sm leading-tight sm:leading-snug text-center sm:text-left">{tier.name}</p>
                <p className="text-[9px] sm:text-[12px] text-obsidian/45 mt-0.5 sm:mt-1 line-clamp-2 text-center sm:text-left">
                  {from != null ? `From ${from.toLocaleString()} pts` : tier.detail}
                </p>
                <p className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.08em] sm:tracking-[0.1em] text-ember mt-1 sm:mt-3 inline-flex items-center justify-center sm:justify-start gap-0.5 sm:gap-1 w-full sm:w-auto">
                  {tier.cta}
                  <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform sm:hidden" />
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform hidden sm:block" />
                </p>
              </button>
            </motion.div>
          );
        })}
      </div>

      {points !== null && (
        <p className="text-[11px] sm:text-[12px] text-obsidian/40 px-4 py-3 sm:px-5 border-t border-obsidian/6 bg-paper/40">
          You have <span className="font-bold text-obsidian/70 tabular-nums">{points.toLocaleString()}</span> points
          to spend.
        </p>
      )}
    </section>
  );
}
