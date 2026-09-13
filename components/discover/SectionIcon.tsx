import type { DiscoverSectionKey } from './sections';

/** Hand-drawn line icons for the hub — one per section, no brand marks. */
export function SectionIcon({ section, size = 40, className = '' }: { section: DiscoverSectionKey; size?: number; className?: string }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 48 48',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  };
  switch (section) {
    case 'trivia':
      // A question card with a tick — the round you play.
      return (
        <svg {...common}>
          <rect x="8" y="6" width="32" height="36" rx="4" />
          <path d="M18 17.5a6 6 0 1 1 8.5 5.4c-1.6.8-2.5 2-2.5 3.6" />
          <circle cx="24" cy="32" r="1" fill="currentColor" />
          <path d="M14 42v-4M34 42v-4" />
        </svg>
      );
    case 'taste':
      // A coupe glass with a stirrer — profile and mixing in one.
      return (
        <svg {...common}>
          <path d="M10 10h28l-2 6c-1.5 4.5-6 8-12 8s-10.5-3.5-12-8z" />
          <path d="M24 24v14M16 40h16" />
          <path d="M30 6l-8 12" />
          <circle cx="31" cy="5" r="2" />
          <path d="M16 15h16" strokeDasharray="2 3" />
        </svg>
      );
    case 'rewards':
      // A ribboned gift — the shop you spend points in.
      return (
        <svg {...common}>
          <rect x="8" y="18" width="32" height="24" rx="3" />
          <path d="M6 18h36v8H6z" />
          <path d="M24 18v24" />
          <path d="M24 18c-3-6-8-9-11-6s2 6 11 6zM24 18c3-6 8-9 11-6s-2 6-11 6z" />
        </svg>
      );
  }
}
