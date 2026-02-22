'use client';

import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth/client';

export type SessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
};

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    authClient
      .getSession({ fetchOptions: { credentials: 'include' } } as any)
      .then((res: any) => {
        if (!mounted) return;
        const u = res?.data?.user ?? res?.data?.session?.user ?? res?.user ?? null;
        setUser(u ?? null);
      })
      .catch(() => {
        if (mounted) setUser(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return { user, loading };
}
