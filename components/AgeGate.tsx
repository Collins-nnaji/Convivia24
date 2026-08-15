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

  // Block first paint until cookie is known (checking) and while gate is open
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-obsidian p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      aria-busy={state === 'checking'}
    >
      {state === 'checking' ? (
        <p className="text-cream/40 text-[10px] font-black uppercase tracking-[0.3em]">Convivia24</p>
      ) : (
        <div className="w-full max-w-md bg-obsidian border border-gold/25 p-8 sm:p-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/70 mb-4">
            Lagos delivery · 18+
          </p>
          <h2
            id="age-gate-title"
            className="font-display text-3xl sm:text-4xl italic text-cream leading-tight mb-4"
          >
            Are you of legal drinking age?
          </h2>
          <p className="text-sm text-cream/55 leading-relaxed mb-8">
            Convivia is a house of drinks experts — spirit and zero-proof ritual kits. You must be 18 or older
            to enter. Zero-proof is still part of our craft — we ask everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={confirm}
              className="flex-1 px-5 py-3.5 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.15em] transition-colors"
            >
              Yes — enter
            </button>
            <button
              type="button"
              onClick={decline}
              className="flex-1 px-5 py-3.5 border border-cream/20 text-cream/70 hover:text-cream hover:border-cream/40 text-[11px] font-black uppercase tracking-[0.15em] transition-colors"
            >
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
