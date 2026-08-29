'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Gift, Ticket, Wallet, Wine } from 'lucide-react';
import { REWARD_TIERS } from '@/lib/trivia/challenges';
import { rewardsIn } from '@/lib/loyalty/rewards';
import type { RewardTier } from '@/lib/trivia/challenges';

const ICONS = { Ticket, Wine, Wallet, Gift } as const;

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
    <section>
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50">Redeem your points</h2>
        <button
          type="button"
          onClick={onExplore}
          className="text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/40 hover:text-ember inline-flex items-center gap-1 transition-colors"
        >
          View all <ChevronRight size={13} />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {REWARD_TIERS.map((tier, i) => {
          const Icon = ICONS[tier.icon as keyof typeof ICONS] ?? Gift;
          const from = fromPoints(tier.category);
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
            >
              <button
                type="button"
                onClick={onExplore}
                className="group block w-full text-left h-full bg-white border border-obsidian/8 p-4 sm:p-5 hover:border-ember/35 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-ember/6 flex items-center justify-center mb-3">
                  <Icon size={17} className="text-ember" />
                </div>
                <p className="font-bold text-sm leading-snug">{tier.name}</p>
                <p className="text-[12px] text-obsidian/45 mt-1">
                  {from != null ? `From ${from.toLocaleString()} pts` : tier.detail}
                </p>
                <p className="text-[11px] font-black uppercase tracking-[0.1em] text-ember mt-3 inline-flex items-center gap-1">
                  {tier.cta}
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </p>
              </button>
            </motion.div>
          );
        })}
      </div>

      {points !== null && (
        <p className="text-[12px] text-obsidian/40 mt-3">
          You have <span className="font-bold text-obsidian/70 tabular-nums">{points.toLocaleString()}</span> points
          to spend.
        </p>
      )}
    </section>
  );
}
