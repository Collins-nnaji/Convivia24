import sql from '@/lib/db';
import { releaseStockForOrder, fulfillStockForOrder, type StockLine } from '@/lib/inventory';
import { releaseGiftCard } from '@/lib/commerce/gift-cards';

async function orderLines(orderId: string): Promise<StockLine[]> {
  const rows = await sql`SELECT kit_slug AS slug, qty FROM ritual_order_items WHERE order_id = ${orderId}`;
  return rows.map((r) => ({ slug: String(r.slug), qty: Number(r.qty) }));
}

/** Order cancelled or refunded — give the reserved stock and any gift card back. */
export async function releaseOrderResources(orderId: string): Promise<void> {
  const lines = await orderLines(orderId);
  if (lines.length > 0) await releaseStockForOrder(lines, orderId);
  await releaseGiftCard(orderId);
}

/** Order actually delivered — consume the reserved stock for good, once. */
export async function fulfillOrderStock(orderId: string): Promise<void> {
  const [order] = await sql`SELECT stock_consumed FROM ritual_orders WHERE id = ${orderId} LIMIT 1`;
  if (!order || order.stock_consumed) return;
  const lines = await orderLines(orderId);
  if (lines.length > 0) await fulfillStockForOrder(lines, orderId);
  await sql`UPDATE ritual_orders SET stock_consumed = true WHERE id = ${orderId}`;
}
