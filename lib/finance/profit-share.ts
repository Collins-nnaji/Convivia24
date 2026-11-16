/**
 * Partner profit share — pure, so the desk preview and the monthly close use one rule.
 *
 * Net profit (already after supplier costs, fees, commissions, loyalty and manual expenses) is
 * split in two: RETAIN_PCT always stays in the business as a buffer, and the rest is shared in
 * equal parts between the partners. Naira that do not divide evenly stay with the business, so
 * the shares never add up to more than the distributable amount. A loss shares nothing.
 */

export const RETAIN_PCT = 40;

/** Matches the CHECK on business_expenses.category (lib/db/finance-ledger.sql). */
export const EXPENSE_CATEGORIES = [
  'delivery', 'marketing', 'salaries', 'rent', 'software', 'logistics', 'packaging', 'equipment', 'fees', 'tax', 'other',
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export type Partner = { key: string; name: string };

export type ProfitShare = {
  netProfitNgn: number;
  retainPct: number;
  retainedNgn: number;
  distributableNgn: number;
  /** Each partner's percentage of net profit. */
  partnerPct: number;
  shares: { key: string; name: string; amountNgn: number }[];
};

export function splitProfit(netProfitNgn: number, partners: Partner[], retainPct = RETAIN_PCT): ProfitShare {
  const pct = Math.min(100, Math.max(0, retainPct));
  const profit = Math.max(0, Math.floor(netProfitNgn));
  const pool = partners.length > 0 ? Math.floor((profit * (100 - pct)) / 100) : 0;
  const each = partners.length > 0 ? Math.floor(pool / partners.length) : 0;
  const shared = each * partners.length;
  return {
    netProfitNgn: Math.floor(netProfitNgn),
    retainPct: pct,
    retainedNgn: profit - shared,
    distributableNgn: shared,
    partnerPct: partners.length > 0 ? Math.round(((100 - pct) / partners.length) * 100) / 100 : 0,
    shares: partners.map((p) => ({ key: p.key, name: p.name, amountNgn: each })),
  };
}

/** 'YYYY-MM' → the month's [from, to) in Lagos time, as ISO strings. */
export function monthRange(period: string): { from: string; to: string; label: string } {
  const m = /^(\d{4})-(\d{2})$/.exec(period);
  if (!m) throw new Error('Period must be YYYY-MM.');
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (month < 1 || month > 12) throw new Error('Period must be YYYY-MM.');
  // Lagos is UTC+1 all year (no DST).
  const from = new Date(Date.UTC(year, month - 1, 1, -1));
  const to = new Date(Date.UTC(year, month, 1, -1));
  const label = new Date(Date.UTC(year, month - 1, 15)).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return { from: from.toISOString(), to: to.toISOString(), label };
}

/** The current month in Lagos, 'YYYY-MM'. */
export function currentPeriod(now = new Date()): string {
  const lagos = new Date(now.getTime() + 60 * 60 * 1000);
  return `${lagos.getUTCFullYear()}-${String(lagos.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function shiftPeriod(period: string, months: number): string {
  const [y, m] = period.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + months, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** A readable name from a partner email: "ada.obi@x.com" → "Ada Obi". */
export function partnerName(email: string): string {
  const local = email.split('@')[0] || email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
