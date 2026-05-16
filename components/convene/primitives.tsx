'use client';
import React from 'react';

export type EventType = 'wedding' | 'birthday' | 'engage' | 'corporate' | 'club' | 'dinner' | 'festival' | 'baby' | 'memorial';

export const EVENT_TYPE_META: Record<EventType, { label: string; icon: string; tone: string }> = {
  wedding:   { label: 'Wedding',      icon: '💍', tone: 'Warm gold' },
  birthday:  { label: 'Birthday',     icon: '🎂', tone: 'Coral' },
  engage:    { label: 'Engagement',   icon: '🌸', tone: 'Blush' },
  corporate: { label: 'Corporate',    icon: '🏢', tone: 'Navy' },
  club:      { label: 'Club night',   icon: '🎵', tone: 'Electric' },
  dinner:    { label: 'Private dinner',icon: '🍷', tone: 'Claret' },
  festival:  { label: 'Festival',     icon: '🌟', tone: 'Amber' },
  baby:      { label: 'Baby shower',  icon: '👶', tone: 'Sage' },
  memorial:  { label: 'Memorial',     icon: '🕊️', tone: 'Slate' },
};

export const ACCENT_COLORS: Record<EventType, string> = {
  wedding:   '#c0975a',
  birthday:  '#e85d4b',
  engage:    '#d97b9c',
  corporate: '#2a4870',
  club:      '#7c5bff',
  dinner:    '#8b2535',
  festival:  '#e09f3e',
  baby:      '#8aa085',
  memorial:  '#5a6573',
};

export const ACCENT_SOFT: Record<EventType, string> = {
  wedding:   'rgba(192,151,90,.10)',
  birthday:  'rgba(232,93,75,.10)',
  engage:    'rgba(217,123,156,.10)',
  corporate: 'rgba(42,72,112,.08)',
  club:      'rgba(124,91,255,.10)',
  dinner:    'rgba(139,37,53,.08)',
  festival:  'rgba(224,159,62,.10)',
  baby:      'rgba(138,160,133,.10)',
  memorial:  'rgba(90,101,115,.08)',
};

export const ACCENT_LINE: Record<EventType, string> = {
  wedding:   'rgba(192,151,90,.30)',
  birthday:  'rgba(232,93,75,.32)',
  engage:    'rgba(217,123,156,.32)',
  corporate: 'rgba(42,72,112,.28)',
  club:      'rgba(124,91,255,.32)',
  dinner:    'rgba(139,37,53,.28)',
  festival:  'rgba(224,159,62,.32)',
  baby:      'rgba(138,160,133,.32)',
  memorial:  'rgba(90,101,115,.30)',
};

const AVATAR_GRADIENTS = [
  ['#f6e4c0', '#d9b97a', '#5a3a10'],
  ['#f5cdc4', '#e85d4b', '#6a1d10'],
  ['#dbe5dc', '#8aa085', '#2a3d28'],
  ['#cdd6e0', '#5a6573', '#1c2530'],
  ['#d4c7f5', '#7c5bff', '#2d1e6b'],
  ['#e9c8d6', '#d97b9c', '#5a2540'],
  ['#b9c5db', '#2a4870', '#ffffff'],
  ['#e9caca', '#8b2535', '#fff2f0'],
];

interface AvatarProps { initial: string; index?: number; size?: number; className?: string; }
export function Avatar({ initial, index = 0, size = 32, className = '' }: AvatarProps) {
  const [from, to, text] = AVATAR_GRADIENTS[index % 8];
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size, height: size, borderRadius: 9999, flexShrink: 0,
        background: `linear-gradient(135deg,${from},${to})`,
        color: text, fontWeight: 700, fontSize: size * 0.36,
        border: '2px solid #fff',
        fontFamily: 'var(--font-geist, system-ui)',
      }}
    >
      {initial?.toUpperCase()}
    </span>
  );
}

interface EyebrowProps { children: React.ReactNode; accent?: string; muted?: boolean; className?: string; style?: React.CSSProperties; }
export function Eyebrow({ children, accent, muted, className = '', style }: EyebrowProps) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        fontFamily: 'var(--font-geist, system-ui)', fontWeight: 800,
        fontSize: 9.5, letterSpacing: '0.30em', textTransform: 'uppercase',
        color: muted ? 'var(--cv-muted-2)' : (accent || 'var(--cv-accent)'),
        ...style,
      }}
    >
      <span style={{ width: 14, height: 1, background: 'currentColor', opacity: .8, display: 'inline-block' }} />
      {children}
    </span>
  );
}

interface TagProps { children: React.ReactNode; live?: boolean; accent?: string; style?: React.CSSProperties; }
export function Tag({ children, live, accent, style }: TagProps) {
  if (live) return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 9px', borderRadius: 9999,
      background: 'rgba(220,38,38,.08)', color: '#b91c1c',
      border: '1px solid rgba(220,38,38,.30)',
      fontWeight: 800, fontSize: 9, letterSpacing: '0.20em', textTransform: 'uppercase' as const,
      ...style,
    }}>{children}</span>
  );
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 9px', borderRadius: 9999,
      background: 'var(--cv-accent-soft)', color: accent || 'var(--cv-accent)',
      border: '1px solid var(--cv-accent-line)',
      fontWeight: 800, fontSize: 9, letterSpacing: '0.20em', textTransform: 'uppercase' as const,
      ...style,
    }}>{children}</span>
  );
}

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { on?: boolean; children: React.ReactNode; }
export function Chip({ on, children, style, ...rest }: ChipProps) {
  return (
    <button
      {...rest}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 11px', borderRadius: 9999,
        background: on ? 'var(--cv-ink)' : 'var(--cv-ivory-2)',
        color: on ? 'var(--cv-ivory)' : 'var(--cv-muted)',
        border: `1px solid ${on ? 'var(--cv-ink)' : 'var(--cv-hairline)'}`,
        fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap' as const,
        cursor: 'pointer', fontFamily: 'var(--font-geist, system-ui)',
        ...style,
      }}
    >{children}</button>
  );
}

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'accent' | 'cream';
  size?: 'sm' | 'default' | 'tiny';
  fullWidth?: boolean;
}
export function Btn({ variant = 'primary', size = 'default', fullWidth, children, style, ...rest }: BtnProps) {
  const padMap = { default: '12px 18px', sm: '9px 14px', tiny: '6px 11px' };
  const fsMap  = { default: 11, sm: 10, tiny: 9 };
  const bgMap  = { primary: 'var(--cv-ink)', ghost: 'transparent', accent: 'var(--cv-accent)', cream: 'var(--cv-ivory-2)' };
  const colorMap = { primary: 'var(--cv-ivory)', ghost: 'var(--cv-ink)', accent: '#fff', cream: 'var(--cv-ink)' };
  const borderMap = { primary: 'none', ghost: '1px solid var(--cv-hairline-strong)', accent: 'none', cream: 'none' };
  return (
    <button
      {...rest}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: padMap[size], borderRadius: 9999,
        background: bgMap[variant], color: colorMap[variant], border: borderMap[variant],
        fontFamily: 'var(--font-geist, system-ui)', fontWeight: 700,
        fontSize: fsMap[size], letterSpacing: '0.16em', textTransform: 'uppercase' as const,
        cursor: 'pointer', width: fullWidth ? '100%' : undefined,
        transition: 'transform .15s ease, background .15s',
        ...style,
      }}
      onMouseDown={e => (e.currentTarget.style.transform = 'scale(.97)')}
      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
    >{children}</button>
  );
}

interface BarProps { value: number; accent?: boolean; height?: number; }
export function Bar({ value, accent, height = 4 }: BarProps) {
  return (
    <div style={{ height, background: 'var(--cv-hairline)', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, value * 100)}%`, height: '100%', background: accent ? 'var(--cv-accent)' : 'var(--cv-ink)', borderRadius: 99, transition: 'width .4s ease' }} />
    </div>
  );
}

interface DialProps { value: number; size?: number; stroke?: number; children?: React.ReactNode; }
export function Dial({ value, size = 80, stroke = 5, children }: DialProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--cv-hairline)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--cv-accent)" strokeWidth={stroke}
          strokeDasharray={`${c * Math.min(1, value)} ${c}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}

/** Pseudo-QR block that looks realistic */
export function QRBlock({ size = 140, bg = '#fff', fg = '#1a1714' }: { size?: number; bg?: string; fg?: string; }) {
  const N = 21;
  const h = (x: number, y: number) => {
    const v = Math.sin(x * 12.9898 + y * 78.233 + 7) * 43758.5453;
    return Math.floor((v - Math.floor(v)) * 100) % 2;
  };
  const cells: { x: number; y: number; on: boolean }[] = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const inFinder = (cx: number, cy: number) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7;
      const ringOf   = (cx: number, cy: number) => Math.max(Math.abs(x - cx - 3), Math.abs(y - cy - 3));
      if (inFinder(0, 0))       { const r = ringOf(0, 0);     cells.push({ x, y, on: r !== 2 && r !== 4 && r <= 3 }); continue; }
      if (inFinder(N - 7, 0))   { const r = ringOf(N - 7, 0); cells.push({ x, y, on: r !== 2 && r !== 4 && r <= 3 }); continue; }
      if (inFinder(0, N - 7))   { const r = ringOf(0, N - 7); cells.push({ x, y, on: r !== 2 && r !== 4 && r <= 3 }); continue; }
      if (x < 8 && y < 8) { cells.push({ x, y, on: false }); continue; }
      if (x > N - 9 && y < 8) { cells.push({ x, y, on: false }); continue; }
      if (x < 8 && y > N - 9) { cells.push({ x, y, on: false }); continue; }
      cells.push({ x, y, on: h(x, y) === 1 });
    }
  }
  const pad = 10;
  const cs = (size - pad * 2) / N;
  return (
    <svg width={size} height={size} style={{ background: bg, borderRadius: 10, border: '1px solid var(--cv-hairline)' }}>
      <rect width={size} height={size} fill={bg} />
      {cells.map((c, i) => c.on && (
        <rect key={i} x={pad + c.x * cs} y={pad + c.y * cs} width={cs} height={cs} fill={fg} />
      ))}
    </svg>
  );
}

interface CardProps { children: React.ReactNode; className?: string; style?: React.CSSProperties; dark?: boolean; tinted?: boolean; flat?: boolean; onClick?: () => void; }
export function Card({ children, style, dark, tinted, flat, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: dark ? 'var(--cv-ink)' : (tinted ? 'var(--cv-ivory-2)' : 'var(--cv-paper)'),
        borderRadius: 18,
        border: `1px solid ${dark ? 'rgba(255,255,255,.10)' : 'var(--cv-hairline)'}`,
        boxShadow: flat ? 'none' : '0 4px 14px rgba(26,23,20,.04)',
        overflow: 'hidden',
        color: dark ? 'var(--cv-ivory)' : 'var(--cv-ink)',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >{children}</div>
  );
}

export function Wordmark({ size = 19, tone = 'ink' }: { size?: number; tone?: 'ink' | 'cream' }) {
  return (
    <img
      src={tone === 'cream' ? '/Logo2.png' : '/convivia24.png'}
      alt="Convivia24"
      style={{ height: size + 6, width: 'auto', objectFit: 'contain', display: 'block' }}
      draggable={false}
    />
  );
}

export function MiddleDot() {
  return <span style={{ color: 'var(--cv-muted-2)', margin: '0 5px' }}>·</span>;
}

export function Hr({ dashed }: { dashed?: boolean }) {
  return (
    <div style={{
      height: 1,
      background: dashed ? 'transparent' : 'var(--cv-hairline)',
      borderTop: dashed ? '1px dashed var(--cv-hairline-strong)' : 'none',
    }} />
  );
}
