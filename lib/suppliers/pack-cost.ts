import { getPackageBySlug } from '@/lib/packages/catalog';

/**
 * A party pack's cost is the sum of its bottles' costs — never a number someone types. If any
 * bottle has no cost from the source being asked, the pack has no cost from it either: a partial
 * sum would read as a real quote and win routing it should not.
 */
export function isDerivedCostSku(slug: string): boolean {
  return Boolean(getPackageBySlug(slug));
}

export function packComponents(slug: string): { slug: string; qty: number }[] {
  return getPackageBySlug(slug)?.components ?? [];
}

export function derivedPackCost(slug: string, costOf: (componentSlug: string) => number | null | undefined): number | null {
  const parts = packComponents(slug);
  if (parts.length === 0) return null;
  let total = 0;
  for (const c of parts) {
    const unit = costOf(c.slug);
    if (unit == null || !Number.isFinite(unit)) return null;
    total += unit * c.qty;
  }
  return Math.round(total);
}
