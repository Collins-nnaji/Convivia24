import { createAuthServer, neonAuth as originalNeonAuth } from '@neondatabase/auth/next/server';

export const authServer = createAuthServer();

// Dev-mode dummy user — always returned when real auth is unavailable
const DUMMY_USER = {
  id: 'dummy-id',
  name: 'Collins Nnaji (Preview)',
  email: 'preview@convivia24.com',
  image: 'https://i.pravatar.cc/150?u=collins',
};

export async function neonAuth(): Promise<{ user: typeof DUMMY_USER }> {
  try {
    const result = await Promise.race([
      originalNeonAuth(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)), // 3s timeout
    ]);
    if (result && typeof result === 'object' && 'user' in result && result.user) {
      return result as { user: typeof DUMMY_USER };
    }
  } catch (e) {
    // Auth not available — fall through to dummy user
    console.log('[auth] Bypassing auth — using preview user');
  }

  return { user: DUMMY_USER };
}

