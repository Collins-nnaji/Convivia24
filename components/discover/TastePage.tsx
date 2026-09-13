'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Pencil } from 'lucide-react';
import TasteProfileEditor from '@/components/trivia/TasteProfileEditor';
import CocktailMaker from '@/components/trivia/CocktailMaker';
import { HouseGlyph } from '@/components/trivia/TriviaIcons';
import { useTriviaHub } from '@/components/trivia/use-hub';
import { hasTasteProfile, preferenceBreakdown, tasteHighlights, tastePersonality, type TasteProfile } from '@/lib/trivia/taste';
import { useRounds } from './useRounds';

/** Circular match gauge — the headline number on the taste page. */
export function MatchRing({ value, size = 112 }: { value: number; size?: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor" className="text-ember/12" strokeWidth="6" />
        <motion.circle
          cx="40" cy="40" r={r} fill="none" stroke="currentColor" className="text-ember" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - value / 100) }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-logo text-2xl font-black leading-none tabular-nums">{value}%</span>
        <span className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-obsidian/45">match</span>
      </div>
    </div>
  );
}

/**
 * Taste & mix — your profile and the bar in one place. The profile is what you like; the maker
 * below turns it into something you can pour tonight.
 */
export default function TastePage() {
  const hub = useTriviaHub();
  const { rounds, scoreOf, overall } = useRounds(hub);
  const [editing, setEditing] = useState(false);
  const built = hasTasteProfile(hub.profile);
  const personality = tastePersonality(hub.profile);
  const breakdown = preferenceBreakdown(hub.profile);
  const ranked = rounds.map((r) => ({ round: r, match: scoreOf(r) })).sort((a, b) => b.match - a.match).slice(0, 4);

  function save(next: TasteProfile) {
    void hub.saveProfile(next);
  }

  return (
    <>
      <AnimatePresence>
        {editing && <TasteProfileEditor initial={hub.profile} onSave={save} onClose={() => setEditing(false)} />}
      </AnimatePresence>

      <div className="space-y-4 p-4 sm:p-6">
        {/* ── Profile ─────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid gap-4 rounded-2xl bg-paper/60 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
        >
          <div className="flex items-start gap-5">
            {built ? (
              <MatchRing value={overall} />
            ) : (
              <div className="grid h-28 w-28 shrink-0 place-items-center rounded-full border-2 border-dashed border-ember/30"> </div>
            )}
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ember">Your taste</p>
              <h1 className="mt-1 font-wordmark text-2xl leading-tight text-obsidian sm:text-4xl">
                {built && personality ? personality.name : 'Not built yet'}
              </h1>
              {built ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tasteHighlights(hub.profile as TasteProfile, 6).map((chip) => (
                    <span key={chip} className="rounded-full bg-ember/8 px-3 py-1.5 text-[13px] font-semibold text-ember">{chip}</span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-[15px] text-obsidian/60">Four questions. Every round, bottle and reward starts matching you.</p>
              )}
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="btn-brand mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em]"
              >
                {built && <Pencil size={14} />} {built ? 'Edit' : 'Build my profile'}
              </button>
            </div>
          </div>

          {built && breakdown.length > 0 && (
            <ul className="grid content-start gap-3 border-t border-obsidian/8 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              {breakdown.map((row) => (
                <li key={row.label}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[13px] font-semibold text-obsidian/55">{row.label}</span>
                    <span className="truncate text-[14px] font-bold text-obsidian">{row.value}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-obsidian/[0.06]">
                    <motion.div className="h-full rounded-full bg-ember" initial={{ width: 0 }} animate={{ width: `${row.strength}%` }} transition={{ duration: 0.6, delay: 0.15 }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.section>

        {/* ── Houses that fit ─────────────────────────────── */}
        {built && (
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.08 }}>
            <div className="mb-2 flex items-baseline justify-between gap-3 px-1">
              <h2 className="text-[13px] font-bold uppercase tracking-[0.16em] text-obsidian/55">Houses that fit you</h2>
              <Link href="/discover/trivia" className="text-[13px] font-bold text-ember">Play a round →</Link>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {ranked.map(({ round, match }, i) => (
                <motion.li
                  key={round.slug}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.05 }}
                  className="flex items-center gap-3 rounded-2xl border border-obsidian/10 bg-white px-4 py-3"
                >
                  <HouseGlyph glyph={round.glyph} className="h-9 w-9 shrink-0 text-ember/55" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-bold text-obsidian">{round.brand}</p>
                    <p className="truncate text-[12px] text-obsidian/45">{round.house}</p>
                  </div>
                  <span className={`text-[16px] font-black tabular-nums ${match >= 70 ? 'text-ember' : 'text-obsidian/45'}`}>{match}%</span>
                </motion.li>
              ))}
            </ul>
          </motion.section>
        )}

        {/* ── The bar ─────────────────────────────────────── */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.14 }}>
          <div className="mb-2 px-1">
            <h2 className="text-[13px] font-bold uppercase tracking-[0.16em] text-obsidian/55">Mix something</h2>
            <p className="text-[14px] text-obsidian/55">The AI bartender, tuned to your profile.</p>
          </div>
          <CocktailMaker profile={hub.profile} embedded />
        </motion.section>
      </div>
    </>
  );
}
