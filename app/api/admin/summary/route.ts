import { NextResponse } from 'next/server';
import sql, { apiErrorResponse } from '@/lib/db';
import { requireAdmin } from '@/lib/admin';
import { blobConfigured } from '@/lib/azure/blob';
import { aiConfigured } from '@/lib/ai/azure';
import { captureApiError } from '@/lib/sentry';

export type AdminSummary = {
  /** Paid orders that have not yet left the building. */
  ordersToFulfil: number;
  /** Live orders with no supplier cost recorded. */
  ordersUnsourced: number;
  /** Tracked, listed SKUs at or under their low-stock threshold. */
  lowStock: number;
  /** Trivia winners who have not collected their bottle. */
  prizesUnclaimed: number;
  brandEnquiriesNew: number;
  partnersPending: number;
  commissionsOwedNgn: number;
  todayOrders: number;
  todayRevenueNgn: number;
  /** Changes suppliers made in their own portals in the last 24 hours. */
  supplierChanges24h: number;
  bottleRequestsPending: number;
  /** Venue submissions and brand claims waiting on the desk. */
  contentPending: number;
  blobConfigured: boolean;
  aiConfigured: boolean;
};

/**
 * Counts only — the numbers that decide where the desk goes next. Every tab loads its own
 * detail lazily, so this is the one cheap call the shell makes on mount.
 */
export async function GET() {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const one = <T,>(p: Promise<T[]>) => p.then((rows) => rows[0] ?? ({} as T)).catch(() => ({} as T));
    const [orders, stock, prizes, enquiries, partners, owed, supplierActivity, bottleRequests, content] = await Promise.all([
      one(sql`
        SELECT
          COUNT(*) FILTER (WHERE status IN ('paid','processing','packed','out_for_delivery'))::int AS to_fulfil,
          COUNT(*) FILTER (
            WHERE supplier_cost_ngn IS NULL
              AND status NOT IN ('pending','awaiting_payment','cancelled','refunded')
          )::int AS unsourced,
          COUNT(*) FILTER (
            WHERE created_at >= date_trunc('day', NOW()) AND status NOT IN ('pending','awaiting_payment','cancelled','refunded')
          )::int AS today_orders,
          COALESCE(SUM(COALESCE(total_ngn, subtotal_ngn) - COALESCE(refunded_ngn, 0)) FILTER (
            WHERE created_at >= date_trunc('day', NOW()) AND status NOT IN ('pending','awaiting_payment','cancelled','refunded')
          ), 0)::bigint AS today_revenue
        FROM ritual_orders
      `),
      one(sql`
        SELECT COUNT(*)::int AS low
        FROM inventory
        WHERE track_stock = true AND active = true AND (on_hand - reserved) <= low_stock_threshold
      `),
      one(sql`SELECT COUNT(*)::int AS unclaimed FROM trivia_entries WHERE status = 'won'`),
      one(sql`SELECT COUNT(*)::int AS fresh FROM brand_enquiries WHERE status = 'new'`),
      one(sql`SELECT COUNT(*)::int AS pending FROM referral_partners WHERE status = 'pending'`),
      one(sql`
        SELECT COALESCE(SUM(commission_ngn), 0)::bigint AS owed
        FROM referral_attributions WHERE status = 'approved'
      `),
      one(sql`
        SELECT COUNT(*)::int AS changes FROM supplier_audit_log
        WHERE actor = 'supplier' AND action <> 'portal.login' AND created_at >= NOW() - INTERVAL '24 hours'
      `),
      one(sql`SELECT COUNT(*)::int AS pending FROM supplier_bottle_requests WHERE status = 'pending'`),
      one(sql`
        SELECT
          (SELECT COUNT(*) FROM venues WHERE status = 'pending')::int
          + (SELECT COUNT(*) FROM brand_claims WHERE status IN ('pending','verified'))::int AS pending
      `),
    ]);

    const summary: AdminSummary = {
      ordersToFulfil: Number(orders.to_fulfil ?? 0),
      ordersUnsourced: Number(orders.unsourced ?? 0),
      lowStock: Number(stock.low ?? 0),
      prizesUnclaimed: Number(prizes.unclaimed ?? 0),
      brandEnquiriesNew: Number(enquiries.fresh ?? 0),
      partnersPending: Number(partners.pending ?? 0),
      commissionsOwedNgn: Number(owed.owed ?? 0),
      todayOrders: Number(orders.today_orders ?? 0),
      todayRevenueNgn: Number(orders.today_revenue ?? 0),
      supplierChanges24h: Number(supplierActivity.changes ?? 0),
      bottleRequestsPending: Number(bottleRequests.pending ?? 0),
      contentPending: Number(content.pending ?? 0),
      blobConfigured: blobConfigured(),
      aiConfigured: aiConfigured(),
    };
    return NextResponse.json(summary);
  } catch (err) {
    captureApiError(err, { route: 'admin/summary GET' });
    const { status, error } = apiErrorResponse(err, 'Unable to load the desk summary.');
    return NextResponse.json({ error }, { status });
  }
}
