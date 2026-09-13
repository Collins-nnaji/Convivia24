import { NextRequest, NextResponse } from 'next/server';
import { requireSupplier } from '@/lib/suppliers/auth';
import { supplierShelf, supplierOrders } from '@/lib/suppliers/stock';
import { listSupplierAudit } from '@/lib/suppliers/audit';
import { logSupplierAction } from '@/lib/suppliers/audit';
import { touchSupplierSeen, updateSupplierContact, type Supplier } from '@/lib/suppliers/repo';
import { SUPPLIER_SETTABLE_STATUSES } from '@/lib/suppliers/portal';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';
import { apiErrorResponse } from '@/lib/db';

type Ctx = { params: Promise<{ slug: string }> };

/** What the portal is allowed to know about its own supplier record. */
function publicSupplier(s: Supplier) {
  return {
    id: s.id,
    slug: s.slug,
    name: s.name,
    contactName: s.contactName,
    phone: s.phone,
    email: s.email,
    city: s.city,
    areas: s.areas,
    categories: s.categories,
    sameDay: s.sameDay,
    notes: s.notes,
  };
}

/** GET — everything the portal shows: profile, shelf, orders, and their own recent activity. */
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  const gate = await requireSupplier(slug);
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const [shelf, orders, activity] = await Promise.all([
      supplierShelf(gate.supplier.id),
      supplierOrders(gate.supplier.id),
      listSupplierAudit({ supplierId: gate.supplier.id, limit: 60 }),
    ]);
    await touchSupplierSeen(gate.supplier.id);
    return NextResponse.json({
      supplier: publicSupplier(gate.supplier),
      via: gate.via,
      shelf,
      orders,
      activity,
      statuses: SUPPLIER_SETTABLE_STATUSES,
    });
  } catch (err) {
    captureApiError(err, { route: 'supplier GET' });
    const { status, error } = apiErrorResponse(err, 'Could not load your portal.');
    return NextResponse.json({ error }, { status });
  }
}

/** PATCH — contact details only. Name, city and delivery areas are the desk's to change. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  const gate = await requireSupplier(slug);
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const rl = await rateLimit(`supplier:${clientIp(req)}`, 40, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const str = (v: unknown) => (typeof v === 'string' ? v.slice(0, 300) : undefined);
    const email = str(body.email);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'That email does not look right.' }, { status: 400 });
    }
    const updated = await updateSupplierContact(gate.supplier.id, {
      contactName: str(body.contactName),
      phone: str(body.phone),
      email,
      sameDay: typeof body.sameDay === 'boolean' ? body.sameDay : undefined,
      notes: str(body.notes),
    });
    if (!updated) return NextResponse.json({ error: 'Supplier not found.' }, { status: 404 });
    await logSupplierAction({
      supplierId: gate.supplier.id,
      actor: 'supplier',
      actorLabel: updated.contactName,
      action: 'profile.update',
      detail: { contactName: updated.contactName, phone: updated.phone, email: updated.email, sameDay: updated.sameDay },
    });
    return NextResponse.json({ supplier: publicSupplier(updated) });
  } catch (err) {
    captureApiError(err, { route: 'supplier PATCH' });
    const { status, error } = apiErrorResponse(err, 'Could not save your details.');
    return NextResponse.json({ error }, { status });
  }
}
