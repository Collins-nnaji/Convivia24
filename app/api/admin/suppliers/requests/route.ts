import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { apiErrorResponse } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';
import { approveBottleRequest, declineBottleRequest, listBottleRequests } from '@/lib/suppliers/requests';
import { invalidateCatalog } from '@/lib/shop/catalog-cache';

export async function GET(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const status = (new URL(req.url).searchParams.get('status') || 'all') as 'pending' | 'approved' | 'declined' | 'all';
    return NextResponse.json({ requests: await listBottleRequests({ status }) });
  } catch (err) {
    captureApiError(err, { route: 'admin/suppliers/requests GET' });
    const { status, error } = apiErrorResponse(err, 'Could not load bottle requests.');
    return NextResponse.json({ error }, { status });
  }
}

/** PATCH { id, action: 'approve', priceNgn, slug?, note? } | { id, action: 'decline', note? } */
export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const rl = await rateLimit(`admin:${clientIp(req)}`, 40, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    const b = await req.json().catch(() => ({}));
    const id = String(b.id || '');
    if (!id) return NextResponse.json({ error: 'Request id is required.' }, { status: 400 });
    if (b.action === 'approve') {
      const priceNgn = Number(b.priceNgn);
      if (!Number.isFinite(priceNgn) || priceNgn <= 0) return NextResponse.json({ error: 'Set a retail price to list it.' }, { status: 400 });
      const request = await approveBottleRequest(id, { priceNgn, slug: typeof b.slug === 'string' ? b.slug : null, note: typeof b.note === 'string' ? b.note : null });
      if (!request) return NextResponse.json({ error: 'Request not found or already decided.' }, { status: 404 });
      await invalidateCatalog();
      return NextResponse.json({ request });
    }
    if (b.action === 'decline') {
      const request = await declineBottleRequest(id, typeof b.note === 'string' ? b.note : null);
      if (!request) return NextResponse.json({ error: 'Request not found or already decided.' }, { status: 404 });
      return NextResponse.json({ request });
    }
    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (err) {
    captureApiError(err, { route: 'admin/suppliers/requests PATCH' });
    const { status, error } = apiErrorResponse(err, 'Could not update the request.');
    return NextResponse.json({ error }, { status });
  }
}
