'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { createAuthClient } from '@neondatabase/auth/next';
import { NeonAuthUIProvider, AuthView } from '@neondatabase/auth/react/ui';
import { NEON_AUTH_SOCIAL_GOOGLE } from '@/lib/auth/neon-ui';
import { BrandLogo } from '@/components/BrandLogo';
import { navigateAfterAuth, resolveAuthNextPath } from '@/lib/auth/navigate-after-auth';

const authClient = createAuthClient();

function SignUpForm() {
  const searchParams = useSearchParams();
  const nextPath = resolveAuthNextPath(searchParams, '/');

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
            aria-label="Back to home"
          >
            <BrandLogo className="h-8 w-auto mx-auto mb-4 object-contain" alt="Convivia24" />
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl italic text-neutral-900 mb-2 px-1">
            Start your portal
          </h1>
          <p className="text-neutral-500 text-sm max-w-sm mx-auto">
            Create your Convivia24 account.
          </p>
        </div>

        <div className="neon-auth-ui-scope bg-white/95 backdrop-blur-xl border border-neutral-200 rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.08)] [&_button_svg]:h-[18px] [&_button_svg]:w-[18px] [&_button_svg]:shrink-0 [&_button_img]:h-[18px] [&_button_img]:w-[18px] [&_button_img]:object-contain">
          <NeonAuthUIProvider
            authClient={authClient}
            navigate={(path: string) => navigateAfterAuth(path)}
            replace={(path: string) => navigateAfterAuth(path)}
            social={NEON_AUTH_SOCIAL_GOOGLE}
          >
            <AuthView view="SIGN_UP" redirectTo={nextPath} />
          </NeonAuthUIProvider>
        </div>

        <p className="text-center mt-6 text-sm text-neutral-600">
          Already have an account?{' '}
          <Link
            href={`/auth/sign-in?next=${encodeURIComponent(nextPath)}`}
            className="text-red-700 font-semibold hover:underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<main className="min-h-[100dvh] bg-[#f8f6f2] flex items-center justify-center text-neutral-400">Loading…</main>}>
      <SignUpForm />
    </Suspense>
  );
}
