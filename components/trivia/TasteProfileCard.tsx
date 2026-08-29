'use client';

import { motion } from 'framer-motion';
import { Lightbulb, Pencil, Sparkles } from 'lucide-react';
import { hasTasteProfile, tasteHighlights, type TasteProfile } from '@/lib/trivia/taste';

/** Circular match gauge — the headline number on the taste card. */
function MatchRing({ value }: { value: number }) {
  const r = 34;
  const circumference = 2 * Math.PI * r;
  return (
    <div className="relative w-[86px] h-[86px] shrink-0">
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90" aria-hidden>
        <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor" className="text-ember/12" strokeWidth="6" />
        <motion.circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-ember"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - value / 100) }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-logo font-black text-xl leading-none tabular-nums">{value}%</span>
        <span className="text-[8px] font-black uppercase tracking-[0.16em] text-obsidian/40 mt-0.5">Match</span>
      </div>
    </div>
  );
}

export default function TasteProfileCard({
  profile,
  match,
  onEdit,
}: {
  profile: TasteProfile | null;
  match: number;
  onEdit: () => void;
}) {
  const built = hasTasteProfile(profile);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white border border-obsidian/8 shadow-[0_18px_50px_-30px_rgba(10,10,10,0.45)]"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/45">Your taste profile</p>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/45 hover:text-ember transition-colors"
          >
            {built ? 'Edit' : 'Build'} <Pencil size={12} />
          </button>
        </div>

        {built ? (
          <div className="flex items-start gap-5">
            <MatchRing value={match} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-obsidian/70 mb-2">You love</p>
              <div className="flex flex-wrap gap-1.5">
                {tasteHighlights(profile).map((chip) => (
                  <span
                    key={chip}
                    className="px-2.5 py-1 bg-ember/6 text-ember text-[11px] font-medium rounded-full"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <div className="w-[86px] h-[86px] shrink-0 rounded-full border-2 border-dashed border-ember/25 flex items-center justify-center">
              <Sparkles size={22} className="text-ember/45" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-obsidian/65 leading-relaxed mb-3">
                Four quick questions and every round, bottle and reward on this page starts matching what you
                actually drink.
              </p>
              <button
                type="button"
                onClick={onEdit}
                className="px-5 py-2.5 btn-brand text-[10px] font-black uppercase tracking-[0.14em]"
              >
                Build my profile
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 sm:px-6 py-3.5 border-t border-obsidian/8 bg-paper/60 flex items-start gap-2.5">
        <Lightbulb size={15} className="text-ember/60 shrink-0 mt-0.5" />
        <p className="text-[12px] text-obsidian/50 leading-relaxed">
          {built
            ? 'Keep playing rounds and rating bottles to sharpen your recommendations.'
            : 'Nothing you tell us here is shared with brands — it only shapes what you see.'}
        </p>
      </div>
    </motion.div>
  );
}
