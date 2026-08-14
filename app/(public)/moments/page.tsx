'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Camera } from 'lucide-react';
import MomentCard from '@/components/moments/MomentCard';
import MomentComposer from '@/components/moments/MomentComposer';
import { useFeed } from '@/lib/moments/store';
import { useContacts } from '@/lib/meetup/store';

/**
 * The feed. Everything that has already happened, newest first — the part of
 * the app you open when there is nothing to plan.
 */
export default function MomentsPage() {
  const moments = useFeed();
  const contacts = useContacts();
  const [composing, setComposing] = useState(false);

  return (
    <div className="bg-paper min-h-screen">
      <div className="max-w-xl mx-auto px-4 sm:px-8 pt-6 md:pt-16 pb-[calc(6rem+env(safe-area-inset-bottom))]">
        <div className="flex items-end justify-between gap-5 mb-6 md:mb-9">
          <div>
            <h1 className="font-display text-4xl sm:text-6xl font-light italic text-obsidian tracking-tight leading-none mb-2">
              Moments
            </h1>
            <p className="text-obsidian/45 text-sm">
              {moments.length === 0
                ? 'Nothing here yet.'
                : 'The nights, kept. Not the receipts.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setComposing(true)}
            className="hidden md:inline-flex items-center gap-2 px-6 py-3.5 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors shrink-0"
          >
            <Camera size={14} /> Post a moment
          </button>
        </div>

        {moments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-obsidian/10 bg-cream p-8 sm:p-14 text-center"
          >
            <p className="font-display text-3xl italic text-obsidian mb-3">
              The evening is the point.
            </p>
            <p className="text-obsidian/50 text-sm max-w-sm mx-auto mb-8">
              Post a photo and a line about a night out, and it stays here long after anyone has
              stopped caring what it cost.
            </p>
            <button
              type="button"
              onClick={() => setComposing(true)}
              className="inline-flex items-center gap-2 px-7 py-4 bg-gold active:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] active:scale-[0.98] transition-transform"
            >
              <Camera size={14} /> Post the first one
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {moments.map((m) => (
                <MomentCard key={m.id} moment={m} onDelete={() => undefined} />
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-obsidian/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-obsidian/40 text-sm">Nothing in the diary?</p>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-gold-dark active:text-obsidian transition-colors self-start"
          >
            Find a table <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Compose — thumb-reachable, clear of the tab bar */}
      <button
        type="button"
        onClick={() => setComposing(true)}
        aria-label="Post a moment"
        className="md:hidden fixed right-5 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 w-14 h-14 grid place-items-center bg-gold text-obsidian shadow-lg shadow-obsidian/20 active:scale-90 transition-transform"
      >
        <Camera size={22} />
      </button>

      <MomentComposer
        open={composing}
        onClose={() => setComposing(false)}
        people={contacts.map((c) => c.name)}
      />
    </div>
  );
}
