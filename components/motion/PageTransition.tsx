'use client';

import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { EASE_OUT } from '@/lib/motion/presets';

export default function PageTransition({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? undefined : { opacity: 0, y: -10 }}
        transition={{ duration: 0.34, ease: EASE_OUT }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
