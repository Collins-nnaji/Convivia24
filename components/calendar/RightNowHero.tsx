'use client';

import { Check, Plus } from 'lucide-react';
import type { CalendarItem } from '@/lib/calendar/buffers';
import { formatMinutes } from '@/lib/calendar/dayShape';

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/** The single boldest thing on My 24 — what's happening right now, or what's next. */
export default function RightNowHero({
  current,
  next,
  now,
  onComplete,
  onAddNow,
}: {
  current: CalendarItem | null;
  next: CalendarItem | null;
  now: Date;
  onComplete: (id: string) => void;
  onAddNow: () => void;
}) {
  if (current) {
    const remainingMins = (+new Date(current.ends_at) - +now) / 60000;
    return (
      <div className="rounded-3xl border border-gold/25 bg-gradient-to-br from-gold/[0.09] to-transparent p-6 sm:p-8">
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-gold-dark mb-2.5">Right now</p>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-3xl sm:text-4xl font-light italic text-obsidian leading-tight">{current.title}</h2>
            <p className="text-obsidian/50 text-sm mt-2">Until {timeLabel(current.ends_at)} · {formatMinutes(remainingMins)} left</p>
          </div>
          <button
            type="button"
            onClick={() => onComplete(current.id)}
            aria-label="Mark done"
            className="btn-brand shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
          >
            <Check size={18} />
          </button>
        </div>
      </div>
    );
  }

  if (next) {
    const startsInMins = (+new Date(next.starts_at) - +now) / 60000;
    return (
      <div className="rounded-3xl border border-obsidian/10 bg-white/70 p-6 sm:p-8">
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-gold-dark mb-2.5">Coming up</p>
        <h2 className="font-display text-3xl sm:text-4xl font-light italic text-obsidian leading-tight">{next.title}</h2>
        <p className="text-obsidian/50 text-sm mt-2">Starts in {formatMinutes(startsInMins)}, at {timeLabel(next.starts_at)}</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-obsidian/10 bg-white/70 p-6 sm:p-8">
      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-gold-dark mb-2.5">Right now</p>
      <h2 className="font-display text-3xl sm:text-4xl font-light italic text-obsidian leading-tight">Open.</h2>
      <p className="text-obsidian/50 text-sm mt-2 mb-4">Nothing on the books — a good moment to focus, rest, or add what matters.</p>
      <button
        type="button"
        onClick={onAddNow}
        className="btn-brand inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.15em]"
      >
        <Plus size={14} /> Add something
      </button>
    </div>
  );
}
