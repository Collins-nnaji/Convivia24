'use client';

import { useEffect, useState } from 'react';
import { AGE_GATE_COOKIE, AGE_GATE_MAX_AGE_DAYS, ageGateCookieValue } from '@/lib/age-gate';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, days: number) {
  const maxAge = days * 24 * 60 * 60;
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

type GateState = 'checking' | 'open' | 'verified';

export default function AgeGate() {
  const [state, setState] = useState<GateState>('checking');

  useEffect(() => {
    const verified = readCookie(AGE_GATE_COOKIE);
    setState(verified ? 'verified' : 'open');
  }, []);

  useEffect(() => {
    if (state !== 'open') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [state]);

  function confirm() {
    writeCookie(AGE_GATE_COOKIE, ageGateCookieValue(), AGE_GATE_MAX_AGE_DAYS);
    setState('verified');
  }

  function decline() {
    window.location.href = 'https://www.google.com';
  }

  if (state === 'verified') return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      aria-busy={state === 'checking'}
    >
      {state === 'checking' ? (
        <img src="/convivia24.png" alt="Convivia24" className="h-10 w-auto rounded-sm" />
      ) : (
        <div className="w-full max-w-md bg-white p-8 sm:p-10 shadow-2xl">
          <img src="/convivia24.png" alt="Convivia24" className="h-10 w-auto rounded-sm mb-6" />
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-ember mb-3">Lagos delivery · 18+</p>
          <h2 id="age-gate-title" className="text-2xl sm:text-3xl font-bold text-obsidian leading-tight mb-3">
            Are you of legal drinking age?
          </h2>
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
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={confirm}
              className="flex-1 px-5 py-3.5 btn-brand text-[11px] font-black uppercase tracking-[0.15em]"
            >
              Yes — enter
            </button>
            <button
              type="button"
              onClick={decline}
              className="flex-1 px-5 py-3.5 border border-obsidian/15 text-obsidian/60 hover:text-obsidian text-[11px] font-black uppercase tracking-[0.15em]"
            >
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
