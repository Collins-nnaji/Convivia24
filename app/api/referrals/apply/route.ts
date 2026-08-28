import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { apiErrorResponse } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';
import { createPartner, validatePartner } from '@/lib/referrals/repo';

/** Public — an event planner, venue or caterer applying to refer business. */
export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(`referrals:apply:${clientIp(req)}`, 5, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const input = {
      name: typeof body.name === 'string' ? body.name : '',
      email: typeof body.email === 'string' ? body.email : '',
      phone: typeof body.phone === 'string' ? body.phone : null,
      company: typeof body.company === 'string' ? body.company : null,
      kind: typeof body.kind === 'string' ? body.kind : 'planner',
      code: typeof body.code === 'string' ? body.code : null,
    };

    const invalid = validatePartner(input);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

    const user = await getCurrentUser();
    const partner = await createPartner(input, user?.id || null);

    return NextResponse.json(
      {
        ok: true,
        code: partner.code,
        status: partner.status,
        commissionPct: partner.commissionPct,
      },
      { status: 201 }
    );
  } catch (err) {
    captureApiError(err, { route: 'referrals/apply POST' });
    const { status, error } = apiErrorResponse(err, 'Unable to submit that application.');
    return NextResponse.json({ error }, { status });
  }
}
