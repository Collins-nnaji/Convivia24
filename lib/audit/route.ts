import { getCurrentUser } from '@/lib/auth/session';
import type { AuthUser } from '@/lib/auth/session';
import { recordAudit } from './record';
import { createHash } from 'node:crypto';

async function requestAction(request: Request): Promise<{ action: string | null; subject: string | null }> {
  // Read a bounded clone, leaving uploads, checkout details and secrets out of the log.
  const empty = { action: null, subject: null };
  if (!request.headers.get('content-type')?.includes('application/json') || !request.body) return empty;
  const reader = request.clone().body?.getReader();
  if (!reader) return empty;
  try {
    let length = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > 16384) { void reader.cancel().catch(() => {}); return empty; }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const body = JSON.parse(new TextDecoder().decode(bytes));
    const value = body?.action;
    const subject = [body?.slug, body?.orderId, body?.id].find(value => typeof value === 'string' && /^[a-z0-9_-]{1,100}$/i.test(value));
    return { action: typeof value === 'string' && /^[a-z][a-z0-9._-]{0,50}$/i.test(value) ? value : null, subject: subject ?? null };
  } catch { return empty; }
}

/** Keep authorization and business logic in the handler; record its actual HTTP result. */
export function withAudit<Args extends unknown[], Result extends Response>(
  route: string,
  handler: (...args: Args) => Promise<Result>,
  category: 'api' | 'auth' = 'api',
): (...args: Args) => Promise<Result> {
  return async (...args: Args): Promise<Result> => {
    const request = args[0];
    if (!(request instanceof Request)) return handler(...args);
    // Session polling is presence, not a new login or a user action.
    if (category === 'auth' && /\/(token|jwks)$/.test(new URL(request.url).pathname)) return handler(...args);
    const started = Date.now();
    let user: AuthUser | null = null;
    try { user = await getCurrentUser(); } catch { /* unauthenticated request */ }
    const { action, subject } = await requestAction(request);
    const authPath = category === 'auth' ? new URL(request.url).pathname.replace('/api/auth/', '') : null;
    const event = { user, category, action: category === 'auth' ? `auth.${authPath && /^[a-z-]+(?:\/[a-z-]+)*$/.test(authPath) ? authPath : 'request'}` : `${request.method} ${route}${action ? ` (${action})` : ''}`, subject: category === 'auth' ? route : subject ?? route, method: request.method, eventKey: undefined as string | undefined };
    try {
      const response = await handler(...args);
      // Email sign-in/sign-up returns the verified upstream identity before its new cookie is
      // present on a request. Only read these known responses; never copy session tokens.
      if (category === 'auth' && response.ok && /^(sign-in\/email|sign-up\/email|get-session)$/.test(authPath || '')) {
        try {
          const body = await response.clone().json();
          const account = body?.user;
          if (typeof account?.id === 'string' && typeof account?.email === 'string') {
            event.user = { id: account.id, email: account.email, name: account.name ?? null, image: null };
            if (authPath === 'get-session' && typeof body?.session?.id === 'string') {
              event.action = 'auth.session.observed';
              event.eventKey = 'session:' + createHash('sha256').update(body.session.id).digest('hex');
            }
          }
        } catch { /* response does not contain a user */ }
      }
      if (authPath === 'get-session' && !event.eventKey) return response;
      await recordAudit({ ...event, status: response.status, durationMs: Date.now() - started });
      return response;
    } catch (error) {
      await recordAudit({ ...event, status: 500, durationMs: Date.now() - started });
      throw error;
    }
  };
}
