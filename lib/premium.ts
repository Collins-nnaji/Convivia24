/**
 * Temporary “everything free” switch — unlimited matches, confirmed reservations, full profile perks.
 *
 * - Server routes read CONVIVIA_EVERYTHING_FREE from .env / hosting.
 * - Client components only receive NEXT_PUBLIC_* (set both to 1 so UI matches API).
 */
export function everythingFree(): boolean {
  const v =
    process.env.CONVIVIA_EVERYTHING_FREE ||
    process.env.NEXT_PUBLIC_CONVIVIA_EVERYTHING_FREE;
  return v === '1' || v === 'true';
}

export function isPremiumUser(user: {
  tier?: string | null;
  subscription_status?: string | null;
  premium_until?: string | Date | null;
}): boolean {
  if (everythingFree()) return true;
  if (user.tier === 'black') return true;
  if (user.subscription_status === 'black' || user.subscription_status === 'black_trial') return true;
  if (user.premium_until) {
    const until = new Date(user.premium_until as string).getTime();
    if (until > Date.now()) return true;
  }
  return false;
}
