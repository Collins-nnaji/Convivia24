import { auth } from '@/lib/auth/server';
import { withAudit } from '@/lib/audit/route';

const handlers = auth.handler();
export const GET = withAudit('/api/auth/[...path]', handlers.GET, 'auth');
export const POST = withAudit('/api/auth/[...path]', handlers.POST, 'auth');
export const PUT = withAudit('/api/auth/[...path]', handlers.PUT, 'auth');
export const DELETE = withAudit('/api/auth/[...path]', handlers.DELETE, 'auth');
export const PATCH = withAudit('/api/auth/[...path]', handlers.PATCH, 'auth');
