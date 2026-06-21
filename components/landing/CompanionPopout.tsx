'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CompanionPopout() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut', delay: 0.5 }}
      className="relative lg:absolute lg:bottom-0 lg:right-0 lg:translate-x-8 lg:translate-y-10 w-full sm:w-[340px] pointer-events-auto z-10"
    >
      <div className="rounded-2xl bg-obsidian shadow-2xl shadow-obsidian/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] text-gold">
            <span className="w-4 h-4 rounded-full bg-gold/90" />
            Companion
          </span>
          <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Online
          </span>
        </div>

        <p className="font-display text-lg italic text-cream leading-snug mb-4">
          &ldquo;How do you want tomorrow to feel?&rdquo;
        </p>

        <div className="flex items-center gap-2">
          <Link
            href="/companion"
            className="flex-1 inline-flex items-center justify-center rounded-lg px-3 py-2.5 bg-white/10 hover:bg-white/15 text-cream/90 text-[10px] font-black uppercase tracking-[0.1em] transition-colors text-center"
          >
            A slow one
          </Link>
          <Link
            href="/companion"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 bg-gold hover:bg-gold-light text-obsidian text-[10px] font-black uppercase tracking-[0.1em] transition-colors"
          >
            Plan it <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
