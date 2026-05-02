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
    <main className="min-h-[100dvh] bg-[#0a0a0a] text-cream flex flex-col font-sans overflow-hidden">
      {/* Subtle ambient glow — no busy photo */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-gold/[0.04] blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-gold/[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 w-full h-[100dvh] flex flex-col">
        <AppConceptBoard initialUser={dummyUser} />
      </div>
    </main>
  );
}
