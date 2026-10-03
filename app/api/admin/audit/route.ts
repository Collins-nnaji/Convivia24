import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { apiErrorResponse } from '@/lib/db';
import { AUDIT_CATEGORIES, readAudit, readSignedInUsers } from '@/lib/audit/read';

export async function GET(request: NextRequest) {
  const gate = await requireAdmin('owner');
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const params = request.nextUrl.searchParams;
  const search = (params.get('search') || '').trim().slice(0, 150);
  const category = params.get('category') || '';
  const outcome = params.get('outcome') || '';
  const date = (key: string) => { const value = params.get(key); return value ? new Date(value) : null; };
  const from = date('from'); const to = date('to');
  if ((category && !(AUDIT_CATEGORIES as readonly string[]).includes(category)) ||
      (outcome && !['success', 'rejected', 'failed'].includes(outcome)) ||
      (from && !Number.isFinite(from.getTime())) || (to && !Number.isFinite(to.getTime())) || (from && to && from >= to)) {
    return NextResponse.json({ error: 'Invalid audit filters.' }, { status: 400 });
  }
  const offset = Number(params.get('usersOffset') || 0);
  if (!Number.isInteger(offset) || offset < 0 || offset > 100000) return NextResponse.json({ error: 'Invalid users page.' }, { status: 400 });
  try {
    const [activity, sessions] = await Promise.all([
      readAudit({ search, category, outcome, from: from?.toISOString() ?? null, to: to?.toISOString() ?? null, before: params.get('before'), limit: 50 }),
      readSignedInUsers(search, offset),
    ]);
    return NextResponse.json({ ...activity, ...sessions, usersOffset: offset, generatedAt: new Date().toISOString() }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    const failure = apiErrorResponse(error, 'Audit records unavailable. Check that the platform-audit migration has been applied.');
    return NextResponse.json({ error: failure.error }, { status: failure.status });
  }
}
