'use client';

import { useSession } from '@/lib/auth/use-session';

type Props = { children: React.ReactNode };

/**
 * Renders children only when the user is signed in (Neon quickstart-style).
 */
export function SignedIn({ children }: Props) {
  const { user, loading } = useSession();
  if (loading) return null;
  if (!user) return null;
  return <>{children}</>;
}
