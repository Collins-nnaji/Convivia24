import React from 'react';

interface SectionLabelProps {
  children: React.ReactNode;
  dark?: boolean;
}

export function SectionLabel({ children, dark = false }: SectionLabelProps) {
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] mb-8 ${
      dark
        ? 'bg-white text-zinc-900'
        : 'bg-red-700 text-white'
    }`}>
      <div className={`w-1.5 h-1.5 ${dark ? 'bg-red-700' : 'bg-white'}`} />
      {children}
    </div>
  );
}
