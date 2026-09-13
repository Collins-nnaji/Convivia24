'use client';

import { createContext, createElement, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { EMPTY_TASTE_PROFILE, sanitizeProfile, type TasteProfile } from '@/lib/trivia/taste';
import { TRIVIA_ROUNDS } from '@/lib/trivia/catalog';
import type { ChallengeMeter } from '@/lib/trivia/challenges';
import type { CustomTriviaQuestion } from '@/lib/trivia/custom-questions';

const PROFILE_KEY = 'c24.taste-profile';

export type HubStanding = {
  claimed: boolean;
  points: number;
  tierName: string;
  discountPct: number;
  nextTierName: string | null;
  pointsToNextTier: number;
};

export type HubState = {
  loading: boolean;
  signedIn: boolean;
  roundSlug: string;
  weekStart: string | null;
  standing: HubStanding | null;
  profile: TasteProfile | null;
  /** challengeId → periodKey it was last claimed in. */
  claimed: Record<string, string>;
  /** Counted progress signals behind the challenge bars. */
  meters: Record<ChallengeMeter, number>;
  customQuestions: CustomTriviaQuestion[];
};

const NO_METERS: HubState['meters'] = {
  'trivia-rounds': 0,
  'reviews-written': 0,
  'orders-paid': 0,
  'categories-bought': 0,
};

/** Guests keep their profile locally so the page still personalises signed out. */
function readLocalProfile(): TasteProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = sanitizeProfile(JSON.parse(raw));
    return parsed.spirits.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function writeLocalProfile(profile: TasteProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* private mode — the profile just does not persist */
  }
}

export function useTriviaHubSource({ enabled = true }: { enabled?: boolean } = {}) {
  const [state, setState] = useState<HubState>({
    loading: true,
    signedIn: false,
    roundSlug: TRIVIA_ROUNDS[0].slug,
    weekStart: null,
    standing: null,
    profile: null,
    claimed: {},
    meters: NO_METERS,
    customQuestions: [],
  });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const local = readLocalProfile();

    fetch('/api/trivia/hub')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setState((s) => ({ ...s, loading: false, profile: local }));
          return;
        }
        const remote = data.profile ? sanitizeProfile(data.profile) : null;
        const profile = remote && remote.spirits.length > 0 ? remote : local;
        const claimed: Record<string, string> = {};
        for (const c of data.completions || []) claimed[c.challengeId] = c.periodKey;
        setState({
          loading: false,
          signedIn: Boolean(data.signedIn),
          roundSlug: data.roundSlug || TRIVIA_ROUNDS[0].slug,
          weekStart: data.weekStart ?? null,
          standing: data.standing || null,
          profile,
          claimed,
          meters: { ...NO_METERS, ...(data.meters || {}) },
          customQuestions: data.customQuestions || [],
        });
      })
      .catch(() => {
        if (!cancelled) setState((s) => ({ ...s, loading: false, profile: local }));
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  /** Optimistic locally, persisted server-side when there is an account to hang it on. */
  const saveProfile = useCallback(async (next: TasteProfile) => {
    const clean = sanitizeProfile(next);
    setState((s) => ({ ...s, profile: clean }));
    writeLocalProfile(clean);
    try {
      await fetch('/api/trivia/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: clean }),
      });
    } catch {
      /* the local copy still stands */
    }
  }, []);

  /** Award the challenge's points. Returns null when nothing was paid out. */
  const claimChallenge = useCallback(
    async (challengeId: string, roundSlug: string, answers: number[]) => {
      try {
        const res = await fetch('/api/trivia/challenge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ challengeId, roundSlug, answers }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return { error: String(data.error || 'Could not award your points.') };
        setState((s) => ({
          ...s,
          standing: s.standing ? { ...s.standing, points: data.points ?? s.standing.points } : s.standing,
          claimed: { ...s.claimed, [challengeId]: s.weekStart || 'current' },
        }));
        return { awarded: Boolean(data.awarded), pointsAwarded: Number(data.pointsAwarded || 0) };
      } catch {
        return { error: 'Could not award your points.' };
      }
    },
    []
  );

  return { ...state, saveProfile, claimChallenge, emptyProfile: EMPTY_TASTE_PROFILE };
}

export type TriviaHub = ReturnType<typeof useTriviaHubSource>;

const HubContext = createContext<TriviaHub | null>(null);

/**
 * One fetch per page tree. Wrap a layout in this and every `useTriviaHub()` below it shares the
 * same state — the Discover rail and its sections used to each call /api/trivia/hub on mount.
 */
export function TriviaHubProvider({ children }: { children: ReactNode }) {
  const hub = useTriviaHubSource();
  return createElement(HubContext.Provider, { value: hub }, children);
}

/** The shared hub when a provider is above, otherwise its own fetch (account pages, etc.). */
export function useTriviaHub(): TriviaHub {
  const shared = useContext(HubContext);
  // Hooks must run unconditionally, so the standalone source exists either way but only fetches
  // when there is no provider to share from.
  const own = useTriviaHubSource({ enabled: shared === null });
  return shared ?? own;
}
