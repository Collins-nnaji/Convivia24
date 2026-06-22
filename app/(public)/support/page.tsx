'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ChevronDown, LifeBuoy, HeartHandshake } from 'lucide-react';
import { useUser } from '@/components/auth/AuthProvider';
import CheckInTrend from '@/components/calendar/CheckInTrend';
import ReflectionPrompt from '@/components/calendar/ReflectionPrompt';
import SupporterDirectory from '@/components/support/SupporterDirectory';
import { RESOURCES } from '@/lib/support/safety';
import { SUPPORT_TAGS, supportTagLabel } from '@/lib/support/tags';
import type { SupporterProfile, SupportSession } from '@/lib/support/repo';

function formatWhen(startsAtIso: string) {
  return new Date(startsAtIso).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function SessionRow({ session, asSupporter }: { session: SupportSession; asSupporter: boolean }) {
  const who = asSupporter ? session.seeker_name : (session.supporter_name ?? 'Your supporter');
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-obsidian/10 bg-white">
      <div className="min-w-0">
        <p className="text-sm text-obsidian"><span className="font-semibold">{who}</span> · {formatWhen(session.starts_at)}</p>
        {session.status === 'confirmed' && session.call_link && (
          <a href={session.call_link} target="_blank" rel="noopener noreferrer" className="text-xs text-gold-dark hover:underline">Join call link</a>
        )}
        {session.status === 'requested' && asSupporter && (
          <Link href={`/support-invite/${session.response_token}`} className="text-xs text-gold-dark hover:underline">Respond to this request</Link>
        )}
      </div>
      <span className={`shrink-0 text-[10px] font-black uppercase tracking-[0.1em] ${
        session.status === 'confirmed' ? 'text-emerald-600' : session.status === 'declined' ? 'text-obsidian/35' : 'text-gold-dark'
      }`}>
        {session.status}
      </span>
    </div>
  );
}

export default function SupportPage() {
  const { user, loading: authLoading } = useUser();
  const [profile, setProfile] = useState<SupporterProfile | null>(null);
  const [sessions, setSessions] = useState<{ asSeeker: SupportSession[]; asSupporter: SupportSession[] } | null>(null);
  const [open, setOpen] = useState(false);
  const [bio, setBio] = useState('');
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const refreshSessions = useCallback(() => {
    fetch('/api/support/sessions')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setSessions(d ?? { asSeeker: [], asSupporter: [] }))
      .catch(() => setSessions({ asSeeker: [], asSupporter: [] }));
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch('/api/support/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const p: SupporterProfile | null = d?.profile ?? null;
        if (p) {
          setProfile(p);
          setBio(p.bio ?? '');
          setTags(new Set(p.tags));
          setIsActive(p.is_active);
        }
      })
      .catch(() => {});
    refreshSessions();
  }, [user, refreshSessions]);

  function toggleTag(value: string) {
    setTags((set) => {
      const next = new Set(set);
      if (next.has(value)) next.delete(value); else next.add(value);
      return next;
    });
  }

  async function saveSupporterProfile(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch('/api/support/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, tags: Array.from(tags), is_active: isActive }),
      });
      const data = await res.json();
      if (!res.ok) { setSaveError(data.error || 'Could not save.'); return; }
      setProfile(data.profile);
    } finally {
      setSaving(false);
    }
  }

  if (!authLoading && !user) {
    return (
      <section className="zen-ribbon-bg min-h-[70vh] flex items-center justify-center px-6 text-center">
        <div>
          <p className="font-display text-3xl italic text-obsidian mb-4">Sign in for Companion Support.</p>
          <Link href="/signin?next=/support" className="btn-brand inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em]">
            Sign in
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-cream-base min-h-dvh md:min-h-[calc(100dvh-4rem)] pb-16 md:pb-0">
      <div className="max-w-3xl mx-auto w-full px-5 sm:px-8 py-8 space-y-10">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-light italic text-obsidian tracking-tight">Companion Support</h1>
          <p className="text-obsidian/45 text-sm mt-2 max-w-lg">
            A caring listener, not a professional — mood check-ins, your companion chat, and real people who&apos;ll make time to talk.
          </p>
        </div>

        <ReflectionPrompt />

        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.15em] text-obsidian/40 mb-3">Your last two weeks</h2>
          <CheckInTrend />
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <LifeBuoy size={15} className="text-rose-600 shrink-0" />
            <p className="text-sm font-semibold text-rose-800">Get help now</p>
          </div>
          <p className="text-sm text-rose-700/90">{RESOURCES.headline} {RESOURCES.body}</p>
          <a href={RESOURCES.linkHref} target="_blank" rel="noopener noreferrer" className="inline-block text-[11px] font-black uppercase tracking-[0.12em] text-rose-700 hover:text-rose-900 underline">
            {RESOURCES.linkLabel}
          </a>
        </div>

        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.15em] text-obsidian/40 mb-3">Talk to someone</h2>
          <SupporterDirectory onBooked={refreshSessions} />
        </div>

        {sessions && (sessions.asSeeker.length > 0 || sessions.asSupporter.length > 0) && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.15em] text-obsidian/40 mb-3">My sessions</h2>
            <div className="space-y-2">
              {sessions.asSeeker.map((s) => <SessionRow key={s.id} session={s} asSupporter={false} />)}
              {sessions.asSupporter.map((s) => <SessionRow key={s.id} session={s} asSupporter />)}
            </div>
          </div>
        )}

        <div className="border border-obsidian/10 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-white hover:bg-paper transition-colors"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-obsidian">
              <HeartHandshake size={15} className="text-gold-dark" />
              {profile ? 'Edit your supporter profile' : 'Offer a listening ear'}
            </span>
            <ChevronDown size={16} className={`text-obsidian/40 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <form onSubmit={saveSupporterProfile} className="px-4 py-4 bg-paper border-t border-obsidian/10 space-y-3">
              <p className="text-xs text-obsidian/50">
                Any signed-in user can offer to listen — no credentials required. You&apos;re a caring peer, not a therapist; please make that clear if asked.
              </p>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={300}
                rows={3}
                placeholder="A short bio — who you are and how you can help (max 300 characters)"
                className="w-full px-3 py-2 rounded-lg border border-obsidian/15 bg-white text-sm resize-none focus:border-gold outline-none transition-colors"
              />
              <div className="flex flex-wrap gap-1.5">
                {SUPPORT_TAGS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => toggleTag(t.value)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide transition-colors ${
                      tags.has(t.value) ? 'bg-gold text-obsidian' : 'bg-obsidian/5 text-obsidian/50 hover:bg-obsidian/10'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm text-obsidian/70">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-gold" />
                Visible in the directory right now
              </label>
              {saveError && <p className="text-rose-600 text-xs">{saveError}</p>}
              <button type="submit" disabled={saving} className="btn-brand px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] disabled:opacity-50">
                {saving ? 'Saving…' : profile ? 'Save changes' : 'Become a supporter'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
