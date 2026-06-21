'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

function PopoutCard({ className = '' }: { className?: string }) {
  return (
    <div className={`relative bg-obsidian border border-gold/30 shadow-xl shadow-obsidian/25 p-5 sm:p-6 ${className}`}>
      <span
        className="absolute -left-2 top-10 w-3 h-3 rotate-45 bg-obsidian border-l border-b border-gold/30 hidden lg:block"
        aria-hidden
      />
      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-gold mb-2.5">Companion</p>
      <p className="font-display text-xl italic text-cream leading-snug mb-3">
        &ldquo;What kind of day do you want tomorrow?&rdquo;
      </p>
      <p className="text-cream/80 text-sm leading-relaxed mb-5">
        Plans around what matters to you — one conversation at a time.
      </p>
      <Link
        href="/companion"
        className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-gold hover:bg-gold-light text-obsidian text-[10px] font-black uppercase tracking-[0.15em] transition-colors"
      >
        <Sparkles size={13} /> Talk to your Companion
      </Link>
    </div>
  );
}

export default function CompanionPopout() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut', delay: 0.5 }}
      className="w-full lg:w-[260px] lg:shrink-0 pointer-events-auto"
    >
      <PopoutCard />
    </motion.div>
  );
}
