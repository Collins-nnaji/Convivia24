'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { AuthView } from '@neondatabase/auth/react/ui';
import { NeonAuthProvider } from '@/components/auth/NeonAuthProvider';
import { BrandLogo } from '@/components/BrandLogo';

function safeRedirectPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/';
  return next;
}

function SignInForm() {
  const searchParams = useSearchParams();
  const redirectTo = safeRedirectPath(searchParams.get('next'));

  return (
    <main className="mobile-scroll-screen mobile-safe-screen bg-[#f8f6f2] text-neutral-900 flex items-center justify-center relative max-w-[100vw]">
      <div className="fixed inset-0 z-0 select-none pointer-events-none">
        <img
          src="/Homepage.png"
          alt=""
          className="w-full h-full object-cover opacity-[0.12] grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8f6f2] via-[#f8f6f2]/95 to-white/88" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4 sm:px-6 py-6">
        <div className="text-center mb-6">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 px-2"
            aria-label="Back to Convivia24"
          >
            <BrandLogo className="h-8 w-auto mx-auto mb-4 object-contain" alt="Convivia24" />
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl italic text-neutral-900 mb-2 px-1">
            Welcome back
          </h1>
          <p className="text-neutral-500 text-sm max-w-sm mx-auto">
            Sign in to plan events, guests, and invites.
          </p>
        </div>

        <div className="neon-auth-ui-scope bg-white/95 backdrop-blur-xl border border-neutral-200 rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.08)]">
          <NeonAuthProvider>
            <AuthView view="SIGN_IN" redirectTo={redirectTo} />
          </NeonAuthProvider>
        </div>

        <p className="text-center mt-6 text-sm text-neutral-600">
          New to Convivia24?{' '}
          <Link href="/auth/sign-up" className="text-red-700 font-semibold hover:underline underline-offset-4">
            Create an account
          </Link>
        </p>

        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 border border-neutral-200 rounded-xl text-neutral-600 text-[11px] font-bold uppercase tracking-widest hover:border-red-300 hover:text-red-800 transition-colors bg-white/80"
          >
            Back to Convivia24
          </Link>
          <Link
            href="/inquire"
            className="px-5 py-2.5 border border-red-200 rounded-xl text-red-800 text-[11px] font-bold uppercase tracking-widest hover:border-red-400 hover:bg-red-50 transition-colors bg-white/80"
          >
            Contact
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <main className="mobile-scroll-screen mobile-safe-screen bg-[#f8f6f2] flex items-center justify-center">
          <p className="text-neutral-500 text-sm">Loading…</p>
        </main>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
