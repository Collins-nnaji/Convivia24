'use client';

import { BRAND_LOGO_MARK_SRC, BRAND_LOGO_SRC } from '@/lib/brand';

export function BrandLogo({
  className = '',
  alt = 'Convivia24',
  /** `mark` uses the compact icon — best for narrow mobile heroes / splash. */
  variant = 'default',
}: {
  className?: string;
  alt?: string;
  variant?: 'default' | 'mark';
}) {
  const src = variant === 'mark' ? BRAND_LOGO_MARK_SRC : BRAND_LOGO_SRC;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      draggable={false}
    />
  );
}
