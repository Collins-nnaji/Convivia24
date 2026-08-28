'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';

export default function CartToast() {
  const { toast, dismissToast } = useCart();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className="fixed bottom-[8.25rem] md:bottom-6 left-1/2 z-[60] w-[min(100vw-1.5rem,380px)] -translate-x-1/2 pointer-events-auto"
          role="status"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-obsidian/10 bg-white px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.14)]">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
              <Check size={18} strokeWidth={2.5} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-obsidian truncate">{toast.name}</p>
              <p className="text-xs text-obsidian/50">Added to cart</p>
            </div>
            <Link
              href="/cart"
              onClick={dismissToast}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-ember px-3 py-2 text-xs font-bold text-white hover:brightness-110"
            >
              View cart <ArrowRight size={13} />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
