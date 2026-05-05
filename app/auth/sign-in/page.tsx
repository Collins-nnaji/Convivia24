'use client';

import Link from 'next/link';

export default function SignInPage() {
  return (
    <main className="min-h-[100dvh] bg-white text-neutral-900 flex items-center justify-center relative overflow-x-hidden max-w-[100vw]">
      {/* Background — subtle hero texture only */}
      <div className="fixed inset-0 z-0 select-none pointer-events-none">
        <img
          src="/Homepage.png"
          alt=""
          className="w-full h-full object-cover opacity-[0.12] grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-white/85" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4 sm:px-6">
        {/* Logo */}
        <div className="text-center mb-8 sm:mb-10 pt-[env(safe-area-inset-top)]">
          <Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 px-2" aria-label="Go to Now">
            <img
              src="/convivia24.png"
              alt="Convivia24"
              className="h-8 w-auto mx-auto mb-4 sm:mb-6"
            />
          </Link>
          <h1 className="font-display text-3xl sm:text-5xl italic text-neutral-900 mb-3 px-1">
            Start Your 24.
          </h1>
          <p className="text-neutral-500 text-sm max-w-sm mx-auto">
            The free preview is open while member authentication is being connected.
          </p>
        </div>

        {/* Placeholder Sign In Card */}
        <div className="bg-white/90 backdrop-blur-xl border border-neutral-200 rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.08)] text-center">
          <h2 className="text-xl font-display italic mb-6 text-neutral-900">Free Preview</h2>
          <Link
            href="/"
            className="block w-full py-4 bg-red-700 text-white rounded-2xl font-bold hover:bg-red-800 transition-all"
          >
            Open Your 24
          </Link>
          <p className="mt-6 text-[10px] text-neutral-400 uppercase tracking-[0.2em]">
            Check-ins, squads, profile, and Move activities are available to test.
          </p>
        </div>

        {/* Explore links */}
        <div className="mt-8 flex flex-wrap gap-3 justify-center px-1">
          <Link
            href="/"
            className="px-5 py-2.5 border border-neutral-200 rounded-xl text-neutral-600 text-[11px] font-bold uppercase tracking-widest hover:border-red-300 hover:text-red-800 transition-colors"
          >
            Explore the App
          </Link>
          <Link
            href="/inquire"
            className="px-5 py-2.5 border border-red-200 rounded-xl text-red-800 text-[11px] font-bold uppercase tracking-widest hover:border-red-400 hover:bg-red-50 transition-colors"
          >
            Contact
          </Link>
        </div>
      </div>
    </main>
  );
}
