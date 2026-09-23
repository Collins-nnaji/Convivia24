/**
 * Convivia merch tracked in inventory and redeemable in the rewards shop.
 * Kept out of the drinks shop catalog — these are fulfilment SKUs, not bottles.
 */
export type MerchSku = {
  slug: string;
  rewardId: string;
  name: string;
  detail: string;
  /** Shelf / redemption value. */
  valueNgn: number;
  /** Rough landed cost for the books. */
  costNgn: number;
  volume: string;
  image: string;
  /** Starting on-hand when seeding. */
  onHand: number;
  lowStockThreshold: number;
};

export const MERCH_SKUS: MerchSku[] = [
  {
    slug: 'convivia-cap',
    rewardId: 'merch-cap',
    name: 'Convivia24 cap',
    detail: 'Branded cap, one size.',
    valueNgn: 8_000,
    costNgn: 3_200,
    volume: '1 unit',
    image: '/Convivia cap.png',
    onHand: 48,
    lowStockThreshold: 8,
  },
  {
    slug: 'convivia-t-shirt',
    rewardId: 'merch-tee',
    name: 'Convivia24 T-shirt',
    detail: 'Branded tee, sizes S–XXL.',
    valueNgn: 12_000,
    costNgn: 5_000,
    volume: '1 unit',
    image: '/Convivia t shirt.png',
    onHand: 36,
    lowStockThreshold: 6,
  },
  {
    slug: 'convivia-cups-50',
    rewardId: 'merch-cups',
    name: 'Convivia24 paper cups',
    detail: 'Pack of 50 branded paper cups.',
    valueNgn: 6_000,
    costNgn: 2_400,
    volume: 'Pack of 50',
    image: '/Convivia cups.png',
    onHand: 40,
    lowStockThreshold: 6,
  },
];

export function merchByRewardId(rewardId: string): MerchSku | undefined {
  return MERCH_SKUS.find((m) => m.rewardId === rewardId);
}
