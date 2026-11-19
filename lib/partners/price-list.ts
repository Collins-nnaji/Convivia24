import { DRINKS } from '@/lib/drinks/catalog';
import { wholesalePriceNgn } from '@/lib/partners/pricing';
import { requireSignedInOutlet } from '@/lib/partners/outlets';
import { adminIdentity } from '@/lib/admin';

/** Every bottle we wholesale, keyed by slug, at the partner rate. Server only. */
export function wholesalePriceMap(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const d of DRINKS) if (!d.sample) out[d.slug] = wholesalePriceNgn(d.priceNgn);
  return out;
}

export type PriceListAccess =
  | { ok: true; viewer: 'outlet' | 'admin' }
  | { ok: false; status: number; error: string };

/**
 * Who may read the wholesale price list: a signed-in outlet that Convivia24 has approved,
 * or anyone on the admin desk. Applicants still pending review do not see it.
 */
export async function priceListAccess(): Promise<PriceListAccess> {
  const admin = await adminIdentity().catch(() => null);
  if (admin) return { ok: true, viewer: 'admin' };
  const outlet = await requireSignedInOutlet();
  if ('error' in outlet) {
    return { ok: false, status: 401, error: 'Sign in to your wholesale portal to see the price list.' };
  }
  if (outlet.approvalStatus !== 'approved') {
    return { ok: false, status: 403, error: 'The price list opens once your wholesale account is approved.' };
  }
  return { ok: true, viewer: 'outlet' };
}
