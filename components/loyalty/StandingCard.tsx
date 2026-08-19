'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Standing = {
  claimed: boolean;
  points: number;
  tierId: string;
  tierName: string;
  discountPct: number;
  nextTierName: string | null;
  pointsToNextTier: number;
};

/** The account's real, server-side loyalty standing — the same record checkout discounts come from. */
export default function StandingCard() {
  const [standing, setStanding] = useState<Standing | null>(null);
  const [signedIn, setSignedIn] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/loyalty/me')
      .then((res) => res.json())
      .then((data) => {
        setSignedIn(Boolean(data.signedIn));
        setStanding(data.standing || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !signedIn) return null;

  if (!standing?.claimed) {
    return (
      <div className="bg-white p-5 shadow-sm mb-8 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-obsidian/60">Activate your Guest Card to start earning a shop discount.</p>
        <Link href="/card" className="px-4 py-2 btn-brand text-[10px] font-black uppercase tracking-[0.12em]">
          Activate
        </Link>
      </div>
    );
  }

  const progressPct =
    standing.pointsToNextTier > 0
      ? Math.min(100, Math.round((standing.points / (standing.points + standing.pointsToNextTier)) * 100))
      : 100;

  return (
    <div className="bg-white p-5 sm:p-6 shadow-sm mb-8">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ember">{standing.tierName} tier</p>
          <p className="text-2xl font-bold tabular-nums">{standing.points.toLocaleString()} pts</p>
        </div>
        {standing.discountPct > 0 && (
          <span className="text-[11px] font-black uppercase tracking-[0.1em] px-3 py-1.5 bg-emerald-50 text-emerald-700">
            {standing.discountPct}% off every order
          </span>
        )}
      </div>
      {standing.nextTierName && (
        <>
          <div className="h-1.5 bg-paper rounded-full overflow-hidden">
            <div className="h-full brand-gradient" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-[11px] text-obsidian/45 mt-2">
            {standing.pointsToNextTier.toLocaleString()} pts to {standing.nextTierName}
          </p>
        </>
      )}
    </div>
  );
}
