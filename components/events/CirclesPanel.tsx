'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, MessageCircle } from 'lucide-react';
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
      <div className="mb-8 max-w-xl">
        <h2 className="font-bold text-2xl text-gray-900 mb-2 flex items-center gap-2">
          <MessageCircle size={22} className="text-ember" />
          Circles
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Community rooms for Lagos nights — follow the crowds that match your vibe.
          Discuss plans, share event links, and coordinate.
        </p>
      </div>

      {!authLoading && !user && (
        <div className="bg-white rounded-xl p-5 mb-6 flex items-center justify-between gap-4 flex-wrap border border-gray-100">
          <p className="text-sm text-gray-500">Sign in to follow circles and join discussions.</p>
          <Link
            href={`/signin?next=${encodeURIComponent('/party-planner')}`}
            className="px-5 py-2.5 btn-brand text-sm font-medium rounded-lg"
          >
            Sign in
          </Link>
        </div>
      )}
      {error && <p className="text-sm text-rose-500 mb-6">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-400">Loading circles...</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {circles.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl p-5 flex flex-col border-2 border-ember/25 hover:border-ember transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-full bg-ember/10 flex items-center justify-center text-sm font-bold text-ember">
                  {c.name[0]}
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-ember uppercase tracking-wider">{c.vibeTag}</span>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{c.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{c.description}</p>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Users size={12} />
                  {c.memberCount} {c.memberCount === 1 ? 'member' : 'members'}
                </span>
                <button
                  type="button"
                  disabled={!user || busy === c.id}
                  onClick={() => toggle(c)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition disabled:opacity-40 ${
                    c.joined
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'btn-brand'
                  }`}
                >
                  {busy === c.id ? '...' : c.joined ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
