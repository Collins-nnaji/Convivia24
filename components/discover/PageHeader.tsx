import type { ReactNode } from 'react';

/**
 * Compact masthead for a Discover section. Deliberately short — the sub-nav above already says
 * where you are, so this is a title, one line of context and room for an action.
 */
export default function PageHeader({
  eyebrow,
  title,
  lead,
  action,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-obsidian/8 px-4 py-4 sm:px-6 sm:py-5">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-ember">{eyebrow}</p>}
        <h1 className="font-wordmark text-2xl leading-tight text-obsidian sm:text-4xl">{title}</h1>
        {lead && <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed text-obsidian/60">{lead}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
