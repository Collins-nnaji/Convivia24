import type { ReactNode } from 'react';

const VIEWBOX = 36;
const RADIUS = 15.5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const STROKE_WIDTH = 3;

const LIGHT = '#e2c97e'; // gold-light
const MID = '#a07c28'; // gold-dark
const DARK = '#0a0a0a'; // obsidian

function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function mixHex(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const lerp = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${lerp(r1, r2)}, ${lerp(g1, g2)}, ${lerp(b1, b2)})`;
}

/** Maps 0..1 "how stacked" to a brand color running light (open) to dark (packed). */
export function dayLoadColor(ratio: number): string {
  const t = Math.max(0, Math.min(1, ratio));
  return t <= 0.5 ? mixHex(LIGHT, MID, t / 0.5) : mixHex(MID, DARK, (t - 0.5) / 0.5);
}

/**
 * A circular progress ring showing how stacked a day is (0..1), light to
 * dark as it fills. Wraps `children` — typically the day-number badge —
 * centered inside the ring. Scales fluidly with whatever size class is
 * passed in, so it works at month-grid and week-strip sizes alike.
 */
export default function DayLoadRing({
  ratio,
  className = 'w-7 h-7',
  children,
}: {
  ratio: number;
  className?: string;
  children?: ReactNode;
}) {
  const clamped = Math.max(0, Math.min(1, ratio));
  const offset = CIRCUMFERENCE * (1 - clamped);

  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} className="absolute inset-0 -rotate-90">
        <circle
          cx={VIEWBOX / 2}
          cy={VIEWBOX / 2}
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          className="text-obsidian/[0.07]"
        />
        {clamped > 0 && (
          <circle
            cx={VIEWBOX / 2}
            cy={VIEWBOX / 2}
            r={RADIUS}
            fill="none"
            stroke={dayLoadColor(clamped)}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        )}
      </svg>
      {children}
    </span>
  );
}
