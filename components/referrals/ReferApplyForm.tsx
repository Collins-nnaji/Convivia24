'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Copy } from 'lucide-react';
import { KIND_LABELS, PARTNER_KINDS } from '@/lib/referrals/repo';

type Result = { code: string; status: string; commissionPct: number };

export default function ReferApplyForm() {
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/referrals/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          phone: form.get('phone'),
          company: form.get('company'),
          kind: form.get('kind'),
          code: form.get('code'),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to submit that application.');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit that application.');
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    const link =
      typeof window !== 'undefined' ? `${window.location.origin}/?ref=${result.code}` : `/?ref=${result.code}`;
    return (
      <div className="bg-white border border-obsidian/10 p-6">
        <p className="text-[10px] uppercase tracking-wider text-ember mb-2">You are in</p>
        <h2 className="font-wordmark-sm text-base text-obsidian mb-3">Your code is {result.code}</h2>
        <p className="text-sm text-obsidian/60 leading-relaxed mb-4">
          Share this link. Anyone who orders after clicking it is credited to you for 30 days, and you
          earn {result.commissionPct}% of what they pay.
          {result.status === 'pending' && (
            <> We review new partners before the first payout — we will email you when yours is live.</>
          )}
        </p>

        <div className="flex items-center gap-2 mb-5">
          <code className="flex-1 text-[12px] bg-paper border border-obsidian/10 px-3 py-2 overflow-x-auto whitespace-nowrap">
            {link}
          </code>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(link);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }}
            className="btn-brand text-[11px] px-3 py-2 inline-flex items-center gap-1.5 shrink-0"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <Link href="/refer/portal" className="text-[11px] font-black uppercase tracking-[0.16em] text-ember">
          Open your dashboard →
        </Link>
      </div>
    );
  }

  const inputClass =
    'w-full bg-transparent border-0 border-b border-obsidian/20 focus:border-ember focus:ring-0 text-obsidian text-sm py-2.5 px-0 placeholder-obsidian/25';

  return (
    <form onSubmit={submit} className="bg-white border border-obsidian/10 p-6 space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-obsidian/40">Your name</span>
          <input name="name" required className={inputClass} placeholder="Bella Okafor" />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-obsidian/40">Business name</span>
          <input name="company" className={inputClass} placeholder="Bella Events" />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-obsidian/40">Email</span>
          <input name="email" type="email" required className={inputClass} placeholder="you@example.com" />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-obsidian/40">Phone</span>
          <input name="phone" className={inputClass} placeholder="+234 803 000 0000" />
        </label>
      </div>

      <label className="block">
        <span className="text-[10px] uppercase tracking-wider text-obsidian/40">What do you do?</span>
        <select name="kind" defaultValue="planner" className={`${inputClass} bg-transparent`}>
          {PARTNER_KINDS.map((k) => (
            <option key={k} value={k}>
              {KIND_LABELS[k]}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-[10px] uppercase tracking-wider text-obsidian/40">
          Preferred code (optional)
        </span>
        <input
          name="code"
          className={inputClass}
          placeholder="BELLA24"
          maxLength={16}
          pattern="[A-Za-z0-9 .\-_]*"
        />
        <span className="block mt-1 text-[10px] text-obsidian/35">
          Letters and numbers. We will pick one from your business name if you leave this blank.
        </span>
      </label>

      {error && <p className="text-sm text-ember">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn-brand text-[11px] font-black uppercase tracking-[0.14em] px-6 py-3 disabled:opacity-60"
      >
        {loading ? 'Submitting…' : 'Get my referral code'}
      </button>
    </form>
  );
}
