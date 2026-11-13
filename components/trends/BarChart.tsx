'use client';

import { useState } from 'react';
import type { BarDatum } from '@/lib/trends/report';

type Props = {
  title: string;
  subtitle: string;
  unit: string;
  data: BarDatum[];
  /** Bars to emphasise; the rest are drawn in the muted ink so the eye lands on the story. */
  highlight?: string[];
  source: string;
};

const format = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

/** Single-series horizontal bar chart: one hue, direct labels, hover tooltip and a table view. */
export default function BarChart({ title, subtitle, unit, data, highlight, source }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  const max = Math.max(...data.map((d) => d.value));

  return (
    <figure className="bg-white border border-obsidian/8 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <figcaption>
          <h3 className="text-base sm:text-lg font-bold text-obsidian leading-snug">{title}</h3>
          <p className="text-[13px] text-obsidian/55 mt-1">{subtitle}</p>
        </figcaption>
        <button
          type="button"
          onClick={() => setTable((t) => !t)}
          className="shrink-0 text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/50 hover:text-ember border border-obsidian/10 px-2.5 py-1.5"
          aria-pressed={table}
        >
          {table ? 'Chart' : 'Table'}
        </button>
      </div>

      {table ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-[0.12em] text-obsidian/45">
              <th className="font-black pb-2">Item</th>
              <th className="font-black pb-2 text-right">{unit}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label} className="border-t border-obsidian/6">
                <td className="py-2 text-obsidian/80">{d.label}</td>
                <td className="py-2 text-right tabular-nums font-semibold text-obsidian">{format(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <ul className="space-y-1" onMouseLeave={() => setHover(null)}>
          {data.map((d, i) => {
            const isRef = d.note === 'reference';
            const emphasised = !highlight || highlight.includes(d.label);
            const width = max > 0 ? Math.max((d.value / max) * 100, 0.6) : 0;
            const active = hover === i;
            return (
              <li
                key={d.label}
                className="relative grid grid-cols-[minmax(0,9.5rem)_1fr] sm:grid-cols-[minmax(0,12rem)_1fr] items-center gap-3 py-1 cursor-default"
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                aria-label={`${d.label}: ${format(d.value)} ${unit}`}
              >
                <span className={`text-[12px] sm:text-[13px] truncate ${isRef ? 'text-obsidian/50 italic' : 'text-obsidian/75'}`}>
                  {d.label}
                </span>
                <span className="flex items-center gap-2 min-w-0">
                  <span className="flex-1 h-4 relative">
                    <span
                      className={`absolute inset-y-0 left-0 rounded-r-[4px] transition-opacity ${
                        isRef ? 'bg-obsidian/25' : emphasised ? 'bg-ember' : 'bg-ember/35'
                      } ${hover !== null && !active ? 'opacity-60' : 'opacity-100'}`}
                      style={{ width: `${width}%` }}
                    />
                  </span>
                  <span className="w-12 text-right text-[12px] tabular-nums font-semibold text-obsidian/80">{format(d.value)}</span>
                </span>
                {active && (
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute right-0 -top-8 z-10 bg-obsidian text-white text-[11px] px-2.5 py-1.5 shadow-lg whitespace-nowrap"
                  >
                    <strong className="font-semibold">{d.label}</strong> · {format(d.value)} {unit}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 text-[10px] uppercase tracking-[0.12em] text-obsidian/40">
        {unit} · Source: {source}
      </p>
    </figure>
  );
}
