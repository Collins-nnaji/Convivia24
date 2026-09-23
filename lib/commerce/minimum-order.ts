import { findSellable } from '@/lib/catalog/sellable';

/**
 * Per-SKU checkout floors.
 *
 * Expensive bottles stay at 1. Cheap cocktails / RTDs often need 3+ so a
 * delivery run still makes sense. Admin can override via inventory.min_order_qty;
 * the catalog value is the default when stock has never been edited.
 */

export type CountableLine = { slug: string; qty: number; name?: string };

/** Catalog default for a slug (packages and unknown SKUs → 1). */
export function catalogMinOrderQty(slug: string): number {
  const product = findSellable(slug);
  const raw = product?.minOrderQty ?? 1;
  return Math.max(1, Math.min(24, Math.floor(Number(raw) || 1)));
}

/** Clamp a requested qty into [min, 24]. */
export function clampOrderQty(slug: string, qty: number, min = catalogMinOrderQty(slug)): number {
  const units = Math.floor(Number(qty) || 0);
  if (units <= 0) return 0;
  return Math.max(min, Math.min(24, units));
}

/**
 * Customer-facing reason the cart cannot proceed, or null when every line
 * meets its own minimum. Empty cart is called out separately.
 */
export function minimumOrderError(lines: CountableLine[]): string | null {
  if (!Array.isArray(lines) || lines.length === 0) return 'Your cart is empty.';
  for (const line of lines) {
    if (!line?.slug) continue;
    const min = catalogMinOrderQty(line.slug);
    const qty = Math.max(0, Math.floor(Number(line.qty) || 0));
    if (qty < min) {
      const name = line.name || findSellable(line.slug)?.name || line.slug;
      return `${name}: minimum order is ${min}. You have ${qty} — add ${min - qty} more.`;
    }
  }
  return null;
}

/** True when every line clears its own floor (and the cart is not empty). */
export function meetsMinimum(lines: CountableLine[]): boolean {
  return minimumOrderError(lines) === null;
}

/** How many more units a single line needs. Zero once met. */
export function lineShort(slug: string, qty: number): number {
  return Math.max(0, catalogMinOrderQty(slug) - Math.max(0, Math.floor(Number(qty) || 0)));
}
