import { Suspense } from 'react';
import { AppConceptBoard } from '@/components/app/AppConceptBoard';

export const dynamic = 'force-dynamic';

export default async function AppRootPage() {
  // Temporary: Dummy user to bypass auth blocker for development
  const dummyUser = {
    id: 'dummy-id',
    name: 'Collins Nnaji (Preview)',
    email: 'preview@convivia24.com',
    avatar_url: 'https://i.pravatar.cc/150?u=collins',
    tier: 'black',
    location: 'Lagos',
    created_at: new Date().toISOString(),
  };

  return (
    <main className="relative min-h-[100dvh] text-neutral-900 flex flex-col font-sans overflow-x-hidden max-w-[100vw] bg-[#f8f6f2]">
      {/* Atmosphere: photo + warm wash — content stays on clear surfaces inside the app */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none" aria-hidden>
        <img
          src="/Homepage.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.18] scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8f6f2] via-[#f8f6f2]/92 to-cream/50" />
        <div className="absolute inset-0 bg-gradient-to-tr from-white/75 via-transparent to-gold/[0.07]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f0ebe3]/80 via-transparent to-transparent" />
      </div>
      <div className="relative z-10 w-full h-[100dvh] flex flex-col">
        <Suspense fallback={<div className="flex flex-1 items-center justify-center text-neutral-400 text-sm">Loading…</div>}>
          <AppConceptBoard initialUser={dummyUser} />
        </Suspense>
      </div>
    </main>
  );
}
