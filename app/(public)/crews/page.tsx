'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/auth/AuthProvider';

type Crew = {
  id: string;
  name: string;
  inviteCode: string;
  status: 'open' | 'checked_out' | 'closed';
  createdAt: string;
};

export default function CrewsPage() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const [crews, setCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetch('/api/crews')
      .then((res) => res.json())
      .then((data) => setCrews(data.crews || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  async function startCrew(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError('');
    const res = await fetch('/api/crews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    setCreating(false);
    if (!res.ok) {
      setError(data.error || 'Could not start a crew.');
      return;
    }
    router.push(`/crews/${data.crew.id}?code=${data.crew.inviteCode}`);
  }

  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-ember mb-2">Party Crews</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Order together, split evenly</h1>
        <p className="text-sm text-obsidian/50 mb-10 max-w-lg">
          Start a crew, share the invite link, and everyone adds their own drinks to one cart. One checkout,
          one delivery, split the total by however many showed up.
        </p>

        {authLoading ? (
          <p className="text-sm text-obsidian/45">Loading…</p>
        ) : !user ? (
          <div className="bg-white p-6 sm:p-8 shadow-sm">
            <p className="text-sm text-obsidian/60 mb-4">Sign in to start or join a crew.</p>
            <Link href="/signin?next=/crews" className="inline-block px-5 py-2.5 btn-brand text-[11px] font-black uppercase tracking-[0.14em]">
              Sign in
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={startCrew} className="bg-white p-6 sm:p-8 mb-10 shadow-sm flex flex-col sm:flex-row gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Crew name — e.g. Friday at Yaba"
                className="flex-1 border-0 border-b border-obsidian/20 focus:border-ember focus:ring-0 text-sm py-2.5 px-0"
              />
              <button
                type="submit"
                disabled={creating || !name.trim()}
                className="px-6 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-50 shrink-0"
              >
                {creating ? 'Starting…' : 'Start a crew'}
              </button>
            </form>
            {error && <p className="text-sm text-ember mb-6">{error}</p>}

            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 mb-4">Your crews</h2>
            {loading ? (
              <p className="text-sm text-obsidian/45">Loading…</p>
            ) : crews.length === 0 ? (
              <p className="text-sm text-obsidian/45">No crews yet — start one above.</p>
            ) : (
              <ul className="space-y-3">
                {crews.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/crews/${c.id}`}
                      className="flex items-center justify-between gap-4 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <span className="font-medium">{c.name}</span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-[0.1em] px-2 py-1 ${
                          c.status === 'open' ? 'bg-emerald-50 text-emerald-700' : 'bg-paper text-obsidian/50'
                        }`}
                      >
                        {c.status === 'open' ? 'Open' : c.status === 'checked_out' ? 'Ordered' : 'Closed'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </section>
  );
}
