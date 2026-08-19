import { NextRequest, NextResponse } from 'next/server';
import { requireSignedInOutlet, convertPartnerPerk } from '@/lib/partners/outlets';
import { apiErrorResponse } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

/** Convert Premium points into a real gift card. Requires a real sign-in. */
export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(`partner-perks:${clientIp(req)}`, 10, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const outlet = await requireSignedInOutlet();
    if ('error' in outlet) return NextResponse.json({ error: outlet.error }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const conversionId = String(body.conversionId || '');
    const result = await convertPartnerPerk(outlet, conversionId);
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });

    return NextResponse.json(result);
  } catch (err) {
    captureApiError(err, { route: 'partners/perks POST' });
    const { status, error } = apiErrorResponse(err, 'Could not convert that perk.');
    return NextResponse.json({ error }, { status });
  }
}
