import React from 'react';

interface SectionLabelProps {
  children: React.ReactNode;
  variant?: 'dark' | 'light';
}

// Both variants now sit on light backgrounds. "dark" = gold accent eyebrow,
// "light" = obsidian eyebrow. Kept the prop for backwards compatibility.
export function SectionLabel({ children, variant = 'dark' }: SectionLabelProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 mb-8 ${
      variant === 'dark'
        ? 'text-gold-dark border-b border-gold-dark/30 pb-1'
        : 'text-obsidian border-b border-obsidian/20 pb-1'
    }`}>
      <div className={`w-4 h-px ${variant === 'dark' ? 'bg-gold-dark' : 'bg-obsidian'}`} />
      <span className="text-[9px] font-sans font-black uppercase tracking-[0.3em]">{children}</span>
    </div>
  );
}
