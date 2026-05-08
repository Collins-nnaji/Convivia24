'use client';

import type { ReactNode } from 'react';

/**
 * Content column aligned to the phone shell (428px cap). On lg+ the wrapper is neutral
 * (`contents`) so parent max-width / grid on desktop is unchanged.
 */
export function MobileFirstColumn({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`w-full max-lg:mx-auto max-lg:max-w-[min(100%,428px)] lg:contents ${className}`}>
      {children}
    </div>
  );
}

/** Render only below the lg breakpoint — pair with `DesktopOnly` for split layouts. */
export function MobileOnly({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`lg:hidden ${className}`}>{children}</div>;
}

/** Render only at lg and up. */
export function DesktopOnly({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`hidden lg:block ${className}`}>{children}</div>;
}
