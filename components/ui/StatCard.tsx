'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  index?: number;
}

export default function StatCard({ icon: Icon, label, value, sub, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="glass-card p-5 sm:p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-copper/10 text-copper">
          <Icon size={18} strokeWidth={2} />
        </span>
      </div>
      <p className="font-display text-3xl sm:text-4xl font-medium tracking-tight text-ink">{value}</p>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-muted mt-2">{label}</p>
      {sub && <p className="text-xs text-ink-muted/70 mt-0.5">{sub}</p>}
    </motion.div>
  );
}
