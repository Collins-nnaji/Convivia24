'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/components/auth/AuthProvider';
import { useCart } from '@/components/cart/CartProvider';
import { formatNgn, searchDrinks, type DrinkProduct } from '@/lib/drinks/catalog';

type Crew = { id: string; name: string; inviteCode: string; status: 'open' | 'checked_out' | 'closed' };
type Member = { userId: string; name: string; joinedAt: string };
type Item = { slug: string; name: string; unitPriceNgn: number; qty: number; addedBy: string };

function CrewDetailInner() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('code') || '';
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const { addProduct } = useCart();

  const [crew, setCrew] = useState<Crew | null>(null);
  const [joined, setJoined] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [members, setMembers] = useState<Member[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    const res = await fetch(`/api/crews/${id}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || 'Crew not found.');
      setLoading(false);
      return;
    }
    setCrew(data.crew);
    setJoined(Boolean(data.joined));
    if (data.joined) {
      setMembers(data.members || []);
      setItems(data.items || []);
    } else {
      setMemberCount(data.memberCount || 0);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (authLoading) return;
    load();
  }, [authLoading, load]);

  async function join() {
    setJoining(true);
    setError('');
    const res = await fetch(`/api/crews/${id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteCode }),
    });
    const data = await res.json().catch(() => ({}));
    setJoining(false);
    if (!res.ok) {
      setError(data.error || 'Could not join this crew.');
      return;
    }
    await load();
  }

  async function addItem(product: DrinkProduct) {
    const res = await fetch(`/api/crews/${id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: product.slug, qty: 1 }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setItems(data.items || []);
  }

  async function removeItem(slug: string) {
    const res = await fetch(`/api/crews/${id}/items?slug=${encodeURIComponent(slug)}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setItems(data.items || []);
  }

  function checkoutForCrew() {
    for (const item of items) addProduct(item.slug, item.qty);
    router.push(`/checkout?crewId=${id}`);
  }

  const total = useMemo(() => items.reduce((n, i) => n + i.unitPriceNgn * i.qty, 0), [items]);
  const splitCount = Math.max(1, members.length);
  const perPerson = Math.ceil(total / splitCount);
  const results = query.trim().length >= 2 ? searchDrinks(query).slice(0, 6) : [];
  const inviteUrl = crew ? `${typeof window !== 'undefined' ? window.location.origin : ''}/crews/${crew.id}?code=${crew.inviteCode}` : '';

  if (authLoading || loading) {
    return (
      <section className="bg-paper min-h-[60vh] px-5 py-16">
        <p className="text-sm text-obsidian/45 max-w-3xl mx-auto">Loading…</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="bg-paper min-h-[60vh] px-5 py-16">
        <div className="max-w-md mx-auto bg-white p-8 shadow-sm">
          <p className="text-sm text-obsidian/60 mb-4">Sign in to view this crew.</p>
          <Link href={`/signin?next=/crews/${id}${inviteCode ? `?code=${inviteCode}` : ''}`} className="inline-block px-5 py-2.5 btn-brand text-[11px] font-black uppercase tracking-[0.14em]">
            Sign in
          </Link>
        </div>
      </section>
    );
  }

  if (error && !crew) {
    return (
      <section className="bg-paper min-h-[60vh] px-5 py-16">
        <p className="text-sm text-ember max-w-3xl mx-auto">{error}</p>
      </section>
    );
  }

  if (crew && !joined) {
    return (
      <section className="bg-paper min-h-[60vh] px-5 py-16">
        <div className="max-w-md mx-auto bg-white p-8 shadow-sm text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-ember mb-2">Party Crew</p>
          <h1 className="text-2xl font-bold mb-2">{crew.name}</h1>
          <p className="text-sm text-obsidian/50 mb-6">
            {memberCount} {memberCount === 1 ? 'person has' : 'people have'} joined so far.
          </p>
          {error && <p className="text-sm text-ember mb-4">{error}</p>}
          {inviteCode ? (
            <button
              type="button"
              onClick={join}
              disabled={joining}
              className="w-full py-3.5 btn-brand text-[11px] font-black uppercase tracking-[0.15em] disabled:opacity-60"
            >
              {joining ? 'Joining…' : 'Join this crew'}
            </button>
          ) : (
            <p className="text-sm text-obsidian/45">You need an invite link to join this crew.</p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-ember mb-2">Party Crew</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{crew?.name}</h1>
        <p className="text-sm text-obsidian/50 mb-2">
          {members.length} {members.length === 1 ? 'member' : 'members'} · {members.map((m) => m.name).join(', ')}
        </p>
        {crew?.status === 'open' ? (
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(inviteUrl).catch(() => {});
            }}
            className="text-[11px] font-black uppercase tracking-[0.12em] text-ember mb-8"
          >
            Copy invite link →
          </button>
        ) : (
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/40 mb-8">
            This crew has already checked out.
          </p>
        )}

        {error && <p className="text-sm text-ember mb-6">{error}</p>}

        {crew?.status === 'open' && (
          <div className="bg-white p-5 sm:p-6 shadow-sm mb-6 relative">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-2">
              Add a drink
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the shop…"
              className="w-full border-0 border-b border-obsidian/20 focus:border-ember focus:ring-0 text-sm py-2"
            />
            {results.length > 0 && (
              <ul className="mt-3 divide-y divide-obsidian/6 border border-obsidian/8">
                {results.map((p) => (
                  <li key={p.slug} className="flex items-center justify-between gap-3 p-3">
                    <span className="text-sm">
                      {p.name} <span className="text-obsidian/40">· {formatNgn(p.priceNgn)}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        addItem(p);
                        setQuery('');
                      }}
                      className="text-[10px] font-black uppercase tracking-[0.1em] text-ember"
                    >
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="bg-white shadow-sm">
          <ul className="divide-y divide-obsidian/6">
            {items.map((item) => (
              <li key={item.slug} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{item.name} × {item.qty}</p>
                  <p className="text-[11px] text-obsidian/40">Added by {item.addedBy}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm">{formatNgn(item.unitPriceNgn * item.qty)}</span>
                  {crew?.status === 'open' && (
                    <button type="button" onClick={() => removeItem(item.slug)} className="text-obsidian/30 hover:text-ember text-lg leading-none">
                      ×
                    </button>
                  )}
                </div>
              </li>
            ))}
            {items.length === 0 && <li className="p-4 text-sm text-obsidian/45">No drinks added yet.</li>}
          </ul>
          <div className="p-4 sm:p-5 border-t border-obsidian/10 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-obsidian/45">Total · {formatNgn(total)}</p>
              <p className="text-[11px] text-obsidian/45">≈ {formatNgn(perPerson)} per person ({splitCount})</p>
            </div>
            {crew?.status === 'open' && (
              <button
                type="button"
                disabled={items.length === 0}
                onClick={checkoutForCrew}
                className="px-6 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-40"
              >
                Checkout for the crew
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CrewDetailPage() {
  return (
    <Suspense fallback={<section className="bg-paper min-h-[60vh]" />}>
      <CrewDetailInner />
    </Suspense>
  );
}
