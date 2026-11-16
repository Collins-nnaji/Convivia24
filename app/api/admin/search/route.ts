import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { hasAdminPermission } from '@/lib/admin-permissions';
import sql, { apiErrorResponse } from '@/lib/db';
import { captureApiError } from '@/lib/sentry';

/** Desk-wide search (Ctrl/⌘+K): orders, customers, bottles and suppliers — only what the role can open. */
export async function GET(req: NextRequest) {
  const gate = await requireAdmin('read');
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const q = (req.nextUrl.searchParams.get('q') || '').trim().toLowerCase().slice(0, 80);
  if (q.length < 2) return NextResponse.json({ results: [] });
  const like = `%${q}%`;
  const canOrders = hasAdminPermission(gate.role, 'orders');
  const canStock = hasAdminPermission(gate.role, 'inventory') || hasAdminPermission(gate.role, 'content');
  try {
    const [orders, customers, bottles, suppliers] = await Promise.all([
      canOrders
        ? sql`
            SELECT id, full_name, status, COALESCE(total_ngn, subtotal_ngn) AS total FROM ritual_orders
            WHERE status <> 'pending' AND archived_at IS NULL
              AND (id::text LIKE ${like} OR LOWER(full_name) LIKE ${like} OR LOWER(email) LIKE ${like} OR COALESCE(phone, '') LIKE ${like})
            ORDER BY created_at DESC LIMIT 6`
        : Promise.resolve([]),
      canOrders
        ? sql`
            SELECT LOWER(email) AS email, (ARRAY_AGG(full_name ORDER BY created_at DESC))[1] AS name, COUNT(*)::int AS orders
            FROM ritual_orders
            WHERE status <> 'pending' AND (LOWER(email) LIKE ${like} OR LOWER(full_name) LIKE ${like} OR COALESCE(phone, '') LIKE ${like})
            GROUP BY LOWER(email) ORDER BY MAX(created_at) DESC LIMIT 5`
        : Promise.resolve([]),
      canStock
        ? sql`SELECT slug, name, on_hand FROM inventory WHERE LOWER(name) LIKE ${like} OR slug LIKE ${like} OR LOWER(COALESCE(brand, '')) LIKE ${like} ORDER BY name LIMIT 6`
        : Promise.resolve([]),
      hasAdminPermission(gate.role, 'inventory')
        ? sql`SELECT id, name, city, active FROM suppliers WHERE LOWER(name) LIKE ${like} OR LOWER(COALESCE(city, '')) LIKE ${like} ORDER BY name LIMIT 4`
        : Promise.resolve([]),
    ]);
    const results = [
      ...orders.map((o) => ({
        type: 'order' as const,
        id: String(o.id),
        title: `#${String(o.id).slice(0, 8).toUpperCase()} · ${o.full_name}`,
        sub: `${String(o.status).replace(/_/g, ' ')} · ₦${Number(o.total ?? 0).toLocaleString('en-NG')}`,
      })),
      ...customers.map((c) => ({ type: 'customer' as const, id: String(c.email), title: String(c.name || c.email), sub: `${c.email} · ${c.orders} order${c.orders === 1 ? '' : 's'}` })),
      ...bottles.map((b) => ({ type: 'bottle' as const, id: String(b.slug), title: String(b.name), sub: `${b.on_hand} on hand` })),
      ...suppliers.map((s) => ({ type: 'supplier' as const, id: String(s.id), title: String(s.name), sub: `${s.city || ''}${s.active ? '' : ' · paused'}` })),
    ];
    return NextResponse.json({ results });
  } catch (err) {
    captureApiError(err, { route: 'admin/search GET' });
    const { status, error } = apiErrorResponse(err, 'Search failed.');
    return NextResponse.json({ error }, { status });
  }
}
