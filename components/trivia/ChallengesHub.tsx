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

const BADGES: Record<string, string> = {
  featured: 'Featured',
  new: 'New',
  popular: 'Popular',
  trending: 'Trending',
};

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
  const featured = states.filter((s) => s.challenge.badge).slice(0, 4);

  return (
    <div className="space-y-10 sm:space-y-12">
      <SummaryPanel {...summary} signedIn={signedIn} />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2">
          {(
            [
              ['all', 'All challenges'],
              ['active', 'Active'],
              ['completed', 'Completed'],
            ] as [Filter, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.1em] border transition-colors ${
                filter === id
                  ? 'border-ember bg-ember/5 text-ember'
                  : 'border-obsidian/10 bg-white text-obsidian/50 hover:border-obsidian/30'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-[12px] text-obsidian/40">
          Progress is counted from rounds you pass, reviews you write, and orders you place.
        </p>
      </div>

      {featured.length > 0 && filter === 'all' && (
        <section>
          <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50 mb-4">
            Featured challenges
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {featured.map((state, i) => (
              <FeaturedCard key={state.challenge.id} state={state} index={i} onPlay={onPlay} />
            ))}
          </div>
        </section>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 items-start">
        <section className="bg-white border border-obsidian/8">
          <div className="px-5 py-4 border-b border-obsidian/8 flex items-center justify-between gap-4">
            <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50">
              All challenges
            </h2>
            <span className="text-[11px] text-obsidian/35 tabular-nums">{shown.length} shown</span>
          </div>

          {shown.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-obsidian/40">
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

        <div className="space-y-6">
          <LevelPanel points={points} signedIn={signedIn} />
          <HowItWorksPanel />
        </div>
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
    <section className="bg-white border border-obsidian/8">
      <div className="px-5 py-4 border-b border-obsidian/8">
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50">
          Your challenge summary
        </h2>
      </div>
      <ul className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-obsidian/6">
        {STATS.map(({ icon: Icon, label, value }) => (
          <li key={label} className="p-5 text-center">
            <span className="w-10 h-10 mx-auto rounded-full bg-ember/6 flex items-center justify-center mb-2.5">
              <Icon size={17} className="text-ember" />
            </span>
            <p className="font-logo font-black text-2xl tabular-nums leading-none">
              {value.toLocaleString()}
            </p>
            <p className="text-[11px] text-obsidian/40 mt-1.5">{label}</p>
          </li>
        ))}
      </ul>
      {!signedIn && (
        <p className="px-5 py-3.5 border-t border-obsidian/8 bg-paper/60 text-[12px] text-obsidian/50">
          These read zero until you sign in — your progress is tied to your account, not this browser.
        </p>
      )}
    </section>
  );
}

function ProgressBar({ value, target }: { value: number; target: number }) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/35">Progress</span>
        <span className="text-[11px] font-semibold tabular-nums text-obsidian/55">
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
  const base = `text-[10px] font-black uppercase tracking-[0.12em] ${className}`;

  if (challenge.status === 'soon') {
    return (
      <span className={`inline-flex items-center justify-center py-3 border border-obsidian/10 text-obsidian/35 ${base}`}>
        Coming soon
      </span>
    );
  }
  if (complete) {
    return (
      <span className={`inline-flex items-center justify-center gap-1.5 py-3 border border-ember/30 text-ember ${base}`}>
        <Check size={13} /> Complete
      </span>
    );
  }
  if (challenge.action.kind === 'play') {
    return (
      <button type="button" onClick={onPlay} className={`py-3 btn-brand ${base}`}>
        {state.progress > 0 ? 'Continue' : 'Start challenge'}
      </button>
    );
  }
  return (
    <Link href={challenge.action.href} className={`inline-flex items-center justify-center py-3 btn-brand ${base}`}>
      {state.progress > 0 ? 'Continue' : challenge.action.label}
    </Link>
  );
}

function FeaturedCard({
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="bg-white border border-obsidian/8 hover:border-ember/35 transition-colors flex flex-col"
    >
      <div className="relative brand-gradient aspect-[16/10] flex items-center justify-center">
        <Icon size={34} className="text-white/40" />
        {challenge.badge && (
          <span className="absolute top-3 left-3 bg-white/15 text-white text-[9px] font-black uppercase tracking-[0.14em] px-2.5 py-1">
            {BADGES[challenge.badge]}
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <p className="font-bold text-sm leading-snug">{challenge.name}</p>
        <p className="text-[12px] text-obsidian/45 mt-1 leading-relaxed">{challenge.detail}</p>

        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-ember tabular-nums">
          <Star size={13} className="fill-ember" /> {challenge.points.toLocaleString()} pts
        </p>

        <div className="mt-auto pt-4">
          <ChallengeCta state={state} onPlay={onPlay} className="w-full block text-center" />
        </div>
      </div>
    </motion.div>
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
      className="p-4 sm:p-5 grid sm:grid-cols-[auto_1fr_160px_auto] gap-4 items-center"
    >
      <span
        className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
          state.complete ? 'bg-ember text-white' : 'bg-ember/8 text-ember'
        }`}
      >
        {state.complete ? <Check size={18} /> : <Icon size={18} />}
      </span>

      <div className="min-w-0">
        <p className="font-bold text-sm leading-snug">{challenge.name}</p>
        <p className="text-[12px] text-obsidian/45 mt-0.5">{challenge.detail}</p>
        <p className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] font-bold text-ember tabular-nums">
          <Star size={11} className="fill-ember" /> {challenge.points.toLocaleString()} pts
        </p>
      </div>

      <ProgressBar value={state.progress} target={challenge.target} />

      <ChallengeCta state={state} onPlay={onPlay} className="px-5 whitespace-nowrap" />
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
    <section className="bg-white border border-obsidian/8">
      <div className="px-5 py-4 border-b border-obsidian/8">
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50">
          Challenge level
        </h2>
      </div>
      <div className="p-5">
        {signedIn ? (
          <>
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-full bg-ember/8 flex items-center justify-center shrink-0">
                <Trophy size={18} className="text-ember" />
              </span>
              <div className="min-w-0">
                <p className="font-bold text-sm">{tier.name} member</p>
                <p className="text-[12px] text-obsidian/45 mt-0.5">
                  {upcoming
                    ? `${(upcoming.minPoints - balance).toLocaleString()} pts to ${upcoming.name}`
                    : 'Top tier reached'}
                </p>
              </div>
            </div>
            <div className="h-1.5 bg-obsidian/8 overflow-hidden mt-4">
              <motion.div
                className="h-full bg-ember"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[11px] text-obsidian/40 mt-2 tabular-nums text-right">
              {balance.toLocaleString()} / {ceiling.toLocaleString()} pts
            </p>
            <p className="text-[12px] text-obsidian/45 mt-3 leading-relaxed">{tier.blurb}</p>
          </>
        ) : (
          <p className="text-sm text-obsidian/50 leading-relaxed">
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
    <section className="bg-white border border-obsidian/8">
      <div className="px-5 py-4 border-b border-obsidian/8">
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50">How it works</h2>
      </div>
      <ol className="divide-y divide-obsidian/6">
        {STEPS.map((step, i) => (
          <li key={step.title} className="px-5 py-4 flex items-start gap-3">
            <span className="w-7 h-7 rounded-full bg-ember/8 text-ember text-[11px] font-black flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{step.title}</span>
              <span className="block text-[12px] text-obsidian/45 mt-0.5 leading-relaxed">{step.detail}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="p-4 border-t border-obsidian/8">
        <Link
          href="/trivia?tab=rewards"
          className="w-full py-3 btn-brand text-[10px] font-black uppercase tracking-[0.12em] inline-flex items-center justify-center gap-1.5"
        >
          Explore rewards shop <ChevronRight size={13} />
        </Link>
      </div>
    </section>
  );
}
