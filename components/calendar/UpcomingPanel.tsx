'use client';

import { CalendarClock, Sparkles } from 'lucide-react';
import type { CalendarItem } from '@/lib/calendar/buffers';
import { addDays, dateKey, isSameDay } from '@/lib/calendar/dates';

/** How many days ahead the panel previews. */
const DAYS_AHEAD = 5;

/** Colour coding shared with the rest of My 24 — by priority. */
const PRIORITY_STYLE: Record<CalendarItem['priority'], { dot: string; chip: string; label: string }> = {
  high:   { dot: 'bg-gold',        chip: 'border-gold/40 bg-gold/10 text-obsidian',         label: 'Focus' },
  normal: { dot: 'bg-champagne',   chip: 'border-champagne/40 bg-champagne/10 text-obsidian', label: 'Planned' },
  low:    { dot: 'bg-obsidian/30', chip: 'border-obsidian/15 bg-obsidian/[0.03] text-obsidian/70', label: 'Easy' },
};

interface Seed { title: string; priority: CalendarItem['priority']; time: string }

/**
 * Seeded sample activities shown as placeholders when a day has nothing real
 * planned yet — gives the panel life and shows what the days could hold.
 * Deterministic per weekday so they don't reshuffle on every render.
 */
const SEED_BY_WEEKDAY: Record<number, Seed[]> = {
  0: [{ title: 'Slow morning, no screens', priority: 'low', time: '09:30' }, { title: 'Call family', priority: 'normal', time: '17:00' }],
  1: [{ title: 'Deep work block', priority: 'high', time: '09:00' }, { title: 'Evening wind-down', priority: 'low', time: '20:30' }],
  2: [{ title: 'Workout', priority: 'normal', time: '07:30' }, { title: 'Focused execution', priority: 'high', time: '14:00' }],
  3: [{ title: 'Team catch-up', priority: 'normal', time: '11:00' }, { title: 'Read & reflect', priority: 'low', time: '21:00' }],
  4: [{ title: 'Wrap up the week', priority: 'high', time: '10:00' }, { title: 'Dinner with friends', priority: 'normal', time: '19:30' }],
  5: [{ title: 'Long walk outside', priority: 'low', time: '10:00' }, { title: 'Plan the week ahead', priority: 'normal', time: '18:00' }],
  6: [{ title: 'Lie-in & breakfast', priority: 'low', time: '10:00' }, { title: 'Something just for you', priority: 'normal', time: '15:00' }],
};

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function UpcomingPanel({
  items,
  onSelectDate,
}: {
  items: CalendarItem[];
  onSelectDate: (d: Date) => void;
}) {
  const today = new Date();
  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(today, i + 1));

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-white">
      <div className="sticky top-0 z-10 px-3 py-2.5 border-b border-obsidian/10 bg-white/95 backdrop-blur-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-obsidian/45 flex items-center gap-1.5">
          <CalendarClock size={12} className="text-gold" /> Next few days
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          {(['high', 'normal', 'low'] as const).map((p) => (
            <span key={p} className="flex items-center gap-1 text-[9px] uppercase tracking-wide text-obsidian/40">
              <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_STYLE[p].dot}`} />
              {PRIORITY_STYLE[p].label}
            </span>
          ))}
        </div>
      </div>

      <div className="divide-y divide-obsidian/8">
        {days.map((day) => {
          const real = items
            .filter((i) => i.status === 'active' && !i.is_rest_block && isSameDay(new Date(i.starts_at), day))
            .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at));
          const seeds = SEED_BY_WEEKDAY[day.getDay()] ?? [];

          return (
            <div key={dateKey(day)} className="px-3 py-2.5">
              <button
                type="button"
                onClick={() => onSelectDate(day)}
                className="group flex items-baseline gap-2 mb-1.5 text-left"
              >
                <span className="text-sm font-semibold text-obsidian group-hover:text-gold-dark transition-colors">
                  {day.toLocaleDateString('en-GB', { weekday: 'short' })}
                </span>
                <span className="text-xs text-obsidian/40">
                  {day.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              </button>

              <ul className="space-y-1">
                {real.map((it) => {
                  const s = PRIORITY_STYLE[it.priority];
                  return (
                    <li key={it.id} className={`flex items-center gap-2 px-2 py-1.5 border text-xs ${s.chip}`}>
                      <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      <span className="font-medium truncate">{it.title}</span>
                      <span className="ml-auto shrink-0 text-[10px] text-obsidian/40">{timeLabel(it.starts_at)}</span>
                    </li>
                  );
                })}

                {/* Seeded placeholders — clearly dashed/ghosted so they read as ideas, not commitments. */}
                {seeds.map((seed, i) => {
                  const s = PRIORITY_STYLE[seed.priority];
                  return (
                    <li
                      key={`seed-${i}`}
                      className="flex items-center gap-2 px-2 py-1.5 border border-dashed border-obsidian/15 bg-transparent text-xs text-obsidian/45"
                    >
                      <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${s.dot} opacity-50`} />
                      <span className="truncate italic">{seed.title}</span>
                      <Sparkles size={10} className="shrink-0 text-gold/40" />
                      <span className="ml-auto shrink-0 text-[10px] text-obsidian/30">{seed.time}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="px-3 py-3 text-[10px] text-obsidian/35 italic border-t border-obsidian/8">
        Dashed items are suggestions to fill your days — tap a date to plan it.
      </p>
    </div>
  );
}
