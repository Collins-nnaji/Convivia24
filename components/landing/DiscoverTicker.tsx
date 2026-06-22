'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CuratedEvent } from '@/lib/events/seeds';

export default function DiscoverTicker() {
  const [picks, setPicks] = useState<CuratedEvent[]>([]);

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((data) => setPicks((data.events || []).slice(0, 8)))
      .catch(() => {});
  }, []);

  if (picks.length === 0) return null;

  return (
    <Link
      href="/discover"
      className="block border-t border-b border-white/10 bg-obsidian hover:bg-obsidian-50 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-3 flex items-center gap-6 overflow-x-auto scrollbar-hide">
        <span className="shrink-0 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-ember">
          <span className="w-1.5 h-1.5 rounded-full bg-ember live-dot" aria-hidden /> Happening now
        </span>
        {picks.map((p, i) => (
          <span key={p.id} className="flex items-center gap-6 shrink-0">
            <span className="text-[12px] text-cream/70">
              <span className="text-cream/90 font-medium">{p.city}</span>
              <span className="text-cream/40"> &middot; </span>
              {p.title}
            </span>
            {i < picks.length - 1 && <span className="text-gold/40 text-sm">+</span>}
          </span>
        ))}
      </div>
    </Link>
  );
}
