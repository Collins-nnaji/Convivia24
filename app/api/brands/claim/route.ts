import { NextRequest, NextResponse } from 'next/server';
import { getBrand } from '@/lib/brands/catalog';
import { BrandAlreadyManagedError, createClaim, resolveBrandOwner } from '@/lib/brands/store';
import { apiErrorResponse, DatabaseUnavailableError } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * A brand asking to take over managing its page.
 *
 * This records the request only. Convivia24 verifies the person works for the
 * house before any claim is approved — nothing here grants access on its own.
 */
export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(`brand-claim:${clientIp(req)}`, 5, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const brand = getBrand(String(body.brand || ''));
    if (!brand) return NextResponse.json({ error: 'Unknown brand.' }, { status: 400 });

    const contactName = String(body.contactName || '').trim().slice(0, 120);
    const email = String(body.email || '').trim().slice(0, 160);
    if (!contactName) return NextResponse.json({ error: 'Your name is required.' }, { status: 400 });
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'A valid work email is required.' }, { status: 400 });
    }

    const ownerId = await resolveBrandOwner().catch(() => null);
    const claim = await createClaim({
      brandSlug: brand.slug,
      contactName,
      email,
      phone: String(body.phone || '').trim().slice(0, 40) || null,
      role: String(body.role || '').trim().slice(0, 120) || null,
      website: String(body.website || '').trim().slice(0, 200) || null,
      message: String(body.message || '').trim().slice(0, 1200) || null,
      ownerId,
    });

    return NextResponse.json({ claim: { id: claim.id, status: claim.status } }, { status: 201 });
  } catch (err) {
    if (err instanceof BrandAlreadyManagedError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'Claims are paused right now. Try again shortly.' }, { status: 503 });
    }
    captureApiError(err, { route: 'brands/claim POST' });
    const { status, error } = apiErrorResponse(err, 'Could not record your claim.');
    return NextResponse.json({ error }, { status });
  }
}
