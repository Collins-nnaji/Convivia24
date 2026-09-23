import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { buildAnalyticsReport, parseAnalyticsPeriod } from '@/lib/analytics/report';
import { apiErrorResponse } from '@/lib/db';
import { captureApiError } from '@/lib/sentry';

export async function GET(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const period = parseAnalyticsPeriod(req.nextUrl.searchParams.get('period'));
    const report = await buildAnalyticsReport(period);
    return NextResponse.json(report);
  } catch (err) {
    captureApiError(err, { route: 'admin/analytics GET' });
    const { status, error } = apiErrorResponse(err, 'Unable to load analytics.');
    return NextResponse.json({ error }, { status });
  }
}
