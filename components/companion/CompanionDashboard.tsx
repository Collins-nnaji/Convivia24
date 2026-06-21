'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Target, ArrowDownCircle, OctagonX, CalendarPlus, Check } from 'lucide-react';

export interface PriorityItem { title: string; why?: string }
export interface ScheduleBlock { title: string; starts_at: string; ends_at: string; priority: 'low' | 'normal' | 'high' }
export interface Dashboard {
  summary?: string;
  focus?: PriorityItem[];
  deprioritize?: PriorityItem[];
  stop?: PriorityItem[];
  schedule?: ScheduleBlock[];
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}
function dayLabel(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

const SCHEDULE_PRIORITY: Record<ScheduleBlock['priority'], string> = {
  high:   'border-l-emerald-500',
  normal: 'border-l-gold',
  low:    'border-l-obsidian/20',
};

const COLUMNS = [
  {
    key: 'focus' as const,
    label: 'Focus now',
    icon: Target,
    head: 'text-emerald-700',
    card: 'border-emerald-200 bg-emerald-50/60',
    dot: 'bg-emerald-500',
  },
  {
    key: 'deprioritize' as const,
    label: 'Deprioritize',
    icon: ArrowDownCircle,
    head: 'text-amber-700',
    card: 'border-amber-200 bg-amber-50/60',
    dot: 'bg-amber-500',
  },
  {
    key: 'stop' as const,
    label: 'Stop / drop',
    icon: OctagonX,
    head: 'text-rose-700',
    card: 'border-rose-200 bg-rose-50/60',
    dot: 'bg-rose-500',
  },
];

export default function CompanionDashboard({
  dashboard,
  onAddSchedule,
}: {
  dashboard: Dashboard;
  onAddSchedule: (blocks: ScheduleBlock[]) => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const schedule = dashboard.schedule ?? [];

  async function addAll() {
    if (!schedule.length || adding || added) return;
    setAdding(true);
    try {
      await onAddSchedule(schedule);
      setAdded(true);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="rounded-2xl border border-obsidian/10 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3.5 brand-gradient text-white">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/55">Your plan</p>
        {dashboard.summary && <p className="font-display text-lg italic mt-0.5 leading-snug">{dashboard.summary}</p>}
      </div>

      {/* Prioritised columns — traffic-light coded */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-obsidian/8">
        {COLUMNS.map((col) => {
          const items = dashboard[col.key] ?? [];
          if (!items.length) return (
            <div key={col.key} className="p-3">
              <p className={`text-[10px] font-black uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5 ${col.head}`}>
                <col.icon size={12} /> {col.label}
              </p>
              <p className="text-xs text-obsidian/30 italic">—</p>
            </div>
          );
          return (
            <div key={col.key} className="p-3">
              <p className={`text-[10px] font-black uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5 ${col.head}`}>
                <col.icon size={12} /> {col.label}
              </p>
              <ul className="space-y-1.5">
                {items.map((it, i) => (
                  <li key={i} className={`px-2.5 py-2 border ${col.card}`}>
                    <div className="flex items-start gap-1.5">
                      <span className={`mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full ${col.dot}`} />
                      <div className="min-w-0">
                        <p className="text-sm text-obsidian font-medium leading-snug">{it.title}</p>
                        {it.why && <p className="text-[11px] text-obsidian/45 leading-snug mt-0.5">{it.why}</p>}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Daily plan / schedule */}
      {schedule.length > 0 && (
        <div className="border-t border-obsidian/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-obsidian/45 mb-2">Daily plan</p>
          <ul className="space-y-1.5 mb-3">
            {schedule.map((b, i) => (
              <li key={i} className={`flex items-center gap-2 pl-2.5 py-1.5 border border-obsidian/10 border-l-2 ${SCHEDULE_PRIORITY[b.priority]} bg-white`}>
                <span className="text-[10px] font-medium uppercase tracking-wide text-obsidian/40 shrink-0 w-28">
                  {dayLabel(b.starts_at)}
                </span>
                <span className="text-[11px] text-obsidian/50 shrink-0 w-24">
                  {timeLabel(b.starts_at)}–{timeLabel(b.ends_at)}
                </span>
                <span className="text-sm text-obsidian truncate">{b.title}</span>
              </li>
            ))}
          </ul>
          {added ? (
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-emerald-700 flex items-center gap-1.5"><Check size={13} /> Added to My 24</p>
              <Link href="/my24" className="text-xs font-semibold text-gold-dark hover:text-obsidian transition-colors">
                Open My 24 →
              </Link>
            </div>
          ) : (
            <button
              onClick={addAll}
              disabled={adding}
              className="btn-brand w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.15em]"
            >
              <CalendarPlus size={14} /> {adding ? 'Adding…' : 'Add daily plan to My 24'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
