'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, PlusSquare, CircleDashed, User as UserIcon, Zap,
  Clock, Users, Star, ArrowRight, Building2, Ticket,
  MapPin, Camera, Calendar, LogOut, Edit3, Check, X, Loader2,
  Sparkles, Flame, ShieldCheck, RefreshCw, AlertCircle, Wine,
  Music2, Coffee, ChevronRight, Send, SkipForward, Hourglass,
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
  quiet:  'text-cream/55 bg-cream/8 border-cream/15',
  rising: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
  high:   'text-amber-300 bg-amber-500/15 border-amber-500/30',
  peak:   'text-red-300 bg-red-500/20 border-red-500/40',
};

const ENERGY_GRADIENTS: Record<Pulse['energy'], string> = {
  quiet:  'from-cream/8 to-cream/4',
  rising: 'from-emerald-500/25 to-teal-500/20',
  high:   'from-amber-500/30 to-orange-500/25',
  peak:   'from-orange-500/30 to-red-600/30',
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

/* ══════════════════════════════════════════════════════════════════════
   SHARED — Flow steps + how-it-works helper
   ══════════════════════════════════════════════════════════════════════ */
function FlowSteps({ steps }: { steps: { n: string; label: string; sub?: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3 pt-2">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-2 bg-obsidian-100/60 border border-cream/10 rounded-full pl-2 pr-3 py-1.5">
            <span className="w-5 h-5 rounded-full bg-gold/15 text-gold text-[10px] font-black flex items-center justify-center">{s.n}</span>
            <span className="text-[10px] uppercase tracking-widest font-black text-cream/75">{s.label}</span>
            {s.sub && <span className="hidden md:inline text-[10px] text-cream/35 font-medium normal-case tracking-normal">· {s.sub}</span>}
          </div>
          {i < steps.length - 1 && <ChevronRight size={14} className="text-cream/25"/>}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════ */
export function AppConceptBoard({ initialUser }: { initialUser?: any }) {
  const [activeTab, setActiveTab] = useState<'discover' | 'host' | 'venues' | 'circles' | 'profile'>('discover');

  const renderContent = () => {
    switch (activeTab) {
      case 'discover': return <DiscoverTab currentUser={initialUser} onSwitchTab={setActiveTab} />;
      case 'host':     return <HostTab onPosted={() => setActiveTab('discover')} />;
      case 'venues':   return <VenuesTab />;
      case 'circles':  return <CirclesTab />;
      case 'profile':  return <ProfileTab initialUser={initialUser} />;
    }
  };

  return (
    <div className="flex flex-col h-full w-full mx-auto relative text-cream">
      {/* TOP NAV (DESKTOP) */}
      <header className="hidden md:flex items-center justify-between px-10 py-6 border-b border-cream/10 backdrop-blur-sm bg-transparent sticky top-0 z-50">
        <div className="flex items-center gap-2 w-[180px]">
          <img src="/convivia24.png" alt="" className="h-8 w-auto opacity-95" style={{ filter: 'brightness(0) invert(1)' }} />
        </div>

        <nav className="flex items-center gap-8">
          <DesktopNavLink label="Discover" icon={<Compass size={18} />}    active={activeTab === 'discover'} onClick={() => setActiveTab('discover')} />
          <DesktopNavLink label="Host"     icon={<PlusSquare size={18} />}  active={activeTab === 'host'}     onClick={() => setActiveTab('host')} />
          <DesktopNavLink label="Venues"   icon={<Building2 size={18} />}   active={activeTab === 'venues'}   onClick={() => setActiveTab('venues')} />
          <DesktopNavLink label="Circles"  icon={<CircleDashed size={18} />} active={activeTab === 'circles'} onClick={() => setActiveTab('circles')} />
          <DesktopNavLink label="Profile"  icon={<UserIcon size={18} />}    active={activeTab === 'profile'}  onClick={() => setActiveTab('profile')} />
        </nav>

        <button onClick={() => setActiveTab('discover')} className="bg-gold text-obsidian px-6 py-2.5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-gold-light hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all flex items-center gap-2 w-[180px] justify-center">
          <Zap size={14} fill="currentColor" /> Pulse
        </button>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 w-full overflow-y-auto px-6 md:px-12 pt-8 md:pt-12 pb-32 md:pb-12 scrollbar-hide">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full mx-auto max-w-7xl"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* BOTTOM NAV (MOBILE) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#0d0d0d]/95 backdrop-blur-xl border-t border-cream/5 px-6 flex items-center justify-between pb-4 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <NavIcon icon={<Compass size={24} />}      active={activeTab === 'discover'} onClick={() => setActiveTab('discover')} />
        <NavIcon icon={<PlusSquare size={24} />}    active={activeTab === 'host'}     onClick={() => setActiveTab('host')} />

        <div className="relative -top-5">
          <button onClick={() => setActiveTab('venues')}
            className={`w-14 h-14 bg-gradient-to-br from-gold-light to-gold-dark rounded-full flex items-center justify-center text-[#0a0a0a] shadow-[0_4px_20px_rgba(201,168,76,0.4)] hover:scale-105 transition-transform ${activeTab === 'venues' ? 'ring-4 ring-gold/30' : ''}`}
          >
            <Building2 size={24} fill="currentColor" className="text-obsidian opacity-80" />
          </button>
        </div>

        <NavIcon icon={<CircleDashed size={24} />} active={activeTab === 'circles'} onClick={() => setActiveTab('circles')} />
        <NavIcon icon={<UserIcon size={24} />}     active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      </div>
    </div>
  );
}

/* ══ NAV HELPERS ══ */
function DesktopNavLink({ label, icon, active, onClick }: any) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 transition-all ${active ? 'text-gold font-bold drop-shadow-[0_0_8px_rgba(201,168,76,0.4)]' : 'text-cream/50 hover:text-cream'} relative`}
    >
      {icon}
      <span className="text-xs uppercase tracking-widest">{label}</span>
      {active && <span className="absolute -bottom-[29px] left-0 right-0 h-[3px] bg-gold rounded-t-full shadow-[0_0_10px_#c9a84c]"/>}
    </button>
  );
}
function NavIcon({ icon, active, onClick }: any) {
  return (
    <button onClick={onClick}
      className={`p-2 transition-colors ${active ? 'text-gold drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]' : 'text-cream/40 hover:text-cream/70'}`}
    >
      {icon}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   DISCOVER TAB — Live City Pulse + AI Match + Tonight's Tables
   ══════════════════════════════════════════════════════════════════════ */
function DiscoverTab({ currentUser: _currentUser, onSwitchTab }: { currentUser: any; onSwitchTab: (t: any) => void }) {
  const [filter, setFilter] = useState<'all' | 'open' | 'curated'>('all');
  const [hangouts, setHangouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinNote, setJoinNote] = useState<string | null>(null);

  // Live pulse from /api/pulse
  const [activeCity, setActiveCity] = useState<string>('London');
  const [pulseCards, setPulseCards] = useState<Pulse[]>([]);
  const [pulseLoading, setPulseLoading] = useState(true);

  // AI match flow state
  const [activePulse, setActivePulse] = useState<Pulse | null>(null);
  const [vibePrompt, setVibePrompt] = useState('');
  const [matchPhase, setMatchPhase] = useState<'idle' | 'matching' | 'ready' | 'gated'>('idle');
  const [matchedPlan, setMatchedPlan] = useState<any | null>(null);

  // Premium / credits
  const [premium, setPremium] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsResetAt, setCreditsResetAt] = useState<string | null>(null);

  const loadHangouts = useCallback(() => {
    setLoading(true);
    fetch('/api/hangouts').then(r => r.json()).then(data => {
      setHangouts(Array.isArray(data.hangouts) ? data.hangouts : []);
      setLoading(false);
    }).catch(() => setLoading(false));
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

  useEffect(() => { loadHangouts(); loadMatchStatus(); }, [loadHangouts, loadMatchStatus]);
  useEffect(() => { loadPulse(activeCity); }, [activeCity, loadPulse]);

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

  /* AI Match flow — checks credits, pulls real people, logs to /api/match */
  const startMatch = async (pulse: Pulse) => {
    setActivePulse(pulse);

    // Free users: gate after 0 credits
    if (!premium && credits !== null && credits <= 0) {
      setMatchPhase('gated');
      return;
    }

    setMatchPhase('matching');
    setMatchedPlan(null);

    // Pull real "open to meet" people; fall back to MATCH_POOL
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
    } catch { /* fall through to mock */ }

    const people = realPeople.length >= pulse.groupSize - 1
      ? realPeople
      : [...realPeople, ...[...MATCH_POOL].sort(() => Math.random() - 0.5)].slice(0, pulse.groupSize - 1);

    const liveTable = hangouts.find((h: any) =>
      (h.city || '').toLowerCase().includes(pulse.city.toLowerCase()) &&
      (h.current_guests || 0) < (h.max_guests || 0)
    );

    const plan = {
      id: liveTable?.id,
      title: liveTable?.title || `${pulse.area} · ${pulse.vibe.split('·')[0].trim()}`,
      venue: liveTable?.venue_name || liveTable?.location || `${pulse.area}, ${pulse.city}`,
      time: liveTable?.formatted_time || 'Tonight · 7:30 PM',
      date: liveTable?.formatted_date || 'Tonight',
      people,
      pulse,
      live: !!liveTable,
    };
    setMatchedPlan(plan);

    // Log the match (consumes a credit for free users)
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
    } catch { /* network — still let them see the match */ }

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
  const closeMatch = () => { setActivePulse(null); setMatchPhase('idle'); setMatchedPlan(null); };

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

  return (
    <div className="space-y-12">
      {/* HERO + how-it-works */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/70 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse"/> Live · {new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}
        </p>
        <h1 className="font-display text-5xl md:text-6xl italic leading-[1.05]">Tonight&apos;s Tables.</h1>
        <p className="text-cream/55 text-base md:text-lg max-w-xl">
          Where the energy is right now — and the people who match your vibe. No swiping. No dead group chats. Just <em>go</em>.
        </p>
        <FlowSteps steps={[
          { n: '1', label: 'Pick a vibe',    sub: 'live city pulse' },
          { n: '2', label: 'AI matches you', sub: '4–6 people' },
          { n: '3', label: 'Instant plan',   sub: 'venue · time · go' },
        ]}/>
      </div>

      {/* LIVE CITY PULSE */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/70 mb-1.5 flex items-center gap-2"><Zap size={10}/> Live City Pulse</p>
            <h2 className="font-display text-2xl md:text-3xl italic">Where the energy is now.</h2>
          </div>
          {/* City + credits chip */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-obsidian-200/70 border border-cream/10 rounded-full p-0.5">
              {(['London','Lagos','Abuja'] as const).map((c) => (
                <button key={c} onClick={() => setActiveCity(c)}
                  className={`text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full transition-all ${activeCity===c ? 'bg-gold text-obsidian shadow-[0_0_15px_rgba(201,168,76,0.25)]' : 'text-cream/55 hover:text-cream'}`}>
                  {c}
                </button>
              ))}
            </div>
            {premium ? (
              <span className="text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full bg-gold/15 text-gold border border-gold/40 flex items-center gap-1.5">
                <Star size={10} fill="currentColor"/> Black · unlimited
              </span>
            ) : (
              <span className={`text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${
                (credits ?? 0) > 0 ? 'bg-emerald-500/12 text-emerald-300 border-emerald-500/30' : 'bg-cream/8 text-cream/55 border-cream/15'
              }`}>
                <Sparkles size={10}/> {credits ?? '—'} free match{(credits ?? 0) === 1 ? '' : 'es'} left
              </span>
            )}
          </div>
        </div>

        {pulseLoading ? (
          <div className="flex justify-center py-10"><Loader2 size={24} className="text-gold animate-spin"/></div>
        ) : pulseCards.length === 0 ? (
          <div className="text-center py-10 text-cream/30 border border-dashed border-cream/10 rounded-3xl">
            <Compass size={36} className="mx-auto mb-3 opacity-50"/>
            <p className="font-display text-xl italic">No live energy in {activeCity} yet.</p>
            <p className="text-sm mt-1">Be the first — host a table to start the pulse.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {pulseCards.map((pulse) => {
              const PulseIcon = pickPulseIcon(pulse.vibe);
              const gradient = ENERGY_GRADIENTS[pulse.energy];
              return (
                <motion.button key={pulse.id}
                  whileTap={{ scale: 0.97 }} whileHover={{ y: -3 }}
                  onClick={() => startMatch(pulse)}
                  className={`relative overflow-hidden rounded-3xl border border-cream/10 hover:border-gold/35 bg-gradient-to-br ${gradient} p-4 md:p-5 text-left transition-all group`}
                >
                  <div className="absolute inset-0 bg-obsidian/55 backdrop-blur-[2px]" />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-cream/10 border border-cream/15 flex items-center justify-center text-cream/85 group-hover:bg-gold/20 group-hover:text-gold transition-colors">
                        <PulseIcon size={17}/>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-[0.18em] px-2 py-1 rounded-full border ${ENERGY_COLORS[pulse.energy]}`}>
                        {pulse.tag}
                      </span>
                    </div>
                    <p className="font-display text-xl md:text-2xl italic text-cream leading-tight">{pulse.area}</p>
                    <p className="text-[10px] uppercase tracking-widest text-cream/50 font-bold mb-2">{pulse.city}</p>
                    <p className="text-cream/65 text-[12px] md:text-sm leading-snug">{pulse.vibe}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[10px] text-gold uppercase tracking-widest font-black">
                        <Sparkles size={10}/> Match me · {pulse.groupSize}
                      </div>
                      {!!pulse.liveTables && pulse.liveTables > 0 && (
                        <span className="text-[9px] uppercase tracking-widest font-black text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                          {pulse.liveTables} live
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Custom vibe prompt — kills decision fatigue */}
        <div className="mt-5 bg-obsidian-100/70 border border-cream/10 rounded-3xl p-4 md:p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cream/40 mb-3">Or describe your vibe</p>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text" value={vibePrompt} onChange={(e) => setVibePrompt(e.target.value)}
              placeholder="e.g. chill, social, not too loud"
              className="flex-1 bg-transparent border-b border-cream/20 pb-2 text-base focus:outline-none focus:border-gold placeholder:text-cream/20 transition-colors"
            />
            <button onClick={matchByVibe}
              className="bg-gold text-obsidian px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gold-light transition-colors flex items-center justify-center gap-2 shrink-0">
              <Send size={12}/> Match Me
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {VIBE_PROMPTS.map((p) => (
              <button key={p} onClick={() => setVibePrompt(p)} className="text-[10px] uppercase tracking-widest font-bold text-cream/45 hover:text-gold border border-cream/10 hover:border-gold/40 px-2.5 py-1 rounded-full transition-colors">
                {p}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* TONIGHT'S TABLES — live hangouts */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/70 mb-1.5">Live Tables</p>
            <h2 className="font-display text-3xl md:text-5xl italic">Tables forming now.</h2>
            <p className="text-cream/50 text-sm md:text-base mt-1">Curated gatherings happening in the next 24 hours.</p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
            <FilterChip label="All Tables"     active={filter === 'all'}     onClick={() => setFilter('all')} />
            <FilterChip label="Curated Only"   active={filter === 'curated'} onClick={() => setFilter('curated')} color="gold" />
            <FilterChip label="Open List"      active={filter === 'open'}    onClick={() => setFilter('open')} color="blue" />
          </div>
        </div>

        {joinNote && (
          <div className="bg-gold/10 border border-gold/30 rounded-2xl px-4 py-3 text-sm text-gold-light flex items-center justify-between gap-3">
            <span>{joinNote}</span>
            <button onClick={() => setJoinNote(null)} className="text-gold/70 hover:text-gold"><X size={16}/></button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-gold animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-cream/30 border border-dashed border-cream/10 rounded-3xl">
            <Compass size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-display text-2xl italic mb-2">No tables tonight.</p>
            <p className="text-sm mb-5">Be the first to host one.</p>
            <button onClick={() => onSwitchTab('host')} className="text-[10px] font-black uppercase tracking-widest bg-gold text-obsidian px-6 py-3 rounded-full hover:bg-gold-light transition-colors">
              Host a table
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((h: any) => {
              const isCurated = h.type === 'curated';
              const badgeClass = isCurated
                ? 'bg-gold/10 text-gold border-gold/20'
                : 'bg-[#1a3a5f]/30 text-[#4da6ff] border-[#4da6ff]/20';
              const isFull = (h.current_guests || 0) >= (h.max_guests || 0);
              return (
                <div key={h.id} className="bg-obsidian-100/60 backdrop-blur-md rounded-3xl p-6 border border-cream/10 hover:border-gold/40 hover:-translate-y-1 transition-all shadow-xl flex flex-col justify-between group">
                  {h.cover_image && (
                    <div className="w-full h-36 rounded-2xl overflow-hidden mb-4 -mt-1">
                      <img src={h.cover_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between items-start mb-5">
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border shadow-sm ${badgeClass}`}>
                        {h.type}
                      </span>
                      <span className="text-gold/80 text-[10px] uppercase font-black tracking-widest bg-gold/10 px-2 py-1 rounded border border-gold/20">Live</span>
                    </div>
                    <h3 className="font-display text-3xl mb-2 leading-tight">{h.title}</h3>
                    <p className="text-cream/60 text-sm mb-6 line-clamp-2">{h.vibe}</p>

                    <div className="space-y-2 text-sm text-cream/50 mb-8">
                      <div className="flex items-center gap-2"><Clock size={14}/> {h.formatted_time || 'TBD'} <span className="text-xs ml-1 font-bold text-cream/20">• {h.formatted_date}</span></div>
                      <div className="flex items-center gap-2"><MapPin size={14}/> {h.location}</div>
                      {h.host_name && (
                        <div className="flex items-center gap-2 text-gold/60">
                          <Star size={14}/> Hosted by {h.host_name}
                          {h.host_tier === 'black' && <span className="text-[8px] bg-gold/20 text-gold px-1.5 py-0.5 rounded font-black">BLACK</span>}
                          {h.host_verified && <ShieldCheck size={11} className="text-gold"/>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-cream/5 pt-5 mt-auto">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {(h.attendees || []).slice(0, 4).map((a: any) => (
                          a.avatar_url
                            ? <img key={a.user_id} src={a.avatar_url} className="w-8 h-8 rounded-full border-2 border-obsidian object-cover" alt="" />
                            : <div key={a.user_id} className="w-8 h-8 rounded-full border-2 border-obsidian bg-cream/10 flex items-center justify-center text-[10px] font-bold text-cream/60">{(a.name||'?')[0]}</div>
                        ))}
                      </div>
                      <span className="text-xs text-cream/40 font-bold">{h.current_guests || 0} / {h.max_guests || 0}</span>
                    </div>
                    <button
                      onClick={() => handleJoin(h.id)}
                      disabled={joiningId === h.id || isFull}
                      className="text-[10px] uppercase font-black tracking-widest text-obsidian bg-cream hover:bg-gold hover:text-obsidian px-5 py-2.5 rounded-full transition-colors flex items-center gap-1.5 shadow-md group-hover:shadow-gold/20 disabled:opacity-50"
                    >
                      {joiningId === h.id ? <Loader2 size={12} className="animate-spin" />
                        : isFull ? 'Full'
                        : <>Request <ArrowRight size={12} className="mb-0.5" /></>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* INSTANT PLAN MODAL */}
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
   INSTANT PLAN MODAL — the magic moment
   ══════════════════════════════════════════════════════════════════════ */
function InstantPlanModal({
  phase, plan, pulse, creditsResetAt, onAccept, onSkip, onDelay, onClose, onUpgrade,
}: { phase: 'matching' | 'ready' | 'gated'; plan: any; pulse: Pulse; creditsResetAt: string | null; onAccept: () => void; onSkip: () => void; onDelay: () => void; onClose: () => void; onUpgrade: () => void }) {
  const modal = (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[180] flex items-end md:items-center justify-center p-0 md:p-6 bg-obsidian/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-obsidian-100 border border-gold/25 rounded-t-[32px] md:rounded-[32px] shadow-[0_-30px_60px_rgba(0,0,0,0.6)] overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-cream/8 hover:bg-cream/15 flex items-center justify-center text-cream/55"><X size={16}/></button>

        {/* Header */}
        <div className="relative px-6 md:px-8 pt-8 pb-5">
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-gold/15 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full border ${ENERGY_COLORS[pulse.energy]}`}>{pulse.tag}</span>
              <span className="text-[10px] uppercase tracking-widest text-cream/40 font-black">{pulse.area} · {pulse.city}</span>
            </div>
            {phase === 'gated' ? (
              <>
                <h2 className="font-display text-3xl md:text-4xl italic mb-2">No credits left</h2>
                <p className="text-cream/55 text-sm">Convivia Black unlocks unlimited matches in {pulse.area}.</p>
              </>
            ) : phase === 'matching' ? (
              <>
                <h2 className="font-display text-3xl md:text-4xl italic mb-2">Matching your vibe…</h2>
                <p className="text-cream/55 text-sm">Pulling people who match your energy and proximity.</p>
              </>
            ) : (
              <>
                <h2 className="font-display text-3xl md:text-4xl italic mb-2">{plan?.title}</h2>
                <p className="text-cream/55 text-sm flex items-center gap-2">
                  <Sparkles size={12} className="text-gold"/> AI matched · {(plan?.people?.length || 0) + 1} people
                </p>
              </>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 md:px-8 py-5 border-t border-cream/8 bg-obsidian-100/80">
          {phase === 'gated' ? (
            <div className="flex flex-col items-center justify-center gap-5 py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center">
                <Sparkles size={26} className="text-gold"/>
              </div>
              <div>
                <h3 className="font-display text-2xl italic text-cream mb-1">You&apos;ve used your free match this week.</h3>
                <p className="text-cream/55 text-sm max-w-xs mx-auto">
                  Free members get 1 AI match per week. {creditsResetAt && <>Resets <strong>{new Date(creditsResetAt).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</strong>.</>}
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={onClose} className="flex-1 py-3 rounded-full border border-cream/15 text-cream/60 font-black uppercase tracking-widest text-[11px]">Wait</button>
                <button onClick={onUpgrade} className="flex-1 py-3 rounded-full bg-gold text-obsidian font-black uppercase tracking-widest text-[11px] shadow-[0_0_25px_rgba(201,168,76,0.25)] flex items-center justify-center gap-1.5">
                  <Star size={12} fill="currentColor"/> Unlock Black
                </button>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-cream/40 font-bold">14-day free trial · cancel anytime</p>
            </div>
          ) : phase === 'matching' ? (
            <div className="flex flex-col items-center justify-center gap-4 py-10">
              <div className="relative">
                <Loader2 size={42} className="animate-spin text-gold" />
                <div className="absolute inset-0 rounded-full bg-gold/15 blur-2xl" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-cream/45">Decision fatigue → killed</p>
            </div>
          ) : (
            <>
              {/* People row */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex -space-x-3">
                  {plan?.people?.map((p: any, i: number) => (
                    <img key={i} src={p.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-obsidian-100 object-cover" />
                  ))}
                </div>
                <div className="text-[11px] uppercase tracking-widest font-black text-cream/55">
                  +{plan?.people?.length || 0} matched
                </div>
              </div>

              {/* Plan card */}
              <div className="rounded-2xl border border-cream/10 bg-obsidian-200/70 p-4 mb-5 space-y-2.5 text-sm">
                <div className="flex items-center gap-2 text-cream/85"><Building2 size={14} className="text-gold"/> {plan?.venue}</div>
                <div className="flex items-center gap-2 text-cream/85"><Clock     size={14} className="text-gold"/> {plan?.date} · {plan?.time}</div>
                <div className="flex items-center gap-2 text-cream/85"><Users     size={14} className="text-gold"/> {(plan?.people?.length || 0) + 1} people · similar vibe</div>
                {plan?.live && <div className="text-[10px] uppercase tracking-widest text-emerald-300 font-black">Live table · joinable now</div>}
                {!plan?.live && <div className="text-[10px] uppercase tracking-widest text-cream/40 font-black">Plan locks once 3 confirm</div>}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-2">
                <button onClick={onSkip}  className="flex flex-col items-center gap-1 py-3 rounded-xl border border-cream/10 text-cream/50 hover:text-cream hover:border-cream/25 transition-colors">
                  <SkipForward size={16}/><span className="text-[9px] uppercase tracking-widest font-black">Skip</span>
                </button>
                <button onClick={onDelay} className="flex flex-col items-center gap-1 py-3 rounded-xl border border-cream/10 text-cream/50 hover:text-cream hover:border-cream/25 transition-colors">
                  <Hourglass size={16}/><span className="text-[9px] uppercase tracking-widest font-black">Delay</span>
                </button>
                <button onClick={onAccept} className="flex flex-col items-center gap-1 py-3 rounded-xl bg-gold text-obsidian font-black hover:bg-gold-light transition-colors shadow-[0_0_20px_rgba(201,168,76,0.25)]">
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
    cream: active ? 'bg-cream text-obsidian font-bold shadow-[0_0_15px_rgba(245,240,232,0.3)]' : 'bg-obsidian-200 text-cream/60 border border-cream/10 hover:border-cream/30',
    gold:  active ? 'bg-gold/20 text-gold border border-gold/50 shadow-[0_0_15px_rgba(201,168,76,0.2)]' : 'bg-obsidian-200 text-gold/60 border border-gold/10 hover:border-gold/30',
    blue:  active ? 'bg-[#1a3a5f]/30 text-[#4da6ff] border border-[#4da6ff]/50 shadow-[0_0_15px_rgba(77,166,255,0.2)]' : 'bg-obsidian-200 text-[#4da6ff]/60 border border-[#4da6ff]/10 hover:border-[#4da6ff]/30',
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
      if (res.ok) setSuccess(true);
      else setError(data.error || 'Failed to create hangout.');
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
          className="w-20 h-20 border border-gold/30 flex items-center justify-center mx-auto mb-6 rounded-full bg-gold/10 shadow-[0_0_30px_rgba(201,168,76,0.25)]">
          <Check size={32} className="text-gold" />
        </motion.div>
        <h2 className="font-display text-4xl italic text-cream mb-3">Your table is set.</h2>
        <p className="text-cream/50 text-base mb-8 max-w-md mx-auto">Your hangout is live on Discover. Guests can request to join.</p>
        <div className="flex justify-center gap-3">
          <button onClick={onPosted} className="bg-gold text-obsidian px-6 py-3 rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-gold-light transition-colors">View on Discover</button>
          <button onClick={() => { setSuccess(false); setTitle(''); setVibe(''); setLocation(''); setEventDate(''); setEventTime(''); setCoverImage(null); }}
            className="text-gold text-[10px] uppercase tracking-widest font-black hover:text-gold-light transition-colors">Host another →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto h-full flex flex-col">
      <div className="mb-8 md:mb-12 text-center">
        <h1 className="font-display text-5xl md:text-6xl italic mb-2">Host</h1>
        <p className="text-cream/50 text-base md:text-lg mb-4">Set the table. Define the energy. The right people will come.</p>
        <div className="flex justify-center">
          <FlowSteps steps={[
            { n: '1', label: 'Describe',   sub: 'occasion + vibe' },
            { n: '2', label: 'Set venue',  sub: 'date + table size' },
            { n: '3', label: 'Go live',    sub: 'guests can join now' },
          ]}/>
        </div>
      </div>

      <div className="bg-obsidian-100/60 backdrop-blur-lg border border-cream/10 rounded-[40px] p-8 md:p-12 shadow-2xl flex-1">
        <div className="space-y-10">
          <Field label="The Occasion">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Founders After Dark"
              className="w-full bg-transparent border-b border-cream/20 pb-3 text-2xl md:text-3xl focus:outline-none focus:border-gold placeholder:text-cream/10 transition-colors font-display italic" />
          </Field>

          <Field label="The Energy">
            <input type="text" value={vibe} onChange={(e) => setVibe(e.target.value)} placeholder="e.g. Whisky, ideas, and honest conversation."
              className="w-full bg-transparent border-b border-cream/20 pb-3 text-base focus:outline-none focus:border-gold placeholder:text-cream/10 transition-colors" />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Where">
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. The Table, Victoria Island"
                className="w-full bg-transparent border-b border-cream/20 pb-3 text-base focus:outline-none focus:border-gold placeholder:text-cream/10 transition-colors" />
            </Field>
            <Field label="City">
              <select value={city} onChange={(e) => setCity(e.target.value)}
                className="w-full bg-transparent border-b border-cream/20 pb-3 text-base focus:outline-none focus:border-gold transition-colors text-cream [color-scheme:dark]">
                {['Lagos', 'Abuja', 'London'].map((c) => <option key={c} value={c} className="bg-obsidian text-cream">{c}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Field label="Date" Icon={Calendar}>
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-transparent border-b border-cream/20 pb-3 text-base focus:outline-none focus:border-gold transition-colors text-cream [color-scheme:dark]" />
            </Field>
            <Field label="Time" Icon={Clock}>
              <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)}
                className="w-full bg-transparent border-b border-cream/20 pb-3 text-base focus:outline-none focus:border-gold transition-colors text-cream [color-scheme:dark]" />
            </Field>
          </div>

          {/* Cover Image */}
          <Field label="Cover Image" hint="(optional)" Icon={Camera}>
            {coverImage ? (
              <div className="relative rounded-2xl overflow-hidden h-44 border border-cream/10">
                <img src={coverImage} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setCoverImage(null)} className="absolute top-3 right-3 bg-obsidian/80 text-cream p-1.5 rounded-full hover:bg-red-900 transition-colors">
                  <X size={14} />
                </button>
                <span className="absolute bottom-3 left-3 text-[9px] uppercase tracking-widest font-black text-gold bg-obsidian/70 px-2 py-1 rounded-full border border-gold/30">
                  Stored on Azure
                </span>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 border border-dashed border-cream/20 rounded-2xl p-6 cursor-pointer hover:border-gold/40 transition-colors text-cream/30 hover:text-cream/60">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                {uploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                <span className="text-sm">{uploading ? 'Uploading…' : 'Add a cover photo'}</span>
              </label>
            )}
          </Field>

          {/* Format */}
          <Field label="Format">
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <button onClick={() => setType('curated')} className={`flex flex-col md:flex-row items-center justify-center gap-3 py-6 px-4 rounded-2xl border transition-all ${type === 'curated' ? 'bg-gold/10 border-gold/50 text-gold shadow-[0_0_20px_rgba(201,168,76,0.15)]' : 'border-cream/10 text-cream/40 hover:border-cream/30 hover:bg-cream/5'}`}>
                <Zap size={24} />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Curated</span>
              </button>
              <button onClick={() => setType('open')} className={`flex flex-col md:flex-row items-center justify-center gap-3 py-6 px-4 rounded-2xl border transition-all ${type === 'open' ? 'bg-[#1a3a5f]/20 border-[#4da6ff]/50 text-[#4da6ff] shadow-[0_0_20px_rgba(77,166,255,0.1)]' : 'border-cream/10 text-cream/40 hover:border-cream/30 hover:bg-cream/5'}`}>
                <Users size={24} />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Open</span>
              </button>
            </div>
          </Field>

          {/* Size */}
          <div>
            <label className="text-[10px] md:text-xs font-black text-cream/40 uppercase tracking-[0.2em] mb-6 flex justify-between items-end">
              <span>Table Size</span>
              <span className="text-xl md:text-2xl text-gold font-display italic">{size} People</span>
            </label>
            <input type="range" min="6" max="24" value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full h-1.5 bg-cream/10 rounded-lg appearance-none cursor-pointer accent-gold" />
            <div className="flex justify-between text-[9px] text-cream/30 mt-3 font-bold uppercase tracking-widest">
              <span>Intimate (6)</span>
              <span>Grand (24)</span>
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mt-6 text-center">{error}</p>}

        <button onClick={handleSubmit} disabled={submitting}
          className="w-full bg-gold text-obsidian py-5 rounded-full font-black uppercase tracking-[0.2em] text-[11px] mt-12 hover:bg-gold-light hover:shadow-[0_0_30px_rgba(201,168,76,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <><span>Set the Table</span> <ArrowRight size={16} /></>}
        </button>
      </div>
    </div>
  );
}

function Field({ label, hint, Icon, children }: { label: string; hint?: string; Icon?: any; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] md:text-xs font-black text-cream/40 uppercase tracking-[0.2em] block mb-3">
        {Icon && <Icon size={12} className="inline mr-1.5 -mt-0.5" />}{label}{hint && <span className="text-cream/20 ml-1.5 normal-case font-bold">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   VENUES TAB
   ══════════════════════════════════════════════════════════════════════ */
function VenuesTab() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [reservedId, setReservedId] = useState<string | null>(null);
  const [reserveNote, setReserveNote] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/venues')
      .then(r => r.json())
      .then(data => { setVenues(Array.isArray(data.venues) ? data.venues : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = [
    { key: 'all',            label: 'All Spaces', icon: '✦' },
    { key: 'dining',         label: 'Dining',     icon: '🍽' },
    { key: 'lounge',         label: 'Lounge',     icon: '🥂' },
    { key: 'boardroom',      label: 'Deal Rooms', icon: '💼' },
    { key: 'accommodations', label: 'Stay',       icon: '🛏' },
    { key: 'wellness',       label: 'Wellness',   icon: '🧖' },
  ];
  const filtered = categoryFilter === 'all' ? venues : venues.filter(v => v.category === categoryFilter);

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
  const formatSpend = (amount: number) => `₦${(amount / 1000).toFixed(0)}k`;

  return (
    <div className="space-y-8">
      <div className="mb-6 md:mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60 mb-3">Partner Venues</p>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl italic mb-3">Find Your Table.</h1>
        <p className="text-cream/50 text-base md:text-lg max-w-2xl mb-4">
          Curated seats at our finest partner spaces. We don&apos;t own the venues — we unlock them for you.
        </p>
        <FlowSteps steps={[
          { n: '1', label: 'Pick a space', sub: 'dining · lounge · stay' },
          { n: '2', label: 'Reserve',      sub: 'live in the database' },
          { n: '3', label: 'Show up',      sub: 'we confirm by SMS' },
        ]}/>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
        {categories.map(cat => (
          <button key={cat.key} onClick={() => setCategoryFilter(cat.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${
              categoryFilter === cat.key
                ? 'bg-gold/15 text-gold border border-gold/40 shadow-[0_0_15px_rgba(201,168,76,0.15)]'
                : 'text-cream/40 border border-cream/10 hover:border-cream/25 hover:text-cream/60'
            }`}
          >
            <span className="text-sm">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {reserveNote && (
        <div className="bg-gold/10 border border-gold/30 rounded-2xl px-4 py-3 text-sm text-gold-light flex items-center justify-between gap-3">
          <span>{reserveNote}</span>
          <button onClick={() => setReserveNote(null)} className="text-gold/70 hover:text-gold"><X size={16}/></button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={32} className="text-gold animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-cream/30 border border-dashed border-cream/10 rounded-3xl">
          <Building2 size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-display text-2xl italic mb-2">No venues in this category yet.</p>
          <p className="text-sm">Check back soon — we&apos;re always adding partner spaces.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {filtered.map((venue) => (
            <div key={venue.id} className="bg-obsidian-100/50 backdrop-blur-md rounded-[28px] overflow-hidden border border-cream/10 shadow-xl group hover:border-gold/30 transition-all duration-300 flex flex-col">
              <div className="relative h-48 overflow-hidden">
                {venue.image_url
                  ? <img src={venue.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                  : <div className="w-full h-full bg-gradient-to-br from-gold/20 to-obsidian flex items-center justify-center"><Building2 size={48} className="text-gold/40"/></div>
                }
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-transparent" />

                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="bg-obsidian/80 backdrop-blur-md text-[9px] text-gold uppercase tracking-[0.2em] font-black px-3 py-1.5 rounded-full border border-gold/20">
                    {venue.category}
                  </span>
                </div>
                {venue.rating && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-obsidian/80 backdrop-blur-md px-2.5 py-1.5 rounded-full">
                    <Star size={10} fill="currentColor" className="text-gold" />
                    <span className="text-[10px] font-black text-gold">{Number(venue.rating).toFixed(1)}</span>
                  </div>
                )}

                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-display text-2xl md:text-3xl italic text-cream mb-1 drop-shadow-lg">{venue.name}</h3>
                  {venue.partner_name && (
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gold/70">Powered by {venue.partner_name}</p>
                  )}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <p className="text-cream/50 text-sm leading-relaxed mb-5 line-clamp-2">{venue.tagline}</p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {venue.minimum_spend && (
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-cream/50 bg-cream/5 px-3 py-1.5 rounded-full border border-cream/10">
                      From {formatSpend(venue.minimum_spend)}/person
                    </span>
                  )}
                  {venue.capacity && (
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-cream/50 bg-cream/5 px-3 py-1.5 rounded-full border border-cream/10">
                      <Users size={10} /> {venue.capacity}
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-6 text-cream/35">
                  {venue.address && (
                    <p className="text-xs flex items-center gap-1.5">
                      <MapPin size={11} className="shrink-0 text-cream/25" /> {venue.address}
                    </p>
                  )}
                  {venue.availability && (
                    <p className="text-xs flex items-center gap-1.5">
                      <Clock size={11} className="shrink-0 text-cream/25" /> {venue.availability}
                    </p>
                  )}
                </div>

                <div className="mt-auto">
                  {reservedId === venue.id ? (
                    <div className="w-full flex items-center justify-center gap-2 py-3 bg-green-900/30 border border-green-500/30 rounded-full text-green-400 text-[10px] font-black uppercase tracking-widest">
                      <Check size={14} /> Reservation Requested
                    </div>
                  ) : (
                    <button onClick={() => handleReserve(venue.id)} disabled={reservingId === venue.id}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-cream text-obsidian rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gold hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all disabled:opacity-50">
                      {reservingId === venue.id ? <Loader2 size={14} className="animate-spin" /> : <>Reserve a Seat <ArrowRight size={12} /></>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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
    <div className="space-y-10">
      <div className="mb-8 md:mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60 mb-3">Inner network</p>
        <h1 className="font-display text-5xl md:text-6xl italic mb-2">Circles</h1>
        <p className="text-cream/55 text-base md:text-lg max-w-2xl mb-4">
          A <strong className="text-cream">Circle</strong> is a private 6–24 person group of people you actually want to see again. Think
          group chat × calendar × dinner club. After meeting someone via AI Match or Tonight&apos;s Tables, add them to a Circle so you can host
          private dinners only they can see — no public list, no requests-to-join.
        </p>
        <FlowSteps steps={[
          { n: '1', label: 'Meet',          sub: 'via match or table' },
          { n: '2', label: 'Add to Circle', sub: 'inner trust' },
          { n: '3', label: 'Host private',  sub: 'invite-only tables' },
        ]}/>
      </div>

      {/* Examples band */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { name: 'Founders Lagos',    note: 'private dinners + intros',     icon: Star },
          { name: 'VI After 9',        note: 'late-night lounge crew',        icon: Wine },
          { name: 'London Diaspora',   note: 'monthly brunches',              icon: Coffee },
        ].map(({ name, note, icon: I }) => (
          <div key={name} className="bg-obsidian-100/50 border border-cream/8 rounded-2xl px-4 py-3 flex items-center gap-3">
            <I size={16} className="text-gold shrink-0"/>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{name}</p>
              <p className="text-[10px] uppercase tracking-widest text-cream/40 font-bold truncate">{note}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <h3 className="text-[10px] md:text-xs font-black text-gold uppercase tracking-[0.2em] flex items-center gap-2 border-b border-cream/5 pb-4">
          Your Circles <span className="bg-gold/20 text-gold px-2 py-0.5 rounded text-[10px]">{circles.length}</span>
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-10"><Loader2 size={24} className="text-gold animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {circles.map((c: any) => (
              <div key={c.id} className="bg-obsidian-100/60 backdrop-blur-md border border-cream/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-4 shadow-xl hover:border-gold/40 hover:-translate-y-1 transition-all group">
                <div className="w-16 h-16 rounded-full border border-gold/30 flex items-center justify-center bg-gold/5 text-gold relative shadow-[0_0_20px_rgba(201,168,76,0.1)] group-hover:scale-105 transition-transform">
                  <Users size={24} />
                </div>
                <div>
                  <h4 className="font-display text-xl leading-tight mb-1">{c.name}</h4>
                  {c.description && <p className="text-[10px] text-cream/40 mb-2 line-clamp-2">{c.description}</p>}
                  <span className="text-[9px] text-cream/40 uppercase tracking-widest font-bold border-t border-cream/10 pt-2 block w-max mx-auto">
                    {c.member_count || 0} members
                  </span>
                </div>
              </div>
            ))}

            {showCreate ? (
              <div className="border border-gold/30 rounded-3xl p-5 flex flex-col gap-3 bg-obsidian-100/60">
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Circle name"
                  className="bg-transparent border-b border-cream/20 pb-2 text-sm focus:outline-none focus:border-gold placeholder:text-cream/20 text-cream"/>
                <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="What's it about?"
                  className="bg-transparent border-b border-cream/20 pb-2 text-xs focus:outline-none focus:border-gold placeholder:text-cream/20 text-cream"/>
                {error && <p className="text-red-400 text-[10px]">{error}</p>}
                <div className="flex gap-2 mt-2">
                  <button onClick={handleCreate} disabled={creating} className="flex-1 bg-gold text-obsidian text-[9px] font-black uppercase tracking-widest py-2 rounded-full disabled:opacity-50">
                    {creating ? '...' : 'Create'}
                  </button>
                  <button onClick={() => { setShowCreate(false); setError(''); }} className="px-3 py-2 text-cream/40 hover:text-cream text-[9px]">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowCreate(true)}
                className="border border-dashed border-cream/20 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-3 text-cream/30 hover:text-cream hover:border-cream/40 transition-colors cursor-pointer bg-cream/5 hover:bg-cream/10">
                <PlusSquare size={28} className="mb-1" />
                <span className="text-[10px] uppercase tracking-widest font-black">New Circle</span>
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
      className="fixed inset-0 z-[200] bg-obsidian flex flex-col"
      style={{ touchAction: 'none', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-between px-5 pt-4 pb-4 shrink-0 border-b border-cream/5">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-gold" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-cream/55">Identity Verification</span>
        </div>
        <button onClick={closeAll} className="w-9 h-9 rounded-full bg-cream/10 flex items-center justify-center text-cream/55 hover:bg-cream/20 hover:text-cream transition-all">
          <X size={18} />
        </button>
      </div>

      {phase === 'intro' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center shadow-[0_0_30px_rgba(201,168,76,0.25)]">
            <ShieldCheck size={40} className="text-gold" />
          </div>
          <div>
            <h2 className="font-display text-4xl italic text-cream mb-3">Get Verified</h2>
            <p className="text-cream/50 text-base max-w-xs mx-auto">We&apos;ll match a quick selfie to your profile photo. Powered by Azure Face.</p>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={startCamera} className="w-full max-w-xs bg-gold text-obsidian py-4 rounded-full font-black uppercase tracking-[0.2em] text-[11px] hover:bg-gold-light transition-colors shadow-[0_0_30px_rgba(201,168,76,0.25)]">
            Start Camera
          </motion.button>
        </motion.div>
      )}

      {phase === 'capturing' && (
        <div className="flex-1 flex flex-col relative">
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline style={{ transform: 'scaleX(-1)' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: '-5%' }}>
            <div className="border-2 border-gold/70 rounded-full" style={{ width: 'min(60vw,260px)', height: 'min(78vw,340px)', boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)' }} />
          </div>
          <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-4">
            <motion.button whileTap={{ scale: 0.92 }} onClick={capture} className="w-20 h-20 rounded-full bg-cream flex items-center justify-center shadow-[0_0_0_4px_rgba(245,240,232,0.3)]">
              <div className="w-16 h-16 rounded-full bg-cream border-4 border-obsidian/10" />
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
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full border border-cream/20 text-cream/65 font-black uppercase tracking-widest text-[11px]">
              <RefreshCw size={14} /> Retake
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={submit}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full bg-gold text-obsidian font-black uppercase tracking-widest text-[11px] shadow-[0_0_25px_rgba(201,168,76,0.25)]">
              <Check size={14} /> Submit
            </motion.button>
          </div>
        </motion.div>
      )}

      {phase === 'checking' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 text-center">
          {previewUrl && (
            <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-gold/40">
              <img src={previewUrl} alt="" className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
              <div className="absolute inset-0 bg-gold/20 animate-pulse" />
            </div>
          )}
          <div>
            <Loader2 size={30} className="animate-spin text-gold mx-auto mb-4" />
            <p className="text-cream text-lg font-semibold">Matching your face…</p>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center gap-6 px-8 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.12 }}
            className="w-28 h-28 rounded-full bg-gold/20 border-2 border-gold/40 flex items-center justify-center shadow-[0_0_40px_rgba(201,168,76,0.35)]">
            <Check size={50} className="text-gold" strokeWidth={2.5} />
          </motion.div>
          <div>
            <h2 className="font-display text-5xl italic text-cream mb-3">Verified!</h2>
            <p className="text-cream/50 text-base max-w-xs mx-auto">Your identity is confirmed. The badge is now on your profile.</p>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={closeAll}
            className="w-full max-w-xs bg-gold text-obsidian py-4 rounded-full font-black uppercase tracking-[0.2em] text-[11px] shadow-[0_0_30px_rgba(201,168,76,0.25)]">
            Done
          </motion.button>
        </motion.div>
      )}

      {phase === 'error' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center gap-5 px-8 text-center">
          <div className="w-24 h-24 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center"><AlertCircle size={40} className="text-red-400" /></div>
          <div>
            <h2 className="font-display text-3xl italic text-cream mb-2">Verification failed</h2>
            <p className="text-red-300 text-sm max-w-xs mx-auto">{errorMsg}</p>
          </div>
          <div className="flex gap-3 w-full max-w-xs">
            <button onClick={closeAll} className="flex-1 py-4 rounded-full border border-cream/15 text-cream/45 font-black uppercase tracking-widest text-[11px]">Cancel</button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setErrorMsg(''); startCamera(); }}
              className="flex-1 py-4 rounded-full bg-gold text-obsidian font-black uppercase tracking-widest text-[11px] shadow-[0_0_25px_rgba(201,168,76,0.25)]">
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
        <Loader2 size={32} className="text-gold animate-spin" />
      </div>
    );
  }

  if (showUpgrade) {
    const isActive = !!user?.premium_active || user?.tier === 'black';
    return (
      <div className="pt-4 pb-20 space-y-8">
        <button onClick={() => setShowUpgrade(false)} className="text-[10px] uppercase tracking-widest font-black text-cream/50 hover:text-gold flex items-center gap-2">
          ← Back to Profile
        </button>

        <div className="relative rounded-[40px] overflow-hidden border border-gold/30 bg-obsidian-100/50 backdrop-blur-3xl shadow-[0_20px_100px_rgba(201,168,76,0.1)]">
          <div className="absolute inset-0 z-0">
            <img src="/conv1.png" className="w-full h-[60%] object-cover opacity-30 mix-blend-lighten" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian-50 via-obsidian-50/90 to-transparent" />
          </div>

          <div className="relative z-10 p-8 md:p-14 flex flex-col lg:flex-row gap-12 items-center lg:items-start">
            <div className="flex-shrink-0 relative">
              <div className="absolute inset-0 bg-gold/20 rounded-xl blur-3xl animate-pulse" />
              <ConviviumCard />
              <p className="text-[9px] uppercase tracking-[0.3em] font-black text-center text-gold/60 mt-6 block w-full">Digital Access Key</p>
            </div>
            <div className="flex-1 text-center lg:text-left">
              <SectionLabel variant="dark">Membership</SectionLabel>
              <h2 className="font-display text-4xl sm:text-5xl italic text-cream mb-3">Convivia Black</h2>
              <p className="text-cream/60 text-base leading-relaxed mb-8 max-w-lg">
                Free members get <strong className="text-cream">1 AI match per week</strong>. Black is unlimited — plus priority everywhere we operate.
              </p>

              <div className="space-y-3 mb-8 text-left">
                {[
                  { Icon: Sparkles,    title: 'Unlimited AI Matches',     sub: 'Free is 1/week. Black is unlimited.' },
                  { Icon: Zap,         title: 'Instant Venue Booking',    sub: 'No 24-hour wait — auto-confirmed.' },
                  { Icon: Ticket,      title: 'Priority Curated Tables',  sub: 'Skip the host approval queue.' },
                  { Icon: ShieldCheck, title: 'Black Badge',              sub: 'Visible to other members.' },
                  { Icon: Building2,   title: 'Member-only Tables',       sub: 'Monthly Black-only dinners.' },
                ].map(({ Icon, title, sub }) => (
                  <div key={title} className="flex items-start gap-3 bg-obsidian-100 p-4 rounded-2xl border border-cream/5">
                    <Icon size={18} className="text-gold shrink-0 mt-0.5" />
                    <div><p className="text-sm font-bold">{title}</p><p className="text-[10px] text-cream/45 mt-0.5 uppercase tracking-wider font-bold">{sub}</p></div>
                  </div>
                ))}
              </div>

              {/* Plan picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <button onClick={() => subscribe('black_trial')} disabled={isActive || subscribing !== null}
                  className="text-left p-5 rounded-2xl border border-cream/15 hover:border-gold/40 transition-colors disabled:opacity-50 bg-obsidian-100/70">
                  <p className="text-[10px] uppercase tracking-widest font-black text-cream/45 mb-1">Free trial</p>
                  <p className="font-display text-3xl italic text-cream">14 days</p>
                  <p className="text-cream/55 text-sm mt-1">Then ₦30k/mo · cancel anytime</p>
                  <p className="text-[10px] uppercase tracking-widest text-gold font-black mt-3">{subscribing === 'trial' ? 'Starting…' : 'Start trial →'}</p>
                </button>
                <button onClick={() => subscribe('black')} disabled={isActive || subscribing !== null}
                  className="text-left p-5 rounded-2xl border border-gold/40 hover:border-gold transition-colors disabled:opacity-50 bg-gold/8">
                  <p className="text-[10px] uppercase tracking-widest font-black text-gold mb-1">Monthly</p>
                  <p className="font-display text-3xl italic text-cream">₦30,000<span className="text-base text-cream/40">/mo</span></p>
                  <p className="text-cream/55 text-sm mt-1">Unlimited · all benefits live</p>
                  <p className="text-[10px] uppercase tracking-widest text-gold font-black mt-3">{subscribing === 'paid' ? 'Activating…' : 'Subscribe →'}</p>
                </button>
              </div>

              {isActive && (
                <button onClick={cancelSubscription} disabled={subscribing !== null}
                  className="text-[10px] uppercase tracking-widest font-black text-cream/40 hover:text-red-400 transition-colors mt-2">
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
      <div className="bg-obsidian-100/60 backdrop-blur-xl border border-cream/10 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 relative z-10">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4 group">
              <div className="absolute inset-0 bg-gold/20 rounded-full blur-2xl group-hover:bg-gold/30 transition-colors" />
              <label className="cursor-pointer block">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-32 h-32 md:w-36 md:h-36 rounded-full border-[3px] border-gold relative z-10 object-cover shadow-2xl" />
                ) : (
                  <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-[3px] border-dashed border-gold/40 bg-cream/5 relative z-10 flex items-center justify-center">
                    <Camera size={26} className="text-gold/60" />
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-obsidian/60 rounded-full flex items-center justify-center z-20">
                    <Loader2 size={24} className="text-gold animate-spin" />
                  </div>
                )}
              </label>
              {user?.verified && (
                <div className="absolute -bottom-2 -right-2 bg-gold text-obsidian rounded-full p-1.5 z-20 shadow-lg border-2 border-obsidian-100">
                  <ShieldCheck size={14} />
                </div>
              )}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 bg-gold text-obsidian px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mx-auto w-max flex items-center gap-1.5 shadow-lg border border-gold-light whitespace-nowrap">
                <Star size={12} fill="currentColor" /> {user?.rating || '—'} Rating
              </div>
            </div>
            {avatarError && <p className="text-red-400 text-[11px] text-center mt-3 max-w-[140px]">{avatarError}</p>}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left w-full">
            {profileNotice && (
              <div className="bg-gold/10 border border-gold/20 rounded-2xl px-3 py-2 text-[12px] text-gold/85 mb-6">
                {profileNotice}
              </div>
            )}

            {editing ? (
              <div className="space-y-4 mb-8">
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-transparent border-b border-cream/20 pb-2 text-3xl font-display italic focus:outline-none focus:border-gold w-full text-cream" />
                <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3}
                  className="bg-transparent border-b border-cream/20 pb-2 text-base focus:outline-none focus:border-gold w-full resize-none text-cream/60"
                  placeholder="Tell the table about you…" />
                <input value={editLocation} onChange={(e) => setEditLocation(e.target.value)}
                  className="bg-transparent border-b border-cream/20 pb-2 text-sm focus:outline-none focus:border-gold w-full text-cream/60" placeholder="City" />
                <div className="flex gap-3">
                  <button onClick={handleSave} disabled={saving} className="bg-gold text-obsidian px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => setEditing(false)} className="text-cream/40 hover:text-cream text-[10px] font-black uppercase tracking-widest">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3 justify-center md:justify-start">
                  <h2 className="font-display text-4xl md:text-5xl italic">{user?.name || 'Convivia Member'}</h2>
                  {user?.verified && <ShieldCheck size={18} className="text-gold" />}
                  <button onClick={() => setEditing(true)} className="text-cream/30 hover:text-gold transition-colors"><Edit3 size={16} /></button>
                </div>
                <p className="text-cream/60 text-base max-w-md mx-auto md:mx-0 leading-relaxed mb-2">{user?.bio || 'No bio yet — what brings you to the table?'}</p>
                {user?.location && <p className="text-cream/30 text-sm mb-8 flex items-center gap-1 justify-center md:justify-start"><MapPin size={12} /> {user.location}</p>}
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
                <div className="flex items-center justify-between p-5 bg-gold/8 rounded-[24px] border border-gold/30">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={20} className="text-gold" />
                    <div>
                      <p className="text-base font-bold tracking-wide">Verified</p>
                      <p className="text-[10px] text-gold font-black tracking-widest uppercase mt-1">Identity confirmed via Azure Face</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase text-gold font-black tracking-widest">Active</span>
                </div>
              ) : (
                <button onClick={() => setVerifyOpen(true)} disabled={!user?.avatar_url}
                  className="w-full flex items-center justify-between p-5 bg-obsidian-100 border border-cream/10 hover:border-gold/40 rounded-[24px] transition-colors disabled:opacity-50 group">
                  <div className="flex items-center gap-3 text-left">
                    <ShieldCheck size={20} className="text-cream/40 group-hover:text-gold transition-colors" />
                    <div>
                      <p className="text-base font-bold tracking-wide">Get Verified</p>
                      <p className="text-[10px] text-cream/35 font-black tracking-widest uppercase mt-1">
                        {user?.avatar_url ? 'Face-match with your photo' : 'Upload a profile photo first'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase text-obsidian bg-gold font-black tracking-widest px-4 py-2 rounded-md shadow-[0_0_15px_rgba(201,168,76,0.25)] group-hover:scale-105 transition-transform">Verify</span>
                </button>
              )}

              {/* Tier card */}
              {(() => {
                const active = !!user?.premium_active || user?.tier === 'black';
                const trial = user?.subscription_status === 'black_trial';
                return (
                  <div onClick={() => setShowUpgrade(true)}
                    className="flex items-center justify-between p-6 bg-gradient-to-r from-obsidian-100 to-obsidian-200 rounded-[24px] border border-gold/30 relative overflow-hidden group cursor-pointer">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gold" />
                    <div className="flex flex-col">
                      <span className="text-base font-bold tracking-wide">{active ? 'Convivia Black' : 'Convivia Free'}</span>
                      <span className="text-[10px] text-gold font-black tracking-widest uppercase mt-1">
                        {active ? (trial ? 'Trial · Unlimited matches' : 'Active · Unlimited matches')
                                : '1 free match per week'}
                      </span>
                    </div>
                    {active ? (
                      <span className="text-[10px] uppercase text-gold font-black tracking-widest">Manage</span>
                    ) : (
                      <span className="text-[10px] uppercase text-obsidian bg-gold font-black tracking-widest px-4 py-2 rounded-md shadow-[0_0_15px_rgba(201,168,76,0.3)] group-hover:scale-105 transition-transform">Unlock Black</span>
                    )}
                  </div>
                );
              })()}

              {/* Open to meet toggle */}
              <div className="flex items-center justify-between p-5 bg-obsidian-100 border border-cream/10 rounded-[24px]">
                <div className="flex items-center gap-3">
                  <Users size={20} className={user?.open_to_meet ? 'text-gold' : 'text-cream/40'}/>
                  <div>
                    <p className="text-base font-bold tracking-wide">Open to meet</p>
                    <p className="text-[10px] text-cream/40 font-black tracking-widest uppercase mt-1">{user?.open_to_meet ? 'You can be matched' : 'Hidden from AI Match'}</p>
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
                }} className={`relative w-12 h-7 rounded-full transition-colors ${user?.open_to_meet ? 'bg-gold' : 'bg-cream/15'}`}>
                  <span className={`absolute top-1 w-5 h-5 rounded-full bg-cream shadow-sm transition-transform ${user?.open_to_meet ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}/>
                </button>
              </div>

              <button onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 p-4 border border-cream/10 rounded-2xl text-cream/40 hover:text-red-400 hover:border-red-400/30 transition-colors text-[10px] uppercase tracking-widest font-black">
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
    <div className="bg-obsidian-100 border border-cream/5 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden hover:border-gold/30 transition-colors">
      <span className="text-3xl md:text-4xl font-display text-gold italic mb-2">{val}</span>
      <span className="text-[9px] uppercase tracking-[0.2em] text-cream/40 font-black">{label}</span>
    </div>
  );
}
