import { NextRequest, NextResponse } from 'next/server';
import { apiErrorResponse } from '@/lib/db';
import { requireSupplier } from '@/lib/suppliers/auth';
import { createBottleRequest, listBottleRequests, validateBottleRequest } from '@/lib/suppliers/requests';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  const gate = await requireSupplier(slug);
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    return NextResponse.json({ requests: await listBottleRequests({ supplierId: gate.supplier.id }) });
  } catch (err) {
    captureApiError(err, { route: 'supplier/requests GET' });
    const { status, error } = apiErrorResponse(err, 'Could not load your requests.');
    return NextResponse.json({ error }, { status });
  }
}

/** POST — suggest a bottle that is not in the catalog. The desk approves or declines. */
export async function POST(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  const gate = await requireSupplier(slug);
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const rl = await rateLimit(`supplier:${clientIp(req)}`, 20, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    const b = await req.json().catch(() => ({}));
    const input = {
      name: String(b.name || ''),
      brand: typeof b.brand === 'string' ? b.brand : null,
      category: typeof b.category === 'string' && b.category ? b.category : null,
      volume: typeof b.volume === 'string' ? b.volume : null,
      abv: b.abv === '' || b.abv == null ? null : Number(b.abv),
      costNgn: b.costNgn === '' || b.costNgn == null ? null : Number(b.costNgn),
      onHand: b.onHand === '' || b.onHand == null ? 0 : Number(b.onHand),
      note: typeof b.note === 'string' ? b.note : null,
    };
    const invalid = validateBottleRequest(input);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
    const request = await createBottleRequest(gate.supplier.id, gate.supplier.contactName || gate.supplier.name, input);
    return NextResponse.json({ request }, { status: 201 });
  } catch (err) {
    captureApiError(err, { route: 'supplier/requests POST' });
    const { status, error } = apiErrorResponse(err, 'Could not send your request.');
    return NextResponse.json({ error }, { status });
  }
}
