import { NextRequest, NextResponse } from 'next/server';
import { apiErrorResponse } from '@/lib/db';
import { notifyPartnerApplication } from '@/lib/commerce/partner-notify';
import {
  createPartnerApplication,
  validatePartnerApplication,
  type BrandApplicationPayload,
  type OutletApplicationPayload,
  type PartnerApplicationInput,
} from '@/lib/partners/applications';
import { VENUE_KINDS } from '@/lib/partners/outlets';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

const BRAND_CATEGORIES = ['spirits', 'whisky', 'cognac', 'vodka', 'tequila', 'wine', 'champagne', 'rtd', 'beer', 'mixers', 'other'];

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(`partner-apply:${clientIp(req)}`, 8, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests. Try again shortly.' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const kind = body.kind === 'brand' ? 'brand' : 'outlet';

    let input: PartnerApplicationInput;

    if (kind === 'outlet') {
      const interests = Array.isArray(body.interests)
        ? body.interests.map(String).filter(Boolean)
        : [];
      const rawVenueKind = String(body.venueKind || '');
      const payload: OutletApplicationPayload = {
        area: String(body.area || ''),
        venueKind: (VENUE_KINDS as readonly string[]).includes(rawVenueKind) ? rawVenueKind : 'lounge',
        seats: body.seats != null && body.seats !== '' ? Number(body.seats) : null,
        interests,
      };
      input = {
        kind: 'outlet',
        contactName: String(body.contactName || body.name || ''),
        email: String(body.email || ''),
        phone: body.phone ? String(body.phone) : null,
        companyName: String(body.companyName || body.venue || ''),
        notes: body.notes ? String(body.notes) : null,
        payload,
      };
    } else {
      const categories = Array.isArray(body.categories)
        ? body.categories.map(String).filter((c: string) => BRAND_CATEGORIES.includes(c) || c === 'other')
        : [];
      const payload: BrandApplicationPayload = {
        website: body.website ? String(body.website) : null,
        categories,
        regions: String(body.regions || ''),
        skuEstimate: body.skuEstimate ? String(body.skuEstimate) : null,
      };
      input = {
        kind: 'brand',
        contactName: String(body.contactName || body.name || ''),
        email: String(body.email || ''),
        phone: body.phone ? String(body.phone) : null,
        companyName: String(body.companyName || body.brand || ''),
        notes: body.notes ? String(body.notes) : null,
        payload,
      };
    }

    const invalid = validatePartnerApplication(input);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

    const row = await createPartnerApplication(input);
    const applicationId = String(row.id);
    await notifyPartnerApplication(applicationId, input);

    return NextResponse.json(
      {
        ok: true,
        applicationId,
        message:
          kind === 'outlet'
            ? 'Enquiry received — our team will reach out about wholesale, events, and credit terms.'
            : 'Enquiry received — our team will review your brand for distribution.',
      },
      { status: 201 }
    );
  } catch (err) {
    captureApiError(err, { route: 'partners/apply POST' });
    const { status, error } = apiErrorResponse(err, 'Could not send enquiry.');
    return NextResponse.json({ error }, { status });
  }
}
