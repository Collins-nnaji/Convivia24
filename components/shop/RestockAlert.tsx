'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { BellRing, Check } from 'lucide-react';

export type Availability = { tracked: boolean; active?: boolean; available?: number; low?: boolean };

/** Live stock for a statically built product page. `null` until known. */
export function useAvailability(slug: string): Availability | null {
  const [a, setA] = useState<Availability | null>(null);
  useEffect(() => {
    let live = true;
    fetch(`/api/shop/availability?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : { tracked: false }))
      .then((d) => live && setA(d))
      .catch(() => live && setA({ tracked: false }));
    return () => {
      live = false;
    };
  }, [slug]);
  return a;
}

/** "Sold out — tell me when it's back." One email, one bottle. */
export default function RestockAlert({ slug, name }: { slug: string; name: string }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState('busy');
    setError('');
    const res = await fetch('/api/shop/restock-alert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, email }) });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || 'Could not save that.');
      setState('error');
      return;
    }
    setState('done');
  }

  if (state === 'done') {
    return (
      <p className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
        <Check size={15} /> We&apos;ll email you the moment {name} is back.
      </p>
    );
  }
  return (
    <form onSubmit={submit} className="rounded-xl border border-obsidian/10 bg-white p-4">
      <p className="flex items-center gap-2 text-sm font-bold text-obsidian"><BellRing size={15} className="text-ember" /> Sold out right now</p>
      <p className="mt-1 text-[13px] text-obsidian/55">Leave your email and we&apos;ll tell you when it&apos;s back on the shelf.</p>
      <div className="mt-3 flex gap-2">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="min-w-0 flex-1 rounded-lg border border-obsidian/12 px-3 py-2.5 text-sm focus:border-ember focus:ring-0" />
        <button type="submit" disabled={state === 'busy'} className="btn-brand rounded-lg px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] disabled:opacity-50">
          {state === 'busy' ? '…' : 'Notify me'}
        </button>
      </div>
      {error && <p className="mt-2 text-[12px] text-ember">{error}</p>}
    </form>
  );
}
