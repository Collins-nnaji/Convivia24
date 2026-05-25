'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, PlusSquare, User as UserIcon, Zap,
  Clock, Users, Star, ArrowRight, Building2, Ticket, Briefcase, Wallet,
  MapPin, Camera, Calendar, LogOut, Edit3, Check, X, Loader2,
  Sparkles, Flame, ShieldCheck, RefreshCw, AlertCircle, Wine,
  Music2, Coffee, ChevronRight, Send, SkipForward, Hourglass, Share2, Copy, MessageCircle,
  GraduationCap,
  CalendarDays, ClipboardList, Receipt, UserCircle, LogIn, Mail,
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import type { StaffPersona } from '@/hooks/useStaffPersona';

export type AppShellMode = 'staff' | 'outlet' | 'brand' | 'field';
import { buildHangoutInviteMessage, whatsAppSendPrefilledUrl } from '@/lib/hangout-invite-share';
import { everythingFree } from '@/lib/premium';
import {
  LAGOS_ZONES,
  STAFF_ROLE_GROUPS,
  staffingWhatsAppUrl,
  ALL_STAFF_ROLES,
} from '@/lib/staffing';
import { DEFAULT_CITIES, useCityList } from '@/hooks/useCityList';
import { OutletOnboardingForm } from '@/components/outlet/OutletOnboardingForm';
import { MobileFirstColumn } from '@/components/app/shell/MobileFirst';

/** All three metros live — keep Lagos sub-areas off marketing blurbs (zones live in filters). */
const HOSPITALITY_METROS_BEFORE_LINK =
  'Lagos, Abuja, Port Harcourt — open shifts on the';

/** Infer whether the posted amount reads as shift / day / week from copy. */
function shiftRateBasis(vibe: string, title: string): 'daily' | 'weekly' | 'shift' {
  const t = `${vibe} ${title}`.toLowerCase();
  if (/\b(per\s*week|weekly|\/\s*wk\b|\/\s*week|week\s*rate)\b/.test(t)) return 'weekly';
  if (/\b(per\s*day|daily|\/\s*day|day\s*rate)\b/.test(t)) return 'daily';
  return 'shift';
}

function shiftTimingLine(eventTimeIso?: string | null): string {
  if (!eventTimeIso) {
    return 'Time on card · confirm hours with outlet (7-day board window).';
  }
  const d = new Date(eventTimeIso);
  if (Number.isNaN(d.getTime())) {
    return 'Time on card · confirm hours with outlet (7-day board window).';
  }
  return `${d.toLocaleString('en-NG', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} · confirm on site.`;
}

/** Parse posting `vibe` (often "Dress: …. briefing") for shift cards. */
function shiftCardPayAndRequirements(h: {
  title?: string | null;
  vibe?: string | null;
  ticket_price?: number | null;
  event_time?: string | null;
}): {
  payHeadline: string;
  paySub: string;
  dressLine: string | null;
  briefing: string;
} {
  const vibeRaw = String(h.vibe || '').trim();
  const dressMatch = vibeRaw.match(/Dress:\s*([^.]+(?:\.[^.]+)?)/i);
  const dressLine = dressMatch?.[1]?.trim() || null;
  let briefing = vibeRaw.replace(/^Dress:\s*[^.]+\.?\s*/i, '').trim();
  if (!briefing && !dressLine) briefing = vibeRaw;
  else if (!briefing && dressLine) briefing = '';

  const p: unknown = h.ticket_price;
  let n = NaN;
  if (p != null && p !== '') {
    const x = Number(p);
    if (Number.isFinite(x)) n = x;
  }
  const hasListed = n > 0;
  const basis = shiftRateBasis(vibeRaw, String(h.title || ''));
  const basisTag = basis === 'daily' ? 'per day' : basis === 'weekly' ? 'per week' : 'this shift';
  const timing = shiftTimingLine(h.event_time);

  return {
    payHeadline: hasListed
      ? `₦${Math.round(n).toLocaleString('en-NG')} · ${basisTag}`
      : 'No app booking fee',
    paySub: hasListed
      ? `${timing} Same-day payout after sign-off (mobile money).`
      : `${timing} Pay agreed with outlet · same-day after sign-off.`,
    dressLine,
    briefing: briefing || (dressLine ? 'Dress above · outlet may update.' : 'See posting for role, time, venue.'),
  };
}

function shiftIntelligenceBadges(h: any, selectedCity: string) {
  const badges: { label: string; tone: 'good' | 'warn' | 'neutral' }[] = [];
  const pay = Number(h.ticket_price || 0);
  const cityMatches =
    selectedCity &&
    [h.city, h.venue_city, h.location]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(selectedCity.toLowerCase()));
  const remaining = Math.max(0, Number(h.max_guests || 0) - Number(h.current_guests || 0));
  const hasBrief = String(h.vibe || '').trim().length >= 30;

  if (cityMatches) badges.push({ label: 'Near your city', tone: 'good' });
  if (h.vendor_slug) badges.push({ label: 'Verified outlet profile', tone: 'good' });
  else badges.push({ label: 'No outlet profile yet', tone: 'warn' });
  if (pay >= 15000) badges.push({ label: 'High pay', tone: 'good' });
  else if (pay > 0) badges.push({ label: 'Pay listed', tone: 'neutral' });
  else badges.push({ label: 'Confirm pay before accepting', tone: 'warn' });
  if (remaining > 0 && remaining <= 2) badges.push({ label: 'Few spots left', tone: 'neutral' });
  if (!hasBrief) badges.push({ label: 'Brief is light', tone: 'warn' });

  return badges.slice(0, 4);
}

function shiftBadgeClass(tone: 'good' | 'warn' | 'neutral') {
  if (tone === 'good') return 'border-emerald-200 bg-emerald-50 text-emerald-900';
  if (tone === 'warn') return 'border-amber-200 bg-amber-50 text-amber-950';
  return 'border-neutral-200 bg-neutral-50 text-neutral-700';
}

function suggestedApplicationNote(h: any) {
  const title = String(h.title || 'this shift');
  const role = title.split(/[·,-]/)[0]?.trim() || title;
  const area = String(h.area || h.city || '').trim();
  return `Available for ${role}${area ? ` in ${area}` : ''}. Payout details included.`;
}

/* ══════════════════════════════════════════════════════════════════════
   LIVE CITY PULSE  — what makes us different from Eventbrite/Meetup
   ══════════════════════════════════════════════════════════════════════ */
type Pulse = {
  id: string;
  area: string;
  city: string;
  vibe: string;
  energy: 'quiet' | 'rising' | 'high' | 'peak';
  tag: string;
  groupSize: number;
  liveTables?: number;
};

const ENERGY_COLORS: Record<Pulse['energy'], string> = {
  quiet:  'text-neutral-600 bg-neutral-100 border-neutral-300',
  rising: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
  high:   'text-amber-300 bg-amber-500/15 border-amber-500/30',
  peak:   'text-red-300 bg-red-500/20 border-red-500/40',
};

/** Left accent stripe on pulse cards (readable on white, no gradient clutter) */
const ENERGY_STRIPE: Record<Pulse['energy'], string> = {
  quiet:  'border-l-neutral-400 bg-gradient-to-br from-neutral-50 to-white',
  rising: 'border-l-emerald-500 bg-gradient-to-br from-emerald-50/90 to-white',
  high:   'border-l-amber-500 bg-gradient-to-br from-amber-50/90 to-white',
  peak:   'border-l-red-600 bg-gradient-to-br from-red-50/80 to-white',
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 380, damping: 28 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 320, damping: 30 },
  },
};

function pickPulseIcon(vibe: string) {
  const v = vibe.toLowerCase();
  if (v.includes('drink') || v.includes('whisky') || v.includes('cocktail')) return Wine;
  if (v.includes('dinner') || v.includes('food') || v.includes('cook'))      return Flame;
  if (v.includes('music') || v.includes('dance'))                            return Music2;
  if (v.includes('brunch') || v.includes('coffee') || v.includes('co-work')) return Coffee;
  if (v.includes('rooftop') || v.includes('lounge'))                         return Star;
  return Sparkles;
}

function publicInviteUrl(hangoutId: string) {
  if (typeof window === 'undefined') return `/join/${hangoutId}`;
  return `${window.location.origin}/join/${hangoutId}`;
}

async function copyHangoutInviteLink(id: string) {
  const url = publicInviteUrl(id);
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}

async function shareHangoutInvite(id: string, title: string) {
  const url = publicInviteUrl(id);
  try {
    if (navigator.share) {
      await navigator.share({ title: `Shift: ${title}`, text: `Shift available — ${title}`, url });
      return;
    }
  } catch {
    return;
  }
  await copyHangoutInviteLink(id);
}

function openWhatsAppHangoutInvite(id: string, title: string) {
  const inviteUrl = publicInviteUrl(id);
  const msg = buildHangoutInviteMessage(title, inviteUrl);
  window.open(whatsAppSendPrefilledUrl(msg), '_blank', 'noopener,noreferrer');
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const VIBE_PROMPTS = [
  'Smart casual, black trousers',
  'All black, closed shoes',
  'Traditional friendly, venue provides gele',
  'Bar apron, non-slip shoes',
  'Early shift, hotel standards',
];

/* Mock matched profiles for the AI match preview — replaced by real /api/people once seeded */
const MATCH_POOL = [
  { name: 'Amara O.',  bio: 'Product · LP1', avatar: 'https://i.pravatar.cc/120?img=44' },
  { name: 'Tunde B.',  bio: 'Founder · VI',  avatar: 'https://i.pravatar.cc/120?img=12' },
  { name: 'Kemi A.',   bio: 'Designer · Yaba', avatar: 'https://i.pravatar.cc/120?img=47' },
  { name: 'David C.',  bio: 'Investor · Wuse', avatar: 'https://i.pravatar.cc/120?img=15' },
  { name: 'Ngozi E.',  bio: 'Doctor · Ikoyi', avatar: 'https://i.pravatar.cc/120?img=48' },
  { name: 'Seun A.',   bio: 'Marketing · Camden', avatar: 'https://i.pravatar.cc/120?img=13' },
];

/**
 * Open hangout in the pulse city that actually matches the neighbourhood label.
 * A plain `.find()` by city only always returned the same first table (e.g. Brixton) for every card.
 */
function findHangoutForPulse(hangouts: any[], pulse: Pulse): any | undefined {
  const cityNeedle = (pulse.city || '').toLowerCase();
  const open = hangouts.filter(
    (h: any) =>
      (h.city || '').toLowerCase().includes(cityNeedle) &&
      (h.current_guests || 0) < (h.max_guests || 0),
  );
  if (open.length === 0) return undefined;

  const areaRaw = (pulse.area || '').toLowerCase().trim();
  const haystack = (h: any) =>
    `${h.location || ''} ${h.title || ''}`.toLowerCase();
  const tokens = areaRaw.split(/[^a-z0-9]+/).filter((t) => t.length > 2);

  let best: any;
  let bestScore = 0;
  for (const h of open) {
    const hs = haystack(h);
    let s = 0;
    if (areaRaw && hs.includes(areaRaw)) s = 4;
    else for (const t of tokens) if (hs.includes(t)) s = Math.max(s, 3);
    if (s > bestScore) {
      bestScore = s;
      best = h;
    }
  }

  if (bestScore < 3) return undefined;
  return best;
}

/* ══════════════════════════════════════════════════════════════════════
   SHARED — Flow steps + how-it-works helper
   ══════════════════════════════════════════════════════════════════════ */
function FlowSteps({ steps }: { steps: { n: string; label: string; sub?: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3 pt-2">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0 bg-neutral-50 border border-neutral-200 rounded-full pl-2 pr-3 py-1.5">
            <span className="w-5 h-5 shrink-0 rounded-full bg-red-50 text-red-800 ring-1 ring-red-200 text-[10px] font-black flex items-center justify-center">{s.n}</span>
            <span className="text-[10px] uppercase tracking-widest font-black text-neutral-800 truncate">{s.label}</span>
            {s.sub && <span className="hidden sm:inline text-[10px] text-neutral-500 font-medium normal-case tracking-normal truncate">· {s.sub}</span>}
          </div>
          {i < steps.length - 1 && <ChevronRight size={14} className="text-neutral-300 shrink-0 hidden sm:block" />}
        </div>
      ))}
    </div>
  );
}

/** Staff + shared keys; `demand` / `pay` are outlet-only (3-tab shell). */
export type AppTab =
  | 'home'
  | 'discover'
  | 'host'
  | 'circles'
  | 'profile'
  | 'demand'
  | 'pay';

function resolveTabForOutlet(t: AppTab): AppTab {
  if (t === 'discover' || t === 'host') return 'demand';
  if (t === 'circles') return 'home';
  if (t === 'demand' || t === 'pay' || t === 'home' || t === 'profile') return t;
  return 'home';
}

function formatLiveLocalTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/** Time updates after mount so server and first client render match (no hydration mismatch). */
function LiveLocalTime({ className }: { className?: string }) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setText(formatLiveLocalTime(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  return <span className={className ?? 'tabular-nums'}>{text ?? '—:--'}</span>;
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════ */
export function AppConceptBoard({
  initialUser,
  appMode,
}: {
  initialUser?: any;
  appMode: AppShellMode;
}) {
  const searchParams = useSearchParams();
  const persona: StaffPersona = appMode === 'outlet' ? 'outlet' : 'worker';
  const appBase = appMode === 'outlet' ? '/outlet' : '/';

  const [liveUser, setLiveUser] = useState<any>(initialUser ?? null);

  useEffect(() => {
    setLiveUser(initialUser ?? null);
  }, [initialUser]);

  /** Same Neon session as staff; SSR sometimes misses cookies — hydrate once from API. */
  useEffect(() => {
    if (initialUser != null) return;
    let cancelled = false;
    fetch('/api/profile', { credentials: 'include' })
      .then(async (r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.user) setLiveUser(d.user);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [initialUser]);

  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [outletDemandSub, setOutletDemandSub] = useState<'board' | 'post' | 'applicants'>('board');
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const [pendingInviteHangoutId, setPendingInviteHangoutId] = useState<string | null>(null);
  const wl = Array.isArray(liveUser?.watchlist_cities) ? (liveUser.watchlist_cities as string[]) : null;
  const { cities, addCity } = useCityList({
    serverWatchlist: wl,
    persistWatchlist: Boolean(liveUser),
  });

  const [staffBoardCity, setStaffBoardCity] = useState<string>(DEFAULT_CITIES[0]);

  useEffect(() => {
    if (!cities.length) return;
    setStaffBoardCity((prev) =>
      cities.some((c) => c.toLowerCase() === prev.toLowerCase()) ? prev : cities[0],
    );
  }, [cities]);

  const joinParam = searchParams.get('join');
  useEffect(() => {
    if (!joinParam || !UUID_RE.test(joinParam)) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setPendingInviteHangoutId(joinParam);
      if (appMode === 'outlet') {
        setOutletDemandSub('board');
        setActiveTab('demand');
      } else {
        setActiveTab('discover');
      }
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', appBase);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [joinParam, appBase, appMode]);

  const clearPendingInvite = useCallback(() => setPendingInviteHangoutId(null), []);

  const navLabels =
    persona === 'outlet'
      ? { home: 'Today', demand: 'Demand', pay: 'Pay', profile: 'Profile' }
      : { home: 'Today', discover: 'Shifts', host: 'Record', circles: 'Learn', profile: 'Me' };

  const switchTab = useCallback(
    (t: AppTab) => {
      if (appMode === 'outlet') {
        const next = resolveTabForOutlet(t);
        if (next === 'demand') {
          setOutletDemandSub(t === 'host' ? 'post' : 'board');
        }
        setActiveTab(next);
        return;
      }
      setActiveTab(t);
    },
    [appMode],
  );

  const scrollContentToTop = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const run = () => {
      mainScrollRef.current?.scrollTo({ top: 0, behavior });
      if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
        window.scrollTo({ top: 0, behavior });
      }
    };
    requestAnimationFrame(() => requestAnimationFrame(run));
  }, []);

  useEffect(() => {
    scrollContentToTop('smooth');
  }, [activeTab, outletDemandSub, scrollContentToTop]);

  const goNow = useCallback(() => {
    setActiveTab('home');
    scrollContentToTop('smooth');
  }, [scrollContentToTop]);

  const renderContent = () => {
    if (appMode === 'outlet') {
      switch (activeTab) {
        case 'home':
          return (
            <OutletLandingTab initialUser={liveUser} onSwitchTab={switchTab} cities={cities} />
          );
        case 'demand':
          return (
            <OutletDemandTab
              outletDemandSub={outletDemandSub}
              setOutletDemandSub={setOutletDemandSub}
              pendingInviteHangoutId={pendingInviteHangoutId}
              onClearPendingInvite={clearPendingInvite}
              cities={cities}
              addCity={addCity}
              onSwitchTab={switchTab}
            />
          );
        case 'pay':
          return <OutletPaymentsTab cities={cities} onSwitchTab={switchTab} />;
        case 'profile':
          return <OutletProfileTab initialUser={liveUser} />;
        default:
          return (
            <OutletLandingTab initialUser={liveUser} onSwitchTab={switchTab} cities={cities} />
          );
      }
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomeTab
            onSwitchTab={switchTab}
            cities={cities}
            addCity={addCity}
            boardCity={staffBoardCity}
            onBoardCityChange={setStaffBoardCity}
          />
        );
      case 'discover':
        return (
          <DiscoverTab
            persona={persona}
            onSwitchTab={switchTab}
            pendingInviteHangoutId={pendingInviteHangoutId}
            onClearPendingInvite={clearPendingInvite}
            cities={cities}
            boardCity={staffBoardCity}
            onBoardCityChange={setStaffBoardCity}
            addCity={addCity}
          />
        );
      case 'host':
        return <CareerTab onSwitchTab={switchTab} />;
      case 'circles':
        return <HospitalityTrainingTab persona={persona} onSwitchTab={switchTab} />;
      case 'profile':
        return <ProfileTab persona={persona} initialUser={liveUser} />;
      default:
        return (
          <HomeTab
            onSwitchTab={switchTab}
            cities={cities}
            addCity={addCity}
            boardCity={staffBoardCity}
            onBoardCityChange={setStaffBoardCity}
          />
        );
    }
  };

  return (
    <div className="flex w-full max-w-[100vw] flex-col mx-auto relative text-neutral-900 overflow-x-hidden max-lg:h-full max-lg:max-h-full max-lg:min-h-0 lg:h-auto lg:min-h-0">
      {/* TOP NAV (DESKTOP — lg+ only; tablet uses tab bar + fixed top strip) */}
      <header className="hidden lg:flex items-center justify-between px-6 lg:px-10 py-5 lg:py-6 border-b border-gold/20 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-[0_1px_0_0_rgba(201,168,76,0.08)]">
        <div className="flex items-center gap-3 min-w-0 flex-1 lg:flex-none lg:w-[220px]">
          <button
            type="button"
            onClick={goNow}
            className="rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 shrink-0 text-left flex flex-col items-start gap-1"
            aria-label="Go to Today"
          >
            <BrandLogo
              alt="Convivia24"
              className="h-9 lg:h-10 w-auto max-w-[200px] object-contain object-left"
            />
            <span className="hidden sm:block text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              {appMode === 'outlet' ? 'Vendor console · shifts & pay' : 'Staff app · shifts & pay'}
            </span>
          </button>
        </div>

        <nav className="flex items-center gap-4 lg:gap-7 shrink min-w-0 justify-center">
          {appMode === 'outlet' ? (
            <>
              <DesktopNavLink label={navLabels.home} icon={<CalendarDays size={18} strokeWidth={activeTab === 'home' ? 2.5 : 2} />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
              <DesktopNavLink label={navLabels.demand} icon={<ClipboardList size={18} strokeWidth={activeTab === 'demand' ? 2.5 : 2} />} active={activeTab === 'demand'} onClick={() => setActiveTab('demand')} />
              <DesktopNavLink label={navLabels.pay} icon={<Wallet size={18} strokeWidth={activeTab === 'pay' ? 2.5 : 2} />} active={activeTab === 'pay'} onClick={() => setActiveTab('pay')} />
              <DesktopNavLink label={navLabels.profile} icon={<UserCircle size={18} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
            </>
          ) : (
            <>
              <DesktopNavLink label={navLabels.home} icon={<CalendarDays size={18} strokeWidth={activeTab === 'home' ? 2.5 : 2} />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
              <DesktopNavLink label={navLabels.discover} icon={<ClipboardList size={18} strokeWidth={activeTab === 'discover' ? 2.5 : 2} />} active={activeTab === 'discover'} onClick={() => setActiveTab('discover')} />
              <DesktopNavLink label={navLabels.host} icon={<Receipt size={18} strokeWidth={activeTab === 'host' ? 2.5 : 2} />} active={activeTab === 'host'} onClick={() => setActiveTab('host')} />
              <DesktopNavLink label={navLabels.circles} icon={<GraduationCap size={18} strokeWidth={activeTab === 'circles' ? 2.5 : 2} />} active={activeTab === 'circles'} onClick={() => setActiveTab('circles')} />
              <DesktopNavLink label={navLabels.profile} icon={<UserCircle size={18} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
            </>
          )}
        </nav>

        <div className="hidden lg:flex items-center justify-end gap-3 shrink-0 w-[160px] lg:w-[240px] text-right flex-wrap">
          {appMode === 'staff' ? (
            <span
              className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-neutral-500"
              title="Convivia24 is for adults 18 and over"
            >
              18+
            </span>
          ) : (
            <>
              <span
                className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-neutral-500"
                title="Convivia24 is for adults 18 and over"
              >
                18+
              </span>
              {!liveUser ? (
                <Link
                  href="/auth/sign-in"
                  className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] text-red-700 hover:text-red-800 whitespace-nowrap"
                >
                  <LogIn size={12} aria-hidden /> Sign in
                </Link>
              ) : null}
            </>
          )}
        </div>
      </header>

      {/* Mobile app chrome: compact switcher at top, thumb-friendly navigation at bottom. */}
      <div className="lg:hidden fixed top-0 left-1/2 z-[60] w-full max-w-[min(100%,428px)] -translate-x-1/2 pointer-events-none px-3 pt-0">
        <div className="pointer-events-auto flex justify-between items-center rounded-b-[18px] border border-t-0 border-neutral-200 bg-white/[0.96] px-3 pt-[max(0.45rem,env(safe-area-inset-top))] pb-2 shadow-[0_6px_20px_rgba(0,0,0,0.06)] backdrop-blur-xl gap-2">
          {appMode === 'staff' ? (
            <span
              className="ml-auto shrink-0 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-neutral-600"
              title="Convivia24 is for adults 18 and over"
            >
              18+
            </span>
          ) : (
            <div className="ml-auto flex items-center gap-2 shrink-0">
              <span
                className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-neutral-600"
                title="Convivia24 is for adults 18 and over"
              >
                18+
              </span>
              {!liveUser ? (
                <Link
                  href="/auth/sign-in"
                  className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-red-700 hover:text-red-800 py-1"
                >
                  <LogIn size={12} aria-hidden /> Sign in
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </div>
      <div
        className="lg:hidden fixed bottom-0 left-1/2 z-[70] flex w-full max-w-[min(100%,428px)] -translate-x-1/2 items-center justify-between gap-1 rounded-t-[26px] border border-neutral-200 border-b-0 bg-white/[0.98] px-2.5 pb-[calc(0.6rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl"
        role="tablist"
        aria-label="Main navigation"
      >
        {appMode === 'outlet' ? (
          <>
            <NavIcon label={navLabels.demand} icon={<ClipboardList size={20} strokeWidth={activeTab === 'demand' ? 2.5 : 2} />} active={activeTab === 'demand'} onClick={() => setActiveTab('demand')} />
            <NavIcon label={navLabels.home} icon={<CalendarDays size={20} strokeWidth={activeTab === 'home' ? 2.5 : 2} />} active={activeTab === 'home'} onClick={goNow} live />
            <NavIcon label={navLabels.pay} icon={<Wallet size={20} strokeWidth={activeTab === 'pay' ? 2.5 : 2} />} active={activeTab === 'pay'} onClick={() => setActiveTab('pay')} />
            <NavIcon label={navLabels.profile} icon={<UserCircle size={20} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          </>
        ) : (
          <>
            <NavIcon label={navLabels.host} icon={<Receipt size={20} strokeWidth={activeTab === 'host' ? 2.5 : 2} />} active={activeTab === 'host'} onClick={() => setActiveTab('host')} />
            <NavIcon label={navLabels.discover} icon={<ClipboardList size={20} strokeWidth={activeTab === 'discover' ? 2.5 : 2} />} active={activeTab === 'discover'} onClick={() => setActiveTab('discover')} />
            <NavIcon label={navLabels.home} icon={<CalendarDays size={20} strokeWidth={activeTab === 'home' ? 2.5 : 2} />} active={activeTab === 'home'} onClick={goNow} live />
            <NavIcon label={navLabels.circles} icon={<GraduationCap size={20} strokeWidth={activeTab === 'circles' ? 2.5 : 2} />} active={activeTab === 'circles'} onClick={() => setActiveTab('circles')} />
            <NavIcon label={navLabels.profile} icon={<UserCircle size={20} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          </>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div
        ref={mainScrollRef}
        className="w-full overflow-x-hidden px-4 sm:px-6 lg:px-12 max-lg:flex-1 max-lg:min-h-0 max-lg:overflow-y-auto max-lg:overscroll-y-contain max-lg:pt-[calc(env(safe-area-inset-top)+3.35rem)] max-lg:pb-[calc(7.25rem+env(safe-area-inset-bottom))] max-lg:scroll-pb-[calc(7.25rem+env(safe-area-inset-bottom))] max-lg:scrollbar-hide max-lg:relative max-lg:touch-pan-y lg:flex-none lg:overflow-visible lg:pb-12"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={appMode === 'outlet' && activeTab === 'demand' ? `demand-${outletDemandSub}` : activeTab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="w-full mx-auto max-w-7xl max-lg:min-h-full lg:min-h-0"
          >
            <MobileFirstColumn>{renderContent()}</MobileFirstColumn>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ══ NAV HELPERS ══ */
function DesktopNavLink({ label, icon, active, onClick }: any) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 transition-all ${active ? 'text-red-700 font-bold drop-shadow-[0_0_8px_rgba(185,28,28,0.35)]' : 'text-neutral-500 hover:text-neutral-900'} relative`}
    >
      {icon}
      <span className="text-xs uppercase tracking-widest">{label}</span>
      {active && <span className="absolute -bottom-[29px] left-0 right-0 h-[3px] rounded-t-full bg-gradient-to-r from-red-700 via-red-600 to-gold shadow-[0_0_12px_rgba(185,28,28,0.35)]"/>}
    </button>
  );
}
function NavIcon({ icon, label, active, onClick, live }: any) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`flex-1 min-w-0 basis-0 min-h-[60px] py-1.5 rounded-[18px] flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-[0.96] relative ${
        active
          ? 'text-red-700 bg-red-50 shadow-[inset_0_0_0_1.5px_rgba(185,28,28,0.18),0_6px_18px_rgba(185,28,28,0.1)]'
          : 'text-neutral-500 hover:text-neutral-800 active:bg-neutral-50'
      }`}
    >
      <span className="relative">
        {icon}
        {live && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-600 live-pulse" aria-hidden />
        )}
      </span>
      <span
        className={`max-w-[100%] px-0.5 text-center text-[10px] leading-[1.05] uppercase tracking-[0.04em] font-black line-clamp-2 ${active ? 'text-red-800' : ''}`}
      >
        {label}
      </span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SHIFT LINK — opened from /join/[id] or /?join=[id]
   ══════════════════════════════════════════════════════════════════════ */
function InviteFromLinkBanner({
  hangoutId,
  onDismiss,
  onJoined,
}: {
  hangoutId: string;
  onDismiss: () => void;
  onJoined: () => void;
}) {
  const [h, setH] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/hangouts/${hangoutId}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          if (!d.hangout) setNote('This shift is not available.');
          else setH(d.hangout);
        }
      })
      .catch(() => {
        if (!cancelled) setNote('Could not load shift.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [hangoutId]);

  const join = async () => {
    setJoining(true);
    setNote(null);
    try {
      const res = await fetch(`/api/hangouts/${hangoutId}/join`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        onJoined();
        onDismiss();
      } else setNote(data.error || 'Could not apply.');
    } catch {
      setNote('Network error.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-6 flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 py-8">
        <Loader2 className="w-5 h-5 text-red-700 animate-spin" />
        <span className="text-sm text-neutral-600">Loading shift…</span>
      </div>
    );
  }

  if (note && !h) {
    return (
      <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between gap-3">
        <span className="text-sm text-amber-900">{note}</span>
        <button type="button" onClick={onDismiss} className="text-amber-800 font-semibold text-sm shrink-0">
          Dismiss
        </button>
      </div>
    );
  }

  if (!h) return null;

  const isFull = (h.current_guests || 0) >= (h.max_guests || 0);
  const invitePay = shiftCardPayAndRequirements(h);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-[22px] border border-red-200 bg-gradient-to-br from-red-50/90 to-white px-4 py-4 md:px-5 md:py-5 shadow-[0_8px_30px_rgba(185,28,28,0.1)]"
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-700 mb-1">Shift link</p>
          <h3 className="font-display text-xl md:text-2xl italic text-neutral-900 leading-tight">{h.title}</h3>
          <p className="text-xs text-neutral-500 mt-1">
            {h.formatted_time} · {h.formatted_date} · {h.city || h.location}
          </p>
          <div className="mt-2 rounded-lg border border-emerald-200/60 bg-emerald-50/40 px-2.5 py-2 text-[11px] text-neutral-800">
            <p>
              <span className="font-semibold text-emerald-900">Transparent pay · </span>
              {invitePay.payHeadline}
            </p>
            <p className="text-neutral-600 mt-1 leading-snug">{invitePay.paySub}</p>
          </div>
          <div className="mt-2 rounded-lg border border-neutral-200/80 bg-neutral-50/50 px-2.5 py-2 text-[11px] text-neutral-700 leading-snug">
            <span className="font-black uppercase tracking-wider text-[9px] text-neutral-500">Requirements · </span>
            {invitePay.dressLine ? <>Dress: {invitePay.dressLine}. </> : null}
            {invitePay.briefing}
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mt-2">18+ only</p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => copyHangoutInviteLink(hangoutId).then((ok) => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); } })}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-neutral-200 bg-white text-[10px] font-black uppercase tracking-widest text-neutral-700 hover:border-red-300"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy link'}
          </button>
          <button
            type="button"
            onClick={() => shareHangoutInvite(hangoutId, h.title)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-red-200 bg-red-700 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-800"
          >
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>
      {note && <p className="text-sm text-red-700 mt-2">{note}</p>}
      <div className="flex flex-wrap gap-2 mt-4">
        <button
          type="button"
          onClick={join}
          disabled={joining || isFull}
          className="flex-1 min-w-[120px] py-3 rounded-full bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {joining ? <Loader2 size={14} className="animate-spin" /> : null}
          {isFull ? 'Filled' : 'Apply'}
        </button>
        <button type="button" onClick={onDismiss} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-700">
          Dismiss
        </button>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   DISCOVER TAB — shift board (outlets ↔ workers)
   ══════════════════════════════════════════════════════════════════════ */
const DISCOVER_CATEGORY_OPTIONS = [
  { key: 'all', label: 'All role types' },
  { key: 'social', label: 'Front of house' },
  { key: 'dining', label: 'Back of house' },
  { key: 'nightlife', label: 'Bar & floor' },
  { key: 'outdoors', label: 'Housekeeping' },
  { key: 'gigs', label: 'Events & banquets' },
] as const;

function DiscoverTab({
  persona,
  onSwitchTab,
  pendingInviteHangoutId,
  onClearPendingInvite,
  cities,
  boardCity,
  onBoardCityChange,
  addCity,
}: {
  persona: StaffPersona;
  onSwitchTab: (t: AppTab) => void;
  pendingInviteHangoutId?: string | null;
  onClearPendingInvite?: () => void;
  cities: string[];
  boardCity?: string;
  onBoardCityChange?: (c: string) => void;
  addCity?: (name: string) => void;
}) {
  const [filter, setFilter] = useState<'all' | 'open' | 'curated'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [freeOnly, setFreeOnly] = useState(false);
  const [fallbackCity, setFallbackCity] = useState(() => cities[0] ?? DEFAULT_CITIES[0]);
  const discoverCity = onBoardCityChange
    ? (boardCity ?? cities[0] ?? DEFAULT_CITIES[0])
    : fallbackCity;
  const setDiscoverCity = onBoardCityChange ?? ((c: string) => setFallbackCity(c));
  const persistExtraCity = addCity ?? (() => {});

  useEffect(() => {
    if (onBoardCityChange) return;
    if (!cities.length) return;
    setFallbackCity((prev) =>
      cities.some((c) => c.toLowerCase() === prev.toLowerCase()) ? prev : cities[0],
    );
  }, [cities, onBoardCityChange]);

  const [hangouts, setHangouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinNote, setJoinNote] = useState<string | null>(null);
  const [inviteCopiedId, setInviteCopiedId] = useState<string | null>(null);

  // Apply flow
  const [applyOpenId, setApplyOpenId] = useState<string | null>(null);
  const [applyProvider, setApplyProvider] = useState<string>('OPay');
  const [applyPhone, setApplyPhone] = useState('');
  const [applyNote, setApplyNote] = useState('');
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Record<string, string>>({}); // shiftId → status
  const [applicationDefaults, setApplicationDefaults] = useState<{
    payout_provider: string;
    payout_phone: string;
    note?: string | null;
  } | null>(null);

  const loadHangouts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('city', discoverCity);
    params.set('next_hours', '168');
    if (filter !== 'all') params.set('type', filter);
    if (categoryFilter !== 'all') params.set('category', categoryFilter);
    if (freeOnly) params.set('free', '1');
    fetch(`/api/hangouts?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setHangouts(Array.isArray(data.hangouts) ? data.hangouts : []);
        setLoading(false);
      })
      .catch(() => {
        setHangouts([]);
        setLoading(false);
      });
  }, [discoverCity, filter, categoryFilter, freeOnly]);

  useEffect(() => {
    loadHangouts();
  }, [loadHangouts]);

  useEffect(() => {
    if (persona === 'outlet') return;
    fetch('/api/shifts/my-applications', { credentials: 'include' })
      .then(async (r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        const applications = Array.isArray(data?.applications) ? data.applications : [];
        const statuses: Record<string, string> = {};
        for (const app of applications) {
          if (app.shift_id && app.status) statuses[String(app.shift_id)] = String(app.status);
        }
        setAppliedIds(statuses);

        const latestWithPayout = applications.find((app: any) => app.payout_provider && app.payout_phone);
        if (latestWithPayout) {
          setApplicationDefaults({
            payout_provider: String(latestWithPayout.payout_provider),
            payout_phone: String(latestWithPayout.payout_phone),
            note: latestWithPayout.note ? String(latestWithPayout.note) : null,
          });
        }
      })
      .catch(() => {});
  }, [persona]);

  const handleApplySubmit = async (shiftId: string) => {
    if (!applyPhone.trim()) { setJoinNote('Enter your payout phone number.'); return; }
    setApplyingId(shiftId);
    setJoinNote(null);
    try {
      const res = await fetch(`/api/shifts/${shiftId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ payout_provider: applyProvider, payout_phone: applyPhone.trim(), note: applyNote.trim() || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedIds((prev) => ({ ...prev, [shiftId]: data.application?.status || 'pending' }));
        setApplicationDefaults({
          payout_provider: applyProvider,
          payout_phone: applyPhone.trim(),
          note: applyNote.trim() || null,
        });
        setApplyOpenId(null);
        setApplyPhone('');
        setApplyNote('');
        setJoinNote('Application sent — outlet will confirm via WhatsApp.');
        loadHangouts();
      } else {
        setJoinNote(data.error || 'Could not apply. Try again.');
      }
    } catch {
      setJoinNote('Network error. Try again.');
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 min-w-0">
      {pendingInviteHangoutId && onClearPendingInvite ? (
        <InviteFromLinkBanner
          hangoutId={pendingInviteHangoutId}
          onDismiss={onClearPendingInvite}
          onJoined={loadHangouts}
        />
      ) : null}

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[18px] border border-red-200/45 bg-white p-4 sm:p-5 shadow-[0_8px_28px_rgba(0,0,0,0.06)]"
      >
        <StaffMetroFilters
          cities={cities}
          selectedCity={discoverCity}
          onSelectCity={setDiscoverCity}
        />
      </motion.section>

      <motion.div
        className="space-y-3"
        initial="hidden"
        animate="show"
        variants={staggerContainer}
      >
        <motion.div variants={fadeUp} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-red-600">
          <ClipboardList size={14} className="text-red-600 shrink-0" aria-hidden />
          {persona === 'outlet' ? 'Shift board' : 'Open shifts'}
        </motion.div>
        <motion.h1 variants={fadeUp} className="font-display text-2xl sm:text-4xl md:text-5xl italic leading-tight text-balance">
          {persona === 'outlet' ? (
            <>Live roster · <span className="text-red-700">{discoverCity}</span></>
          ) : (
            <>Pick a shift · <span className="text-red-700">{discoverCity}</span></>
          )}
        </motion.h1>
      </motion.div>

      <section className="space-y-4">
        <div className="rounded-2xl border border-neutral-200/90 bg-neutral-50/90 p-3 sm:p-4 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,min(100%,280px))_1fr] md:items-start md:gap-x-4 md:gap-y-3">
          <label className="flex flex-col gap-2 min-w-0 w-full" htmlFor="shift-role-filter">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Role type</span>
            <select
              id="shift-role-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-[14px] font-semibold text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600/25 focus:border-red-400"
            >
              {DISCOVER_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <div className="min-w-0 flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Roster filters</span>
            <div className="flex flex-wrap gap-2">
              <FilterChip label="All types" active={filter === 'all'} onClick={() => setFilter('all')} />
              <FilterChip label="Hand-picked" active={filter === 'curated'} onClick={() => setFilter('curated')} color="gold" />
              <FilterChip label="Open roster" active={filter === 'open'} onClick={() => setFilter('open')} color="blue" />
              <FilterChip label="No gate fee" active={freeOnly} onClick={() => setFreeOnly((v) => !v)} color="blue" />
            </div>
          </div>
        </div>

        {joinNote && (
          <div className="bg-red-50 border border-red-400 rounded-2xl px-4 py-3 text-sm text-red-800 flex items-center justify-between gap-3">
            <span>{joinNote}</span>
            <button type="button" onClick={() => setJoinNote(null)} className="text-red-600 hover:text-red-700"><X size={16}/></button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-[22px] overflow-hidden border border-neutral-200/70 bg-white p-4 space-y-3">
                <div className="skeleton h-5 w-2/3" />
                <div className="skeleton h-3.5 w-1/2" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-4/5" />
                <div className="flex items-center justify-between mt-2">
                  <div className="skeleton h-6 w-20 rounded-full" />
                  <div className="skeleton h-8 w-24 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : hangouts.length === 0 ? (
          <div className="text-center py-20 text-neutral-400 border border-dashed border-neutral-200 rounded-3xl">
            <ClipboardList size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-display text-2xl italic mb-2">Nothing in {discoverCity}.</p>
            <p className="text-sm mb-5">Widen filters{persona === 'outlet' ? ' — or post shifts.' : '.'}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFilter('all');
                  setCategoryFilter('all');
                  setFreeOnly(false);
                }}
                className="text-[10px] font-black uppercase tracking-widest border border-neutral-300 text-neutral-800 px-5 py-3 rounded-full hover:border-red-400"
              >
                Reset filters
              </button>
              {persona === 'outlet' ? (
                <button type="button" onClick={() => onSwitchTab('host')} className="text-[10px] font-black uppercase tracking-widest bg-red-700 text-white px-6 py-3 rounded-full hover:bg-red-800 transition-colors">
                  Post a shift
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {hangouts.map((h: any) => {
              const isCurated = h.type === 'curated';
              const badgeClass = isCurated
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-sky-50 text-sky-800 border-sky-200';
              const isFull = (h.current_guests || 0) >= (h.max_guests || 0);
              const payReq = shiftCardPayAndRequirements(h);
              const smartBadges = shiftIntelligenceBadges(h, discoverCity);
              return (
                <motion.div
                  key={h.id}
                  variants={staggerItem}
                  whileHover={{ y: -4 }}
                  className="relative bg-white rounded-[26px] md:rounded-[28px] p-4 md:p-6 border border-neutral-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.03] hover:border-red-300 hover:shadow-[0_12px_40px_rgba(185,28,28,0.09)] transition-shadow flex flex-col justify-between group overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-700 via-red-600 to-neutral-900 opacity-90" />
                  <div>
                    <div className="flex justify-between items-start mb-3 md:mb-5 gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border ${badgeClass}`}>
                        {h.type}
                      </span>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-red-700 text-[10px] uppercase font-black tracking-widest bg-red-50 px-2 py-1 rounded-full border border-red-200">Open</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-neutral-500 border border-neutral-200 bg-neutral-50 px-2 py-0.5 rounded-full">18+</span>
                      </div>
                    </div>
                    <h3 className="font-display text-xl md:text-2xl lg:text-3xl mb-3 md:mb-4 leading-tight text-neutral-900">{h.title}</h3>

                    {persona !== 'outlet' ? (
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {smartBadges.map((badge) => (
                          <span
                            key={`${h.id}-${badge.label}`}
                            className={`rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-widest ${shiftBadgeClass(badge.tone)}`}
                          >
                            {badge.label}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="space-y-2 mb-4 md:mb-5">
                      <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 px-3 py-2.5">
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-900 mb-1 flex items-center gap-1.5">
                          <Ticket size={11} className="shrink-0 opacity-90" aria-hidden /> Transparent pay
                        </p>
                        <p className="text-sm font-semibold text-neutral-900 leading-snug">{payReq.payHeadline}</p>
                        <p className="text-[11px] text-neutral-600 leading-snug mt-1">{payReq.paySub}</p>
                      </div>
                      <div className="rounded-xl border border-neutral-200/90 bg-neutral-50/60 px-3 py-2.5">
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-neutral-600 mb-1">Requirements &amp; briefing</p>
                        {payReq.dressLine ? (
                          <p className="text-[13px] text-neutral-900">
                            <span className="font-semibold text-neutral-500">Dress · </span>
                            {payReq.dressLine}
                          </p>
                        ) : null}
                        <p className={`text-[13px] text-neutral-700 leading-snug ${payReq.dressLine ? 'mt-1.5' : ''} line-clamp-4`}>
                          {payReq.briefing}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-[13px] md:text-sm text-neutral-500 mb-5 md:mb-8">
                      <div className="flex items-center gap-2"><Clock size={14} className="shrink-0 text-red-700/80" /> {h.formatted_time || 'TBD'} <span className="text-xs ml-1 font-bold text-neutral-400">• {h.formatted_date}</span></div>
                      <div className="flex items-start gap-2"><MapPin size={14} className="shrink-0 mt-0.5 text-red-700/80" /> <span className="leading-snug">{h.location}</span></div>
                      {h.host_name && (
                        <div className="flex items-center gap-2 text-red-700">
                          <Star size={14} className="shrink-0" /> Hosted by {h.host_name}
                          {h.host_tier === 'black' && <span className="text-[8px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-black">BLACK</span>}
                          {h.host_verified && <ShieldCheck size={11} className="text-red-700" />}
                        </div>
                      )}
                    </div>
                  </div>

                    <div className="border-t border-neutral-100 pt-4 md:pt-5 mt-auto space-y-3">
                    {/* Filled count row */}
                    <div className="flex items-center gap-3 min-w-0 flex-wrap">
                      <div className="flex -space-x-2 shrink-0">
                        {(h.attendees || []).slice(0, 4).map((a: any) => (
                          <div
                            key={a.user_id}
                            className="w-8 h-8 rounded-full border-2 border-white bg-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-700"
                            title={a.name || 'Staff'}
                          >
                            {(a.name || '?')[0]?.toUpperCase()}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-neutral-500 font-bold tabular-nums">{h.current_guests || 0} / {h.max_guests || 0} filled</span>
                    </div>

                    {/* Apply button or status */}
                    {(() => {
                      const appliedStatus = appliedIds[h.id];
                      if (appliedStatus === 'confirmed') {
                        return (
                          <div className="pop-in rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 font-semibold flex items-center gap-2">
                            <Check size={14} className="shrink-0" /> Confirmed — check WhatsApp for details.
                          </div>
                        );
                      }
                      if (appliedStatus) {
                        return (
                          <div className="pop-in rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 font-semibold flex items-center gap-2">
                            <Hourglass size={14} className="shrink-0" /> Applied · {appliedStatus} — outlet will confirm.
                          </div>
                        );
                      }
                      if (isFull) {
                        return (
                          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500 font-semibold">
                            Fully staffed
                          </div>
                        );
                      }
                      if (applyOpenId === h.id) {
                        return (
                          <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4 space-y-3">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-red-700">Smart application</p>
                              {applicationDefaults?.payout_phone ? (
                                <p className="text-[11px] text-neutral-600 mt-1">
                                  Reused your last payout details. Edit before sending if needed.
                                </p>
                              ) : (
                                <p className="text-[11px] text-neutral-600 mt-1">
                                  Add payout details once, then future applications prefill automatically.
                                </p>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Provider</label>
                                <select
                                  value={applyProvider}
                                  onChange={(e) => setApplyProvider(e.target.value)}
                                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-red-600/25"
                                >
                                  {(['OPay', 'PalmPay', 'Moniepoint'] as const).map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Phone</label>
                                <input
                                  type="tel"
                                  value={applyPhone}
                                  onChange={(e) => setApplyPhone(e.target.value)}
                                  placeholder="080xxxxxxxx"
                                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-red-600/25 placeholder:text-neutral-400"
                                />
                              </div>
                            </div>
                            <input
                              type="text"
                              value={applyNote}
                              onChange={(e) => setApplyNote(e.target.value)}
                              placeholder="Note to outlet (optional)"
                              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-red-600/25 placeholder:text-neutral-400"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleApplySubmit(h.id)}
                                disabled={applyingId === h.id}
                                className="flex-1 bg-red-700 text-white text-[10px] font-black uppercase tracking-widest py-2.5 rounded-full hover:bg-red-800 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                              >
                                {applyingId === h.id ? <Loader2 size={12} className="animate-spin" /> : <><Send size={12} /> Send application</>}
                              </button>
                              <button
                                type="button"
                                onClick={() => { setApplyOpenId(null); setApplyPhone(''); setApplyNote(''); }}
                                className="px-4 rounded-full border border-neutral-200 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:border-red-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            setApplyOpenId(h.id);
                            setApplyProvider(applicationDefaults?.payout_provider || 'OPay');
                            setApplyPhone(applicationDefaults?.payout_phone || '');
                            setApplyNote(applicationDefaults?.note || suggestedApplicationNote(h));
                            setJoinNote(null);
                          }}
                          disabled={joiningId === h.id}
                          className="w-full min-h-10 text-[10px] uppercase font-black tracking-widest text-white bg-neutral-900 hover:bg-red-700 px-4 py-2.5 rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                        >
                          Apply for shift <ArrowRight size={12} className="mb-0.5" />
                        </button>
                      );
                    })()}
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await copyHangoutInviteLink(h.id);
                          if (ok) {
                            setInviteCopiedId(h.id);
                            setTimeout(() => setInviteCopiedId((cur) => (cur === h.id ? null : cur)), 2000);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-full border border-neutral-200 text-[9px] font-black uppercase tracking-widest text-neutral-600 hover:border-red-300 hover:text-red-800"
                      >
                        {inviteCopiedId === h.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        {inviteCopiedId === h.id ? 'Copied' : 'Copy link'}
                      </button>
                      <button
                        type="button"
                        onClick={() => shareHangoutInvite(h.id, h.title)}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-full border border-red-200 bg-red-50 text-[9px] font-black uppercase tracking-widest text-red-800 hover:bg-red-100"
                      >
                        <Share2 size={12} /> Share
                      </button>
                      {h.vendor_slug ? (
                        <Link
                          href={`/v/${h.vendor_slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 rounded-full text-[9px] font-black uppercase tracking-widest text-neutral-500 hover:text-red-800"
                        >
                          Preview outlet
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   INSTANT PLAN MODAL — the magic moment
   ══════════════════════════════════════════════════════════════════════ */
function InstantPlanModal({
  phase, plan, pulse, creditsResetAt, onAccept, onSkip, onDelay, onClose,
}: { phase: 'matching' | 'ready' | 'gated'; plan: any; pulse: Pulse; creditsResetAt: string | null; onAccept: () => void; onSkip: () => void; onDelay: () => void; onClose: () => void }) {
  const modal = (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[180] flex items-end md:items-center justify-center p-0 md:p-6 bg-neutral-950/55 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[92dvh] overflow-y-auto overscroll-contain bg-white border border-neutral-200 rounded-t-[32px] md:rounded-[32px] md:max-h-[calc(100dvh-3rem)] shadow-[0_-30px_60px_rgba(0,0,0,0.18)]"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600"><X size={16}/></button>

        {/* Header */}
        <div className="relative px-6 md:px-8 pt-8 pb-5">
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-red-50 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full border ${ENERGY_COLORS[pulse.energy]}`}>{pulse.tag}</span>
              <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-black">{pulse.area} · {pulse.city}</span>
            </div>
            {phase === 'gated' ? (
              <>
                <h2 className="font-display text-3xl md:text-4xl italic mb-2">Matching paused</h2>
                <p className="text-neutral-600 text-sm">Weekly matching used{pulse.area ? ` · ${pulse.area}` : ''}. Resets soon.</p>
              </>
            ) : phase === 'matching' ? (
              <>
                <h2 className="font-display text-3xl md:text-4xl italic mb-2">Matching your vibe…</h2>
                <p className="text-neutral-600 text-sm">Finding people near you.</p>
              </>
            ) : (
              <>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl italic mb-2 break-words">{plan?.title}</h2>
                <p className="text-neutral-600 text-sm flex items-center gap-2">
                  <Sparkles size={12} className="text-red-700"/> AI matched · {(plan?.people?.length || 0) + 1} people
                </p>
              </>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 md:px-8 py-5 border-t border-neutral-100 bg-white/95 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {phase === 'gated' ? (
            <div className="flex flex-col items-center justify-center gap-5 py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 border border-red-600 flex items-center justify-center">
                <Sparkles size={26} className="text-red-700"/>
              </div>
              <div>
                <h3 className="font-display text-2xl italic text-neutral-900 mb-1">Weekly limit reached</h3>
                <p className="text-neutral-600 text-sm max-w-xs mx-auto">
                  Resets weekly.{creditsResetAt && <> Next: <strong>{new Date(creditsResetAt).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</strong>.</>}
                </p>
              </div>
              <button onClick={onClose} type="button" className="w-full py-3 rounded-full bg-red-700 text-white font-black uppercase tracking-widest text-[11px] shadow-[0_0_25px_rgba(185,28,28,0.2)]">
                Got it
              </button>
            </div>
          ) : phase === 'matching' ? (
            <div className="flex flex-col items-center justify-center gap-4 py-10">
              <div className="relative">
                <Loader2 size={42} className="animate-spin text-red-700" />
                <div className="absolute inset-0 rounded-full bg-red-50 blur-2xl" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-neutral-500">Decision fatigue → killed</p>
            </div>
          ) : (
            <>
              {/* People row */}
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <div className="flex -space-x-2">
                  {plan?.people?.map((p: any, i: number) => (
                    <div
                      key={i}
                      className="w-11 h-11 rounded-full border-2 border-white bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-800"
                    >
                      {(p.name || '?')[0]?.toUpperCase()}
                    </div>
                  ))}
                </div>
                <div className="text-[11px] uppercase tracking-widest font-black text-neutral-600">
                  +{plan?.people?.length || 0} matched
                </div>
              </div>

              {/* Plan card */}
              <div className="rounded-2xl border border-neutral-200 bg-neutral-100 p-4 mb-5 space-y-2.5 text-sm">
                <div className="flex items-center gap-2 text-neutral-800"><Building2 size={14} className="text-red-700"/> {plan?.venue}</div>
                <div className="flex items-center gap-2 text-neutral-800"><Clock     size={14} className="text-red-700"/> {plan?.date} · {plan?.time}</div>
                <div className="flex items-center gap-2 text-neutral-800"><Users     size={14} className="text-red-700"/> {(plan?.people?.length || 0) + 1} · similar vibe</div>
                {plan?.live && <div className="text-[10px] uppercase tracking-widest text-emerald-700 font-black">Live · apply now</div>}
                {!plan?.live && <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-black">Locks after 3 confirm</div>}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-2">
                <button onClick={onSkip}  className="flex flex-col items-center gap-1 py-3 rounded-xl border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 transition-colors">
                  <SkipForward size={16}/><span className="text-[9px] uppercase tracking-widest font-black">Skip</span>
                </button>
                <button onClick={onDelay} className="flex flex-col items-center gap-1 py-3 rounded-xl border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 transition-colors">
                  <Hourglass size={16}/><span className="text-[9px] uppercase tracking-widest font-black">Delay</span>
                </button>
                <button onClick={onAccept} className="flex flex-col items-center gap-1 py-3 rounded-xl bg-red-700 text-white font-black hover:bg-red-800 transition-colors shadow-[0_0_20px_rgba(185,28,28,0.2)]">
                  <Zap size={16} fill="currentColor"/><span className="text-[9px] uppercase tracking-widest">Apply</span>
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
  return typeof document !== 'undefined' ? createPortal(modal, document.body) : null;
}

function FilterChip({ label, active, onClick, color = 'cream' }: any) {
  const baseColors: Record<string, string> = {
    cream: active ? 'bg-neutral-900 text-white font-bold shadow-[0_0_15px_rgba(0,0,0,0.08)]' : 'bg-neutral-100 text-neutral-600 border border-neutral-200 hover:border-neutral-300',
    gold:  active ? 'bg-red-50 text-red-700 border border-red-600 shadow-[0_0_15px_rgba(185,28,28,0.12)]' : 'bg-neutral-100 text-red-600 border border-red-100 hover:border-red-400',
    blue:  active ? 'bg-[#1a3a5f]/30 text-[#4da6ff] border border-[#4da6ff]/50 shadow-[0_0_15px_rgba(77,166,255,0.2)]' : 'bg-neutral-100 text-[#4da6ff]/60 border border-[#4da6ff]/10 hover:border-[#4da6ff]/30',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-widest transition-all text-center leading-tight max-[360px]:whitespace-normal sm:whitespace-nowrap ${baseColors[color]}`}
    >
      {label}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   HOST TAB — Real hangout creation
   ══════════════════════════════════════════════════════════════════════ */
function tableSizeFillPercent(size: number, min: number, max: number) {
  if (max <= min) return '0%';
  return `${((size - min) / (max - min)) * 100}%`;
}

/** Outlet Screen 8 — verified workers from DB (+ certs when present). */
function MatchedWorkersPanel({
  cityName,
  area,
  shiftRole,
}: {
  cityName: string;
  area: string;
  shiftRole: string;
}) {
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [rows, setRows] = useState<
    {
      id: string;
      name: string;
      avatar: string;
      rating: number | null;
      zone: string;
      certifications: string[];
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const q = new URLSearchParams({
      city: cityName,
      area: area || '',
      role: shiftRole || '',
    });
    setLoading(true);
    fetch(`/api/outlet/matched-workers?${q}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setRows(Array.isArray(d.workers) ? d.workers : []);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cityName, area, shiftRole]);

  return (
    <div className="max-w-lg mx-auto text-left rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-[0_8px_28px_rgba(0,0,0,0.06)] mt-8">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-1">Matched for your shift</p>
      <h3 className="font-display text-xl italic text-neutral-900">Verified matches</h3>
      <p className="text-[12px] text-neutral-500 mt-1 mb-4">
        <strong className="text-neutral-700">{cityName}</strong>
        {area ? <> · {area}</> : null}
        {' '}· {shiftRole}. Profile location required.
      </p>
      {loading ? (
        <div className="flex items-center gap-2 py-6 text-neutral-500 text-sm">
          <Loader2 size={18} className="animate-spin text-red-700" /> Loading matches…
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-neutral-600 py-4">
          No matches yet — add verified workers or widen city/role.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((w) => (
            <li
              key={w.id}
              className="flex gap-3 rounded-xl border border-neutral-100 bg-neutral-50/90 p-3 items-center"
            >
              <img
                src={w.avatar}
                alt=""
                className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-white shadow-sm"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-neutral-900">{w.name}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 bg-white border border-neutral-200 px-2 py-0.5 rounded-full">
                    {w.zone}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-[11px] text-amber-800 font-semibold">
                  <Star size={12} className="fill-amber-500 text-amber-500 shrink-0" aria-hidden />
                  {w.rating != null ? `${w.rating.toFixed(1)} · rated` : 'New · unrated'}
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {w.certifications.map((c, i) => (
                    <span
                      key={`${w.id}-${i}-${c}`}
                      className="text-[9px] font-bold uppercase tracking-wider bg-white border border-neutral-200 px-2 py-0.5 rounded-full text-neutral-700"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmed(w.id)}
                className={`shrink-0 rounded-full min-h-[44px] px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
                  confirmed === w.id ? 'bg-emerald-600 text-white' : 'bg-red-700 text-white hover:bg-red-800'
                }`}
              >
                {confirmed === w.id ? 'Confirmed' : 'Confirm'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function HostTab({
  onPosted,
  cities,
  addCity,
}: {
  onPosted: () => void;
  cities: string[];
  addCity: (name: string) => void;
}) {
  const tableMin = 1;
  const tableMax = 40;
  const [size, setSize] = useState(4);
  const [type, setType] = useState('open');
  const [title, setTitle] = useState('');
  const [vibe, setVibe] = useState('');
  const [dressCode, setDressCode] = useState('');
  const [shiftRole, setShiftRole] = useState<string>(ALL_STAFF_ROLES[0] || 'Waiter');
  const [zone, setZone] = useState<string>(LAGOS_ZONES[0]);
  const [location, setLocation] = useState('');
  const [city, setCity] = useState<string>(DEFAULT_CITIES[0]);
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [payNgn, setPayNgn] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdHangoutId, setCreatedHangoutId] = useState<string | null>(null);
  const [inviteCopiedHost, setInviteCopiedHost] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!cities.length) return;
    setCity((prev) => (cities.some((c) => c.toLowerCase() === prev.toLowerCase()) ? prev : cities[0]));
  }, [cities]);

  useEffect(() => {
    if (city === 'Lagos') {
      setZone((z) =>
        LAGOS_ZONES.includes(z as (typeof LAGOS_ZONES)[number]) ? z : LAGOS_ZONES[0],
      );
    } else {
      setZone((z) => (LAGOS_ZONES.includes(z as (typeof LAGOS_ZONES)[number]) ? '' : z));
    }
  }, [city]);

  const handleSubmit = async () => {
    if (!title.trim() || !vibe.trim() || !location.trim() || !eventDate || !eventTime) {
      setError('Fill in shift name, notes, venue, date, and time.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const event_time = new Date(`${eventDate}T${eventTime}`).toISOString();
      const vibeBlock = [dressCode.trim() ? `Dress: ${dressCode.trim()}.` : '', vibe.trim()].filter(Boolean).join(' ');
      const res = await fetch('/api/hangouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: `[${shiftRole}] ${title.trim()}`,
          vibe: vibeBlock,
          type,
          category: 'social',
          event_time,
          location: location.trim(),
          city: city.trim(),
          area: zone.trim() || null,
          max_guests: size,
          ticket_price: payNgn.trim() ? Number(payNgn) : null,
          cover_image: null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (city.trim()) addCity(city.trim());
        setCreatedHangoutId(data.hangout?.id ? String(data.hangout.id) : null);
        setSuccess(true);
      } else {
        let msg = data.error || 'Failed to create hangout.';
        if (data.code === 'OUTLET_NOT_APPROVED') {
          msg = `${msg} Finish outlet registration or wait for approval.`;
        }
        setError(msg);
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 280, damping: 18 }}
          className="w-20 h-20 border border-red-400 flex items-center justify-center mx-auto mb-6 rounded-full bg-red-50 shadow-[0_0_30px_rgba(201,168,76,0.25)]">
          <Check size={32} className="text-red-700" />
        </motion.div>
        <h2 className="font-display text-4xl italic text-neutral-900 mb-3">Shift is live.</h2>
            <p className="text-neutral-500 text-base mb-6 max-w-md mx-auto">
              Live on the board for your zone — share link on WhatsApp.
            </p>
        <MatchedWorkersPanel cityName={city} area={zone} shiftRole={shiftRole} />
        {createdHangoutId ? (
          <div className="max-w-md mx-auto mb-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Invite link</p>
            <p className="text-xs text-neutral-600 break-all font-mono mb-2">{publicInviteUrl(createdHangoutId)}</p>
            <p className="text-[11px] text-neutral-500 mb-3">
              Copy or share — WhatsApp prefills the message.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={async () => {
                  const ok = await copyHangoutInviteLink(createdHangoutId);
                  if (ok) {
                    setInviteCopiedHost(true);
                    setTimeout(() => setInviteCopiedHost(false), 2000);
                  }
                }}
                className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-red-700 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-800"
              >
                {inviteCopiedHost ? <Check size={14} /> : <Copy size={14} />}
                {inviteCopiedHost ? 'Copied' : 'Copy link'}
              </button>
              <button
                type="button"
                onClick={() => shareHangoutInvite(createdHangoutId, title || 'Open shift')}
                className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full border border-neutral-300 text-[10px] font-black uppercase tracking-widest text-neutral-800 hover:border-red-400"
              >
                <Share2 size={14} /> Share
              </button>
              <button
                type="button"
                onClick={() => openWhatsAppHangoutInvite(createdHangoutId, title || 'Open shift')}
                className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full border border-emerald-600/40 bg-emerald-50 text-emerald-900 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100"
              >
                <MessageCircle size={14} /> WhatsApp
              </button>
              <Link
                href={`/join/${createdHangoutId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2 text-[10px] font-black uppercase tracking-widest text-red-700 hover:underline"
              >
                Open shift page
              </Link>
            </div>
          </div>
        ) : null}
        <div className="flex justify-center gap-3 flex-wrap">
          <button onClick={onPosted} className="bg-red-700 text-white px-6 py-3 rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-red-800 transition-colors">View on board</button>
          <button onClick={() => { setSuccess(false); setCreatedHangoutId(null); setTitle(''); setVibe(''); setDressCode(''); setPayNgn(''); setShiftRole(ALL_STAFF_ROLES[0] || 'Waiter'); setZone(LAGOS_ZONES[0]); setLocation(''); setCity(DEFAULT_CITIES[0]); setEventDate(''); setEventTime(''); }}
            className="text-red-700 text-[10px] uppercase tracking-widest font-black hover:text-red-800 transition-colors">Post another →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 md:space-y-6 max-w-3xl mx-auto h-full flex flex-col">
      <div className="mb-5 md:mb-12 text-left md:text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-600 mb-2 flex items-center gap-2 md:justify-center">
          <PlusSquare size={12} className="shrink-0" aria-hidden /> Vendor · post shift
        </p>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl italic mb-2">Post <span className="text-red-700">cover.</span></h1>
        <p className="text-neutral-500 text-base md:text-lg mb-4 max-w-xl md:mx-auto">
          Role, zone, dress, headcount — same-day mobile money when filled.
        </p>
        <div className="hidden md:flex justify-center">
          <FlowSteps steps={[
            { n: '1', label: 'Role & zone', sub: 'Lagos accuracy' },
            { n: '2', label: 'Venue & time', sub: 'date + headcount' },
            { n: '3', label: 'Go live',    sub: 'roster in 24h' },
          ]}/>
        </div>
        <div className="md:hidden grid grid-cols-3 gap-2">
          {[
            ['1', 'Role'],
            ['2', 'Venue'],
            ['3', 'Live'],
          ].map(([n, label]) => (
            <div key={n} className="bg-neutral-50 border border-neutral-200 rounded-2xl px-3 py-2">
              <span className="text-red-700 text-[10px] font-black">{n}</span>
              <p className="text-[10px] uppercase tracking-widest font-black text-neutral-600">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white backdrop-blur-lg border border-neutral-200/90 rounded-[28px] md:rounded-[40px] p-5 md:p-12 shadow-[0_12px_40px_rgba(0,0,0,0.05)] flex-1">
        <div className="space-y-7 md:space-y-10">
          <Field label="Shift title">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Friday dinner cover — 4 waiters"
              className="w-full bg-transparent border-b border-neutral-200 pb-3 text-xl sm:text-2xl md:text-3xl focus:outline-none focus:border-red-700 placeholder:text-neutral-400 transition-colors font-display italic text-neutral-900" />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Role">
              <select
                value={shiftRole}
                onChange={(e) => setShiftRole(e.target.value)}
                className="w-full bg-transparent border-b border-neutral-200 pb-3 text-[15px] md:text-base text-neutral-800 focus:outline-none focus:border-red-700"
              >
                {STAFF_ROLE_GROUPS.map((g) => (
                  <optgroup key={g.key} label={g.label}>
                    {g.roles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>
            <Field label="City (filter)" hint="Board & pulse use city only">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-transparent border-b border-neutral-200 pb-3 text-[15px] md:text-base text-neutral-800 focus:outline-none focus:border-red-700"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field
              label={city === 'Lagos' ? 'Area / zone (Lagos)' : 'Area / district'}
              hint={city === 'Lagos' ? undefined : '(optional)'}
            >
              {city === 'Lagos' ? (
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full bg-transparent border-b border-neutral-200 pb-3 text-[15px] md:text-base text-neutral-800 focus:outline-none focus:border-red-700"
                >
                  {LAGOS_ZONES.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  placeholder="Neighbourhood or district"
                  className="w-full bg-transparent border-b border-neutral-200 pb-3 text-[15px] md:text-base text-neutral-800 focus:outline-none focus:border-red-700 placeholder:text-neutral-400 transition-colors font-sans"
                />
              )}
            </Field>
            <Field label="Venue address" hint="Street · gate · landmark — stored on this shift">
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Full address for staff navigation"
                className="w-full bg-transparent border-b border-neutral-200 pb-3 text-[15px] md:text-base text-neutral-800 focus:outline-none focus:border-red-700 placeholder:text-neutral-400 transition-colors font-sans" />
            </Field>
          </div>

          <Field label="Pay per shift (₦)" hint="Workers see this on the board">
            <input
              type="number"
              min={0}
              step={500}
              value={payNgn}
              onChange={(e) => setPayNgn(e.target.value)}
              placeholder="e.g. 15000"
              className="w-full bg-transparent border-b border-neutral-200 pb-3 text-[15px] md:text-base text-neutral-800 focus:outline-none focus:border-red-700 placeholder:text-neutral-400 transition-colors font-sans"
            />
          </Field>

          <Field label="Dress code" hint="(required for disputes)">
            <input type="text" value={dressCode} onChange={(e) => setDressCode(e.target.value)} placeholder="e.g. all black, closed shoes, hotel standards"
              className="w-full bg-transparent border-b border-neutral-200 pb-3 text-[15px] md:text-base text-neutral-800 focus:outline-none focus:border-red-700 placeholder:text-neutral-400 transition-colors font-sans" />
          </Field>

          <Field label="Briefing & house rules">
            <input type="text" value={vibe} onChange={(e) => setVibe(e.target.value)} placeholder="Reporting line, parking, break policy, allergies…"
              className="w-full bg-transparent border-b border-neutral-200 pb-3 text-[15px] md:text-base text-neutral-800 focus:outline-none focus:border-red-700 placeholder:text-neutral-400 transition-colors font-sans" />
          </Field>

          <div className="grid grid-cols-2 gap-6">
            <Field label="Date" Icon={Calendar}>
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-transparent border-b border-neutral-200 pb-3 text-base focus:outline-none focus:border-red-700 transition-colors text-neutral-900 [color-scheme:dark]" />
            </Field>
            <Field label="Time" Icon={Clock}>
              <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)}
                className="w-full bg-transparent border-b border-neutral-200 pb-3 text-base focus:outline-none focus:border-red-700 transition-colors text-neutral-900 [color-scheme:dark]" />
            </Field>
          </div>


          {/* Format */}
          <Field label="Format">
            <div className="grid grid-cols-2 gap-3 md:gap-6">
              <button type="button" onClick={() => setType('curated')} className={`text-left flex flex-col gap-1.5 py-4 px-3.5 rounded-[18px] border transition-all ${type === 'curated' ? 'bg-white border-red-600 shadow-[0_0_0_1px_rgba(185,28,28,0.25)]' : 'border-neutral-200/90 bg-white/50 text-neutral-600 hover:border-neutral-300'}`}>
                <span className="flex items-center gap-2 text-red-700">
                  <Zap size={20} strokeWidth={1.75} className="shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Curated</span>
                </span>
                <span className="text-[11px] text-neutral-500 leading-snug pl-7">You approve each name.</span>
              </button>
              <button type="button" onClick={() => setType('open')} className={`text-left flex flex-col gap-1.5 py-4 px-3.5 rounded-[18px] border transition-all ${type === 'open' ? 'bg-sky-50/90 border-sky-600 shadow-[0_0_0_1px_rgba(2,132,199,0.2)]' : 'border-neutral-200/90 bg-white/50 text-neutral-600 hover:border-neutral-300'}`}>
                <span className={`flex items-center gap-2 ${type === 'open' ? 'text-sky-900' : 'text-neutral-800'}`}>
                  <Users size={20} strokeWidth={1.75} className="shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Open roster</span>
                </span>
                <span className="text-[11px] text-neutral-500 leading-snug pl-7">Verified staff claim slots · live roster.</span>
              </button>
            </div>
          </Field>

          {/* Size */}
          <div>
            <label className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.28em] text-gold mb-4 flex justify-between items-end gap-3">
              <span>Headcount · {size} staff</span>
              <span className="text-lg md:text-xl text-red-700 font-display italic font-normal tracking-normal normal-case">{size} people</span>
            </label>
            <input
              type="range"
              min={tableMin}
              max={tableMax}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="convivia-range w-full cursor-pointer"
              style={{ ['--fill' as string]: tableSizeFillPercent(size, tableMin, tableMax) }}
            />
            <div className="flex justify-between text-[10px] text-neutral-500 mt-3 font-medium tabular-nums">
              <span>{tableMin}</span>
              <span>{tableMax}</span>
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mt-6 text-center">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="relative w-full bg-red-700 text-white py-4 md:py-5 rounded-full font-black uppercase tracking-[0.2em] text-[11px] mt-8 md:mt-12 mb-1 max-lg:mb-3 hover:bg-red-800 hover:shadow-[0_0_30px_rgba(185,28,28,0.25)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md md:shadow-none"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <><span>Publish shift</span> <ArrowRight size={16} /></>}
        </button>
      </div>
    </div>
  );
}

function Field({ label, hint, Icon, children }: { label: string; hint?: string; Icon?: any; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.26em] text-gold block mb-3">
        {Icon && <Icon size={12} className="inline mr-1.5 -mt-0.5 text-gold/90 opacity-90" strokeWidth={2} />}{label}{hint && <span className="text-gold/55 ml-1.5 normal-case font-medium tracking-normal">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function HomeExploreSnippets({
  persona,
  onSwitchTab,
  openTablesCount,
  outletThreeTab,
}: {
  persona: StaffPersona;
  onSwitchTab: (t: AppTab) => void;
  openTablesCount: number;
  outletThreeTab?: boolean;
}) {
  const cards: { tab: AppTab; title: string; sub: string; Icon: typeof Ticket }[] = outletThreeTab
    ? [
        { tab: 'home', title: 'Today', sub: 'Overview · approval', Icon: CalendarDays },
        { tab: 'demand', title: 'Demand', sub: 'Board & post shifts', Icon: ClipboardList },
        { tab: 'pay', title: 'Pay', sub: 'Settlements · rails', Icon: Wallet },
        { tab: 'profile', title: 'Profile', sub: 'Public page · trust', Icon: UserCircle },
      ]
    : [
        { tab: 'discover', title: 'Shifts', sub: 'Future · full board', Icon: ClipboardList },
        { tab: 'host', title: 'Record', sub: 'Pay, slips & disputes', Icon: Receipt },
        { tab: 'circles', title: 'Learn', sub: 'Hospitality courses', Icon: GraduationCap },
        { tab: 'profile', title: 'Profile', sub: 'Rating · wallet · trust', Icon: UserCircle },
      ];
  return (
    <motion.section
      className="space-y-4"
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-50px' }}
    >
      <motion.div variants={fadeUp} className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-1">More</p>
          <h2 className="font-display text-xl md:text-2xl italic">Jump anywhere</h2>
        </div>
      </motion.div>
      <div className={`grid gap-2.5 md:gap-3 ${outletThreeTab ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-4'}`}>
        {cards.map(({ tab, title, sub, Icon }) => (
          <motion.button
            key={tab}
            type="button"
            variants={staggerItem}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSwitchTab(tab)}
            className="text-left rounded-[22px] border border-neutral-200/90 bg-white shadow-[0_6px_22px_rgba(0,0,0,0.05)] hover:border-red-400 hover:shadow-[0_12px_36px_rgba(185,28,28,0.1)] p-3.5 md:p-4 transition-shadow active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 to-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Icon size={19} className="text-red-700 mb-2.5 opacity-90 group-hover:opacity-100" />
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-neutral-900 mb-0.5">{title}</p>
            <p className="text-[10px] text-neutral-500 leading-snug line-clamp-2">{sub}</p>
            <span className="mt-2.5 inline-flex items-center gap-0.5 text-[8px] font-black uppercase tracking-widest text-red-600">
              Go <ChevronRight size={11} className="opacity-80" />
            </span>
          </motion.button>
        ))}
      </div>
    </motion.section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   HOME TAB — live landing: city pulse, AI match, app snippets
   ══════════════════════════════════════════════════════════════════════ */
function StaffMetroFilters({
  cities,
  selectedCity,
  onSelectCity,
}: {
  cities: string[];
  selectedCity: string;
  onSelectCity: (c: string) => void;
}) {
  const chipPad =
    'min-h-9 px-4 py-1.5 text-[10px] uppercase tracking-widest font-black rounded-full transition-all max-[380px]:text-[9px]';

  return (
    <div className="w-full min-w-0">
      <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500 block mb-2">
        City
      </span>
      <div className="w-full min-w-0 rounded-2xl border border-neutral-200 bg-neutral-100/90 p-2">
        <div className="flex w-full min-w-0 flex-wrap gap-2">
          {cities.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => onSelectCity(c)}
              className={`${chipPad} ${
                selectedCity === c
                  ? 'bg-red-700 text-white shadow-[0_0_12px_rgba(185,28,28,0.2)]'
                  : 'text-neutral-600 hover:text-neutral-900 active:bg-neutral-200/60'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Staff app Today tab only — outlet Today uses `OutletLandingTab`. */
function HomeTab({
  onSwitchTab,
  cities,
  addCity,
  boardCity,
  onBoardCityChange,
}: {
  onSwitchTab: (t: AppTab) => void;
  cities: string[];
  addCity: (name: string) => void;
  boardCity: string;
  onBoardCityChange: (c: string) => void;
}) {
  const freeMode = everythingFree();
  const [hangouts, setHangouts] = useState<any[]>([]);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinNote, setJoinNote] = useState<string | null>(null);

  const [pulseCards, setPulseCards] = useState<Pulse[]>([]);
  const [pulseLoading, setPulseLoading] = useState(true);
  const [activePulse, setActivePulse] = useState<Pulse | null>(null);
  const [vibePrompt, setVibePrompt] = useState('');
  const [matchPhase, setMatchPhase] = useState<'idle' | 'matching' | 'ready' | 'gated'>('idle');
  const [matchedPlan, setMatchedPlan] = useState<any | null>(null);
  const [premium, setPremium] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsResetAt, setCreditsResetAt] = useState<string | null>(null);
  const [matchMetaLoaded, setMatchMetaLoaded] = useState(false);
  const [matchAnonymous, setMatchAnonymous] = useState(false);
  const effectivePremium = freeMode || premium;

  const visiblePulseCards = pulseCards;

  const loadCityData = useCallback(async (city: string) => {
    try {
      const hRes = await fetch(`/api/hangouts?city=${encodeURIComponent(city)}&next_hours=24`);
      const hJson = await hRes.json();
      setHangouts(Array.isArray(hJson.hangouts) ? hJson.hangouts : []);
    } catch {
      setHangouts([]);
    }
  }, []);

  const loadPulse = useCallback((city: string) => {
    setPulseLoading(true);
    fetch(`/api/pulse?city=${encodeURIComponent(city)}`)
      .then(r => r.json())
      .then(data => {
        const cards: Pulse[] = (data.pulse || []).map((p: any) => ({
          id: p.id, area: p.area, city: p.city, vibe: p.vibe, energy: p.energy, tag: p.tag,
          groupSize: p.group_size, liveTables: p.live_tables,
        }));
        setPulseCards(cards);
      })
      .catch(() => setPulseCards([]))
      .finally(() => setPulseLoading(false));
  }, []);

  const loadMatchStatus = useCallback(() => {
    setMatchMetaLoaded(false);
    fetch('/api/match')
      .then(async (r) => {
        if (r.status === 401) {
          setMatchAnonymous(true);
          setPremium(false);
          setCredits(null);
          setCreditsResetAt(null);
          return;
        }
        setMatchAnonymous(false);
        const data = await r.json();
        setPremium(!!data.premium);
        setCredits(data.credits_remaining ?? null);
        setCreditsResetAt(data.credits_reset_at || null);
      })
      .catch(() => {
        setMatchAnonymous(false);
      })
      .finally(() => setMatchMetaLoaded(true));
  }, []);

  useEffect(() => {
    loadCityData(boardCity);
  }, [boardCity, loadCityData]);

  useEffect(() => {
    loadMatchStatus();
  }, [loadMatchStatus]);

  useEffect(() => {
    loadPulse(boardCity);
  }, [boardCity, loadPulse]);

  useEffect(() => {
    if (!cities.length || cities.some((c) => c.toLowerCase() === boardCity.toLowerCase())) {
      return;
    }
    let cancelled = false;
    const next = cities[0];
    queueMicrotask(() => {
      if (!cancelled) onBoardCityChange(next);
    });
    return () => {
      cancelled = true;
    };
  }, [cities, boardCity, onBoardCityChange]);

  const openTablesCount = useMemo(
    () => hangouts.filter((h: any) => (h.current_guests || 0) < (h.max_guests || 0)).length,
    [hangouts],
  );

  const handleJoin = async (hangoutId: string) => {
    setJoiningId(hangoutId);
    setJoinNote(null);
    try {
      const res = await fetch(`/api/hangouts/${hangoutId}/join`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setJoinNote("Roster confirmed — check WhatsApp for outlet. Selfie check-in at shift start.");
        loadCityData(boardCity);
      } else {
        setJoinNote(data.error || 'Could not apply.');
      }
    } catch {
      setJoinNote('Network error. Try again.');
    } finally {
      setJoiningId(null);
    }
  };

  const planTitleFromPulse = (pulse: Pulse) => {
    const head = pulse.vibe.split('·')[0]?.trim();
    return `${pulse.area} · ${head || pulse.vibe.slice(0, 32)}`;
  };

  const startMatch = async (pulse: Pulse) => {
    setActivePulse(pulse);
    if (!effectivePremium && credits !== null && credits <= 0) {
      setMatchPhase('gated');
      return;
    }
    setMatchPhase('matching');
    setMatchedPlan(null);

    let realPeople: any[] = [];
    let realIds: string[] = [];
    try {
      const res = await fetch(`/api/people?city=${encodeURIComponent(pulse.city)}`);
      const data = await res.json();
      if (Array.isArray(data.open_to_meet) && data.open_to_meet.length > 0) {
        realPeople = data.open_to_meet.slice(0, pulse.groupSize - 1).map((u: any) => ({
          id: u.id,
          name: u.name,
          bio: u.bio || `${u.location || pulse.city}`,
          avatar: u.avatar_url || `https://i.pravatar.cc/120?u=${u.id}`,
        }));
        realIds = realPeople.map((p) => p.id).filter(Boolean);
      }
    } catch { /* mock fallback */ }

    const people = realPeople.length >= pulse.groupSize - 1
      ? realPeople
      : [...realPeople, ...[...MATCH_POOL].sort(() => Math.random() - 0.5)].slice(0, pulse.groupSize - 1);

    const liveTable = findHangoutForPulse(hangouts, pulse);

    const plan = {
      id: liveTable?.id,
      title: liveTable?.title || planTitleFromPulse(pulse),
      venue: liveTable?.venue_name || liveTable?.location || `${pulse.area}, ${pulse.city}`,
      time: liveTable?.formatted_time || 'Tonight · 7:30 PM',
      date: liveTable?.formatted_date || 'Tonight',
      people,
      pulse,
      live: !!liveTable,
    };
    setMatchedPlan(plan);

    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: pulse.city, area: pulse.area, vibe: pulse.vibe, energy: pulse.energy,
          group_size: pulse.groupSize, action: 'matched',
          hangout_id: liveTable?.id, matched_user_ids: realIds,
        }),
      });
      const data = await res.json();
      if (res.status === 402 && !freeMode) {
        setMatchPhase('gated');
        setCredits(0);
        return;
      }
      if (res.ok) {
        setPremium(!!data.premium);
        if (data.credits_remaining !== null && data.credits_remaining !== undefined) {
          setCredits(Number(data.credits_remaining));
        }
        if (data.credits_reset_at) setCreditsResetAt(data.credits_reset_at);
      }
    } catch { /* still show match */ }

    setMatchPhase('ready');
  };

  const logMatchAction = async (action: 'joined' | 'skipped' | 'delayed') => {
    if (!activePulse) return;
    try {
      await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: activePulse.city, area: activePulse.area, vibe: activePulse.vibe, energy: activePulse.energy,
          group_size: activePulse.groupSize, action, hangout_id: matchedPlan?.id,
        }),
      });
    } catch { /* fire and forget */ }
  };

  const closeMatch = () => { setActivePulse(null); setMatchPhase('idle'); setMatchedPlan(null); };

  const acceptPlan = async () => {
    await logMatchAction('joined');
    if (matchedPlan?.id) {
      await handleJoin(matchedPlan.id);
    } else {
      setJoinNote('We lock the plan when others confirm.');
    }
    closeMatch();
  };
  const skipPlan  = async () => { await logMatchAction('skipped');  closeMatch(); };
  const delayPlan = async () => { await logMatchAction('delayed'); setJoinNote('Another vibe soon.'); closeMatch(); };

  const matchByVibe = () => {
    const list = visiblePulseCards;
    if (list.length === 0) return;
    const v = vibePrompt.toLowerCase();
    let found =
      (v && list.find((p) => p.vibe.toLowerCase().includes(v))) ||
      (v.includes('chill') ? list.find((p) => p.vibe.toLowerCase().includes('brunch') || p.energy === 'rising') : null) ||
      (v.includes('founder') || v.includes('whisky') ? list.find((p) => p.vibe.toLowerCase().includes('whisky') || p.vibe.toLowerCase().includes('lounge')) : null) ||
      (v.includes('dance') || v.includes('music') ? list.find((p) => p.vibe.toLowerCase().includes('music')) : null) ||
      null;
    if (!found) found = list[0];
    startMatch(found);
  };

  return (
    <div className="space-y-6 lg:space-y-12 min-w-0">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        className="rounded-[18px] lg:rounded-[24px] border border-red-200/45 bg-white p-4 sm:p-5 shadow-[0_8px_28px_rgba(0,0,0,0.06)]"
      >
        <StaffMetroFilters
          cities={cities}
          selectedCity={boardCity}
          onSelectCity={onBoardCityChange}
        />
      </motion.section>

      <motion.section
        className="relative overflow-hidden rounded-[18px] lg:rounded-[32px] border border-gold/25 shadow-[0_16px_48px_rgba(0,0,0,0.07),0_0_0_1px_rgba(201,168,76,0.12)] max-lg:shadow-[0_6px_28px_rgba(0,0,0,0.07)]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 32 }}
      >
        {/* Mobile / tablet: logo hero (no photo) + solid panel */}
        <div className="lg:hidden flex flex-col">
          <div className="relative shrink-0 overflow-hidden rounded-t-[18px] border border-b-0 border-gold/25 bg-gradient-to-b from-white via-cream/90 to-[#f8f6f2] px-4 pt-5 pb-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)]">
            <div className="flex flex-col items-center text-center gap-3">
              <BrandLogo
                alt="Convivia24"
                variant="mark"
                className="h-[56px] sm:h-[60px] w-auto max-w-[min(240px,78vw)] object-contain select-none"
              />
              <p className="text-[11px] font-medium text-neutral-600 tracking-[0.03em] max-w-[300px] leading-snug">
                Hotels, bars &amp; events · verified · same-day pay
              </p>
              <p className="text-[9px] font-black uppercase tracking-[0.28em] text-red-700 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-center">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.85)] animate-pulse shrink-0" />
                  <Zap size={11} className="text-amber-600 shrink-0" aria-hidden />
                  Zone · {boardCity.toUpperCase()}
                </span>
                <span className="text-neutral-500 font-bold normal-case tracking-normal">·</span>
                <span className="tabular-nums text-neutral-600">
                  <LiveLocalTime className="tabular-nums" />
                </span>
              </p>
              <h1 className="font-display text-[1.55rem] sm:text-[1.65rem] leading-[1.05] italic text-neutral-900 px-1">
                Hospitality shifts{' '}
                <span className="text-[color:var(--gold-accent,#c9a84c)]">near you</span>
              </h1>
            </div>
          </div>
          <motion.div
            className="rounded-b-[18px] border border-t-0 border-gold/20 bg-gradient-to-b from-cream/95 to-[#f8f6f2] px-3.5 py-3.5 space-y-3"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            <motion.p variants={staggerItem} className="text-[14px] leading-snug text-neutral-800 font-medium [overflow-wrap:anywhere]">
              Shifts by zone · same-day pay when signed off.{` `}
              <button
                type="button"
                onClick={() => onSwitchTab('discover')}
                className="text-red-700 font-semibold underline decoration-red-600/40 underline-offset-2"
              >
                Pick shifts
              </button>
              .
            </motion.p>
            {/* Tab bar already exposes Discover / Host — avoid duplicating CTAs on mobile */}
          </motion.div>
        </div>

        {/* Desktop: clean panel — no hero photography */}
        <div className="hidden lg:block">
          <motion.div
            className="rounded-[28px] border border-neutral-200/90 bg-white p-10 space-y-5 shadow-[0_8px_40px_rgba(0,0,0,0.04)]"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-4">
              <BrandLogo
                alt=""
                className="h-10 sm:h-11 w-auto object-contain object-left shrink-0"
              />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shrink-0" /> Live · <LiveLocalTime />
              </p>
            </motion.div>
            <motion.div variants={staggerItem} className="max-w-2xl space-y-3">
              <p className="text-neutral-500 text-[10px] font-semibold uppercase tracking-[0.28em]">Staff dashboard</p>
              <h1 className="font-display text-4xl xl:text-5xl italic leading-[1.05] text-neutral-900 text-balance">
                Work that <span className="text-red-700">pays today.</span>
              </h1>
              <p className="text-neutral-600 text-base leading-relaxed max-w-xl text-pretty">
                {HOSPITALITY_METROS_BEFORE_LINK}{' '}
                <button
                  type="button"
                  onClick={() => onSwitchTab('discover')}
                  className="text-red-700 font-semibold underline decoration-red-600/40 underline-offset-4 hover:text-red-800"
                >
                  board
                </button>
                .
              </p>
            </motion.div>
            <motion.div variants={staggerItem}>
              <FlowSteps steps={[
                { n: '1', label: 'Post or pick', sub: 'by zone' },
                { n: '2', label: 'Match & confirm', sub: 'roster locked' },
                { n: '3', label: 'Check in · rate', sub: 'same-day pay' },
              ]}/>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {joinNote && (
        <div className="bg-red-50 border border-red-400 rounded-2xl px-4 py-3 text-sm text-red-800 flex items-center justify-between gap-3">
          <span>{joinNote}</span>
          <button type="button" onClick={() => setJoinNote(null)} className="text-red-600 hover:text-red-700"><X size={16}/></button>
        </div>
      )}

      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45 }}
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-1.5 flex items-center gap-2">
              <Zap size={10} aria-hidden /> <span className="max-md:hidden">Zone demand</span>
              <span className="md:hidden tracking-[0.35em] text-[color:var(--gold-accent,#c9a84c)]">Zones</span>
            </p>
            <h2 className="font-display text-2xl md:text-3xl italic">Where shifts are stacking.</h2>
            <p className="mt-2 text-sm text-neutral-600 leading-snug max-md:hidden">
              <strong className="text-neutral-800">24h pulse</strong> in {boardCity}. More dates →{' '}
              <button
                type="button"
                onClick={() => onSwitchTab('discover')}
                className="text-red-700 font-semibold underline decoration-red-600/40 underline-offset-2"
              >
                Shifts
              </button>
              .
            </p>
            <p className="mt-1.5 text-[13px] text-neutral-600 leading-snug md:hidden">
              24h window · full list in Shifts.
            </p>
          </div>
        </div>

        {pulseLoading ? (
          <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-[22px] border border-neutral-200/70 bg-white p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="skeleton w-12 h-12 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-5 w-3/4" />
                    <div className="skeleton h-3 w-1/3" />
                  </div>
                </div>
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-4/5" />
              </div>
            ))}
          </div>
        ) : pulseCards.length === 0 ? (
          <div className="text-center py-10 text-neutral-400 border border-dashed border-neutral-200 rounded-3xl">
            <Compass size={36} className="mx-auto mb-3 opacity-50"/>
            <p className="font-display text-xl italic">Quiet in {boardCity}.</p>
            <p className="text-sm mt-1">Try another city or open Shifts.</p>
          </div>
        ) : (
          <div className="relative max-md:rounded-[28px] max-md:border max-md:border-neutral-200/90 max-md:bg-gradient-to-b max-md:from-neutral-50/90 max-md:to-neutral-100/50 max-md:p-3 sm:max-md:p-4">
            <p className="text-[10px] text-neutral-500 mb-3 md:mb-0 font-bold uppercase tracking-[0.2em] px-0.5 md:hidden">
              Pull up for more
            </p>
            {/* Mobile: one column + real scroll. Desktop: 2 columns, no nested scroll trap. */}
            <div
              className="max-lg:max-h-none max-lg:overflow-visible lg:max-h-[min(72vh,560px)] lg:overflow-y-auto overflow-x-hidden overscroll-contain pr-1 [-webkit-overflow-scrolling:touch] lg:pr-0"
              style={{ scrollbarGutter: 'stable' }}
            >
              <motion.div
                className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-5 pb-1 md:pb-0"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                {visiblePulseCards.map((pulse) => {
                  const PulseIcon = pickPulseIcon(pulse.vibe);
                  const stripe = ENERGY_STRIPE[pulse.energy];
                  return (
                    <motion.div
                      key={pulse.id}
                      variants={staggerItem}
                      whileHover={{ y: -2 }}
                      className={`relative w-full text-left rounded-[22px] md:rounded-[26px] border border-neutral-200/90 border-l-[6px] shadow-[0_6px_28px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.03] transition-[box-shadow,transform,border-color] hover:border-red-300/90 hover:shadow-[0_14px_40px_rgba(185,28,28,0.12)] group ${stripe}`}
                    >
                      <div className="absolute top-3 right-3 h-16 w-16 rounded-full bg-gradient-to-br from-red-600/[0.07] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" aria-hidden />
                      <div className="relative p-4 md:p-5">
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 w-12 h-12 rounded-2xl bg-white border border-neutral-200/90 shadow-sm flex items-center justify-center text-neutral-800 group-hover:border-red-200 group-hover:text-red-700 transition-colors">
                            <PulseIcon size={20} strokeWidth={1.75} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="font-display text-xl md:text-2xl italic text-neutral-900 leading-tight [overflow-wrap:anywhere]">
                                {pulse.area}
                              </p>
                              <span className={`shrink-0 text-[9px] mt-0.5 font-black uppercase tracking-[0.16em] px-2.5 py-1 rounded-full border ${ENERGY_COLORS[pulse.energy]}`}>
                                {pulse.tag}
                              </span>
                            </div>
                            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-2">{pulse.city}</p>
                            <p className="text-neutral-600 text-[13px] md:text-sm leading-snug line-clamp-3">{pulse.vibe}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-2 border-t border-neutral-200/70 pt-3">
                          <div className="flex items-center gap-1.5 text-[10px] text-red-700 uppercase tracking-[0.14em] font-black">
                            <Briefcase size={11} className="shrink-0" /> {pulse.groupSize} roles nearby
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {!!pulse.liveTables && pulse.liveTables > 0 && (
                              <span className="text-[9px] uppercase tracking-widest font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/90">
                                {pulse.liveTables} live
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        )}

      </motion.section>

      <div className="hidden lg:block">
        <HomeExploreSnippets persona="worker" onSwitchTab={onSwitchTab} openTablesCount={openTablesCount} />
      </div>

      <AnimatePresence>
        {matchPhase !== 'idle' && activePulse && (
          <InstantPlanModal
            phase={matchPhase}
            plan={matchedPlan}
            pulse={activePulse}
            creditsResetAt={creditsResetAt}
            onAccept={acceptPlan}
            onSkip={skipPlan}
            onDelay={delayPlan}
            onClose={closeMatch}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   OUTLET — venue account (not staff profile): top hero row + outlet trust copy
   ══════════════════════════════════════════════════════════════════════ */
function outletApplicationStatusMeta(status: string | undefined) {
  const s = (status || 'draft').toLowerCase();
  if (s === 'approved')
    return {
      label: 'Approved',
      sub: 'Post shifts on the board.',
      className: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    };
  if (s === 'submitted' || s === 'under_review')
    return {
      label: s === 'under_review' ? 'Under review' : 'Submitted',
      sub: 'Ops verifying venue.',
      className: 'bg-amber-50 text-amber-950 border-amber-200',
    };
  if (s === 'rejected')
    return {
      label: 'Needs attention',
      sub: 'See admin notes and update.',
      className: 'bg-red-50 text-red-900 border-red-200',
    };
  return {
    label: 'Draft',
    sub: 'Complete below, then submit.',
    className: 'bg-neutral-100 text-neutral-800 border-neutral-200',
  };
}

function OutletAccountSection({ initialUser }: { initialUser?: any }) {
  const [user, setUser] = useState<any>(initialUser || null);
  const [loading, setLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(initialUser?.name || '');
  const [editBio, setEditBio] = useState(initialUser?.bio || '');
  const [editLocation, setEditLocation] = useState(initialUser?.location || '');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [profileNotice, setProfileNotice] = useState('');
  const [verifyOpen, setVerifyOpen] = useState(false);

  // Vendor profile state
  const [vendor, setVendor] = useState<any>(null);
  const [vendorEditing, setVendorEditing] = useState(false);
  const [vendorSaving, setVendorSaving] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [editFullAddress, setEditFullAddress] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [vendorMedia, setVendorMedia] = useState<any[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaCaption, setMediaCaption] = useState('');
  const [vendorNotice, setVendorNotice] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    setUser(initialUser || null);
    if (initialUser) {
      setEditName(initialUser.name || '');
      setEditBio(initialUser.bio || '');
      setEditLocation(initialUser.location || '');
    }
  }, [initialUser]);

  useEffect(() => {
    setLoading(true);
    fetch('/api/profile', { credentials: 'include' })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Profile unavailable');
        return d;
      })
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setAvatarLoadFailed(false);
          setEditName(data.user.name || '');
          setEditBio(data.user.bio || '');
          setEditLocation(data.user.location || '');
          setProfileNotice('');
          // Load vendor profile
          fetch('/api/vendor/profile', { credentials: 'include' })
            .then((r) => r.json())
            .then((vd) => {
              if (vd.vendor) {
                setVendor(vd.vendor);
                setVendorMedia(Array.isArray(vd.vendor.media) ? vd.vendor.media : []);
                setEditDescription(vd.vendor.description || '');
                setEditFullAddress(vd.vendor.full_address || '');
                setEditInstagram(vd.vendor.instagram_handle || '');
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        setUser(null);
        setProfileNotice('Sign in to manage your venue profile and photo.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleVendorSave = async () => {
    setVendorSaving(true);
    setVendorNotice('');
    try {
      const res = await fetch('/api/vendor/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ description: editDescription, full_address: editFullAddress, instagram_handle: editInstagram }),
      });
      const data = await res.json();
      if (res.ok) { setVendor((v: any) => ({ ...v, ...data.vendor })); setVendorEditing(false); setVendorNotice(''); }
      else setVendorNotice(data.error || 'Could not save.');
    } catch { setVendorNotice('Could not save — try again.'); }
    setVendorSaving(false);
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    setVendorNotice('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData, credentials: 'include' });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) { setVendorNotice(uploadData.error || 'Upload failed.'); setUploadingMedia(false); return; }
      const isVideo = file.type.startsWith('video/');
      const addRes = await fetch('/api/vendor/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url: uploadData.url, media_type: isVideo ? 'video' : 'photo', caption: mediaCaption || null }),
      });
      const addData = await addRes.json();
      if (addRes.ok) { setVendorMedia((prev) => [...prev, addData.media]); setMediaCaption(''); }
      else setVendorNotice(addData.error || 'Could not save media.');
    } catch { setVendorNotice('Network error.'); }
    setUploadingMedia(false);
  };

  const handleDeleteMedia = async (id: string) => {
    await fetch('/api/vendor/media', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id }),
    });
    setVendorMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const vendorShareUrl = vendor?.slug
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://app.convivia24.com'}/v/${vendor.slug}`
    : null;

  const copyVendorLink = () => {
    if (!vendorShareUrl) return;
    navigator.clipboard.writeText(vendorShareUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: editName, bio: editBio, location: editLocation }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setEditing(false);
        setProfileNotice('');
      } else setProfileNotice(data.error || 'Could not save.');
    } catch {
      setProfileNotice('Could not save — try again.');
      setEditing(false);
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setAvatarError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData, credentials: 'include' });
      const data = await res.json();
      if (!res.ok) {
        setAvatarError(data.error || 'Upload failed.');
        setUploadingAvatar(false);
        return;
      }
      const updateRes = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ avatar_url: data.url }),
      });
      const updateData = await updateRes.json();
      if (updateRes.ok && updateData.user) {
        setAvatarLoadFailed(false);
        setUser(updateData.user);
      } else setAvatarError(updateData.error || 'Profile update failed.');
    } catch {
      setAvatarError('Network error — try again.');
    }
    setUploadingAvatar(false);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    setProfileNotice('');
    try {
      const res = await fetch('/api/auth/sign-out', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setProfileNotice(
          (data as { error?: string }).error ||
            'Sign out failed. Try again, or clear site data for this site.'
        );
        setSigningOut(false);
        return;
      }
    } catch {
      setProfileNotice('Network error during sign out.');
      setSigningOut(false);
      return;
    }
    window.location.href = '/auth/sign-in';
  };

  if (loading) {
    return (
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm flex justify-center">
        <Loader2 size={28} className="text-red-700 animate-spin" />
      </section>
    );
  }

  if (!user) {
    return (
      <section className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
          <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-neutral-200 bg-neutral-50 flex items-center justify-center">
            <Building2 size={32} className="text-red-700/70" aria-hidden />
          </div>
          <div className="flex-1 text-center sm:text-left min-w-0 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-600">Vendor account</p>
            <h2 className="font-display text-xl sm:text-2xl italic text-neutral-900">Sign in</h2>
            <p className="text-[12px] text-neutral-600 leading-snug max-w-md mx-auto sm:mx-0">
              One Neon login — staff app &amp; vendor console.
            </p>
            {profileNotice ? <p className="text-[12px] text-neutral-500">{profileNotice}</p> : null}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
              <Link
                href="/auth/sign-in"
                className="inline-flex items-center gap-1.5 rounded-full bg-red-700 text-white text-[10px] font-black uppercase tracking-widest px-5 py-3 hover:bg-red-800"
              >
                <LogIn size={14} aria-hidden /> Sign in
              </Link>
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-800 text-[10px] font-black uppercase tracking-widest px-5 py-3 hover:border-red-300"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const app = user.outlet_application as
    | {
        business_name?: string;
        city_name?: string;
        status?: string;
        phone?: string;
        contact_email?: string | null;
      }
    | null
    | undefined;
  const statusMeta = outletApplicationStatusMeta(app?.status);

  return (
    <section id="outlet-account" className="scroll-mt-28 rounded-2xl border border-neutral-200 bg-white shadow-[0_8px_28px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="border-b border-neutral-100 bg-gradient-to-r from-red-50/80 via-white to-white px-4 py-2.5 sm:px-6 sm:py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-700 flex items-center gap-2">
          <Building2 size={14} className="shrink-0" aria-hidden /> Vendor account
        </p>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-10">
          {/* Photo — left column */}
          <div className="flex flex-row lg:flex-col items-center lg:items-start gap-5 lg:gap-4 shrink-0 lg:w-[200px]">
            <div className="relative group shrink-0">
              <label className="cursor-pointer block">
                {user?.avatar_url && !avatarLoadFailed ? (
                  <img
                    src={user.avatar_url}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-2xl border-[3px] border-red-700 object-cover shadow-[0_8px_28px_rgba(0,0,0,0.12)] ring-4 ring-white"
                    onError={() => {
                      setAvatarLoadFailed(true);
                      setAvatarError('Photo did not load — try uploading again.');
                    }}
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-2xl border-[3px] border-dashed border-red-600 bg-neutral-50 flex items-center justify-center ring-4 ring-white shadow-inner">
                    <Camera size={28} className="text-red-600" aria-hidden />
                  </div>
                )}
                <input type="file" accept="image/*" capture="environment" onChange={handleAvatarUpload} className="hidden" />
                {uploadingAvatar ? (
                  <div className="absolute inset-0 bg-black/45 rounded-2xl flex items-center justify-center z-20">
                    <Loader2 size={28} className="text-white animate-spin" />
                  </div>
                ) : null}
              </label>
              {user?.verified ? (
                <div className="absolute -bottom-1 -right-1 bg-red-700 text-white rounded-full p-2 z-20 shadow-md border-2 border-white">
                  <ShieldCheck size={16} aria-hidden />
                </div>
              ) : null}
            </div>
            <p className="text-[10px] text-neutral-500 text-center lg:text-left max-w-[11rem] lg:max-w-[12rem] leading-snug">
              Contact photo
            </p>
            {avatarError ? <p className="text-red-600 text-[11px] lg:col-span-1 text-center lg:text-left">{avatarError}</p> : null}
          </div>

          {/* Details — right column */}
          <div className="flex-1 min-w-0 space-y-4">
            {profileNotice ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2 text-[12px] text-amber-950">{profileNotice}</div>
            ) : null}

            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1.5">
                <h2 className="font-display text-xl sm:text-3xl italic text-neutral-900 leading-tight break-words">
                  {app?.business_name?.trim() ? app.business_name : 'Your venue'}
                </h2>
                {app?.city_name ? (
                  <p className="text-sm text-neutral-500 flex items-center gap-1.5">
                    <MapPin size={14} className="shrink-0 text-red-700/70" aria-hidden />
                    {app.city_name}
                  </p>
                ) : null}
                {user.email ? (
                  <p className="text-[13px] text-neutral-600 flex items-center gap-2 min-w-0">
                    <Mail size={14} className="shrink-0 text-neutral-400" aria-hidden />
                    <span className="truncate">{user.email}</span>
                  </p>
                ) : null}
              </div>
              <span
                className={`shrink-0 inline-flex flex-col items-end gap-0.5 rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${statusMeta.className}`}
              >
                <span>{statusMeta.label}</span>
              </span>
            </div>
            <p className="text-[12px] text-neutral-600 leading-snug">{statusMeta.sub}</p>

            {user?.is_platform_admin ? (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-neutral-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-neutral-800 hover:border-red-400"
              >
                Admin console
              </Link>
            ) : null}

            {editing ? (
              <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50/80 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Primary contact (your account)</p>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/30"
                  placeholder="Contact name"
                />
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/30 resize-none"
                  placeholder="Short note to workers (optional)"
                />
                <input
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/30"
                  placeholder="Metro / neighbourhood label"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-full bg-red-700 text-white px-5 py-2 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="rounded-full border border-neutral-200 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-neutral-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Primary contact</p>
                  <p className="font-semibold text-neutral-900">{user?.name || '—'}</p>
                  {user?.bio ? <p className="text-[13px] text-neutral-600 mt-1 max-w-xl">{user.bio}</p> : null}
                  {user?.location ? (
                    <p className="text-[12px] text-neutral-500 mt-1 flex items-center gap-1">
                      <MapPin size={12} aria-hidden /> {user.location}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="ml-auto sm:ml-0 inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-neutral-700 hover:border-red-300"
                  aria-label="Edit contact details"
                >
                  <Edit3 size={14} aria-hidden /> Edit
                </button>
              </div>
            )}

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-neutral-100 bg-neutral-50/90 p-4 text-center sm:text-left">
                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Shift posts</p>
                <p className="font-display text-2xl italic text-red-700 tabular-nums mt-1">{user?.hangouts_count ?? 0}</p>
              </div>
              <div className="rounded-xl border border-neutral-100 bg-neutral-50/90 p-4 text-center sm:text-left sm:col-span-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Venue lines</p>
                <p className="text-[13px] text-neutral-700 mt-2 leading-snug">
                  {app?.phone ? (
                    <span className="block">
                      Desk · <span className="font-medium text-neutral-900">{app.phone}</span>
                    </span>
                  ) : (
                    <span className="text-neutral-500">Add phone in registration below.</span>
                  )}
                  {app?.contact_email ? (
                    <span className="block mt-1">
                      Billing · <span className="font-medium text-neutral-900 break-all">{app.contact_email}</span>
                    </span>
                  ) : null}
                </p>
              </div>
            </div>

            {/* ── Vendor public profile ── */}
            <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">Public page</p>
                  <p className="text-[12px] text-neutral-500 mt-0.5">What workers see before applying.</p>
                </div>
                {vendorShareUrl ? (
                  <button
                    type="button"
                    onClick={copyVendorLink}
                    className="shrink-0 flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-neutral-700 hover:border-red-300"
                  >
                    {linkCopied ? <Check size={12} className="text-emerald-700" /> : <Share2 size={12} />}
                    {linkCopied ? 'Copied' : 'Share link'}
                  </button>
                ) : null}
              </div>

              {vendorShareUrl ? (
                <a href={vendorShareUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-700 hover:underline">
                  Open public page
                </a>
              ) : (
                <p className="text-[11px] text-neutral-400 italic">Approval unlocks this link.</p>
              )}

              {vendorEditing ? (
                <div className="space-y-3 rounded-xl bg-neutral-50 border border-neutral-200 p-3">
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    placeholder="Describe your venue — atmosphere, cuisine, events…"
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/30 resize-none"
                  />
                  <input
                    value={editFullAddress}
                    onChange={(e) => setEditFullAddress(e.target.value)}
                    placeholder="Full address (e.g. 12 Kofo Abayomi St, VI, Lagos)"
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/30"
                  />
                  <input
                    value={editInstagram}
                    onChange={(e) => setEditInstagram(e.target.value)}
                    placeholder="Instagram handle (e.g. @noirlagos)"
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/30"
                  />
                  {vendorNotice && <p className="text-[12px] text-red-600">{vendorNotice}</p>}
                  <div className="flex gap-2">
                    <button type="button" onClick={handleVendorSave} disabled={vendorSaving}
                      className="rounded-full bg-red-700 text-white px-5 py-2 text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
                      {vendorSaving ? 'Saving…' : 'Save'}
                    </button>
                    <button type="button" onClick={() => setVendorEditing(false)}
                      className="rounded-full border border-neutral-200 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-neutral-600">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {vendor?.description ? (
                    <p className="text-[13px] text-neutral-700 leading-snug">{vendor.description}</p>
                  ) : <p className="text-[12px] text-neutral-400 italic">No description yet.</p>}
                  {vendor?.full_address ? (
                    <p className="text-[12px] text-neutral-600 flex items-center gap-1"><MapPin size={12} className="text-red-700/60" />{vendor.full_address}</p>
                  ) : null}
                  {vendor?.instagram_handle ? (
                    <p className="text-[12px] text-red-700 font-semibold">@{vendor.instagram_handle.replace('@', '')}</p>
                  ) : null}
                  <button type="button" onClick={() => setVendorEditing(true)}
                    className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-neutral-700 hover:border-red-300">
                    <Edit3 size={12} /> Edit profile
                  </button>
                </div>
              )}

              {/* Media gallery */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Photos &amp; videos ({vendorMedia.length}/20)</p>
                {vendorMedia.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1.5">
                    {vendorMedia.map((m) => (
                      <div key={m.id} className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 group">
                        {m.media_type === 'video' ? (
                          <video src={m.url} className="w-full h-full object-cover" />
                        ) : (
                          <img src={m.url} alt={m.caption || ''} className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteMedia(m.id)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    value={mediaCaption}
                    onChange={(e) => setMediaCaption(e.target.value)}
                    placeholder="Caption (optional)"
                    className="flex-1 min-w-0 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-red-600/30"
                  />
                  <label className="shrink-0 flex items-center gap-1.5 cursor-pointer rounded-full border border-neutral-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-neutral-700 hover:border-red-300">
                    {uploadingMedia ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                    {uploadingMedia ? 'Uploading…' : 'Add photo / video'}
                    <input type="file" accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" disabled={uploadingMedia} />
                  </label>
                </div>
                {vendorNotice && !vendorEditing ? <p className="text-[12px] text-red-600">{vendorNotice}</p> : null}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-3 md:p-4 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Outlet checklist</p>
              <div className="grid sm:grid-cols-2 gap-2 text-[12px] text-neutral-700">
                <div className="rounded-lg bg-white border border-neutral-200 p-2.5">
                  <p className="font-bold text-neutral-900 text-xs">CAC &amp; venue</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">Review before going live.</p>
                </div>
                <div className="rounded-lg bg-white border border-neutral-200 p-2.5">
                  <p className="font-bold text-neutral-900 text-xs">Payouts</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">OPay · PalmPay · Moniepoint.</p>
                </div>
              </div>
              <a
                href={staffingWhatsAppUrl('Hi Convivia24 — outlet verification / payouts question.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-[10px] font-black uppercase tracking-widest text-red-700 hover:underline"
              >
                Need help? WhatsApp ops →
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              {user?.verified ? (
                <div className="flex-1 flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <ShieldCheck size={22} className="text-emerald-800 shrink-0" aria-hidden />
                  <div>
                    <p className="text-sm font-bold text-emerald-950">Contact photo verified</p>
                    <p className="text-[10px] text-emerald-800 font-semibold uppercase tracking-widest mt-0.5">Trusted for venue-facing actions</p>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setVerifyOpen(true)}
                  disabled={!user?.avatar_url}
                  className="flex-1 flex items-center justify-between gap-3 p-4 bg-white border border-neutral-200 hover:border-red-400 rounded-2xl transition-colors disabled:opacity-50 text-left"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={22} className="text-neutral-400 shrink-0" aria-hidden />
                    <div>
                      <p className="text-sm font-bold text-neutral-900">Verify contact photo</p>
                      <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5">
                        {user?.avatar_url ? 'Quick face check for outlet trust' : 'Upload a clear photo first'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase text-white bg-red-700 font-black tracking-widest px-3 py-2 rounded-lg shrink-0">
                    Verify
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 border border-neutral-200 rounded-2xl text-neutral-600 hover:text-red-700 hover:border-red-200 text-[10px] uppercase tracking-widest font-black disabled:opacity-50"
              >
                <LogOut size={14} aria-hidden /> {signingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {verifyOpen ? (
          <FaceVerificationModal
            user={user}
            onVerified={(u) => {
              setUser(u);
              setVerifyOpen(false);
            }}
            onClose={() => setVerifyOpen(false)}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   OUTLET — dashboard headline + flow (no zone pulse / roster assist — staff-only in HomeTab)
   ══════════════════════════════════════════════════════════════════════ */
function OutletLandingDashboard({ onSwitchTab }: { onSwitchTab: (t: AppTab) => void }) {
  const callouts = ['Board & post', 'Roster lock', 'Same-day pay'] as const;

  return (
    <motion.section
      id="outlet-hero"
      className="scroll-mt-28 relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-b from-white via-cream/95 to-[#f8f6f2]"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
    >
      {/* Mobile / tablet — single compact hero band, logo first */}
      <div className="lg:hidden p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-col items-center text-center gap-2">
          <BrandLogo
            alt="Convivia24"
            variant="mark"
            className="h-10 sm:h-11 w-auto max-w-[min(260px,85vw)] object-contain select-none"
          />
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-red-800 bg-red-50 border border-red-200/80 px-2 py-0.5 rounded-full">
              Vendor console
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">3 metros</span>
            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-red-700">
              <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
              Live
              <span className="text-neutral-400 font-normal">·</span>
              <LiveLocalTime className="tabular-nums text-neutral-600 font-bold normal-case" />
            </span>
          </div>
          <h2 className="font-display text-[1.35rem] sm:text-[1.5rem] leading-[1.08] italic text-neutral-900 px-1">
            Cover staff, <span className="text-red-700">sorted.</span>
          </h2>
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          {callouts.map((c) => (
            <span
              key={c}
              className="inline-flex items-center rounded-lg border border-neutral-200/90 bg-white/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-neutral-700 shadow-[0_1px_0_rgba(0,0,0,0.04)]"
            >
              {c}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onSwitchTab('demand')}
          className="w-full rounded-full bg-red-700 text-white text-[10px] font-black uppercase tracking-[0.2em] py-3 hover:bg-red-800 shadow-[0_0_16px_rgba(185,28,28,0.18)] active:scale-[0.99] transition-transform"
        >
          Open demand → board &amp; post
        </button>
      </div>

      {/* Desktop — compact row */}
      <div className="hidden lg:flex lg:flex-row lg:items-center lg:justify-between gap-6 p-6 border-t-0 border border-gold/25 rounded-2xl bg-white/95 shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-5 min-w-0">
          <BrandLogo alt="Convivia24" className="h-11 w-auto object-contain object-left shrink-0" />
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-700">Vendor console</span>
              <span className="text-[10px] font-bold text-neutral-400">·</span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-neutral-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                Live <LiveLocalTime className="tabular-nums normal-case font-bold text-neutral-600" />
              </span>
            </div>
            <h2 className="font-display text-3xl xl:text-4xl italic leading-[1.05] text-neutral-900 text-balance">
              Cover staff, <span className="text-red-700">sorted.</span>
            </h2>
            <p className="text-[12px] text-neutral-600 max-w-xl leading-snug">
              Hospitality demand in{' '}
              <strong className="text-neutral-800">Lagos, Abuja, Port Harcourt</strong> —{' '}
              <button
                type="button"
                onClick={() => onSwitchTab('demand')}
                className="text-red-700 font-semibold underline decoration-red-600/35 underline-offset-2 hover:text-red-800"
              >
                open board
              </button>
              .
            </p>
          </div>
        </div>
        <div className="flex flex-col items-stretch lg:items-end gap-3 shrink-0">
          <div className="flex flex-wrap justify-end gap-1.5">
            {callouts.map((c) => (
              <span
                key={c}
                className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-neutral-700"
              >
                {c}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onSwitchTab('demand')}
            className="rounded-full bg-red-700 text-white text-[10px] font-black uppercase tracking-[0.2em] px-7 py-3 hover:bg-red-800 shadow-[0_0_18px_rgba(185,28,28,0.2)] whitespace-nowrap"
          >
            Demand → board &amp; post
          </button>
        </div>
      </div>
    </motion.section>
  );
}

function OutletJumpSnippets({
  onSwitchTab,
  metroCity,
}: {
  onSwitchTab: (t: AppTab) => void;
  metroCity: string;
}) {
  const [openTablesCount, setOpenTablesCount] = useState(0);
  useEffect(() => {
    const city = metroCity?.trim() || DEFAULT_CITIES[0];
    let cancelled = false;
    fetch(`/api/hangouts?city=${encodeURIComponent(city)}&next_hours=24`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const hangouts = Array.isArray(d.hangouts) ? d.hangouts : [];
        const n = hangouts.filter((h: any) => (h.current_guests || 0) < (h.max_guests || 0)).length;
        setOpenTablesCount(n);
      })
      .catch(() => {
        if (!cancelled) setOpenTablesCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [metroCity]);

  return (
    <HomeExploreSnippets
      persona="outlet"
      onSwitchTab={onSwitchTab}
      openTablesCount={openTablesCount}
      outletThreeTab
    />
  );
}

/* ══════════════════════════════════════════════════════════════════════
   OUTLET — landing (home + registration)
   ══════════════════════════════════════════════════════════════════════ */
function OutletLandingTab({
  initialUser,
  onSwitchTab,
  cities,
}: {
  initialUser?: any;
  onSwitchTab: (t: AppTab) => void;
  cities: string[];
}) {
  const router = useRouter();
  const metroCity = cities[0] ?? DEFAULT_CITIES[0];
  return (
    <div className="space-y-5 pb-24">
      <OutletLandingDashboard onSwitchTab={onSwitchTab} />

      <section className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-600">Registration</p>
            <h2 className="font-display text-lg sm:text-xl italic text-neutral-900 mt-0.5">Venue approval</h2>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 max-w-[20rem] text-right sm:text-left sm:max-w-none">
            CAC + address → admin queue → live posting
          </p>
        </div>
        {initialUser ? (
          <OutletOnboardingForm
            initialApplication={initialUser.outlet_application ?? null}
            onUpdated={() => {
              router.refresh();
            }}
          />
        ) : (
          <p className="text-sm text-neutral-500 border border-dashed border-neutral-200 rounded-xl p-3 bg-neutral-50/80">
            Sign in from the <strong className="text-neutral-700">Profile</strong> tab, then submit for approval.
          </p>
        )}
      </section>

      <OutletJumpSnippets onSwitchTab={onSwitchTab} metroCity={metroCity} />
    </div>
  );
}

function OutletProfileTab({ initialUser }: { initialUser?: any }) {
  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-24 min-w-0">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-2 flex items-center gap-2">
          <UserCircle size={12} aria-hidden /> Vendor profile
        </p>
        <h1 className="font-display text-3xl md:text-5xl italic text-neutral-900 mb-3">
          Profile & <span className="text-red-700">public page.</span>
        </h1>
        <p className="text-neutral-600 text-sm md:text-base leading-relaxed max-w-2xl">
          Manage your venue identity, contact photo, public page link, gallery, and trust checks from one place.
        </p>
      </div>

      <Link
        href="/"
        className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-red-900 shadow-sm hover:border-red-300 hover:bg-red-50"
      >
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-700">Switch console</p>
          <p className="text-sm font-bold">Go to staff app</p>
        </div>
        <span className="shrink-0 text-[10px] font-black uppercase tracking-widest">Open →</span>
      </Link>

      <OutletAccountSection initialUser={initialUser} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   OUTLET — applicant management panel
   ══════════════════════════════════════════════════════════════════════ */
type Applicant = {
  id: string;
  worker_id: string;
  status: string;
  payout_provider: string;
  payout_phone: string;
  note: string | null;
  applied_at: string;
  worker_name: string;
  worker_avatar: string | null;
  worker_rating: number | null;
  worker_verified: boolean;
  worker_location: string | null;
  worker_certifications: string[];
  match_score?: number;
  match_reasons?: string[];
};

type OutletShift = {
  id: string;
  title: string;
  event_time: string;
  location: string;
  city: string | null;
  area: string | null;
  current_guests: number;
  max_guests: number;
  ticket_price: number | null;
  status: string;
};

function OutletApplicantsPanel() {
  const [shifts, setShifts] = useState<OutletShift[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(true);
  const [expandedShiftId, setExpandedShiftId] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Record<string, Applicant[]>>({});
  const [loadingApplicants, setLoadingApplicants] = useState<string | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null); // workerId being updated
  const [notice, setNotice] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/hangouts?next_hours=168', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        const all: any[] = Array.isArray(d.hangouts) ? d.hangouts : [];
        setShifts(all.map((h) => ({
          id: String(h.id),
          title: String(h.title || 'Shift'),
          event_time: h.event_time || '',
          location: String(h.location || ''),
          city: h.city ?? null,
          area: h.area ?? null,
          current_guests: Number(h.current_guests || 0),
          max_guests: Number(h.max_guests || 0),
          ticket_price: h.ticket_price != null ? Number(h.ticket_price) : null,
          status: String(h.status || 'pending'),
        })));
      })
      .catch(() => setShifts([]))
      .finally(() => setLoadingShifts(false));
  }, []);

  const loadApplicants = async (shiftId: string) => {
    if (applicants[shiftId]) {
      setExpandedShiftId((prev) => (prev === shiftId ? null : shiftId));
      return;
    }
    setLoadingApplicants(shiftId);
    try {
      const r = await fetch(`/api/shifts/${shiftId}/applicants`, { credentials: 'include' });
      const d = await r.json();
      setApplicants((prev) => ({ ...prev, [shiftId]: Array.isArray(d.applicants) ? d.applicants : [] }));
      setExpandedShiftId(shiftId);
    } catch {
      setNotice({ msg: 'Could not load applicants.', ok: false });
    } finally {
      setLoadingApplicants(null);
    }
  };

  const updateStatus = async (shiftId: string, workerId: string, status: string) => {
    setActingOn(workerId);
    setNotice(null);
    try {
      const r = await fetch(`/api/shifts/${shiftId}/applicants/${workerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      const d = await r.json();
      if (!r.ok) { setNotice({ msg: d.error || 'Action failed.', ok: false }); return; }

      // Update local applicant state
      setApplicants((prev) => ({
        ...prev,
        [shiftId]: (prev[shiftId] || []).map((a) =>
          a.worker_id === workerId ? { ...a, status } : a,
        ),
      }));

      if (status === 'confirmed' && d.whatsappUrl) {
        window.open(d.whatsappUrl, '_blank', 'noopener,noreferrer');
        setNotice({ msg: 'Confirmed — WhatsApp opened to notify worker.', ok: true });
      } else if (status === 'rejected') {
        setNotice({ msg: 'Applicant rejected.', ok: true });
      } else {
        setNotice({ msg: `Status updated to ${status}.`, ok: true });
      }
    } catch {
      setNotice({ msg: 'Network error. Try again.', ok: false });
    } finally {
      setActingOn(null);
    }
  };

  if (loadingShifts) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-red-700" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-600 mb-1 flex items-center gap-2">
          <Users size={12} aria-hidden /> Applicants
        </p>
        <h2 className="font-display text-2xl sm:text-3xl italic text-neutral-900 mb-1">
          Who <span className="text-red-700">applied.</span>
        </h2>
        <p className="text-neutral-500 text-sm mb-5">Your live shifts — tap to see applicants, confirm or reject.</p>
      </div>

      {notice && (
        <div className={`rounded-2xl px-4 py-3 text-sm font-semibold flex items-center justify-between gap-3 ${notice.ok ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          <span>{notice.msg}</span>
          <button type="button" onClick={() => setNotice(null)}><X size={14} /></button>
        </div>
      )}

      {shifts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 py-14 text-center text-neutral-400">
          <ClipboardList size={36} className="mx-auto mb-3 opacity-40" />
          <p className="font-display text-xl italic mb-1">No shifts posted yet.</p>
          <p className="text-sm">Post a shift — applicants appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shifts.map((shift) => {
            const d = shift.event_time ? new Date(shift.event_time) : null;
            const timeStr = d
              ? d.toLocaleString('en-NG', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : 'Time TBC';
            const isExpanded = expandedShiftId === shift.id;
            const shiftApplicants = applicants[shift.id] ?? [];
            const pendingCount = shiftApplicants.filter((a) => a.status === 'pending').length;

            return (
              <div key={shift.id} className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                {/* Shift header — click to expand */}
                <button
                  type="button"
                  onClick={() => loadApplicants(shift.id)}
                  className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900 leading-snug truncate">{shift.title}</p>
                    <p className="text-sm text-neutral-500 mt-0.5 flex items-center gap-1.5">
                      <Clock size={12} className="shrink-0 text-red-700/70" /> {timeStr}
                    </p>
                    {shift.ticket_price != null && (
                      <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                        ₦{Number(shift.ticket_price).toLocaleString('en-NG')} per shift
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {pendingCount > 0 && (
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        {pendingCount} new
                      </span>
                    )}
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border border-neutral-200 bg-neutral-50 text-neutral-600">
                      {shift.current_guests}/{shift.max_guests} filled
                    </span>
                    {loadingApplicants === shift.id
                      ? <Loader2 size={16} className="animate-spin text-red-700" />
                      : <ChevronRight size={16} className={`text-neutral-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    }
                  </div>
                </button>

                {/* Applicant list */}
                {isExpanded && (
                  <div className="border-t border-neutral-100 divide-y divide-neutral-100">
                    {shiftApplicants.length === 0 ? (
                      <p className="px-4 py-6 text-sm text-neutral-400 text-center">No applications yet.</p>
                    ) : (
                      shiftApplicants.map((a) => (
                        <div key={a.id} className="px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                          {/* Worker info */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-neutral-200 shrink-0 flex items-center justify-center text-sm font-bold text-neutral-600 overflow-hidden">
                              {a.worker_avatar
                                ? <img src={a.worker_avatar} alt={a.worker_name} className="w-full h-full object-cover" />
                                : (a.worker_name || '?')[0]?.toUpperCase()
                              }
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="font-semibold text-neutral-900 text-sm">{a.worker_name}</p>
                                {typeof a.match_score === 'number' && a.match_score >= 45 ? (
                                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-emerald-900">
                                    Strong match
                                  </span>
                                ) : null}
                                {a.worker_verified && <ShieldCheck size={13} className="text-red-700 shrink-0" />}
                                {a.worker_rating != null && (
                                  <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-0.5">
                                    <Star size={10} fill="currentColor" /> {Number(a.worker_rating).toFixed(1)}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-neutral-500 truncate">
                                {a.payout_provider} · {a.payout_phone}
                                {a.worker_location ? ` · ${a.worker_location}` : ''}
                              </p>
                              {Array.isArray(a.match_reasons) && a.match_reasons.length > 0 ? (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {a.match_reasons.map((reason) => (
                                    <span key={`${a.id}-${reason}`} className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-neutral-600">
                                      {reason}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                              {a.note && <p className="text-[11px] text-neutral-400 italic mt-0.5">"{a.note}"</p>}
                            </div>
                          </div>

                          {/* Status + actions */}
                          <div className="flex items-center gap-2 shrink-0 flex-wrap">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${STATUS_STYLES[a.status] ?? STATUS_STYLES.pending}`}>
                              {a.status}
                            </span>
                            {a.status === 'pending' || a.status === 'shortlisted' ? (
                              <>
                                <button
                                  type="button"
                                  disabled={actingOn === a.worker_id}
                                  onClick={() => updateStatus(shift.id, a.worker_id, 'confirmed')}
                                  className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                                >
                                  {actingOn === a.worker_id ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                                  Confirm
                                </button>
                                <button
                                  type="button"
                                  disabled={actingOn === a.worker_id}
                                  onClick={() => updateStatus(shift.id, a.worker_id, 'shortlisted')}
                                  className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 transition-colors disabled:opacity-50"
                                >
                                  Shortlist
                                </button>
                                <button
                                  type="button"
                                  disabled={actingOn === a.worker_id}
                                  onClick={() => updateStatus(shift.id, a.worker_id, 'rejected')}
                                  className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-neutral-200 text-neutral-500 hover:border-red-300 hover:text-red-700 transition-colors disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            ) : a.status === 'confirmed' ? (
                              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                                <Check size={12} /> Hired
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   OUTLET — board + post (single Demand tab)
   ══════════════════════════════════════════════════════════════════════ */
function OutletDemandTab({
  outletDemandSub,
  setOutletDemandSub,
  pendingInviteHangoutId,
  onClearPendingInvite,
  cities,
  addCity,
  onSwitchTab,
}: {
  outletDemandSub: 'board' | 'post' | 'applicants';
  setOutletDemandSub: (v: 'board' | 'post' | 'applicants') => void;
  pendingInviteHangoutId?: string | null;
  onClearPendingInvite?: () => void;
  cities: string[];
  addCity: (name: string) => void;
  onSwitchTab: (t: AppTab) => void;
}) {
  return (
    <div className="space-y-5 pb-24">
      <div className="flex justify-center">
        <div className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 p-1 shadow-sm" role="tablist" aria-label="Demand sub-navigation">
          <button
            type="button"
            role="tab"
            aria-selected={outletDemandSub === 'board'}
            onClick={() => setOutletDemandSub('board')}
            className={`rounded-full px-3 sm:px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
              outletDemandSub === 'board' ? 'bg-red-700 text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Board
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={outletDemandSub === 'applicants'}
            onClick={() => setOutletDemandSub('applicants')}
            className={`rounded-full px-3 sm:px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
              outletDemandSub === 'applicants' ? 'bg-red-700 text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Applicants
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={outletDemandSub === 'post'}
            onClick={() => setOutletDemandSub('post')}
            className={`rounded-full px-3 sm:px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
              outletDemandSub === 'post' ? 'bg-red-700 text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Post shift
          </button>
        </div>
      </div>

      {outletDemandSub === 'board' ? (
        <DiscoverTab
          persona="outlet"
          onSwitchTab={onSwitchTab}
          pendingInviteHangoutId={pendingInviteHangoutId}
          onClearPendingInvite={onClearPendingInvite}
          cities={cities}
          addCity={addCity}
        />
      ) : outletDemandSub === 'applicants' ? (
        <OutletApplicantsPanel />
      ) : (
        <HostTab
          onPosted={() => setOutletDemandSub('board')}
          cities={cities}
          addCity={addCity}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   OUTLET — payments & settlement (dedicated tab)
   ══════════════════════════════════════════════════════════════════════ */
function OutletPaymentsTab({
  cities,
  onSwitchTab,
}: {
  cities: string[];
  onSwitchTab: (t: AppTab) => void;
}) {
  const metro = cities[0] ?? DEFAULT_CITIES[0];
  const [shifts, setShifts] = useState<any[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(true);

  useEffect(() => {
    fetch('/api/hangouts?next_hours=720', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setShifts(Array.isArray(d.hangouts) ? d.hangouts : []))
      .catch(() => setShifts([]))
      .finally(() => setLoadingShifts(false));
  }, []);

  const totalConfirmed = shifts.reduce((n, s) => n + Number(s.current_guests || 0), 0);
  const totalPending   = shifts.reduce((n, s) => n + Math.max(0, Number(s.max_guests || 0) - Number(s.current_guests || 0)), 0);
  const totalPayoutEst = shifts.reduce((n, s) => n + Number(s.current_guests || 0) * Number(s.ticket_price || 0), 0);

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20 min-w-0 px-0">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-2 flex items-center gap-2">
          <Wallet size={12} aria-hidden /> Payouts & roster
        </p>
        <h1 className="font-display text-3xl md:text-5xl italic text-neutral-900 mb-3">
          Money & <span className="text-red-700">roster.</span>
        </h1>
        <p className="text-neutral-600 text-sm md:text-base leading-relaxed max-w-2xl">
          Confirmed hires, payout estimates, and finance support — all in one thread.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">City</p>
          <p className="font-display text-xl italic mt-1">{metro}</p>
          <p className="text-[12px] text-neutral-500 mt-2">Your active metro.</p>
        </div>
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-900">Confirmed hires</p>
          <p className="font-display text-xl italic mt-1 tabular-nums">{totalConfirmed}</p>
          <p className="text-[12px] text-neutral-600 mt-2">
            {totalPayoutEst > 0 ? `Est. ₦${totalPayoutEst.toLocaleString()} payout` : 'Across all your shifts.'}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-900">Open slots</p>
          <p className="font-display text-xl italic mt-1 tabular-nums">{totalPending}</p>
          <p className="text-[12px] text-neutral-600 mt-2">Still need filling.</p>
        </div>
      </div>

      {/* Shift-by-shift roster summary */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Roster by shift</p>
        {loadingShifts ? (
          <div className="flex justify-center py-6"><Loader2 size={20} className="animate-spin text-red-700" /></div>
        ) : shifts.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 border border-dashed border-neutral-200 rounded-2xl">
            <ClipboardList size={28} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No shifts posted yet.</p>
            <button type="button" onClick={() => onSwitchTab('demand')} className="mt-2 text-[11px] font-black uppercase tracking-widest text-red-700 hover:underline">Post a shift →</button>
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-100 divide-y divide-neutral-100 text-[13px]">
            {shifts.map((s) => (
              <div key={s.id} className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-neutral-900 truncate">{s.title}</p>
                  <p className="text-[11px] text-neutral-500">
                    {s.location}{s.area ? ` · ${s.area}` : ''} ·{' '}
                    {new Date(s.event_time).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] tabular-nums text-neutral-700 font-semibold">
                    {s.current_guests}/{s.max_guests} hired
                  </span>
                  {s.ticket_price ? (
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      ₦{Number(s.ticket_price).toLocaleString()}/ea
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-900">Pay dispute?</p>
        <p className="text-[13px] text-neutral-700 leading-snug">Hours or pay don't match — message ops with the shift ID and we'll triage with the worker.</p>
        <a
          href={staffingWhatsAppUrl('Hi Convivia24 — vendor payout / billing question.')}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-[10px] font-black uppercase tracking-widest text-red-700 hover:underline"
        >
          WhatsApp finance →
        </a>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onSwitchTab('demand')}
          className="rounded-full bg-red-700 text-white text-[10px] font-black uppercase tracking-widest px-5 py-3 hover:bg-red-800"
        >
          Demand · board & post
        </button>
        <a
          href={staffingWhatsAppUrl('Hi Convivia24 — vendor payout / billing question.')}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full border border-emerald-600/40 bg-emerald-50 text-emerald-900 text-[10px] font-black uppercase tracking-widest px-5 py-3"
        >
          WhatsApp finance
        </a>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   CAREER TAB (workers) — pay, slips, disputes, training
   ══════════════════════════════════════════════════════════════════════ */
function CareerTab({ onSwitchTab }: { onSwitchTab: (t: AppTab) => void }) {
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);

  useEffect(() => {
    fetch('/api/shifts/my-applications', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setApplications(Array.isArray(d.applications) ? d.applications : []))
      .catch(() => setApplications([]))
      .finally(() => setLoadingApps(false));
  }, []);

  const confirmed = applications.filter((a) => a.status === 'confirmed');
  const pending   = applications.filter((a) => a.status === 'pending' || a.status === 'shortlisted');
  const past      = applications.filter((a) => a.status === 'rejected' || a.status === 'no_show');
  return (
    <div className="mx-auto w-full max-w-[min(100%,428px)] lg:max-w-5xl pb-20 px-0 lg:px-4 min-w-0">
      <header className="mb-5 space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 flex items-center gap-2">
          <Briefcase size={12} aria-hidden /> Record
        </p>
        <h1 className="font-display text-3xl md:text-5xl italic text-neutral-900">
          My <span className="text-red-700">record.</span>
        </h1>
        <p className="text-neutral-600 text-sm md:text-base leading-relaxed">Applications, pay status, and help.</p>
      </header>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Hired', value: confirmed.length },
          { label: 'Pending', value: pending.length },
          { label: 'Closed', value: past.length },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-neutral-200 bg-white p-3 text-center shadow-sm">
            <p className="font-display text-2xl italic text-neutral-900 tabular-nums">{item.value}</p>
            <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-neutral-500">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="space-y-4">
          <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="shrink-0 w-10 h-10 rounded-2xl bg-teal-700 text-white flex items-center justify-center">
                <Wallet size={20} aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-teal-900">Wallet</p>
                <p className="text-sm font-bold text-neutral-900">OPay · PalmPay · Moniepoint</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSwitchTab('profile')}
              className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-teal-900 shadow-sm"
            >
              Edit payout in Profile →
            </button>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-amber-800" aria-hidden />
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-900">Need help?</p>
                <p className="mt-1 text-sm font-bold text-neutral-900">Pay or hours issue</p>
                <a
                  href={staffingWhatsAppUrl('Hi Convivia24 — question about my pay or shift record.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-full bg-red-700 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white"
                >
                  WhatsApp support
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Applications</p>
              <h2 className="font-display text-xl italic text-neutral-900">Shift record</h2>
            </div>
            <button
              type="button"
              onClick={() => onSwitchTab('discover')}
              className="shrink-0 rounded-full bg-red-700 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-white"
            >
              Browse
            </button>
          </div>

          {loadingApps ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-neutral-100 p-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="skeleton h-4 w-1/2" />
                    <div className="skeleton h-3 w-1/3" />
                  </div>
                  <div className="skeleton h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 py-8 text-center text-neutral-500">
              <Receipt size={28} className="mx-auto mb-2 opacity-40" aria-hidden />
              <p className="text-sm font-semibold">No applications yet.</p>
              <button type="button" onClick={() => onSwitchTab('discover')} className="mt-2 text-[10px] font-black uppercase tracking-widest text-red-700">
                Find shifts →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {applications.slice(0, 8).map((a) => {
                const isConfirmed = a.status === 'confirmed';
                const isShortlisted = a.status === 'shortlisted';
                return (
                  <div key={a.id} className="rounded-2xl border border-neutral-100 bg-neutral-50/60 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-neutral-900">{a.shift_title || 'Shift'}</p>
                        <p className="mt-0.5 truncate text-[11px] text-neutral-500">
                          {a.shift_location || a.outlet_name || 'Location pending'}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-widest ${
                        isConfirmed
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : isShortlisted
                            ? 'border-amber-200 bg-amber-50 text-amber-800'
                            : 'border-neutral-200 bg-white text-neutral-600'
                      }`}>
                        {isConfirmed ? 'Hired' : isShortlisted ? 'Shortlist' : a.status || 'Pending'}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-bold text-neutral-500">
                      {a.shift_pay_ngn ? <span className="tabular-nums">₦{Number(a.shift_pay_ngn).toLocaleString()}</span> : null}
                      {a.payout_provider ? <span>{a.payout_provider}</span> : null}
                      {a.shift_event_time ? (
                        <span>{new Date(a.shift_event_time).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   LEARN — hospitality training & certifications
   ══════════════════════════════════════════════════════════════════════ */
const HOSPITALITY_COURSES = [
  {
    id: 'food-safety',
    title: 'Food safety & hygiene essentials',
    duration: '45 min',
    badge: 'Certificate',
    blurb: 'Temps, allergens, hand hygiene — kitchen audit basics.',
  },
  {
    id: 'responsible-service',
    title: 'Responsible service & guest care',
    duration: '35 min',
    badge: 'Badge',
    blurb: 'Packed floor · cut-offs · calm service.',
  },
  {
    id: 'wine-bar',
    title: 'Wine, spirits & bar basics',
    duration: '50 min',
    badge: 'Certificate',
    blurb: 'Pour counts, pairings, confident recs.',
  },
  {
    id: 'banquet',
    title: 'Banquet & plated service',
    duration: '40 min',
    badge: 'Micro-cert',
    blurb: 'Tray & silver cues · timing with kitchen.',
  },
  {
    id: 'coffee',
    title: 'Coffee & hot beverages',
    duration: '30 min',
    badge: 'Skills card',
    blurb: 'Café/hotel dial-in — grind, milk, rush recovery.',
  },
] as const;

function HospitalityTrainingTab({ persona, onSwitchTab }: { persona: StaffPersona; onSwitchTab: (t: AppTab) => void }) {
  return (
    <div className="max-w-[min(100%,428px)] lg:max-w-3xl mx-auto space-y-6 lg:space-y-8 pb-20 px-0 min-w-0">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-2 flex items-center gap-2">
          <GraduationCap size={12} aria-hidden /> Learn
        </p>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl italic text-neutral-900 mb-3">
          Hospitality <span className="text-red-700">training</span>
        </h1>
        <p className="text-neutral-600 text-sm md:text-base leading-relaxed max-w-2xl">
          Short modules outlets notice — finish to boost profile trust.
        </p>
      </div>

      <ul className="space-y-3">
        {HOSPITALITY_COURSES.map((c) => (
          <li
            key={c.id}
            className="rounded-2xl border border-neutral-200 bg-white p-4 md:p-5 shadow-[0_6px_22px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="font-display text-lg md:text-xl italic text-neutral-900">{c.title}</h2>
                <span className="text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded-full">
                  {c.badge}
                </span>
              </div>
              <p className="text-[13px] text-neutral-600 leading-snug">{c.blurb}</p>
              <p className="text-[11px] text-neutral-400 font-semibold mt-2 tabular-nums">{c.duration}</p>
            </div>
            <button
              type="button"
              className="w-full min-h-[48px] sm:min-h-0 sm:w-auto shrink-0 self-stretch sm:self-center rounded-full bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest px-5 py-3 sm:py-2.5 hover:bg-red-700 transition-colors"
            >
              Start
            </button>
          </li>
        ))}
      </ul>

      <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-900 mb-1">Need a custom cohort?</p>
        <p className="text-[13px] text-neutral-700 leading-snug">
          On-site training briefs — same WhatsApp as staffing.
        </p>
        <a
          href={staffingWhatsAppUrl('Hi Convivia24 — training / certification question for our team.')}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex mt-3 text-[10px] font-black uppercase tracking-widest text-emerald-900 hover:underline underline-offset-4"
        >
          Message on WhatsApp →
        </a>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onSwitchTab(persona === 'outlet' ? 'demand' : 'discover')}
          className="inline-flex items-center justify-center rounded-full bg-red-700 text-white text-[10px] font-black uppercase tracking-widest px-5 py-3 hover:bg-red-800"
        >
          {persona === 'outlet' ? 'Back to demand' : 'Browse shifts'}
        </button>
        <button
          type="button"
          onClick={() => onSwitchTab('profile')}
          className="inline-flex items-center justify-center rounded-full border border-neutral-300 text-neutral-800 text-[10px] font-black uppercase tracking-widest px-5 py-3 hover:border-red-400"
        >
          Profile & verification
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   FACE VERIFICATION MODAL  (Azure Face API)
   ══════════════════════════════════════════════════════════════════════ */
function FaceVerificationModal({ user: _user, onVerified, onClose }: { user: any; onVerified: (u: any) => void; onClose: () => void }) {
  const [phase, setPhase] = useState<'intro' | 'capturing' | 'preview' | 'checking' | 'done' | 'error'>('intro');
  const [errorMsg, setErrorMsg] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const enterFullscreen = async () => {
    try {
      const el: any = containerRef.current || document.documentElement;
      if (!document.fullscreenElement) {
        if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      }
      // Lock orientation on mobile if available
      const so: any = (screen as any).orientation;
      if (so?.lock) await so.lock('portrait').catch(() => {});
    } catch { /* fullscreen not supported / refused — modal still covers viewport */ }
  };
  const exitFullscreen = async () => {
    try {
      const so: any = (screen as any).orientation;
      so?.unlock?.();
      if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
    } catch { /* ignore */ }
  };

  const stopCamera = () => { streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null; };
  const startCamera = async () => {
    setVideoReady(false);
    setPhase('capturing'); setErrorMsg('');
    await enterFullscreen();
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
        },
      });
      streamRef.current = s;
      const v = videoRef.current;
      if (v) {
        v.srcObject = s;
        await v.play().catch(() => {});
      }
    } catch {
      setPhase('error'); setErrorMsg('Camera access denied. Please allow camera access in your browser settings.');
    }
  };

  const closeAll = async () => { stopCamera(); await exitFullscreen(); onClose(); };
  const capture = () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    const w = v.videoWidth || 0;
    const h = v.videoHeight || 0;
    if (w < 32 || h < 32) {
      setPhase('error');
      setErrorMsg('Camera is still starting. Wait a second and try again.');
      return;
    }
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.filter = 'brightness(1.12) contrast(1.06)';
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0, w, h);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.filter = 'none';
    stopCamera();
    setPreviewUrl(c.toDataURL('image/jpeg', 0.92));
    setPhase('preview');
  };
  const submit = async () => {
    if (!canvasRef.current) return;
    setPhase('checking');
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) { setPhase('error'); setErrorMsg('Could not capture image.'); return; }
      try {
        const fd = new FormData();
        fd.append('file', blob, 'selfie.jpg');
        const res = await fetch('/api/profile/verify-face', {
          method: 'POST',
          body: fd,
          credentials: 'include',
        });
        const d = await res.json();
        if (res.ok && d.verified) { setPhase('done'); onVerified(d.user); }
        else { setPhase('error'); setErrorMsg(d.error || 'Face did not match. Try in better lighting.'); }
      } catch { setPhase('error'); setErrorMsg('Verification failed. Check your connection.'); }
    }, 'image/jpeg', 0.95);
  };
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAll(); };
    window.addEventListener('keydown', k);

    // Auto-enter fullscreen as soon as the modal mounts
    enterFullscreen();

    // If user manually exits fullscreen (e.g. ESC on a browser), tear down too
    const onFsChange = () => { if (!document.fullscreenElement && phase === 'capturing') stopCamera(); };
    document.addEventListener('fullscreenchange', onFsChange);

    return () => {
      window.removeEventListener('keydown', k);
      document.removeEventListener('fullscreenchange', onFsChange);
      stopCamera();
      exitFullscreen();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const modal = (
    <motion.div ref={containerRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-neutral-950 flex flex-col"
      style={{ touchAction: 'none', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/*
        Canvas must stay mounted during "capturing" so capture() can draw; previously it only existed in "preview",
        so canvasRef was always null and capture did nothing.
      */}
      <canvas ref={canvasRef} className="fixed w-px h-px opacity-0 pointer-events-none overflow-hidden" aria-hidden />
      <div className="flex items-center justify-between px-5 pt-4 pb-4 shrink-0 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-red-700" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-600">Identity Verification</span>
        </div>
        <button onClick={closeAll} className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 transition-all">
          <X size={18} />
        </button>
      </div>

      {phase === 'intro' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <div className="w-24 h-24 rounded-full bg-red-50 border border-red-600 flex items-center justify-center shadow-[0_0_30px_rgba(201,168,76,0.25)]">
            <ShieldCheck size={40} className="text-red-700" />
          </div>
          <div>
            <h2 className="font-display text-4xl italic text-neutral-900 mb-3">Get Verified</h2>
            <p className="text-neutral-500 text-base max-w-xs mx-auto">
              Quick selfie vs profile photo — face centered, similar light.
            </p>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={startCamera} className="w-full max-w-xs bg-red-700 text-white py-4 rounded-full font-black uppercase tracking-[0.2em] text-[11px] hover:bg-red-800 transition-colors shadow-[0_0_30px_rgba(201,168,76,0.25)]">
            Start Camera
          </motion.button>
        </motion.div>
      )}

      {phase === 'capturing' && (
        <div className="flex-1 flex flex-col relative">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            playsInline
            style={{ transform: 'scaleX(-1)' }}
            onLoadedData={() => setVideoReady(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: '-5%' }}>
            <div className="border-2 border-red-600 rounded-full" style={{ width: 'min(60vw,260px)', height: 'min(78vw,340px)', boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)' }} />
          </div>
          <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-3">
            {!videoReady && (
              <p className="text-neutral-400 text-[11px] font-bold uppercase tracking-widest">Starting camera…</p>
            )}
            <motion.button
              whileTap={{ scale: videoReady ? 0.92 : 1 }}
              onClick={capture}
              disabled={!videoReady}
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-[0_0_0_4px_rgba(255,255,255,0.4)] disabled:opacity-40 disabled:grayscale"
            >
              <div className="w-16 h-16 rounded-full bg-white border-4 border-neutral-200" />
            </motion.button>
          </div>
        </div>
      )}

      {phase === 'preview' && previewUrl && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <img src={previewUrl} alt="Selfie" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 pointer-events-none" />
          </div>
          <div className="px-6 py-8 flex gap-3">
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setPreviewUrl(null); startCamera(); }}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full border border-neutral-200 text-neutral-600 font-black uppercase tracking-widest text-[11px]">
              <RefreshCw size={14} /> Retake
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={submit}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full bg-red-700 text-white font-black uppercase tracking-widest text-[11px] shadow-[0_0_25px_rgba(185,28,28,0.2)]">
              <Check size={14} /> Submit
            </motion.button>
          </div>
        </motion.div>
      )}

      {phase === 'checking' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 text-center">
          {previewUrl && (
            <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-red-600">
              <img src={previewUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-red-100 animate-pulse" />
            </div>
          )}
          <div>
            <Loader2 size={30} className="animate-spin text-red-700 mx-auto mb-4" />
            <p className="text-neutral-900 text-lg font-semibold">Matching your face…</p>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center gap-6 px-8 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.12 }}
            className="w-28 h-28 rounded-full bg-red-100 border-2 border-red-600 flex items-center justify-center shadow-[0_0_40px_rgba(201,168,76,0.35)]">
            <Check size={50} className="text-red-700" strokeWidth={2.5} />
          </motion.div>
          <div>
            <h2 className="font-display text-5xl italic text-neutral-900 mb-3">Verified!</h2>
            <p className="text-neutral-500 text-base max-w-xs mx-auto">Your identity is confirmed. The badge is now on your profile.</p>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={closeAll}
            className="w-full max-w-xs bg-red-700 text-white py-4 rounded-full font-black uppercase tracking-[0.2em] text-[11px] shadow-[0_0_30px_rgba(201,168,76,0.25)]">
            Done
          </motion.button>
        </motion.div>
      )}

      {phase === 'error' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center gap-5 px-8 text-center">
          <div className="w-24 h-24 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center"><AlertCircle size={40} className="text-red-400" /></div>
          <div>
            <h2 className="font-display text-3xl italic text-neutral-900 mb-2">Verification failed</h2>
            <p className="text-red-300 text-sm max-w-xs mx-auto">{errorMsg}</p>
          </div>
          <div className="flex gap-3 w-full max-w-xs">
            <button onClick={closeAll} className="flex-1 py-4 rounded-full border border-neutral-300 text-neutral-500 font-black uppercase tracking-widest text-[11px]">Cancel</button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setErrorMsg(''); startCamera(); }}
              className="flex-1 py-4 rounded-full bg-red-700 text-white font-black uppercase tracking-widest text-[11px] shadow-[0_0_25px_rgba(185,28,28,0.2)]">
              Try Again
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : null;
}

/* ══════════════════════════════════════════════════════════════════════
   PROFILE TAB
   ══════════════════════════════════════════════════════════════════════ */
function ProfileTab({ persona, initialUser }: { persona: StaffPersona; initialUser?: any }) {
  const [user, setUser] = useState<any>(initialUser || null);
  const [loading, setLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(initialUser?.name || '');
  const [editBio, setEditBio] = useState(initialUser?.bio || '');
  const [editLocation, setEditLocation] = useState(initialUser?.location || '');
  const [editCerts, setEditCerts] = useState<string[]>(Array.isArray(initialUser?.certifications) ? initialUser.certifications : []);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [profileNotice, setProfileNotice] = useState('');
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState('');

  const handleUpgrade = async () => {
    setUpgrading(true);
    setUpgradeError('');
    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ callback_url: `${window.location.origin}/api/paystack/callback` }),
      });
      const data = await res.json();
      if (!res.ok || !data.authorization_url) {
        setUpgradeError(data.error || 'Could not start payment. Try again.');
      } else {
        window.location.href = data.authorization_url;
      }
    } catch {
      setUpgradeError('Network error. Try again.');
    }
    setUpgrading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetch('/api/profile', { credentials: 'include' })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Profile unavailable');
        return d;
      })
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setAvatarLoadFailed(false);
          setEditName(data.user.name || '');
          setEditBio(data.user.bio || '');
          setEditLocation(data.user.location || '');
          setEditCerts(Array.isArray(data.user.certifications) ? data.user.certifications : []);
          setProfileNotice('');
        }
      })
      .catch(() => {
        setUser(null);
        setProfileNotice('Sign in to load profile.');
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleCert = (cert: string) => {
    setEditCerts((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert],
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, bio: editBio, location: editLocation, certifications: editCerts }),
      });
      const data = await res.json();
      if (res.ok && data.user) { setUser(data.user); setEditing(false); setProfileNotice(''); }
      else setProfileNotice(data.error || 'Could not save. Sign in to sync.');
    } catch { setProfileNotice('Saved on this device. Sign in to sync everywhere.'); setEditing(false); }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingAvatar(true); setAvatarError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData, credentials: 'include' });
      const data = await res.json();
      if (!res.ok) { setAvatarError(data.error || 'Upload failed.'); setUploadingAvatar(false); return; }
      const updateRes = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ avatar_url: data.url }),
      });
      const updateData = await updateRes.json();
      if (updateRes.ok && updateData.user) {
        setAvatarLoadFailed(false);
        setUser(updateData.user);
      } else setAvatarError(updateData.error || 'Profile update failed.');
    } catch { setAvatarError('Network error — try again.'); }
    setUploadingAvatar(false);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    setProfileNotice('');
    try {
      const res = await fetch('/api/auth/sign-out', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setProfileNotice(
          (data as { error?: string }).error ||
            'Sign out failed. Try again, or clear site data for this site.'
        );
        setSigningOut(false);
        return;
      }
    } catch {
      setProfileNotice('Network error during sign out.');
      setSigningOut(false);
      return;
    }
    window.location.href = '/auth/sign-in';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="text-red-700 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto pt-8 pb-24 px-4 text-center space-y-6">
        <div className="rounded-[28px] border border-gold/25 bg-white/90 backdrop-blur-sm p-8 shadow-[0_16px_48px_rgba(0,0,0,0.06)]">
          <UserIcon size={40} className="mx-auto text-red-700/80 mb-4" />
          <h2 className="font-display text-3xl italic text-neutral-900 mb-2">Sign in</h2>
          <p className="text-neutral-600 text-sm leading-relaxed mb-6">
            Sync profile, verification, wallet &amp; shift history.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/sign-in"
              className="inline-flex items-center justify-center min-h-12 px-6 rounded-2xl bg-red-700 text-white text-[11px] font-black uppercase tracking-[0.15em] hover:bg-red-800 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center min-h-12 px-6 rounded-2xl border border-neutral-200 bg-neutral-50 text-neutral-800 text-[11px] font-black uppercase tracking-[0.15em] hover:border-red-300 transition-colors"
            >
              Create account
            </Link>
          </div>
          {profileNotice && (
            <p className="mt-5 text-[12px] text-neutral-500">{profileNotice}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 hover:text-red-700"
        >
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-4 max-lg:pt-5 pb-20 px-0">
      <h1 className="font-display text-3xl sm:text-4xl md:text-5xl italic text-neutral-900 mb-1 px-0.5">
        My <span className="text-red-700">profile.</span>
      </h1>
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-red-600 mb-6 flex items-center gap-2">
        <UserIcon size={12} className="shrink-0" strokeWidth={2} aria-hidden /> Photo · skills · payout
      </p>

      {user?.is_platform_admin ? (
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-neutral-800 hover:border-red-400"
          >
            Admin console
          </Link>
        </div>
      ) : null}

      <Link
        href="/outlet"
        className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-white px-4 py-3 text-red-900 shadow-sm hover:border-red-300 hover:bg-red-50"
      >
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-700">Switch console</p>
          <p className="text-sm font-bold">Go to vendor console</p>
        </div>
        <span className="shrink-0 text-[10px] font-black uppercase tracking-widest">Open →</span>
      </Link>

      <div className="bg-white backdrop-blur-xl border border-neutral-200/90 rounded-[24px] md:rounded-[40px] p-5 md:p-10 shadow-[0_12px_48px_rgba(0,0,0,0.06)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-red-50/80 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10 relative z-10">
          {/* Avatar — full photo, same sizes as before (reference mocks: large circle, clear ring) */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative group">
              <label className="cursor-pointer block">
                {user?.avatar_url && !avatarLoadFailed ? (
                  <img
                    src={user.avatar_url}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-32 h-32 md:w-36 md:h-36 rounded-full border-[3px] border-red-700 object-cover shadow-[0_8px_32px_rgba(0,0,0,0.12)] ring-4 ring-white"
                    onError={() => {
                      setAvatarLoadFailed(true);
                      setAvatarError('Photo URL did not load. Use a public Azure blob (container access: blob) or re-upload from here.');
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-[3px] border-dashed border-red-600 bg-neutral-50 flex items-center justify-center ring-4 ring-white shadow-inner">
                    <Camera size={26} className="text-red-600" />
                  </div>
                )}
                <input type="file" accept="image/*" capture="environment" onChange={handleAvatarUpload} className="hidden" />
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center z-20">
                    <Loader2 size={24} className="text-red-700 animate-spin" />
                  </div>
                )}
              </label>
              {user?.verified && (
                <div className="absolute bottom-1 right-1 bg-red-700 text-white rounded-full p-1.5 z-20 shadow-md border-2 border-white">
                  <ShieldCheck size={14} />
                </div>
              )}
            </div>
            {avatarError && <p className="text-red-500 text-[11px] text-center mt-3 max-w-[200px]">{avatarError}</p>}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left w-full min-w-0">
            {profileNotice && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-3 py-2 text-[12px] text-red-700 mb-6">
                {profileNotice}
              </div>
            )}

            {editing ? (
              <div className="space-y-4 mb-8">
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-transparent border-b border-neutral-200 pb-2 text-3xl font-display italic focus:outline-none focus:border-red-700 w-full text-neutral-900" />
                <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3}
                  className="bg-transparent border-b border-neutral-200 pb-2 text-base focus:outline-none focus:border-red-700 w-full resize-none text-neutral-600"
                  placeholder="Tell outlets about your experience…" />
                <input value={editLocation} onChange={(e) => setEditLocation(e.target.value)}
                  className="bg-transparent border-b border-neutral-200 pb-2 text-sm focus:outline-none focus:border-red-700 w-full text-neutral-600" placeholder="City" />
                {persona === 'worker' && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-neutral-400 mb-2">Certifications & skills</p>
                    <div className="flex flex-wrap gap-2">
                      {([...ALL_STAFF_ROLES, 'Food handler cert', 'WSET Level 1', 'WSET Level 2', 'First Aid', 'Barista trained', 'Event protocol'] as string[]).map((cert) => {
                        const active = editCerts.includes(cert);
                        return (
                          <button
                            key={cert}
                            type="button"
                            onClick={() => toggleCert(cert)}
                            className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-colors ${
                              active
                                ? 'bg-red-700 text-white border-red-700'
                                : 'bg-white text-neutral-600 border-neutral-200 hover:border-red-300'
                            }`}
                          >
                            {cert}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={handleSave} disabled={saving} className="bg-red-700 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => setEditing(false)} className="text-neutral-500 hover:text-neutral-900 text-[10px] font-black uppercase tracking-widest">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start mb-2">
                  <h2 className="font-display text-3xl sm:text-4xl md:text-5xl italic text-neutral-900">{user?.name || 'Convivia Member'}</h2>
                  <button type="button" onClick={() => setEditing(true)} className="text-neutral-400 hover:text-red-700 transition-colors p-1" aria-label="Edit profile"><Edit3 size={17} /></button>
                </div>
                {persona === 'worker' ? (
                  <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start mb-2">
                    {user?.rating !== undefined && user?.rating !== null && String(user.rating).trim() !== '' ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-red-800">
                        <Star size={11} className="text-red-700" fill="currentColor" /> Shift rating {String(user.rating)}
                      </span>
                    ) : (
                      <span className="text-[11px] text-neutral-500">Rating after outlets confirm shifts.</span>
                    )}
                  </div>
                ) : null}
                {user?.bio ? (
                  <p className="text-neutral-600 text-base max-w-md mx-auto md:mx-0 leading-relaxed mb-2 mt-1">{user.bio}</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="text-sm font-bold text-red-700 hover:underline"
                  >
                    Add a short work note
                  </button>
                )}
                {user?.location && <p className="text-neutral-400 text-sm flex items-center gap-1 justify-center md:justify-start"><MapPin size={12} /> {user.location}</p>}
                {/* Certifications display */}
                {persona === 'worker' && Array.isArray(user?.certifications) && user.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 justify-center md:justify-start">
                    {user.certifications.map((c: string) => (
                      <span key={c} className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-neutral-200 bg-neutral-50 text-neutral-600">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
                {/* Primary verification prompt for unverified workers */}
                {persona === 'worker' && !user?.verified && (
                  <button
                    type="button"
                    onClick={() => user?.avatar_url && setVerifyOpen(true)}
                    disabled={!user?.avatar_url}
                    className="mt-4 w-full flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-left hover:bg-amber-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <ShieldCheck size={18} className="text-amber-700 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-amber-900 leading-snug">Verify photo</p>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        {user?.avatar_url ? 'Quick selfie check.' : 'Add a clear face photo first.'}
                      </p>
                    </div>
                    <span className="ml-auto shrink-0 text-[9px] font-black uppercase tracking-widest text-amber-800 border border-amber-300 px-3 py-1.5 rounded-full">
                      {user?.avatar_url ? 'Verify now' : 'Add photo'}
                    </span>
                  </button>
                )}
              </>
            )}

            <div className="grid grid-cols-3 gap-4 md:gap-6 w-full mb-10 mt-8">
              <Stat val={user?.hangouts_count || 0} label={persona === 'outlet' ? 'Posted' : 'Shifts'} />
              <Stat val={user?.connections_count || 0} label="Network" />
              <Stat
                val={Array.isArray(user?.certifications) ? user.certifications.length : 0}
                label="Certs"
              />
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 md:p-5 mb-6 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Ready checklist</p>
                <span className="text-[10px] font-black uppercase tracking-widest text-red-700">
                  {[user?.verified, Array.isArray(user?.certifications) && user.certifications.length > 0, Boolean(user?.payout_provider || user?.payout_phone)].filter(Boolean).length}/3
                </span>
              </div>
              <div className="grid gap-2 text-[13px] text-neutral-700">
                {[
                  { label: 'Photo verified', done: Boolean(user?.verified) },
                  { label: 'Skills added', done: Array.isArray(user?.certifications) && user.certifications.length > 0 },
                  { label: 'Payout ready', done: Boolean(user?.payout_provider || user?.payout_phone) },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl bg-white border border-neutral-200 px-3 py-3">
                    <span className="font-bold text-neutral-900">{item.label}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${
                      item.done ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-neutral-50 text-neutral-500 border-neutral-200'
                    }`}>
                      {item.done ? 'Done' : 'Add'}
                    </span>
                  </div>
                ))}
              </div>
              <a
                href={staffingWhatsAppUrl('Hi Convivia24 — I want to complete trust verification / payout setup.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-[10px] font-black uppercase tracking-widest text-red-700 hover:underline"
              >
                Need help? WhatsApp ops →
              </a>
            </div>

            <div className="space-y-4">
              {/* Paystack upgrade card — shown only when not already Black */}
              {!user?.premium_active && (
                <div className="rounded-[22px] border border-neutral-900/10 bg-gradient-to-br from-neutral-900 to-neutral-800 p-5 space-y-3 shadow-[0_8px_32px_rgba(0,0,0,0.18)]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-400 flex items-center gap-1.5">
                        <Star size={10} fill="currentColor" /> Convivia Black
                      </p>
                      <p className="font-display text-xl italic text-white mt-1">
                        Priority shifts
                      </p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 shrink-0 mt-1">₦30k/mo</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-amber-300">Priority</span>
                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-amber-300">Black badge</span>
                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-amber-300">More matches</span>
                  </div>
                  {upgradeError && (
                    <p className="text-[11px] text-red-400">{upgradeError}</p>
                  )}
                  <button
                    type="button"
                    onClick={handleUpgrade}
                    disabled={upgrading}
                    className="w-full min-h-11 flex items-center justify-center gap-2 rounded-2xl bg-amber-400 text-neutral-900 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-300 transition-colors disabled:opacity-50"
                  >
                    {upgrading ? <Loader2 size={16} className="animate-spin" /> : <Star size={14} fill="currentColor" />}
                    {upgrading ? 'Loading…' : 'Get Black · pay with Paystack'}
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full flex items-center justify-center gap-2 p-4 border border-neutral-200 rounded-2xl text-neutral-500 hover:text-red-400 hover:border-red-400/30 transition-colors text-[10px] uppercase tracking-widest font-black disabled:opacity-50"
              >
                <LogOut size={14} /> {signingOut ? 'Signing out…' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>

        {/* My shift applications — worker only */}
        {persona === 'worker' && <MyApplications />}
      </div>

      <AnimatePresence>
        {verifyOpen && (
          <FaceVerificationModal user={user} onVerified={(u) => { setUser(u); setVerifyOpen(false); }} onClose={() => setVerifyOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MY APPLICATIONS — worker's shift application history
   ══════════════════════════════════════════════════════════════════════ */
const STATUS_STYLES: Record<string, string> = {
  pending:     'bg-amber-50 text-amber-800 border-amber-200',
  shortlisted: 'bg-sky-50 text-sky-800 border-sky-200',
  confirmed:   'bg-emerald-50 text-emerald-800 border-emerald-200',
  rejected:    'bg-neutral-100 text-neutral-500 border-neutral-200',
  no_show:     'bg-red-50 text-red-700 border-red-200',
};

function MyApplications() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/shifts/my-applications', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setApps(Array.isArray(d.applications) ? d.applications : []))
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 size={24} className="animate-spin text-red-700" />
      </div>
    );
  }

  return (
    <div className="mt-10 max-w-4xl mx-auto px-0">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-600 mb-2 flex items-center gap-2">
        <ClipboardList size={12} aria-hidden /> My shift applications
      </p>
      <h2 className="font-display text-2xl sm:text-3xl italic text-neutral-900 mb-5">
        Your <span className="text-red-700">applications.</span>
      </h2>

      {apps.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 py-14 text-center text-neutral-400">
          <ClipboardList size={36} className="mx-auto mb-3 opacity-40" />
          <p className="font-display text-xl italic mb-1">No applications yet.</p>
          <p className="text-sm">Browse open shifts and tap Apply.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((a) => {
            const d = a.shift_event_time ? new Date(a.shift_event_time) : null;
            const timeStr = d
              ? d.toLocaleString('en-NG', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : 'Time TBC';
            const payNgn = a.shift_pay_ngn ? `₦${Number(a.shift_pay_ngn).toLocaleString('en-NG')}` : null;
            const styleClass = STATUS_STYLES[a.status] ?? STATUS_STYLES.pending;

            return (
              <div
                key={a.id}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-start gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${styleClass}`}>
                      {a.status}
                    </span>
                    {payNgn && (
                      <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800">
                        {payNgn}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-neutral-900 text-base leading-snug">{a.shift_title || 'Shift'}</p>
                  <p className="text-sm text-neutral-500 mt-0.5 flex items-center gap-1.5">
                    <Clock size={12} className="shrink-0 text-red-700/70" /> {timeStr}
                  </p>
                  {(a.shift_city || a.shift_area) && (
                    <p className="text-sm text-neutral-500 flex items-center gap-1.5 mt-0.5">
                      <MapPin size={12} className="shrink-0 text-red-700/70" />
                      {[a.shift_area, a.shift_city].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <p className="text-[11px] text-neutral-400 mt-1.5">
                    Payout via {a.payout_provider} · {a.payout_phone}
                  </p>
                </div>

                {a.status === 'confirmed' && a.outlet_name && (
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Hi ${a.outlet_name} — confirming my slot for ${a.shift_title}. Looking forward to the shift.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-emerald-500/40 bg-emerald-50 text-emerald-900 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors"
                  >
                    <MessageCircle size={12} /> WhatsApp outlet
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ val, label }: { val: number; label: string }) {
  return (
    <div className="bg-neutral-50 border border-neutral-100 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden hover:border-red-400 transition-colors">
      <span className="text-3xl md:text-4xl font-display text-red-700 italic mb-2 tabular-nums">{val}</span>
      <span className="text-[10px] uppercase tracking-[0.22em] text-neutral-500 font-semibold">{label}</span>
    </div>
  );
}
