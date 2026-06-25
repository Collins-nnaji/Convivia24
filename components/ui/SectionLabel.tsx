'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface SectionLabelProps {
  children: React.ReactNode;
  variant?: 'dark' | 'light';
}

export function SectionLabel({ children, variant = 'dark' }: SectionLabelProps) {
  const reduce = useReducedMotion();
  const accent = variant === 'dark' ? 'text-copper-deep border-copper/30' : 'text-ink border-ink/15';
  const line = variant === 'dark' ? 'bg-copper' : 'bg-ink';

  return (
    <div className={`inline-flex items-center gap-2.5 mb-6 sm:mb-8 ${accent}`}>
      <motion.span
        className={`h-1.5 w-1.5 rounded-full ${line}`}
        animate={reduce ? undefined : { scale: [1, 1.35, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="text-[10px] font-bold uppercase tracking-[0.28em]">{children}</span>
    </div>
  );
}
