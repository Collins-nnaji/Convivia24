'use client';

import Link from 'next/link';
import { LifeBuoy } from 'lucide-react';
import { RESOURCES, type RiskLevel } from '@/lib/support/safety';

/** Persistent (non-dismissing) — shown whenever the companion's risk read on the
 *  conversation is elevated or crisis. Never replaces the companion's own reply,
 *  just sits alongside it with real resources + a path to a human supporter. */
export default function RiskBanner({ level }: { level: RiskLevel }) {
  if (level === 'none') return null;

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 space-y-2.5">
      <div className="flex items-center gap-2">
        <LifeBuoy size={15} className="text-rose-600 shrink-0" />
        <p className="text-sm font-semibold text-rose-800">{RESOURCES.headline}</p>
      </div>
      <p className="text-sm text-rose-700/90">{RESOURCES.body}</p>
      <div className="flex items-center gap-3 pt-1">
        <a
          href={RESOURCES.linkHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-black uppercase tracking-[0.12em] text-rose-700 hover:text-rose-900 underline"
        >
          {RESOURCES.linkLabel}
        </a>
        <Link
          href="/support"
          className="text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/70 hover:text-obsidian underline"
        >
          Book a supporter
        </Link>
      </div>
    </div>
  );
}
