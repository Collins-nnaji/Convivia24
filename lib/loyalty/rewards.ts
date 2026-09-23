import { DRINKS, getDrinkBySlug } from '@/lib/drinks/catalog';
import { MERCH_SKUS } from '@/lib/loyalty/merch';
import { NGN_PER_POINT, type LoyaltyTierId } from '@/lib/loyalty/program';

/**
 * The rewards shop — bottles and merch only.
 *
 * Shop credit lives at checkout as the tier discount, not as a redeemable here.
 * Money-valued items are priced so points × NGN_PER_POINT never undercuts the
 * naira value on the card.
 */
export { NGN_PER_POINT };

/** Points needed to redeem something worth `ngn`, rounded up to a clean 50. */
export function pointsForNgn(ngn: number): number {
  return Math.ceil(ngn / NGN_PER_POINT / 50) * 50;
}

export type RewardCategory = 'bottles' | 'merch';

export const REWARD_CATEGORIES: { id: RewardCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All rewards', icon: 'LayoutGrid' },
  { id: 'bottles', label: 'Bottles', icon: 'Wine' },
  { id: 'merch', label: 'Merchandise', icon: 'Gift' },
];

export type Reward = {
  id: string;
  name: string;
  detail: string;
  category: RewardCategory;
  costPoints: number;
  /** What the member gets, in naira, where the reward converts to money. */
  valueNgn?: number;
  /** Bottle rewards point at a real SKU so the shop image and name stay in sync. */
  drinkSlug?: string;
  /** Merch rewards point at an inventory row for stock tracking. */
  inventorySlug?: string;
  image?: string;
  /** Lowest tier that may redeem it — mirrors the perk gates in the programme. */
  minTier: LoyaltyTierId;
  badge?: 'hot' | 'popular' | 'new' | 'limited';
  /** Honest availability line. Nothing here claims a stock count we do not track. */
  availability: string;
};

/**
 * Bottle rewards are drawn from the real shop catalog and capped at a price the
 * points economy can actually reach — a ₦450,000 bottle would cost 180,000
 * points, which no tier in the programme is built for. Only SKUs we hold a
 * photo for make the cut, so no reward card ships as an empty frame.
 */
const MAX_BOTTLE_REWARD_NGN = 60_000;

const BOTTLE_REWARDS: Reward[] = DRINKS.filter(
  (d) => !d.sample && !d.partyPack && Boolean(d.image) && d.priceNgn <= MAX_BOTTLE_REWARD_NGN
)
  .sort((a, b) => a.priceNgn - b.priceNgn)
  .slice(0, 8)
  .map((d) => ({
    id: `bottle-${d.slug}`,
    name: d.name,
    detail: `${d.volume} · delivered with your next order`,
    category: 'bottles' as const,
    costPoints: pointsForNgn(d.priceNgn),
    valueNgn: d.priceNgn,
    drinkSlug: d.slug,
    image: d.image,
    minTier: d.priceNgn > 30_000 ? ('regular' as const) : ('guest' as const),
    availability: 'While stocked',
  }));

const MERCH_REWARDS: Reward[] = MERCH_SKUS.map((m) => ({
  id: m.rewardId,
  name: m.name,
  detail: m.detail,
  category: 'merch' as const,
  costPoints: pointsForNgn(m.valueNgn),
  valueNgn: m.valueNgn,
  inventorySlug: m.slug,
  image: m.image,
  minTier: 'guest' as const,
  badge: 'new' as const,
  availability: 'While stocked',
}));

export const REWARDS: Reward[] = [...BOTTLE_REWARDS, ...MERCH_REWARDS];

export function getReward(id: string): Reward | undefined {
  return REWARDS.find((r) => r.id === id);
}

export function rewardsIn(category: RewardCategory | 'all'): Reward[] {
  return category === 'all' ? REWARDS : REWARDS.filter((r) => r.category === category);
}

/** The image to show for a reward — bottles borrow their SKU's photo. */
export function rewardImage(reward: Reward): string | undefined {
  if (reward.image) return reward.image;
  return reward.drinkSlug ? getDrinkBySlug(reward.drinkSlug)?.image : undefined;
}

export type RewardSort = 'recommended' | 'points-asc' | 'points-desc';

export function sortRewards(rewards: Reward[], sort: RewardSort, points: number): Reward[] {
  const list = [...rewards];
  if (sort === 'points-asc') return list.sort((a, b) => a.costPoints - b.costPoints);
  if (sort === 'points-desc') return list.sort((a, b) => b.costPoints - a.costPoints);
  // Recommended leads with what the member can actually afford right now.
  return list.sort((a, b) => {
    const affordable = Number(b.costPoints <= points) - Number(a.costPoints <= points);
    return affordable !== 0 ? affordable : a.costPoints - b.costPoints;
  });
}
