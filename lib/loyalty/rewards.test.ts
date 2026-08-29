import { describe, expect, it } from 'vitest';
import {
  NGN_PER_POINT,
  REWARDS,
  getReward,
  pointsForNgn,
  rewardsIn,
  sortRewards,
} from './rewards';
import { LOYALTY_PERKS, LOYALTY_TIERS } from './program';
import { getDrinkBySlug } from '@/lib/drinks/catalog';

describe('points pricing', () => {
  it('prices money-valued rewards off the rate the programme already publishes', () => {
    const shopCredit = LOYALTY_PERKS.find((p) => p.id === 'shop-5k')!;
    expect(pointsForNgn(5_000)).toBe(shopCredit.cost);
    expect(5_000 / shopCredit.cost).toBe(NGN_PER_POINT);
  });

  it('rounds up to a clean 50 so no reward is priced in odd points', () => {
    for (const reward of REWARDS) {
      expect(reward.costPoints % 50).toBe(0);
      expect(reward.costPoints).toBeGreaterThan(0);
    }
  });

  it('never charges less than the naira value is worth', () => {
    for (const reward of REWARDS) {
      if (reward.valueNgn == null) continue;
      expect(reward.costPoints * NGN_PER_POINT).toBeGreaterThanOrEqual(reward.valueNgn);
    }
  });
});

describe('rewards catalog', () => {
  it('has unique ids and resolves them', () => {
    const seen = new Set<string>();
    for (const reward of REWARDS) {
      expect(seen.has(reward.id)).toBe(false);
      seen.add(reward.id);
      expect(getReward(reward.id)).toBe(reward);
    }
    expect(getReward('not-a-reward')).toBeUndefined();
  });

  it('gates every reward behind a tier the programme actually defines', () => {
    const tiers = new Set(LOYALTY_TIERS.map((t) => t.id));
    for (const reward of REWARDS) expect(tiers.has(reward.minTier)).toBe(true);
  });

  it('only offers bottles that are real, stocked SKUs with a photo', () => {
    const bottles = rewardsIn('bottles');
    expect(bottles.length).toBeGreaterThan(0);
    for (const reward of bottles) {
      const drink = getDrinkBySlug(reward.drinkSlug!);
      expect(drink).toBeDefined();
      expect(drink!.image).toBeTruthy();
      expect(reward.valueNgn).toBe(drink!.priceNgn);
    }
  });

  it('filters by category without losing anything', () => {
    const all = rewardsIn('all');
    expect(all).toHaveLength(REWARDS.length);
    const categories = new Set(REWARDS.map((r) => r.category));
    const summed = [...categories].reduce((n, c) => n + rewardsIn(c).length, 0);
    expect(summed).toBe(REWARDS.length);
  });
});

describe('sortRewards', () => {
  it('leads with what the member can afford, then cheapest first', () => {
    const budget = 3_000;
    const sorted = sortRewards(REWARDS, 'recommended', budget);
    const firstUnaffordable = sorted.findIndex((r) => r.costPoints > budget);
    const lastAffordable = sorted.map((r) => r.costPoints <= budget).lastIndexOf(true);
    if (firstUnaffordable >= 0) expect(lastAffordable).toBeLessThan(firstUnaffordable);
  });

  it('sorts by points in both directions without dropping rewards', () => {
    const asc = sortRewards(REWARDS, 'points-asc', 0);
    const desc = sortRewards(REWARDS, 'points-desc', 0);
    expect(asc).toHaveLength(REWARDS.length);
    expect(desc).toHaveLength(REWARDS.length);
    expect(asc[0].costPoints).toBeLessThanOrEqual(asc[asc.length - 1].costPoints);
    expect(desc[0].costPoints).toBeGreaterThanOrEqual(desc[desc.length - 1].costPoints);
  });

  it('does not mutate the list it is given', () => {
    const before = [...REWARDS];
    sortRewards(REWARDS, 'points-desc', 0);
    expect(REWARDS).toEqual(before);
  });
});
