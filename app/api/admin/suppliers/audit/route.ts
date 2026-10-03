import { withAudit } from '@/lib/audit/route';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { apiErrorResponse } from '@/lib/db';
import { captureApiError } from '@/lib/sentry';
import { describeAudit, listSupplierAudit } from '@/lib/suppliers/audit';

/** GET ?supplierId=&limit= — who changed what on which supplier's shelf, newest first. */
async function handleGET(req: NextRequest) {
  const gate = await requireAdmin('inventory');
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const url = new URL(req.url);
    const supplierId = url.searchParams.get('supplierId') || undefined;
    const limit = Number(url.searchParams.get('limit') || 100);
    const entries = await listSupplierAudit({ supplierId, limit: Number.isFinite(limit) ? limit : 100 });
    return NextResponse.json({ entries: entries.map((e) => ({ ...e, text: describeAudit(e) })) });
  } catch (err) {
    captureApiError(err, { route: 'admin/suppliers/audit GET' });
    const { status, error } = apiErrorResponse(err, 'Unable to load supplier activity.');
    return NextResponse.json({ error }, { status });
  }
}

export const GET = withAudit('/api/admin/suppliers/audit', handleGET);
