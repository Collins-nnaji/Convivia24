'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { dateKey, isSameDay, monthGridDays } from '@/lib/calendar/dates';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export interface CalendarEventDot {
  id: string;
  starts_at: string;
  title: string;
  slug?: string;
  city?: string;
  venue?: string | null;
}

interface EventMonthCalendarProps {
  month: Date;
  events: CalendarEventDot[];
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  compact?: boolean;
}

export default function EventMonthCalendar({
  month,
  events,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  compact = false,
}: EventMonthCalendarProps) {
  const today = new Date();
  const days = monthGridDays(month);

  const eventsByDay = new Map<string, CalendarEventDot[]>();
  for (const ev of events) {
    const key = dateKey(new Date(ev.starts_at));
    if (!eventsByDay.has(key)) eventsByDay.set(key, []);
    eventsByDay.get(key)!.push(ev);
  }

  return (
    <div className="h-full bg-surface-elevated overflow-hidden flex flex-col rounded-2xl border border-ink/8 shadow-soft">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-ink/8 shrink-0">
        <h2 className="font-display text-xl sm:text-2xl italic text-ink">
          {month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={onPrevMonth} aria-label="Previous month" className="touch-target flex items-center justify-center rounded-full text-ink-muted hover:text-ink hover:bg-ink/5">
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={onToday}
            className="px-3 h-8 text-[10px] font-bold uppercase tracking-[0.16em] text-copper-deep border border-copper/30 hover:border-copper rounded-full transition-colors"
          >
            Today
          </button>
          <button type="button" onClick={onNextMonth} aria-label="Next month" className="touch-target flex items-center justify-center rounded-full text-ink-muted hover:text-ink hover:bg-ink/5">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center border-b border-ink/8 bg-surface-sunken/50">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted/70">
            {compact ? w.slice(0, 1) : w}
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
          className="grid grid-cols-7 flex-1"
        >
          {days.map((day) => {
            const inMonth = day.getMonth() === month.getMonth();
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, selectedDate);
            const dayEvents = eventsByDay.get(dateKey(day)) ?? [];

            return (
              <button
                key={dateKey(day)}
                type="button"
                onClick={() => onSelectDate(day)}
                aria-current={isSelected ? 'date' : undefined}
                className={`relative min-h-[52px] sm:min-h-[72px] p-1 sm:p-1.5 border-b border-r border-ink/5 flex flex-col items-start gap-1 text-left transition-colors ${
                  isSelected ? 'bg-copper/10 ring-1 ring-inset ring-copper/40' : 'hover:bg-surface-sunken/80'
                }`}
              >
                <span
                  className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs sm:text-sm rounded-full transition-colors ${
                    isToday ? 'bg-copper text-white font-bold' : !inMonth ? 'text-ink-muted/30' : 'text-ink/80'
                  }`}
                >
                  {day.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <span className="flex flex-wrap items-center gap-1 px-0.5">
                    {dayEvents.slice(0, compact ? 2 : 3).map((ev) => (
                      <span key={ev.id} className={`w-1.5 h-1.5 rounded-full bg-copper ${inMonth ? '' : 'opacity-40'}`} title={ev.title} />
                    ))}
                    {dayEvents.length > (compact ? 2 : 3) && (
                      <span className="text-[9px] text-ink-muted">+{dayEvents.length - (compact ? 2 : 3)}</span>
                    )}
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
