import { DRINKS, formatNgn, getDrinkBySlug } from '@/lib/drinks/catalog';
import { LOYALTY_PERKS, type LoyaltyTierId } from '@/lib/loyalty/program';

/**
 * The rewards shop.
 *
 * Anything with a cash value is priced off one published rate so the catalog
 * cannot drift into offering ₦15,000 for less than ₦5,000 costs. The rate comes
 * from the perks already in `LOYALTY_PERKS` — ₦5,000 shop credit at 2,000
 * points — and everything money-valued is derived from it rather than typed in
 * by hand.
 */
export const NGN_PER_POINT = 2.5;

/** Points needed to redeem something worth `ngn`, rounded up to a clean 50. */
export function pointsForNgn(ngn: number): number {
  return Math.ceil(ngn / NGN_PER_POINT / 50) * 50;
}

export type RewardCategory = 'bottles' | 'experiences' | 'tickets' | 'credit' | 'merch';

export const REWARD_CATEGORIES: { id: RewardCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All rewards', icon: 'LayoutGrid' },
  { id: 'bottles', label: 'Bottles', icon: 'Wine' },
  { id: 'experiences', label: 'Experiences', icon: 'Sparkles' },
  { id: 'tickets', label: 'Event tickets', icon: 'Ticket' },
  { id: 'credit', label: 'Shop credit', icon: 'Wallet' },
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
  image?: string;
  /** Lowest tier that may redeem it — mirrors the perk gates in the programme. */
  minTier: LoyaltyTierId;
  badge?: 'hot' | 'popular' | 'new' | 'limited';
  /** Honest availability line. Nothing here claims a stock count we do not track. */
  availability: string;
};

/** Shop credit ladder, priced off the published rate. */
const CREDIT_VALUES = [5_000, 10_000, 20_000];

const CREDIT_REWARDS: Reward[] = CREDIT_VALUES.map((ngn, i) => ({
  id: `credit-${ngn}`,
  name: `${formatNgn(ngn)} shop credit`,
  detail: 'Applied at checkout on your next order.',
  category: 'credit',
  costPoints: pointsForNgn(ngn),
  valueNgn: ngn,
  minTier: i === 0 ? 'guest' : i === 1 ? 'regular' : 'resident',
  badge: i === 0 ? 'popular' : undefined,
  availability: 'Always available',
}));

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

/** The perks already in the programme, surfaced in the shop under their real costs. */
const PERK_REWARDS: Reward[] = LOYALTY_PERKS.filter((p) => !p.id.startsWith('shop-')).map((p) => ({
  id: `perk-${p.id}`,
  name: p.name,
  detail: p.detail,
  category: 'experiences',
  costPoints: p.cost,
  minTier: p.minTier,
  availability: 'At partner venues',
}));

const TICKET_REWARDS: Reward[] = [
  {
    id: 'ticket-event',
    name: 'Event ticket credit',
    detail: 'Covers the door on one listed Convivia24 night.',
    category: 'tickets',
    costPoints: pointsForNgn(10_000),
    valueNgn: 10_000,
    minTier: 'guest',
    badge: 'new',
    availability: 'On listed events',
  },
  {
    id: 'ticket-tasting',
    name: 'Tasting seat',
    detail: 'One seat at a hosted tasting or masterclass.',
    category: 'tickets',
    costPoints: pointsForNgn(15_000),
    valueNgn: 15_000,
    minTier: 'regular',
    availability: 'Subject to seats',
  },
];

const MERCH_REWARDS: Reward[] = [
  {
    id: 'merch-cap',
    name: 'Convivia24 cap',
    detail: 'Branded cap, one size.',
    category: 'merch',
    costPoints: pointsForNgn(8_000),
    valueNgn: 8_000,
    minTier: 'guest',
    availability: 'While stocked',
  },
  {
    id: 'merch-tee',
    name: 'Convivia24 T-shirt',
    detail: 'Branded tee, sizes S–XXL.',
    category: 'merch',
    costPoints: pointsForNgn(12_000),
    valueNgn: 12_000,
    minTier: 'guest',
    availability: 'While stocked',
  },
  {
    id: 'merch-glassware',
    name: 'Tasting glass set',
    detail: 'Two nosing glasses, boxed.',
    category: 'merch',
    costPoints: pointsForNgn(18_000),
    valueNgn: 18_000,
    minTier: 'regular',
    badge: 'limited',
    availability: 'While stocked',
  },
];

export const REWARDS: Reward[] = [
  ...CREDIT_REWARDS,
  ...BOTTLE_REWARDS,
  ...PERK_REWARDS,
  ...TICKET_REWARDS,
  ...MERCH_REWARDS,
];

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
