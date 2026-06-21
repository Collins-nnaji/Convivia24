'use client';

import { useState } from 'react';
import { CalendarClock, Plus, Check } from 'lucide-react';
import type { CalendarItem } from '@/lib/calendar/buffers';
import { addDays, dateKey, isSameDay } from '@/lib/calendar/dates';
import { seedsForDay, seedToTimes, type DaySeed } from '@/lib/calendar/seeds';

/** How many days ahead the panel previews. */
const DAYS_AHEAD = 5;

const PRIORITY_STYLE: Record<CalendarItem['priority'], { dot: string; chip: string; label: string }> = {
  high:   { dot: 'bg-gold',        chip: 'border-gold/40 bg-gold/[0.07] text-obsidian',          label: 'Focus' },
  normal: { dot: 'bg-champagne',   chip: 'border-champagne/40 bg-champagne/[0.08] text-obsidian', label: 'Planned' },
  low:    { dot: 'bg-obsidian/30', chip: 'border-obsidian/12 bg-obsidian/[0.02] text-obsidian/70', label: 'Easy' },
};

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function UpcomingPanel({
  items,
  onSelectDate,
  onAddSeed,
}: {
  items: CalendarItem[];
  onSelectDate: (d: Date) => void;
  onAddSeed?: (day: Date, seed: DaySeed) => Promise<void> | void;
}) {
  const today = new Date();
  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(today, i + 1));
  const [addedKeys, setAddedKeys] = useState<Set<string>>(new Set());

  async function addSeed(day: Date, seed: DaySeed) {
    const key = `${dateKey(day)}-${seed.title}`;
    if (addedKeys.has(key) || !onAddSeed) return;
    await onAddSeed(day, seed);
    setAddedKeys((s) => new Set(s).add(key));
  }

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
          const seeds = seedsForDay(day);

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
                    <li key={it.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border text-xs ${s.chip}`}>
                      <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      <span className="font-medium truncate">{it.title}</span>
                      <span className="ml-auto shrink-0 text-[10px] text-obsidian/40">{timeLabel(it.starts_at)}</span>
                    </li>
                  );
                })}

                {/* Seeded ideas — dashed, with one-tap add. */}
                {seeds.map((seed, i) => {
                  const key = `${dateKey(day)}-${seed.title}`;
                  const added = addedKeys.has(key);
                  const s = PRIORITY_STYLE[seed.priority];
                  return (
                    <li
                      key={`seed-${i}`}
                      className="group flex items-center gap-2 px-2 py-1.5 rounded-lg border border-dashed border-obsidian/15 bg-transparent text-xs text-obsidian/45"
                    >
                      <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${s.dot} opacity-50`} />
                      <span className="truncate italic">{seed.title}</span>
                      <span className="ml-auto shrink-0 text-[10px] text-obsidian/30">{seed.time}</span>
                      {onAddSeed && (
                        <button
                          type="button"
                          onClick={() => addSeed(day, seed)}
                          disabled={added}
                          aria-label={added ? 'Added' : `Add ${seed.title}`}
                          className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                            added ? 'text-gold-dark' : 'text-obsidian/25 hover:text-gold hover:bg-gold/10'
                          }`}
                        >
                          {added ? <Check size={12} /> : <Plus size={12} />}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="px-3 py-3 text-[10px] text-obsidian/35 italic border-t border-obsidian/8">
        Dashed items are gentle suggestions — tap + to add one, or tap a date to plan it.
      </p>
    </div>
  );
}
