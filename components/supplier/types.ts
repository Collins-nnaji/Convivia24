import type { ShelfRow, SupplierOrder } from '@/lib/suppliers/stock';
import type { SupplierAuditEntry } from '@/lib/suppliers/audit';
import type { OrderStatus } from '@/lib/commerce/status';

export type { ShelfRow, SupplierOrder, SupplierAuditEntry };

export type PortalSupplier = {
  id: string;
  slug: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  city: string;
  areas: string[];
  categories: string[];
  sameDay: boolean;
  notes: string | null;
};

export type PortalData = {
  supplier: PortalSupplier;
  via: 'key' | 'account';
  shelf: ShelfRow[];
  orders: SupplierOrder[];
  activity: SupplierAuditEntry[];
  statuses: OrderStatus[];
};

export async function readError(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => ({}));
  return (data && typeof data.error === 'string' && data.error) || fallback;
}

export const OPEN_STATUSES = new Set(['paid', 'processing', 'packed', 'out_for_delivery']);
