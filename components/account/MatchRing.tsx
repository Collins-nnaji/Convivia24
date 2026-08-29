'use client';

import { motion } from 'framer-motion';

/** Circular match gauge, sized for the account pages. */
export default function MatchRing({ value, size = 108 }: { value: number; size?: number }) {
  const r = 42;
  const circumference = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" className="text-ember/12" strokeWidth="7" />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-ember"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - value / 100) }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-logo font-black text-2xl leading-none tabular-nums">{value}%</span>
        <span className="text-[8px] font-black uppercase tracking-[0.16em] text-obsidian/40 mt-1">
          Match score
        </span>
      </div>
    </div>
  );
}
