import type { ReactNode } from 'react';
export const deskField = 'w-full rounded-lg border border-obsidian/20 bg-white px-3 py-2 text-sm focus:border-ember focus:ring-ember';
export const deskButton = 'rounded-lg border border-obsidian/20 px-3 py-2 text-sm font-semibold hover:bg-obsidian/5 disabled:opacity-40';
export function DeskHeader({ title, description, loading, busy, error, message, reload }: {
  title: string; description: string; loading: boolean; busy: boolean; error: string; message: string; reload: () => Promise<boolean>;
}) {
  return <header aria-label={title} className="space-y-3">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="max-w-3xl text-sm text-obsidian/65">{description}</p></div><button className={deskButton} disabled={loading || busy} onClick={() => void reload()}>{loading ? 'Refreshing…' : 'Refresh'}</button></div>
    {error && <div role="alert" className="rounded-lg border border-ember/25 bg-ember/5 p-4 text-sm text-ember">{error} <span className="block mt-1">Use Refresh to retry. Records are unavailable until the request succeeds.</span></div>}
    {message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
    {loading && <p role="status" className="text-sm text-obsidian/60">Loading records…</p>}
  </header>;
}
export function DeskPanel({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <section className="space-y-4 rounded-xl border border-obsidian/10 bg-white p-5"><h3 className="text-lg font-bold">{title}</h3>{description && <p className="text-sm text-obsidian/60">{description}</p>}{children}</section>;
}
export function DeskEmpty({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-dashed border-obsidian/15 p-4 text-sm text-obsidian/60">{children}</p>;
}
export function DeskStats({ items }: { items: { label: string; value: number }[] }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{items.map(item => <div key={item.label} className="rounded-xl border border-obsidian/10 bg-white p-4"><p className="text-sm text-obsidian/60">{item.label}</p><p className="mt-1 text-2xl font-bold">{item.value}</p></div>)}</div>;
}
