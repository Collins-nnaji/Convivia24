'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp, tween } from '@/lib/motion/presets';

interface FadeInViewProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}

export default function FadeInView({ children, className = '', delay = 0, y = 24 }: FadeInViewProps) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={tween(0.5, delay)}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGrid({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.07 } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={fadeUp} transition={tween(0.45)}>
      {children}
    </motion.div>
  );
}
