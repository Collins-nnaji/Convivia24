'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, RotateCcw } from 'lucide-react';

const MOODS = ['Calm', 'Productive', 'Adventurous', 'Social', 'Romantic', 'Family-focused', 'Creative', 'Balanced'];

interface PlanBlock {
  title: string;
  starts_at: string;
  ends_at: string;
  priority: 'low' | 'normal' | 'high';
  notes?: string;
}

interface FixedCommitment {
  title: string;
  starts_at: string;
  ends_at: string;
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function sortByStart<T extends { starts_at: string }>(items: T[]) {
  return [...items].sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at));
}

function isDowntime(title: string) {
  return /protected downtime|wind.?down|downtime/i.test(title);
}

export default function DayPlanner({ onAccept }: { onAccept: (blocks: PlanBlock[]) => Promise<void> }) {
  const [mood, setMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<PlanBlock[]>([]);
  const [fixed, setFixed] = useState<FixedCommitment[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function plan(chosenMood: string) {
    if (!chosenMood.trim()) return;
    setMood(chosenMood);
    setLoading(true);
    setError(null);
    setReply(null);
    setBlocks([]);
    setFixed([]);
    try {
      const res = await fetch('/api/ai/plan-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: chosenMood }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not plan your day.');
      setReply(data.reply || null);
      setBlocks(sortByStart(data.blocks || []));
      setFixed(sortByStart(data.fixed_commitments || []));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not plan your day.');
    } finally {
      setLoading(false);
    }
  }

  async function accept() {
    setApplying(true);
    try {
      await onAccept(blocks);
      setBlocks([]);
      setFixed([]);
      setReply(null);
      setMood('');
    } finally {
      setApplying(false);
    }
  }

  function reset() {
    setMood('');
    setReply(null);
    setBlocks([]);
    setFixed([]);
    setError(null);
  }

  const hasPlan = blocks.length > 0 || reply;
  const timeline = sortByStart([
    ...fixed.map((f) => ({ ...f, kind: 'fixed' as const })),
    ...blocks.map((b) => ({ ...b, kind: 'proposed' as const })),
  ]);

  return (
    <div className="shrink-0 border-b border-obsidian/10 bg-white/80">
      <AnimatePresence mode="wait" initial={false}>
        {!hasPlan && !loading ? (
          <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-3 sm:px-4 py-2.5">
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => plan(m)}
                  className="px-2.5 py-1 border border-obsidian/10 hover:border-gold hover:bg-gold/10 text-obsidian/60 hover:text-obsidian text-[11px] font-medium transition-colors rounded-full"
                >
                  {m}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); plan(mood); }}
              className="flex items-center gap-1.5"
            >
              <input
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="How should tomorrow feel? e.g. calm morning, easy evening"
                className="flex-1 px-2.5 py-2 border border-obsidian/10 bg-white text-sm focus:border-gold outline-none"
              />
              <button
                type="submit"
                aria-label="Plan tomorrow"
                className="shrink-0 w-9 h-9 flex items-center justify-center bg-obsidian hover:bg-obsidian-50 text-cream transition-colors"
              >
                <ArrowRight size={15} />
              </button>
            </form>
            {error && <p className="text-rose-500 text-xs mt-1.5">{error}</p>}
          </motion.div>
        ) : loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-3 sm:px-4 py-3">
            <p className="text-sm text-obsidian/50">Planning tomorrow…</p>
          </motion.div>
        ) : (
          <motion.div key="plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-3 sm:px-4 py-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm text-obsidian/80 leading-snug">{reply}</p>
              <button
                type="button"
                onClick={reset}
                aria-label="Start over"
                className="shrink-0 w-7 h-7 flex items-center justify-center text-obsidian/35 hover:text-obsidian transition-colors"
              >
                <RotateCcw size={13} />
              </button>
            </div>

            {timeline.length > 0 && (
              <div className="relative pl-5 sm:pl-6 mb-2 max-h-48 overflow-y-auto">
                <div className="absolute left-1.5 sm:left-2 top-1 bottom-1 w-px bg-gold/20" />
                <div className="space-y-1.5">
                  {timeline.map((item, i) => {
                    const downtime = item.kind === 'proposed' && isDowntime(item.title);
                    const isFixed = item.kind === 'fixed';
                    return (
                      <div key={`${item.kind}-${i}`} className="relative">
                        <span
                          className={`absolute -left-[18px] sm:-left-[22px] top-2.5 w-2 h-2 rounded-full ${
                            isFixed ? 'bg-obsidian/25' : downtime ? 'bg-champagne/50' : 'bg-gold'
                          }`}
                        />
                        <div
                          className={`px-2.5 py-1.5 border text-sm ${
                            isFixed
                              ? 'border-obsidian/8 bg-obsidian/[0.03]'
                              : downtime
                                ? 'border-champagne/30 bg-champagne/5'
                                : 'border-obsidian/10 bg-white'
                          }`}
                        >
                          <span className="text-[10px] font-medium uppercase tracking-wide text-obsidian/40 mr-2">
                            {timeLabel(item.starts_at)}–{timeLabel(item.ends_at)}
                          </span>
                          <span className={isFixed ? 'text-obsidian/55' : 'text-obsidian'}>{item.title}</span>
                          {isFixed && <span className="text-[10px] text-obsidian/30 ml-1.5">fixed</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {blocks.length > 0 ? (
              <button
                onClick={accept}
                disabled={applying}
                className="w-full sm:w-auto px-4 py-2 bg-gold hover:bg-gold-light text-obsidian text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {applying ? 'Adding…' : 'Add to my day'}
              </button>
            ) : reply ? (
              <button
                type="button"
                onClick={reset}
                className="text-xs text-obsidian/50 hover:text-obsidian transition-colors"
              >
                Try again
              </button>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
