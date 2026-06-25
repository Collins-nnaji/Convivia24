'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function PublicLoading() {
  return (
    <section className="min-h-[70vh] bg-surface flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card p-8 text-center max-w-sm w-full"
      >
        <motion.div
          animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-copper/10"
        >
          <Sparkles className="text-copper" size={28} />
        </motion.div>
        <p className="font-display text-2xl italic text-ink mb-1">Setting the room…</p>
        <p className="text-sm text-ink-muted mb-5">Loading curated events and your session.</p>
        <div className="flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-2 w-2 rounded-full bg-copper/70"
              animate={{ opacity: [0.35, 1, 0.35], y: [0, -4, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
