'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import RewardsShop from '@/components/trivia/RewardsShop';
import { useTriviaHub } from '@/components/trivia/use-hub';
import PageHeader from './PageHeader';

export default function RewardsPage() {
  const hub = useTriviaHub();
  const [points, setPoints] = useState<number | null>(null);
  const balance = points ?? hub.standing?.points ?? null;

  return (
    <>
      <PageHeader
        eyebrow="Rewards shop"
        title="Spend your points"
        lead="Redeem points for bottles, partner perks, shop credit and merchandise."
        action={
          balance !== null ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-obsidian px-4 py-2.5 text-white">
              <Star size={15} className="fill-ember text-ember" />
              <span className="font-logo text-sm font-black tabular-nums tracking-tight">{balance.toLocaleString()} PTS</span>
            </span>
          ) : null
        }
      />
      <div className="p-4 sm:p-6">
        <RewardsShop signedIn={hub.signedIn} standing={hub.standing} onPointsChanged={setPoints} />
      </div>
    </>
  );
}
