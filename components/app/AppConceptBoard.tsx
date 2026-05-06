'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, PlusSquare, CircleDashed, User as UserIcon, Zap, Home,
  Clock, Users, Star, ArrowRight, Building2, Ticket,
  MapPin, Camera, Calendar, LogOut, Edit3, Check, X, Loader2,
  Sparkles, Flame, ShieldCheck, RefreshCw, AlertCircle, Wine,
  Music2, Coffee, ChevronRight, Send, SkipForward, Hourglass, Share2, Copy,
} from 'lucide-react';
import ConviviumCard from '@/components/ConviviumCard';
import { SectionLabel } from '@/components/ui/SectionLabel';

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
      await navigator.share({ title: `Join: ${title}`, text: `You're invited — ${title}`, url });
      return;
    }
  } catch {
    return;
  }
  await copyHangoutInviteLink(id);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const VIBE_PROMPTS = [
  'Chill, social, not too loud',
  'Founders, ideas, whisky',
  'High energy, dancing, late',
  'Brunch, slow, conversation',
  'New to the city, open',
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
        <div key={s.n} className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-2 bg-white/90 border border-gold/20 rounded-full pl-2 pr-3 py-1.5 shadow-sm shadow-gold/5">
            <span className="w-5 h-5 rounded-full bg-gradient-to-br from-red-50 to-amber-50 text-red-800 ring-1 ring-gold/30 text-[10px] font-black flex items-center justify-center">{s.n}</span>
            <span className="text-[10px] uppercase tracking-widest font-black text-neutral-700">{s.label}</span>
            {s.sub && <span className="hidden md:inline text-[10px] text-neutral-400 font-medium normal-case tracking-normal">· {s.sub}</span>}
          </div>
          {i < steps.length - 1 && <ChevronRight size={14} className="text-neutral-400"/>}
        </div>
      ))}
    </div>
  );
}

type AppTab = 'home' | 'discover' | 'host' | 'circles' | 'profile';

/* ══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════ */
export function AppConceptBoard({ initialUser }: { initialUser?: any }) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const [pendingInviteHangoutId, setPendingInviteHangoutId] = useState<string | null>(null);

  const joinParam = searchParams.get('join');
  useEffect(() => {
    if (!joinParam || !UUID_RE.test(joinParam)) return;
    setPendingInviteHangoutId(joinParam);
    setActiveTab('discover');
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/');
    }
  }, [joinParam]);

  const clearPendingInvite = useCallback(() => setPendingInviteHangoutId(null), []);
  const goNow = useCallback(() => {
    setActiveTab('home');
    requestAnimationFrame(() => {
      mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':     return <HomeTab onSwitchTab={setActiveTab} />;
      case 'discover': return (
        <DiscoverTab
          onSwitchTab={setActiveTab}
          pendingInviteHangoutId={pendingInviteHangoutId}
          onClearPendingInvite={clearPendingInvite}
        />
      );
      case 'host':     return <HostTab onPosted={() => setActiveTab('discover')} />;
      case 'circles':  return <CirclesTab />;
      case 'profile':  return <ProfileTab initialUser={initialUser} />;
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full max-w-[100vw] flex-col mx-auto relative text-neutral-900 overflow-x-hidden max-lg:max-h-full">
      {/* TOP NAV (DESKTOP — lg+ only; tablet uses tab bar + fixed top strip) */}
      <header className="hidden lg:flex items-center justify-between px-6 lg:px-10 py-5 lg:py-6 border-b border-gold/20 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-[0_1px_0_0_rgba(201,168,76,0.08)]">
        <div className="flex items-center gap-2 min-w-0 w-[180px]">
          <button
            type="button"
            onClick={goNow}
            className="rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            aria-label="Go to Now"
          >
            <img src="/convivia24.png" alt="" className="h-7 lg:h-8 w-auto opacity-95" />
          </button>
        </div>

        <nav className="flex items-center gap-5 lg:gap-8 shrink min-w-0 justify-center">
          <DesktopNavLink label="Now"     icon={<Home size={18} />}         active={activeTab === 'home'}     onClick={() => setActiveTab('home')} />
          <DesktopNavLink label="Discover" icon={<Compass size={18} />}    active={activeTab === 'discover'} onClick={() => setActiveTab('discover')} />
          <DesktopNavLink label="Host"     icon={<PlusSquare size={18} />}  active={activeTab === 'host'}     onClick={() => setActiveTab('host')} />
          <DesktopNavLink label="Crews"    icon={<CircleDashed size={18} />} active={activeTab === 'circles'} onClick={() => setActiveTab('circles')} />
          <DesktopNavLink label="Profile"  icon={<UserIcon size={18} />}    active={activeTab === 'profile'}  onClick={() => setActiveTab('profile')} />
        </nav>

        <button onClick={goNow} className="bg-red-700 text-white px-4 lg:px-6 py-2.5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-800 hover:shadow-[0_0_20px_rgba(185,28,28,0.25)] transition-all flex items-center gap-2 w-[160px] lg:w-[180px] justify-center shrink-0">
          <Zap size={14} fill="currentColor" /> Pulse
        </button>
      </header>

      {/* STRIP + LOGO (phone & tablet) — fixed like a native app title bar */}
      <header
        className="lg:hidden fixed top-0 left-1/2 -translate-x-1/2 z-[60] w-full max-w-[min(100%,428px)] flex items-center px-3 sm:px-4 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2.5 bg-white/[0.94] backdrop-blur-xl border-b border-gold/20 shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
      >
        <button
          type="button"
          onClick={goNow}
          className="flex items-center min-h-11 min-w-11 rounded-xl active:bg-neutral-100 -ml-1 pl-1 pr-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-inset"
          aria-label="Go to Now"
        >
          <img src="/convivia24.png" alt="" className="h-7 w-auto max-w-[140px] object-contain object-left" />
        </button>
      </header>

      {/* MAIN CONTENT */}
      <div
        ref={mainScrollRef}
        className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden overscroll-y-contain px-3 sm:px-6 lg:px-12 max-lg:pt-[calc(env(safe-area-inset-top)+3.65rem)] lg:pt-12 max-lg:pb-[calc(8.75rem+env(safe-area-inset-bottom))] max-lg:scroll-pb-[calc(8.75rem+env(safe-area-inset-bottom))] lg:pb-12 scrollbar-hide relative touch-pan-y"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="min-h-full w-full mx-auto max-w-7xl"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile: floating “dock” tab bar — replaces footer links on small screens */}
      <div
        className="lg:hidden pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pt-3 bg-gradient-to-t from-[var(--app-wash)] via-[var(--app-wash)]/92 to-transparent"
      >
        <div
          className="pointer-events-auto mb-[max(0.65rem,env(safe-area-inset-bottom))] flex w-full max-w-[min(100%,428px)] items-end justify-between gap-0.5 rounded-[24px] border border-gold/25 bg-white/[0.94] backdrop-blur-xl px-1.5 pt-2 pb-2 shadow-[0_8px_40px_rgba(0,0,0,0.14),0_0_0_1px_rgba(255,255,255,0.5)_inset]"
          role="tablist"
          aria-label="Main navigation"
        >
        <NavIcon label="Host" icon={<PlusSquare size={20} strokeWidth={activeTab === 'host' ? 2.5 : 2} />} active={activeTab === 'host'} onClick={() => setActiveTab('host')} />
        <NavIcon label="Discover" icon={<Compass size={20} strokeWidth={activeTab === 'discover' ? 2.5 : 2} />} active={activeTab === 'discover'} onClick={() => setActiveTab('discover')} />

        <div className="relative -top-3 flex flex-col items-center gap-0.5 min-w-[52px] shrink-0">
          <button
            type="button"
            onClick={goNow}
            className={`w-[52px] h-[52px] rounded-full bg-gradient-to-br from-red-600 via-red-700 to-red-900 flex items-center justify-center text-white shadow-[0_6px_22px_rgba(185,28,28,0.4),0_0_0_1px_rgba(255,255,255,0.22)_inset] active:scale-[0.94] transition-transform duration-150 ${activeTab === 'home' ? 'ring-2 ring-gold/40 ring-offset-2 ring-offset-white/90' : ''}`}
            aria-label="Now — home"
          >
            <Home size={24} strokeWidth={2.25} className="opacity-95 drop-shadow-sm" />
          </button>
          <span className="text-[6.5px] uppercase tracking-[0.18em] font-black text-red-700">Now</span>
        </div>

        <NavIcon label="Crews" icon={<CircleDashed size={20} strokeWidth={activeTab === 'circles' ? 2.5 : 2} />} active={activeTab === 'circles'} onClick={() => setActiveTab('circles')} />
        <NavIcon label="Me" icon={<UserIcon size={20} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </div>
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
function NavIcon({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`min-w-[44px] max-w-[21vw] flex-1 min-h-[50px] py-1 rounded-[18px] flex flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-[0.97] ${
        active
          ? 'text-red-700 bg-red-50/95 shadow-[inset_0_0_0_1px_rgba(185,28,28,0.12)]'
          : 'text-neutral-500 hover:text-neutral-700'
      }`}
    >
      {icon}
      <span className={`text-[6.5px] uppercase tracking-[0.14em] font-black ${active ? 'text-red-800' : ''}`}>{label}</span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   INVITE LINK — opened from /join/[id] or /?join=[id]
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
          if (!d.hangout) setNote('This table is not available.');
          else setH(d.hangout);
        }
      })
      .catch(() => {
        if (!cancelled) setNote('Could not load invite.');
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
      } else setNote(data.error || 'Could not join.');
    } catch {
      setNote('Network error.');
    } finally {
      setJoining(false);
    }
  };

  const openPublicLink = () => window.open(publicInviteUrl(hangoutId), '_blank', 'noopener,noreferrer');

  if (loading) {
    return (
      <div className="mb-6 flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 py-8">
        <Loader2 className="w-5 h-5 text-red-700 animate-spin" />
        <span className="text-sm text-neutral-600">Loading invite…</span>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-[22px] border border-red-200 bg-gradient-to-br from-red-50/90 to-white px-4 py-4 md:px-5 md:py-5 shadow-[0_8px_30px_rgba(185,28,28,0.1)]"
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-700 mb-1">Invite</p>
          <h3 className="font-display text-xl md:text-2xl italic text-neutral-900 leading-tight">{h.title}</h3>
          <p className="text-xs text-neutral-500 mt-1">
            {h.formatted_time} · {h.formatted_date} · {h.city || h.location}
          </p>
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
          {isFull ? 'Full' : 'Join table'}
        </button>
        <button
          type="button"
          onClick={openPublicLink}
          className="px-4 py-3 rounded-full border border-neutral-200 text-[10px] font-black uppercase tracking-widest text-neutral-600 hover:border-red-300"
        >
          Open invite page
        </button>
        <button type="button" onClick={onDismiss} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-700">
          Dismiss
        </button>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   DISCOVER TAB — events & tables forming now
   ══════════════════════════════════════════════════════════════════════ */
function DiscoverTab({
  onSwitchTab,
  pendingInviteHangoutId,
  onClearPendingInvite,
}: {
  onSwitchTab: (t: AppTab) => void;
  pendingInviteHangoutId?: string | null;
  onClearPendingInvite?: () => void;
}) {
  const [filter, setFilter] = useState<'all' | 'open' | 'curated'>('all');
  const [discoverCity, setDiscoverCity] = useState<string>('London');
  const [hangouts, setHangouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinNote, setJoinNote] = useState<string | null>(null);
  const [inviteCopiedId, setInviteCopiedId] = useState<string | null>(null);

  const loadHangouts = useCallback(() => {
    setLoading(true);
    fetch(`/api/hangouts?city=${encodeURIComponent(discoverCity)}`)
      .then((r) => r.json())
      .then((data) => {
        setHangouts(Array.isArray(data.hangouts) ? data.hangouts : []);
        setLoading(false);
      })
      .catch(() => {
        setHangouts([]);
        setLoading(false);
      });
  }, [discoverCity]);

  useEffect(() => {
    loadHangouts();
  }, [loadHangouts]);

  const handleJoin = async (hangoutId: string) => {
    setJoiningId(hangoutId);
    setJoinNote(null);
    try {
      const res = await fetch(`/api/hangouts/${hangoutId}/join`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setJoinNote("You're in. We'll text you the table details.");
        loadHangouts();
      } else {
        setJoinNote(data.error || 'Could not join.');
      }
    } catch {
      setJoinNote('Network error. Try again.');
    } finally {
      setJoiningId(null);
    }
  };

  const filtered = hangouts.filter((h: any) => filter === 'all' || h.type === filter);

  return (
    <div className="space-y-8 md:space-y-12">
      {pendingInviteHangoutId && onClearPendingInvite ? (
        <InviteFromLinkBanner
          hangoutId={pendingInviteHangoutId}
          onDismiss={onClearPendingInvite}
          onJoined={loadHangouts}
        />
      ) : null}

      <motion.div
        className="space-y-4"
        initial="hidden"
        animate="show"
        variants={staggerContainer}
      >
        <motion.p variants={fadeUp} className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 flex items-center gap-2">
          <Ticket size={12} className="text-red-600 shrink-0" /> Events
        </motion.p>
        <motion.h1 variants={fadeUp} className="font-display text-3xl sm:text-5xl md:text-6xl italic leading-[1.02]">Tables forming now.</motion.h1>
        <motion.p variants={fadeUp} className="text-neutral-600 text-sm md:text-lg max-w-xl [overflow-wrap:anywhere]">
          Hangouts and open seats in the next 24 hours — the real-time pulse and AI match live on{' '}
          <button type="button" onClick={() => onSwitchTab('home')} className="text-red-700 font-semibold hover:underline underline-offset-4 decoration-red-600/50">
            Now
          </button>.
        </motion.p>
        <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 shrink-0">City</span>
          <div className="inline-flex max-w-full overflow-x-auto scrollbar-hide rounded-full p-0.5 bg-neutral-100 border border-neutral-200">
            {(['London', 'Lagos', 'Abuja'] as const).map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setDiscoverCity(c)}
                className={`shrink-0 text-[10px] uppercase tracking-widest font-black min-h-9 px-3 py-1.5 rounded-full transition-all ${
                  discoverCity === c
                    ? 'bg-red-700 text-white shadow-[0_0_12px_rgba(185,28,28,0.2)]'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-1.5">Live tables</p>
            <h2 className="font-display text-2xl md:text-4xl italic">Join a gathering.</h2>
            <p className="text-neutral-500 text-sm md:text-base mt-1">Curated and open-list tables you can hop into tonight.</p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
            <FilterChip label="All tables"   active={filter === 'all'}     onClick={() => setFilter('all')} />
            <FilterChip label="Curated only" active={filter === 'curated'} onClick={() => setFilter('curated')} color="gold" />
            <FilterChip label="Open list"    active={filter === 'open'}    onClick={() => setFilter('open')} color="blue" />
          </div>
        </div>

        {joinNote && (
          <div className="bg-red-50 border border-red-400 rounded-2xl px-4 py-3 text-sm text-red-800 flex items-center justify-between gap-3">
            <span>{joinNote}</span>
            <button type="button" onClick={() => setJoinNote(null)} className="text-red-600 hover:text-red-700"><X size={16}/></button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-red-700 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-neutral-400 border border-dashed border-neutral-200 rounded-3xl">
            <Compass size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-display text-2xl italic mb-2">No tables in {discoverCity} yet.</p>
            <p className="text-sm mb-5">Host one from Now or open the Host tab.</p>
            <button type="button" onClick={() => onSwitchTab('host')} className="text-[10px] font-black uppercase tracking-widest bg-red-700 text-white px-6 py-3 rounded-full hover:bg-red-800 transition-colors">
              Host a table
            </button>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {filtered.map((h: any) => {
              const isCurated = h.type === 'curated';
              const badgeClass = isCurated
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-sky-50 text-sky-800 border-sky-200';
              const isFull = (h.current_guests || 0) >= (h.max_guests || 0);
              return (
                <motion.div
                  key={h.id}
                  variants={staggerItem}
                  whileHover={{ y: -4 }}
                  className="relative bg-white rounded-[26px] md:rounded-[28px] p-4 md:p-6 border border-neutral-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.03] hover:border-red-300 hover:shadow-[0_12px_40px_rgba(185,28,28,0.09)] transition-shadow flex flex-col justify-between group overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-700 via-red-600 to-neutral-900 opacity-90" />
                  {h.cover_image && (
                    <div className="w-full h-28 md:h-36 rounded-2xl overflow-hidden mb-3 md:mb-4 -mt-0.5 md:-mt-1">
                      <img src={h.cover_image} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between items-start mb-3 md:mb-5 gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border ${badgeClass}`}>
                        {h.type}
                      </span>
                      <span className="text-red-700 text-[10px] uppercase font-black tracking-widest bg-red-50 px-2 py-1 rounded-full border border-red-200 shrink-0">Live</span>
                    </div>
                    <h3 className="font-display text-xl md:text-2xl lg:text-3xl mb-1.5 md:mb-2 leading-tight text-neutral-900">{h.title}</h3>
                    <p className="text-neutral-600 text-sm mb-4 md:mb-6 line-clamp-2">{h.vibe}</p>

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
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex -space-x-2">
                          {(h.attendees || []).slice(0, 4).map((a: any) =>
                            a.avatar_url ? (
                              <img key={a.user_id} src={a.avatar_url} className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="" />
                            ) : (
                              <div key={a.user_id} className="w-8 h-8 rounded-full border-2 border-white bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-600">
                                {(a.name || '?')[0]}
                              </div>
                            ),
                          )}
                        </div>
                        <span className="text-xs text-neutral-500 font-bold tabular-nums">{h.current_guests || 0} / {h.max_guests || 0}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleJoin(h.id)}
                        disabled={joiningId === h.id || isFull}
                        className="min-h-10 shrink-0 text-[10px] uppercase font-black tracking-widest text-white bg-neutral-900 hover:bg-red-700 px-4 md:px-5 py-2.5 rounded-full transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50"
                      >
                        {joiningId === h.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : isFull ? (
                          'Full'
                        ) : (
                          <>
                            Join <ArrowRight size={12} className="mb-0.5" />
                          </>
                        )}
                      </button>
                    </div>
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
                        {inviteCopiedId === h.id ? 'Copied' : 'Invite link'}
                      </button>
                      <button
                        type="button"
                        onClick={() => shareHangoutInvite(h.id, h.title)}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-full border border-red-200 bg-red-50 text-[9px] font-black uppercase tracking-widest text-red-800 hover:bg-red-100"
                      >
                        <Share2 size={12} /> Share
                      </button>
                      <Link
                        href={`/join/${h.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 rounded-full text-[9px] font-black uppercase tracking-widest text-neutral-500 hover:text-red-800"
                      >
                        Preview
                      </Link>
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
  phase, plan, pulse, creditsResetAt, onAccept, onSkip, onDelay, onClose, onUpgrade,
}: { phase: 'matching' | 'ready' | 'gated'; plan: any; pulse: Pulse; creditsResetAt: string | null; onAccept: () => void; onSkip: () => void; onDelay: () => void; onClose: () => void; onUpgrade: () => void }) {
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
                <h2 className="font-display text-3xl md:text-4xl italic mb-2">No credits left</h2>
                <p className="text-neutral-600 text-sm">Convivia Black unlocks unlimited matches in {pulse.area}.</p>
              </>
            ) : phase === 'matching' ? (
              <>
                <h2 className="font-display text-3xl md:text-4xl italic mb-2">Matching your vibe…</h2>
                <p className="text-neutral-600 text-sm">Pulling people who match your energy and proximity.</p>
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
                <h3 className="font-display text-2xl italic text-neutral-900 mb-1">You&apos;ve used your free match this week.</h3>
                <p className="text-neutral-600 text-sm max-w-xs mx-auto">
                  Free members get 1 AI match per week. {creditsResetAt && <>Resets <strong>{new Date(creditsResetAt).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</strong>.</>}
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={onClose} className="flex-1 py-3 rounded-full border border-neutral-300 text-neutral-600 font-black uppercase tracking-widest text-[11px]">Wait</button>
                <button onClick={onUpgrade} className="flex-1 py-3 rounded-full bg-red-700 text-white font-black uppercase tracking-widest text-[11px] shadow-[0_0_25px_rgba(185,28,28,0.2)] flex items-center justify-center gap-1.5">
                  <Star size={12} fill="currentColor"/> Unlock Black
                </button>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">14-day free trial · cancel anytime</p>
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
              <div className="flex items-center gap-3 mb-5">
                <div className="flex -space-x-3">
                  {plan?.people?.map((p: any, i: number) => (
                    <img key={i} src={p.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-white object-cover" />
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
                <div className="flex items-center gap-2 text-neutral-800"><Users     size={14} className="text-red-700"/> {(plan?.people?.length || 0) + 1} people · similar vibe</div>
                {plan?.live && <div className="text-[10px] uppercase tracking-widest text-emerald-300 font-black">Live table · joinable now</div>}
                {!plan?.live && <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-black">Plan locks once 3 confirm</div>}
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
                  <Zap size={16} fill="currentColor"/><span className="text-[9px] uppercase tracking-widest">Join</span>
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
    <button onClick={onClick} className={`px-5 py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${baseColors[color]}`}>
      {label}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   HOST TAB — Real hangout creation
   ══════════════════════════════════════════════════════════════════════ */
function HostTab({ onPosted }: { onPosted: () => void }) {
  const [size, setSize] = useState(6);
  const [type, setType] = useState('curated');
  const [title, setTitle] = useState('');
  const [vibe, setVibe] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('Lagos');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdHangoutId, setCreatedHangoutId] = useState<string | null>(null);
  const [inviteCopiedHost, setInviteCopiedHost] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) setCoverImage(data.url);
      else setError(data.error || 'Upload failed.');
    } catch {
      setError('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !vibe.trim() || !location.trim() || !eventDate || !eventTime) {
      setError('Fill in all fields — title, vibe, location, date, and time.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const event_time = new Date(`${eventDate}T${eventTime}`).toISOString();
      const res = await fetch('/api/hangouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, vibe, type,
          category: 'social',
          event_time, location, city,
          max_guests: size,
          cover_image: coverImage,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreatedHangoutId(data.hangout?.id ? String(data.hangout.id) : null);
        setSuccess(true);
      } else setError(data.error || 'Failed to create hangout.');
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
        <h2 className="font-display text-4xl italic text-neutral-900 mb-3">Your table is set.</h2>
        <p className="text-neutral-500 text-base mb-6 max-w-md mx-auto">Your hangout is live on Discover. Send friends an invite link so they can join in one tap.</p>
        {createdHangoutId ? (
          <div className="max-w-md mx-auto mb-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Invite link</p>
            <p className="text-xs text-neutral-600 break-all font-mono mb-3">{publicInviteUrl(createdHangoutId)}</p>
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
                onClick={() => shareHangoutInvite(createdHangoutId, title || 'Join my table')}
                className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full border border-neutral-300 text-[10px] font-black uppercase tracking-widest text-neutral-800 hover:border-red-400"
              >
                <Share2 size={14} /> Share
              </button>
              <Link
                href={`/join/${createdHangoutId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2 text-[10px] font-black uppercase tracking-widest text-red-700 hover:underline"
              >
                Open invite page
              </Link>
            </div>
          </div>
        ) : null}
        <div className="flex justify-center gap-3 flex-wrap">
          <button onClick={onPosted} className="bg-red-700 text-white px-6 py-3 rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-red-800 transition-colors">View on Discover</button>
          <button onClick={() => { setSuccess(false); setCreatedHangoutId(null); setTitle(''); setVibe(''); setLocation(''); setEventDate(''); setEventTime(''); setCoverImage(null); }}
            className="text-red-700 text-[10px] uppercase tracking-widest font-black hover:text-red-800 transition-colors">Host another →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 md:space-y-6 max-w-3xl mx-auto h-full flex flex-col">
      <div className="mb-5 md:mb-12 text-left md:text-center">
        <h1 className="font-display text-4xl md:text-6xl italic mb-2">Host a table.</h1>
        <p className="text-neutral-500 text-base md:text-lg mb-4">Set the table. Define the energy. The right people will come.</p>
        <div className="hidden md:flex justify-center">
          <FlowSteps steps={[
            { n: '1', label: 'Describe',   sub: 'occasion + vibe' },
            { n: '2', label: 'Set venue',  sub: 'date + table size' },
            { n: '3', label: 'Go live',    sub: 'guests can join now' },
          ]}/>
        </div>
        <div className="md:hidden grid grid-cols-3 gap-2">
          {[
            ['1', 'Vibe'],
            ['2', 'Place'],
            ['3', 'Publish'],
          ].map(([n, label]) => (
            <div key={n} className="bg-neutral-50 border border-neutral-200 rounded-2xl px-3 py-2">
              <span className="text-red-700 text-[10px] font-black">{n}</span>
              <p className="text-[10px] uppercase tracking-widest font-black text-neutral-600">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-neutral-50 backdrop-blur-lg border border-neutral-200 rounded-[28px] md:rounded-[40px] p-5 md:p-12 shadow-2xl flex-1">
        <div className="space-y-7 md:space-y-10">
          <Field label="The Occasion">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Founders After Dark"
              className="w-full bg-transparent border-b border-neutral-200 pb-3 text-2xl md:text-3xl focus:outline-none focus:border-red-700 placeholder:text-neutral-300 transition-colors font-display italic" />
          </Field>

          <Field label="The Energy">
            <input type="text" value={vibe} onChange={(e) => setVibe(e.target.value)} placeholder="e.g. Whisky, ideas, and honest conversation."
              className="w-full bg-transparent border-b border-neutral-200 pb-3 text-base focus:outline-none focus:border-red-700 placeholder:text-neutral-300 transition-colors" />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Where">
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. The Table, Victoria Island"
                className="w-full bg-transparent border-b border-neutral-200 pb-3 text-base focus:outline-none focus:border-red-700 placeholder:text-neutral-300 transition-colors" />
            </Field>
            <Field label="City">
              <select value={city} onChange={(e) => setCity(e.target.value)}
                className="w-full bg-transparent border-b border-neutral-200 pb-3 text-base focus:outline-none focus:border-red-700 transition-colors text-neutral-900 [color-scheme:dark]">
                {['Lagos', 'Abuja', 'London'].map((c) => <option key={c} value={c} className="bg-white text-neutral-900">{c}</option>)}
              </select>
            </Field>
          </div>

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

          {/* Cover Image */}
          <Field label="Cover Image" hint="(optional)" Icon={Camera}>
            {coverImage ? (
              <div className="relative rounded-2xl overflow-hidden h-44 border border-neutral-200">
                <img src={coverImage} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setCoverImage(null)} className="absolute top-3 right-3 bg-black/55 text-neutral-900 p-1.5 rounded-full hover:bg-red-900 transition-colors">
                  <X size={14} />
                </button>
                <span className="absolute bottom-3 left-3 text-[9px] uppercase tracking-widest font-black text-red-700 bg-black/50 px-2 py-1 rounded-full border border-red-400">
                  Stored on Azure
                </span>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 border border-dashed border-neutral-200 rounded-2xl p-6 cursor-pointer hover:border-red-600 transition-colors text-neutral-400 hover:text-neutral-600">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                {uploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                <span className="text-sm">{uploading ? 'Uploading…' : 'Add a cover photo'}</span>
              </label>
            )}
          </Field>

          {/* Format */}
          <Field label="Format">
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <button onClick={() => setType('curated')} className={`flex flex-col md:flex-row items-center justify-center gap-3 py-6 px-4 rounded-2xl border transition-all ${type === 'curated' ? 'bg-red-50 border-red-700 text-red-700 shadow-[0_0_20px_rgba(201,168,76,0.15)]' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:bg-neutral-100'}`}>
                <Zap size={24} />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Curated</span>
              </button>
              <button onClick={() => setType('open')} className={`flex flex-col md:flex-row items-center justify-center gap-3 py-6 px-4 rounded-2xl border transition-all ${type === 'open' ? 'bg-[#1a3a5f]/20 border-[#4da6ff]/50 text-[#4da6ff] shadow-[0_0_20px_rgba(77,166,255,0.1)]' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:bg-neutral-100'}`}>
                <Users size={24} />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Open</span>
              </button>
            </div>
          </Field>

          {/* Size */}
          <div>
            <label className="text-[10px] md:text-xs font-black text-neutral-500 uppercase tracking-[0.2em] mb-6 flex justify-between items-end">
              <span>Table Size</span>
              <span className="text-xl md:text-2xl text-red-700 font-display italic">{size} People</span>
            </label>
            <input type="range" min="6" max="24" value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-red-700" />
            <div className="flex justify-between text-[9px] text-neutral-400 mt-3 font-bold uppercase tracking-widest">
              <span>Intimate (6)</span>
              <span>Grand (24)</span>
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mt-6 text-center">{error}</p>}

        <button onClick={handleSubmit} disabled={submitting}
          className="sticky bottom-24 md:static z-10 w-full bg-red-700 text-white py-4 md:py-5 rounded-full font-black uppercase tracking-[0.2em] text-[11px] mt-8 md:mt-12 hover:bg-red-800 hover:shadow-[0_0_30px_rgba(185,28,28,0.25)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_10px_30px_rgba(0,0,0,0.35)] md:shadow-none">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <><span>Set the Table</span> <ArrowRight size={16} /></>}
        </button>
      </div>
    </div>
  );
}

function Field({ label, hint, Icon, children }: { label: string; hint?: string; Icon?: any; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] md:text-xs font-black text-neutral-500 uppercase tracking-[0.2em] block mb-3">
        {Icon && <Icon size={12} className="inline mr-1.5 -mt-0.5" />}{label}{hint && <span className="text-neutral-400 ml-1.5 normal-case font-bold">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function HomeExploreSnippets({ onSwitchTab, openTablesCount }: { onSwitchTab: (t: AppTab) => void; openTablesCount: number }) {
  const cards: { tab: AppTab; title: string; sub: string; Icon: typeof Ticket }[] = [
    { tab: 'discover', title: 'Events', sub: openTablesCount > 0 ? `${openTablesCount} open now` : 'Tables forming now', Icon: Ticket },
    { tab: 'host', title: 'Host', sub: 'Start a table tonight', Icon: PlusSquare },
    { tab: 'circles', title: 'Crews', sub: 'Your people', Icon: CircleDashed },
    { tab: 'profile', title: 'You', sub: 'Verify · Black', Icon: UserIcon },
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3">
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
   HOME TAB — live landing: city pulse, AI match, app snippets, partner spots
   ══════════════════════════════════════════════════════════════════════ */
function HomeTab({ onSwitchTab }: { onSwitchTab: (t: AppTab) => void }) {
  const [hangouts, setHangouts] = useState<any[]>([]);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinNote, setJoinNote] = useState<string | null>(null);

  const [activeCity, setActiveCity] = useState<string>('London');
  const [pulseCards, setPulseCards] = useState<Pulse[]>([]);
  const [pulseLoading, setPulseLoading] = useState(true);
  const [activePulse, setActivePulse] = useState<Pulse | null>(null);
  const [vibePrompt, setVibePrompt] = useState('');
  const [matchPhase, setMatchPhase] = useState<'idle' | 'matching' | 'ready' | 'gated'>('idle');
  const [matchedPlan, setMatchedPlan] = useState<any | null>(null);
  const [premium, setPremium] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsResetAt, setCreditsResetAt] = useState<string | null>(null);

  const [venues, setVenues] = useState<any[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [reservedId, setReservedId] = useState<string | null>(null);
  const [reserveNote, setReserveNote] = useState<string | null>(null);

  const loadCityData = useCallback(async (city: string) => {
    setVenuesLoading(true);
    try {
      const [hRes, vRes] = await Promise.all([
        fetch(`/api/hangouts?city=${encodeURIComponent(city)}`),
        /* Partner catalog is global; filtering only by city hid venues in other metros and any city string mismatch. */
        fetch('/api/venues'),
      ]);
      const hJson = await hRes.json();
      const vJson = await vRes.json();
      setHangouts(Array.isArray(hJson.hangouts) ? hJson.hangouts : []);
      setVenues(Array.isArray(vJson.venues) ? vJson.venues : []);
    } catch {
      setHangouts([]);
      setVenues([]);
    } finally {
      setVenuesLoading(false);
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
    fetch('/api/match').then(r => r.json()).then(data => {
      setPremium(!!data.premium);
      setCredits(data.credits_remaining ?? null);
      setCreditsResetAt(data.credits_reset_at || null);
    }).catch(() => { /* leave defaults */ });
  }, []);

  useEffect(() => {
    loadCityData(activeCity);
  }, [activeCity, loadCityData]);

  useEffect(() => {
    loadMatchStatus();
  }, [loadMatchStatus]);

  useEffect(() => { loadPulse(activeCity); }, [activeCity, loadPulse]);

  const openTablesCount = useMemo(
    () => hangouts.filter((h: any) => (h.current_guests || 0) < (h.max_guests || 0)).length,
    [hangouts],
  );

  const categories = [
    { key: 'all',            label: 'All',        icon: '✦' },
    { key: 'dining',         label: 'Dining',     icon: '🍽' },
    { key: 'lounge',         label: 'Lounge',     icon: '🥂' },
    { key: 'boardroom',      label: 'Deal Rooms', icon: '💼' },
    { key: 'accommodations', label: 'Stay',       icon: '🛏' },
    { key: 'wellness',       label: 'Wellness',   icon: '🧖' },
  ];

  const venuesSortedForCity = useMemo(() => {
    const needle = activeCity.toLowerCase().trim();
    const rank = (v: any) => {
      const c = String(v.city ?? '').toLowerCase().trim();
      if (!needle) return 0;
      if (!c) return 2;
      if (c === needle) return 0;
      if (c.includes(needle) || needle.includes(c)) return 0;
      return 1;
    };
    return [...venues].sort((a, b) => {
      const d = rank(a) - rank(b);
      if (d !== 0) return d;
      const ac = `${a.city ?? ''} ${a.name ?? ''}`;
      const bc = `${b.city ?? ''} ${b.name ?? ''}`;
      return ac.localeCompare(bc);
    });
  }, [venues, activeCity]);

  const filteredVenues =
    categoryFilter === 'all'
      ? venuesSortedForCity
      : venuesSortedForCity.filter((v) => v.category === categoryFilter);

  const handleJoin = async (hangoutId: string) => {
    setJoiningId(hangoutId);
    setJoinNote(null);
    try {
      const res = await fetch(`/api/hangouts/${hangoutId}/join`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setJoinNote("You're in. We'll text you the table details.");
        loadCityData(activeCity);
      } else {
        setJoinNote(data.error || 'Could not join.');
      }
    } catch {
      setJoinNote('Network error. Try again.');
    } finally {
      setJoiningId(null);
    }
  };

  const handleReserve = async (venueId: string) => {
    setReservingId(venueId);
    setReserveNote(null);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venue_id: venueId, party_size: 2 }),
      });
      const data = await res.json();
      if (res.ok) {
        setReservedId(venueId);
        setReserveNote(data.premium ? 'Confirmed — Black member priority.' : 'Reservation requested. Partner will confirm.');
        setTimeout(() => setReservedId(null), 4000);
      } else {
        setReserveNote(data.error || 'Could not request reservation.');
      }
    } catch {
      setReserveNote('Network error. Try again.');
    } finally {
      setReservingId(null);
    }
  };

  const planTitleFromPulse = (pulse: Pulse) => {
    const head = pulse.vibe.split('·')[0]?.trim();
    return `${pulse.area} · ${head || pulse.vibe.slice(0, 32)}`;
  };

  const startMatch = async (pulse: Pulse) => {
    setActivePulse(pulse);
    if (!premium && credits !== null && credits <= 0) {
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
      if (res.status === 402) {
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
      setJoinNote("We'll lock the plan once others confirm. Watch your inbox.");
    }
    closeMatch();
  };
  const skipPlan  = async () => { await logMatchAction('skipped');  closeMatch(); };
  const delayPlan = async () => { await logMatchAction('delayed');  setJoinNote("We'll surface another vibe in a few minutes."); closeMatch(); };

  const matchByVibe = () => {
    const v = vibePrompt.toLowerCase();
    if (pulseCards.length === 0) return;
    const found =
      pulseCards.find((p) => v && p.vibe.toLowerCase().includes(v)) ||
      (v.includes('chill') ? pulseCards.find((p) => p.vibe.toLowerCase().includes('brunch') || p.energy === 'rising') : null) ||
      (v.includes('founder') || v.includes('whisky') ? pulseCards.find((p) => p.vibe.toLowerCase().includes('whisky') || p.vibe.toLowerCase().includes('lounge')) : null) ||
      (v.includes('dance') || v.includes('music') ? pulseCards.find((p) => p.vibe.toLowerCase().includes('music')) : null) ||
      pulseCards[0];
    startMatch(found);
  };

  const formatSpend = (amount: number) => `₦${(amount / 1000).toFixed(0)}k`;

  return (
    <div className="space-y-6 lg:space-y-12">
      <motion.section
        className="relative overflow-hidden rounded-[18px] lg:rounded-[32px] border border-gold/25 shadow-[0_16px_48px_rgba(0,0,0,0.07),0_0_0_1px_rgba(201,168,76,0.12)] max-lg:shadow-[0_6px_28px_rgba(0,0,0,0.07)]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 32 }}
      >
        {/* Mobile / tablet: fixed-height image band + solid panel (no tiny type on photo) */}
        <div className="lg:hidden flex flex-col">
          <div className="relative h-[152px] sm:h-[168px] shrink-0 overflow-hidden bg-neutral-900">
            <img
              src="/Homepage.png"
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/30 to-black/40" aria-hidden />
            <div className="absolute top-2.5 left-3 z-[1]">
              <p className="text-[9px] font-black uppercase tracking-[0.28em] text-gold-light flex items-center gap-1.5 drop-shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-pulse shrink-0" />
                Live · {new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}
              </p>
            </div>
            <div className="absolute inset-x-0 bottom-0 z-[1] p-3 pt-8 bg-gradient-to-t from-black/75 to-transparent">
              <h1 className="font-display text-[1.5rem] leading-[1.02] italic text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.5)]">
                What&apos;s <span className="text-[color:var(--gold-accent,#c9a84c)]">live</span> right now
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
              Neighbourhood energy refreshes here — then AI matches you in one tap. Open{' '}
              <button
                type="button"
                onClick={() => onSwitchTab('discover')}
                className="text-red-700 font-semibold underline decoration-red-600/40 underline-offset-2"
              >
                Discover
              </button>{' '}
              for tables you can join.
            </motion.p>
            <motion.div variants={staggerItem} className="bg-white border border-red-200/90 rounded-[22px] p-3.5 shadow-[0_8px_28px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <span className="text-[10px] uppercase tracking-[0.24em] font-black text-red-700">AI Match</span>
                {premium ? (
                  <span className="text-[9px] uppercase tracking-wider font-bold text-red-700">Black</span>
                ) : (
                  <span className={`text-[9px] tabular-nums ${(credits ?? 0) > 0 ? 'text-neutral-500' : 'text-amber-800'}`}>
                    {(credits ?? 0) > 0 ? '1/wk' : 'Limit reached'}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={vibePrompt}
                  onChange={(e) => setVibePrompt(e.target.value)}
                  placeholder="chill, social, not too loud"
                  className="min-w-0 flex-1 bg-neutral-50 border border-neutral-200 rounded-2xl px-3.5 py-2.5 text-[15px] focus:outline-none focus:border-red-700 placeholder:text-neutral-400"
                />
                <button type="button" onClick={matchByVibe} className="w-11 h-11 shrink-0 rounded-2xl bg-red-700 text-white flex items-center justify-center shadow-[0_0_20px_rgba(185,28,28,0.2)] active:scale-95 transition-transform" aria-label="Match me">
                  <Sparkles size={18} fill="currentColor"/>
                </button>
              </div>
            </motion.div>
            <motion.div variants={staggerItem} className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => onSwitchTab('discover')} className="min-h-10 rounded-2xl border border-neutral-200 bg-white text-neutral-800 text-[10px] uppercase tracking-widest font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-sm">
                <Compass size={14}/> Discover
              </button>
              <button type="button" onClick={() => onSwitchTab('host')} className="min-h-10 rounded-2xl border border-neutral-200 bg-white text-neutral-800 text-[10px] uppercase tracking-widest font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-sm">
                <PlusSquare size={14}/> Host
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Desktop: full-bleed photo + glass copy */}
        <div className="hidden lg:block relative min-h-[320px]">
          <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
            <img
              src="/Homepage.png"
              alt=""
              className="w-full h-full min-h-[320px] object-cover object-[center_30%]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/28 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" />
            <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.08] via-transparent to-transparent" />
          </div>
          <motion.div
            className="relative z-10 p-10 space-y-4"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            <motion.p
              variants={staggerItem}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-light flex items-center gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.85)] animate-pulse shrink-0"/> Live · {new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}
            </motion.p>
            <motion.div
              variants={staggerItem}
              className="max-w-2xl rounded-[24px] border border-white/15 bg-neutral-950/55 backdrop-blur-md px-5 py-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
            >
              <h1 className="font-display text-5xl xl:text-6xl italic leading-[1.02] text-white drop-shadow-sm">
                What&apos;s <span className="text-[color:var(--gold-accent,#c9a84c)] drop-shadow-[0_1px_12px_rgba(0,0,0,0.5)]">live</span> right now
              </h1>
              <p className="mt-3 text-white text-lg leading-snug max-w-xl [overflow-wrap:anywhere] font-medium tracking-wide [word-spacing:0.02em]">
                Neighbourhood energy refreshes here — then AI matches you in one tap. Tables you can join are in{' '}
                <button
                  type="button"
                  onClick={() => onSwitchTab('discover')}
                  className="text-gold-light font-semibold underline decoration-gold-light/70 underline-offset-[5px] hover:text-white hover:decoration-white/80"
                >
                  Discover
                </button>
                .
              </p>
            </motion.div>
            <motion.div variants={staggerItem}>
              <FlowSteps steps={[
                { n: '1', label: 'Feel the pulse', sub: 'live city' },
                { n: '2', label: 'AI matches you', sub: '4–6 people' },
                { n: '3', label: 'Instant plan',   sub: 'go tonight' },
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
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-1.5 flex items-center gap-2"><Zap size={10}/> Live City Pulse</p>
            <h2 className="font-display text-2xl md:text-3xl italic">Where the energy is now.</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex max-w-full overflow-x-auto scrollbar-hide rounded-full p-0.5 bg-neutral-100 border border-neutral-200">
              {(['London','Lagos','Abuja'] as const).map((c) => (
                <button type="button" key={c} onClick={() => setActiveCity(c)}
                  className={`shrink-0 text-[10px] uppercase tracking-widest font-black min-h-10 px-3 sm:px-3.5 py-2 rounded-full transition-all ${activeCity===c ? 'bg-red-700 text-white shadow-[0_0_15px_rgba(185,28,28,0.2)]' : 'text-neutral-600 hover:text-neutral-900 active:bg-neutral-200/60'}`}>
                  {c}
                </button>
              ))}
            </div>
            {premium ? (
              <span className="hidden md:inline-flex text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-400 items-center gap-1">
                <Star size={10} fill="currentColor"/> Black
              </span>
            ) : (
              <span className={`hidden md:inline-flex text-[10px] px-2.5 py-1 rounded-full border tabular-nums items-center gap-1 ${
                (credits ?? 0) > 0 ? 'text-neutral-500 border-neutral-200 bg-neutral-900/[0.04]' : 'text-amber-900/90 border-amber-600/35 bg-amber-100/80'
              }`}>
                {(credits ?? 0) > 0 ? '1 match / week' : 'No matches left'}
              </span>
            )}
          </div>
        </div>

        {pulseLoading ? (
          <div className="flex justify-center py-10"><Loader2 size={24} className="text-red-700 animate-spin"/></div>
        ) : pulseCards.length === 0 ? (
          <div className="text-center py-10 text-neutral-400 border border-dashed border-neutral-200 rounded-3xl">
            <Compass size={36} className="mx-auto mb-3 opacity-50"/>
            <p className="font-display text-xl italic">No live energy in {activeCity} yet.</p>
            <p className="text-sm mt-1">Host a table — it shows up in Discover too.</p>
          </div>
        ) : (
          <div className="relative max-md:rounded-[28px] max-md:border max-md:border-neutral-200/90 max-md:bg-gradient-to-b max-md:from-neutral-50/90 max-md:to-neutral-100/50 max-md:p-3 sm:max-md:p-4">
            <p className="text-[10px] text-neutral-500 mb-3 md:mb-0 font-bold uppercase tracking-[0.2em] px-0.5 md:hidden">
              Pull up for more · tap a card to match
            </p>
            {/* Mobile: one column + real scroll. Desktop: 2 columns, no nested scroll trap. */}
            <div
              className="max-h-[min(72vh,560px)] overflow-y-auto overflow-x-hidden overscroll-contain pr-1 [-webkit-overflow-scrolling:touch] md:max-h-none md:overflow-visible md:pr-0"
              style={{ scrollbarGutter: 'stable' }}
            >
              <motion.div
                className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-5 pb-1 md:pb-0"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                {pulseCards.map((pulse) => {
                  const PulseIcon = pickPulseIcon(pulse.vibe);
                  const stripe = ENERGY_STRIPE[pulse.energy];
                  return (
                    <motion.button
                      key={pulse.id}
                      type="button"
                      variants={staggerItem}
                      whileTap={{ scale: 0.995 }}
                      whileHover={{ y: -2 }}
                      onClick={() => startMatch(pulse)}
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
                            <Sparkles size={11} className="shrink-0" /> Match · {pulse.groupSize} people
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {!!pulse.liveTables && pulse.liveTables > 0 && (
                              <span className="text-[9px] uppercase tracking-widest font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/90">
                                {pulse.liveTables} live
                              </span>
                            )}
                            <span className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-hover:text-red-600 transition-colors items-center gap-0.5">
                              Open <ChevronRight size={14} strokeWidth={2} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            </div>
          </div>
        )}

        <div className="hidden md:block mt-5 bg-neutral-50 border border-neutral-200 rounded-3xl p-4 md:p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500 mb-3">Or describe your vibe</p>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text" value={vibePrompt} onChange={(e) => setVibePrompt(e.target.value)}
              placeholder="e.g. chill, social, not too loud"
              className="flex-1 bg-transparent border-b border-neutral-200 pb-2 text-base focus:outline-none focus:border-red-700 placeholder:text-neutral-400 transition-colors"
            />
            <button type="button" onClick={matchByVibe}
              className="bg-red-700 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-800 transition-colors flex items-center justify-center gap-2 shrink-0">
              <Send size={12}/> Match Me
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {VIBE_PROMPTS.map((p) => (
              <button key={p} type="button" onClick={() => setVibePrompt(p)} className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 hover:text-red-700 border border-neutral-200 hover:border-red-600 px-2.5 py-1 rounded-full transition-colors">
                {p}
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      <HomeExploreSnippets onSwitchTab={onSwitchTab} openTablesCount={openTablesCount} />

      {/* Partner spots */}
      <motion.section
        className="space-y-5 pt-2 border-t border-neutral-200"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
      >
        <motion.div variants={fadeUp}>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-1.5">Partner spots</p>
          <h2 className="font-display text-2xl md:text-3xl italic mb-2">Where plans can land.</h2>
          <p className="text-neutral-500 text-sm max-w-xl">
            Reserve a seat at spaces we work with — useful when your crew wants an anchor, not a venue hunt.
          </p>
          <p className="text-[11px] text-neutral-400 mt-2">
            Full partner network · <span className="font-semibold text-neutral-500">{activeCity}</span> first
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
          {categories.map(cat => (
            <button type="button" key={cat.key} onClick={() => setCategoryFilter(cat.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${
                categoryFilter === cat.key
                  ? 'bg-red-50 text-red-700 border border-red-600 shadow-[0_0_15px_rgba(185,28,28,0.12)]'
                  : 'text-neutral-500 border border-neutral-200 hover:border-neutral-300 hover:text-neutral-600'
              }`}
            >
              <span className="text-sm">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </motion.div>

        {reserveNote && (
          <div className="bg-red-50 border border-red-400 rounded-2xl px-4 py-3 text-sm text-red-800 flex items-center justify-between gap-3">
            <span>{reserveNote}</span>
            <button type="button" onClick={() => setReserveNote(null)} className="text-red-600 hover:text-red-700"><X size={16}/></button>
          </div>
        )}

        {venuesLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 size={32} className="text-red-700 animate-spin" /></div>
        ) : filteredVenues.length === 0 ? (
          <div className="text-center py-14 text-neutral-400 border border-dashed border-neutral-200 rounded-3xl">
            <Building2 size={40} className="mx-auto mb-3 opacity-50" />
            <p className="font-display text-xl italic mb-1">No spots match this filter.</p>
            <p className="text-sm">We&apos;re adding partner locations as the network grows.</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {filteredVenues.map((venue) => (
              <motion.div
                key={venue.id}
                variants={staggerItem}
                whileHover={{ y: -3 }}
                className="bg-white rounded-[28px] overflow-hidden border border-neutral-200/90 shadow-[0_10px_40px_rgba(0,0,0,0.07)] ring-1 ring-black/[0.03] group hover:border-red-300 hover:shadow-[0_16px_48px_rgba(185,28,28,0.1)] transition-shadow flex flex-col"
              >
                <div className="relative h-44 md:h-48 overflow-hidden">
                  {venue.image_url
                    ? <img src={venue.image_url} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" alt="" />
                    : <div className="w-full h-full bg-gradient-to-br from-red-900/30 to-neutral-900 flex items-center justify-center"><Building2 size={44} className="text-red-600"/></div>
                  }
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/95 backdrop-blur-md text-[9px] text-red-800 uppercase tracking-[0.2em] font-black px-2.5 py-1 rounded-full border border-red-200">{venue.category}</span>
                  </div>
                  {venue.rating && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                      <Star size={10} fill="currentColor" className="text-red-400" />
                      <span className="text-[10px] font-black text-white">{Number(venue.rating).toFixed(1)}</span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-display text-xl md:text-2xl italic text-white drop-shadow-md leading-tight">{venue.name}</h3>
                    {venue.partner_name && (
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-200 mt-0.5">Partner · {venue.partner_name}</p>
                    )}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1 bg-white">
                  <p className="text-neutral-600 text-sm leading-relaxed mb-4 line-clamp-2">{venue.tagline}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {venue.minimum_spend && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200">
                        From {formatSpend(venue.minimum_spend)}/person
                      </span>
                    )}
                    {venue.capacity && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200 flex items-center gap-1">
                        <Users size={10} /> {venue.capacity}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 mb-4 text-neutral-500 text-xs">
                    {venue.address && <p className="flex items-center gap-1.5"><MapPin size={11} className="shrink-0 text-red-700/70" /> {venue.address}</p>}
                    {venue.availability && <p className="flex items-center gap-1.5"><Clock size={11} className="shrink-0 text-red-700/70" /> {venue.availability}</p>}
                  </div>
                  <div className="mt-auto">
                    {reservedId === venue.id ? (
                      <div className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-[10px] font-black uppercase tracking-widest">
                        <Check size={14} /> Requested
                      </div>
                    ) : (
                      <button type="button" onClick={() => handleReserve(venue.id)} disabled={reservingId === venue.id}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50">
                        {reservingId === venue.id ? <Loader2 size={14} className="animate-spin" /> : <>Reserve <ArrowRight size={12} /></>}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.section>

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
            onUpgrade={() => { closeMatch(); onSwitchTab('profile'); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   CIRCLES TAB
   ══════════════════════════════════════════════════════════════════════ */
function CirclesTab() {
  const [circles, setCircles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/circles');
      const data = await res.json();
      setCircles(Array.isArray(data.circles) ? data.circles : []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/circles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDesc }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewName(''); setNewDesc(''); setShowCreate(false);
        loadData();
      } else {
        setError(data.error || 'Could not create circle.');
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-7 md:space-y-10">
      <div className="mb-5 md:mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-3">Inner network</p>
        <h1 className="font-display text-4xl md:text-6xl italic mb-2">Crews.</h1>
        <p className="text-neutral-600 text-sm md:text-lg max-w-2xl mb-4">
          Private groups for people you actually want to see again. Meet someone through Match or a table, save them to a Crew, then host invite-only plans.
          <span className="hidden md:inline"> It is group chat × calendar × dinner club — no public list, no random requests.</span>
        </p>
        <div className="hidden md:block">
          <FlowSteps steps={[
            { n: '1', label: 'Meet',        sub: 'via match or table' },
            { n: '2', label: 'Add to Crew', sub: 'inner trust' },
            { n: '3', label: 'Host private',  sub: 'invite-only tables' },
          ]}/>
        </div>
      </div>

      {/* Examples band */}
      <div className="flex md:grid md:grid-cols-3 gap-3 overflow-x-auto md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0 pb-1 scrollbar-hide snap-x">
        {[
          { name: 'Founders Lagos',    note: 'private dinners + intros',     icon: Star },
          { name: 'VI After 9',        note: 'late-night lounge crew',        icon: Wine },
          { name: 'London Diaspora',   note: 'monthly brunches',              icon: Coffee },
        ].map(({ name, note, icon: I }) => (
          <div key={name} className="min-w-[72vw] md:min-w-0 bg-neutral-50 border border-neutral-100 rounded-2xl px-4 py-3 flex items-center gap-3 snap-start">
            <I size={16} className="text-red-700 shrink-0"/>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{name}</p>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold truncate">{note}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <h3 className="text-[10px] md:text-xs font-black text-red-700 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-neutral-100 pb-4">
          Your Crews <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px]">{circles.length}</span>
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-10"><Loader2 size={24} className="text-red-700 animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {circles.map((c: any) => (
              <div key={c.id} className="bg-neutral-50 backdrop-blur-md border border-neutral-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-4 shadow-xl hover:border-red-600 hover:-translate-y-1 transition-all group">
                <div className="w-16 h-16 rounded-full border border-red-400 flex items-center justify-center bg-red-700/5 text-red-700 relative shadow-[0_0_20px_rgba(201,168,76,0.1)] group-hover:scale-105 transition-transform">
                  <Users size={24} />
                </div>
                <div>
                  <h4 className="font-display text-xl leading-tight mb-1">{c.name}</h4>
                  {c.description && <p className="text-[10px] text-neutral-500 mb-2 line-clamp-2">{c.description}</p>}
                  <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold border-t border-neutral-200 pt-2 block w-max mx-auto">
                    {c.member_count || 0} members
                  </span>
                </div>
              </div>
            ))}

            {showCreate ? (
              <div className="border border-red-400 rounded-3xl p-5 flex flex-col gap-3 bg-neutral-50">
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Crew name"
                  className="bg-transparent border-b border-neutral-200 pb-2 text-sm focus:outline-none focus:border-red-700 placeholder:text-neutral-400 text-neutral-900"/>
                <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="What's it about?"
                  className="bg-transparent border-b border-neutral-200 pb-2 text-xs focus:outline-none focus:border-red-700 placeholder:text-neutral-400 text-neutral-900"/>
                {error && <p className="text-red-400 text-[10px]">{error}</p>}
                <div className="flex gap-2 mt-2">
                  <button onClick={handleCreate} disabled={creating} className="flex-1 bg-red-700 text-white text-[9px] font-black uppercase tracking-widest py-2 rounded-full disabled:opacity-50">
                    {creating ? '...' : 'Create'}
                  </button>
                  <button onClick={() => { setShowCreate(false); setError(''); }} className="px-3 py-2 text-neutral-500 hover:text-neutral-900 text-[9px]">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowCreate(true)}
                className="border border-dashed border-neutral-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-3 text-neutral-400 hover:text-neutral-900 hover:border-neutral-400 transition-colors cursor-pointer bg-neutral-100 hover:bg-neutral-100">
                <PlusSquare size={28} className="mb-1" />
                <span className="text-[10px] uppercase tracking-widest font-black">New Crew</span>
              </button>
            )}
          </div>
        )}
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
    setPhase('capturing'); setErrorMsg('');
    await enterFullscreen();
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } });
      streamRef.current = s;
      if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play(); }
    } catch {
      setPhase('error'); setErrorMsg('Camera access denied. Please allow camera access in your browser settings.');
    }
  };

  const closeAll = async () => { stopCamera(); await exitFullscreen(); onClose(); };
  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current, c = canvasRef.current;
    c.width = v.videoWidth || 1280; c.height = v.videoHeight || 720;
    const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.filter = 'brightness(1.15) contrast(1.05)'; ctx.drawImage(v, 0, 0); ctx.filter = 'none';
    stopCamera();
    setPreviewUrl(c.toDataURL('image/jpeg', 0.95));
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
        const res = await fetch('/api/profile/verify-face', { method: 'POST', body: fd });
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
            <p className="text-neutral-500 text-base max-w-xs mx-auto">We&apos;ll match a quick selfie to your profile photo. Powered by Azure Face.</p>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={startCamera} className="w-full max-w-xs bg-red-700 text-white py-4 rounded-full font-black uppercase tracking-[0.2em] text-[11px] hover:bg-red-800 transition-colors shadow-[0_0_30px_rgba(201,168,76,0.25)]">
            Start Camera
          </motion.button>
        </motion.div>
      )}

      {phase === 'capturing' && (
        <div className="flex-1 flex flex-col relative">
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline style={{ transform: 'scaleX(-1)' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: '-5%' }}>
            <div className="border-2 border-red-600 rounded-full" style={{ width: 'min(60vw,260px)', height: 'min(78vw,340px)', boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)' }} />
          </div>
          <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-4">
            <motion.button whileTap={{ scale: 0.92 }} onClick={capture} className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-[0_0_0_4px_rgba(255,255,255,0.4)]">
              <div className="w-16 h-16 rounded-full bg-white border-4 border-neutral-200" />
            </motion.button>
          </div>
        </div>
      )}

      {phase === 'preview' && previewUrl && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <img src={previewUrl} alt="Selfie" className="absolute inset-0 w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 pointer-events-none" />
          </div>
          <canvas ref={canvasRef} className="hidden" />
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
              <img src={previewUrl} alt="" className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
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
function ProfileTab({ initialUser }: { initialUser?: any }) {
  const [user, setUser] = useState<any>(initialUser || null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(initialUser?.name || '');
  const [editBio, setEditBio] = useState(initialUser?.bio || '');
  const [editLocation, setEditLocation] = useState(initialUser?.location || '');
  const [saving, setSaving] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [profileNotice, setProfileNotice] = useState('');
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [subscribing, setSubscribing] = useState<'trial' | 'paid' | null>(null);

  const subscribe = async (plan: 'black' | 'black_trial') => {
    setSubscribing(plan === 'black' ? 'paid' : 'trial');
    setProfileNotice('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser({ ...user, ...data.user, premium_active: true });
        setShowUpgrade(false);
        setProfileNotice(data.message || 'You are now Convivia Black.');
      } else {
        setProfileNotice(data.error || 'Could not start subscription.');
      }
    } catch {
      setProfileNotice('Network error. Try again.');
    }
    setSubscribing(null);
  };

  const cancelSubscription = async () => {
    setSubscribing('paid');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'cancel' }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser({ ...user, ...data.user, premium_active: false });
        setProfileNotice('Subscription cancelled.');
      }
    } catch { /* ignore */ }
    setSubscribing(null);
  };

  useEffect(() => {
    setLoading(true);
    fetch('/api/profile')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Profile unavailable');
        return d;
      })
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setEditName(data.user.name || '');
          setEditBio(data.user.bio || '');
          setEditLocation(data.user.location || '');
          setProfileNotice('');
        }
      })
      .catch(() => setProfileNotice('Preview profile active. Sign in to sync changes across devices.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, bio: editBio, location: editLocation }),
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
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) { setAvatarError(data.error || 'Upload failed.'); setUploadingAvatar(false); return; }
      const updateRes = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: data.url }),
      });
      const updateData = await updateRes.json();
      if (updateRes.ok && updateData.user) setUser(updateData.user);
      else setAvatarError(updateData.error || 'Profile update failed.');
    } catch { setAvatarError('Network error — try again.'); }
    setUploadingAvatar(false);
  };

  const handleSignOut = () => { window.location.href = '/api/auth/signout'; };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="text-red-700 animate-spin" />
      </div>
    );
  }

  if (showUpgrade) {
    const isActive = !!user?.premium_active || user?.tier === 'black';
    return (
      <div className="pt-4 pb-20 space-y-8">
        <button onClick={() => setShowUpgrade(false)} className="text-[10px] uppercase tracking-widest font-black text-neutral-500 hover:text-red-700 flex items-center gap-2">
          ← Back to Profile
        </button>

        <div className="relative rounded-[40px] overflow-hidden border border-red-400 bg-neutral-50 backdrop-blur-3xl shadow-[0_20px_100px_rgba(201,168,76,0.1)]">
          <div className="absolute inset-0 z-0">
            <img src="/conv1.png" className="w-full h-[60%] object-cover opacity-30 mix-blend-lighten" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-100 via-neutral-100/90 to-transparent" />
          </div>

          <div className="relative z-10 p-8 md:p-14 flex flex-col lg:flex-row gap-12 items-center lg:items-start">
            <div className="flex-shrink-0 relative">
              <div className="absolute inset-0 bg-red-100 rounded-xl blur-3xl animate-pulse" />
              <ConviviumCard />
              <p className="text-[9px] uppercase tracking-[0.3em] font-black text-center text-red-600 mt-6 block w-full">Digital Access Key</p>
            </div>
            <div className="flex-1 text-center lg:text-left">
              <SectionLabel variant="dark">Membership</SectionLabel>
              <h2 className="font-display text-4xl sm:text-5xl italic text-neutral-900 mb-3">Convivia Black</h2>
              <p className="text-neutral-600 text-base leading-relaxed mb-8 max-w-lg">
                Free members get <strong className="text-neutral-900">1 AI match per week</strong>. Black is unlimited — plus priority everywhere we operate.
              </p>

              <div className="space-y-3 mb-8 text-left">
                {[
                  { Icon: Sparkles,    title: 'Unlimited AI Matches',     sub: 'Free is 1/week. Black is unlimited.' },
                  { Icon: Zap,         title: 'Instant Venue Booking',    sub: 'No 24-hour wait — auto-confirmed.' },
                  { Icon: Ticket,      title: 'Priority Curated Tables',  sub: 'Skip the host approval queue.' },
                  { Icon: ShieldCheck, title: 'Black Badge',              sub: 'Visible to other members.' },
                  { Icon: Building2,   title: 'Member-only Tables',       sub: 'Monthly Black-only dinners.' },
                ].map(({ Icon, title, sub }) => (
                  <div key={title} className="flex items-start gap-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                    <Icon size={18} className="text-red-700 shrink-0 mt-0.5" />
                    <div><p className="text-sm font-bold">{title}</p><p className="text-[10px] text-neutral-500 mt-0.5 uppercase tracking-wider font-bold">{sub}</p></div>
                  </div>
                ))}
              </div>

              {/* Plan picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <button onClick={() => subscribe('black_trial')} disabled={isActive || subscribing !== null}
                  className="text-left p-5 rounded-2xl border border-neutral-300 hover:border-red-600 transition-colors disabled:opacity-50 bg-neutral-50">
                  <p className="text-[10px] uppercase tracking-widest font-black text-neutral-500 mb-1">Free trial</p>
                  <p className="font-display text-3xl italic text-neutral-900">14 days</p>
                  <p className="text-neutral-600 text-sm mt-1">Then ₦30k/mo · cancel anytime</p>
                  <p className="text-[10px] uppercase tracking-widest text-red-700 font-black mt-3">{subscribing === 'trial' ? 'Starting…' : 'Start trial →'}</p>
                </button>
                <button onClick={() => subscribe('black')} disabled={isActive || subscribing !== null}
                  className="text-left p-5 rounded-2xl border border-red-600 hover:border-red-800 transition-colors disabled:opacity-50 bg-red-50">
                  <p className="text-[10px] uppercase tracking-widest font-black text-red-700 mb-1">Monthly</p>
                  <p className="font-display text-3xl italic text-neutral-900">₦30,000<span className="text-base text-neutral-500">/mo</span></p>
                  <p className="text-neutral-600 text-sm mt-1">Unlimited · all benefits live</p>
                  <p className="text-[10px] uppercase tracking-widest text-red-700 font-black mt-3">{subscribing === 'paid' ? 'Activating…' : 'Subscribe →'}</p>
                </button>
              </div>

              {isActive && (
                <button onClick={cancelSubscription} disabled={subscribing !== null}
                  className="text-[10px] uppercase tracking-widest font-black text-neutral-500 hover:text-red-400 transition-colors mt-2">
                  Cancel subscription
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-6 pb-20">
      <div className="bg-neutral-50 backdrop-blur-xl border border-neutral-200 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 relative z-10">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4 group">
              <div className="absolute inset-0 bg-red-100 rounded-full blur-2xl group-hover:bg-red-700/30 transition-colors" />
              <label className="cursor-pointer block">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-32 h-32 md:w-36 md:h-36 rounded-full border-[3px] border-red-700 relative z-10 object-cover shadow-2xl" />
                ) : (
                  <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-[3px] border-dashed border-red-600 bg-neutral-100 relative z-10 flex items-center justify-center">
                    <Camera size={26} className="text-red-600" />
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center z-20">
                    <Loader2 size={24} className="text-red-700 animate-spin" />
                  </div>
                )}
              </label>
              {user?.verified && (
                <div className="absolute -bottom-2 -right-2 bg-red-700 text-white rounded-full p-1.5 z-20 shadow-lg border-2 border-white">
                  <ShieldCheck size={14} />
                </div>
              )}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 bg-red-700 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mx-auto w-max flex items-center gap-1.5 shadow-lg border border-red-400 whitespace-nowrap">
                <Star size={12} fill="currentColor" /> {user?.rating || '—'} Rating
              </div>
            </div>
            {avatarError && <p className="text-red-400 text-[11px] text-center mt-3 max-w-[140px]">{avatarError}</p>}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left w-full">
            {profileNotice && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-3 py-2 text-[12px] text-red-5005 mb-6">
                {profileNotice}
              </div>
            )}

            {editing ? (
              <div className="space-y-4 mb-8">
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-transparent border-b border-neutral-200 pb-2 text-3xl font-display italic focus:outline-none focus:border-red-700 w-full text-neutral-900" />
                <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3}
                  className="bg-transparent border-b border-neutral-200 pb-2 text-base focus:outline-none focus:border-red-700 w-full resize-none text-neutral-600"
                  placeholder="Tell the table about you…" />
                <input value={editLocation} onChange={(e) => setEditLocation(e.target.value)}
                  className="bg-transparent border-b border-neutral-200 pb-2 text-sm focus:outline-none focus:border-red-700 w-full text-neutral-600" placeholder="City" />
                <div className="flex gap-3">
                  <button onClick={handleSave} disabled={saving} className="bg-red-700 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => setEditing(false)} className="text-neutral-500 hover:text-neutral-900 text-[10px] font-black uppercase tracking-widest">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3 justify-center md:justify-start">
                  <h2 className="font-display text-4xl md:text-5xl italic">{user?.name || 'Convivia Member'}</h2>
                  {user?.verified && <ShieldCheck size={18} className="text-red-700" />}
                  <button onClick={() => setEditing(true)} className="text-neutral-400 hover:text-red-700 transition-colors"><Edit3 size={16} /></button>
                </div>
                <p className="text-neutral-600 text-base max-w-md mx-auto md:mx-0 leading-relaxed mb-2">{user?.bio || 'No bio yet — what brings you to the table?'}</p>
                {user?.location && <p className="text-neutral-400 text-sm mb-8 flex items-center gap-1 justify-center md:justify-start"><MapPin size={12} /> {user.location}</p>}
              </>
            )}

            <div className="grid grid-cols-3 gap-4 md:gap-6 w-full mb-10">
              <Stat val={user?.hangouts_count || 0} label="Hangouts" />
              <Stat val={user?.connections_count || 0} label="Connections" />
              <Stat val={user?.circles_count || 0} label="Circles" />
            </div>

            <div className="space-y-4">
              {/* Verification */}
              {user?.verified ? (
                <div className="flex items-center justify-between p-5 bg-red-50 rounded-[24px] border border-red-400">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={20} className="text-red-700" />
                    <div>
                      <p className="text-base font-bold tracking-wide">Verified</p>
                      <p className="text-[10px] text-red-700 font-black tracking-widest uppercase mt-1">Identity confirmed via Azure Face</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase text-red-700 font-black tracking-widest">Active</span>
                </div>
              ) : (
                <button onClick={() => setVerifyOpen(true)} disabled={!user?.avatar_url}
                  className="w-full flex items-center justify-between p-5 bg-neutral-50 border border-neutral-200 hover:border-red-600 rounded-[24px] transition-colors disabled:opacity-50 group">
                  <div className="flex items-center gap-3 text-left">
                    <ShieldCheck size={20} className="text-neutral-500 group-hover:text-red-700 transition-colors" />
                    <div>
                      <p className="text-base font-bold tracking-wide">Get Verified</p>
                      <p className="text-[10px] text-neutral-400 font-black tracking-widest uppercase mt-1">
                        {user?.avatar_url ? 'Face-match with your photo' : 'Upload a profile photo first'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase text-white bg-red-700 font-black tracking-widest px-4 py-2 rounded-md shadow-[0_0_15px_rgba(185,28,28,0.2)] group-hover:scale-105 transition-transform">Verify</span>
                </button>
              )}

              {/* Tier card */}
              {(() => {
                const active = !!user?.premium_active || user?.tier === 'black';
                const trial = user?.subscription_status === 'black_trial';
                return (
                  <div onClick={() => setShowUpgrade(true)}
                    className="flex items-center justify-between p-6 bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-[24px] border border-red-400 relative overflow-hidden group cursor-pointer">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-700" />
                    <div className="flex flex-col">
                      <span className="text-base font-bold tracking-wide">{active ? 'Convivia Black' : 'Convivia Free'}</span>
                      <span className="text-[10px] text-red-700 font-black tracking-widest uppercase mt-1">
                        {active ? (trial ? 'Trial · Unlimited matches' : 'Active · Unlimited matches')
                                : '1 free match per week'}
                      </span>
                    </div>
                    {active ? (
                      <span className="text-[10px] uppercase text-red-700 font-black tracking-widest">Manage</span>
                    ) : (
                      <span className="text-[10px] uppercase text-white bg-red-700 font-black tracking-widest px-4 py-2 rounded-md shadow-[0_0_15px_rgba(185,28,28,0.25)] group-hover:scale-105 transition-transform">Unlock Black</span>
                    )}
                  </div>
                );
              })()}

              {/* Open to meet toggle */}
              <div className="flex items-center justify-between p-5 bg-neutral-50 border border-neutral-200 rounded-[24px]">
                <div className="flex items-center gap-3">
                  <Users size={20} className={user?.open_to_meet ? 'text-red-700' : 'text-neutral-500'}/>
                  <div>
                    <p className="text-base font-bold tracking-wide">Open to meet</p>
                    <p className="text-[10px] text-neutral-500 font-black tracking-widest uppercase mt-1">{user?.open_to_meet ? 'You can be matched' : 'Hidden from AI Match'}</p>
                  </div>
                </div>
                <button onClick={async () => {
                  const next = !user?.open_to_meet;
                  setUser({ ...user, open_to_meet: next });
                  try {
                    await fetch('/api/profile', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ open_to_meet: next }),
                    });
                  } catch { /* keep optimistic */ }
                }} className={`relative w-12 h-7 rounded-full transition-colors ${user?.open_to_meet ? 'bg-red-700' : 'bg-neutral-200'}`}>
                  <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${user?.open_to_meet ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}/>
                </button>
              </div>

              <button onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 p-4 border border-neutral-200 rounded-2xl text-neutral-500 hover:text-red-400 hover:border-red-400/30 transition-colors text-[10px] uppercase tracking-widest font-black">
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {verifyOpen && (
          <FaceVerificationModal user={user} onVerified={(u) => { setUser(u); setVerifyOpen(false); }} onClose={() => setVerifyOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ val, label }: { val: number; label: string }) {
  return (
    <div className="bg-neutral-50 border border-neutral-100 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden hover:border-red-400 transition-colors">
      <span className="text-3xl md:text-4xl font-display text-red-700 italic mb-2">{val}</span>
      <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-black">{label}</span>
    </div>
  );
}
