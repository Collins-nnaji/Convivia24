const KEY = 'convivia_gift_cards';

export type GiftCard = {
  code: string;
  valueNgn: number;
  remainingNgn: number;
  issuedBy: string;
  createdAt: string;
  redeemedBy?: string;
};

function load(): GiftCard[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GiftCard[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(rows: GiftCard[]) {
  localStorage.setItem(KEY, JSON.stringify(rows));
}

export function issueGiftCard(issuedBy: string, valueNgn: number): GiftCard {
  const code = `CV24-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
  const card: GiftCard = {
    code,
    valueNgn,
    remainingNgn: valueNgn,
    issuedBy,
    createdAt: new Date().toISOString(),
  };
  const all = load();
  all.unshift(card);
  save(all);
  return card;
}

export function findGiftCard(code: string): GiftCard | undefined {
  return load().find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
}

export function redeemGiftCard(code: string, redeemedBy: string): GiftCard | { error: string } {
  const all = load();
  const idx = all.findIndex((c) => c.code.toUpperCase() === code.trim().toUpperCase());
  if (idx < 0) return { error: 'Code not found.' };
  const card = all[idx];
  if (card.remainingNgn <= 0) return { error: 'This gift card is already used.' };
  const updated = { ...card, remainingNgn: 0, redeemedBy };
  all[idx] = updated;
  save(all);
  return updated;
}

export function listGiftCardsIssuedBy(issuedBy: string): GiftCard[] {
  return load().filter((c) => c.issuedBy === issuedBy);
}
