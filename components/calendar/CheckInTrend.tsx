'use client';

import { useEffect, useState } from 'react';
import { MOOD_ORDER, moodLabel } from '@/lib/checkin/options';
import { dayLoadColor } from '@/components/calendar/DayLoadRing';

interface CheckIn { reflect_date: string; highlight: string | null; mood: string | null; energy: string | null }

const DAYS = 14;

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Last two weeks of mood check-ins as a simple bar trend — gaps (days without
 *  a check-in) render as a faint placeholder rather than being skipped, so the
 *  shape of the trend stays readable. */
export default function CheckInTrend() {
  const [byDate, setByDate] = useState<Map<string, CheckIn> | null>(null);

  useEffect(() => {
    fetch('/api/reflection')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const recent: CheckIn[] = d?.recent ?? [];
        setByDate(new Map(recent.map((r) => [r.reflect_date.slice(0, 10), r])));
      })
      .catch(() => setByDate(new Map()));
  }, []);

  if (!byDate) return null;

  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (DAYS - 1 - i));
    const key = dateKey(d);
    return {
      key,
      weekday: d.toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 1),
      checkIn: byDate.get(key) ?? null,
    };
  });

  if (!days.some((d) => d.checkIn?.mood)) {
    return <p className="text-sm text-obsidian/45">Tap a mood in your daily check-in to start building your trend.</p>;
  }

  return (
    <div>
      <div className="flex items-end gap-1.5 h-20">
        {days.map(({ key, checkIn }) => {
          const idx = checkIn?.mood ? MOOD_ORDER.indexOf(checkIn.mood) : -1;
          const ratio = idx >= 0 ? 1 - idx / (MOOD_ORDER.length - 1) : null;
          const heightPct = idx >= 0 ? 18 + (idx / (MOOD_ORDER.length - 1)) * 82 : 8;
          return (
            <div
              key={key}
              className={`flex-1 rounded-t-sm ${ratio === null ? 'bg-obsidian/5' : ''}`}
              style={ratio !== null ? { height: `${heightPct}%`, backgroundColor: dayLoadColor(ratio) } : { height: `${heightPct}%` }}
              title={checkIn?.mood ? moodLabel(checkIn.mood) ?? undefined : 'No check-in'}
            />
          );
        })}
      </div>
      <div className="flex gap-1.5 mt-1.5">
        {days.map(({ key, weekday }) => (
          <span key={key} className="flex-1 text-center text-[11px] text-obsidian/35">{weekday}</span>
        ))}
      </div>
    </div>
  );
}
