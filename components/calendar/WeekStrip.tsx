'use client';

import { dayLoadRatio, type CalendarItem } from '@/lib/calendar/buffers';
import { addDays, dateKey, isSameDay, startOfWeek } from '@/lib/calendar/dates';
import DayLoadRing from '@/components/calendar/DayLoadRing';

const PRIORITY_DOT: Record<CalendarItem['priority'], string> = {
  high: 'bg-gold',
  normal: 'bg-champagne',
  low: 'bg-obsidian/25',
};

/** Compact 7-day strip of the selected day's week — quick navigation when the
 *  full month calendar is collapsed (and the default view on mobile). */
export default function WeekStrip({
  selectedDate,
  items,
  onSelectDate,
}: {
  selectedDate: Date;
  items: CalendarItem[];
  onSelectDate: (d: Date) => void;
}) {
  const today = new Date();
  const weekStart = startOfWeek(selectedDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const byDay = new Map<string, CalendarItem[]>();
  for (const it of items) {
    if (it.status !== 'active' || it.is_rest_block) continue;
    const k = dateKey(new Date(it.starts_at));
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k)!.push(it);
  }

  return (
    <div className="grid grid-cols-7 gap-1 px-3 sm:px-4 py-2">
      {days.map((day) => {
        const isSel = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, today);
        const dayItems = byDay.get(dateKey(day)) ?? [];
        const loadRatio = dayLoadRatio(dayItems);

        const numberBadge = (
          <span className={`w-6 h-6 flex items-center justify-center text-sm font-medium ${isSel ? 'text-white' : isToday ? 'text-gold-dark font-bold' : 'text-obsidian/75'}`}>
            {day.getDate()}
          </span>
        );

        return (
          <button
            key={dateKey(day)}
            type="button"
            onClick={() => onSelectDate(day)}
            aria-current={isSel ? 'date' : undefined}
            className={`flex flex-col items-center gap-1 py-1.5 rounded-xl transition-colors ${
              isSel ? 'brand-gradient text-white' : 'hover:bg-obsidian/[0.04]'
            }`}
          >
            <span className={`text-[9px] font-bold uppercase tracking-wide ${isSel ? 'text-white/70' : 'text-obsidian/35'}`}>
              {day.toLocaleDateString('en-GB', { weekday: 'narrow' })}
            </span>
            {loadRatio > 0 && !isSel ? (
              <DayLoadRing ratio={loadRatio} className="w-7 h-7">
                {numberBadge}
              </DayLoadRing>
            ) : (
              numberBadge
            )}
            <span className="flex items-center gap-0.5 h-1.5">
              {dayItems.slice(0, 3).map((it) => (
                <span key={it.id} className={`w-1 h-1 rounded-full ${isSel ? 'bg-white/80' : PRIORITY_DOT[it.priority]}`} />
              ))}
            </span>
          </button>
        );
      })}
    </div>
  );
}
