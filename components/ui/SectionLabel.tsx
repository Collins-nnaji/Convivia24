import React from 'react';

interface SectionLabelProps {
  children: React.ReactNode;
  variant?: 'dark' | 'light';
}

export function SectionLabel({ children, variant = 'dark' }: SectionLabelProps) {
  const accent = variant === 'dark' ? 'text-copper-deep border-copper/30' : 'text-ink border-ink/15';
  const line = variant === 'dark' ? 'bg-copper' : 'bg-ink';

  return (
    <div className={`inline-flex items-center gap-2.5 mb-6 sm:mb-8 ${accent}`}>
      <span className={`h-1 w-1 rounded-full ${line}`} />
      <span className="text-[10px] font-bold uppercase tracking-[0.28em]">{children}</span>
    </div>
  );
}
