'use client';

import { useState } from 'react';

type Variant = 'footer' | 'convivium';

export default function WaitlistForm({ variant = 'footer' }: { variant?: Variant }) {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          company: company.trim() || undefined,
        }),
      });

      let data: { ok?: boolean; error?: string; message?: string };
      try {
        data = await res.json();
      } catch {
        setError('Invalid response from server. Please try again.');
        return;
      }

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSuccess(true);
      setEmail('');
      setCompany('');
    } catch (err) {
      console.error('Waitlist submit error:', err);
      setError('Unable to connect. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'bg-transparent border-0 border-b border-obsidian/20 focus:border-gold focus:ring-0 text-obsidian text-sm py-2.5 px-0 placeholder-obsidian/30 transition-colors';
  const labelClass = 'text-[9px] font-black uppercase tracking-[0.3em] text-gold-dark block mb-1.5';

  if (success) {
    return (
      <p className="text-obsidian/70 text-sm">
        You&apos;re on the list. We&apos;ll be in touch.
      </p>
    );
  }

  if (variant === 'footer') {
    return (
      <div>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md">
          <div className="flex-1 min-w-0">
            <label htmlFor="waitlist-email" className="sr-only">
              Email
            </label>
            <input
              id="waitlist-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Your email"
              className={`w-full ${inputClass}`}
            />
          </div>
          <div className="flex-1 min-w-0 sm:max-w-[180px]">
            <label htmlFor="waitlist-company" className="sr-only">
              Company (optional)
            </label>
            <input
              id="waitlist-company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company (optional)"
              className={`w-full ${inputClass}`}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 px-5 py-2.5 bg-gold hover:bg-gold-light text-obsidian text-[10px] font-black uppercase tracking-[0.2em] transition-colors disabled:opacity-60"
          >
            {loading ? 'Joining...' : 'Join Waitlist'}
          </button>
        </form>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>
    );
  }

  // Convivium variant — slightly more prominent
  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <div>
        <label htmlFor="waitlist-conv-email" className={labelClass}>
          Email
        </label>
        <input
          id="waitlist-conv-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your@email.com"
          className={`w-full ${inputClass}`}
        />
      </div>
      <div>
        <label htmlFor="waitlist-conv-company" className={labelClass}>
          Company <span className="text-obsidian/40">(optional)</span>
        </label>
        <input
          id="waitlist-conv-company"
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Your company"
          className={`w-full ${inputClass}`}
        />
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gold hover:bg-gold-light text-obsidian text-[10px] font-black uppercase tracking-[0.2em] py-3 transition-colors disabled:opacity-60"
      >
        {loading ? 'Joining...' : 'Join the Waitlist'}
      </button>
    </form>
  );
}
