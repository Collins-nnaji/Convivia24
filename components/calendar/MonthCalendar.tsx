'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CalendarItem } from '@/lib/calendar/buffers';
import { dateKey, isSameDay, monthGridDays } from '@/lib/calendar/dates';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const PRIORITY_DOT: Record<CalendarItem['priority'], string> = {
  high: 'bg-rose-400',
  normal: 'bg-gold',
  low: 'bg-obsidian/25',
};

export default function MonthCalendar({
  month,
  items,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}: {
  month: Date;
  items: CalendarItem[];
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}) {
  const today = new Date();
  const days = monthGridDays(month);

  const itemsByDay = new Map<string, CalendarItem[]>();
  for (const item of items) {
    const key = dateKey(new Date(item.starts_at));
    if (!itemsByDay.has(key)) itemsByDay.set(key, []);
    itemsByDay.get(key)!.push(item);
  }

  return (
    <div className="border border-obsidian/10 bg-white/70 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-obsidian/10">
        <h2 className="font-display text-xl sm:text-2xl italic text-obsidian">
          {month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onPrevMonth}
            aria-label="Previous month"
            className="w-8 h-8 flex items-center justify-center text-obsidian/40 hover:text-obsidian hover:bg-cream/70 rounded-full transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            onClick={onToday}
            className="px-3 h-8 text-[10px] font-black uppercase tracking-[0.15em] text-gold-dark hover:text-obsidian border border-gold/30 hover:border-gold rounded-full transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            aria-label="Next month"
            className="w-8 h-8 flex items-center justify-center text-obsidian/40 hover:text-obsidian hover:bg-cream/70 rounded-full transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center border-b border-obsidian/10">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-2 text-[10px] font-black uppercase tracking-[0.15em] text-obsidian/35">
            {w}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={dateKey(month)}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="grid grid-cols-7"
        >
          {days.map((day) => {
            const inMonth = day.getMonth() === month.getMonth();
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, selectedDate);
            const dayItems = itemsByDay.get(dateKey(day)) ?? [];

            return (
              <button
                key={dateKey(day)}
                type="button"
                onClick={() => onSelectDate(day)}
                aria-current={isSelected ? 'date' : undefined}
                className={`relative min-h-[58px] sm:min-h-[88px] p-1.5 sm:p-2.5 border-b border-r border-obsidian/5 flex flex-col items-start gap-1.5 text-left transition-colors ${
                  isSelected ? 'bg-gold/10 ring-1 ring-inset ring-gold/50' : 'hover:bg-cream/60'
                }`}
              >
                <span
                  className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm rounded-full transition-colors ${
                    isToday ? 'bg-gold-dark text-cream font-bold' : !inMonth ? 'text-obsidian/25' : 'text-obsidian/70'
                  }`}
                >
                  {day.getDate()}
                </span>
                {dayItems.length > 0 && (
                  <span className="flex flex-wrap items-center gap-1">
                    {dayItems.slice(0, 4).map((it) => (
                      <span
                        key={it.id}
                        className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[it.priority]} ${inMonth ? '' : 'opacity-40'}`}
                      />
                    ))}
                    {dayItems.length > 4 && <span className="text-[9px] text-obsidian/40">+{dayItems.length - 4}</span>}
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
