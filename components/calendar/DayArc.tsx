'use client';

import type { CalendarItem } from '@/lib/calendar/buffers';
import { classifyEnergy, type EnergyType } from '@/lib/calendar/dayShape';

const ENERGY_COLOR: Record<EnergyType, string> = {
  work: 'bg-gold-dark',
  social: 'bg-rose-400',
  rest: 'bg-champagne/70',
  open: 'bg-transparent',
};

const LEGEND: { type: EnergyType; label: string; swatch: string }[] = [
  { type: 'work', label: 'Work', swatch: 'bg-gold-dark' },
  { type: 'social', label: 'Social', swatch: 'bg-rose-400' },
  { type: 'rest', label: 'Rest', swatch: 'bg-champagne/70' },
  { type: 'open', label: 'Open', swatch: 'bg-obsidian/[0.05] border border-obsidian/15' },
];

const DAY_MS = 24 * 60 * 60000;

function pct(d: Date, dayStart: Date): number {
  return Math.max(0, Math.min(100, ((+d - +dayStart) / DAY_MS) * 100));
}

/**
 * Today's shape as a single horizontal bar — work/social/rest segments laid
 * out across the 24h, with a live "now" marker. Open space is left blank.
 */
export default function DayArc({ items, now }: { items: CalendarItem[]; now: Date }) {
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  const segments = items
    .filter((i) => i.status === 'active')
    .map((i) => {
      const left = pct(new Date(i.starts_at), dayStart);
      const right = pct(new Date(i.ends_at), dayStart);
      return { id: i.id, left, width: Math.max(right - left, 0.5), type: classifyEnergy(i) };
    });

  const nowPct = pct(now, dayStart);

  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-obsidian/40 mb-2.5">Your 24, at a glance</p>
      <div className="relative w-full h-9 sm:h-11 rounded-full bg-obsidian/[0.04] overflow-hidden">
        {[25, 50, 75].map((p) => (
          <div key={p} className="absolute top-0 bottom-0 w-px bg-obsidian/10" style={{ left: `${p}%` }} />
        ))}
        {segments.map((s) => (
          <div
            key={s.id}
            className={`absolute top-0 bottom-0 ${ENERGY_COLOR[s.type]}`}
            style={{ left: `${s.left}%`, width: `${s.width}%` }}
          />
        ))}
        <div
          className="absolute top-0 bottom-0 w-[3px] -ml-[1.5px] rounded-full bg-obsidian"
          style={{ left: `${nowPct}%` }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-obsidian/30 mt-1 px-1">
        <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>12am</span>
      </div>
      <div className="flex items-center gap-3 sm:gap-4 mt-3 flex-wrap">
        {LEGEND.map((l) => (
          <span key={l.type} className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-obsidian/40">
            <span className={`w-2 h-2 rounded-full ${l.swatch}`} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}
