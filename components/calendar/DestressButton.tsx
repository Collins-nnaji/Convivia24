'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

interface Move { id: string; title: string; move_to: string }

export default function DestressButton({ onAccept }: { onAccept: (moves: Move[]) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [moves, setMoves] = useState<Move[]>([]);

  async function ask() {
    setOpen(true);
    setLoading(true);
    setReply(null);
    setMoves([]);
    try {
      const res = await fetch('/api/ai/destress', { method: 'POST' });
      const data = await res.json();
      setReply(data.reply || 'Here\'s a calmer version of your day.');
      setMoves(data.moves || []);
    } catch {
      setReply('Could not reach the AI right now — try again shortly.');
    } finally {
      setLoading(false);
    }
  }

  async function accept() {
    setApplying(true);
    try {
      await onAccept(moves);
      setOpen(false);
    } finally {
      setApplying(false);
    }
  }

  return (
    <>
      <button
        onClick={ask}
        className="fixed bottom-6 right-5 sm:right-8 z-40 flex items-center gap-2 px-5 py-3.5 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.15em] shadow-lg shadow-gold/30 transition-colors rounded-full"
      >
        <Sparkles size={15} /> Destress my day
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-obsidian/40"
              onClick={() => !applying && setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-0 inset-x-0 sm:bottom-8 sm:left-1/2 sm:-translate-x-1/2 z-50 w-full sm:w-[420px] bg-cream-base border-t sm:border border-gold/30 p-6 sm:rounded-lg"
            >
              <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-obsidian/40 hover:text-obsidian">
                <X size={16} />
              </button>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gold-dark mb-3">Take a breath</p>
              {loading ? (
                <p className="font-display text-lg italic text-obsidian/60">Thinking through your day…</p>
              ) : (
                <>
                  <p className="font-display text-xl italic text-obsidian mb-4">{reply}</p>
                  {moves.length > 0 && (
                    <ul className="space-y-1.5 mb-5">
                      {moves.map((m) => (
                        <li key={m.id} className="text-sm text-obsidian/60">→ {m.title} moves to tomorrow</li>
                      ))}
                    </ul>
                  )}
                  {moves.length > 0 ? (
                    <button
                      onClick={accept}
                      disabled={applying}
                      className="w-full py-3 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors disabled:opacity-50"
                    >
                      {applying ? 'Clearing space…' : 'Clear my evening'}
                    </button>
                  ) : (
                    <button onClick={() => setOpen(false)} className="w-full py-3 border border-obsidian/15 text-obsidian text-[11px] font-black uppercase tracking-[0.2em]">
                      Okay
                    </button>
                  )}
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
