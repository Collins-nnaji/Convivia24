'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import type { CalendarInvitee } from '@/lib/calendar/buffers';

function formatRange(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const day = start.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const time = `${start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  return `${day}, ${time}`;
}

export default function InviteResponseCard({
  token,
  initial,
}: {
  token: string;
  initial: { invitee: CalendarInvitee; task: { title: string; starts_at: string; ends_at: string; location: string | null } };
}) {
  const [invitee, setInvitee] = useState(initial.invitee);
  const [responding, setResponding] = useState(false);
  const { task } = initial;

  async function respond(status: 'accepted' | 'declined') {
    setResponding(true);
    try {
      const res = await fetch(`/api/invite/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        setInvitee(data.invitee);
      }
    } finally {
      setResponding(false);
    }
  }

  return (
    <section className="zen-ribbon-bg min-h-[80vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gold-dark mb-4">You&apos;re invited, {invitee.name}</p>
        <h1 className="font-display text-4xl italic text-obsidian mb-3">{task.title}</h1>
        <p className="text-obsidian/60 text-sm mb-1">{formatRange(task.starts_at, task.ends_at)}</p>
        {task.location && <p className="text-obsidian/45 text-sm mb-6">{task.location}</p>}

        {invitee.status === 'invited' ? (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => respond('accepted')}
              disabled={responding}
              className="flex items-center gap-2 px-6 py-3 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.15em] transition-colors disabled:opacity-50"
            >
              <Check size={14} /> Accept
            </button>
            <button
              onClick={() => respond('declined')}
              disabled={responding}
              className="flex items-center gap-2 px-6 py-3 border border-obsidian/15 hover:border-obsidian/30 text-obsidian/60 text-[11px] font-black uppercase tracking-[0.15em] transition-colors disabled:opacity-50"
            >
              <X size={14} /> Decline
            </button>
          </div>
        ) : (
          <p className="font-display text-xl italic text-obsidian/70 mt-8">
            {invitee.status === 'accepted' ? "You're in. See you there." : "Noted — you're sitting this one out."}
          </p>
        )}
      </div>
    </section>
  );
}
