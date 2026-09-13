'use client';

import { useCallback, useMemo } from 'react';
import { rankRounds, TRIVIA_ROUNDS, type TriviaRound } from '@/lib/trivia/catalog';
import { DRINKS } from '@/lib/drinks/catalog';
import { matchScore, overallMatch } from '@/lib/trivia/taste';
import type { HubState } from '@/components/trivia/use-hub';

/** A round's taste signature, with the prize bottle's price folded in. */
export function roundSignature(round: TriviaRound) {
  const bottle = DRINKS.find((d) => d.slug === round.prizeSlug);
  return { ...round.taste, priceNgn: bottle?.priceNgn };
}

export function formatWeek(weekStart: string | null): string {
  if (!weekStart) return 'Playing now';
  const start = new Date(`${weekStart}T00:00:00Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  return `${fmt(start)} – ${fmt(end)}`;
}

/**
 * Rounds with the desk's extra questions merged in, the live one picked out, and everything
 * scored against the drinker's taste profile. Shared by the hub landing, Trivia and Taste pages.
 */
export function useRounds(hub: Pick<HubState, 'customQuestions' | 'roundSlug' | 'profile'>) {
  const rounds = useMemo(
    () =>
      TRIVIA_ROUNDS.map((round) => ({
        ...round,
        questions: [...round.questions, ...hub.customQuestions.filter((q) => q.roundSlug === round.slug)],
      })),
    [hub.customQuestions]
  );
  const live = rounds.find((round) => round.slug === hub.roundSlug) || rounds[0];
  const scoreOf = useCallback((round: TriviaRound) => matchScore(hub.profile, roundSignature(round)), [hub.profile]);
  const overall = useMemo(() => overallMatch(hub.profile, rounds.map(roundSignature)), [hub.profile, rounds]);
  const practice = useMemo(() => rankRounds(rounds.filter((r) => r.slug !== live.slug), scoreOf), [live.slug, scoreOf, rounds]);
  return { rounds, live, scoreOf, overall, practice };
}
