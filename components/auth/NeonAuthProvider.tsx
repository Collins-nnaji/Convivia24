'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { NeonAuthUIProvider } from '@neondatabase/auth/react/ui';
import { authClient } from '@/lib/auth/client';

/**
 * Neon Auth UI shell — Google and other providers are configured in the Neon dashboard,
 * not passed as a separate client-side social config.
 */
export function NeonAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <NeonAuthUIProvider
      authClient={authClient}
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
