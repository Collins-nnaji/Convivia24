import {
  POINTS_CHECKIN,
  POINTS_REVIEW,
  POINTS_RSVP,
  pointsFromSpend,
  shopDiscountPct,
} from '@/lib/loyalty/program';
import { redeemGiftCard } from '@/lib/loyalty/gift-cards';

const KEY = 'convivia_loyalty';

export type LoyaltyActivity = {
  id: string;
  label: string;
  points: number;
  at: string;
};

export type LoyaltyWallet = {
  name: string;
  email: string;
  enrolledAt: string;
  points: number;
  lifetimePoints: number;
  walletNgn: number;
  rsvps: string[];
  checkins: string[];
  reviewed: string[];
  redeemedPerkIds: string[];
  activity: LoyaltyActivity[];
};

function empty(): LoyaltyWallet {
  return {
    name: '',
    email: '',
    enrolledAt: '',
    points: 0,
    lifetimePoints: 0,
    walletNgn: 0,
    rsvps: [],
    checkins: [],
    reviewed: [],
    redeemedPerkIds: [],
    activity: [],
  };
}

function load(): LoyaltyWallet {
  if (typeof window === 'undefined') return empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    return { ...empty(), ...(JSON.parse(raw) as LoyaltyWallet) };
  } catch {
    return empty();
  }
}

function save(w: LoyaltyWallet) {
  localStorage.setItem(KEY, JSON.stringify(w));
}

function credit(w: LoyaltyWallet, points: number, label: string): LoyaltyWallet {
  const next: LoyaltyWallet = {
    ...w,
    points: w.points + points,
    lifetimePoints: w.lifetimePoints + Math.max(0, points),
    activity: [
      { id: `a_${Date.now().toString(36)}`, label, points, at: new Date().toISOString() },
      ...w.activity,
    ].slice(0, 40),
  };
  save(next);
  return next;
}

export function getWallet(): LoyaltyWallet {
  return load();
}

export function isEnrolled(w = load()): boolean {
  return Boolean(w.enrolledAt && w.name);
}

export function enroll(name: string, email: string): LoyaltyWallet {
  const current = load();
  if (current.enrolledAt) {
    const next = { ...current, name: name.trim() || current.name, email: email.trim() || current.email };
    save(next);
    return next;
  }
  const next: LoyaltyWallet = {
    ...current,
    name: name.trim() || 'Guest',
    email: email.trim().toLowerCase(),
    enrolledAt: new Date().toISOString(),
  };
  return credit(next, 400, 'Welcome to the Guest Card');
}

export function earnFromOrder(subtotalNgn: number): LoyaltyWallet | null {
  const w = load();
  if (!isEnrolled(w)) return null;
  const pts = pointsFromSpend(subtotalNgn);
  if (pts <= 0) return w;
  return credit(w, pts, `Drop · ${pts} pts`);
}

export function rsvpEvent(eventId: string, title: string): LoyaltyWallet | { error: string } {
  const w = load();
  if (!isEnrolled(w)) return { error: 'Activate your card first.' };
  if (w.rsvps.includes(eventId)) return { error: 'You are already on this list.' };
  const next = { ...w, rsvps: [...w.rsvps, eventId] };
  return credit(next, POINTS_RSVP, `RSVP · ${title}`);
}

export function checkInVenue(slug: string, name: string): LoyaltyWallet | { error: string } {
  const w = load();
  if (!isEnrolled(w)) return { error: 'Activate your card first.' };
  const key = `${slug}:${new Date().toISOString().slice(0, 10)}`;
  if (w.checkins.includes(key)) return { error: 'Already checked in today.' };
  const next = { ...w, checkins: [...w.checkins, key] };
  return credit(next, POINTS_CHECKIN, `Check-in · ${name}`);
}

export function earnReview(venueSlug: string, venueName: string): LoyaltyWallet | null {
  const w = load();
  if (!isEnrolled(w)) return null;
  if (w.reviewed.includes(venueSlug)) return w;
  const next = { ...w, reviewed: [...w.reviewed, venueSlug] };
  return credit(next, POINTS_REVIEW, `Review · ${venueName}`);
}

export function applyGiftCode(code: string): LoyaltyWallet | { error: string } {
  const w = load();
  if (!isEnrolled(w)) return { error: 'Activate your card first.' };
  const result = redeemGiftCard(code, w.email || w.name);
  if ('error' in result) return result;
  const next = { ...w, walletNgn: w.walletNgn + result.valueNgn };
  save(next);
  return credit(next, 0, `Gift card · ₦${result.valueNgn.toLocaleString('en-NG')}`);
}

export function spendWallet(amountNgn: number): number {
  const w = load();
  const used = Math.min(w.walletNgn, Math.max(0, amountNgn));
  if (used > 0) {
    save({ ...w, walletNgn: w.walletNgn - used });
  }
  return used;
}

export function checkoutPricing(subtotalNgn: number): {
  discountPct: number;
  discountNgn: number;
  walletNgn: number;
  payableNgn: number;
} {
  const w = load();
  const discountPct = isEnrolled(w) ? shopDiscountPct(w.points) : 0;
  const discountNgn = Math.round(subtotalNgn * (discountPct / 100));
  const afterPct = subtotalNgn - discountNgn;
  const walletNgn = Math.min(w.walletNgn, afterPct);
  return {
    discountPct,
    discountNgn,
    walletNgn,
    payableNgn: afterPct - walletNgn,
  };
}
