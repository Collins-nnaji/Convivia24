import { createAuthServer, neonAuth as originalNeonAuth } from '@neondatabase/auth/next/server';

export const authServer = createAuthServer();

/** Set `AUTH_PREVIEW_DUMMY=1` in .env for local UI preview without a Neon session (APIs still use this user). */
const DUMMY_USER = {
  id: 'dummy-id',
  name: 'Collins Nnaji (Preview)',
  email: 'preview@convivia24.com',
  image: 'https://i.pravatar.cc/150?u=collins',
};

export type AuthSessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export async function neonAuth(): Promise<{ user: AuthSessionUser | null }> {
  const previewDummy = process.env.AUTH_PREVIEW_DUMMY === '1';

  try {
    const result = await originalNeonAuth();
    if (result && typeof result === 'object' && 'user' in result && result.user) {
      return { user: result.user as AuthSessionUser };
    }
  } catch (e) {
    console.warn('[neonAuth]', e);
  }

  if (previewDummy) {
    return { user: DUMMY_USER };
  }

  return { user: null };
}

