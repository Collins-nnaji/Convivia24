'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { dateKey, monthGridDays, startOfMonth } from '@/lib/calendar/dates';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DOT_DAYS = new Set([4, 18, 23, 26]);
const HIGHLIGHT_DAY = 21;

export default function CalendarAppPreview() {
  const today = useMemo(() => new Date(2026, 5, 21), []);
  const [month, setMonth] = useState(() => startOfMonth(today));
  const days = useMemo(() => monthGridDays(month), [month]);

  return (
    <div className="relative w-full max-w-[480px] lg:max-w-[560px] mx-auto lg:mx-0 pointer-events-none select-none">
      <div className="absolute -inset-3 rounded-[2.5rem] bg-gold/10 blur-2xl" aria-hidden />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        className="relative rounded-3xl bg-obsidian shadow-2xl shadow-obsidian/20 overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-3 bg-obsidian border-b border-white/5">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gold/80">My 24</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Live preview</span>
          </div>
        </div>

        <div className="bg-cream p-5 sm:p-7">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl sm:text-3xl italic text-obsidian">
              {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous month"
                className="w-8 h-8 flex items-center justify-center rounded-full text-obsidian/40 border border-obsidian/10"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-3.5 h-8 flex items-center text-[10px] font-black uppercase tracking-[0.15em] text-gold-dark border border-gold/30 rounded-full">
                Today
              </span>
              <button
                type="button"
                aria-label="Next month"
                className="w-8 h-8 flex items-center justify-center rounded-full text-obsidian/40 border border-obsidian/10"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center mb-2">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-1 text-[10px] font-black uppercase tracking-[0.1em] text-obsidian/35">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((day) => {
              const inMonth = day.getMonth() === month.getMonth();
              const dateNum = day.getDate();
              const isHighlighted = inMonth && dateNum === HIGHLIGHT_DAY;
              const hasDot = inMonth && DOT_DAYS.has(dateNum);
              const dotCount = dateNum === 18 ? 1 : dateNum === 23 ? 1 : dateNum === 26 ? 1 : dateNum === HIGHLIGHT_DAY ? 3 : 0;

              return (
                <div key={dateKey(day)} className="flex flex-col items-center gap-1.5 py-3.5">
                  <span
                    className={`w-8 h-8 flex items-center justify-center text-base rounded-full transition-colors ${
                      isHighlighted
                        ? 'bg-obsidian text-cream font-bold'
                        : !inMonth
                          ? 'text-obsidian/20'
                          : 'text-obsidian/80'
                    }`}
                  >
                    {dateNum}
                  </span>
                  {(hasDot || isHighlighted) && (
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: isHighlighted ? 3 : dotCount }).map((_, i) => (
                        <span key={i} className="w-1 h-1 rounded-full bg-gold" />
                      ))}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
