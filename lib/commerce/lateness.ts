/**
 * How long an order may sit at each fulfilment stage before the desk flags it as late.
 * Times are measured from when the order reached its current stage (its last update).
 */
export const LATE_AFTER_MIN: Partial<Record<string, number>> = {
  paid: 60, // paid but nobody has started preparing it
  processing: 90, // being prepared for too long
  packed: 60, // packed and waiting for a rider
  out_for_delivery: 180, // on the road for three hours
  awaiting_payment: 24 * 60, // a bank transfer that never arrived
};

export type Lateness = { late: boolean; minutesOver: number; label: string | null };

function span(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  return h < 48 ? `${h}h` : `${Math.floor(h / 24)}d`;
}

export function lateness(
  order: { status: string; updatedAt: string; createdAt: string; etaAt?: string | null },
  now = Date.now()
): Lateness {
  const limit = LATE_AFTER_MIN[order.status];
  if (limit == null) return { late: false, minutesOver: 0, label: null };
  const since = new Date(order.updatedAt || order.createdAt).getTime();
  const waited = Math.max(0, Math.round((now - since) / 60000));
  // A promised arrival time that has passed by 30 minutes is late regardless of the stage limit.
  if (order.status === 'out_for_delivery' && order.etaAt) {
    const over = Math.round((now - new Date(order.etaAt).getTime()) / 60000);
    if (over > 30) return { late: true, minutesOver: over, label: `${span(over)} past ETA` };
  }
  if (waited <= limit) return { late: false, minutesOver: 0, label: null };
  return { late: true, minutesOver: waited - limit, label: `Waiting ${span(waited)}` };
}
