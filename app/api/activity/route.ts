import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { auditPath, recordAudit, recordPresence } from '@/lib/audit/record';
import { rateLimit } from '@/lib/redis';
import { apiErrorResponse } from '@/lib/db';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  if (!(await rateLimit(`activity:${user.id}`, 60, 60, { fallback: 'local' })).ok) return NextResponse.json({ error: 'Too many activity requests.' }, { status: 429 });
  const body = await request.json().catch(() => null);
  const path = typeof body?.path === 'string' ? auditPath(body.path) : null;
  if (!path || !['page.view', 'heartbeat'].includes(body?.action)) return NextResponse.json({ error: 'Valid page and activity required.' }, { status: 400 });
  try {
    if (body.action === 'page.view') await recordAudit({ user, category: 'navigation', action: 'page.view', subject: path });
    else await recordPresence(user, path);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const failure = apiErrorResponse(error, 'Activity tracking unavailable.');
    return NextResponse.json({ error: failure.error }, { status: failure.status });
  }
}
