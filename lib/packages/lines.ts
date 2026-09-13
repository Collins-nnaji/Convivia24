import { getPackageBySlug } from './catalog';

export type Line = { slug: string; qty: number };

/**
 * Turns order lines into the bottles that actually leave a shelf. A party pack is not stock —
 * its components are — so every stock operation (reserve, route, release, fulfil) works on the
 * expanded list. Bottles that appear in several lines are merged.
 */
export function expandPackLines(lines: Line[]): Line[] {
  const merged = new Map<string, number>();
  for (const line of lines) {
    const pkg = getPackageBySlug(line.slug);
    if (pkg) {
      for (const c of pkg.components) merged.set(c.slug, (merged.get(c.slug) ?? 0) + c.qty * line.qty);
    } else {
      merged.set(line.slug, (merged.get(line.slug) ?? 0) + line.qty);
    }
  }
  return [...merged].map(([slug, qty]) => ({ slug, qty }));
}
