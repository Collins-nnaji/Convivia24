import type { DrinkCategory } from '@/lib/drinks/catalog';

const TONES: Record<DrinkCategory, { bg: string; ink: string; accent: string }> = {
  champagne: { bg: '#F5E6C8', ink: '#3D2E12', accent: '#C9A227' },
  whisky: { bg: '#E8D5C4', ink: '#3B2414', accent: '#8B4513' },
  cognac: { bg: '#EAD4C0', ink: '#4A2810', accent: '#A0522D' },
  wines: { bg: '#F0DDE3', ink: '#4A1528', accent: '#8B1E3F' },
  spirits: { bg: '#DCE8E4', ink: '#1A332C', accent: '#2F6F5E' },
  cocktails: { bg: '#F8E4C8', ink: '#5C2E0A', accent: '#8B2A22' },
  mixers: { bg: '#DCEAF2', ink: '#16324A', accent: '#2B6CB0' },
  'party-packs': { bg: '#F5D9D6', ink: '#4A1512', accent: '#8B2A22' },
};

function BottleSvg({ category, accent, ink }: { category: DrinkCategory; accent: string; ink: string }) {
  if (category === 'cocktails') {
    return (
      <svg viewBox="0 0 72 110" className="w-[38%] max-w-[4.2rem] h-auto" aria-hidden>
        <rect x="18" y="8" width="36" height="94" rx="8" fill={accent} opacity="0.28" stroke={ink} strokeWidth="2" />
        <rect x="18" y="8" width="36" height="22" rx="8" fill={accent} />
        <rect x="18" y="22" width="36" height="8" fill={ink} opacity="0.85" />
        <circle cx="36" cy="58" r="10" fill={accent} opacity="0.7" />
        <path d="M28 82h16" stroke={ink} strokeWidth="2" opacity="0.45" />
      </svg>
    );
  }
  if (category === 'mixers') {
    return (
      <svg viewBox="0 0 80 120" className="w-[40%] max-w-[4.5rem] h-auto" aria-hidden>
        <rect x="28" y="8" width="24" height="10" rx="2" fill={accent} />
        <path
          d="M30 18h20l6 22v60a8 8 0 0 1-8 8H32a8 8 0 0 1-8-8V40l6-22z"
          fill={accent}
          opacity="0.35"
          stroke={ink}
          strokeWidth="2"
        />
        <ellipse cx="40" cy="55" rx="14" ry="6" fill={accent} opacity="0.5" />
      </svg>
    );
  }
  if (category === 'party-packs') {
    return (
      <svg viewBox="0 0 100 100" className="w-[55%] max-w-[5.5rem] h-auto" aria-hidden>
        <rect x="12" y="28" width="28" height="52" rx="4" fill={accent} opacity="0.4" stroke={ink} strokeWidth="2" />
        <rect x="36" y="18" width="28" height="62" rx="4" fill={accent} opacity="0.55" stroke={ink} strokeWidth="2" />
        <rect x="60" y="32" width="28" height="48" rx="4" fill={accent} opacity="0.35" stroke={ink} strokeWidth="2" />
      </svg>
    );
  }
  if (category === 'champagne' || category === 'wines') {
    return (
      <svg viewBox="0 0 80 120" className="w-[36%] max-w-[4rem] h-auto" aria-hidden>
        <rect x="34" y="4" width="12" height="14" rx="2" fill={ink} />
        <path
          d="M36 18h8l4 18-2 8v58a10 10 0 0 1-10 10h0a10 10 0 0 1-10-10V44l-2-8 4-18z"
          fill={accent}
          opacity="0.45"
          stroke={ink}
          strokeWidth="2"
        />
        <path d="M30 70h20" stroke={ink} strokeWidth="1.5" opacity="0.4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 80 120" className="w-[42%] max-w-[4.5rem] h-auto" aria-hidden>
      <rect x="32" y="6" width="16" height="12" rx="2" fill={ink} />
      <path
        d="M28 18h24l8 14v68a8 8 0 0 1-8 8H28a8 8 0 0 1-8-8V32l8-14z"
        fill={accent}
        opacity="0.4"
        stroke={ink}
        strokeWidth="2"
      />
      <rect x="26" y="48" width="28" height="18" rx="2" fill={accent} opacity="0.55" />
    </svg>
  );
}

type Props = {
  category: DrinkCategory;
  name?: string;
  className?: string;
  watermark?: boolean;
};

export default function DrinkPlaceholder({ category, name, className = '', watermark = true }: Props) {
  const tone = TONES[category] ?? TONES.spirits;
  return (
    <div
      className={`relative flex flex-col items-center justify-center gap-2 overflow-hidden min-h-[8rem] ${className}`}
      style={{ background: `linear-gradient(160deg, ${tone.bg} 0%, #fafaf8 72%)` }}
    >
      <BottleSvg category={category} accent={tone.accent} ink={tone.ink} />
      {name ? (
        <p
          className="relative z-[1] px-3 text-center text-[10px] font-black uppercase tracking-[0.14em] line-clamp-2"
          style={{ color: tone.ink }}
        >
          {name}
        </p>
      ) : null}
      {watermark ? (
        <img
          src="/convivia24.png"
          alt=""
          className="absolute bottom-2 right-2 h-3.5 w-auto opacity-35 pointer-events-none"
        />
      ) : null}
    </div>
  );
}
