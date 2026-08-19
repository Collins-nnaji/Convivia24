'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AgeCheckInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function confirm() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/age-gate', { method: 'POST' });
      if (!res.ok) throw new Error();
      router.replace(next);
      router.refresh();
    } catch {
      setError('Could not verify right now. Please try again.');
      setLoading(false);
    }
  }

  function decline() {
    window.location.href = 'https://www.google.com';
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-obsidian px-5 py-10">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 shadow-2xl">
        <img src="/convivia24.png" alt="Convivia24" className="h-10 w-auto rounded-sm mb-6" />
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-ember mb-3">Lagos delivery · 18+</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-obsidian leading-tight mb-3">
          Are you of legal drinking age?
        </h1>
        <p className="text-sm text-obsidian/55 leading-relaxed mb-8">
          We deliver alcohol and mixers to parties, clubs, and lounges. You must be 18 or older to enter.
          By continuing you agree to our{' '}
          <a href="/terms" className="text-ember underline underline-offset-2">
            Terms
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-ember underline underline-offset-2">
            Privacy Policy
          </a>
          .
        </p>
        {error && <p className="text-sm text-ember mb-4">{error}</p>}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={confirm}
            disabled={loading}
            className="flex-1 px-5 py-3.5 btn-brand text-[11px] font-black uppercase tracking-[0.15em] disabled:opacity-60"
          >
            {loading ? '…' : 'Yes — enter'}
          </button>
          <button
            type="button"
            onClick={decline}
            disabled={loading}
            className="flex-1 px-5 py-3.5 border border-obsidian/15 text-obsidian/60 hover:text-obsidian text-[11px] font-black uppercase tracking-[0.15em]"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AgeCheckPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-obsidian" />}>
      <AgeCheckInner />
    </Suspense>
  );
}
