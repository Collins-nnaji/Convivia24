'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { NeonAuthUIProvider } from '@neondatabase/auth/react/ui';
import { authClient } from '@/lib/auth/client';
import { NEON_AUTH_SOCIAL_GOOGLE } from '@/lib/auth/neon-ui';

/**
 * Neon Auth UI — Google is enabled in the Neon dashboard; `social` tells AuthView which buttons to render.
 */
export function NeonAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      social={NEON_AUTH_SOCIAL_GOOGLE}
      navigate={(path: string) => {
        if (path === '/' || path.startsWith('/?')) {
          window.location.href = path;
          return;
        }
        router.push(path);
      }}
      replace={(path: string) => {
        if (path === '/' || path.startsWith('/?')) {
          window.location.replace(path);
          return;
        }
        router.replace(path);
      }}
    >
      {children}
    </NeonAuthUIProvider>
  );
}
