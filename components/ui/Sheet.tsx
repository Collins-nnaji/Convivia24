'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * A bottom sheet on a phone, a centred dialog on a desktop.
 *
 * Drag it down past a threshold — or flick it — and it closes, which is the
 * gesture people already expect from every native sheet they use.
 */
export default function Sheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  // Sheets render into <body>. The page wrapper sets `relative z-0` for the
  // route transition, which opens a stacking context — a sheet rendered inside
  // it can never rise above the tab bar, however high its own z-index goes.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Escape closes, and the page behind must not scroll while a sheet is up.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-obsidian/60 backdrop-blur-[2px]"
          />

          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={reduce ? { opacity: 0 } : { y: '100%' }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.8 }}
            drag={reduce ? false : 'y'}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 700) onClose();
            }}
            className="fixed z-[61] inset-x-0 bottom-0 sm:inset-0 sm:m-auto sm:h-fit sm:max-w-lg
                       bg-paper border-t sm:border border-obsidian/15 shadow-2xl
                       max-h-[88vh] sm:max-h-[80vh] flex flex-col"
          >
            {/* Grab handle — the affordance that says "you can drag this" */}
            <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0 cursor-grab active:cursor-grabbing">
              <span className="w-10 h-1 rounded-full bg-obsidian/20" />
            </div>

            <header className="flex items-start justify-between gap-4 px-5 pt-3 pb-4 border-b border-obsidian/10 shrink-0">
              <div className="min-w-0">
                <h2 className="font-display text-2xl italic text-obsidian leading-none truncate">{title}</h2>
                {subtitle && <p className="text-obsidian/45 text-xs mt-1.5">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="p-2 -m-1 text-obsidian/35 hover:text-obsidian active:scale-90 transition-all shrink-0"
              >
                <X size={20} />
              </button>
            </header>

            <div className="overflow-y-auto overscroll-contain px-5 py-5 flex-1">{children}</div>

            {footer && (
              <div className="border-t border-obsidian/10 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shrink-0 bg-cream">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
