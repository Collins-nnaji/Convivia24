'use client';

import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="min-h-[70vh] bg-surface flex items-center justify-center px-6">
      <div className="glass-card p-8 text-center max-w-md">
        <AlertTriangle className="mx-auto mb-4 text-amber-600" size={34} />
        <p className="font-display text-3xl italic text-ink mb-2">Something slipped.</p>
        <p className="text-sm text-ink-muted leading-relaxed mb-6">
          The app could not load this view. Try again, or return to discovery.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <p className="mb-5 rounded-xl bg-red-50 p-3 text-left text-xs text-red-700 break-words">
            {error.message}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button type="button" onClick={reset} className="btn-primary">
            <RefreshCw size={16} /> Retry
          </button>
          <Link href="/events" className="btn-secondary">
            Discover events
          </Link>
        </div>
      </div>
    </section>
  );
}
