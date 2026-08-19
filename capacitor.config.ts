import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Convivia24 is a full Next.js SSR app (API routes, proxy.ts middleware,
 * cookie-based auth/age-gate) — it can't be statically exported into the
 * native bundle the way a static site can. Instead this wraps the live
 * deployed site in a native shell (server.url mode): the WebView navigates
 * straight to NEXT_PUBLIC_APP_URL, so every request still runs through the
 * real Next.js server, and native Capacitor plugins (push, share, haptics)
 * are still available on top of it.
 *
 * Set NEXT_PUBLIC_APP_URL to the real production origin before `cap sync` —
 * the placeholder below only satisfies local builds.
 */
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://convivia24.example.com';

const config: CapacitorConfig = {
  appId: 'com.convivia24.app',
  appName: 'Convivia24',
  webDir: 'mobile/www',
  server: {
    url: appUrl,
    cleartext: appUrl.startsWith('http://'),
  },
};

export default config;
