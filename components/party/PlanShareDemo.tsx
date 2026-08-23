'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const DEMO_LINES = [
  { name: 'Jameson Original', qty: 2, unit: '₦42,000', total: '₦84,000' },
  { name: 'Hennessy VS', qty: 1, unit: '₦78,000', total: '₦78,000' },
  { name: 'Cîroc Snap Frost', qty: 1, unit: '₦48,000', total: '₦48,000' },
  { name: 'Moët Impérial', qty: 1, unit: '₦85,000', total: '₦85,000' },
  { name: 'Flying Fish · 6 cans', qty: 3, unit: '₦6,500', total: '₦19,500' },
  { name: 'Schweppes Tonic Pack', qty: 2, unit: '₦12,000', total: '₦24,000' },
];

/**
 * Collapsed sample of the image / PDF you can download from a finished plan.
 */
export default function PlanShareDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-10 border border-obsidian/10 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 px-5 py-3.5 text-left"
      >
        <span>
          <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-ember">
            Sample download
          </span>
          <span className="block text-sm text-obsidian/55 mt-0.5">
            This is the plan image you can save or share — Tolu’s birthday, 25 guests.
          </span>
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-obsidian/35 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-5 pb-6">
          <div
            className="max-w-md mx-auto border border-obsidian/10 shadow-[0_12px_40px_-24px_rgba(10,10,10,0.45)] overflow-hidden"
            style={{ backgroundColor: '#fafaf8' }}
          >
            <div className="bg-white px-6 pt-5 pb-4 border-b-[3px] border-ember">
              <p className="font-wordmark text-[13px] text-obsidian tracking-[0.18em]">Convivia24</p>
              <p className="text-[10px] text-obsidian/40 mt-1">Party drink plan · nationwide delivery · 18+</p>
            </div>
            <div className="px-6 py-5">
              <p className="font-serif text-xl text-obsidian">Tolu’s birthday</p>
              <p className="text-[12px] text-obsidian/45 mt-1 leading-relaxed">
                House party · Sat 12 Sep 2026 · Lekki rooftop
                <br />
                25 guests · 5h · Balanced bar
              </p>
              <p className="mt-4 text-lg font-bold text-ember">₦338,500</p>

              <ul className="mt-5 pt-1 border-t border-obsidian/10">
                {DEMO_LINES.map((line) => (
                  <li
                    key={line.name}
                    className="flex items-start justify-between gap-3 py-3 border-b border-obsidian/10 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-obsidian">
                        {line.name}{' '}
                        <span className="text-obsidian/40 font-normal">×{line.qty}</span>
                      </p>
                      <p className="text-[11px] text-obsidian/40">{line.unit} / bottle</p>
                    </div>
                    <p className="text-[13px] font-semibold text-ember shrink-0">{line.total}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-5 pt-4 border-t border-obsidian/10 text-[10px] text-obsidian/40">
                convivia24.com · Drink supplies for events
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
