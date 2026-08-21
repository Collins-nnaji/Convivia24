'use client';

import { useEffect, useRef, useState } from 'react';
import { Info } from 'lucide-react';
import { TASTE_NOTES } from '@/lib/drinks/brand-guide';

export default function TasteInfoTooltip({
  slug,
  className = '',
}: {
  slug: string;
  className?: string;
}) {
  const note = TASTE_NOTES[slug];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [open]);

  if (!note) return null;

  return (
    <span ref={ref} className={`relative inline-flex group ${className}`}>
      <button
        type="button"
        aria-label="What does this taste like?"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="text-obsidian/35 hover:text-ember transition-colors"
      >
        <Info size={14} />
      </button>
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-md bg-obsidian text-white text-[11px] leading-snug px-3 py-2 shadow-lg transition-opacity ${
          open ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <span className="block font-semibold mb-0.5 text-ember">Tastes like</span>
        {note}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-obsidian" />
      </span>
    </span>
  );
}
