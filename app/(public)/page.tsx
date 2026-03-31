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
    <main className="min-h-[100dvh] bg-obsidian text-cream flex flex-col font-sans overflow-hidden">
      {/* Global Background Layer */}
      <div className="fixed inset-0 z-0 select-none pointer-events-none">
        <img
          src="/Homepage.png"
          alt=""
          className="w-full h-full object-cover opacity-40 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/80 via-transparent to-obsidian/60" />
      </div>

      <div className="relative z-10 w-full h-[100dvh] flex flex-col bg-transparent">
        <AppConceptBoard
          initialUser={dummyUser}
        />
      </div>
    </main>
  );
}
