import { createNeonAuth } from '@neondatabase/auth/next/server';

const baseUrl = process.env.NEON_AUTH_BASE_URL;
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET;

/**
 * False when Neon Auth env vars aren't set (e.g. a local/preview environment without
 * secrets). `createNeonAuth` is still constructed with safe placeholders below so the
 * app doesn't crash at import time — callers should check this and degrade gracefully.
 */
export const authConfigured = Boolean(baseUrl && cookieSecret && cookieSecret.length >= 32);

export const auth = createNeonAuth({
  baseUrl: baseUrl || 'https://neon-auth-not-configured.invalid',
  cookies: {
    secret: cookieSecret && cookieSecret.length >= 32 ? cookieSecret : '0'.repeat(32),
  },
});
