'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Camera,
  Check,
  GraduationCap,
  HelpCircle,
  MessageSquare,
  ShoppingBag,
  Star,
  Users,
  Wine,
} from 'lucide-react';
import { CHALLENGES, type Challenge, type ChallengeMeter } from '@/lib/trivia/challenges';

const ICONS = { HelpCircle, Star, Camera, Users, GraduationCap, MessageSquare, ShoppingBag, Wine } as const;

export type ChallengeState = {
  challenge: Challenge;
  progress: number;
  complete: boolean;
  /** Claimed for the current period — weekly ones reset. */
  claimed: boolean;
};

/**
 * Resolve every challenge against what the account has actually done. A challenge with no meter
 * can only be complete once its points have been claimed, so nothing shows progress we cannot
 * evidence.
 */
export function resolveChallenges(
  meters: Record<ChallengeMeter, number>,
  claimed: Record<string, string>,
  weekStart: string | null
): ChallengeState[] {
  return CHALLENGES.map((challenge) => {
    const key = claimed[challenge.id];
    const isClaimed = Boolean(key) && (challenge.cadence === 'once' || key === (weekStart || 'current'));
    const progress = challenge.meter ? Math.min(challenge.target, meters[challenge.meter] ?? 0) : isClaimed ? challenge.target : 0;
    return { challenge, progress, complete: progress >= challenge.target, claimed: isClaimed };
  });
}

/**
 * Earn & redeem, as one card: the challenges that pay points, listed tight, with the points
 * balance and the way to spend them in the header. Live and unfinished first; done ones sink.
 */
export default function ChallengesHub({
  meters,
  claimed,
  weekStart,
  signedIn,
  points,
  onPlay,
}: {
  meters: Record<ChallengeMeter, number>;
  claimed: Record<string, string>;
  weekStart: string | null;
  signedIn: boolean;
  points: number | null;
  onPlay: () => void;
}) {
  const states = useMemo(() => {
    const all = resolveChallenges(meters, claimed, weekStart);
    const rank = (s: ChallengeState) => (s.complete ? 2 : s.challenge.status === 'soon' ? 1 : 0);
    return [...all].sort((a, b) => rank(a) - rank(b));
  }, [meters, claimed, weekStart]);
  const earned = states.filter((s) => s.claimed).reduce((n, s) => n + s.challenge.points, 0);
  const open = states.filter((s) => !s.complete && s.challenge.status === 'live').length;

  return (
    <section className="overflow-hidden rounded-2xl border border-obsidian/8 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-obsidian/8 px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.16em] text-obsidian/60">Earn &amp; redeem</h2>
          <p className="mt-0.5 text-[13px] text-obsidian/50">
            {signedIn ? `${open} open · ${earned.toLocaleString()} pts earned from challenges` : 'Sign in — progress is tied to your account'}
          </p>
        </div>
        <Link
          href="/discover/rewards"
          className="inline-flex items-center gap-2 rounded-full bg-obsidian px-4 py-2 text-white transition-colors hover:bg-ember"
        >
          <Star size={13} className="fill-ember text-ember" />
          <span className="font-logo text-[13px] font-black tabular-nums tracking-tight">
            {points != null ? `${points.toLocaleString()} PTS` : 'Rewards'}
          </span>
          <span className="text-[12px] font-semibold text-white/70">· spend</span>
          <ArrowRight size={13} />
        </Link>
      </header>

      <ul className="divide-y divide-obsidian/6">
        {states.map((state, i) => (
          <ChallengeRow key={state.challenge.id} state={state} index={i} onPlay={onPlay} />
        ))}
      </ul>
    </section>
  );
}

function ChallengeRow({ state, index, onPlay }: { state: ChallengeState; index: number; onPlay: () => void }) {
  const { challenge, complete, progress } = state;
  const Icon = ICONS[challenge.icon as keyof typeof ICONS] ?? HelpCircle;
  const soon = challenge.status === 'soon';
  const pct = challenge.target > 0 ? Math.min(100, (progress / challenge.target) * 100) : 0;
  const showBar = !complete && !soon && challenge.target > 1;

  return (
    <motion.li
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.03, duration: 0.25 }}
      className={`flex items-center gap-3 px-4 py-3 sm:px-5 ${complete || soon ? 'opacity-60' : ''}`}
    >
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${complete ? 'bg-ember text-white' : 'bg-ember/10 text-ember'}`}>
        {complete ? <Check size={16} /> : <Icon size={16} />}
      </span>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-[15px] font-semibold leading-tight text-obsidian">
          <span className="truncate">{challenge.name}</span>
          {challenge.cadence === 'weekly' && !complete && (
            <span className="shrink-0 rounded-full bg-paper px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-obsidian/45">weekly</span>
          )}
        </p>
        {showBar ? (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-obsidian/[0.07]">
              <motion.div className="h-full rounded-full bg-ember" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
            </div>
            <span className="text-[12px] tabular-nums text-obsidian/50">{progress}/{challenge.target}</span>
          </div>
        ) : (
          <p className="mt-0.5 truncate text-[13px] text-obsidian/50">{challenge.detail}</p>
        )}
      </div>

      <span className="shrink-0 text-[14px] font-bold tabular-nums text-ember">+{challenge.points.toLocaleString()}</span>

      <span className="hidden shrink-0 sm:block">
        {complete ? (
          <span className="text-[12px] font-bold uppercase tracking-wider text-obsidian/40">Done</span>
        ) : soon ? (
          <span className="text-[12px] font-bold uppercase tracking-wider text-obsidian/35">Soon</span>
        ) : challenge.action.kind === 'play' ? (
          <button type="button" onClick={onPlay} className="rounded-full border border-obsidian/15 px-3 py-1.5 text-[12px] font-bold text-obsidian hover:border-ember hover:text-ember">
            {progress > 0 ? 'Continue' : 'Play'}
          </button>
        ) : (
          <Link href={challenge.action.href} className="rounded-full border border-obsidian/15 px-3 py-1.5 text-[12px] font-bold text-obsidian hover:border-ember hover:text-ember">
            {progress > 0 ? 'Continue' : challenge.action.label}
          </Link>
        )}
      </span>
    </motion.li>
  );
}
