'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Camera,
  Check,
  ChevronRight,
  Flame,
  GraduationCap,
  HelpCircle,
  MessageSquare,
  ShoppingBag,
  Star,
  Target,
  Trophy,
  Users,
  Wine,
} from 'lucide-react';
import { CHALLENGES, type Challenge, type ChallengeMeter } from '@/lib/trivia/challenges';
import { LOYALTY_TIERS, nextTier, tierForPoints } from '@/lib/loyalty/program';

const ICONS = {
  HelpCircle,
  Star,
  Camera,
  Users,
  GraduationCap,
  MessageSquare,
  ShoppingBag,
  Wine,
} as const;

type Filter = 'all' | 'active' | 'completed';

export type ChallengeState = {
  challenge: Challenge;
  progress: number;
  complete: boolean;
  /** Claimed for the current period — weekly ones reset. */
  claimed: boolean;
};

/**
 * Resolve every challenge against what the account has actually done. A
 * challenge with no meter can only be complete once its points have been
 * claimed, so nothing shows progress we cannot evidence.
 */
export function resolveChallenges(
  meters: Record<ChallengeMeter, number>,
  claimed: Record<string, string>,
  weekStart: string | null
): ChallengeState[] {
  return CHALLENGES.map((challenge) => {
    const key = claimed[challenge.id];
    const isClaimed =
      Boolean(key) && (challenge.cadence === 'once' || key === (weekStart || 'current'));
    const progress = challenge.meter
      ? Math.min(challenge.target, meters[challenge.meter] ?? 0)
      : isClaimed
        ? challenge.target
        : 0;
    return {
      challenge,
      progress,
      complete: progress >= challenge.target,
      claimed: isClaimed,
    };
  });
}

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
  const [filter, setFilter] = useState<Filter>('all');

  const states = useMemo(
    () => resolveChallenges(meters, claimed, weekStart),
    [meters, claimed, weekStart]
  );

  const summary = useMemo(() => {
    const completed = states.filter((s) => s.complete).length;
    const inProgress = states.filter((s) => !s.complete && s.progress > 0).length;
    const available = states.filter((s) => !s.complete && s.challenge.status === 'live').length;
    const earned = states
      .filter((s) => s.claimed)
      .reduce((n, s) => n + s.challenge.points, 0);
    return { completed, inProgress, available, earned };
  }, [states]);

  const shown = states.filter((s) =>
    filter === 'all' ? true : filter === 'completed' ? s.complete : !s.complete
  );
  return (
    <div className="space-y-6 sm:space-y-8">
      <SummaryPanel {...summary} signedIn={signedIn} />

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 -mx-0.5 px-0.5">
          {(
            [
              ['all', 'All'],
              ['active', 'Active'],
              ['completed', 'Done'],
            ] as [Filter, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`shrink-0 px-2.5 py-1.5 sm:px-4 sm:py-2.5 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.1em] rounded-full transition-colors ${
                filter === id
                  ? 'bg-obsidian text-white'
                  : 'bg-white text-obsidian/50 hover:text-obsidian/70'
              }`}
            >
              <span className="sm:hidden">{label}</span>
              <span className="hidden sm:inline">
                {id === 'all' ? 'All challenges' : id === 'active' ? 'Active' : 'Completed'}
              </span>
            </button>
          ))}
        </div>
        <p className="hidden sm:block text-[12px] text-obsidian/40">
          Progress is counted from rounds you pass, reviews you write, and orders you place.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6 lg:gap-8 items-start">
        <section className="rounded-2xl bg-white shadow-[0_8px_40px_-24px_rgba(10,10,10,0.18)] overflow-hidden">
          <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-obsidian/6 flex items-center justify-between gap-3">
            <h3 className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50">
              All challenges
            </h3>
            <span className="text-[11px] text-obsidian/35 tabular-nums">{shown.length} shown</span>
          </div>

          {shown.length === 0 ? (
            <p className="px-3 py-8 sm:px-5 sm:py-12 text-center text-sm text-obsidian/40">
              {filter === 'completed'
                ? 'Nothing finished yet — play a round to get started.'
                : 'Every challenge here is done. New ones land each week.'}
            </p>
          ) : (
            <ul className="divide-y divide-obsidian/6">
              {shown.map((state, i) => (
                <ChallengeRow key={state.challenge.id} state={state} index={i} onPlay={onPlay} />
              ))}
            </ul>
          )}
        </section>

        <aside className="rounded-2xl bg-white shadow-[0_8px_40px_-24px_rgba(10,10,10,0.18)] overflow-hidden divide-y divide-obsidian/6">
          <LevelPanel points={points} signedIn={signedIn} />
          <HowItWorksPanel />
        </aside>
      </div>
    </div>
  );
}

function SummaryPanel({
  completed,
  inProgress,
  available,
  earned,
  signedIn,
}: {
  completed: number;
  inProgress: number;
  available: number;
  earned: number;
  signedIn: boolean;
}) {
  const STATS = [
    { icon: Trophy, label: 'Completed', value: completed },
    { icon: Flame, label: 'In progress', value: inProgress },
    { icon: Target, label: 'Available', value: available },
    { icon: Star, label: 'Points earned', value: earned },
  ];

  return (
    <div className="rounded-2xl bg-white shadow-[0_8px_40px_-24px_rgba(10,10,10,0.18)] overflow-hidden">
      <div className="px-4 py-3 sm:px-5 sm:py-4">
        <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50">
          Your challenge summary
        </h3>
      </div>
      <ul className="grid grid-cols-4 divide-x divide-obsidian/6 border-t border-obsidian/6">
        {STATS.map(({ icon: Icon, label, value }) => (
          <li key={label} className="px-1.5 py-2.5 sm:p-5 text-center">
            <span className="w-7 h-7 sm:w-10 sm:h-10 mx-auto rounded-full bg-ember/6 flex items-center justify-center mb-1 sm:mb-2.5">
              <Icon size={14} className="text-ember sm:hidden" />
              <Icon size={17} className="text-ember hidden sm:block" />
            </span>
            <p className="font-logo font-black text-lg sm:text-2xl tabular-nums leading-none">
              {value.toLocaleString()}
            </p>
            <p className="text-[9px] sm:text-[11px] text-obsidian/40 mt-0.5 sm:mt-1.5 leading-tight">{label}</p>
          </li>
        ))}
      </ul>
      {!signedIn && (
        <p className="px-4 py-2.5 sm:px-5 sm:py-3 border-t border-obsidian/6 bg-paper/50 text-[11px] sm:text-[12px] text-obsidian/50 leading-snug">
          These read zero until you sign in — your progress is tied to your account, not this browser.
        </p>
      )}
    </div>
  );
}

function ProgressBar({ value, target }: { value: number; target: number }) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1 sm:mb-1.5">
        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/35">Progress</span>
        <span className="text-[10px] sm:text-[11px] font-semibold tabular-nums text-obsidian/55">
          {value}/{target}
        </span>
      </div>
      <div className="h-1.5 bg-obsidian/8 overflow-hidden">
        <motion.div
          className="h-full bg-ember"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function ChallengeCta({
  state,
  onPlay,
  className = '',
}: {
  state: ChallengeState;
  onPlay: () => void;
  className?: string;
}) {
  const { challenge, complete } = state;
  const base = `text-[10px] font-black uppercase tracking-[0.12em] w-full sm:w-auto ${className}`;

  if (challenge.status === 'soon') {
    return (
      <span className={`inline-flex items-center justify-center py-2 sm:py-3 border border-obsidian/10 text-obsidian/35 ${base}`}>
        Coming soon
      </span>
    );
  }
  if (complete) {
    return (
      <span className={`inline-flex items-center justify-center gap-1.5 py-2 sm:py-3 border border-ember/30 text-ember ${base}`}>
        <Check size={13} /> Complete
      </span>
    );
  }
  if (challenge.action.kind === 'play') {
    return (
      <button type="button" onClick={onPlay} className={`py-2 sm:py-3 btn-brand ${base}`}>
        {state.progress > 0 ? 'Continue' : 'Start challenge'}
      </button>
    );
  }
  return (
    <Link href={challenge.action.href} className={`inline-flex items-center justify-center py-2 sm:py-3 btn-brand ${base}`}>
      {state.progress > 0 ? 'Continue' : challenge.action.label}
    </Link>
  );
}

function ChallengeRow({
  state,
  index,
  onPlay,
}: {
  state: ChallengeState;
  index: number;
  onPlay: () => void;
}) {
  const { challenge } = state;
  const Icon = ICONS[challenge.icon as keyof typeof ICONS] ?? HelpCircle;

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 6) * 0.04, duration: 0.3 }}
      className="p-3 sm:p-5 sm:grid sm:grid-cols-[auto_1fr_160px_auto] gap-2.5 sm:gap-4 sm:items-center"
    >
      <div className="flex items-start gap-2.5 sm:contents">
        <span
          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 ${
            state.complete ? 'bg-ember text-white' : 'bg-ember/8 text-ember'
          }`}
        >
          {state.complete ? <Check size={16} className="sm:hidden" /> : <Icon size={16} className="sm:hidden" />}
          {state.complete ? <Check size={18} className="hidden sm:block" /> : <Icon size={18} className="hidden sm:block" />}
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-bold text-[13px] sm:text-sm leading-snug">{challenge.name}</p>
          <p className="text-[11px] sm:text-[12px] text-obsidian/45 mt-0.5 line-clamp-2 sm:line-clamp-none">{challenge.detail}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-[11px] sm:text-[12px] font-bold text-ember tabular-nums">
            <Star size={10} className="fill-ember sm:hidden" />
            <Star size={11} className="fill-ember hidden sm:block" />
            {challenge.points.toLocaleString()} pts
          </p>
        </div>
      </div>

      <ProgressBar value={state.progress} target={challenge.target} />

      <ChallengeCta state={state} onPlay={onPlay} className="px-3 sm:px-5 whitespace-nowrap" />
    </motion.li>
  );
}

function LevelPanel({ points, signedIn }: { points: number | null; signedIn: boolean }) {
  const balance = points ?? 0;
  const tier = tierForPoints(balance);
  const upcoming = nextTier(balance);
  const ceiling = upcoming?.minPoints ?? LOYALTY_TIERS[LOYALTY_TIERS.length - 1].minPoints;
  const pct = ceiling > 0 ? Math.min(100, (balance / ceiling) * 100) : 100;

  return (
    <section>
      <div className="px-4 py-3 sm:px-5 sm:py-4">
        <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50">
          Challenge level
        </h3>
      </div>
      <div className="px-4 pb-4 sm:px-5 sm:pb-5 border-t border-obsidian/6 pt-4">
        {signedIn ? (
          <>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-ember/8 flex items-center justify-center shrink-0">
                <Trophy size={16} className="text-ember sm:hidden" />
                <Trophy size={18} className="text-ember hidden sm:block" />
              </span>
              <div className="min-w-0">
                <p className="font-bold text-[13px] sm:text-sm">{tier.name} member</p>
                <p className="text-[11px] sm:text-[12px] text-obsidian/45 mt-0.5">
                  {upcoming
                    ? `${(upcoming.minPoints - balance).toLocaleString()} pts to ${upcoming.name}`
                    : 'Top tier reached'}
                </p>
              </div>
            </div>
            <div className="h-1.5 bg-obsidian/8 overflow-hidden mt-3 sm:mt-4">
              <motion.div
                className="h-full bg-ember"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[10px] sm:text-[11px] text-obsidian/40 mt-1.5 sm:mt-2 tabular-nums text-right">
              {balance.toLocaleString()} / {ceiling.toLocaleString()} pts
            </p>
            <p className="text-[11px] sm:text-[12px] text-obsidian/45 mt-2 sm:mt-3 leading-relaxed">{tier.blurb}</p>
          </>
        ) : (
          <p className="text-[13px] sm:text-sm text-obsidian/50 leading-relaxed">
            Sign in to see your tier and how close the next one is.
          </p>
        )}
      </div>
    </section>
  );
}

function HowItWorksPanel() {
  const STEPS = [
    { title: 'Choose a challenge', detail: 'Pick one that fits how you already drink.' },
    { title: 'Complete the steps', detail: 'Play a round, write a review, place an order.' },
    { title: 'Earn points', detail: 'Points land on your Guest Card and buy rewards.' },
  ];
  return (
    <section>
      <div className="px-4 py-3 sm:px-5 sm:py-4">
        <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50">How it works</h3>
      </div>
      <ol className="divide-y divide-obsidian/6 border-t border-obsidian/6">
        {STEPS.map((step, i) => (
          <li key={step.title} className="px-3 py-2.5 sm:px-5 sm:py-4 flex items-start gap-2.5 sm:gap-3">
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-ember/8 text-ember text-[10px] sm:text-[11px] font-black flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] sm:text-sm font-semibold">{step.title}</span>
              <span className="block text-[11px] sm:text-[12px] text-obsidian/45 mt-0.5 leading-snug sm:leading-relaxed">{step.detail}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="px-4 py-3 sm:px-5 sm:py-4 border-t border-obsidian/6">
        <Link
          href="/discover?tab=rewards-shop"
          className="w-full py-2.5 sm:py-3 btn-brand text-[10px] font-black uppercase tracking-[0.12em] inline-flex items-center justify-center gap-1.5"
        >
          Explore rewards shop <ChevronRight size={13} />
        </Link>
      </div>
    </section>
  );
}
