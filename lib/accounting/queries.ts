/**
 * The profit-and-loss queries, shared by the Accounting statements and the Finance desk
 * (profit share, expenses, payouts) so both always report the same net profit.
 */
import sql from '@/lib/db';
import { booksAmount, buildProfitAndLoss, type OrderTotals } from '@/lib/accounting/statements';
import { pointsLiabilityNgn } from '@/lib/loyalty/program';

function num(row: Record<string, unknown>, key: string): number {
  return booksAmount(row[key]);
}

/** Paid, in-flight, delivered and refunded orders. Abandoned and cancelled checkouts never collected. */
export async function orderTotals(from: string, to: string): Promise<OrderTotals> {
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
      COUNT(*) FILTER (WHERE payment_provider = 'access_bank')::int AS bank_orders,
      COALESCE(SUM(courier_cost_ngn), 0)::bigint AS delivery_cost
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
    deliveryCostNgn: num(r, 'delivery_cost'),
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

/** Manual operating expenses (rent, salaries, marketing…) booked in the window, voids excluded. */
export async function expenseTotal(from: string, to: string): Promise<number> {
  try {
    const [row] = await sql`
      SELECT COALESCE(SUM(amount_ngn), 0)::bigint AS total
      FROM business_expenses
      WHERE voided_at IS NULL
        AND spent_on >= (${from}::timestamptz AT TIME ZONE 'Africa/Lagos')::date
        AND spent_on < (${to}::timestamptz AT TIME ZONE 'Africa/Lagos')::date
    `;
    return num(row ?? {}, 'total');
  } catch {
    // Before the finance-ledger migration runs the table is absent; books still close.
    return 0;
  }
}

export async function profit(from: string, to: string) {
  const [orders, commissions, rewards, loyalty, expensesNgn] = await Promise.all([
    orderTotals(from, to),
    commissionTotals(from, to),
    rewardActivity(from, to),
    loyaltyAccrual(from, to),
    expenseTotal(from, to),
  ]);
  return buildProfitAndLoss(orders, commissions, rewards, loyalty, { expensesNgn });
}

