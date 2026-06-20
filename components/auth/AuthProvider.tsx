'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authClient, signOut as doSignOut, type SessionUser } from '@/lib/auth/client';

interface AuthCtx {
  user: SessionUser | null;
  loading: boolean;
  authConfigured: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  authConfigured: true,
  refresh: async () => {},
  signOut: async () => {},
});

export const useUser = () => useContext(Ctx);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isPending, refetch } = authClient.useSession();
  const [authConfigured, setAuthConfigured] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { authConfigured: false }))
      .then((body) => setAuthConfigured(Boolean(body?.authConfigured)))
      .catch(() => setAuthConfigured(false));
  }, []);

  const user: SessionUser | null = data?.user
    ? { id: data.user.id, email: data.user.email, name: data.user.name ?? null, image: data.user.image ?? null }
    : null;

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const signOut = useCallback(async () => {
    await doSignOut();
    await refetch();
  }, [refetch]);

  return (
    <Ctx.Provider value={{ user, loading: isPending, authConfigured, refresh, signOut }}>
      {children}
    </Ctx.Provider>
  );
}
