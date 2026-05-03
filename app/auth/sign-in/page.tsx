'use client';

import Link from 'next/link';

export default function SignInPage() {
  return (
    <main className="min-h-[100dvh] bg-obsidian text-cream flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 select-none pointer-events-none">
        <img
          src="/Homepage.png"
          alt=""
          className="w-full h-full object-cover opacity-20 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/90 to-obsidian/70" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/">
            <img
              src="/convivia24.png"
              alt="Convivia24"
              className="h-8 w-auto mx-auto mb-6"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </Link>
          <h1 className="font-display text-4xl sm:text-5xl italic text-cream mb-3">
            Come to the Table.
          </h1>
          <p className="text-cream/50 text-sm max-w-sm mx-auto">
            (Preview Mode: Authentication is temporarily bypassed)
          </p>
        </div>

        {/* Placeholder Sign In Card */}
        <div className="bg-obsidian-100/60 backdrop-blur-xl border border-cream/10 rounded-[32px] p-10 shadow-2xl text-center">
          <h2 className="text-xl font-display italic mb-6">Authentication</h2>
          <Link
            href="/"
            className="block w-full py-4 bg-cream text-obsidian rounded-2xl font-bold hover:bg-white transition-all"
          >
            Enter Dashboard (Bypass)
          </Link>
          <p className="mt-6 text-[10px] text-cream/30 uppercase tracking-[0.2em]">
            Real authentication will be enabled after layout refinement.
          </p>
        </div>

        {/* Explore links */}
        <div className="mt-8 flex gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 border border-cream/15 rounded-xl text-cream/50 text-[11px] font-bold uppercase tracking-widest hover:border-cream/30 hover:text-cream transition-colors"
          >
            Explore the App
          </Link>
        </div>
      </div>
    </main>
  );
}
