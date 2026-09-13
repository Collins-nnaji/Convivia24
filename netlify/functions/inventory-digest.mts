import type { Config } from '@netlify/functions';

/**
 * Netlify scheduled function: every morning at 07:00 Lagos time (06:00 UTC), ask the app to
 * send the low-stock digest. The app does the work so this stays a one-liner with no DB access.
 */
export default async function handler() {
  const base = process.env.URL || process.env.NEXT_PUBLIC_APP_URL || 'https://convivia24.com';
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('CRON_SECRET is not set; skipping inventory digest.');
    return;
  }
  const res = await fetch(`${base.replace(/\/$/, '')}/api/cron/inventory-digest`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}` },
  });
  const body = await res.text();
  console.log(`inventory digest → ${res.status}: ${body.slice(0, 300)}`);
}

export const config: Config = { schedule: '0 6 * * *' };
