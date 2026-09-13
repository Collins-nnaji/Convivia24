import { NextRequest, NextResponse } from 'next/server';
import { signInSupplier, signOutSupplier, requireSupplier } from '@/lib/suppliers/auth';
import { logSupplierAction } from '@/lib/suppliers/audit';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';
import { apiErrorResponse } from '@/lib/db';

type Ctx = { params: Promise<{ slug: string }> };

/** POST { key } — sign in to one supplier's portal. */
export async function POST(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  try {
    // Shared keys deserve a tight lockout — eight tries per quarter hour per address.
    const rl = await rateLimit(`supplier-login:${clientIp(req)}`, 8, 900);
    if (!rl.ok) return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const key = typeof body.key === 'string' ? body.key.trim() : '';
    if (!key) return NextResponse.json({ error: 'Enter your access key.' }, { status: 400 });

    const gate = await signInSupplier(slug, key);
    if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
    await logSupplierAction({ supplierId: gate.supplier.id, actor: 'supplier', action: 'portal.login', detail: { ip: clientIp(req) } });
    return NextResponse.json({ ok: true, supplier: { id: gate.supplier.id, name: gate.supplier.name, slug: gate.supplier.slug } });
  } catch (err) {
    captureApiError(err, { route: 'supplier/session POST' });
    const { status, error } = apiErrorResponse(err, 'Could not sign in.');
    return NextResponse.json({ error }, { status });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  const gate = await requireSupplier(slug);
  if (gate.ok) await signOutSupplier(gate.supplier.id);
  return NextResponse.json({ ok: true });
}
