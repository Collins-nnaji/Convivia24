'use client';

import { Check, Clock, ShieldCheck } from 'lucide-react';
import type { CalendarItem } from '@/lib/calendar/buffers';
import { formatMinutes } from '@/lib/calendar/dayShape';

const PRIORITY_DOT: Record<CalendarItem['priority'], string> = {
  high: 'bg-gold',
  normal: 'bg-champagne',
  low: 'bg-obsidian/25',
};

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/** Next 2-3 concrete items, each with a quick complete/defer action, plus a
 *  "protect this gap" nudge when there's meaningful open time worth defending. */
export default function WhatsNextList({
  items,
  gap,
  onComplete,
  onDefer,
  onProtectGap,
  protecting,
}: {
  items: CalendarItem[];
  gap: { ends_at: string; minutes: number } | null;
  onComplete: (id: string) => void;
  onDefer: (item: CalendarItem) => void;
  onProtectGap: () => void;
  protecting: boolean;
}) {
  if (items.length === 0 && !gap) return null;

  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-obsidian/40 mb-2.5">What&rsquo;s next</p>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-obsidian/10 bg-white/70">
            <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[item.priority]}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-obsidian truncate">{item.title}</p>
              <p className="text-[11px] text-obsidian/40">{timeLabel(item.starts_at)}</p>
            </div>
            <button
              type="button"
              onClick={() => onDefer(item)}
              className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-obsidian/40 hover:text-obsidian transition-colors"
            >
              Defer
            </button>
            <button
              type="button"
              onClick={() => onComplete(item.id)}
              aria-label="Mark done"
              className="shrink-0 w-7 h-7 rounded-full border border-obsidian/15 flex items-center justify-center text-obsidian/40 hover:border-champagne hover:text-champagne transition-colors"
            >
              <Check size={13} />
            </button>
          </div>
        ))}

        {gap && (
          <button
            type="button"
            onClick={onProtectGap}
            disabled={protecting}
            className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-dashed border-gold/40 hover:border-gold bg-gold/[0.04] hover:bg-gold/[0.08] transition-colors disabled:opacity-50"
          >
            <span className="flex items-center gap-2 text-sm text-obsidian/70">
              <Clock size={14} className="text-gold-dark" />
              {formatMinutes(gap.minutes)} open before {timeLabel(gap.ends_at)}
            </span>
            <span className="shrink-0 flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.12em] text-gold-dark">
              <ShieldCheck size={13} /> {protecting ? 'Protecting…' : 'Protect it'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
