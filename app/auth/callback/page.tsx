'use client';

import { createAuthClient } from '@neondatabase/auth/next';
import { NeonAuthUIProvider, AuthCallback } from '@neondatabase/auth/react/ui';
import { NEON_AUTH_SOCIAL_GOOGLE } from '@/lib/auth/neon-ui';
import { navigateAfterAuth } from '@/lib/auth/navigate-after-auth';

const authClient = createAuthClient();

export default function CallbackPage() {
  return (
    <main className="mobile-scroll-screen mobile-safe-screen bg-[#f8f6f2] text-neutral-900 flex items-center justify-center">
      <NeonAuthUIProvider
        authClient={authClient}
        navigate={(path: string) => navigateAfterAuth(path)}
        replace={(path: string) => navigateAfterAuth(path)}
        social={NEON_AUTH_SOCIAL_GOOGLE}
      >
        <AuthCallback />
      </NeonAuthUIProvider>
    </main>
  );
}
