'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { fetchMe, signOut as doSignOut, type SessionUser } from '@/lib/auth/client';

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
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authConfigured, setAuthConfigured] = useState(true);

  const refresh = useCallback(async () => {
    const { user, authConfigured } = await fetchMe();
    setUser(user);
    setAuthConfigured(authConfigured);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const signOut = useCallback(async () => {
    await doSignOut();
    setUser(null);
  }, []);

  return (
    <Ctx.Provider value={{ user, loading, authConfigured, refresh, signOut }}>
      {children}
    </Ctx.Provider>
  );
}
