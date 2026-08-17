import type { TriviaGlyph } from '@/lib/trivia/catalog';

type GlyphProps = { className?: string };

/** Grape bunch — cognac and wine houses. */
export function GrapeGlyph({ className = '' }: GlyphProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.4" className={className} aria-hidden>
      <path d="M32 8v8" strokeLinecap="round" />
      <path d="M32 12c4-4 9-4 12-2-3 4-8 5-12 2Z" strokeLinejoin="round" />
      {[
        [32, 22],
        [24, 28],
        [40, 28],
        [28, 36],
        [36, 36],
        [32, 44],
        [21, 38],
        [43, 38],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" />
      ))}
    </svg>
  );
}

/** Oak cask — Scotch and aged spirits. */
export function CaskGlyph({ className = '' }: GlyphProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.4" className={className} aria-hidden>
      <path d="M20 14c8-3 16-3 24 0 4 6 4 30 0 36-8 3-16 3-24 0-4-6-4-30 0-36Z" strokeLinejoin="round" />
      <path d="M20 22c8 3 16 3 24 0M20 42c8 3 16 3 24 0" />
      <path d="M32 14v36" strokeDasharray="3 4" />
      <path d="M14 24c2 5 2 11 0 16M50 24c2 5 2 11 0 16" strokeLinecap="round" />
    </svg>
  );
}

/** Rising bubbles in a flute — champagne. */
export function BubblesGlyph({ className = '' }: GlyphProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.4" className={className} aria-hidden>
      <path d="M24 12h16l-2 18a6 6 0 0 1-12 0L24 12Z" strokeLinejoin="round" />
      <path d="M32 36v12M26 52h12" strokeLinecap="round" />
      <circle cx="30" cy="20" r="1.8" />
      <circle cx="36" cy="24" r="1.4" />
      <circle cx="31" cy="27" r="1.2" />
      <circle cx="26" cy="8" r="1.6" />
      <circle cx="38" cy="6" r="1.2" />
    </svg>
  );
}

/** Copper pot still — Irish whiskey and cognac alambics. */
export function StillGlyph({ className = '' }: GlyphProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.4" className={className} aria-hidden>
      <path d="M18 50c0-12 4-16 4-22a10 10 0 0 1 20 0c0 6 4 10 4 22Z" strokeLinejoin="round" />
      <path d="M32 18V8h10c0 8-4 10-10 10Z" strokeLinejoin="round" />
      <path d="M42 8h8c0 14-6 18-6 26" strokeLinecap="round" />
      <path d="M14 54h36" strokeLinecap="round" />
      <path d="M26 34h12" strokeDasharray="2 3" />
    </svg>
  );
}

const GLYPHS: Record<TriviaGlyph, (props: GlyphProps) => React.ReactElement> = {
  grape: GrapeGlyph,
  cask: CaskGlyph,
  bubbles: BubblesGlyph,
  still: StillGlyph,
};

export function HouseGlyph({ glyph, className }: { glyph: TriviaGlyph; className?: string }) {
  const Glyph = GLYPHS[glyph] ?? CaskGlyph;
  return <Glyph className={className} />;
}

/** Soft radial backdrop for the hero, so the bottle sits on something. */
export function HeroHalo({ className = '' }: GlyphProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <defs>
        <radialGradient id="trivia-halo" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="65%" stopColor="currentColor" stopOpacity="0.06" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="95" r="95" fill="url(#trivia-halo)" />
      <circle cx="100" cy="95" r="62" fill="none" stroke="currentColor" strokeOpacity="0.16" strokeWidth="0.8" />
      <circle cx="100" cy="95" r="80" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.8" strokeDasharray="2 6" />
    </svg>
  );
}
