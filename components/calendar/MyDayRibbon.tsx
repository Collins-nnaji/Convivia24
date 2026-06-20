'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Moon, Users } from 'lucide-react';
import type { CalendarItem } from '@/lib/calendar/buffers';

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function MyDayRibbon({
  items,
  completingId,
  onComplete,
}: {
  items: CalendarItem[];
  completingId: string | null;
  onComplete: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <Moon className="mx-auto text-gold-dark/40 mb-4" size={28} />
        <p className="font-display text-2xl italic text-obsidian/50">An open day. Enjoy it.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 sm:pl-8">
      <div className="absolute left-2 sm:left-3 top-2 bottom-2 w-px bg-gold/20" />
      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className={`relative ${completingId === item.id ? 'animate-dissolve' : ''}`}
            >
              <span
                className={`absolute -left-[26px] sm:-left-[34px] top-3 w-2.5 h-2.5 rounded-full ${
                  item.is_rest_block ? 'bg-champagne/50' : 'bg-gold'
                }`}
              />
              <div
                className={`p-4 sm:p-5 border transition-colors ${
                  item.is_rest_block
                    ? 'border-champagne/30 bg-champagne/5'
                    : 'border-obsidian/10 bg-white/70 hover:border-gold/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-dark mb-1">
                      {timeLabel(item.starts_at)} – {timeLabel(item.ends_at)}
                    </p>
                    <p className={`font-display text-lg italic ${item.is_rest_block ? 'text-obsidian/60' : 'text-obsidian'}`}>
                      {item.is_rest_block ? '☁ Rest' : item.title}
                    </p>
                    {item.invitees && item.invitees.length > 0 && (
                      <p className="flex items-center gap-1.5 text-obsidian/45 text-xs mt-1.5">
                        <Users size={12} className="text-gold-dark" /> {item.invitees.map((g) => g.name).join(', ')}
                      </p>
                    )}
                  </div>
                  {!item.is_rest_block && (
                    <button
                      onClick={() => onComplete(item.id)}
                      aria-label="Mark done"
                      className="shrink-0 w-7 h-7 rounded-full border border-obsidian/15 flex items-center justify-center text-obsidian/40 hover:border-champagne hover:text-champagne transition-colors"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
