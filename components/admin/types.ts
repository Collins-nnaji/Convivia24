import type { OrderStatus } from '@/lib/commerce/status';

/** One row of /api/admin/orders GET. Shared by the ledger, sourcing and tracking desks. */
export type AdminOrder = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  status: OrderStatus;
  subtotalNgn: number;
  loyaltyDiscountNgn: number;
  giftCardDiscountNgn: number;
  totalNgn: number;
  addressLine1: string;
  addressLine2: string | null;
  area: string | null;
  city?: string | null;
  notes: string | null;
  courierName: string | null;
  riderPhone: string | null;
  etaAt: string | null;
  trackingNote: string | null;
  paymentProvider: string | null;
  paymentRef: string | null;
  refundRef: string | null;
  refundedNgn: number;
  supplierId: string | null;
  supplierName: string | null;
  supplierCostNgn: number | null;
  sourcedAt: string | null;
  sourcingNote: string | null;
  /** Supplier auto-picked from the delivery city at checkout. */
  routedSupplierName?: string | null;
  routedOutOfCity?: boolean;
  margin: { revenueNgn: number; costNgn: number; marginNgn: number; marginPct: number; sourced: boolean };
  createdAt: string;
  updatedAt: string;
  items: { slug?: string; name: string; qty: number; unitPriceNgn: number; imageUrl?: string | null }[];
};

export type AdminSummary = {
  ordersToFulfil: number;
  ordersUnsourced: number;
  lowStock: number;
  prizesUnclaimed: number;
  brandEnquiriesNew: number;
  partnersPending: number;
  commissionsOwedNgn: number;
  todayOrders: number;
  todayRevenueNgn: number;
  supplierChanges24h: number;
  bottleRequestsPending: number;
  contentPending: number;
  blobConfigured: boolean;
  aiConfigured: boolean;
};

export const EMPTY_SUMMARY: AdminSummary = {
  ordersToFulfil: 0,
  ordersUnsourced: 0,
  lowStock: 0,
  prizesUnclaimed: 0,
  brandEnquiriesNew: 0,
  partnersPending: 0,
  commissionsOwedNgn: 0,
  todayOrders: 0,
  todayRevenueNgn: 0,
  supplierChanges24h: 0,
  bottleRequestsPending: 0,
  contentPending: 0,
  blobConfigured: false,
  aiConfigured: false,
};

/** Shared formatting helpers for the desk. */
export function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

/** Reads `{ error }` off a failed response without throwing on an empty body. */
export async function readError(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => ({}));
  return (data && typeof data.error === 'string' && data.error) || fallback;
}
