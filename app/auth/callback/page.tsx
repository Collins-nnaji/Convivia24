'use client';

import { createAuthClient } from '@neondatabase/auth/next';
import { NeonAuthUIProvider, AuthCallback } from '@neondatabase/auth/react/ui';
import { useRouter } from 'next/navigation';

const authClient = createAuthClient();

export default function CallbackPage() {
  const router = useRouter();

  return (
    <main className="min-h-[100dvh] bg-obsidian text-cream flex items-center justify-center">
      <NeonAuthUIProvider
        authClient={authClient}
        navigate={(path: string) => router.push(path)}
        replace={(path: string) => router.replace(path)}
      >
        <AuthCallback />
      </NeonAuthUIProvider>
    </main>
  );
}
