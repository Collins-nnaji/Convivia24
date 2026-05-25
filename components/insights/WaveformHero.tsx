'use client';

import { motion, useReducedMotion } from 'framer-motion';

const BARS = 48;

export function WaveformHero() {
  const reduce = useReducedMotion();

  return (
    <div className="flex items-end justify-center gap-[3px] h-16 sm:h-20 opacity-60" aria-hidden>
      {Array.from({ length: BARS }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] sm:w-1 rounded-full bg-gradient-to-t from-gold-dark to-gold"
          initial={{ height: 8 }}
          animate={
            reduce
              ? { height: 12 + (i % 5) * 4 }
              : {
                  height: [8, 12 + (i % 7) * 6, 16 + (i % 4) * 8, 10 + (i % 6) * 5, 8],
                }
          }
          transition={{
            duration: 1.2 + (i % 8) * 0.15,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.04,
          }}
        />
      ))}
    </div>
  );
}
