'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/components/auth/AuthProvider';

type Circle = {
  id: string;
  slug: string;
  name: string;
  vibeTag: string;
  description: string;
  memberCount: number;
  joined: boolean;
};

export default function CirclesPage() {
  const { user, loading: authLoading } = useUser();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/circles')
      .then((res) => res.json())
      .then((data) => setCircles(data.circles || []))
      .catch(() => setError('Could not load circles.'))
      .finally(() => setLoading(false));
  }, []);

  async function toggle(circle: Circle) {
    if (!user) return;
    setBusy(circle.id);
    setError('');
    const res = await fetch(`/api/circles/${circle.id}/join`, { method: circle.joined ? 'DELETE' : 'POST' });
    setBusy('');
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Could not update that circle.');
      return;
    }
    setCircles((rows) =>
      rows.map((c) =>
        c.id === circle.id
          ? { ...c, joined: !c.joined, memberCount: c.memberCount + (c.joined ? -1 : 1) }
          : c
      )
    );
  }

  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-ember mb-2">Circles</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Find your crowd</h1>
        <p className="text-sm text-obsidian/50 mb-10 max-w-lg">
          Vibe-tagged groups of like-minded Lagos nights out. Join the ones that sound like you — we'll use it
          to point drops, events, and trivia rounds your way.
        </p>

        {!authLoading && !user && (
          <div className="bg-white p-5 shadow-sm mb-8 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-obsidian/60">Sign in to join circles.</p>
            <Link href="/signin?next=/circles" className="px-5 py-2.5 btn-brand text-[11px] font-black uppercase tracking-[0.14em]">
              Sign in
            </Link>
          </div>
        )}
        {error && <p className="text-sm text-ember mb-6">{error}</p>}

        {loading ? (
          <p className="text-sm text-obsidian/45">Loading…</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {circles.map((c) => (
              <div key={c.id} className="bg-white p-6 shadow-sm flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-ember mb-2">{c.vibeTag}</span>
                <h2 className="text-lg font-bold mb-2">{c.name}</h2>
                <p className="text-sm text-obsidian/55 leading-relaxed mb-4 flex-1">{c.description}</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-obsidian/40">
                    {c.memberCount} {c.memberCount === 1 ? 'member' : 'members'}
                  </span>
                  <button
                    type="button"
                    disabled={!user || busy === c.id}
                    onClick={() => toggle(c)}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-40 ${
                      c.joined ? 'border border-obsidian/15 text-obsidian/60' : 'btn-brand'
                    }`}
                  >
                    {busy === c.id ? '…' : c.joined ? 'Joined ✓' : 'Join'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
