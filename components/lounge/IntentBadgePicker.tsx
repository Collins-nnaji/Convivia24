'use client';

import { INTENT_BADGES } from '@/lib/themes';

interface Props {
  value: string | null;
  onChange: (id: string) => void;
}

export default function IntentBadgePicker({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-50">Your intent for this event</p>
      <div className="flex flex-wrap gap-2">
        {INTENT_BADGES.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onChange(b.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm transition-all ${
              value === b.id
                ? 'glass-card ring-2 ring-[var(--event-accent,#c9a84c)]'
                : 'glass-card opacity-70 hover:opacity-100'
            }`}
          >
            <span>{b.emoji}</span>
            <span>{b.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
