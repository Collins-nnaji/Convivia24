/**
 * Margin math for the sourcing desk.
 *
 * Pure and DB-free so it can be unit-tested and reused on the client. "Revenue" is what the customer
 * actually paid us (total, less anything refunded); every cost we know about is subtracted from it.
 */

export type OrderMarginInput = {
  /** What the customer was charged. */
  totalNgn: number;
  /** What the supplier charged us. `null` when the order has not been sourced yet. */
  supplierCostNgn?: number | null;
  /** Delivery we paid out. Not the fee we charged — that is already inside `totalNgn`. */
  deliveryCostNgn?: number | null;
  /** Referral commission owed on this order. */
  commissionNgn?: number | null;
  /** Anything refunded to the customer — comes straight off revenue. */
  refundedNgn?: number | null;
};

export type OrderMargin = {
  revenueNgn: number;
  costNgn: number;
  marginNgn: number;
  /** Margin as a share of revenue, one decimal place. 0 when there is no revenue. */
  marginPct: number;
  /** False until a supplier cost has been recorded — margin is a guess before then. */
  sourced: boolean;
};

function toAmount(value: number | null | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
}

export function orderMargin(input: OrderMarginInput): OrderMargin {
  const revenueNgn = Math.max(0, toAmount(input.totalNgn) - toAmount(input.refundedNgn));
  const sourced = input.supplierCostNgn != null && Number.isFinite(Number(input.supplierCostNgn));
  const costNgn =
    toAmount(input.supplierCostNgn) + toAmount(input.deliveryCostNgn) + toAmount(input.commissionNgn);
  const marginNgn = revenueNgn - costNgn;
  const marginPct = revenueNgn > 0 ? Math.round((marginNgn / revenueNgn) * 1000) / 10 : 0;
  return { revenueNgn, costNgn, marginNgn, marginPct, sourced };
}

export type MarginSummary = {
  orders: number;
  /** How many of those orders have a supplier cost recorded. */
  sourcedOrders: number;
  revenueNgn: number;
  supplierCostNgn: number;
  deliveryCostNgn: number;
  commissionNgn: number;
  marginNgn: number;
  marginPct: number;
  /** Average margin per sourced order — the number worth watching week to week. */
  avgMarginNgn: number;
};

/**
 * Roll up a set of orders. Unsourced orders still count toward revenue and order count, but are
 * excluded from `avgMarginNgn` so an un-costed backlog cannot flatter the average.
 */
export function marginSummary(rows: OrderMarginInput[]): MarginSummary {
  const summary: MarginSummary = {
    orders: rows.length,
    sourcedOrders: 0,
    revenueNgn: 0,
    supplierCostNgn: 0,
    deliveryCostNgn: 0,
    commissionNgn: 0,
    marginNgn: 0,
    marginPct: 0,
    avgMarginNgn: 0,
  };

  let sourcedMargin = 0;
  for (const row of rows) {
    const m = orderMargin(row);
    summary.revenueNgn += m.revenueNgn;
    summary.supplierCostNgn += toAmount(row.supplierCostNgn);
    summary.deliveryCostNgn += toAmount(row.deliveryCostNgn);
    summary.commissionNgn += toAmount(row.commissionNgn);
    summary.marginNgn += m.marginNgn;
    if (m.sourced) {
      summary.sourcedOrders += 1;
      sourcedMargin += m.marginNgn;
    }
  }

  summary.marginPct =
    summary.revenueNgn > 0 ? Math.round((summary.marginNgn / summary.revenueNgn) * 1000) / 10 : 0;
  summary.avgMarginNgn =
    summary.sourcedOrders > 0 ? Math.round(sourcedMargin / summary.sourcedOrders) : 0;

  return summary;
}
