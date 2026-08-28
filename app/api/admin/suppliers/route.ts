import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { apiErrorResponse } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';
import {
  createSupplier,
  deleteSupplier,
  listSuppliers,
  updateSupplier,
  validateSupplier,
  type SupplierInput,
} from '@/lib/suppliers/repo';

function readInput(body: Record<string, unknown>): SupplierInput {
  const str = (v: unknown) => (typeof v === 'string' ? v : null);
  const list = (v: unknown) => (Array.isArray(v) ? v.map(String) : []);
  return {
    name: typeof body.name === 'string' ? body.name : '',
    contactName: str(body.contactName),
    phone: str(body.phone),
    email: str(body.email),
    city: str(body.city),
    areas: list(body.areas),
    categories: list(body.categories),
    sameDay: body.sameDay === true,
    notes: str(body.notes),
    active: body.active !== false,
  };
}

export async function GET() {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const suppliers = await listSuppliers();
    return NextResponse.json({ suppliers });
  } catch (err) {
    captureApiError(err, { route: 'admin/suppliers GET' });
    const { status, error } = apiErrorResponse(err, 'Unable to load suppliers.');
    return NextResponse.json({ error }, { status });
  }
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const rl = await rateLimit(`admin:${clientIp(req)}`, 40, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const input = readInput(await req.json().catch(() => ({})));
    const invalid = validateSupplier(input);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

    const supplier = await createSupplier(input);
    return NextResponse.json({ supplier }, { status: 201 });
  } catch (err) {
    captureApiError(err, { route: 'admin/suppliers POST' });
    const { status, error } = apiErrorResponse(err, 'Unable to create supplier.');
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
    if (!id) return NextResponse.json({ error: 'Supplier id is required.' }, { status: 400 });

    const input = readInput(body);
    const invalid = validateSupplier(input);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

    const supplier = await updateSupplier(id, input);
    if (!supplier) return NextResponse.json({ error: 'Supplier not found.' }, { status: 404 });
    return NextResponse.json({ supplier });
  } catch (err) {
    captureApiError(err, { route: 'admin/suppliers PATCH' });
    const { status, error } = apiErrorResponse(err, 'Unable to update supplier.');
    return NextResponse.json({ error }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Supplier id is required.' }, { status: 400 });
    const { deactivated } = await deleteSupplier(id);
    return NextResponse.json({ ok: true, deactivated });
  } catch (err) {
    captureApiError(err, { route: 'admin/suppliers DELETE' });
    const { status, error } = apiErrorResponse(err, 'Unable to remove supplier.');
    return NextResponse.json({ error }, { status });
  }
}
