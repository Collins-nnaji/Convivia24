import { NextRequest, NextResponse } from 'next/server';
import { apiErrorResponse } from '@/lib/db';
import { requireSupplier } from '@/lib/suppliers/auth';
import { supplierOwnsOrder } from '@/lib/suppliers/stock';
import { SUPPLIER_SETTABLE_STATUSES } from '@/lib/suppliers/portal';
import { applyOrderStatus, applyOrderTracking, readTrackingPatch } from '@/lib/commerce/transitions';
import type { OrderStatus } from '@/lib/commerce/status';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

type Ctx = { params: Promise<{ slug: string }> };

/**
 * PATCH { orderId, status } — move one of this supplier's orders forward.
 * PATCH { orderId, action: 'tracking', courierName, riderPhone, etaAt, trackingNote } — rider details.
 */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  const gate = await requireSupplier(slug);
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const rl = await rateLimit(`supplier:${clientIp(req)}`, 40, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
    if (!orderId) return NextResponse.json({ error: 'orderId is required.' }, { status: 400 });
    if (!(await supplierOwnsOrder(gate.supplier.id, orderId))) {
      return NextResponse.json({ error: 'That order is not with you.' }, { status: 403 });
    }

    const actor = { kind: 'supplier' as const, supplierId: gate.supplier.id, label: gate.supplier.contactName || gate.supplier.name };
    const tracking = readTrackingPatch(body);

    if (body.action === 'tracking') {
      const result = await applyOrderTracking(orderId, tracking, actor);
      if (!result) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
      return NextResponse.json({ ok: true, ...result });
    }

    const status = typeof body.status === 'string' ? (body.status as OrderStatus) : null;
    if (!status) return NextResponse.json({ error: 'status is required.' }, { status: 400 });
    const result = await applyOrderStatus(orderId, status, {
      note: typeof body.note === 'string' ? body.note : null,
      tracking,
      actor,
      allowed: SUPPLIER_SETTABLE_STATUSES,
    });
    if (result.ok === false) return NextResponse.json({ error: result.error }, { status: result.httpStatus });
    return NextResponse.json({ ok: true, orderId: result.orderId, status: result.status });
  } catch (err) {
    captureApiError(err, { route: 'supplier/orders PATCH' });
    const { status, error } = apiErrorResponse(err, 'Could not update the order.');
    return NextResponse.json({ error }, { status });
  }
}
