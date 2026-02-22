import { createNeonAuth } from '@neondatabase/auth/next/server';

export function getAuth() {
  return createNeonAuth({
    baseUrl: process.env.NEON_AUTH_BASE_URL!,
    cookies: {
      secret: process.env.NEON_AUTH_COOKIE_SECRET!,
    },
  });
}

// Normalize Neon's { data, error } so session?.user works everywhere (dashboard, API routes)
async function getSessionNormalized() {
  const { data } = await getAuth().getSession();
  const user = data?.user ?? (data as any)?.session?.user;
  if (!user) return null;
  return { ...data, user } as { user: { id: string; email?: string | null; name?: string | null; image?: string | null }; [k: string]: unknown };
}

// Convenience alias — call getAuth() in request handlers, not at module level
export const auth = {
  getSession: getSessionNormalized,
  handler: () => getAuth().handler(),
  middleware: (config?: { loginUrl?: string }) => getAuth().middleware(config),
};
