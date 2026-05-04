'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useSpring, useInView } from 'framer-motion';
import {
  Sun, User as UserIcon, Zap, Check, X, Loader2,
  Users, ArrowRight, MapPin, Camera, LogOut, Edit3,
  UserCheck, Navigation, WifiOff, ShieldCheck,
  Droplets, Flame, Moon, Heart, Leaf,
  Sparkles, RefreshCw, AlertCircle,
  PlusSquare, TrendingUp, Calendar, Clock, Apple,
  Dumbbell, Salad, TreePine, Music2, Wind, Coffee,
  ChevronRight, Trophy, Play,
} from 'lucide-react';
import { PlacesAutocomplete } from '@/components/PlacesAutocomplete';

/* ═══════════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════════ */
const R = {
  shadow:   'shadow-[0_4px_24px_rgba(232,24,26,0.22)]',
  shadowLg: 'shadow-[0_8px_40px_rgba(232,24,26,0.32)]',
};

/* ═══════════════════════════════════════════════════════════════════
   LOCATION HOOK
   ═══════════════════════════════════════════════════════════════════ */
const SUPPORTED_CITIES = ['Lagos', 'Abuja', 'London'];
function cityFromCoords(lat: number, lng: number) {
  if (lat >= 8.0 && lat <= 10.5 && lng >= 6.5 && lng <= 8.0) return 'Abuja';
  if (lat >= 6.0 && lat <= 7.0 && lng >= 2.8 && lng <= 4.0) return 'Lagos';
  if (lat >= 51.2 && lat <= 51.8 && lng >= -0.6 && lng <= 0.4) return 'London';
  return 'Lagos';
}
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: { 'Accept-Language': 'en', 'User-Agent': 'Convivia24App/1.0' } });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const addr = data.address || {};
    const raw: string = addr.city || addr.town || addr.county || addr.state || '';
    return SUPPORTED_CITIES.find(c => raw.toLowerCase().includes(c.toLowerCase())) || cityFromCoords(lat, lng);
  } catch { return cityFromCoords(lat, lng); }
}
function useCityLocation() {
  const [city, setCity] = useState<string | null>('Lagos');
  const [detecting, setDetecting] = useState(false);
  const [denied, setDenied] = useState(false);
  const detect = useCallback(() => {
    if (!navigator.geolocation) { setDenied(true); return; }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => { setCity(await reverseGeocode(pos.coords.latitude, pos.coords.longitude)); setDetecting(false); },
      () => { setDetecting(false); setDenied(true); },
      { timeout: 8000, enableHighAccuracy: false }
    );
  }, []);
  return { city, detecting, denied, retry: detect };
}

/* ═══════════════════════════════════════════════════════════════════
   DAILY 24 PILLARS
   ═══════════════════════════════════════════════════════════════════ */
const PILLARS = [
  { key: 'move',    label: 'Move',    Icon: Flame,    color: 'text-brand',      bg: 'bg-brand-faint',  border: 'border-brand/25',  desc: 'Any movement' },
  { key: 'nourish', label: 'Nourish', Icon: Apple,    color: 'text-ink',        bg: 'bg-ink/5',        border: 'border-ink/12',    desc: 'Eat with intention' },
  { key: 'hydrate', label: 'Hydrate', Icon: Droplets, color: 'text-brand-dark', bg: 'bg-brand-faint',  border: 'border-brand/20',  desc: 'Water up' },
  { key: 'rest',    label: 'Rest',    Icon: Moon,     color: 'text-ink',        bg: 'bg-ink/5',        border: 'border-ink/12',    desc: 'Sleep & wind down' },
  { key: 'connect', label: 'Connect', Icon: Heart,    color: 'text-brand',      bg: 'bg-brand-faint',  border: 'border-brand/25',  desc: 'With others' },
  { key: 'reflect', label: 'Reflect', Icon: Leaf,     color: 'text-ink',        bg: 'bg-ink/5',        border: 'border-ink/12',    desc: 'Mindful moment' },
] as const;
type PillarKey = typeof PILLARS[number]['key'];

const SQUAD_INTENTIONS = [
  { key: 'morning',    label: 'Morning People',   Icon: Sun,      color: 'text-brand',  bg: 'bg-brand-faint' },
  { key: 'movers',     label: '30-Min Movers',    Icon: Dumbbell, color: 'text-ink',    bg: 'bg-ink/5' },
  { key: 'foodies',    label: 'Mindful Eaters',   Icon: Salad,    color: 'text-brand',  bg: 'bg-brand-faint' },
  { key: 'hydration',  label: 'Hydration Crew',   Icon: Droplets, color: 'text-ink',    bg: 'bg-ink/5' },
  { key: 'calm',       label: 'Calm & Grounded',  Icon: Wind,     color: 'text-brand',  bg: 'bg-brand-faint' },
  { key: 'social',     label: 'Better Together',  Icon: Users,    color: 'text-ink',    bg: 'bg-ink/5' },
  { key: 'outdoors',   label: 'Outdoor Movers',   Icon: TreePine, color: 'text-brand',  bg: 'bg-brand-faint' },
  { key: 'nocaffeine', label: 'Less Caffeine',    Icon: Coffee,   color: 'text-ink',    bg: 'bg-ink/5' },
  { key: 'music',      label: 'Move to Music',    Icon: Music2,   color: 'text-brand',  bg: 'bg-brand-faint' },
];

/* ── Move event seed data — healthy lifestyle, not parties ── */
type MoveEvent = {
  id: string;
  category: string;
  title: string;
  vibe: string;
  location: string;
  time: string;
  date: string;
  spots: number;
  joined: number;
  attendees: string[];
  host: string;
  isLive?: boolean;
};

const MOVE_EVENTS: MoveEvent[] = [
  {
    id: 'm1', category: 'walk', title: 'Sunday Morning Walk',
    vibe: 'Easy 5km along the waterfront. All paces welcome. Bring water.',
    location: 'Oniru Beach, Lagos', time: '7:00 AM', date: 'Sun, Jan 19',
    spots: 12, joined: 7,
    attendees: ['Amara', 'Tunde', 'Kemi', 'David', 'Ngozi', 'Emeka', 'Fatima'],
    host: 'Amara O.',
  },
  {
    id: 'm2', category: 'run', title: '5K Run Crew',
    vibe: 'Accountability run. 5K, any pace. We start together, we finish together.',
    location: 'National Stadium, Lagos', time: '6:30 AM', date: 'Sat, Jan 18',
    spots: 10, joined: 4,
    attendees: ['Chidi', 'Bola', 'Seun', 'Ife'],
    host: 'Chidi N.',
  },
  {
    id: 'm3', category: 'cook', title: 'Healthy Meal Prep Sunday',
    vibe: 'We prep 5 clean meals together. Jollof rice, grilled fish, pepper soup — done right.',
    location: 'Community Kitchen, Yaba', time: '2:00 PM', date: 'Sun, Jan 19',
    spots: 8, joined: 6,
    attendees: ['Adaeze', 'Tobi', 'Precious', 'Emeka', 'Lola', 'Kunle'],
    host: 'Adaeze M.',
  },
  {
    id: 'm4', category: 'workout', title: 'Bodyweight Circuit',
    vibe: 'No gym needed. 45-min bodyweight circuit. Beginner-friendly, no equipment.',
    location: 'Freedom Park, Lagos Island', time: '8:00 AM', date: 'Wed, Jan 22',
    spots: 15, joined: 9,
    attendees: ['Femi', 'Sade', 'Uche', 'Yemi', 'Tola', 'Remi', 'Ada', 'Nkem', 'Gbenga'],
    host: 'Femi A.',
  },
  {
    id: 'm5', category: 'stretch', title: 'Morning Stretch & Breathe',
    vibe: 'Gentle stretch and breathing practice. 30 minutes. Perfect before work.',
    location: 'Muri Okunola Park, Victoria Island', time: '6:45 AM', date: 'Mon, Jan 20',
    spots: 10, joined: 3,
    attendees: ['Chioma', 'Bisi', 'Jide'],
    host: 'Chioma E.',
  },
  {
    id: 'm6', category: 'mindful', title: 'Group Meditation Walk',
    vibe: 'Silent walking meditation followed by a 10-min group check-in. Come as you are.',
    location: 'Lekki Conservation Centre', time: '7:30 AM', date: 'Sat, Jan 18',
    spots: 8, joined: 5,
    attendees: ['Ngozi', 'Segun', 'Amaka', 'Dele', 'Cynthia'],
    host: 'Ngozi O.',
  },
];

const MOVE_CATEGORIES = [
  { key: 'all',     label: 'All',         Icon: Flame,    color: 'text-ink/50',  bg: 'bg-ink/5' },
  { key: 'walk',    label: 'Group Walk',  Icon: TreePine, color: 'text-brand',   bg: 'bg-brand-faint' },
  { key: 'run',     label: 'Run Crew',    Icon: Zap,      color: 'text-ink',     bg: 'bg-ink/5' },
  { key: 'cook',    label: 'Cook-Along',  Icon: Salad,    color: 'text-brand',   bg: 'bg-brand-faint' },
  { key: 'workout', label: 'Workout',     Icon: Dumbbell, color: 'text-ink',     bg: 'bg-ink/5' },
  { key: 'stretch', label: 'Stretch',     Icon: Wind,     color: 'text-brand',   bg: 'bg-brand-faint' },
  { key: 'mindful', label: 'Mindfulness', Icon: Leaf,     color: 'text-ink',     bg: 'bg-ink/5' },
] as const;

function formatEventDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: 'Soon', time: 'TBC' };
  return {
    date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  };
}

function hangoutToMoveEvent(h: any): MoveEvent {
  const when = formatEventDate(h.event_time);
  const attendees = Array.isArray(h.attendees)
    ? h.attendees.map((a: any) => a.name).filter(Boolean)
    : [];

  return {
    id: String(h.id),
    category: h.category || 'walk',
    title: h.title || 'Group Activity',
    vibe: h.vibe || 'A healthy activity with the community.',
    location: h.location || h.venue_name || h.city || 'Location TBC',
    time: h.formatted_time || when.time,
    date: h.formatted_date || when.date,
    spots: Number(h.max_guests || 8),
    joined: Number(h.current_guests || attendees.length || 1),
    attendees,
    host: h.host_name || 'Convivia member',
    isLive: true,
  };
}

const PREVIEW_USER = {
  id: 'preview-user',
  name: 'Convivia Member',
  email: 'preview@convivia24.com',
  tier: 'standard',
  location: 'Lagos',
  bio: 'Building a healthier 24 with community.',
  open_to_meet: true,
  verified: false,
  hangouts_count: 0,
  circles_count: 0,
  connections_count: 0,
};

/* ── Motion variants ── */
const page   = { initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0, transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] } }, exit: { opacity: 0, y: -14, transition: { duration: 0.2 } } };
const list   = { animate: { transition: { staggerChildren: 0.055 } } };
const item   = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } };

/* ── Animated number counter ── */
function CountUp({ to, duration = 1.2 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const spring = useSpring(0, { stiffness: 60, damping: 20 });
  const [display, setDisplay] = useState(0);

  useEffect(() => { if (inView) spring.set(to); }, [inView, to, spring]);
  useEffect(() => spring.on('change', v => setDisplay(Math.round(v))), [spring]);

  return <span ref={ref}>{display}</span>;
}

/* ═══════════════════════════════════════════════════════════════════
   SPLASH SCREEN
   ═══════════════════════════════════════════════════════════════════ */
function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 1900); return () => clearTimeout(t); }, [onDone]);
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.5, ease: [0.4, 0, 1, 1] } }}
      className="fixed inset-0 z-[300] bg-white flex flex-col items-center justify-center overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 0.12, scale: 1.6 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="absolute w-80 h-80 rounded-full bg-brand blur-[100px] pointer-events-none"
      />
      <motion.img
        src="/convivia24.png" alt="Convivia24" className="relative z-10 h-14 w-auto"
        initial={{ opacity: 0, scale: 0.7, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.p
        className="relative z-10 mt-4 text-[10px] font-bold uppercase tracking-[0.4em] text-ink/25"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Healthy living is better together
      </motion.p>
      <motion.div
        className="absolute bottom-14 h-[2px] bg-brand rounded-full"
        initial={{ width: 0, opacity: 0 }} animate={{ width: 72, opacity: 1 }}
        transition={{ delay: 0.35, duration: 1.2, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   APP SHELL
   ═══════════════════════════════════════════════════════════════════ */
export function AppConceptBoard({ initialUser }: { initialUser?: any }) {
  const [splashDone, setSplashDone] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'squads' | 'checkin' | 'move' | 'profile'>('today');
  const location = useCityLocation();

  const renderContent = () => {
    switch (activeTab) {
      case 'today':   return <Today24Tab   location={location} onCheckIn={() => setActiveTab('checkin')} onSquads={() => setActiveTab('squads')} onMove={() => setActiveTab('move')} />;
      case 'squads':  return <SquadsTab    location={location} />;
      case 'checkin': return <CheckInTab   onDone={() => setActiveTab('today')} />;
      case 'move':    return <MoveTab      location={location} />;
      case 'profile': return <ProfileTab   gpsCity={location.city} initialUser={initialUser} />;
    }
  };

  return (
    <>
      <AnimatePresence>{!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}</AnimatePresence>

      <div className="flex flex-col h-full w-full bg-white text-ink">

        {/* TOP BAR */}
        <header className="flex items-center justify-between px-5 md:px-10 py-3 border-b border-ink/[0.07] bg-white/95 backdrop-blur-xl sticky top-0 z-50 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
          <a href="/" className="flex items-center gap-3 shrink-0 group" aria-label="Convivia24">
            <img src="/convivia24.png" alt="Convivia24" className="h-7 w-auto transition-opacity group-hover:opacity-70" />
            <span className="hidden sm:block text-[8px] font-bold uppercase tracking-[0.32em] text-ink/22">
              Healthy living · Better together
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-7">
            {(['today','squads','move','profile'] as const).map(tab => {
              const labels: Record<string,string> = { today:'Your 24', squads:'Squads', move:'Move', profile:'Profile' };
              return (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`relative text-[11px] font-semibold uppercase tracking-[0.16em] pb-1 transition-colors ${activeTab===tab ? 'text-brand' : 'text-ink/35 hover:text-ink/65'}`}
                >
                  {labels[tab]}
                  {activeTab===tab && <motion.span layoutId="nav-line" className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand rounded-full" transition={{ type:'spring', stiffness:400, damping:32 }} />}
                </button>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <a href="/inquire" className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35 hover:text-brand transition-colors">Inquire</a>
            <LocationPill location={location} />
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto pb-24 md:pb-8 scrollbar-hide bg-surface-50">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} variants={page} initial="initial" animate="animate" exit="exit" className="max-w-6xl mx-auto">
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* BOTTOM NAV */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/97 backdrop-blur-xl border-t border-ink/[0.07] z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div className="flex items-end justify-around px-1 pt-2 pb-2">
            <NavIcon label="Your 24" icon={<Sun size={20} />}      active={activeTab==='today'}   onClick={() => setActiveTab('today')} />
            <NavIcon label="Squads"  icon={<Users size={20} />}    active={activeTab==='squads'}  onClick={() => setActiveTab('squads')} />
            <div className="flex flex-col items-center -mt-5">
              <motion.button whileTap={{ scale: 0.88 }} onClick={() => setActiveTab('checkin')}
                className={`w-14 h-14 rounded-full bg-brand flex items-center justify-center text-white ${R.shadow} ${activeTab==='checkin' ? 'ring-4 ring-brand/20' : ''}`}
                animate={{ boxShadow: activeTab!=='checkin' ? ['0 4px 24px rgba(232,24,26,0.22)', '0 4px 24px rgba(232,24,26,0.45)', '0 4px 24px rgba(232,24,26,0.22)'] : '0 4px 24px rgba(232,24,26,0.22)' }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Zap size={22} strokeWidth={2.5} />
              </motion.button>
              <span className={`text-[8px] font-bold uppercase tracking-widest mt-1.5 ${activeTab==='checkin' ? 'text-brand' : 'text-ink/28'}`}>Check In</span>
            </div>
            <NavIcon label="Move"    icon={<Flame size={20} />}    active={activeTab==='move'}    onClick={() => setActiveTab('move')} />
            <NavIcon label="Profile" icon={<UserIcon size={20} />} active={activeTab==='profile'} onClick={() => setActiveTab('profile')} />
          </div>
        </nav>
      </div>
    </>
  );
}

/* ── Shared nav atoms ── */
function NavIcon({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button onClick={onClick} whileTap={{ scale: 0.86 }} className="flex flex-col items-center gap-0.5 min-w-[44px] py-1">
      <motion.span animate={{ color: active ? '#E8181A' : 'rgba(15,15,15,0.28)' }} transition={{ duration: 0.15 }}>{icon}</motion.span>
      <span className={`text-[8px] font-semibold uppercase tracking-widest transition-colors ${active ? 'text-brand' : 'text-ink/24'}`}>{label}</span>
    </motion.button>
  );
}
function LocationPill({ location }: { location: ReturnType<typeof useCityLocation> }) {
  const { city, detecting, denied, retry } = location;
  if (detecting) return <span className="flex items-center gap-1.5 text-[9px] text-ink/28 font-semibold uppercase tracking-widest shrink-0"><Loader2 size={10} className="animate-spin" />Locating</span>;
  if (denied || !city) return <button onClick={retry} className="flex items-center gap-1 text-[9px] text-ink/22 hover:text-ink/50 font-semibold uppercase tracking-widest transition-colors shrink-0"><WifiOff size={10} />Location off</button>;
  return <span className="flex items-center gap-1.5 text-[9px] text-brand font-bold uppercase tracking-widest shrink-0 bg-brand-faint px-2.5 py-1 rounded-full"><Navigation size={9} />{city}</span>;
}
function VerifiedBadge({ size = 12 }: { size?: number }) { return <ShieldCheck size={size} className="text-brand shrink-0" />; }
function BlankAvatar({ size, name }: { size: number; name?: string }) {
  const i = (name || '?')[0].toUpperCase();
  return <div style={{ width: size, height: size }} className="rounded-full bg-surface-200 border border-ink/[0.07] flex items-center justify-center shrink-0 text-ink/40 font-bold select-none"><span style={{ fontSize: size * 0.38 }}>{i}</span></div>;
}

/* ═══════════════════════════════════════════════════════════════════
   TODAY'S 24
   Content: hero → pillars (tap to check in) → streak widget → journey → VS table → CTA
   No squad feed here — that lives in Squads tab
   ═══════════════════════════════════════════════════════════════════ */
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const JOURNEY_STEPS = [
  { num:'01', Icon: Sparkles, title:'Set your intention', sub:'Day 1 · 3 minutes', body:"Three questions. What do you want to change? How do you eat right now? Who is one person who should know about this goal? That last question starts the social loop immediately." },
  { num:'02', Icon: Users,    title:'Get placed in a squad', sub:'Day 1–3 · matched for you', body:"5–7 people. Similar goal, similar starting point. Your squad for 90 days. They see your check-ins. You see theirs. Nobody wants to be the one who quit." },
  { num:'03', Icon: Zap,      title:'Daily micro-habits', sub:'Daily · low friction', body:"2–3 small habits. Drink 2 litres. Walk 20 minutes. Swap one thing on your plate. Not a 1200-cal plan. Small, repeatable, visible to your squad." },
  { num:'04', Icon: Calendar, title:'Weekly group rituals', sub:'Weekly · IRL + digital', body:"A voice note check-in. A group walk. A shared meal challenge. The ritual is the retention mechanism — not an optional feature." },
  { num:'05', Icon: Trophy,   title:'Celebrate loudly', sub:'30 · 60 · 90 days', body:"Not a badge nobody sees. A shareable video of your journey. A dinner at a partner restaurant. A squad reunion event. The brand name earns its meaning here." },
];

const VS = [
  { old:'Log your food alone',            now:'Your squad sees your streak — live' },
  { old:'Generic AI coach nobody trusts', now:'Peer coaches from your community' },
  { old:'Motivation dies after week 2',   now:'Social pressure + celebration = sticky' },
  { old:'Zero cultural context',          now:'Built for African & diaspora bodies & diets' },
  { old:'One-size-fits-all plans',        now:'Squad sets goals together' },
];

const STATS = [{ val:4200, label:'Active members' }, { val:91, label:'% still going at day 30' }, { val:24, label:'Squads formed this week' }];

function Today24Tab({ location, onCheckIn, onSquads, onMove }: { location: ReturnType<typeof useCityLocation>; onCheckIn: () => void; onSquads: () => void; onMove: () => void }) {
  const { city, detecting } = location;
  const today = DAY_NAMES[new Date().getDay()];

  return (
    <div className="pb-8">

      {/* HERO */}
      <section className="relative bg-ink text-white px-5 md:px-10 pt-14 pb-18 md:pt-20 md:pb-24 overflow-hidden">
        <motion.div initial={{ opacity:0, scale:0.5 }} animate={{ opacity:0.18, scale:1.5 }} transition={{ duration:1.4, ease:'easeOut' }} className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full bg-brand blur-[120px] pointer-events-none" />
        <motion.div initial={{ opacity:0 }} animate={{ opacity:0.08 }} transition={{ delay:0.3, duration:1 }} className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-brand blur-[80px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity:0, scale:0.85, y:8 }} animate={{ opacity:1, scale:1, y:0 }} transition={{ delay:0.05, duration:0.5, ease:[0.22,1,0.36,1] }}
            className="inline-flex items-center gap-2 bg-brand/15 border border-brand/35 text-brand text-[10px] font-bold uppercase tracking-[0.28em] px-4 py-2 rounded-full mb-8"
          >
            <motion.span className="w-2 h-2 rounded-full bg-brand" animate={{ opacity:[1,0.3,1] }} transition={{ duration:1.8, repeat:Infinity }} />
            {city && !detecting ? `${today} · ${city}` : today}
          </motion.div>

          <motion.h1
            className="font-display text-5xl sm:text-6xl md:text-7xl italic leading-[1.05] mb-5 text-white"
            initial={{ opacity:0, y:32 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55, ease:[0.22,1,0.36,1] }}
          >
            Your 24<br />starts now.
          </motion.h1>

          <motion.p
            className="text-white/55 text-lg max-w-sm mx-auto leading-relaxed mb-10"
            initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.18, duration:0.45 }}
          >
            Every day is a fresh 24. Show up across 6 pillars — with your squad watching.
          </motion.p>

          <motion.button
            whileTap={{ scale:0.95 }} whileHover={{ scale:1.04, y:-2 }} onClick={onCheckIn}
            initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.28, duration:0.4 }}
            className={`inline-flex items-center gap-3 bg-brand text-white px-10 py-4 rounded-full font-bold uppercase tracking-[0.14em] text-[13px] ${R.shadowLg} hover:bg-brand-dark transition-colors`}
          >
            <Zap size={17} strokeWidth={2.5} /> Check In Now
          </motion.button>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-brand px-5 md:px-10 py-7">
        <div className="max-w-3xl mx-auto grid grid-cols-3 divide-x divide-white/20">
          {STATS.map(({ val, label }) => (
            <div key={label} className="flex flex-col items-center gap-0.5 px-4">
              <span className="font-display text-3xl italic text-white font-bold">
                <CountUp to={val} />
                {label.includes('%') ? '%' : '+'}
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-white/55">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 6 PILLARS */}
      <section className="bg-white px-5 md:px-10 py-14">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once:true }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-ink/30 mb-2 flex items-center gap-2"><Sparkles size={10} className="text-brand" />Your Daily 24</p>
            <h2 className="font-display text-3xl sm:text-4xl italic text-ink mb-8">Six pillars. One day.</h2>
          </motion.div>
          <motion.div className="grid grid-cols-3 sm:grid-cols-6 gap-3" variants={list} initial="initial" whileInView="animate" viewport={{ once:true, margin:'-40px' }}>
            {PILLARS.map(({ key, label, Icon, color, bg, border, desc }) => (
              <motion.button key={key} variants={item} whileTap={{ scale:0.9 }} whileHover={{ y:-4, transition:{ type:'spring', stiffness:400, damping:20 } }} onClick={onCheckIn}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 ${bg} ${border} group transition-shadow hover:shadow-md`}
              >
                <motion.div whileHover={{ rotate:[0,-8,8,0], transition:{ duration:0.4 } }}><Icon size={22} className={color} /></motion.div>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-ink/55">{label}</span>
                <span className="text-[9px] text-ink/28 text-center leading-tight hidden sm:block">{desc}</span>
              </motion.button>
            ))}
          </motion.div>
          <motion.p variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once:true }} className="text-center text-[11px] text-ink/25 mt-5">Tap any pillar to log it. Even 1 out of 6 is a win.</motion.p>
        </div>
      </section>

      {/* QUICK LINKS to other tabs */}
      <section className="bg-surface-100 px-5 md:px-10 py-10 border-y border-ink/[0.05]">
        <div className="max-w-3xl mx-auto grid grid-cols-2 gap-3">
          <motion.button variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once:true }} whileTap={{ scale:0.97 }} onClick={onSquads}
            className="flex items-center gap-4 bg-white border border-ink/[0.07] rounded-2xl p-5 hover:border-brand/30 hover:-translate-y-0.5 hover:shadow-md transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-brand-faint flex items-center justify-center shrink-0"><Users size={20} className="text-brand" /></div>
            <div className="text-left"><p className="font-semibold text-ink text-sm">Your Squads</p><p className="text-[10px] text-ink/38">See who checked in today</p></div>
            <ChevronRight size={15} className="text-ink/20 group-hover:text-brand ml-auto transition-colors" />
          </motion.button>
          <motion.button variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once:true }} transition={{ delay:0.06 }} whileTap={{ scale:0.97 }} onClick={onMove}
            className="flex items-center gap-4 bg-white border border-ink/[0.07] rounded-2xl p-5 hover:border-brand/30 hover:-translate-y-0.5 hover:shadow-md transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-ink/5 flex items-center justify-center shrink-0"><Flame size={20} className="text-ink" /></div>
            <div className="text-left"><p className="font-semibold text-ink text-sm">Move Together</p><p className="text-[10px] text-ink/38">Group events near you</p></div>
            <ChevronRight size={15} className="text-ink/20 group-hover:text-brand ml-auto transition-colors" />
          </motion.button>
        </div>
      </section>

      {/* USER JOURNEY */}
      <section className="bg-white px-5 md:px-10 py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once:true }} className="mb-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand mb-2 flex items-center gap-2"><TrendingUp size={10} />How it works</p>
            <h2 className="font-display text-4xl sm:text-5xl italic text-ink">The journey.</h2>
          </motion.div>
          <div className="space-y-0">
            {JOURNEY_STEPS.map((step, i) => {
              const StepIcon = step.Icon;
              return (
                <motion.div key={step.num}
                  initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true, margin:'-50px' }}
                  transition={{ duration:0.42, delay:i*0.07, ease:[0.22,1,0.36,1] }}
                  className="flex gap-5 pb-10 relative"
                >
                  {i < JOURNEY_STEPS.length-1 && <div className="absolute left-5 top-10 bottom-0 w-px bg-ink/8" />}
                  <motion.div whileInView={{ scale:[0.6,1.15,1] }} viewport={{ once:true }} transition={{ delay:i*0.07+0.1, duration:0.5, ease:[0.22,1,0.36,1] }}
                    className={`shrink-0 w-10 h-10 rounded-full bg-brand flex items-center justify-center ${R.shadow} z-10`}
                  >
                    <StepIcon size={16} className="text-white" />
                  </motion.div>
                  <div className="pt-1.5 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[9px] font-bold text-brand/55 tracking-[0.4em]">{step.num}</span>
                      <span className="text-[10px] font-medium text-ink/28 uppercase tracking-widest">{step.sub}</span>
                    </div>
                    <h3 className="font-display text-2xl italic text-ink mb-2">{step.title}</h3>
                    <p className="text-ink/50 text-sm leading-relaxed">{step.body}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* VS TABLE */}
      <section className="bg-surface-50 px-5 md:px-10 py-14 border-t border-ink/[0.06]">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once:true }} className="mb-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand mb-2">Why Convivia24</p>
            <h2 className="font-display text-4xl sm:text-5xl italic text-ink">Different by design.</h2>
          </motion.div>
          <div className="rounded-2xl overflow-hidden border border-ink/[0.08] shadow-sm">
            <div className="grid grid-cols-2">
              <div className="bg-surface-100 px-5 py-3 border-b border-ink/[0.06]"><p className="text-[9px] font-bold uppercase tracking-widest text-ink/35">The old way</p></div>
              <div className="bg-brand px-5 py-3 border-b border-brand-dark"><p className="text-[9px] font-bold uppercase tracking-widest text-white/65">Convivia24</p></div>
              {VS.map((r, i) => (
                <motion.div key={i} className="contents"
                  initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay:i*0.06 }}
                >
                  <div className={`px-5 py-4 flex items-center gap-3 bg-white ${i<VS.length-1?'border-b border-ink/[0.05]':''}`}>
                    <X size={12} className="text-ink/18 shrink-0" />
                    <p className="text-sm text-ink/38 line-through">{r.old}</p>
                  </div>
                  <div className={`px-5 py-4 flex items-center gap-3 bg-brand/[0.04] ${i<VS.length-1?'border-b border-ink/[0.05]':''}`}>
                    <Check size={12} className="text-brand shrink-0" />
                    <p className="text-sm font-medium text-ink">{r.now}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SQUAD INTENTIONS */}
      <section className="bg-white px-5 md:px-10 py-12 border-t border-ink/[0.06]">
        <div className="max-w-3xl mx-auto">
          <motion.p variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once:true }} className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink/30 mb-6 flex items-center gap-2"><Heart size={10} className="text-brand" />Find your squad intention</motion.p>
          <div className="flex flex-wrap gap-2">
            {SQUAD_INTENTIONS.map(({ label, Icon, color, bg }, i) => (
              <motion.button key={label} initial={{ opacity:0, y:8 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.04 }}
                whileTap={{ scale:0.92 }} whileHover={{ y:-3, transition:{ type:'spring', stiffness:400, damping:18 } }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[12px] font-medium border border-transparent shadow-sm ${bg} ${color}`}
              >
                <Icon size={13} />{label}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-ink px-5 md:px-10 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once:true }} className="text-white/35 text-base mb-2">AA has a 30% success rate. Solo willpower has 5%.</motion.p>
          <motion.p variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once:true }} transition={{ delay:0.08 }} className="font-display text-4xl sm:text-5xl italic text-white mb-10">The difference is community.</motion.p>
          <motion.button variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once:true }} transition={{ delay:0.16 }}
            whileTap={{ scale:0.95 }} whileHover={{ scale:1.04 }} onClick={onCheckIn}
            className={`inline-flex items-center gap-2.5 bg-brand text-white px-10 py-4 rounded-full font-bold uppercase tracking-[0.14em] text-[13px] ${R.shadowLg} hover:bg-brand-dark transition-colors`}
          >
            Start your 24 <ArrowRight size={15} />
          </motion.button>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CHECK IN
   ═══════════════════════════════════════════════════════════════════ */
const FEEL_OPTIONS = [
  { key:'great', label:'Great',     emoji:'🌟' },
  { key:'good',  label:'Good',      emoji:'😊' },
  { key:'okay',  label:'Okay',      emoji:'😐' },
  { key:'tough', label:'Tough day', emoji:'😤' },
];

function CheckInTab({ onDone }: { onDone: () => void }) {
  const [tapped, setTapped] = useState<Set<PillarKey>>(new Set());
  const [feel, setFeel] = useState<string|null>(null);
  const [reflection, setReflection] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [savedOffline, setSavedOffline] = useState(false);
  const [error, setError] = useState('');

  const toggle = (key: PillarKey) => setTapped(prev => { const n=new Set(prev); n.has(key)?n.delete(key):n.add(key); return n; });
  const score = tapped.size;

  const submit = async () => {
    if (!score) return;
    setSubmitting(true);
    setError('');
    setSavedOffline(false);
    const payload = {
      pillars: Array.from(tapped),
      feel,
      reflection: reflection.trim() || undefined,
      created_at: new Date().toISOString(),
    };
    try {
      const res = await fetch('/api/checkins', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Check-in could not be saved online.');
    } catch {
      const offline = JSON.parse(window.localStorage.getItem('convivia24:checkins') || '[]');
      window.localStorage.setItem('convivia24:checkins', JSON.stringify([payload, ...offline].slice(0, 30)));
      setSavedOffline(true);
    }
    setSubmitting(false);
    setSuccess(true);
  };

  if (success) return (
    <motion.div initial={{ opacity:0, scale:0.92 }} animate={{ opacity:1, scale:1 }} className="max-w-lg mx-auto text-center py-24 px-5">
      <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:280, damping:18, delay:0.05 }}
        className={`w-20 h-20 rounded-full bg-brand-faint border-2 border-brand/25 flex items-center justify-center mx-auto mb-6 ${R.shadow}`}
      >
        <Check size={32} className="text-brand" />
      </motion.div>
      <motion.h2 initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className="font-display text-4xl italic mb-2 text-ink">
        {score}/6 pillars. {score>=5?'Outstanding.':score>=3?'Solid 24.':'You showed up.'}
      </motion.h2>
      <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.32 }} className="text-ink/40 mb-2">
        {savedOffline ? 'Saved on this device. Connect the database to sync it with your squad.' : 'Your squad can see you checked in.'}
      </motion.p>
      <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }} className="text-[11px] font-bold uppercase tracking-widest text-brand/55 mb-10">That's what accountability looks like.</motion.p>
      <button onClick={onDone} className="text-brand text-[11px] uppercase tracking-widest font-bold hover:text-brand-dark transition-colors">Back to Your 24 →</button>
    </motion.div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="bg-ink text-white px-5 md:px-10 pt-10 pb-10 mb-0 relative overflow-hidden">
        <motion.div initial={{ opacity:0, scale:0.5 }} animate={{ opacity:0.12, scale:1.4 }} transition={{ duration:0.8 }} className="absolute top-0 right-0 w-48 h-48 rounded-full bg-brand blur-[70px] pointer-events-none" />
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand mb-2 flex items-center gap-1.5"><Zap size={10} />Daily Check-In</p>
          <h1 className="font-display text-4xl sm:text-5xl italic mb-2 text-white">Your 24</h1>
          <p className="text-white/40 text-sm">Tap every pillar you showed up for today. 60 seconds.</p>
        </div>
      </div>

      {/* Score bar */}
      <div className="bg-white border-b border-ink/[0.06] px-5 md:px-10 py-4 flex items-center gap-4">
        <div className="flex-1 h-1.5 bg-ink/8 rounded-full overflow-hidden">
          <motion.div className="h-full bg-brand rounded-full" animate={{ width:`${(score/6)*100}%` }} transition={{ type:'spring', stiffness:180, damping:22 }} />
        </div>
        <motion.span key={score} initial={{ scale:1.4, color:'#E8181A' }} animate={{ scale:1, color:'#0f0f0f' }} transition={{ duration:0.28 }} className="font-display text-2xl italic text-ink/70 shrink-0 w-12 text-right">
          {score}<span className="text-ink/20 text-base">/6</span>
        </motion.span>
      </div>

      <div className="px-5 md:px-10 pt-6 space-y-7">
        <motion.div className="grid grid-cols-2 sm:grid-cols-3 gap-3" variants={list} initial="initial" animate="animate">
          {PILLARS.map(({ key, label, Icon, color, bg, border, desc }) => {
            const active = tapped.has(key);
            return (
              <motion.button key={key} variants={item} whileTap={{ scale:0.92 }} onClick={() => toggle(key)}
                className={`relative flex flex-col items-center gap-2.5 p-5 rounded-2xl border-2 transition-all ${active ? `${bg} ${border} ${R.shadow}` : 'border-ink/[0.08] bg-white hover:border-ink/15'}`}
              >
                {active && (
                  <motion.div initial={{ scale:0, rotate:-20 }} animate={{ scale:1, rotate:0 }} transition={{ type:'spring', stiffness:380, damping:18 }}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand flex items-center justify-center"
                  >
                    <Check size={11} className="text-white" strokeWidth={3} />
                  </motion.div>
                )}
                <motion.div animate={{ scale:active?1.18:1, rotate:active?[0,-10,8,0]:0 }} transition={{ type:'spring', stiffness:320, damping:18 }}>
                  <Icon size={28} className={active ? color : 'text-ink/18'} />
                </motion.div>
                <div className="text-center">
                  <p className={`text-[12px] font-semibold uppercase tracking-widest ${active?'text-ink/80':'text-ink/30'}`}>{label}</p>
                  <p className="text-[10px] text-ink/22 mt-0.5">{desc}</p>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ink/35 mb-3">How did today feel?</p>
          <div className="grid grid-cols-4 gap-2">
            {FEEL_OPTIONS.map(({ key, label, emoji }) => (
              <motion.button key={key} whileTap={{ scale:0.9 }} onClick={() => setFeel(p => p===key?null:key)}
                className={`flex flex-col items-center gap-1.5 py-3.5 rounded-xl border-2 transition-all ${feel===key?'border-brand/35 bg-brand-faint':'border-ink/[0.07] bg-white hover:border-ink/15'}`}
              >
                <motion.span animate={{ scale:feel===key?1.22:1 }} transition={{ type:'spring', stiffness:320 }} className="text-xl">{emoji}</motion.span>
                <span className={`text-[10px] font-medium uppercase tracking-widest ${feel===key?'text-brand':'text-ink/30'}`}>{label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ink/35 mb-2">One line — how was your day? <span className="text-ink/18 normal-case font-normal">(optional)</span></p>
          <input type="text" value={reflection} onChange={e=>setReflection(e.target.value)} maxLength={120}
            placeholder="e.g. Took the stairs all day instead of the lift."
            className="w-full bg-transparent border-b-2 border-ink/10 pb-3 text-base focus:outline-none focus:border-brand placeholder:text-ink/15 transition-colors"
          />
        </div>

        <motion.button whileTap={{ scale:0.97 }} onClick={submit} disabled={!score||submitting}
          className={`w-full bg-brand text-white py-4 rounded-full font-bold uppercase tracking-[0.16em] text-[13px] hover:bg-brand-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-35 ${R.shadow}`}
        >
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <><Zap size={16} />Log My 24</>}
        </motion.button>

        {!score && <p className="text-center text-[11px] text-ink/22 -mt-4">Tap at least one pillar to check in</p>}
        {error && <p className="text-center text-[11px] text-red-500 -mt-4">{error}</p>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SQUADS
   Content: my squads feed (who checked in today) + create squad
   Discovery of intentions lives in Today tab — not duplicated here
   ═══════════════════════════════════════════════════════════════════ */
function SquadActivityRow({ name, pillar, note, time }: { name:string; pillar:PillarKey; note:string; time:string }) {
  const p = PILLARS.find(x => x.key===pillar)!;
  const PIcon = p.Icon;
  return (
    <motion.div variants={item} className="flex items-center gap-3 py-3 border-b border-ink/[0.05] last:border-0">
      <BlankAvatar size={36} name={name} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-ink leading-tight">{name}</p>
        <p className="text-[12px] text-ink/40 truncate">{note}</p>
      </div>
      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${p.bg} border ${p.border} shrink-0`}>
        <PIcon size={10} className={p.color} />
        <span className={`text-[9px] font-bold uppercase tracking-widest ${p.color}`}>{p.label}</span>
      </div>
      <span className="text-ink/20 text-[10px] font-medium shrink-0">{time}</span>
    </motion.div>
  );
}

function SquadCard({ squad }: { squad: any }) {
  const intention = SQUAD_INTENTIONS.find(i => i.key===squad.intention) || SQUAD_INTENTIONS[0];
  const IIcon = intention.Icon;
  const SAMPLE_ACTIVITY = [
    { name:'Amara O.',  pillar:'move' as PillarKey,    note:'Morning run done ✓',         time:'7:12am' },
    { name:'Tunde B.',  pillar:'nourish' as PillarKey, note:'Meal prepped for the week',  time:'8:30am' },
    { name:'Kemi A.',   pillar:'hydrate' as PillarKey, note:'2L before noon 💧',          time:'11:05am' },
  ];

  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div variants={item}
      className="bg-white border border-ink/[0.07] rounded-2xl overflow-hidden hover:border-brand/25 transition-all shadow-sm"
    >
      {/* Card header */}
      <button className="w-full flex items-center gap-4 p-5" onClick={() => setExpanded(v => !v)}>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${intention.bg} shrink-0`}><IIcon size={18} className={intention.color} /></div>
        <div className="flex-1 text-left min-w-0">
          <p className="font-display text-xl italic text-ink truncate">{squad.name || 'My Squad'}</p>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${intention.color}`}>{intention.label}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="font-display text-2xl italic text-brand leading-none">{squad.streak||0}</p>
            <p className="text-[9px] font-medium text-ink/28 uppercase tracking-widest">streak</p>
          </div>
          <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ type:'spring', stiffness:300, damping:22 }}>
            <ChevronRight size={16} className="text-ink/22" />
          </motion.div>
        </div>
      </button>

      {/* Pillar mini-row */}
      <div className="px-5 pb-4 flex items-center justify-between">
        <div className="flex gap-1">
          {PILLARS.map(p => {
            const hit = squad.today_pillars?.includes(p.key);
            const PIcon = p.Icon;
            return (
              <motion.div key={p.key} animate={{ scale: hit?[1,1.25,1]:1 }} transition={{ duration:0.35 }}
                className={`w-6 h-6 rounded-md flex items-center justify-center ${hit?p.bg:'bg-ink/[0.04]'}`}
              >
                <PIcon size={11} className={hit?p.color:'text-ink/14'} />
              </motion.div>
            );
          })}
        </div>
        <div className="flex -space-x-2">
          {(squad.members||[]).slice(0,5).map((m:any,i:number) =>
            m.avatar_url ? <img key={i} src={m.avatar_url} className="w-6 h-6 rounded-full border-2 border-white object-cover" alt="" /> : <BlankAvatar key={i} size={24} name={m.name} />
          )}
          {(squad.member_count||4) > 5 && <div className="w-6 h-6 rounded-full border-2 border-white bg-surface-200 flex items-center justify-center text-[8px] font-bold text-ink/40">+{(squad.member_count||4)-5}</div>}
        </div>
      </div>

      {/* Expanded activity feed */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ type:'spring', stiffness:280, damping:28 }} className="overflow-hidden border-t border-ink/[0.05]">
            <motion.div className="px-5 py-2" variants={list} initial="initial" animate="animate">
              {SAMPLE_ACTIVITY.map((a,i) => <SquadActivityRow key={i} {...a} />)}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SquadsTab({ location }: { location: ReturnType<typeof useCityLocation> }) {
  const { city, detecting } = location;
  const [squads, setSquads] = useState<any[]>([{ id:'demo-1', name:'Morning Movers', intention:'morning', streak:7, member_count:6, members:[], today_pillars:['move','hydrate'] }]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIntention, setNewIntention] = useState('morning');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (detecting) return;
    setLoading(true);
    fetch('/api/circles').then(r=>r.json()).then(d => {
      const live = d.circles||[];
      setSquads(live.length ? live : [{ id:'demo-1', name:'Morning Movers', intention:'morning', streak:7, member_count:6, members:[], today_pillars:['move','hydrate'] }]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [detecting]);

  const createSquad = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/circles',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:newName,description:newIntention,intention:newIntention})});
      if (res.ok) { const d=await res.json(); setSquads(p=>[{...(d.circle||{}),intention:newIntention},...p]); setNewName(''); setShowCreate(false); }
    } catch { /* ignore */ }
    setCreating(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-ink text-white px-5 md:px-10 pt-10 pb-10 relative overflow-hidden">
        <motion.div initial={{ opacity:0, scale:0.6 }} animate={{ opacity:0.12, scale:1.4 }} transition={{ duration:1 }} className="absolute top-0 right-0 w-72 h-72 rounded-full bg-brand blur-[90px] pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand mb-2 flex items-center gap-1.5">
              {city&&!detecting?<><Navigation size={9}/>{city}</>:detecting?<><Loader2 size={9} className="animate-spin"/>Locating…</>:'Everywhere'}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl italic text-white">Your Squads</h1>
            <p className="text-white/40 text-sm mt-2">4–8 people. One intention. Daily accountability.</p>
          </div>
          <motion.button whileTap={{ scale:0.94 }} onClick={() => setShowCreate(v=>!v)}
            className="shrink-0 flex items-center gap-1.5 bg-brand/15 border border-brand/35 text-brand text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full hover:bg-brand/25 transition-colors"
          >
            <PlusSquare size={12} />New Squad
          </motion.button>
        </div>
      </div>

      <div className="px-5 md:px-10 pt-5 pb-8 space-y-4">

        {/* Create squad form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className="overflow-hidden">
              <div className="bg-white border border-brand/20 rounded-2xl p-5 space-y-4 mb-2 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ink/35">New Squad</p>
                <input type="text" value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Squad name"
                  className="w-full bg-transparent border-b-2 border-ink/10 pb-2 text-lg font-display italic focus:outline-none focus:border-brand placeholder:text-ink/15"
                />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ink/28 mb-2">Intention</p>
                  <div className="flex flex-wrap gap-2">
                    {SQUAD_INTENTIONS.map(({ key, label, Icon, color, bg }) => (
                      <button key={key} onClick={() => setNewIntention(key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all ${newIntention===key?`${bg} border-brand/25 ${color}`:'border-ink/[0.08] text-ink/35 bg-white'}`}
                      ><Icon size={10}/>{label}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={createSquad} disabled={creating}
                    className={`flex-1 bg-brand text-white text-[11px] font-bold uppercase tracking-widest py-3 rounded-full disabled:opacity-50 hover:bg-brand-dark transition-colors ${R.shadow}`}
                  >{creating?'Creating…':'Create Squad'}</button>
                  <button onClick={()=>setShowCreate(false)} className="px-3 text-ink/28 hover:text-ink"><X size={15}/></button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading
          ? <div className="flex justify-center py-20"><Loader2 size={28} className="text-brand animate-spin"/></div>
          : <motion.div className="space-y-3" variants={list} initial="initial" animate="animate">
              {squads.map((s:any) => <SquadCard key={s.id} squad={s} />)}
              {!showCreate && (
                <motion.button variants={item} whileTap={{ scale:0.97 }} onClick={() => setShowCreate(true)}
                  className="w-full border-2 border-dashed border-ink/10 rounded-2xl p-5 flex items-center justify-center gap-3 text-ink/25 hover:text-brand hover:border-brand/25 hover:bg-brand-faint transition-all"
                >
                  <PlusSquare size={20}/><span className="text-[11px] font-medium uppercase tracking-widest">Join or create a squad</span>
                </motion.button>
              )}
            </motion.div>
        }

        {/* Community stats */}
        <motion.div variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once:true }}
          className="mt-8 bg-ink rounded-2xl p-6 grid grid-cols-3 divide-x divide-white/10"
        >
          {[{val:91,suf:'%',label:'still going at day 30'},{val:24,suf:'',label:'squads this week'},{val:6,suf:'avg',label:'people per squad'}].map(s => (
            <div key={s.label} className="flex flex-col items-center gap-0.5 px-3">
              <span className="font-display text-2xl italic text-brand"><CountUp to={s.val}/>{s.suf}</span>
              <span className="text-[9px] font-medium text-white/35 uppercase tracking-widest text-center">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MOVE TOGETHER
   Pure healthy lifestyle events — seeded, no party content
   ═══════════════════════════════════════════════════════════════════ */
function MoveEventCard({ event, onJoin, isJoined, joining }: { event: MoveEvent; onJoin: (id:string)=>void; isJoined?: boolean; joining?: boolean }) {
  const cat = MOVE_CATEGORIES.find(c => c.key===event.category) || MOVE_CATEGORIES[0];
  const CatIcon = cat.Icon;
  const spotsLeft = event.spots - event.joined;
  const pct = Math.round((event.joined/event.spots)*100);

  return (
    <motion.div variants={item} whileTap={{ scale:0.985 }}
      className="bg-white rounded-2xl border border-ink/[0.07] hover:border-brand/25 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden shadow-sm group"
    >
      {/* Category stripe */}
      <div className={`h-1 w-full ${cat.key==='walk'||cat.key==='cook'||cat.key==='stretch'?'bg-brand':'bg-ink'}`} />

      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${cat.color}`}>
            <CatIcon size={11}/>{cat.label}
          </span>
          <span className="text-[10px] font-medium text-ink/30">{event.date}</span>
        </div>

        {/* Title + vibe */}
        <div>
          <h3 className="font-display text-2xl italic leading-tight text-ink mb-1">{event.title}</h3>
          <p className="text-ink/45 text-sm line-clamp-2 leading-relaxed">{event.vibe}</p>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-ink/38 text-[12px]">
          <span className="flex items-center gap-1.5"><Clock size={11}/>{event.time}</span>
          <span className="flex items-center gap-1.5"><MapPin size={11}/>{event.location.split(',')[0]}</span>
        </div>

        {/* Attendance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {event.attendees.slice(0,5).map((name,i) => <BlankAvatar key={i} size={26} name={name}/>)}
              {event.joined>5 && <div className="w-6 h-6 rounded-full border-2 border-white bg-surface-200 flex items-center justify-center text-[8px] font-bold text-ink/38">+{event.joined-5}</div>}
            </div>
            <span className="text-[11px] text-ink/38 font-medium">{event.joined}/{event.spots} joined</span>
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-ink/6 rounded-full overflow-hidden">
            <motion.div className="h-full bg-brand rounded-full" initial={{ width:0 }} whileInView={{ width:`${pct}%` }} viewport={{ once:true }} transition={{ duration:0.8, ease:'easeOut', delay:0.1 }} />
          </div>
        </div>

        {/* Host + CTA */}
        <div className="flex items-center justify-between pt-1 border-t border-ink/[0.05]">
          <p className="text-[11px] text-ink/35 font-medium">by {event.host}</p>
          {isJoined
            ? <span className="text-[10px] text-brand font-bold uppercase tracking-widest">Joined</span>
            : spotsLeft > 0
            ? <motion.button whileTap={{ scale:0.94 }} onClick={() => onJoin(event.id)} disabled={joining}
                className={`flex items-center gap-1.5 bg-brand text-white px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-brand-dark transition-colors disabled:opacity-50 ${R.shadow}`}
              >
                {joining ? <Loader2 size={11} className="animate-spin" /> : <Heart size={11} strokeWidth={2.5}/>}Join · {spotsLeft} left
              </motion.button>
            : <span className="text-[10px] text-ink/25 font-medium uppercase tracking-widest">Full</span>
          }
        </div>
      </div>
    </motion.div>
  );
}

function MoveTab({ location }: { location: ReturnType<typeof useCityLocation> }) {
  const { city, detecting } = location;
  const [category, setCategory] = useState('all');
  const [events, setEvents] = useState<MoveEvent[]>(MOVE_EVENTS);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [moveError, setMoveError] = useState('');
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [showPost, setShowPost] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postVibe, setPostVibe] = useState('');
  const [postCategory, setPostCategory] = useState('walk');
  const [postLocation, setPostLocation] = useState('');
  const [postCity, setPostCity] = useState('');
  const [postDate, setPostDate] = useState('');
  const [postTime, setPostTime] = useState('');
  const [postSize, setPostSize] = useState(10);
  const [posting, setPosting] = useState(false);
  const [postDone, setPostDone] = useState(false);
  const [postError, setPostError] = useState('');

  useEffect(() => {
    if (detecting) return;
    let alive = true;
    setLoadingEvents(true);
    setMoveError('');
    const params = new URLSearchParams({ type: 'open' });
    if (city) params.set('city', city);

    fetch(`/api/hangouts?${params.toString()}`)
      .then(async r => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Unable to load live activities.');
        return Array.isArray(data.hangouts) ? data.hangouts.map(hangoutToMoveEvent) : [];
      })
      .then(live => {
        if (!alive) return;
        setEvents(live.length ? [...live, ...MOVE_EVENTS] : MOVE_EVENTS);
      })
      .catch(() => {
        if (alive) setMoveError('Showing starter activities. Connect the database to load live posts.');
      })
      .finally(() => {
        if (alive) setLoadingEvents(false);
      });

    return () => { alive = false; };
  }, [city, detecting]);

  const filtered = events.filter(e => category==='all' || e.category===category);

  const handleJoin = async (id: string) => {
    const event = events.find(e => e.id === id);
    setMoveError('');
    setJoiningId(id);
    if (event?.isLive) {
      try {
        const res = await fetch(`/api/hangouts/${id}/join`, { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Unable to join.');
      } catch (err) {
        setMoveError(err instanceof Error ? err.message : 'Unable to join this activity.');
        setJoiningId(null);
        return;
      }
    }
    setJoined(prev => { const n=new Set(prev); n.add(id); return n; });
    setEvents(prev => prev.map(e => e.id === id ? { ...e, joined: Math.min(e.spots, e.joined + 1), attendees: e.attendees.includes('You') ? e.attendees : ['You', ...e.attendees] } : e));
    setJoiningId(null);
  };

  const postEvent = async () => {
    if (!postTitle.trim()||!postLocation.trim()||!postDate||!postTime) return;
    setPosting(true);
    setPostError('');
    try {
      const res = await fetch('/api/hangouts', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ title:postTitle, vibe:postVibe || 'A healthy activity with the community.', category:postCategory, event_time:new Date(`${postDate}T${postTime}`).toISOString(), location:postLocation, city:postCity||city||undefined, max_guests:postSize, type:'open' }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to post activity.');
      if (data.hangout) setEvents(prev => [hangoutToMoveEvent(data.hangout), ...prev]);
      setPostDone(true);
    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'Unable to post this activity.');
    }
    setPosting(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-ink text-white px-5 md:px-10 pt-10 pb-10 relative overflow-hidden">
        <motion.div initial={{ opacity:0, scale:0.5 }} animate={{ opacity:0.1, scale:1.5 }} transition={{ duration:1 }} className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand blur-[80px] pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand mb-2 flex items-center gap-1.5">
              {city&&!detecting?<><Navigation size={9}/>{city}</>:detecting?<><Loader2 size={9} className="animate-spin"/>Locating…</>:'Everywhere'}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl italic text-white">Move Together</h1>
            <p className="text-white/40 text-sm mt-2">Group walks, run crews, cook-alongs, workouts.</p>
          </div>
          <motion.button whileTap={{ scale:0.94 }} onClick={() => { setShowPost(v=>!v); setPostDone(false); }}
            className="shrink-0 flex items-center gap-1.5 bg-brand/15 border border-brand/35 text-brand text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full hover:bg-brand/25 transition-colors"
          >
            <PlusSquare size={12}/>Post
          </motion.button>
        </div>
      </div>

      <div className="px-5 md:px-10 pt-5 space-y-5">

        {/* Post form */}
        <AnimatePresence>
          {showPost && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className="overflow-hidden">
              {postDone
                ? <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="bg-brand-faint border border-brand/20 rounded-2xl p-5 text-center mb-2">
                    <Check size={20} className="text-brand mx-auto mb-2"/>
                    <p className="font-semibold text-ink">Activity posted! Your squad can now join.</p>
                    <button onClick={() => { setShowPost(false); setPostDone(false); setPostTitle(''); setPostVibe(''); setPostLocation(''); setPostDate(''); setPostTime(''); }} className="text-[11px] text-brand font-bold uppercase tracking-widest mt-3">Post another →</button>
                  </motion.div>
                : <div className="bg-white border border-ink/[0.07] rounded-2xl p-6 space-y-4 mb-2 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ink/35">Post a group activity</p>
                    <input type="text" value={postTitle} onChange={e=>setPostTitle(e.target.value)} placeholder="e.g. Sunday morning walk at Oniru Beach"
                      className="w-full bg-transparent border-b-2 border-ink/10 pb-2 text-xl font-display italic focus:outline-none focus:border-brand placeholder:text-ink/15"
                    />
                    <input type="text" value={postVibe} onChange={e=>setPostVibe(e.target.value)} placeholder="What's the vibe? Who should come?"
                      className="w-full bg-transparent border-b border-ink/10 pb-2 text-sm focus:outline-none focus:border-brand placeholder:text-ink/15"
                    />
                    <div className="flex flex-wrap gap-2">
                      {MOVE_CATEGORIES.filter(c=>c.key!=='all').map(({ key, label, Icon, color, bg }) => (
                        <button key={key} onClick={() => setPostCategory(key)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all ${postCategory===key?`${bg} border-brand/25 ${color}`:'border-ink/[0.08] text-ink/35 bg-white'}`}
                        ><Icon size={10}/>{label}</button>
                      ))}
                    </div>
                    <PlacesAutocomplete value={postLocation} onChange={(val,place) => { setPostLocation(val); if(place?.city)setPostCity(place.city); }} placeholder="Location…"/>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="date" value={postDate} onChange={e=>setPostDate(e.target.value)} className="bg-transparent border-b border-ink/10 pb-2 text-sm focus:outline-none focus:border-brand [color-scheme:light]"/>
                      <input type="time" value={postTime} onChange={e=>setPostTime(e.target.value)} className="bg-transparent border-b border-ink/10 pb-2 text-sm focus:outline-none focus:border-brand [color-scheme:light]"/>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-ink/28 uppercase tracking-widest">Max size</p>
                      <span className="font-display text-xl italic text-brand">{postSize} people</span>
                    </div>
                    <input type="range" min="2" max="30" value={postSize} onChange={e=>setPostSize(Number(e.target.value))} className="w-full accent-brand"/>
                    <motion.button whileTap={{ scale:0.97 }} onClick={postEvent} disabled={posting||!postTitle.trim()||!postLocation.trim()||!postDate||!postTime}
                      className={`w-full bg-brand text-white py-3.5 rounded-full font-bold uppercase tracking-widest text-[12px] disabled:opacity-35 flex items-center justify-center gap-2 hover:bg-brand-dark transition-colors ${R.shadow}`}
                    >
                      {posting?<Loader2 size={16} className="animate-spin"/>:<><Play size={14} fill="white"/>Post Activity</>}
                    </motion.button>
                    {postError && <p className="text-[11px] text-red-500 text-center">{postError}</p>}
                  </div>
              }
            </motion.div>
          )}
        </AnimatePresence>

        {moveError && (
          <div className="bg-brand-faint border border-brand/15 rounded-2xl px-4 py-3 text-[12px] text-brand-dark">
            {moveError}
          </div>
        )}

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          {MOVE_CATEGORIES.map(({ key, label, Icon, color, bg }) => (
            <motion.button key={key} whileTap={{ scale:0.91 }} onClick={() => setCategory(key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[11px] font-semibold uppercase tracking-widest transition-all whitespace-nowrap shrink-0 border ${category===key?`${bg} text-brand border-brand/25`:'text-ink/38 border-ink/[0.08] hover:border-ink/18 bg-white'}`}
            >
              <Icon size={11} className={category===key?'text-brand':color}/>{label}
            </motion.button>
          ))}
        </div>

        {/* Event grid */}
        {loadingEvents && <div className="flex justify-center py-8"><Loader2 size={24} className="text-brand animate-spin"/></div>}
        <AnimatePresence mode="wait">
          <motion.div key={category} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-6"
          >
            <motion.div className="contents" variants={list} initial="initial" animate="animate">
              {filtered.map(e => (
                <div key={e.id} className="relative">
                  {joined.has(e.id) && (
                    <motion.div initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
                      className="absolute -top-2 -right-2 z-10 bg-brand text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm"
                    >Joined ✓</motion.div>
                  )}
                  <MoveEventCard event={e} onJoin={handleJoin} isJoined={joined.has(e.id)} joining={joiningId===e.id}/>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {filtered.length===0 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-center py-16 text-ink/25">
            <Flame size={40} className="mx-auto mb-4 opacity-20"/>
            <p className="font-display text-2xl italic text-ink/35">Nothing in that category yet.</p>
            <p className="text-sm mt-2">Tap Post to be the first.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FACE VERIFICATION MODAL
   ═══════════════════════════════════════════════════════════════════ */
function FaceVerificationModal({ user:_user, onVerified, onClose }: { user:any; onVerified:(u:any)=>void; onClose:()=>void }) {
  const [phase, setPhase] = useState<'intro'|'capturing'|'preview'|'checking'|'done'|'error'>('intro');
  const [errorMsg, setErrorMsg] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string|null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream|null>(null);

  const stopCamera = () => { streamRef.current?.getTracks().forEach(t=>t.stop()); streamRef.current=null; };
  const startCamera = async () => {
    setPhase('capturing'); setErrorMsg('');
    try { const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:720}}}); streamRef.current=s; if(videoRef.current){videoRef.current.srcObject=s;videoRef.current.play();} }
    catch { setPhase('error'); setErrorMsg('Camera access denied. Please allow camera access in your browser settings.'); }
  };
  const capture = () => {
    if(!videoRef.current||!canvasRef.current)return;
    const v=videoRef.current,c=canvasRef.current; c.width=v.videoWidth||1280; c.height=v.videoHeight||720;
    const ctx=c.getContext('2d'); if(!ctx)return; ctx.filter='brightness(1.15) contrast(1.05)'; ctx.drawImage(v,0,0); ctx.filter='none';
    stopCamera(); setPreviewUrl(c.toDataURL('image/jpeg',0.95)); setPhase('preview');
  };
  const submit = async () => {
    if(!canvasRef.current)return; setPhase('checking');
    canvasRef.current.toBlob(async(blob)=>{
      if(!blob){setPhase('error');setErrorMsg('Could not capture image.');return;}
      try {
        const fd=new FormData(); fd.append('file',blob,'selfie.jpg');
        const res=await fetch('/api/profile/verify-face',{method:'POST',body:fd}); const d=await res.json();
        if(res.ok&&d.verified){setPhase('done');onVerified(d.user);}
        else{setPhase('error');setErrorMsg(d.error||'Face did not match. Try in better lighting.');}
      } catch{setPhase('error');setErrorMsg('Verification failed. Check your connection.');}
    },'image/jpeg',0.95);
  };
  useEffect(()=>{
    const k=(e:KeyboardEvent)=>{if(e.key==='Escape'){stopCamera();onClose();}};
    window.addEventListener('keydown',k); return()=>{window.removeEventListener('keydown',k);stopCamera();};
  },[]); // eslint-disable-line

  const modal=(
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[200] bg-ink flex flex-col" style={{touchAction:'none'}}>
        <div className="flex items-center justify-between px-5 pt-4 pb-4 shrink-0">
          <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-brand"/><span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">Identity Verification</span></div>
          <button onClick={()=>{stopCamera();onClose();}} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/55 hover:bg-white/20 hover:text-white transition-all"><X size={18}/></button>
        </div>
        {phase==='intro'&&<motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6"><div className={`w-24 h-24 rounded-full bg-brand/15 border border-brand/28 flex items-center justify-center ${R.shadow}`}><ShieldCheck size={40} className="text-brand"/></div><div><h2 className="font-display text-4xl italic text-white mb-3">Get Verified</h2><p className="text-white/45 text-base max-w-xs mx-auto">We'll match a selfie to your profile photo.</p></div><motion.button whileTap={{scale:0.97}} onClick={startCamera} className={`w-full max-w-xs bg-brand text-white py-4 rounded-full font-bold uppercase tracking-[0.15em] text-[13px] ${R.shadow}`}>Start Camera</motion.button></motion.div>}
        {phase==='capturing'&&<div className="flex-1 flex flex-col relative"><video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline style={{transform:'scaleX(-1)'}}/><div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none"/><div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{marginTop:'-5%'}}><div className="border-2 border-brand/70 rounded-full" style={{width:'min(60vw,260px)',height:'min(78vw,340px)',boxShadow:'0 0 0 9999px rgba(0,0,0,0.45)'}}/></div><div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-4"><motion.button whileTap={{scale:0.92}} onClick={capture} className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-[0_0_0_4px_rgba(255,255,255,0.3)]"><div className="w-16 h-16 rounded-full bg-white border-4 border-ink/10"/></motion.button></div></div>}
        {phase==='preview'&&previewUrl&&<motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex-1 flex flex-col"><div className="flex-1 relative"><img src={previewUrl} alt="Selfie" className="absolute inset-0 w-full h-full object-cover" style={{transform:'scaleX(-1)'}}/><div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 pointer-events-none"/></div><canvas ref={canvasRef} className="hidden"/><div className="px-6 py-8 flex gap-3"><motion.button whileTap={{scale:0.97}} onClick={()=>{setPreviewUrl(null);startCamera();}} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full border border-white/18 text-white/65 font-bold uppercase tracking-widest text-[12px]"><RefreshCw size={14}/>Retake</motion.button><motion.button whileTap={{scale:0.97}} onClick={submit} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-full bg-brand text-white font-bold uppercase tracking-widest text-[12px] ${R.shadow}`}><Check size={14}/>Submit</motion.button></div></motion.div>}
        {phase==='checking'&&<div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 text-center">{previewUrl&&<div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-brand/28"><img src={previewUrl} alt="" className="w-full h-full object-cover" style={{transform:'scaleX(-1)'}}/><div className="absolute inset-0 bg-brand/18 animate-pulse"/></div>}<div><Loader2 size={30} className="animate-spin text-brand mx-auto mb-4"/><p className="text-white text-lg font-semibold">Matching your face…</p></div></div>}
        {phase==='done'&&<motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="flex-1 flex flex-col items-center justify-center gap-6 px-8 text-center"><motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:260,damping:20,delay:0.12}} className={`w-28 h-28 rounded-full bg-brand/18 border-2 border-brand/35 flex items-center justify-center ${R.shadowLg}`}><Check size={50} className="text-brand" strokeWidth={2.5}/></motion.div><div><h2 className="font-display text-5xl italic text-white mb-3">Verified!</h2><p className="text-white/45 text-base max-w-xs mx-auto">Your identity is confirmed.</p></div><motion.button whileTap={{scale:0.97}} onClick={onClose} className={`w-full max-w-xs bg-brand text-white py-4 rounded-full font-bold uppercase tracking-[0.15em] text-[13px] ${R.shadow}`}>Done</motion.button></motion.div>}
        {phase==='error'&&<motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="flex-1 flex flex-col items-center justify-center gap-5 px-8 text-center"><div className="w-24 h-24 rounded-full bg-red-500/12 border border-red-500/25 flex items-center justify-center"><AlertCircle size={40} className="text-red-400"/></div><div><h2 className="font-display text-3xl italic text-white mb-2">Verification failed</h2><p className="text-red-300 text-sm max-w-xs mx-auto">{errorMsg}</p></div><div className="flex gap-3 w-full max-w-xs"><button onClick={()=>{stopCamera();onClose();}} className="flex-1 py-4 rounded-full border border-white/12 text-white/45 font-bold uppercase tracking-widest text-[11px]">Cancel</button><motion.button whileTap={{scale:0.97}} onClick={()=>{setErrorMsg('');startCamera();}} className={`flex-1 py-4 rounded-full bg-brand text-white font-bold uppercase tracking-widest text-[11px] ${R.shadow}`}>Try Again</motion.button></div></motion.div>}
      </motion.div>
    </AnimatePresence>
  );
  return typeof document!=='undefined'?createPortal(modal,document.body):null;
}

function VerificationSection({ user, onVerified }: { user:any; onVerified:(u:any)=>void }) {
  const [modalOpen, setModalOpen] = useState(false);
  if(user?.verified) return (
    <div className="flex items-center justify-between p-4 bg-brand-faint border border-brand/18 rounded-2xl">
      <div className="flex items-center gap-3"><ShieldCheck size={20} className="text-brand"/><div><p className="text-sm font-semibold text-ink">Verified</p><p className="text-[11px] text-brand font-bold uppercase tracking-wider">Identity confirmed</p></div></div>
      <VerifiedBadge size={20}/>
    </div>
  );
  return (
    <>
      <div className="flex items-center justify-between p-4 bg-surface-100 border border-ink/[0.07] rounded-2xl">
        <div className="flex items-center gap-3"><ShieldCheck size={20} className="text-ink/25"/><div><p className="text-sm font-semibold text-ink">Get Verified</p><p className="text-[11px] text-ink/32 font-medium uppercase tracking-wider">{user?.avatar_url?'Face-match with your photo':'Upload a photo first'}</p></div></div>
        <button onClick={()=>setModalOpen(true)} disabled={!user?.avatar_url} className={`text-[10px] text-white bg-brand px-4 py-2 rounded-full font-bold uppercase tracking-widest disabled:opacity-28 hover:bg-brand-dark transition-colors ${R.shadow}`}>Verify</button>
      </div>
      {modalOpen&&<FaceVerificationModal user={user} onVerified={u=>{onVerified(u);setModalOpen(false);}} onClose={()=>setModalOpen(false)}/>}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PROFILE
   ═══════════════════════════════════════════════════════════════════ */
function ProfileTab({ gpsCity, initialUser }: { gpsCity?: string|null; initialUser?: any }) {
  const startingUser = { ...PREVIEW_USER, ...initialUser, location: initialUser?.location || gpsCity || PREVIEW_USER.location };
  const [user, setUser] = useState<any>(startingUser);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(startingUser.name || '');
  const [editBio, setEditBio] = useState(startingUser.bio || '');
  const [editLocation, setEditLocation] = useState(startingUser.location || '');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [profileNotice, setProfileNotice] = useState('');

  useEffect(() => {
    const localProfile = JSON.parse(window.localStorage.getItem('convivia24:profile') || 'null');
    if (localProfile) {
      const merged = { ...startingUser, ...localProfile };
      setUser(merged);
      setEditName(merged.name || '');
      setEditBio(merged.bio || '');
      setEditLocation(merged.location || gpsCity || '');
    }

    fetch('/api/profile').then(async r=>{
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Profile unavailable.');
      return d;
    }).then(d=>{
      if(d.user){setUser(d.user);setEditName(d.user.name||'');setEditBio(d.user.bio||'');setEditLocation((!d.user.location||d.user.location==='Lagos')&&gpsCity&&gpsCity!=='Lagos'?gpsCity:d.user.location||'');setProfileNotice('');}
    }).catch(()=>setProfileNotice('Preview profile active. Connect auth/database to sync changes across devices.'));
  },[]); // eslint-disable-line

  const save = async () => {
    setSaving(true);
    const updated = { ...user, name: editName, bio: editBio, location: editLocation };
    try{
      const r=await fetch('/api/profile',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:editName,bio:editBio,location:editLocation})});
      const d=await r.json();
      if(!r.ok) throw new Error(d.error || 'Profile update failed.');
      if(d.user){setUser(d.user);window.localStorage.setItem('convivia24:profile', JSON.stringify(d.user));setEditing(false);setProfileNotice('Profile saved.');}
    }catch{
      setUser(updated);
      window.localStorage.setItem('convivia24:profile', JSON.stringify(updated));
      setEditing(false);
      setProfileNotice('Saved on this device. Connect auth/database to sync everywhere.');
    }
    setSaving(false);
  };

  const uploadAvatar = async (e:React.ChangeEvent<HTMLInputElement>) => {
    const file=e.target.files?.[0]; if(!file)return;
    setUploadingAvatar(true);setAvatarError('');
    try{
      const fd=new FormData();fd.append('file',file);
      const r=await fetch('/api/upload',{method:'POST',body:fd});const d=await r.json();
      if(!r.ok){setAvatarError(d.error||'Upload failed.');setUploadingAvatar(false);return;}
      const u2=await fetch('/api/profile',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({avatar_url:d.url})});const d2=await u2.json();
      if(u2.ok&&d2.user)setUser(d2.user);else setAvatarError(d2.error||'Profile update failed.');
    }catch{setAvatarError('Network error — try again.');}
    setUploadingAvatar(false);
  };

  if(loading) return <div className="flex justify-center py-24"><Loader2 size={28} className="text-brand animate-spin"/></div>;

  return (
    <div className="max-w-2xl mx-auto pb-10">
      {/* Profile header */}
      <div className="bg-ink text-white px-5 md:px-10 pt-10 pb-12 relative overflow-hidden">
        <motion.div initial={{opacity:0,scale:0.5}} animate={{opacity:0.1,scale:1.5}} transition={{duration:0.9}} className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand blur-[80px] pointer-events-none"/>
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative shrink-0">
            <label className="cursor-pointer block w-28 h-28">
              {user?.avatar_url
                ?<img src={user.avatar_url} alt="" className="w-28 h-28 rounded-full border-2 border-brand/35 object-cover"/>
                :<div className="w-28 h-28 rounded-full border-2 border-dashed border-brand/25 bg-white/5 flex items-center justify-center"><Camera size={24} className="text-brand/35"/></div>
              }
              <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden"/>
              {uploadingAvatar
                ?<div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"><Loader2 size={24} className="text-white animate-spin"/></div>
                :<div className="absolute inset-0 bg-black/0 hover:bg-black/40 rounded-full flex items-center justify-center transition-colors opacity-0 hover:opacity-100"><Camera size={20} className="text-white"/></div>
              }
            </label>
            {user?.verified&&<div className="absolute -bottom-1 -right-1"><VerifiedBadge size={20}/></div>}
          </div>
          {avatarError&&<p className="text-red-400 text-[11px] text-center mt-1 max-w-[112px]">{avatarError}</p>}
          <div className="flex-1 text-center sm:text-left w-full">
            {editing?(
              <div className="space-y-3">
                <input value={editName} onChange={e=>setEditName(e.target.value)} className="bg-transparent border-b-2 border-white/18 pb-2.5 focus:outline-none focus:border-brand text-white w-full text-2xl font-display italic"/>
                <textarea value={editBio} onChange={e=>setEditBio(e.target.value)} rows={2} className="bg-transparent border-b-2 border-white/18 pb-2.5 focus:outline-none focus:border-brand text-white/55 w-full text-sm resize-none" placeholder="Your healthy living intention…"/>
                <PlacesAutocomplete value={editLocation} onChange={val=>setEditLocation(val)} placeholder="Your city…"/>
                <div className="flex gap-3 pt-1">
                  <motion.button whileTap={{scale:0.97}} onClick={save} disabled={saving} className={`bg-brand text-white px-6 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest disabled:opacity-50 ${R.shadow}`}>{saving?'Saving…':'Save'}</motion.button>
                  <button onClick={()=>setEditing(false)} className="text-white/28 hover:text-white text-[11px] font-bold uppercase tracking-widest transition-colors">Cancel</button>
                </div>
              </div>
            ):(
              <>
                <div className="flex items-center gap-2.5 justify-center sm:justify-start mb-2">
                  <h2 className="font-display text-3xl sm:text-4xl italic text-white">{user?.name}</h2>
                  {user?.verified&&<VerifiedBadge size={17}/>}
                  <button onClick={()=>setEditing(true)} className="text-white/22 hover:text-brand transition-colors ml-1"><Edit3 size={14}/></button>
                </div>
                <p className="text-white/40 text-sm mb-1.5 max-w-sm">{user?.bio||"No bio yet — what's your intention?"}</p>
                {(user?.location||gpsCity)&&<p className="text-white/22 text-sm flex items-center gap-1 justify-center sm:justify-start"><MapPin size={10}/>{user?.location||gpsCity}</p>}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-ink/[0.07] rounded-b-3xl p-6 md:p-8 shadow-sm space-y-4">
        {profileNotice && <div className="bg-brand-faint border border-brand/15 rounded-2xl px-4 py-3 text-[12px] text-brand-dark">{profileNotice}</div>}
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[{val:user?.checkins_count||user?.hangouts_count||0,label:'Check-Ins',Icon:Zap},{val:user?.circles_count||0,label:'Squads',Icon:Users},{val:user?.connections_count||0,label:'Crew',Icon:Heart}].map(({val,label,Icon:SIcon})=>(
            <motion.div key={label} whileTap={{scale:0.96}} className="bg-surface-100 border border-ink/[0.05] rounded-2xl p-4 flex flex-col items-center hover:border-brand/18 hover:bg-brand-faint transition-all">
              <SIcon size={13} className="text-brand mb-1"/>
              <span className="text-3xl md:text-4xl font-display text-brand italic mb-0.5">{val}</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/32">{label}</span>
            </motion.div>
          ))}
        </div>

        {/* Open to squad */}
        <div className="flex items-center justify-between p-4 bg-surface-100 border border-ink/[0.07] rounded-2xl">
          <div className="flex items-center gap-3">
            <UserCheck size={19} className={user?.open_to_meet?'text-brand':'text-ink/25'}/>
            <div><p className="text-sm font-semibold text-ink">Open to Squad Invites</p><p className="text-[11px] text-ink/32 font-medium uppercase tracking-wider">{user?.open_to_meet?'Others can invite you':'Hidden from discovery'}</p></div>
          </div>
          <button onClick={async()=>{const n=!user.open_to_meet;const updated={...user,open_to_meet:n};setUser(updated);window.localStorage.setItem('convivia24:profile',JSON.stringify(updated));try{await fetch('/api/profile',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({open_to_meet:n})});}catch{setProfileNotice('Saved on this device. Connect auth/database to sync everywhere.');}}} className={`relative w-12 h-7 rounded-full transition-colors ${user?.open_to_meet?'bg-brand':'bg-ink/10'}`}>
            <motion.span animate={{x:user?.open_to_meet?22:2}} transition={{type:'spring',stiffness:500,damping:30}} className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm"/>
          </button>
        </div>

        <VerificationSection user={user} onVerified={u=>setUser(u)}/>

        {/* Free access */}
        <motion.div whileTap={{scale:0.99}} className="flex items-center justify-between p-5 bg-brand-faint border border-brand/12 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-1 h-10 bg-brand rounded-full"/>
            <div><p className="text-sm font-semibold text-ink">Convivia Free</p><p className="text-[11px] text-brand font-bold uppercase tracking-widest">Check-ins, squads, and Move activities</p></div>
          </div>
          <span className="text-[10px] text-brand font-bold uppercase tracking-widest">Active</span>
        </motion.div>

        <button onClick={()=>{window.location.href='/api/auth/signout';}} className="w-full flex items-center justify-center gap-2 p-4 border border-ink/[0.07] rounded-xl text-ink/32 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all text-[11px] font-semibold uppercase tracking-widest">
          <LogOut size={14}/>Sign Out
        </button>
      </div>
    </div>
  );
}
