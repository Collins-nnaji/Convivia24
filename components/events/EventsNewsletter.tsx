'use client';

import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Mail } from 'lucide-react';

/**
 * Newsletter sign-up for the events page. Posts to the same waitlist store the
 * footer form uses, tagged with its own source so the list can tell where a
 * subscriber came from.
 */
export default function EventsNewsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'events' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not sign you up.');
        return;
      }
      setDone(true);
    } catch {
      setError('Could not sign you up.');
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="brand-gradient text-white p-6 sm:p-8 grid lg:grid-cols-2 gap-6 items-center">
      <div className="flex items-start gap-4">
        <span className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
          <Mail size={20} />
        </span>
        <div>
          <h2 className="font-logo font-black uppercase tracking-tight text-xl">Never miss an experience</h2>
          <p className="text-sm text-white/60 mt-1.5 leading-relaxed">
            Updates on upcoming nights, early tickets, and invites to tastings.
          </p>
        </div>
      </div>

      {done ? (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 text-sm font-medium lg:justify-self-end"
        >
          <Check size={16} /> You&apos;re on the list — watch your inbox.
        </motion.p>
      ) : (
        <form onSubmit={submit} className="lg:justify-self-end w-full max-w-md">
          <div className="flex">
            <label className="sr-only" htmlFor="events-newsletter-email">
              Email address
            </label>
            <input
              id="events-newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 min-w-0 px-4 py-3 text-sm text-obsidian bg-white border-0 focus:ring-0"
            />
            <button
              type="submit"
              disabled={sending}
              className="px-6 py-3 bg-white/10 border-l border-white/15 text-white text-[11px] font-black uppercase tracking-[0.12em] hover:bg-white/15 disabled:opacity-50 shrink-0 transition-colors"
            >
              {sending ? 'Adding…' : 'Subscribe'}
            </button>
          </div>
          {error && <p className="text-sm text-white/80 mt-2">{error}</p>}
          <p className="text-[11px] text-white/40 mt-2">Adults 18+. Unsubscribe any time.</p>
        </form>
      )}
    </section>
  );
}
