import type { PeriodKey } from '@/lib/accounting/statements';

export type ApiRouteStat = {
  route: string;
  hits: number;
  blocked: number;
};

export type ApiDayStat = {
  day: string;
  hits: number;
  blocked: number;
};

export type ApiUsageReport = {
  configured: boolean;
  error?: string;
  totalHits: number;
  totalBlocked: number;
  routes: ApiRouteStat[];
  days: ApiDayStat[];
};

export type AnalyticsReport = {
  period: PeriodKey;
  range: { from: string; to: string; label: string };
  /** The same totals for the period before, for "vs previous" deltas. Null for all-time. */
  previous?: { label: string; orders: number; revenueNgn: number; aovNgn: number; refundedNgn: number } | null;
  /** Profit after every cost (same figure as Accounts). Null if it could not be worked out. */
  profit?: { grossProfitNgn: number; netProfitNgn: number; netMarginPct: number; prevNetProfitNgn: number | null } | null;
  commerce: {
    orders: number;
    revenueNgn: number;
    aovNgn: number;
    refundedNgn: number;
    byStatus: { status: string; count: number }[];
    trend: { day: string; orders: number; revenueNgn: number }[];
    topSkus: { sku: string; name: string; qty: number; revenueNgn: number }[];
  };
  engagement: {
    triviaEntries: number;
    triviaWins: number;
    brandEnquiries: number;
    restockAlerts: number;
    productReviews: number;
  };
  loyalty: {
    members: number;
    pointsOutstanding: number;
    pointsLiabilityNgn: number;
    pointsAwardedInPeriod: number;
  };
  inventory: {
    activeSkus: number;
    lowStock: number;
    onHandUnits: number;
  };
  api: ApiUsageReport;
  systems: {
    redis: boolean;
    ai: boolean;
    blob: boolean;
    flutterwave: boolean;
  };
};
