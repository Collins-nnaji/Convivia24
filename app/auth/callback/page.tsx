'use client';

import { createAuthClient } from '@neondatabase/auth/next';
import { NeonAuthUIProvider, AuthCallback } from '@neondatabase/auth/react/ui';
import { useRouter } from 'next/navigation';
import { NEON_AUTH_SOCIAL_GOOGLE } from '@/lib/auth/neon-ui';

const authClient = createAuthClient();

export default function CallbackPage() {
  const router = useRouter();

  return (
    <main className="mobile-scroll-screen mobile-safe-screen bg-obsidian text-cream flex items-center justify-center">
      <NeonAuthUIProvider
        authClient={authClient}
        navigate={(path: string) => router.push(path)}
        replace={(path: string) => router.replace(path)}
        social={NEON_AUTH_SOCIAL_GOOGLE}
      >
        <AuthCallback />
      </NeonAuthUIProvider>
    </main>
  );
}
