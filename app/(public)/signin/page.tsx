'use client';

import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, CalendarHeart, Wind, MessageCircle } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '@/lib/auth/client';
import { useUser } from '@/components/auth/AuthProvider';

const PERKS = [
  { icon: CalendarHeart, text: 'My 24 — your whole day as one calm, scrollable ribbon.' },
  { icon: Wind, text: 'Rest buffers auto-inserted between back-to-back plans.' },
  { icon: MessageCircle, text: 'A Companion that remembers what matters to you.' },
];

function SignInInner() {
  const params = useSearchParams();
  const { user, authConfigured, refresh } = useUser();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(params.get('error') ? 'Sign-in was cancelled or failed. Please try again.' : '');

  const next = params.get('next') || '/';
  const busy = googleLoading || formLoading;

  // Already signed in → bounce to destination.
  useEffect(() => {
    if (user) window.location.href = next;
  }, [user, next]);

  async function google() {
    setGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start Google sign-in.');
      setGoogleLoading(false);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      if (mode === 'signup') {
        await signUpWithEmail(name, email, password);
      } else {
        await signInWithEmail(email, password);
      }
      await refresh();
      window.location.href = next;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
      setFormLoading(false);
    }
  }

  return (
    <section className="bg-paper min-h-screen py-16 sm:py-24">
      <div className="max-w-md mx-auto px-5 sm:px-8">
        <SectionLabel>Welcome</SectionLabel>
        <h1 className="font-display text-4xl sm:text-5xl font-light italic text-obsidian tracking-tight mb-3">
          {mode === 'signup' ? 'Create your account.' : 'Sign in to Convivia24.'}
        </h1>
        <p className="text-obsidian/55 mb-8 leading-relaxed">One account for My 24 and your Companion — synced everywhere you sign in.</p>

        <div className="bg-white border border-obsidian/12 shadow-sm p-6 sm:p-8">
          {!authConfigured && (
            <p className="mb-5 text-amber-700 text-xs bg-amber-50 border border-amber-200 p-3">
              Authentication isn&apos;t configured on this environment yet. Set <span className="font-mono">NEON_AUTH_BASE_URL</span> and{' '}
              <span className="font-mono">NEON_AUTH_COOKIE_SECRET</span>, and enable Google in the Neon Auth dashboard.
            </p>
          )}

          <button
            onClick={google}
            disabled={busy || !authConfigured}
            className="w-full inline-flex items-center justify-center gap-3 bg-white border border-obsidian/20 hover:border-gold hover:bg-paper text-obsidian text-sm font-semibold py-3.5 transition-colors disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
            </svg>
            {googleLoading ? 'Redirecting…' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3 my-6">
            <span className="h-px flex-1 bg-obsidian/10" />
            <span className="text-obsidian/35 text-[11px] uppercase tracking-wider">or</span>
            <span className="h-px flex-1 bg-obsidian/10" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === 'signup' && (
              <input
                type="text"
                required
                placeholder="Full name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-obsidian/15 px-4 py-3 text-sm text-obsidian placeholder:text-obsidian/35 focus:outline-none focus:border-gold"
              />
            )}
            <input
              type="email"
              required
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-obsidian/15 px-4 py-3 text-sm text-obsidian placeholder:text-obsidian/35 focus:outline-none focus:border-gold"
            />
            <input
              type="password"
              required
              minLength={8}
              placeholder="Password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-obsidian/15 px-4 py-3 text-sm text-obsidian placeholder:text-obsidian/35 focus:outline-none focus:border-gold"
            />
            <button
              type="submit"
              disabled={busy || !authConfigured}
              className="w-full bg-obsidian hover:bg-obsidian/90 text-paper text-sm font-semibold py-3.5 transition-colors disabled:opacity-50"
            >
              {formLoading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
          </form>

          {error && <p className="text-red-500 text-xs mt-4">{error}</p>}

          <p className="text-center text-obsidian/55 text-xs mt-5">
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => { setMode((m) => (m === 'signup' ? 'signin' : 'signup')); setError(''); }}
              className="text-gold-dark hover:text-gold font-semibold"
            >
              {mode === 'signup' ? 'Sign in' : 'Create one'}
            </button>
          </p>

          <p className="flex items-center justify-center gap-1.5 text-obsidian/40 text-[10px] uppercase tracking-wider mt-5">
            <ShieldCheck size={12} className="text-gold-dark" /> Secured by Neon Auth
          </p>
        </div>

        <ul className="mt-8 space-y-3">
          {PERKS.map((p) => (
            <li key={p.text} className="flex items-start gap-3 text-obsidian/60 text-sm">
              <p.icon size={16} className="text-gold-dark mt-0.5 shrink-0" /> {p.text}
            </li>
          ))}
        </ul>

        <p className="text-obsidian/40 text-xs mt-8 text-center">
          By continuing you agree to Convivia24&apos;s terms. <Link href="/" className="text-gold-dark hover:text-gold">Back home</Link>
        </p>
      </div>
    </section>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="bg-paper min-h-screen" />}>
      <SignInInner />
    </Suspense>
  );
}
