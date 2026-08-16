import { DRINKS, formatNgn } from '@/lib/drinks/catalog';
import { issueGiftCard, listGiftCardsIssuedBy } from '@/lib/loyalty/gift-cards';

const KEY = 'convivia_partner';

export const WHOLESALE_OFF_PCT = 22;

export function wholesalePriceNgn(retailNgn: number): number {
  return Math.round((retailNgn * (1 - WHOLESALE_OFF_PCT / 100)) / 100) * 100;
}

export const PREMIUM_CONVERSIONS = [
  { id: 'gc-25', points: 5000, valueNgn: 25000, label: '₦25,000 guest gift card' },
  { id: 'gc-60', points: 10000, valueNgn: 60000, label: '₦60,000 guest gift card' },
  { id: 'gc-175', points: 25000, valueNgn: 175000, label: '₦175,000 guest gift card' },
] as const;

export type PartnerInventoryRow = {
  slug: string;
  onHand: number;
};

export type PartnerOrder = {
  id: string;
  items: { slug: string; name: string; qty: number; unitNgn: number }[];
  totalNgn: number;
  at: string;
};

export type PartnerProfile = {
  venueName: string;
  email: string;
  area: string;
  contact: string;
  joinedAt: string;
  points: number;
  lifetimePoints: number;
  inventory: PartnerInventoryRow[];
  orders: PartnerOrder[];
};

function defaultInventory(): PartnerInventoryRow[] {
  return DRINKS.slice(0, 18).map((d) => ({ slug: d.slug, onHand: d.partyPack ? 2 : 8 }));
}

function empty(): PartnerProfile {
  return {
    venueName: '',
    email: '',
    area: '',
    contact: '',
    joinedAt: '',
    points: 0,
    lifetimePoints: 0,
    inventory: [],
    orders: [],
  };
}

function load(): PartnerProfile {
  if (typeof window === 'undefined') return empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    return { ...empty(), ...(JSON.parse(raw) as PartnerProfile) };
  } catch {
    return empty();
  }
}

function save(p: PartnerProfile) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function getPartner(): PartnerProfile {
  return load();
}

export function isPartner(p = load()): boolean {
  return Boolean(p.joinedAt && p.venueName);
}

export function joinPartner(input: {
  venueName: string;
  email: string;
  area: string;
  contact: string;
}): PartnerProfile {
  const current = load();
  const next: PartnerProfile = {
    ...current,
    venueName: input.venueName.trim(),
    email: input.email.trim().toLowerCase(),
    area: input.area.trim(),
    contact: input.contact.trim(),
    joinedAt: current.joinedAt || new Date().toISOString(),
    inventory: current.inventory.length ? current.inventory : defaultInventory(),
    points: current.points || 1200,
    lifetimePoints: current.lifetimePoints || 1200,
  };
  save(next);
  return next;
}

export function setOnHand(slug: string, onHand: number): PartnerProfile {
  const p = load();
  const qty = Math.max(0, Math.min(999, Math.floor(onHand)));
  const inventory = p.inventory.some((r) => r.slug === slug)
    ? p.inventory.map((r) => (r.slug === slug ? { ...r, onHand: qty } : r))
    : [...p.inventory, { slug, onHand: qty }];
  const next = { ...p, inventory };
  save(next);
  return next;
}

export function placeWholesaleOrder(
  items: { slug: string; qty: number }[]
): PartnerProfile | { error: string } {
  const p = load();
  if (!isPartner(p)) return { error: 'Open a partner desk first.' };
  const resolved = items
    .map((item) => {
      const drink = DRINKS.find((d) => d.slug === item.slug);
      if (!drink) return null;
      const qty = Math.max(1, Math.min(48, item.qty));
      return {
        slug: drink.slug,
        name: drink.name,
        qty,
        unitNgn: wholesalePriceNgn(drink.priceNgn),
      };
    })
    .filter(Boolean) as PartnerOrder['items'];
  if (resolved.length === 0) return { error: 'Select bottles to restock.' };

  const totalNgn = resolved.reduce((n, r) => n + r.unitNgn * r.qty, 0);
  const points = Math.floor(totalNgn / 50);
  const inventory = [...p.inventory];
  for (const r of resolved) {
    const idx = inventory.findIndex((row) => row.slug === r.slug);
    if (idx >= 0) inventory[idx] = { ...inventory[idx], onHand: inventory[idx].onHand + r.qty };
    else inventory.push({ slug: r.slug, onHand: r.qty });
  }
  const order: PartnerOrder = {
    id: `wh_${Date.now().toString(36)}`,
    items: resolved,
    totalNgn,
    at: new Date().toISOString(),
  };
  const next: PartnerProfile = {
    ...p,
    points: p.points + points,
    lifetimePoints: p.lifetimePoints + points,
    inventory,
    orders: [order, ...p.orders].slice(0, 30),
  };
  save(next);
  return next;
}

export function convertPremiumPerk(conversionId: string): { profile: PartnerProfile; code: string } | { error: string } {
  const p = load();
  if (!isPartner(p)) return { error: 'Open a partner desk first.' };
  const conv = PREMIUM_CONVERSIONS.find((c) => c.id === conversionId);
  if (!conv) return { error: 'Unknown conversion.' };
  if (p.points < conv.points) return { error: 'Not enough Premium points.' };
  const card = issueGiftCard(p.venueName, conv.valueNgn);
  const next = { ...p, points: p.points - conv.points };
  save(next);
  return { profile: next, code: card.code };
}

export function partnerGiftCards(venueName: string) {
  return listGiftCardsIssuedBy(venueName);
}

export { formatNgn };
