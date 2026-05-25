'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

const easeOut = [0.16, 1, 0.3, 1] as const;

export function InsightsNav({ backHref = '/' }: { backHref?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOut }}
      className="fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between
                 px-5 sm:px-10 bg-[#f8f6f2]/90 backdrop-blur-xl border-b border-neutral-200/70"
    >
      <div className="flex items-center gap-4 min-w-0">
        <Link
          href={backHref}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest
                     text-neutral-500 hover:text-neutral-900 transition-colors shrink-0"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Home</span>
        </Link>
        <Link href="/insights" className="shrink-0">
          <BrandLogo alt="Convivia24" className="h-6 w-auto" />
        </Link>
        <span className="hidden md:inline text-[10px] font-black uppercase tracking-[0.35em] text-gold-dark truncate">
          Insights
        </span>
      </div>

      <nav className="hidden sm:flex items-center gap-2">
        <Link
          href="/insights"
          className="px-4 py-2 text-[11px] font-bold text-neutral-600 hover:text-neutral-900
                     uppercase tracking-widest transition-colors"
        >
          All signals
        </Link>
        <Link
          href="/auth/sign-in"
          className="px-4 py-2.5 text-[11px] font-bold text-neutral-600 hover:text-neutral-900 uppercase tracking-widest"
        >
          Sign in
        </Link>
        <Link
          href="/auth/sign-up"
          className="px-5 py-2.5 rounded-full bg-neutral-900 text-white text-[11px] font-black
                     uppercase tracking-widest hover:bg-neutral-800 transition-colors"
        >
          Sign up
        </Link>
      </nav>

      <button
        type="button"
        className="sm:hidden p-2"
        onClick={() => setOpen(v => !v)}
        aria-label="Menu"
        aria-expanded={open}
      >
        <div className="flex flex-col gap-[5px] w-5">
          <span className={`block h-0.5 bg-neutral-900 transition-transform ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
          <span className={`block h-0.5 bg-neutral-900 transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 bg-neutral-900 transition-transform ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-14 inset-x-0 bg-[#f8f6f2] border-b border-neutral-200 px-6 py-4 flex flex-col gap-3 sm:hidden"
          >
            <Link href="/insights" className="text-sm font-bold" onClick={() => setOpen(false)}>
              All signals
            </Link>
            <Link href="/auth/sign-in" className="text-sm font-bold text-neutral-700" onClick={() => setOpen(false)}>
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="py-3 rounded-xl bg-neutral-900 text-white text-sm font-black text-center"
              onClick={() => setOpen(false)}
            >
              Sign up
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
