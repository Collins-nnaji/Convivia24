import type { ReactElement } from 'react';
import type { DrinkCategory } from '@/lib/drinks/catalog';

type IconProps = { className?: string };

export function IconChampagne({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M10 3h4l1.2 7.2A4.2 4.2 0 0 1 11 14.5 4.2 4.2 0 0 1 8.8 10.2L10 3Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 14.5V20M9 20h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconWhisky({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="7" y="3" width="10" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 10h10M10 3v3M14 3v3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconCognac({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M9 3h6M10 3c0 3-3 5-3 9a5 5 0 0 0 10 0c0-4-3-6-3-9" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 17v4M9.5 21h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconWine({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M8 4h8l-1 7a3.2 3.2 0 0 1-6 0L8 4Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 11.2V20M9 20h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconSpirits({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M9 3h6v3l2 4v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V10l2-4V3Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 12h8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconCan({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="7" y="4" width="10" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 8h10M12 4V2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="13" r="2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function IconMixer({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M8 4h8l2 6v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V10l2-6Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 11h8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconPack({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="8" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="4" width="6" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="15" y="9" width="6" height="11" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

const CATEGORY_ICONS: Record<DrinkCategory, (p: IconProps) => ReactElement> = {
  champagne: IconChampagne,
  whisky: IconWhisky,
  cognac: IconCognac,
  wines: IconWine,
  spirits: IconSpirits,
  cocktails: IconCan,
  mixers: IconMixer,
  'party-packs': IconPack,
};

export function CategoryIcon({ category, className }: { category: DrinkCategory; className?: string }) {
  const Icon = CATEGORY_ICONS[category] ?? IconSpirits;
  return <Icon className={className} />;
}
