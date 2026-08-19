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

export default function CirclesPanel() {
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
    <div>
      <div className="mb-6 max-w-xl">
        <h2 className="font-logo font-extrabold uppercase tracking-tight text-xl sm:text-2xl text-obsidian mb-2">
          Circles
        </h2>
        <p className="text-sm sm:text-base text-obsidian/55 leading-relaxed">
          Community rooms for Lagos nights — follow the crowds that match your vibe. We&apos;ll point drops,
          events, and trivia your way.
        </p>
      </div>

      {!authLoading && !user && (
        <div className="bg-white p-5 mb-6 flex items-center justify-between gap-4 flex-wrap shadow-[0_14px_40px_-20px_rgba(10,10,10,0.3)]">
          <p className="text-sm text-obsidian/60">Sign in to follow circles.</p>
          <Link
            href={`/signin?next=${encodeURIComponent('/events?tab=circles')}`}
            className="px-5 py-2.5 btn-brand text-[11px] font-black uppercase tracking-[0.14em]"
          >
            Sign in
          </Link>
        </div>
      )}
      {error && <p className="text-sm text-ember mb-6">{error}</p>}

      {loading ? (
        <p className="text-sm text-obsidian/45">Loading circles…</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          {circles.map((c) => (
            <div
              key={c.id}
              className="bg-white p-6 flex flex-col shadow-[0_14px_40px_-20px_rgba(10,10,10,0.3)]"
            >
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-ember mb-2">{c.vibeTag}</span>
              <h3 className="font-logo font-extrabold uppercase tracking-tight text-lg text-obsidian mb-2">
                {c.name}
              </h3>
              <p className="text-sm text-obsidian/55 leading-relaxed mb-4 flex-1">{c.description}</p>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-obsidian/40">
                  {c.memberCount} {c.memberCount === 1 ? 'follower' : 'followers'}
                </span>
                <button
                  type="button"
                  disabled={!user || busy === c.id}
                  onClick={() => toggle(c)}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-40 ${
                    c.joined ? 'border border-obsidian/15 text-obsidian/60' : 'btn-brand'
                  }`}
                >
                  {busy === c.id ? '…' : c.joined ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
