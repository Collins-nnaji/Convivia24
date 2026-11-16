import type { ReactNode } from 'react';
import { Minus, Plus } from 'lucide-react';
export const deskField = 'w-full rounded-md border border-obsidian/25 bg-white px-3 py-2 text-sm text-obsidian focus:border-obsidian focus:ring-obsidian';
export const deskButton = 'rounded-md border border-obsidian/25 bg-white px-3 py-1.5 text-sm font-semibold text-obsidian hover:border-obsidian hover:bg-obsidian/[0.03] disabled:opacity-40';
export function DeskHeader({ title, description, loading, busy, error, message, reload }: {
  title: string; description: string; loading: boolean; busy: boolean; error: string; message: string; reload: () => Promise<boolean>;
}) {
  return <header aria-label={title} className="space-y-2 pb-1">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="max-w-3xl text-xs text-obsidian/70">{description}</p></div><button className={deskButton} disabled={loading || busy} onClick={() => void reload()}>{loading ? 'Refreshing…' : 'Refresh'}</button></div>
    {error && <div role="alert" className="rounded-md border border-ember/30 bg-ember/5 px-3 py-2 text-sm text-ember">{error} <span className="block mt-1">Use Refresh to retry. Records are unavailable until the request succeeds.</span></div>}
    {message && <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p>}
    {loading && <p role="status" className="text-sm text-obsidian/70">Loading records…</p>}
  </header>;
}
export function DeskPanel({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <section className="border-t border-obsidian/15 pt-3"><div className="mb-2"><h3 className="text-sm font-bold text-obsidian">{title}</h3>{description && <p className="mt-0.5 text-xs text-obsidian/65">{description}</p>}</div><div className="space-y-3">{children}</div></section>;
}
export function DeskEmpty({ children }: { children: ReactNode }) {
  return <p className="rounded-md border border-dashed border-obsidian/25 bg-white px-4 py-3 text-sm text-obsidian/70">{children}</p>;
}
export function DeskStats({ items }: { items: { label: string; value: number }[] }) {
  return <div className="grid gap-px overflow-hidden rounded-lg border border-obsidian/15 bg-obsidian/15 sm:grid-cols-2 xl:grid-cols-4">{items.map(item => <div key={item.label} className="bg-white px-4 py-3"><p className="text-[11px] font-semibold uppercase tracking-wider text-obsidian/60">{item.label}</p><p className="mt-0.5 text-2xl font-bold tabular-nums text-obsidian">{item.value}</p></div>)}</div>;
}

/** The one expand/collapse marker on the desk: a small box with + when closed, − when open. */
export function PlusMinus({ open, size = 'md' }: { open: boolean; size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'h-5 w-5' : 'h-6 w-6';
  const icon = size === 'sm' ? 11 : 13;
  return (
    <span
      aria-hidden
      className={`grid ${box} shrink-0 place-items-center rounded border transition-colors ${
        open ? 'border-obsidian bg-obsidian text-white' : 'border-obsidian/30 text-obsidian/75'
      }`}
    >
      {open ? <Minus size={icon} strokeWidth={2.5} /> : <Plus size={icon} strokeWidth={2.5} />}
    </span>
  );
}
