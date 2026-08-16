export type LoyaltyTierId = 'guest' | 'regular' | 'resident' | 'patron';

export type LoyaltyTier = {
  id: LoyaltyTierId;
  name: string;
  minPoints: number;
  shopDiscountPct: number;
  blurb: string;
};

export const LOYALTY_TIERS: LoyaltyTier[] = [
  { id: 'guest', name: 'Guest', minPoints: 0, shopDiscountPct: 0, blurb: 'Earn on every drop, RSVP, and review.' },
  { id: 'regular', name: 'Regular', minPoints: 2500, shopDiscountPct: 5, blurb: '5% off shop · venue card perks unlock.' },
  { id: 'resident', name: 'Resident', minPoints: 8000, shopDiscountPct: 10, blurb: '10% off shop · skip the line at partners.' },
  { id: 'patron', name: 'Patron', minPoints: 20000, shopDiscountPct: 15, blurb: '15% off shop · table credit at partner rooms.' },
];

export type LoyaltyPerk = {
  id: string;
  name: string;
  cost: number;
  detail: string;
  minTier: LoyaltyTierId;
};

export const LOYALTY_PERKS: LoyaltyPerk[] = [
  { id: 'skip-line', name: 'Skip the line', cost: 800, detail: 'Door credit at partner clubs this week.', minTier: 'regular' },
  { id: 'mixer-flight', name: 'Mixer flight', cost: 1200, detail: 'A complimentary mixer flight at Terrace 14 or Lumen.', minTier: 'regular' },
  { id: 'shop-5k', name: '₦5,000 shop credit', cost: 2000, detail: 'Applied at checkout on your next drop.', minTier: 'guest' },
  { id: 'shop-15k', name: '₦15,000 shop credit', cost: 5500, detail: 'Applied at checkout on your next drop.', minTier: 'resident' },
  { id: 'table-credit', name: 'Table credit', cost: 8000, detail: '₦20,000 booth credit at a partner venue.', minTier: 'patron' },
];

export const POINTS_PER_NAIRA = 1 / 100; // 1 pt per ₦100 spent
export const POINTS_RSVP = 200;
export const POINTS_REVIEW = 150;
export const POINTS_CHECKIN = 100;

export function tierForPoints(points: number): LoyaltyTier {
  let current = LOYALTY_TIERS[0];
  for (const t of LOYALTY_TIERS) {
    if (points >= t.minPoints) current = t;
  }
  return current;
}

export function nextTier(points: number): LoyaltyTier | null {
  return LOYALTY_TIERS.find((t) => t.minPoints > points) || null;
}

export function shopDiscountPct(points: number): number {
  return tierForPoints(points).shopDiscountPct;
}

export function pointsFromSpend(ngn: number): number {
  return Math.floor(ngn * POINTS_PER_NAIRA);
}
