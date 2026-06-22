'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import type { SupportSession } from '@/lib/support/repo';

function formatWhen(startsAtIso: string, durationMins: number) {
  const start = new Date(startsAtIso);
  const end = new Date(start.getTime() + durationMins * 60000);
  const day = start.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const time = `${start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  return `${day}, ${time}`;
}

export default function SupportSessionResponseCard({
  token,
  initial,
}: {
  token: string;
  initial: SupportSession;
}) {
  const [session, setSession] = useState(initial);
  const [callLink, setCallLink] = useState('');
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function respond(status: 'confirmed' | 'declined') {
    setResponding(true);
    setError(null);
    try {
      const res = await fetch(`/api/support/sessions/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, call_link: callLink }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Could not save your response.'); return; }
      setSession(data.session);
    } finally {
      setResponding(false);
    }
  }

  return (
    <section className="zen-ribbon-bg min-h-[80vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gold-dark mb-4">Booking request from {session.seeker_name}</p>
        <h1 className="font-display text-4xl italic text-obsidian mb-3">A listening session</h1>
        <p className="text-obsidian/60 text-sm mb-1">{formatWhen(session.starts_at, session.duration_mins)}</p>
        {session.note && <p className="text-obsidian/45 text-sm mt-3 italic">&ldquo;{session.note}&rdquo;</p>}

        {session.status === 'requested' ? (
          <div className="mt-8 space-y-4">
            <input
              value={callLink}
              onChange={(e) => setCallLink(e.target.value)}
              placeholder="Paste your call link (Zoom, Meet, etc.)"
              className="w-full px-4 py-3 rounded-full border border-obsidian/15 bg-white text-sm text-center focus:border-gold outline-none transition-colors"
            />
            {error && <p className="text-rose-600 text-xs">{error}</p>}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => respond('confirmed')}
                disabled={responding}
                className="flex items-center gap-2 px-6 py-3 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.15em] transition-colors disabled:opacity-50"
              >
                <Check size={14} /> Confirm
              </button>
              <button
                onClick={() => respond('declined')}
                disabled={responding}
                className="flex items-center gap-2 px-6 py-3 border border-obsidian/15 hover:border-obsidian/30 text-obsidian/60 text-[11px] font-black uppercase tracking-[0.15em] transition-colors disabled:opacity-50"
              >
                <X size={14} /> Decline
              </button>
            </div>
          </div>
        ) : (
          <p className="font-display text-xl italic text-obsidian/70 mt-8">
            {session.status === 'confirmed' ? "You're confirmed. The call link is shared with them too." : "Noted — you're sitting this one out."}
          </p>
        )}
      </div>
    </section>
  );
}
