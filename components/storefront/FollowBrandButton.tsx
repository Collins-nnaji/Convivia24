'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Check, Plus } from 'lucide-react';

/**
 * Follow / unfollow a brand from anywhere (home brand strip, lists). State loads after
 * hydration so the home page itself stays cacheable.
 */
export default function FollowBrandButton({ slug, name }: { slug: string; name: string }) {
  const [following, setFollowing] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/brands/follow?brand=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d) return;
        setSignedIn(Boolean(d.signedIn));
        setFollowing(Boolean(d.following));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const cls =
    'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors disabled:opacity-50';

  if (signedIn === false) {
    return (
      <Link href={`/signin?next=${encodeURIComponent(`/brands/${slug}`)}`} className={`${cls} border-obsidian/15 text-obsidian/60 hover:border-ember hover:text-ember`}>
        <Plus size={12} /> Follow
      </Link>
    );
  }

  async function toggle() {
    setBusy(true);
    const prev = following;
    setFollowing(!prev);
    try {
      const res = await fetch('/api/brands/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand: slug }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) setFollowing(Boolean(d.following));
      else setFollowing(prev);
    } catch {
      setFollowing(prev);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy || signedIn === null}
      aria-pressed={following}
      aria-label={following ? `Unfollow ${name}` : `Follow ${name}`}
      className={`${cls} ${following ? 'border-ember bg-ember text-white' : 'border-obsidian/15 text-obsidian/60 hover:border-ember hover:text-ember'}`}
    >
      {following ? <Check size={12} /> : <Plus size={12} />} {following ? 'Following' : 'Follow'}
    </button>
  );
}
