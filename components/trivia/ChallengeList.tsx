'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Camera, Check, ChevronRight, HelpCircle, Star, Users } from 'lucide-react';
import { CHALLENGES, type Challenge } from '@/lib/trivia/challenges';

const ICONS = { HelpCircle, Star, Camera, Users } as const;

/** The Discover tab shows a shortlist; the Challenges tab holds the full set. */
const PREVIEW_COUNT = 4;

export default function ChallengeList({
  claimed,
  weekStart,
  signedIn,
  onPlay,
  onViewAll,
}: {
  claimed: Record<string, string>;
  weekStart: string | null;
  signedIn: boolean;
  onPlay: () => void;
  onViewAll: () => void;
}) {
  /** A weekly challenge is done only if it was claimed in *this* week. */
  function isDone(c: Challenge): boolean {
    const key = claimed[c.id];
    if (!key) return false;
    return c.cadence === 'once' ? true : key === (weekStart || 'current');
  }

  return (
    <section className="bg-white border border-obsidian/8 h-full">
      <div className="px-5 sm:px-6 py-4 border-b border-obsidian/8 flex items-center justify-between gap-4">
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50">Challenges & earn</h2>
        <button
          type="button"
          onClick={onViewAll}
          className="text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/40 hover:text-ember inline-flex items-center gap-1 transition-colors"
        >
          View all <ChevronRight size={13} />
        </button>
      </div>

      <ul className="divide-y divide-obsidian/6">
        {CHALLENGES.slice(0, PREVIEW_COUNT).map((c, i) => {
          const Icon = ICONS[c.icon as keyof typeof ICONS] ?? HelpCircle;
          const done = isDone(c);
          return (
            <motion.li
              key={c.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="px-5 sm:px-6 py-4 flex items-center gap-4"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                  done ? 'bg-ember text-white' : 'bg-ember/8 text-ember'
                }`}
              >
                {done ? <Check size={18} /> : <Icon size={18} />}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm leading-snug">{c.name}</p>
                <p className="text-[12px] text-obsidian/45 mt-0.5 truncate">{c.detail}</p>
              </div>

              <p className="text-[12px] font-bold text-obsidian/60 tabular-nums shrink-0 hidden sm:block">
                {c.points} pts
              </p>

              {c.status === 'soon' ? (
                <span className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-obsidian/35 border border-obsidian/10 shrink-0">
                  Soon
                </span>
              ) : done ? (
                <span className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-ember shrink-0">
                  Earned
                </span>
              ) : c.action.kind === 'play' ? (
                <button
                  type="button"
                  onClick={onPlay}
                  className="px-4 py-2.5 btn-brand text-[10px] font-black uppercase tracking-[0.12em] shrink-0"
                >
                  Play
                </button>
              ) : (
                <Link
                  href={c.action.href}
                  className="px-4 py-2.5 btn-brand text-[10px] font-black uppercase tracking-[0.12em] shrink-0"
                >
                  {c.action.label}
                </Link>
              )}
            </motion.li>
          );
        })}
      </ul>

      {!signedIn && (
        <p className="px-5 sm:px-6 py-3.5 border-t border-obsidian/8 bg-paper/60 text-[12px] text-obsidian/50">
          Sign in to bank the points you earn — you can still play every round signed out.
        </p>
      )}
    </section>
  );
}
