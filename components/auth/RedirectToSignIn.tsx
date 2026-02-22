'use client';

import { useEffect } from 'react';
import { useSession } from '@/lib/auth/use-session';

type Props = {
  children?: React.ReactNode;
  /** Where to redirect when not signed in (default: /auth/sign-in) */
  signInUrl?: string;
};

/**
 * When not signed in, redirects to sign-in. When signed in, renders children.
 * Neon quickstart-style RedirectToSignIn.
 */
export function RedirectToSignIn({ children = null, signInUrl = '/auth/sign-in' }: Props) {
  const { user, loading } = useSession();

  useEffect(() => {
    if (loading) return;
    if (!user) window.location.href = signInUrl;
  }, [user, loading, signInUrl]);

  if (loading) return null;
  if (!user) return null;
  return <>{children}</>;
}
