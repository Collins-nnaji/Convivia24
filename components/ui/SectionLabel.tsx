import React from 'react';

interface SectionLabelProps {
  children: React.ReactNode;
  variant?: 'dark' | 'light';
}

export function SectionLabel({ children, variant = 'dark' }: SectionLabelProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 mb-8 ${
      variant === 'dark'
        ? 'text-gold border-b border-gold/30 pb-1'
        : 'text-obsidian border-b border-obsidian/20 pb-1'
    }`}>
      <div className={`w-4 h-px ${variant === 'dark' ? 'bg-gold' : 'bg-obsidian'}`} />
      <span className="text-[9px] font-sans font-black uppercase tracking-[0.3em]">{children}</span>
    </div>
  );
}
