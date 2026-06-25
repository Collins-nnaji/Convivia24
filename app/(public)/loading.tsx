import { Sparkles } from 'lucide-react';

export default function PublicLoading() {
  return (
    <section className="min-h-[70vh] bg-surface flex items-center justify-center px-6">
      <div className="glass-card p-8 text-center max-w-sm">
        <Sparkles className="mx-auto mb-4 text-copper animate-pulse" size={30} />
        <p className="font-display text-2xl italic text-ink mb-1">Setting the room…</p>
        <p className="text-sm text-ink-muted">Loading curated events and your session.</p>
      </div>
    </section>
  );
}
