import { cookies } from 'next/headers';
import { normaliseCode } from './codes';

export const REFERRAL_COOKIE = 'c24_ref';

/** Thirty days — long enough for an event to be planned and ordered. */
export const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

/**
 * The referral code carried by the current request, if any.
 *
 * Not signed: it is a marketing attribution, not a permission. The worst a forged value can do is
 * credit a partner who did not earn it, and every attribution is reviewed before payout — whereas
 * signing would mean the code could not be set from a plain link.
 */
export async function readReferralCookie(): Promise<string> {
  try {
    const jar = await cookies();
    return normaliseCode(jar.get(REFERRAL_COOKIE)?.value || '');
  } catch {
    return '';
  }
}

export async function clearReferralCookie(): Promise<void> {
  try {
    const jar = await cookies();
    jar.delete(REFERRAL_COOKIE);
  } catch {
    /* not in a mutable request scope */
  }
}
