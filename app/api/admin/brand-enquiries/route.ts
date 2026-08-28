import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { apiErrorResponse } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';
import { listBrandEnquiries, setBrandEnquiryStatus } from '@/lib/trivia/enquiries';

const STATUSES = ['new', 'contacted', 'won', 'closed'] as const;

export async function GET() {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    return NextResponse.json({ enquiries: await listBrandEnquiries() });
  } catch (err) {
    captureApiError(err, { route: 'admin/brand-enquiries GET' });
    const { status, error } = apiErrorResponse(err, 'Unable to load brand enquiries.');
    return NextResponse.json({ error }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const rl = await rateLimit(`admin:${clientIp(req)}`, 40, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    const status = typeof body.status === 'string' ? body.status : '';
    if (!id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    if (!(STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ error: 'Unknown status.' }, { status: 400 });
    }

    const enquiry = await setBrandEnquiryStatus(id, status as (typeof STATUSES)[number]);
    if (!enquiry) return NextResponse.json({ error: 'Enquiry not found.' }, { status: 404 });
    return NextResponse.json({ enquiry });
  } catch (err) {
    captureApiError(err, { route: 'admin/brand-enquiries PATCH' });
    const { status, error } = apiErrorResponse(err, 'Unable to update that enquiry.');
    return NextResponse.json({ error }, { status });
  }
}
