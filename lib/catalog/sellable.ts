import { getDrinkBySlug, type DrinkProduct } from '@/lib/drinks/catalog';
import { getPackageBySlug, packageAsProduct } from '@/lib/packages/catalog';

/**
 * Resolve any slug the customer can put in a cart — a shop bottle or a named event package.
 *
 * Packages live in `lib/packages/catalog.ts` and as untracked `inventory` rows, never in `DRINKS`,
 * so a bare `getDrinkBySlug()` silently drops them. Use this anywhere a cart line, order line, or
 * PDP resolves a slug. Pure and client-safe — no DB, no async.
 */
export function findSellable(slug: string): DrinkProduct | undefined {
  const drink = getDrinkBySlug(slug);
  if (drink) return drink;
  const pkg = getPackageBySlug(slug);
  return pkg ? packageAsProduct(pkg) : undefined;
}
