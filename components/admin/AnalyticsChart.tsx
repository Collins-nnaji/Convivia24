'use client';
import { useEffect, useRef, useState } from 'react';
export type ChartPoint = { label: string; value: number };
export default function AnalyticsChart({ title, points, format }: { title: string; points: ChartPoint[]; format: (value: number) => string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(640);
  useEffect(() => {
    const node = container.current; if (!node) return;
    const observer = new ResizeObserver(entries => { const width = entries[0]?.contentRect.width; if (width) setAvailableWidth(Math.round(width)); });
    observer.observe(node); return () => observer.disconnect();
  }, []);
  const shown = points.slice(-30);
  const current = shown.find(p => p.label === selected) || shown.at(-1);
  const max = Math.max(4, Math.ceil(Math.max(0, ...shown.map(p => p.value)) / 4) * 4);
  const width = Math.max(availableWidth, shown.length * 42 + 100, 280); const height = 280;
  const left = 85; const bottom = 225; const plotHeight = 175;
  const step = (width - left - 20) / Math.max(1, shown.length);
  if (!shown.length) return <p className="rounded-lg bg-paper p-4 text-sm text-obsidian/60">No data recorded in this period.</p>;
  return <div className="space-y-3">
    <p className="flex flex-wrap justify-between gap-2 text-sm"><span className="font-semibold">{current?.label}</span><span className="font-bold tabular-nums text-ember">{format(current?.value || 0)}</span></p>
    <div ref={container} className="overflow-x-auto rounded-lg border border-obsidian/10 bg-paper/50">
      <svg aria-label={`${title} chart. Focus a bar to read its date and value.`} role="group" viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: Math.max(280, shown.length * 42 + 100) }}>
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => <g key={ratio}><line x1={left} x2={width - 20} y1={bottom - ratio * plotHeight} y2={bottom - ratio * plotHeight} stroke="#dedbd7" /><text x={left - 8} y={bottom - ratio * plotHeight + 4} textAnchor="end" fontSize="11" fill="#6b625a">{new Intl.NumberFormat('en-NG', { notation: 'compact', maximumFractionDigits: 1 }).format(max * ratio)}</text></g>)}
        {shown.map((point, index) => {
          const x = left + index * step + step * 0.15; const barHeight = point.value / max * plotHeight;
          return <g key={point.label}><rect role="button" tabIndex={0} aria-label={`${point.label}: ${format(point.value)}`} x={x} y={bottom - Math.max(0, barHeight)} width={step * 0.7} height={Math.max(point.value > 0 ? 2 : 0, barHeight)} fill={current?.label === point.label ? '#8B2A22' : '#bf7168'} onMouseEnter={() => setSelected(point.label)} onFocus={() => setSelected(point.label)} onClick={() => setSelected(point.label)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(point.label); } }}><title>{point.label}: {format(point.value)}</title></rect><text x={x + step * 0.35} y={bottom - barHeight - 8} textAnchor="middle" fontSize="10" fill="#65584e">{new Intl.NumberFormat('en-NG', { notation: 'compact', maximumFractionDigits: 1 }).format(point.value)}</text><text x={x + step * 0.35} y={bottom + 20} textAnchor="middle" fontSize="10" fill="#65584e" transform={`rotate(-40 ${x + step * 0.35} ${bottom + 20})`}>{point.label.slice(5)}</text></g>;
        })}
      </svg>
    </div>
    <p className="text-xs text-obsidian/60">{points.length > 30 ? 'Chart shows the latest 30 recorded days. The table includes all recorded days. ' : ''}Hover or focus a bar for its exact value. Dates use the Lagos calendar; days without recorded activity are listed only when available in the source.</p>
  </div>;
}
