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
  totalHits: number;
  totalBlocked: number;
  routes: ApiRouteStat[];
  days: ApiDayStat[];
};

export type AnalyticsReport = {
  period: PeriodKey;
  range: { from: string; to: string; label: string };
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
