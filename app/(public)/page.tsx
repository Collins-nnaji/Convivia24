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
    <main className="min-h-[100dvh] bg-white text-neutral-900 flex flex-col font-sans overflow-x-hidden max-w-[100vw]">
      <div className="relative z-10 w-full h-[100dvh] flex flex-col">
        <Suspense fallback={<div className="flex flex-1 items-center justify-center text-neutral-400 text-sm">Loading…</div>}>
          <AppConceptBoard initialUser={dummyUser} />
        </Suspense>
      </div>
    </main>
  );
}
