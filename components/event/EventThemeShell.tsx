'use client';

import { ReactNode } from 'react';
import { resolveEventTheme, themeClassName } from '@/lib/themes';

interface EventThemeShellProps {
  event: {
    theme_mode?: string | null;
    theme_accent?: string | null;
    category?: string | null;
    starts_at?: string | null;
  };
  children: ReactNode;
  className?: string;
}

export default function EventThemeShell({ event, children, className = '' }: EventThemeShellProps) {
  const theme = resolveEventTheme(event);
  return (
    <div
      className={`${themeClassName(theme.mode)} min-h-screen transition-colors duration-500 ${className}`}
      style={{ '--event-accent': theme.accent } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
