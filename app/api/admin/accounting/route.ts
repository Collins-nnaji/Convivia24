import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import {
  booksAmount,
  buildBalanceSheet,
  buildProfitAndLoss,
  buildTrend,
  chartBuckets,
  chartWindow,
  comparisonRange,
  isPeriodKey,
  periodRange,
  trimQuietLead,
  type Grain,
  type MixRow,
  type OrderTotals,
  type PayoutRow,
  type PeriodKey,
} from '@/lib/accounting/statements';
import { pointsLiabilityNgn } from '@/lib/loyalty/program';
import sql, { apiErrorResponse } from '@/lib/db';
import { captureApiError } from '@/lib/sentry';

function num(row: Record<string, unknown>, key: string): number {
  return booksAmount(row[key]);
}

/** Paid, in-flight, delivered and refunded orders. Abandoned and cancelled checkouts never collected. */
async function orderTotals(from: string, to: string): Promise<OrderTotals> {
  const [row] = await sql`
    SELECT
      COUNT(*)::int AS order_count,
      COALESCE(SUM(subtotal_ngn), 0)::bigint AS gross_sales,
      COALESCE(SUM(loyalty_discount_ngn), 0)::bigint AS loyalty_discount,
      COALESCE(SUM(gift_card_discount_ngn), 0)::bigint AS gift_card_discount,
      COALESCE(SUM(COALESCE(total_ngn, subtotal_ngn)), 0)::bigint AS charged,
      COALESCE(SUM(refunded_ngn), 0)::bigint AS refunded,
      COALESCE(SUM(supplier_cost_ngn) FILTER (WHERE supplier_cost_ngn IS NOT NULL), 0)::bigint AS supplier_cost,
      COALESCE(SUM(routed_cost_ngn) FILTER (WHERE supplier_cost_ngn IS NULL AND routed_cost_ngn IS NOT NULL), 0)::bigint AS estimated_cost,
      COUNT(*) FILTER (WHERE supplier_cost_ngn IS NOT NULL)::int AS sourced,
      COUNT(*) FILTER (WHERE supplier_cost_ngn IS NULL)::int AS unsourced,
      COALESCE(SUM(COALESCE(total_ngn, subtotal_ngn)) FILTER (WHERE payment_provider = 'access_bank'), 0)::bigint AS bank_charged,
      COUNT(*) FILTER (WHERE payment_provider = 'access_bank')::int AS bank_orders
    FROM ritual_orders
    WHERE status NOT IN ('pending','awaiting_payment','cancelled')
      AND created_at >= ${from}::timestamptz
      AND created_at < ${to}::timestamptz
  `;
  const r = row ?? {};
  return {
    orderCount: num(r, 'order_count'),
    grossSalesNgn: num(r, 'gross_sales'),
    loyaltyDiscountNgn: num(r, 'loyalty_discount'),
    giftCardDiscountNgn: num(r, 'gift_card_discount'),
    chargedNgn: num(r, 'charged'),
    refundedNgn: num(r, 'refunded'),
    supplierCostNgn: num(r, 'supplier_cost'),
    estimatedCostNgn: num(r, 'estimated_cost'),
    sourcedOrders: num(r, 'sourced'),
    unsourcedOrders: num(r, 'unsourced'),
    bankChargedNgn: num(r, 'bank_charged'),
    bankOrderCount: num(r, 'bank_orders'),
  };
}

async function commissionTotals(from: string, to: string) {
  const [row] = await sql`
    SELECT
      COALESCE(SUM(commission_ngn) FILTER (
        WHERE status IN ('approved','paid')
          AND COALESCE(approved_at, created_at) >= ${from}::timestamptz
          AND COALESCE(approved_at, created_at) < ${to}::timestamptz
      ), 0)::bigint AS accrued,
      COALESCE(SUM(commission_ngn) FILTER (
        WHERE status = 'paid'
          AND paid_at >= ${from}::timestamptz
          AND paid_at < ${to}::timestamptz
      ), 0)::bigint AS paid
    FROM referral_attributions
  `;
  const r = row ?? {};
  return { accruedNgn: num(r, 'accrued'), paidNgn: num(r, 'paid') };
}

async function rewardActivity(from: string, to: string): Promise<{ costNgn: number; releasedNgn: number }> {
  const [row] = await sql`
    SELECT
      COALESCE(SUM(COALESCE(value_ngn, 0)), 0)::bigint AS cost,
      COALESCE(SUM(COALESCE(points_spent, 0)), 0)::bigint AS points
    FROM reward_redemptions
    WHERE status <> 'cancelled'
      AND created_at >= ${from}::timestamptz
      AND created_at < ${to}::timestamptz
  `;
  const points = num(row ?? {}, 'points');
  return { costNgn: num(row ?? {}, 'cost'), releasedNgn: pointsLiabilityNgn(points) };
}

/** Points credited on delivered orders in the window — the liability we just took on. */
async function loyaltyAccrual(from: string, to: string): Promise<{ accruedNgn: number; pointsAwarded: number }> {
  const [row] = await sql`
    SELECT COALESCE(SUM(loyalty_points_awarded), 0)::bigint AS points
    FROM ritual_orders
    WHERE status IN ('delivered', 'fulfilled')
      AND loyalty_points_awarded > 0
      AND updated_at >= ${from}::timestamptz
      AND updated_at < ${to}::timestamptz
  `;
  const pointsAwarded = num(row ?? {}, 'points');
  return { accruedNgn: pointsLiabilityNgn(pointsAwarded), pointsAwarded };
}

async function profit(from: string, to: string) {
  const [orders, commissions, rewards, loyalty] = await Promise.all([
    orderTotals(from, to),
    commissionTotals(from, to),
    rewardActivity(from, to),
    loyaltyAccrual(from, to),
  ]);
  return buildProfitAndLoss(orders, commissions, rewards, loyalty);
}

async function trend(grain: Grain, from: string, to: string) {
  const { buckets, capped } = chartBuckets(grain, from, to);
  // Accrued and paid land on different days, so they are bucketed separately and merged.
  const [sales, accrued, paid] = await Promise.all([
    sql`
      SELECT
        to_char(date_trunc(${grain}, created_at AT TIME ZONE 'Africa/Lagos'), 'YYYY-MM-DD') AS bucket,
        COUNT(*)::int AS orders,
        COALESCE(SUM(COALESCE(total_ngn, subtotal_ngn) - COALESCE(refunded_ngn, 0)), 0)::bigint AS net_revenue,
        COALESCE(SUM(COALESCE(supplier_cost_ngn, routed_cost_ngn, 0)), 0)::bigint AS cogs,
        COALESCE(SUM(refunded_ngn), 0)::bigint AS refunded,
        COALESCE(SUM(COALESCE(total_ngn, subtotal_ngn)) FILTER (WHERE payment_provider = 'access_bank'), 0)::bigint AS bank_charged
      FROM ritual_orders
      WHERE status NOT IN ('pending','awaiting_payment','cancelled')
        AND created_at >= ${from}::timestamptz
        AND created_at < ${to}::timestamptz
      GROUP BY 1
    `,
    sql`
      SELECT
        to_char(date_trunc(${grain}, COALESCE(approved_at, created_at) AT TIME ZONE 'Africa/Lagos'), 'YYYY-MM-DD') AS bucket,
        COALESCE(SUM(commission_ngn), 0)::bigint AS accrued
      FROM referral_attributions
      WHERE status IN ('approved','paid')
        AND COALESCE(approved_at, created_at) >= ${from}::timestamptz
        AND COALESCE(approved_at, created_at) < ${to}::timestamptz
      GROUP BY 1
    `,
    sql`
      SELECT
        to_char(date_trunc(${grain}, paid_at AT TIME ZONE 'Africa/Lagos'), 'YYYY-MM-DD') AS bucket,
        COALESCE(SUM(commission_ngn), 0)::bigint AS paid
      FROM referral_attributions
      WHERE status = 'paid'
        AND paid_at >= ${from}::timestamptz
        AND paid_at < ${to}::timestamptz
      GROUP BY 1
    `,
  ]);
  const cuts = new Map<string, { accruedNgn: number; paidNgn: number }>();
  for (const row of accrued) {
    cuts.set(String(row.bucket), { accruedNgn: num(row, 'accrued'), paidNgn: 0 });
  }
  for (const row of paid) {
    const key = String(row.bucket);
    const current = cuts.get(key) ?? { accruedNgn: 0, paidNgn: 0 };
    current.paidNgn = num(row, 'paid');
    cuts.set(key, current);
  }
  return {
    capped,
    points: trimQuietLead(
      buildTrend(
      buckets,
      sales.map((row) => ({
        key: String(row.bucket),
        orderCount: num(row, 'orders'),
        netRevenueNgn: num(row, 'net_revenue'),
        cogsNgn: num(row, 'cogs'),
        refundedNgn: num(row, 'refunded'),
        bankChargedNgn: num(row, 'bank_charged'),
      })),
      [...cuts.entries()].map(([key, value]) => ({ key, ...value }))
      )
    ),
  };
}

async function position() {
  const [row] = await sql`
    SELECT
      (SELECT COALESCE(SUM(COALESCE(total_ngn, subtotal_ngn) - COALESCE(refunded_ngn, 0)), 0)::bigint
         FROM ritual_orders
         WHERE status NOT IN ('pending','awaiting_payment','cancelled')) AS cash_collected,
      (SELECT COALESCE(SUM(COALESCE(total_ngn, subtotal_ngn)), 0)::bigint
         FROM ritual_orders WHERE status = 'awaiting_payment') AS receivables,
      (SELECT COUNT(*)::int FROM ritual_orders WHERE status = 'awaiting_payment') AS receivable_orders,
      (SELECT COALESCE(SUM(on_hand::bigint * cost_ngn::bigint) FILTER (WHERE cost_ngn IS NOT NULL), 0)::bigint
         FROM inventory WHERE active = true) AS inventory_value,
      (SELECT COALESCE(SUM(on_hand) FILTER (WHERE cost_ngn IS NOT NULL), 0)::int
         FROM inventory WHERE active = true) AS costed_units,
      (SELECT COALESCE(SUM(on_hand) FILTER (WHERE cost_ngn IS NULL AND track_stock), 0)::int
         FROM inventory WHERE active = true) AS uncosted_units,
      (SELECT COALESCE(SUM(commission_ngn) FILTER (WHERE status = 'approved'), 0)::bigint
         FROM referral_attributions) AS commissions_payable,
      (SELECT COALESCE(SUM(commission_ngn) FILTER (WHERE status = 'paid'), 0)::bigint
         FROM referral_attributions) AS commissions_paid,
      (SELECT COALESCE(SUM(value_ngn), 0)::bigint FROM gift_cards WHERE status = 'active') AS gift_cards,
      (SELECT COUNT(*)::int FROM gift_cards WHERE status = 'active') AS gift_card_count,
      (SELECT COALESCE(SUM(COALESCE(value_ngn, 0)), 0)::bigint
         FROM reward_redemptions WHERE status = 'issued') AS rewards_open,
      (SELECT COUNT(*)::int FROM reward_redemptions WHERE status = 'issued') AS rewards_open_count,
      (SELECT COALESCE(SUM(COALESCE(value_ngn, 0)), 0)::bigint
         FROM reward_redemptions WHERE status <> 'cancelled') AS rewards_life,
      (SELECT COALESCE(SUM(COALESCE(supplier_cost_ngn, 0)), 0)::bigint
         FROM ritual_orders
         WHERE status NOT IN ('pending','awaiting_payment','cancelled')) AS supplier_cost_life,
      (SELECT COALESCE(SUM(points), 0)::bigint FROM loyalty_members WHERE points > 0) AS loyalty_points,
      (SELECT COUNT(*)::int FROM loyalty_members WHERE points > 0) AS loyalty_members
  `;
  const r = row ?? {};
  const loyaltyPoints = num(r, 'loyalty_points');
  return buildBalanceSheet({
    cashCollectedNgn: num(r, 'cash_collected'),
    commissionsPaidLifetimeNgn: num(r, 'commissions_paid'),
    inventoryNgn: num(r, 'inventory_value'),
    costedUnits: num(r, 'costed_units'),
    uncostedUnits: num(r, 'uncosted_units'),
    receivablesNgn: num(r, 'receivables'),
    receivableOrders: num(r, 'receivable_orders'),
    commissionsPayableNgn: num(r, 'commissions_payable'),
    giftCardsNgn: num(r, 'gift_cards'),
    giftCardCount: num(r, 'gift_card_count'),
    rewardsOutstandingNgn: num(r, 'rewards_open'),
    rewardsOutstandingCount: num(r, 'rewards_open_count'),
    loyaltyPointsLiabilityNgn: pointsLiabilityNgn(loyaltyPoints),
    loyaltyPointsOutstanding: loyaltyPoints,
    loyaltyMemberCount: num(r, 'loyalty_members'),
    supplierCostLifetimeNgn: num(r, 'supplier_cost_life'),
    rewardsLifetimeNgn: num(r, 'rewards_life'),
  });
}

export async function GET(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const requested = req.nextUrl.searchParams.get('period') || '30d';
  if (!isPeriodKey(requested)) {
    return NextResponse.json({ error: 'Unknown period.' }, { status: 400 });
  }
  const periodKey: PeriodKey = requested;

  try {
    const now = new Date();
    const period = periodRange(periodKey, now);
    const prior = comparisonRange(periodKey, now);
    const window = chartWindow(periodKey, now);

    const [pnl, previous, series, balance, payoutRows, providerRows, supplierRows, wholesaleRows, issuedRows] =
      await Promise.all([
        profit(period.from, period.to),
        prior ? profit(prior.from, prior.to) : Promise.resolve(null),
        trend(window.grain, window.from, window.to),
        position(),
        sql`
          SELECT
            p.id,
            p.name,
            p.kind,
            COALESCE(SUM(a.commission_ngn) FILTER (
              WHERE a.status = 'paid'
                AND a.paid_at >= ${period.from}::timestamptz
                AND a.paid_at < ${period.to}::timestamptz
            ), 0)::bigint AS paid,
            COALESCE(SUM(a.commission_ngn) FILTER (WHERE a.status = 'approved'), 0)::bigint AS owed,
            COALESCE(SUM(a.order_total_ngn) FILTER (
              WHERE a.status IN ('approved','paid')
                AND COALESCE(a.approved_at, a.created_at) >= ${period.from}::timestamptz
                AND COALESCE(a.approved_at, a.created_at) < ${period.to}::timestamptz
            ), 0)::bigint AS referred
          FROM referral_partners p
          LEFT JOIN referral_attributions a ON a.partner_id = p.id
          GROUP BY p.id, p.name, p.kind
          ORDER BY paid DESC, owed DESC
        `,
        sql`
          SELECT
            COALESCE(NULLIF(payment_provider, ''), 'unspecified') AS provider,
            COUNT(*)::int AS orders,
            COALESCE(SUM(COALESCE(total_ngn, subtotal_ngn) - COALESCE(refunded_ngn, 0)), 0)::bigint AS net
          FROM ritual_orders
          WHERE status NOT IN ('pending','awaiting_payment','cancelled')
            AND created_at >= ${period.from}::timestamptz
            AND created_at < ${period.to}::timestamptz
          GROUP BY 1
          ORDER BY net DESC
        `,
        sql`
          SELECT
            COALESCE(s.name, 'Not assigned') AS name,
            COUNT(*)::int AS orders,
            COALESCE(SUM(COALESCE(o.total_ngn, o.subtotal_ngn) - COALESCE(o.refunded_ngn, 0)), 0)::bigint AS net,
            COALESCE(SUM(COALESCE(o.supplier_cost_ngn, o.routed_cost_ngn, 0)), 0)::bigint AS cost
          FROM ritual_orders o
          LEFT JOIN suppliers s ON s.id = o.supplier_id
          WHERE o.status NOT IN ('pending','awaiting_payment','cancelled')
            AND o.created_at >= ${period.from}::timestamptz
            AND o.created_at < ${period.to}::timestamptz
          GROUP BY 1
          ORDER BY net DESC
        `,
        sql`
          SELECT COUNT(*)::int AS orders, COALESCE(SUM(total_ngn), 0)::bigint AS total
          FROM partner_wholesale_orders
          WHERE created_at >= ${period.from}::timestamptz
            AND created_at < ${period.to}::timestamptz
        `,
        sql`
          SELECT COUNT(*)::int AS cards, COALESCE(SUM(value_ngn), 0)::bigint AS total
          FROM gift_cards
          WHERE status <> 'void'
            AND created_at >= ${period.from}::timestamptz
            AND created_at < ${period.to}::timestamptz
        `,
      ]);

    const payouts: PayoutRow[] = payoutRows
      .map((row) => ({
        id: String(row.id),
        name: String(row.name),
        kind: String(row.kind),
        paidNgn: num(row, 'paid'),
        owedNgn: num(row, 'owed'),
        referredNgn: num(row, 'referred'),
      }))
      .filter((row) => row.paidNgn > 0 || row.owedNgn > 0 || row.referredNgn > 0);

    const providers: MixRow[] = providerRows.map((row) => ({
      name: String(row.provider),
      orders: num(row, 'orders'),
      netNgn: num(row, 'net'),
    }));

    const suppliers: MixRow[] = supplierRows.map((row) => ({
      name: String(row.name),
      orders: num(row, 'orders'),
      netNgn: num(row, 'net'),
      costNgn: num(row, 'cost'),
    }));

    const wholesale = wholesaleRows[0] ?? {};
    const issued = issuedRows[0] ?? {};

    return NextResponse.json({
      period: { key: periodKey, ...period },
      comparisonLabel: prior?.label ?? null,
      pnl,
      previous,
      trend: series.points,
      trendGrain: window.grain,
      trendCapped: series.capped,
      balance,
      payouts,
      providers,
      suppliers,
      wholesaleOrders: num(wholesale, 'orders'),
      wholesaleNgn: num(wholesale, 'total'),
      giftCardsIssuedCount: num(issued, 'cards'),
      giftCardsIssuedNgn: num(issued, 'total'),
    });
  } catch (err) {
    captureApiError(err, { route: 'admin/accounting GET' });
    const { status, error } = apiErrorResponse(err, 'Unable to load the accounts.');
    return NextResponse.json({ error }, { status });
  }
}
