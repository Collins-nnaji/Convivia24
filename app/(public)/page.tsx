import { AppConceptBoard } from '@/components/app/AppConceptBoard';

export const dynamic = 'force-dynamic';

export default async function AppRootPage() {
  // Temporary: Dummy user to bypass auth blocker for development
  // avatar_url intentionally omitted — ProfileTab fetches fresh data from /api/profile
  const dummyUser = {
    id: 'dummy-id',
    name: 'Collins Nnaji (Preview)',
    email: 'preview@convivia24.com',
    tier: 'black',
    location: 'Lagos',
    created_at: new Date().toISOString(),
  };

  return (
    <main className="min-h-[100dvh] bg-white flex flex-col font-sans overflow-hidden">
      {/* Subtle warm tint for depth */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-gold/[0.06] blur-[140px]" />
        <div className="absolute bottom-1/3 right-0 w-[350px] h-[350px] rounded-full bg-gold/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 w-full h-[100dvh] flex flex-col">
        <AppConceptBoard initialUser={dummyUser} />
      </div>
    </main>
  );
}
