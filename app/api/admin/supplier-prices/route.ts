import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { apiErrorResponse } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';
import {
  deleteSupplierSkuPrice,
  listSupplierCatalog,
  upsertSupplierSkuPrice,
} from '@/lib/suppliers/sku-prices';

export async function GET() {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const catalog = await listSupplierCatalog();
    return NextResponse.json({ catalog });
  } catch (err) {
    captureApiError(err, { route: 'admin/supplier-prices GET' });
    const { status, error } = apiErrorResponse(err, 'Unable to load supplier prices.');
    return NextResponse.json({ error }, { status });
  }
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const rl = await rateLimit(`admin:${clientIp(req)}`, 60, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const supplierId = typeof body.supplierId === 'string' ? body.supplierId.trim() : '';
    const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
    const costNgn = Number(body.costNgn);

    if (!supplierId || !slug) {
      return NextResponse.json({ error: 'Supplier and SKU are required.' }, { status: 400 });
    }
    if (!Number.isFinite(costNgn) || costNgn < 0) {
      return NextResponse.json({ error: 'Cost must be a valid amount.' }, { status: 400 });
    }

    const price = await upsertSupplierSkuPrice(supplierId, slug, costNgn);
    return NextResponse.json({ price });
  } catch (err) {
    captureApiError(err, { route: 'admin/supplier-prices POST' });
    const { status, error } = apiErrorResponse(err, 'Unable to save supplier price.');
    return NextResponse.json({ error }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const supplierId = new URL(req.url).searchParams.get('supplierId') || '';
    const slug = new URL(req.url).searchParams.get('slug') || '';
    if (!supplierId || !slug) {
      return NextResponse.json({ error: 'Supplier and SKU are required.' }, { status: 400 });
    }
    await deleteSupplierSkuPrice(supplierId, slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    captureApiError(err, { route: 'admin/supplier-prices DELETE' });
    const { status, error } = apiErrorResponse(err, 'Unable to remove supplier price.');
    return NextResponse.json({ error }, { status });
  }
}
