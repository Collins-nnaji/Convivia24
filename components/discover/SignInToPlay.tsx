'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogIn, X } from 'lucide-react';

export default function SignInToPlay({ next, onClose, onGuest }: { next: string; onClose: () => void; onGuest: () => void }) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sign-in-to-play-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-3"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ember">Before you play</p>
            <h2 id="sign-in-to-play-title" className="font-wordmark mt-2 text-xl text-obsidian sm:text-2xl">
              Keep your points
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close sign-in prompt" className="rounded-full p-2 text-obsidian/40 hover:bg-paper hover:text-obsidian">
            <X size={18} />
          </button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-obsidian/60">
          Sign in to save your score, collect challenge points and redeem rewards. You can also continue as a guest.
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Link href={`/signin?next=${encodeURIComponent(next)}`} className="btn-brand inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold">
            <LogIn size={16} /> Sign in
          </Link>
          <button type="button" onClick={onGuest} className="min-h-12 rounded-xl border border-obsidian/12 bg-white px-4 text-sm font-semibold text-obsidian hover:border-ember/35">
            Continue as guest
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
