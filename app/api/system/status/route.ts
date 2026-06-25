import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { aiConfigured } from '@/lib/ai/azure';
import { faceConfigured } from '@/lib/ai/face';
import { authConfigured, isAdminRequest } from '@/lib/auth/session';
import { blobConfigured } from '@/lib/azure/blob';
import { redisConfigured } from '@/lib/redis';

const REQUIRED_TABLES = [
  'events',
  'ticket_types',
  'orders',
  'tickets',
  'uploads',
  'guestlist_applications',
  'broadcasts',
  'event_guests',
  'guest_connections',
  'memory_posts',
];

const REQUIRED_EVENT_COLUMNS = [
  'guestlist_mode',
  'theme_mode',
  'theme_accent',
  'lounge_enabled',
  'memory_wall_enabled',
  'payout_split',
];

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tableRows = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ANY(${REQUIRED_TABLES}::text[])
    `;
    const presentTables = new Set(tableRows.map((r) => String(r.table_name)));

    const columnRows = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'events'
        AND column_name = ANY(${REQUIRED_EVENT_COLUMNS}::text[])
    `;
    const presentColumns = new Set(columnRows.map((r) => String(r.column_name)));

    let counts: Record<string, number> = {};
    if (['events', 'ticket_types', 'orders', 'tickets', 'uploads'].every((t) => presentTables.has(t))) {
      const countRows = await sql`
        SELECT
          (SELECT COUNT(*)::int FROM events) AS events,
          (SELECT COUNT(*)::int FROM ticket_types) AS ticket_types,
          (SELECT COUNT(*)::int FROM orders) AS orders,
          (SELECT COUNT(*)::int FROM tickets) AS tickets,
          (SELECT COUNT(*)::int FROM uploads) AS uploads
      `;
      counts = countRows[0] as Record<string, number>;
    }

    const checks = [
      {
        id: 'database',
        label: 'Neon database',
        ok: !!process.env.DATABASE_URL && presentTables.has('events'),
        detail: process.env.DATABASE_URL ? 'Connected and responding' : 'DATABASE_URL missing',
      },
      {
        id: 'schema',
        label: 'Experiential schema',
        ok: REQUIRED_TABLES.every((t) => presentTables.has(t)) && REQUIRED_EVENT_COLUMNS.every((c) => presentColumns.has(c)),
        detail: `${presentTables.size}/${REQUIRED_TABLES.length} tables, ${presentColumns.size}/${REQUIRED_EVENT_COLUMNS.length} event columns`,
      },
      {
        id: 'auth',
        label: 'Neon Auth',
        ok: authConfigured(),
        detail: authConfigured() ? 'Session endpoint configured' : 'NEON_AUTH_BASE_URL missing',
      },
      {
        id: 'azure-storage',
        label: 'Azure Storage',
        ok: blobConfigured(),
        detail: blobConfigured() ? `Container: ${process.env.AZURE_STORAGE_CONTAINER || 'convivia24'}` : 'AZURE_STORAGE_CONNECTION_STRING missing',
      },
      {
        id: 'ticket-signing',
        label: 'Ticket signing',
        ok: !!(process.env.TICKET_SIGNING_SECRET || process.env.NEON_AUTH_COOKIE_SECRET || process.env.ADMIN_SECRET),
        detail: process.env.TICKET_SIGNING_SECRET || process.env.NEON_AUTH_COOKIE_SECRET || process.env.ADMIN_SECRET
          ? 'HMAC signing secret configured'
          : 'Set TICKET_SIGNING_SECRET before production launch',
      },
      {
        id: 'azure-openai',
        label: 'Azure OpenAI',
        ok: aiConfigured(),
        detail: aiConfigured() ? 'AI concierge and builder enabled' : 'AI falls back to templates',
        optional: true,
      },
      {
        id: 'azure-face',
        label: 'Azure Face',
        ok: faceConfigured(),
        detail: faceConfigured() ? 'Face check-in enabled' : 'Face check-in disabled',
        optional: true,
      },
      {
        id: 'redis',
        label: 'Upstash Redis',
        ok: redisConfigured(),
        detail: redisConfigured() ? 'Rate limiting/cache enabled' : 'Graceful no-op rate limits',
        optional: true,
      },
      {
        id: 'sentry',
        label: 'Sentry',
        ok: !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN),
        detail: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN ? 'Error tracking enabled' : 'Error tracking disabled',
        optional: true,
      },
    ];

    return NextResponse.json({
      ok: checks.filter((c) => !c.optional).every((c) => c.ok),
      checks,
      counts,
      missing: {
        tables: REQUIRED_TABLES.filter((t) => !presentTables.has(t)),
        event_columns: REQUIRED_EVENT_COLUMNS.filter((c) => !presentColumns.has(c)),
      },
    });
  } catch (err) {
    console.error('[GET /api/system/status]', err);
    return NextResponse.json({ error: 'Failed to load system status.' }, { status: 500 });
  }
}
