import type { ReactNode } from 'react';

export type ArtKind =
  | 'rooftop'
  | 'club'
  | 'lounge'
  | 'beach'
  | 'live'
  | 'dining'
  | 'whisky'
  | 'trail'
  | 'afterparty'
  | 'day-party';

export const ART_KINDS: ArtKind[] = [
  'rooftop',
  'club',
  'lounge',
  'beach',
  'live',
  'dining',
  'whisky',
];

export function tagToArt(tag: string): ArtKind {
  const t = tag.toLowerCase();
  if (t.includes('roof')) return 'rooftop';
  if (t.includes('club') || t.includes('after')) return t.includes('after') ? 'afterparty' : 'club';
  if (t.includes('beach') || t.includes('sand')) return 'beach';
  if (t.includes('live') || t.includes('band')) return 'live';
  if (t.includes('din') || t.includes('supper') || t.includes('table')) return 'dining';
  if (t.includes('whisky') || t.includes('whiskey') || t.includes('cognac')) return 'whisky';
  if (t.includes('trail') || t.includes('hike')) return 'trail';
  if (t.includes('day')) return 'day-party';
  if (t.includes('lounge')) return 'lounge';
  return 'lounge';
}

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full" aria-hidden>
      {children}
    </svg>
  );
}

function Scene({ kind }: { kind: ArtKind }) {
  const ink = 'rgba(247,245,243,0.88)';
  const mute = 'rgba(247,245,243,0.28)';
  const accent = 'rgba(247,245,243,0.55)';

  if (kind === 'rooftop') {
    return (
      <Svg>
        <circle cx="248" cy="48" r="18" fill="none" stroke={accent} strokeWidth="1.6" />
        <path d="M24 168 L24 112 L52 96 L52 168 Z M68 168 L68 88 L108 64 L108 168 Z M124 168 L124 100 L168 78 L168 168 Z M184 168 L184 92 L232 70 L232 168 Z M248 168 L248 108 L296 90 L296 168" fill="none" stroke={ink} strokeWidth="2" />
        <path d="M16 168 H304" stroke={mute} strokeWidth="1.4" />
      </Svg>
    );
  }
  if (kind === 'club') {
    return (
      <Svg>
        <circle cx="160" cy="102" r="58" fill="none" stroke={mute} strokeWidth="1.4" />
        <circle cx="160" cy="102" r="38" fill="none" stroke={accent} strokeWidth="1.6" />
        <circle cx="160" cy="102" r="16" fill={ink} opacity="0.85" />
        <path d="M160 44 V28 M160 176 V160 M86 102 H70 M250 102 H234" stroke={accent} strokeWidth="2" />
        <path d="M108 54 L98 42 M212 54 L222 42 M108 150 L98 162 M212 150 L222 162" stroke={mute} strokeWidth="1.6" />
      </Svg>
    );
  }
  if (kind === 'lounge') {
    return (
      <Svg>
        <rect x="70" y="108" width="180" height="36" rx="10" fill="none" stroke={ink} strokeWidth="2" />
        <path d="M88 108 V88 H140 V108 M180 108 V88 H232 V108" fill="none" stroke={ink} strokeWidth="2" />
        <circle cx="160" cy="62" r="14" fill="none" stroke={accent} strokeWidth="1.8" />
        <path d="M160 76 V96" stroke={accent} strokeWidth="1.8" />
        <path d="M48 158 H272" stroke={mute} strokeWidth="1.4" />
      </Svg>
    );
  }
  if (kind === 'beach') {
    return (
      <Svg>
        <circle cx="64" cy="52" r="20" fill="none" stroke={accent} strokeWidth="1.8" />
        <path d="M20 128 C70 108, 110 148, 160 128 S250 108, 300 132" fill="none" stroke={ink} strokeWidth="2" />
        <path d="M20 148 C80 132, 120 164, 180 146 S250 132, 300 154" fill="none" stroke={mute} strokeWidth="1.6" />
        <path d="M232 128 L248 64 L264 128" fill="none" stroke={ink} strokeWidth="2" />
        <path d="M236 88 H260" stroke={accent} strokeWidth="1.5" />
      </Svg>
    );
  }
  if (kind === 'live') {
    return (
      <Svg>
        <rect x="146" y="40" width="28" height="72" rx="14" fill="none" stroke={ink} strokeWidth="2" />
        <path d="M160 112 V148 M132 148 H188" stroke={ink} strokeWidth="2" />
        <path d="M196 72 Q220 102 196 132 M214 60 Q250 102 214 144" fill="none" stroke={accent} strokeWidth="1.7" />
        <path d="M124 72 Q100 102 124 132 M106 60 Q70 102 106 144" fill="none" stroke={mute} strokeWidth="1.7" />
      </Svg>
    );
  }
  if (kind === 'dining') {
    return (
      <Svg>
        <ellipse cx="160" cy="118" rx="78" ry="22" fill="none" stroke={ink} strokeWidth="2" />
        <circle cx="160" cy="108" r="28" fill="none" stroke={accent} strokeWidth="1.8" />
        <path d="M70 118 L58 168 M250 118 L262 168 M160 140 V168" stroke={mute} strokeWidth="1.8" />
        <path d="M118 64 H202" stroke={accent} strokeWidth="1.5" />
      </Svg>
    );
  }
  if (kind === 'whisky') {
    return (
      <Svg>
        <path d="M148 36 H172 V56 L184 78 V168 H136 V78 L148 56 Z" fill="none" stroke={ink} strokeWidth="2" />
        <path d="M140 96 H180" stroke={accent} strokeWidth="1.6" />
        <path d="M210 128 C210 108, 246 108, 246 128 V164 H210 Z" fill="none" stroke={accent} strokeWidth="1.8" />
        <path d="M74 164 H280" stroke={mute} strokeWidth="1.4" />
      </Svg>
    );
  }
  if (kind === 'trail') {
    return (
      <Svg>
        <path d="M40 160 L120 72 L168 112 L248 48 L300 96" fill="none" stroke={ink} strokeWidth="2" />
        <path d="M80 160 C110 140, 140 150, 160 132 S210 120, 250 148" fill="none" stroke={accent} strokeWidth="1.7" />
        <circle cx="248" cy="48" r="5" fill={ink} />
      </Svg>
    );
  }
  if (kind === 'afterparty') {
    return (
      <Svg>
        <path d="M160 36 L176 84 H228 L186 114 L202 164 L160 134 L118 164 L134 114 L92 84 H144 Z" fill="none" stroke={ink} strokeWidth="2" />
        <circle cx="64" cy="56" r="10" fill="none" stroke={accent} strokeWidth="1.5" />
        <circle cx="256" cy="150" r="10" fill="none" stroke={mute} strokeWidth="1.5" />
      </Svg>
    );
  }
  return (
    <Svg>
      <circle cx="160" cy="88" r="36" fill="none" stroke={accent} strokeWidth="1.8" />
      <path d="M40 148 H280" stroke={mute} strokeWidth="1.4" />
      <path d="M70 148 C100 118, 130 118, 160 148 S220 178, 250 148" fill="none" stroke={ink} strokeWidth="2" />
    </Svg>
  );
}

export default function NightArt({
  kind,
  className = '',
  label,
}: {
  kind: ArtKind;
  className?: string;
  label?: string;
}) {
  return (
    <div className={`relative overflow-hidden brand-gradient ${className}`}>
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18), transparent 42%), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.35), transparent 50%)',
        }}
      />
      <Scene kind={kind} />
      {label ? (
        <span className="absolute top-2.5 left-2.5 badge-brand text-[8px] font-black uppercase tracking-wider px-2 py-0.5">
          {label}
        </span>
      ) : null}
    </div>
  );
}

export function GraphicBanner({
  kicker,
  title,
  kind = 'lounge',
}: {
  kicker: string;
  title: string;
  kind?: ArtKind;
}) {
  return (
    <div className="relative h-44 sm:h-52 overflow-hidden">
      <NightArt kind={kind} className="absolute inset-0 h-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/45 to-obsidian/20" />
      <div className="absolute bottom-0 inset-x-0 max-w-6xl mx-auto px-5 sm:px-8 pb-6">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-ember-light mb-2">{kicker}</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">{title}</h1>
      </div>
    </div>
  );
}
