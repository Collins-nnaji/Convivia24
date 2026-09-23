/**
 * Admin analytics report — commerce KPIs, engagement, loyalty, inventory, and API usage.
 */

import {
  booksAmount,
  isPeriodKey,
  periodRange,
  type PeriodKey,
} from '@/lib/accounting/statements';
import { apiUsageDaysForPeriod, readApiUsage } from '@/lib/analytics/api-usage';
import type { AnalyticsReport } from '@/lib/analytics/types';
import { aiConfigured } from '@/lib/ai/azure';
import { blobConfigured } from '@/lib/azure/blob';
import { pointsLiabilityNgn } from '@/lib/loyalty/program';
import { flutterwaveSecret } from '@/lib/payments/flutterwave';
import { redisConfigured } from '@/lib/redis';
import sql from '@/lib/db';

export type { AnalyticsReport } from '@/lib/analytics/types';
export { PERIODS, isPeriodKey, type PeriodKey } from '@/lib/accounting/statements';

function num(row: Record<string, unknown>, key: string): number {
  return booksAmount(row[key]);
}

export async function buildAnalyticsReport(period: PeriodKey): Promise<AnalyticsReport> {
  const range = periodRange(period);
  const from = range.from;
  const to = range.to;
  const apiDays = apiUsageDaysForPeriod(period);

  const one = <T,>(p: Promise<T[]>) => p.then((rows) => rows[0] ?? ({} as T)).catch(() => ({} as T));

  const [ordersRow, statusRows, trendRows, skuRows, engageRow, loyaltyRow, stockRow, api] =
    await Promise.all([
      one(sql`
        SELECT
          COUNT(*) FILTER (
            WHERE status NOT IN ('pending','awaiting_payment','cancelled')
          )::int AS orders,
          COALESCE(SUM(COALESCE(total_ngn, subtotal_ngn) - COALESCE(refunded_ngn, 0)) FILTER (
            WHERE status NOT IN ('pending','awaiting_payment','cancelled')
          ), 0)::bigint AS revenue,
          COALESCE(SUM(refunded_ngn), 0)::bigint AS refunded
        FROM ritual_orders
        WHERE created_at >= ${from}::timestamptz AND created_at < ${to}::timestamptz
      `),
      sql`
        SELECT status, COUNT(*)::int AS count
        FROM ritual_orders
        WHERE created_at >= ${from}::timestamptz AND created_at < ${to}::timestamptz
        GROUP BY status
        ORDER BY count DESC
      `.catch(() => [] as { status: string; count: number }[]),
      sql`
        SELECT
          to_char(created_at AT TIME ZONE 'Africa/Lagos', 'YYYY-MM-DD') AS day,
          COUNT(*) FILTER (
            WHERE status NOT IN ('pending','awaiting_payment','cancelled')
          )::int AS orders,
          COALESCE(SUM(COALESCE(total_ngn, subtotal_ngn) - COALESCE(refunded_ngn, 0)) FILTER (
            WHERE status NOT IN ('pending','awaiting_payment','cancelled')
          ), 0)::bigint AS revenue
        FROM ritual_orders
        WHERE created_at >= ${from}::timestamptz AND created_at < ${to}::timestamptz
        GROUP BY 1
        ORDER BY 1
      `.catch(() => [] as { day: string; orders: number; revenue: number }[]),
      sql`
        SELECT
          i.kit_slug AS sku,
          MAX(i.kit_name) AS name,
          SUM(i.qty)::int AS qty,
          COALESCE(SUM(i.qty * i.unit_price_ngn), 0)::bigint AS revenue
        FROM ritual_order_items i
        JOIN ritual_orders o ON o.id = i.order_id
        WHERE o.created_at >= ${from}::timestamptz
          AND o.created_at < ${to}::timestamptz
          AND o.status NOT IN ('pending','awaiting_payment','cancelled')
        GROUP BY i.kit_slug
        ORDER BY qty DESC
        LIMIT 12
      `.catch(() => [] as { sku: string; name: string; qty: number; revenue: number }[]),
      one(
        sql`
          SELECT
            (SELECT COUNT(*)::int FROM trivia_entries
              WHERE created_at >= ${from}::timestamptz AND created_at < ${to}::timestamptz) AS trivia_entries,
            (SELECT COUNT(*)::int FROM trivia_entries
              WHERE status = 'won' AND created_at >= ${from}::timestamptz AND created_at < ${to}::timestamptz) AS trivia_wins,
            (SELECT COUNT(*)::int FROM brand_enquiries
              WHERE created_at >= ${from}::timestamptz AND created_at < ${to}::timestamptz) AS brand_enquiries,
            (SELECT COUNT(*)::int FROM restock_alerts
              WHERE created_at >= ${from}::timestamptz AND created_at < ${to}::timestamptz) AS restock_alerts,
            (SELECT COUNT(*)::int FROM product_reviews
              WHERE created_at >= ${from}::timestamptz AND created_at < ${to}::timestamptz) AS product_reviews
        `
      ),
      one(sql`
        SELECT
          (SELECT COUNT(*)::int FROM loyalty_members) AS members,
          (SELECT COALESCE(SUM(points), 0)::bigint FROM loyalty_members) AS points,
          (SELECT COALESCE(SUM(loyalty_points_awarded), 0)::bigint FROM ritual_orders
            WHERE created_at >= ${from}::timestamptz AND created_at < ${to}::timestamptz) AS awarded
      `),
      one(sql`
        SELECT
          COUNT(*) FILTER (WHERE active = true)::int AS active_skus,
          COUNT(*) FILTER (
            WHERE track_stock = true AND active = true
              AND (on_hand - reserved) <= low_stock_threshold
          )::int AS low_stock,
          COALESCE(SUM(on_hand) FILTER (WHERE active = true), 0)::bigint AS on_hand
        FROM inventory
      `),
      readApiUsage(apiDays),
    ]);

  const orders = num(ordersRow as Record<string, unknown>, 'orders');
  const revenueNgn = num(ordersRow as Record<string, unknown>, 'revenue');
  const points = num(loyaltyRow as Record<string, unknown>, 'points');

  return {
    period,
    range: { from, to, label: range.label },
    commerce: {
      orders,
      revenueNgn,
      aovNgn: orders > 0 ? Math.round(revenueNgn / orders) : 0,
      refundedNgn: num(ordersRow as Record<string, unknown>, 'refunded'),
      byStatus: (statusRows as { status: string; count: number }[]).map((r) => ({
        status: String(r.status),
        count: Number(r.count) || 0,
      })),
      trend: (trendRows as { day: string; orders: number; revenue: number }[]).map((r) => ({
        day: String(r.day),
        orders: Number(r.orders) || 0,
        revenueNgn: booksAmount(r.revenue),
      })),
      topSkus: (skuRows as { sku: string; name: string; qty: number; revenue: number }[]).map((r) => ({
        sku: String(r.sku),
        name: String(r.name || r.sku),
        qty: Number(r.qty) || 0,
        revenueNgn: booksAmount(r.revenue),
      })),
    },
    engagement: {
      triviaEntries: num(engageRow as Record<string, unknown>, 'trivia_entries'),
      triviaWins: num(engageRow as Record<string, unknown>, 'trivia_wins'),
      brandEnquiries: num(engageRow as Record<string, unknown>, 'brand_enquiries'),
      restockAlerts: num(engageRow as Record<string, unknown>, 'restock_alerts'),
      productReviews: num(engageRow as Record<string, unknown>, 'product_reviews'),
    },
    loyalty: {
      members: num(loyaltyRow as Record<string, unknown>, 'members'),
      pointsOutstanding: points,
      pointsLiabilityNgn: pointsLiabilityNgn(points),
      pointsAwardedInPeriod: num(loyaltyRow as Record<string, unknown>, 'awarded'),
    },
    inventory: {
      activeSkus: num(stockRow as Record<string, unknown>, 'active_skus'),
      lowStock: num(stockRow as Record<string, unknown>, 'low_stock'),
      onHandUnits: num(stockRow as Record<string, unknown>, 'on_hand'),
    },
    api,
    systems: {
      redis: redisConfigured(),
      ai: aiConfigured(),
      blob: blobConfigured(),
      flutterwave: Boolean(flutterwaveSecret()),
    },
  };
}

export function parseAnalyticsPeriod(raw: string | null): PeriodKey {
  if (raw && isPeriodKey(raw)) return raw;
  return '30d';
}
