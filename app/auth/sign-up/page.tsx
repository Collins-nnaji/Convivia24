'use client';

import { authClient } from '@/lib/auth/client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

function SignUpForm() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite') ?? '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Gate state
  const [gateChecking, setGateChecking] = useState(true);
  const [inviteValid, setInviteValid] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Validate invite token on mount
  useEffect(() => {
    if (!inviteToken) {
      setGateChecking(false);
      return;
    }
    fetch(`/api/auth/invite/validate?token=${encodeURIComponent(inviteToken)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setInviteValid(true);
          // Pre-fill email if the invite was tied to one
          if (data.email) setEmail(data.email);
        }
      })
      .catch(() => {})
      .finally(() => setGateChecking(false));
  }, [inviteToken]);

  // Redirect if already signed in (admins go to /admin, everyone else to /dashboard)
  useEffect(() => {
    let mounted = true;
    async function checkSession() {
      try {
        const res = await authClient.getSession({
          fetchOptions: { credentials: 'include' },
        } as any);
        const user = (res as any)?.data?.user || (res as any)?.user;
        if (user) {
          const me = await fetch('/api/me', { credentials: 'include' }).then((r) => r.ok ? r.json() : null).catch(() => null);
          window.location.replace(me?.role === 'admin' ? '/admin' : '/dashboard');
          return;
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setCheckingSession(false);
      }
    }
    checkSession();
    return () => { mounted = false; };
  }, []);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const callbackURL = inviteToken
        ? `/auth/callback?invite=${encodeURIComponent(inviteToken)}`
        : '/auth/callback';
      const res = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL,
        fetchOptions: { credentials: 'include' },
      });
      const err = (res as any)?.error || (res as any)?.data?.error;
      if (err) {
        setError(err.message || 'Sign up failed.');
        return;
      }
      const redirectUrl = (res as any)?.data?.url || (res as any)?.url || '/dashboard';
      window.location.replace(redirectUrl);
    } catch (err: any) {
      setError(err?.message || 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setError('');
    try {
      const callbackURL = inviteToken
        ? `/auth/callback?invite=${encodeURIComponent(inviteToken)}`
        : '/auth/callback';
      await authClient.signIn.social({
        provider: 'google',
        callbackURL,
        fetchOptions: { credentials: 'include' },
      });
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed.');
      setGoogleLoading(false);
    }
  }

  // ── Shared chrome ──────────────────────────────────────────────────────────
  const chrome = (children: React.ReactNode) => (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img
            src="/convivia24.png"
            alt="Convivia24"
            className="h-8 w-auto mx-auto mb-3"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
            Pipeline Suite
          </p>
        </div>
        {children}
        <p className="mt-6 text-center text-[10px] text-zinc-700 uppercase tracking-[0.2em]">
          Revenue Doesn&apos;t Sleep.
        </p>
      </div>
    </div>
  );

  // Loading states
  if (gateChecking || checkingSession) {
    return chrome(
      <div className="bg-zinc-900 border border-zinc-800 p-8">
        <p className="text-xs text-zinc-500">Checking…</p>
      </div>
    );
  }

  // No valid invite → gate screen
  if (!inviteValid) {
    return chrome(
      <div className="bg-zinc-900 border border-zinc-800 p-8">
        <span className="inline-block bg-red-700 text-white text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 mb-4">
          Invite Only
        </span>
        <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic mb-4">
          Sign Up
        </h1>
        <p className="text-zinc-400 text-sm leading-relaxed mb-6">
          Account creation is by invitation only. If you&apos;ve been invited, use the link provided.
          Otherwise, get in touch and we&apos;ll reach out with next steps.
        </p>
        <Link
          href="/briefing"
          className="block w-full bg-red-700 hover:bg-red-800 text-white text-sm font-black uppercase tracking-[0.15em] px-5 py-3 text-center transition-colors"
        >
          Request Access
        </Link>
        <p className="mt-5 text-center text-[11px] text-zinc-600">
          Already have an account?{' '}
          <Link href="/auth/sign-in" className="text-red-500 hover:text-red-400 transition-colors">
            Sign in →
          </Link>
        </p>
      </div>
    );
  }

  // Valid invite → show sign-up form
  return chrome(
    <div className="bg-zinc-900 border border-zinc-800 p-8">
      <span className="inline-block bg-red-700 text-white text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 mb-4">
        Create Account
      </span>
      <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic mb-6">
        Sign Up
      </h1>

      {/* Google */}
      <button
        onClick={handleGoogle}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 text-zinc-900 text-sm font-black uppercase tracking-[0.1em] px-5 py-3 transition-colors disabled:opacity-60 mb-5"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {googleLoading ? 'Redirecting…' : 'Continue with Google'}
      </button>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-[10px] text-zinc-600 uppercase tracking-widest">or</span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      {/* Email / Password */}
      <form onSubmit={handleEmail} className="space-y-3">
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-4 py-3 placeholder-zinc-500 focus:outline-none focus:border-red-700 transition-colors"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-4 py-3 placeholder-zinc-500 focus:outline-none focus:border-red-700 transition-colors"
        />
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-4 py-3 pr-11 placeholder-zinc-500 focus:outline-none focus:border-red-700 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-700 hover:bg-red-800 text-white text-sm font-black uppercase tracking-[0.15em] px-5 py-3 transition-colors disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="mt-5 text-center text-[11px] text-zinc-600">
        Already have an account?{' '}
        <Link href="/auth/sign-in" className="text-red-500 hover:text-red-400 transition-colors">
          Sign in →
        </Link>
      </p>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
