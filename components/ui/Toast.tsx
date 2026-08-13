'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Small transient confirmations — "link copied", "added to the order". A module
 * level emitter rather than context, so any handler anywhere can call `toast()`
 * without the tree knowing about it.
 */

interface ToastMessage {
  id: number;
  text: string;
  tone: 'default' | 'error';
}

let nextId = 1;
const listeners = new Set<(t: ToastMessage) => void>();

export function toast(text: string, tone: ToastMessage['tone'] = 'default') {
  const message = { id: nextId++, text, tone };
  listeners.forEach((l) => l(message));
}

export default function Toaster() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const onMessage = (m: ToastMessage) => {
      setMessages((prev) => [...prev, m]);
      setTimeout(() => setMessages((prev) => prev.filter((x) => x.id !== m.id)), 2600);
    };
    listeners.add(onMessage);
    return () => {
      listeners.delete(onMessage);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      className="fixed z-[70] inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-8 flex flex-col items-center gap-2 px-5 pointer-events-none"
    >
      <AnimatePresence initial={false}>
        {messages.map((m) => (
          <motion.div
            key={m.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 460, damping: 34 }}
            className={`px-5 py-3 shadow-lg text-[13px] font-medium max-w-sm text-center ${
              m.tone === 'error' ? 'bg-red-600 text-white' : 'bg-obsidian text-cream border border-gold/30'
            }`}
          >
            {m.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
