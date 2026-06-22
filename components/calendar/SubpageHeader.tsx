'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';

export default function SubpageHeader({
  title,
  icon,
  action,
}: {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-obsidian/10 bg-white/90">
      <Link href="/my24" aria-label="Back to My 24" className="p-1.5 -ml-1.5 text-obsidian/50 hover:text-obsidian transition-colors">
        <ChevronLeft size={20} />
      </Link>
      {icon}
      <span className="text-base font-semibold text-obsidian tracking-tight">{title}</span>
      {action && <div className="ml-auto">{action}</div>}
    </header>
  );
}
