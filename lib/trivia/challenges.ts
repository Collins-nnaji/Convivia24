import type { RewardCategory } from '@/lib/loyalty/rewards';

/**
 * Ways to earn points on /trivia. Only challenges the platform can actually
 * verify are `live` — the rest render as upcoming rather than paying out for
 * something we cannot check.
 */

export type ChallengeStatus = 'live' | 'soon';

export type Challenge = {
  id: string;
  name: string;
  detail: string;
  points: number;
  /** lucide-react icon name, resolved on the client. */
  icon: string;
  status: ChallengeStatus;
  /** How the CTA behaves: start the week's round, or send them somewhere. */
  action: { kind: 'play' } | { kind: 'link'; href: string; label: string };
  /** 'weekly' resets every trivia week; 'once' pays out a single time. */
  cadence: 'weekly' | 'once';
  /**
   * Steps needed to finish. Progress is always counted from records the server
   * already holds — rounds passed, reviews written, orders paid — so a bar can
   * never show progress the account did not actually make.
   */
  target: number;
  /** Which real record the progress bar counts. */
  meter?: ChallengeMeter;
  badge?: 'featured' | 'new' | 'popular' | 'trending';
};

/** The countable signals behind a challenge's progress bar. */
export type ChallengeMeter =
  | 'trivia-rounds'
  | 'reviews-written'
  | 'orders-paid'
  | 'categories-bought';

export const CHALLENGES: Challenge[] = [
  {
    id: 'trivia',
    name: 'Trivia Challenge',
    detail: 'Answer this week’s brand round correctly',
    points: 250,
    icon: 'HelpCircle',
    status: 'live',
    action: { kind: 'play' },
    cadence: 'weekly',
    target: 1,
    meter: 'trivia-rounds',
    badge: 'featured',
  },
  {
    id: 'invite',
    name: 'Invite a Friend',
    detail: 'Invite friends to join Convivia24',
    points: 500,
    icon: 'Users',
    status: 'live',
    action: { kind: 'link', href: '/refer-and-earn', label: 'Invite' },
    cadence: 'once',
    target: 1,
    badge: 'popular',
  },
  {
    id: 'rate-drink',
    name: 'Rate a Drink',
    detail: 'Rate any drink you’ve tried',
    points: 100,
    icon: 'Star',
    status: 'soon',
    action: { kind: 'link', href: '/shop', label: 'Browse' },
    cadence: 'weekly',
    target: 1,
  },
  {
    id: 'scan-win',
    name: 'Scan & Win',
    detail: 'Scan a bottle or receipt',
    points: 150,
    icon: 'Camera',
    status: 'soon',
    action: { kind: 'link', href: '/shop', label: 'Browse' },
    cadence: 'weekly',
    target: 1,
  },
  {
    id: 'trivia-master',
    name: 'Trivia Master',
    detail: 'Pass five brand rounds',
    points: 1_000,
    icon: 'GraduationCap',
    status: 'live',
    action: { kind: 'play' },
    cadence: 'once',
    target: 5,
    meter: 'trivia-rounds',
    badge: 'trending',
  },
  {
    id: 'review-earn',
    name: 'Review & Earn',
    detail: 'Write a review for any bottle',
    points: 150,
    icon: 'MessageSquare',
    status: 'live',
    action: { kind: 'link', href: '/shop', label: 'Review' },
    cadence: 'once',
    target: 1,
    meter: 'reviews-written',
    badge: 'new',
  },
  {
    id: 'shop-earn',
    name: 'Shop & Earn',
    detail: 'Place your first order',
    points: 250,
    icon: 'ShoppingBag',
    status: 'live',
    action: { kind: 'link', href: '/shop', label: 'Shop' },
    cadence: 'once',
    target: 1,
    meter: 'orders-paid',
  },
  {
    id: 'discover-flavours',
    name: 'Discover New Flavours',
    detail: 'Order from three different categories',
    points: 200,
    icon: 'Wine',
    status: 'live',
    action: { kind: 'link', href: '/shop', label: 'Explore' },
    cadence: 'once',
    target: 3,
    meter: 'categories-bought',
  },
];

export function getChallenge(id: string): Challenge | undefined {
  return CHALLENGES.find((c) => c.id === id);
}

/**
 * The window a completion is scoped to. Weekly challenges reset with the trivia
 * week, so the key carries the week the round was live in.
 */
export function periodKey(challenge: Challenge, weekStart: string | null): string {
  if (challenge.cadence === 'once') return 'once';
  return weekStart || 'current';
}

/**
 * Teaser tiles on the Discover tab. Each one points at a rewards-shop category
 * and the "from" price is computed from that catalog, so the tiles cannot drift
 * out of step with what things actually cost.
 */
export type RewardTier = {
  id: string;
  name: string;
  detail: string;
  icon: string;
  category: RewardCategory;
  cta: string;
};

export const REWARD_TIERS: RewardTier[] = [
  {
    id: 'bottles',
    name: 'Bottles',
    detail: 'Delivered with your next order',
    icon: 'Wine',
    category: 'bottles',
    cta: 'Explore',
  },
  {
    id: 'shop-credit',
    name: 'Shop Credit',
    detail: 'Applied at checkout',
    icon: 'Wallet',
    category: 'credit',
    cta: 'Redeem',
  },
  {
    id: 'experiences',
    name: 'Partner Perks',
    detail: 'At partner venues',
    icon: 'Gift',
    category: 'experiences',
    cta: 'Explore',
  },
];
