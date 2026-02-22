'use client';

import { authClient } from '@/lib/auth/client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    async function checkSession() {
      try {
        const res = await authClient.getSession({
          fetchOptions: { credentials: 'include' },
        } as any);
        const user = (res as any)?.data?.user || (res as any)?.user;
        if (user) {
          setHasSession(true);
          window.location.href = '/dashboard';
          return;
        }
        setDebugInfo(`getSession: ${JSON.stringify(res)}`);
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
      const res = await authClient.signIn.email({
        email,
        password,
        callbackURL: '/auth/callback',
        fetchOptions: { credentials: 'include' },
      });
      setDebugInfo(`signIn.email: ${JSON.stringify(res)}`);
      const err = (res as any)?.error || (res as any)?.data?.error;
      const hasUser = !!(res as any)?.data?.user || (res as any)?.user || (res as any)?.data?.session || (res as any)?.session;
      if (err) {
        setError(err.message || 'Sign in failed.');
        setLoading(false);
        return;
      }
      // Success: go to callback so it can redirect to dashboard/admin (full page navigation so cookies are sent)
      if (hasUser) {
        window.location.replace('/auth/callback');
        return;
      }
      // No error and no user in response – still try callback (session may be in cookie)
      window.location.replace('/auth/callback');
      return;
    } catch (err: any) {
      setError(err?.message || 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setError('');
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/auth/callback',
        fetchOptions: { credentials: 'include' },
      });
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed.');
      setGoogleLoading(false);
    }
  }

  async function handleCheckSession() {
    try {
      const res = await authClient.getSession({
        fetchOptions: { credentials: 'include' },
      } as any);
      const user = (res as any)?.data?.user || (res as any)?.user;
      setHasSession(!!user);
      setDebugInfo(`getSession (manual): ${JSON.stringify(res)}`);
    } catch (err: any) {
      setDebugInfo(`getSession (manual) error: ${err?.message || 'unknown error'}`);
    }
  }

  async function handleCheckServerSession() {
    try {
      const res = await fetch('/api/auth/debug', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await res.json();
      setDebugInfo(`serverSession: ${JSON.stringify(data)}`);
    } catch (err: any) {
      setDebugInfo(`serverSession error: ${err?.message || 'unknown error'}`);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
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

        <div className="bg-zinc-900 border border-zinc-800 p-8">
          <span className="inline-block bg-red-700 text-white text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 mb-4">
            Client Access
          </span>
          <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic mb-6">
            Sign In
          </h1>
          {checkingSession && (
            <p className="text-xs text-zinc-500 mb-4">Checking session…</p>
          )}
          {hasSession && (
            <p className="text-xs text-green-400 mb-4">Session detected. Use the buttons below to continue.</p>
          )}
          {!!debugInfo && (
            <div className="mb-4 border border-zinc-800 bg-zinc-950/60 p-3 text-[10px] text-zinc-400 whitespace-pre-wrap">
              {debugInfo}
            </div>
          )}

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
            {error && (
              <p className="text-red-400 text-xs">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-700 hover:bg-red-800 text-white text-sm font-black uppercase tracking-[0.15em] px-5 py-3 transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCheckSession}
                className="w-full border border-zinc-800 text-zinc-300 text-[10px] uppercase tracking-[0.2em] py-2 hover:border-zinc-600 transition-colors"
              >
                Check Session
              </button>
              <button
                type="button"
                onClick={() => window.location.assign('/dashboard')}
                className="w-full border border-zinc-800 text-zinc-300 text-[10px] uppercase tracking-[0.2em] py-2 hover:border-zinc-600 transition-colors"
              >
                Go Dashboard
              </button>
            </div>
            <button
              type="button"
              onClick={handleCheckServerSession}
              className="mt-2 w-full border border-zinc-800 text-zinc-300 text-[10px] uppercase tracking-[0.2em] py-2 hover:border-zinc-600 transition-colors"
            >
              Check Server Session
            </button>
          </form>

          <p className="mt-5 text-center text-[11px] text-zinc-600">
            No account?{' '}
            <Link href="/auth/sign-up" className="text-red-500 hover:text-red-400 transition-colors">
              Sign up →
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-[10px] text-zinc-700 uppercase tracking-[0.2em]">
          Revenue Doesn&apos;t Sleep.
        </p>
      </div>
    </div>
  );
}
