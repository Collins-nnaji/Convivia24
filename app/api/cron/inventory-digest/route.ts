import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { sendInventoryDigest } from '@/lib/email/inventory-digest';
import { captureApiError } from '@/lib/sentry';

/**
 * Daily low-stock digest to the desk. Called by the Netlify scheduled function with the shared
 * CRON_SECRET; anything else gets a 401. Safe to hit twice — it just sends twice.
 */
function authorised(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET || '';
  const given = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || new URL(req.url).searchParams.get('key') || '';
  if (!secret || !given) return false;
  const a = Buffer.from(secret);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!authorised(req)) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  try {
    const result = await sendInventoryDigest();
    return NextResponse.json(result, { status: result.sent ? 200 : 502 });
  } catch (err) {
    captureApiError(err, { route: 'cron/inventory-digest' });
    return NextResponse.json({ error: 'Digest failed.' }, { status: 500 });
  }
}

export const GET = POST;
