'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';
import EventThemeShell from '@/components/event/EventThemeShell';
import IntentBadgePicker from '@/components/lounge/IntentBadgePicker';
import GuestGrid from '@/components/lounge/GuestGrid';
import { useUser } from '@/components/auth/AuthProvider';

interface LoungeData {
  guests: { id: string; user_id: string; display_name: string; headline: string | null; avatar_url: string | null; intent_badge: string | null }[];
  profile: { display_name: string; headline: string | null; intent_badge: string | null; is_public: boolean } | null;
  event: { title: string; slug: string };
}

export default function LoungePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user } = useUser();
  const [data, setData] = useState<LoungeData | null>(null);
  const [eventMeta, setEventMeta] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState('');
  const [headline, setHeadline] = useState('');
  const [intent, setIntent] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    fetch(`/api/events/${slug}/lounge`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); return; }
        setData(d);
        setHeadline(d.profile?.headline ?? '');
        setIntent(d.profile?.intent_badge ?? null);
      });
    fetch(`/api/events/${slug}`).then((r) => r.json()).then((d) => setEventMeta(d.event));
  }

  useEffect(() => { load(); }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveProfile() {
    setSaving(true);
    try {
      await fetch(`/api/events/${slug}/lounge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline, intent_badge: intent }),
      });
      load();
    } finally {
      setSaving(false);
    }
  }

  async function connect(userId: string) {
    await fetch(`/api/events/${slug}/lounge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to_user_id: userId }),
    });
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-center px-6">
        <div>
          <p className="font-display text-2xl italic mb-3">{error}</p>
          {!user && <Link href={`/signin?next=/events/${slug}/lounge`} className="text-gold-dark text-sm uppercase tracking-wider">Sign in</Link>}
          {user && <Link href={`/events/${slug}`} className="text-gold-dark text-sm uppercase tracking-wider">← Back to event</Link>}
        </div>
      </div>
    );
  }

  if (!data || !eventMeta) {
    return <div className="min-h-screen flex items-center justify-center opacity-40 text-sm uppercase tracking-widest">Loading lounge…</div>;
  }

  return (
    <EventThemeShell event={eventMeta}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 -mt-8">
        <Link href={`/events/${slug}`} className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] opacity-60 hover:opacity-100 mb-6">
          <ArrowLeft size={12} /> {data.event.title}
        </Link>

        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--event-accent,#c9a84c)] mb-2 flex items-center gap-2">
            <Users size={14} /> Digital lounge
          </p>
          <h1 className="font-display text-4xl sm:text-5xl italic leading-tight">Meet who&apos;s in the room.</h1>
          <p className="opacity-55 mt-3 max-w-xl text-sm">Opt into the directory, set your intent badge, and resonate with fellow guests before you arrive.</p>
        </div>

        <div className="glass-card p-6 mb-10 space-y-5">
          <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="One-line headline — e.g. Product designer @ startup" className="w-full bg-transparent border-b border-current/20 py-2 text-sm outline-none placeholder:opacity-40" />
          <IntentBadgePicker value={intent} onChange={setIntent} />
          <button type="button" onClick={saveProfile} disabled={saving} className="text-[11px] font-black uppercase tracking-[0.2em] px-5 py-2.5 bg-[var(--event-accent,#c9a84c)] text-obsidian disabled:opacity-50">
            {saving ? 'Saving…' : 'Update my lounge profile'}
          </button>
        </div>

        <GuestGrid guests={data.guests} currentUserId={user?.id ?? ''} onConnect={connect} />
      </div>
    </EventThemeShell>
  );
}
