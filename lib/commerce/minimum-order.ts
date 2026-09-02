import { getDrinkBySlug } from '@/lib/drinks/catalog';
import { getPackageBySlug, bottleCount } from '@/lib/packages/catalog';

/**
 * Minimum order size, in bottles.
 *
 * Set to 1 so any single bottle (or package) can checkout. Counted across the whole cart
 * rather than per line — a customer may mix SKUs freely. Sample SKUs do not count.
 */
export const MIN_ORDER_BOTTLES = 1;

export type CountableLine = { slug: string; qty: number };

/**
 * Bottles a single cart line represents.
 *
 * An event package is one line but many bottles, so it counts as its full contents — any package
 * clears the minimum on its own, which is the honest reading of what the customer is buying.
 *
 * Sample SKUs count for nothing. The cart auto-injects the ₦500 sample bottle, and letting it
 * count would quietly make the real minimum five. The party planner already skips samples for
 * the same reason.
 */
export function bottleUnitsFor(slug: string, qty: number): number {
  const units = Math.max(0, Math.floor(Number(qty) || 0));
  if (!units) return 0;
  if (getDrinkBySlug(slug)?.sample) return 0;
  const pkg = getPackageBySlug(slug);
  return pkg ? bottleCount(pkg) * units : units;
}

export function orderBottleCount(lines: CountableLine[]): number {
  if (!Array.isArray(lines)) return 0;
  return lines.reduce((n, l) => n + bottleUnitsFor(l?.slug, l?.qty), 0);
}

export function meetsMinimum(lines: CountableLine[]): boolean {
  return orderBottleCount(lines) >= MIN_ORDER_BOTTLES;
}

/** How many more bottles are needed. Zero once the minimum is met. */
export function bottlesShort(lines: CountableLine[]): number {
  return Math.max(0, MIN_ORDER_BOTTLES - orderBottleCount(lines));
}

/** Customer-facing reason the order cannot proceed, or null when it can. */
export function minimumOrderError(lines: CountableLine[]): string | null {
  if (!Array.isArray(lines) || lines.length === 0) return 'Your cart is empty.';
  const short = bottlesShort(lines);
  if (!short) return null;
  const have = orderBottleCount(lines);
  return `Minimum order is ${MIN_ORDER_BOTTLES} bottles. You have ${have} — add ${short} more.`;
}
