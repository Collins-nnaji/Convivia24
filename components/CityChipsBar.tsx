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
    <div className={`flex flex-col sm:flex-row sm:items-center gap-2 ${className}`}>
      {label ? (
        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 shrink-0">{label}</span>
      ) : null}
      <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
        <div className="inline-flex max-w-full overflow-x-auto scrollbar-hide rounded-full p-0.5 bg-neutral-100 border border-neutral-200">
          {cities.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => onSelect(c)}
              className={`shrink-0 text-[10px] uppercase tracking-widest font-black ${chipPad} rounded-full transition-all ${
                selected === c
                  ? 'bg-red-700 text-white shadow-[0_0_12px_rgba(185,28,28,0.2)]'
                  : 'text-neutral-600 hover:text-neutral-900 active:bg-neutral-200/60'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white pl-3 pr-1 py-0.5 min-w-0 max-w-[min(100%,220px)]">
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
            placeholder="Add your city"
            className="min-w-0 flex-1 bg-transparent text-[11px] py-2 focus:outline-none placeholder:text-neutral-400"
            aria-label="Add a city"
          />
          <button
            type="button"
            onClick={submit}
            className="shrink-0 w-9 h-9 rounded-full bg-red-700 text-white flex items-center justify-center hover:bg-red-800 transition-colors disabled:opacity-40"
            disabled={!draft.trim()}
            aria-label="Save city"
          >
            <Plus size={18} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}
