import { withAudit } from '@/lib/audit/route';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { apiErrorResponse } from '@/lib/db';
import { getPricingPolicy, savePricingPolicy } from '@/lib/pricing/policy';
import { captureApiError } from '@/lib/sentry';

async function handleGET() {
  const gate = await requireAdmin('inventory');
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const policy = await getPricingPolicy();
    return NextResponse.json(policy);
  } catch (err) {
    captureApiError(err, { route: 'admin/pricing-policy GET' });
    const { status, error } = apiErrorResponse(err, 'Unable to load the markup.');
    return NextResponse.json({ error }, { status });
  }
}

async function handlePUT(req: NextRequest) {
  const gate = await requireAdmin('inventory');
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const body = await req.json().catch(() => ({}));
    const policy = await savePricingPolicy({
      markupPct: body.markupPct,
      markupFlatNgn: body.markupFlatNgn,
    });
    return NextResponse.json(policy);
  } catch (err) {
    captureApiError(err, { route: 'admin/pricing-policy PUT' });
    const { status, error } = apiErrorResponse(err, 'Unable to save the markup.');
    return NextResponse.json({ error }, { status });
  }
}

export const GET = withAudit('/api/admin/pricing-policy', handleGET);
export const PUT = withAudit('/api/admin/pricing-policy', handlePUT);
