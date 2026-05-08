'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

type Props = {
  cities: string[];
  selected: string;
  onSelect: (city: string) => void;
  onAddCity: (city: string) => void;
  /** e.g. "City" label in Discover */
  label?: string;
  className?: string;
  chipSize?: 'sm' | 'md';
};

export function CityChipsBar({
  cities,
  selected,
  onSelect,
  onAddCity,
  label,
  className = '',
  chipSize = 'md',
}: Props) {
  const [draft, setDraft] = useState('');

  const submit = () => {
    const t = draft.trim();
    if (!t) return;
    onAddCity(t);
    onSelect(t);
    setDraft('');
  };

  const chipPad = chipSize === 'sm' ? 'min-h-9 px-3 py-1.5' : 'min-h-10 px-3 sm:px-3.5 py-2';

  return (
    <div className={`flex w-full min-w-0 flex-col gap-3 ${className}`}>
      {label ? (
        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500 shrink-0">
          {label}
        </span>
      ) : null}

      {/* Wrapped chips — every zone stays visible on mobile (no horizontal clipping) */}
      <div className="w-full min-w-0 rounded-2xl border border-neutral-200 bg-neutral-100/90 p-2">
        <div className="flex w-full min-w-0 flex-wrap gap-2">
          {cities.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => onSelect(c)}
              className={`text-[10px] uppercase tracking-widest font-black ${chipPad} rounded-full transition-all max-[380px]:text-[9px] ${
                selected === c
                  ? 'bg-red-700 text-white shadow-[0_0_12px_rgba(185,28,28,0.2)]'
                  : 'text-neutral-600 hover:text-neutral-900 active:bg-neutral-200/60'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Add zone — full width row so it doesn’t collide with chips */}
      <div className="flex w-full min-w-0 items-stretch gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-1 shadow-sm">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Add zone / city"
          className="min-w-0 flex-1 bg-transparent text-[12px] sm:text-[13px] py-2.5 focus:outline-none placeholder:text-neutral-400"
          aria-label="Add a zone or city"
        />
        <button
          type="button"
          onClick={submit}
          className="my-1 shrink-0 self-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-700 text-white flex items-center justify-center hover:bg-red-800 transition-colors disabled:opacity-40"
          disabled={!draft.trim()}
          aria-label="Save zone"
        >
          <Plus size={18} strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}
