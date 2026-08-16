'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type RsvpData = {
  event: {
    host_name: string;
    event_type: string;
    event_date: string | null;
    event_time: string | null;
    venue: string | null;
    city: string | null;
    dress_code: string | null;
    capacity: number;
  };
  guest: {
    name: string;
    rsvp_state: string;
    party_size: number;
    pass_token: string;
  };
};

export default function RsvpPage() {
  const params = useParams();
  const token = typeof params.token === 'string' ? params.token : '';
  const [data, setData] = useState<RsvpData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<'in' | 'maybe' | 'out'>('in');
  const [partySize, setPartySize] = useState(1);
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid invite link.');
      setLoading(false);
      return;
    }
    fetch(`/api/party/rsvp/${token}`)
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || 'Invite not found');
        setData(body);
        if (body.guest?.rsvp_state && body.guest.rsvp_state !== 'pending') {
          setDone(true);
          setState(body.guest.rsvp_state);
        }
        setPartySize(body.guest?.party_size || 1);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load invite'))
      .finally(() => setLoading(false));
  }, [token]);

  async function submit() {
    setSubmitting(true);
    const res = await fetch(`/api/party/rsvp/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state, party_size: partySize, message: message || null }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || 'Could not save RSVP');
      return;
    }
    setDone(true);
  }

  if (loading) {
    return <div className="min-h-[50vh] bg-paper flex items-center justify-center text-sm text-obsidian/40">Loading invite…</div>;
  }

  if (error || !data) {
    return (
      <div className="min-h-[50vh] bg-paper flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <p className="text-ember mb-4">{error || 'Invite not found'}</p>
          <Link href="/plan" className="text-sm text-obsidian/50 underline">
            Plan a party
          </Link>
        </div>
      </div>
    );
  }

  const { event, guest } = data;

  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="max-w-lg mx-auto px-5 py-14 sm:py-20">
        <div className="bg-white p-8 sm:p-10 shadow-[0_18px_50px_-22px_rgba(10,10,10,0.4)]">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-ember mb-3">
            {event.event_type} · Lagos
          </p>
          <h1 className="font-logo font-black uppercase tracking-tight text-3xl text-obsidian mb-2">
            {event.host_name}
          </h1>
          <p className="text-sm text-obsidian/50 mb-6">
            Hi {guest.name}
            {event.event_date ? ` · ${event.event_date}` : ''}
            {event.event_time ? ` · ${event.event_time}` : ''}
            {event.venue ? ` · ${event.venue}` : ''}
            {event.dress_code ? ` · ${event.dress_code}` : ''}
          </p>

          {done ? (
            <div>
              <p className="text-lg font-semibold text-obsidian mb-2">
                {state === 'in' ? "You're in." : state === 'maybe' ? 'Maybe noted.' : "Sorry you'll miss it."}
              </p>
              <p className="text-sm text-obsidian/50 mb-6">Your host can see this on their party board.</p>
              <Link href="/shop" className="inline-block px-5 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em]">
                Order drinks for the night
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex gap-2">
                {(['in', 'maybe', 'out'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setState(s)}
                    className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.12em] ${
                      state === s ? 'badge-brand' : 'border border-obsidian/15'
                    }`}
                  >
                    {s === 'in' ? 'Going' : s === 'maybe' ? 'Maybe' : 'Can’t'}
                  </button>
                ))}
              </div>
              <label className="block text-sm">
                Party size
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={partySize}
                  onChange={(e) => setPartySize(Number(e.target.value || 1))}
                  className="mt-1 w-full border-b border-obsidian/15 focus:border-ember focus:ring-0"
                />
              </label>
              <label className="block text-sm">
                Note (optional)
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 w-full border-b border-obsidian/15 focus:border-ember focus:ring-0"
                  placeholder="Allergies, song, arrival time…"
                />
              </label>
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="w-full py-3.5 btn-brand text-[11px] font-black uppercase tracking-[0.14em]"
              >
                {submitting ? 'Saving…' : 'Send RSVP'}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
