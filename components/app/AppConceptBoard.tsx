'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, PlusSquare, User as UserIcon, Zap,
  Clock, Users, Star, ArrowRight, Building2, Ticket,
  MapPin, Camera, Calendar, LogOut, Edit3, Check, X, Loader2,
  UserCheck, Navigation, Wifi, WifiOff, ShieldCheck, Link as LinkIcon,
  Music, Utensils, Dumbbell, TreePine, Palette, Wine, Globe, Flame
} from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { PlacesAutocomplete } from '@/components/PlacesAutocomplete';

/* ══════════════════════════════════════════════════════════════════════
   LOCATION HOOK
   ══════════════════════════════════════════════════════════════════════ */
function useCityLocation() {
  const [city, setCity] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [denied, setDenied] = useState(false);

  const detect = useCallback(() => {
    if (!navigator.geolocation) { setDenied(true); return; }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        let detected = 'Lagos';
        if (lat >= 8.0 && lat <= 10.5 && lng >= 6.5 && lng <= 8.0) detected = 'Abuja';
        else if (lat >= 51.0 && lat <= 52.0 && lng >= -0.6 && lng <= 0.4) detected = 'London';
        setCity(detected);
        setDetecting(false);
      },
      () => { setDetecting(false); setDenied(true); },
      { timeout: 6000 }
    );
  }, []);

  useEffect(() => { detect(); }, [detect]);
  return { city, detecting, denied, retry: detect };
}

/* ══════════════════════════════════════════════════════════════════════
   ACTIVITY CATEGORIES
   ══════════════════════════════════════════════════════════════════════ */
const CATEGORIES = [
  { key: 'all',       label: 'All',       Icon: Globe,    color: 'text-cream/60' },
  { key: 'nightlife', label: 'Nightlife', Icon: Wine,     color: 'text-purple-400' },
  { key: 'dining',    label: 'Dining',    Icon: Utensils, color: 'text-orange-400' },
  { key: 'gigs',      label: 'Gigs',      Icon: Music,    color: 'text-pink-400' },
  { key: 'sports',    label: 'Sports',    Icon: Dumbbell, color: 'text-blue-400' },
  { key: 'fitness',   label: 'Fitness',   Icon: Flame,    color: 'text-red-400' },
  { key: 'outdoors',  label: 'Outdoors',  Icon: TreePine, color: 'text-green-400' },
  { key: 'arts',      label: 'Arts',      Icon: Palette,  color: 'text-yellow-400' },
  { key: 'social',    label: 'Social',    Icon: Users,    color: 'text-gold/80' },
];

/* ══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════ */
export function AppConceptBoard({ initialUser: _initialUser }: { initialUser?: any }) {
  const [activeTab, setActiveTab] = useState<'discover' | 'host' | 'venues' | 'connect' | 'profile'>('discover');
  const location = useCityLocation();

  const renderContent = () => {
    switch (activeTab) {
      case 'discover': return <DiscoverTab location={location} />;
      case 'host':     return <HostTab />;
      case 'venues':   return <VenuesTab />;
      case 'connect':  return <ConnectTab location={location} />;
      case 'profile':  return <ProfileTab />;
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative text-cream">

      {/* ── TOP BAR ── */}
      <header className="flex items-center justify-between px-5 md:px-10 py-3 md:py-4 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
        {/* Logo — links to marketing homepage */}
        <a href="/spaces" className="flex items-center gap-2.5 shrink-0 group">
          <img src="/convivia24.png" alt="Convivia24" className="h-6 w-auto group-hover:opacity-70 transition-opacity" style={{ filter: 'brightness(0) invert(1)' }} />
          <span className="hidden sm:block text-[8px] font-black uppercase tracking-[0.3em] text-cream/30">
            Lagos · Abuja · London
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <DesktopNavLink label="Discover" active={activeTab === 'discover'} onClick={() => setActiveTab('discover')} />
          <DesktopNavLink label="Host"     active={activeTab === 'host'}     onClick={() => setActiveTab('host')} />
          <DesktopNavLink label="Connect"  active={activeTab === 'connect'}  onClick={() => setActiveTab('connect')} />
          <DesktopNavLink label="Venues"   active={activeTab === 'venues'}   onClick={() => setActiveTab('venues')} />
          <DesktopNavLink label="Profile"  active={activeTab === 'profile'}  onClick={() => setActiveTab('profile')} />
        </nav>

        {/* Location pill */}
        <LocationPill location={location} />
      </header>

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-y-auto px-5 md:px-10 pt-6 pb-28 md:pb-10 scrollbar-hide">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="max-w-6xl mx-auto"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── BOTTOM NAV (mobile) ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/[0.06] z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-end justify-around px-2 pt-2 pb-3">
          <NavIcon label="Discover" icon={<Compass size={21} />}   active={activeTab === 'discover'} onClick={() => setActiveTab('discover')} />
          <NavIcon label="Connect"  icon={<UserCheck size={21} />} active={activeTab === 'connect'}  onClick={() => setActiveTab('connect')} />

          {/* Centre — Host CTA */}
          <div className="flex flex-col items-center -mt-4">
            <button
              onClick={() => setActiveTab('host')}
              className={`w-14 h-14 rounded-full bg-gold flex items-center justify-center text-obsidian shadow-[0_0_24px_rgba(201,168,76,0.5)] hover:scale-105 active:scale-95 transition-transform ${activeTab === 'host' ? 'ring-4 ring-gold/30' : ''}`}
            >
              <PlusSquare size={22} strokeWidth={2.5} />
            </button>
            <span className={`text-[9px] font-black uppercase tracking-widest mt-1 ${activeTab === 'host' ? 'text-gold' : 'text-cream/30'}`}>Host</span>
          </div>

          <NavIcon label="Venues"  icon={<Building2 size={21} />} active={activeTab === 'venues'}  onClick={() => setActiveTab('venues')} />
          <NavIcon label="Profile" icon={<UserIcon size={21} />}  active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </div>
      </nav>
    </div>
  );
}

/* ══ NAV HELPERS ══ */
function DesktopNavLink({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-[11px] font-black uppercase tracking-[0.18em] transition-colors relative pb-1 ${active ? 'text-gold' : 'text-cream/40 hover:text-cream/70'}`}
    >
      {label}
      {active && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold rounded-full" />}
    </button>
  );
}

function NavIcon({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 min-w-[44px] py-1">
      <span className={`transition-colors ${active ? 'text-gold' : 'text-cream/35'}`}>{icon}</span>
      <span className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-gold' : 'text-cream/25'}`}>{label}</span>
    </button>
  );
}

function LocationPill({ location }: { location: ReturnType<typeof useCityLocation> }) {
  const { city, detecting, denied, retry } = location;
  if (detecting) return (
    <div className="flex items-center gap-1.5 text-[9px] text-cream/30 uppercase tracking-widest font-black shrink-0">
      <Loader2 size={10} className="animate-spin" /> Locating
    </div>
  );
  if (denied || !city) return (
    <button onClick={retry} className="flex items-center gap-1 text-[9px] text-cream/25 hover:text-cream/50 uppercase tracking-widest font-black transition-colors shrink-0">
      <WifiOff size={10} /> Location off
    </button>
  );
  return (
    <div className="flex items-center gap-1.5 text-[9px] text-gold/60 uppercase tracking-widest font-black shrink-0">
      <Navigation size={9} className="text-gold" /> {city}
    </div>
  );
}

/* ══ VERIFIED BADGE ══ */
function VerifiedBadge({ size = 12 }: { size?: number }) {
  return <ShieldCheck size={size} className="text-gold shrink-0" />;
}

/* ══════════════════════════════════════════════════════════════════════
   DISCOVER TAB — Location-aware activity feed
   ══════════════════════════════════════════════════════════════════════ */
function DiscoverTab({ location }: { location: ReturnType<typeof useCityLocation> }) {
  const { city, detecting } = location;
  const [category, setCategory] = useState('all');
  const [hangouts, setHangouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const loadedRef = useRef(false);

  const load = useCallback(async (targetCity: string | null, cat: string) => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (targetCity) p.set('city', targetCity);
      if (cat !== 'all') p.set('category', cat);
      const r = await fetch('/api/hangouts?' + p.toString());
      const data = await r.json();
      setHangouts(data.hangouts || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  // load on mount (city may be null if still detecting)
  useEffect(() => {
    if (!detecting) { load(city, category); loadedRef.current = true; }
  }, [city, detecting]); // eslint-disable-line

  // reload when category changes
  useEffect(() => {
    if (loadedRef.current) load(city, category);
  }, [category]); // eslint-disable-line

  const join = async (id: string) => {
    setJoiningId(id);
    try {
      const res = await fetch(`/api/hangouts/${id}/join`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) load(city, category);
      else alert(data.error || 'Could not join.');
    } catch { alert('Network error.'); }
    finally { setJoiningId(null); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/50 mb-1 flex items-center gap-1.5">
            {city && !detecting ? <><Navigation size={8} /> {city}</> : detecting ? <><Loader2 size={8} className="animate-spin" /> Detecting…</> : 'Activities'}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl italic leading-tight">
            {city ? `What's On in ${city}` : "What's On Near You"}
          </h1>
          <p className="text-cream/40 text-sm mt-1">Find your activity buddy. Just show up together.</p>
        </div>
        <button onClick={() => load(city, category)} className="shrink-0 mt-1 text-[9px] text-cream/30 hover:text-gold uppercase tracking-widest font-black transition-colors flex items-center gap-1">
          <Wifi size={10} /> Refresh
        </button>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {CATEGORIES.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${
              category === key
                ? 'bg-gold/15 text-gold border border-gold/40'
                : 'text-cream/40 border border-white/[0.08] hover:border-white/20 hover:text-cream/60'
            }`}
          >
            <Icon size={11} /> {label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={28} className="text-gold animate-spin" /></div>
      ) : hangouts.length === 0 ? (
        <div className="text-center py-20 text-cream/25">
          <Compass size={40} className="mx-auto mb-4 opacity-40" />
          <p className="font-display text-2xl italic mb-2">Nothing happening yet.</p>
          <p className="text-sm mb-4">Be the first to post an activity{city ? ` in ${city}` : ''}.</p>
          <p className="text-[9px] uppercase tracking-widest font-black text-cream/20">Try a different category or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hangouts.map((h: any) => (
            <ActivityCard key={h.id} h={h} joiningId={joiningId} onJoin={join} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ══ ACTIVITY CARD ══ */
function ActivityCard({ h, joiningId, onJoin }: { h: any; joiningId: string | null; onJoin: (id: string) => void }) {
  const cat = CATEGORIES.find(c => c.key === h.category) || CATEGORIES[0];
  const CatIcon = cat.Icon;
  const isFull = h.current_guests >= h.max_guests;
  const spotsLeft = h.max_guests - h.current_guests;

  return (
    <div className="bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-white/[0.07] hover:border-gold/30 hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Cover image */}
      {h.cover_image && (
        <div className="h-32 overflow-hidden">
          <img src={h.cover_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Category + type row */}
        <div className="flex items-center justify-between mb-3">
          <span className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${cat.color}`}>
            <CatIcon size={10} /> {cat.label}
          </span>
          <div className="flex items-center gap-2">
            {h.ticket_price != null && (
              <span className="text-[9px] font-black uppercase tracking-widest text-cream/50 flex items-center gap-0.5">
                <Ticket size={9} /> ₦{(h.ticket_price / 1000).toFixed(0)}k
              </span>
            )}
            {h.ticket_price == null && h.ticket_url && (
              <span className="text-[9px] font-black text-green-400 uppercase tracking-widest">Free</span>
            )}
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${h.type === 'curated' ? 'border-gold/30 text-gold/70' : 'border-blue-400/30 text-blue-400/70'}`}>
              {h.type === 'curated' ? 'Curated' : 'Open'}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display text-xl sm:text-2xl italic leading-tight mb-1">{h.title}</h3>
        <p className="text-cream/45 text-xs mb-4 line-clamp-2">{h.vibe}</p>

        {/* Meta */}
        <div className="space-y-1.5 mb-4 text-cream/40 text-xs">
          <div className="flex items-center gap-1.5"><Clock size={11} /> {h.formatted_time} <span className="text-cream/20">· {h.formatted_date}</span></div>
          <div className="flex items-center gap-1.5"><MapPin size={11} /> {h.location}</div>
          {h.host_name && (
            <div className="flex items-center gap-1.5 text-cream/50">
              <span>By {h.host_name}</span>
              {h.host_verified && <VerifiedBadge size={10} />}
              {h.host_tier === 'black' && <span className="text-[8px] bg-gold/15 text-gold px-1.5 py-0.5 rounded font-black">BLACK</span>}
            </div>
          )}
        </div>

        {/* Ticket link */}
        {h.ticket_url && (
          <a href={h.ticket_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[10px] text-gold/70 hover:text-gold font-black uppercase tracking-widest mb-3 transition-colors">
            <LinkIcon size={10} /> Get Tickets
          </a>
        )}

        {/* Attendees + join */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {h.attendees?.slice(0, 4).map((a: any) => (
                <div key={a.user_id} className="relative">
                  <img src={a.avatar_url || `https://i.pravatar.cc/32?u=${a.user_id}`} className="w-6 h-6 rounded-full border border-[#0a0a0a] object-cover" alt="" />
                  {a.verified && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-gold rounded-full border border-[#0a0a0a] flex items-center justify-center"><Check size={5} className="text-obsidian" /></div>}
                </div>
              ))}
            </div>
            <span className="text-[10px] text-cream/30 font-black">
              {isFull ? 'Full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
            </span>
          </div>
          {isFull ? (
            <span className="text-[9px] text-cream/25 font-black uppercase tracking-widest">Full</span>
          ) : (
            <button
              onClick={() => onJoin(h.id)}
              disabled={joiningId === h.id}
              className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-gold text-obsidian px-3.5 py-1.5 rounded-full hover:bg-gold-light active:scale-95 transition-all disabled:opacity-50"
            >
              {joiningId === h.id ? <Loader2 size={11} className="animate-spin" /> : <>Join <ArrowRight size={10} /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   HOST TAB — Post any activity
   ══════════════════════════════════════════════════════════════════════ */
function HostTab() {
  const [title, setTitle] = useState('');
  const [vibe, setVibe] = useState('');
  const [category, setCategory] = useState('social');
  const [type, setType] = useState('open');
  const [location, setLocation] = useState('');
  const [placeCity, setPlaceCity] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [size, setSize] = useState(6);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [ticketUrl, setTicketUrl] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) setCoverImage(data.url);
      else setError(data.error || 'Upload failed — check Azure storage config.');
    } catch { setError('Upload failed. Try again.'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !vibe.trim() || !location.trim() || !eventDate || !eventTime) {
      setError('Fill in title, vibe, location, date and time.');
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
          title, vibe, category, type, event_time, location,
          city: placeCity || undefined,
          max_guests: size,
          cover_image: coverImage,
          ticket_url: ticketUrl.trim() || undefined,
          ticket_price: ticketPrice ? Number(ticketPrice) : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) setSuccess(true);
      else setError(data.error || 'Failed to post.');
    } catch { setError('Network error. Try again.'); }
    finally { setSubmitting(false); }
  };

  const reset = () => {
    setSuccess(false); setTitle(''); setVibe(''); setCategory('social'); setType('open');
    setLocation(''); setPlaceCity(''); setEventDate(''); setEventTime('');
    setSize(6); setCoverImage(null); setTicketUrl(''); setTicketPrice(''); setError('');
  };

  if (success) return (
    <div className="max-w-lg mx-auto text-center py-24">
      <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-6">
        <Check size={28} className="text-gold" />
      </div>
      <h2 className="font-display text-3xl italic mb-2">Activity posted.</h2>
      <p className="text-cream/40 text-sm mb-8">People nearby can now find it and join you.</p>
      <button onClick={reset} className="text-gold text-[10px] uppercase tracking-widest font-black hover:text-gold-light transition-colors">Post Another →</button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl italic mb-1">Post an Activity</h1>
        <p className="text-cream/40 text-sm">Gig, dinner, football match, club night — find your people.</p>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.07] rounded-3xl p-6 md:p-10 space-y-8">

        {/* Cover photo */}
        <div>
          <label className="text-[9px] font-black text-cream/30 uppercase tracking-[0.25em] block mb-3">
            <Camera size={10} className="inline mr-1" /> Cover Photo <span className="text-cream/15">(optional)</span>
          </label>
          {coverImage ? (
            <div className="relative rounded-xl overflow-hidden h-36">
              <img src={coverImage} alt="" className="w-full h-full object-cover" />
              <button onClick={() => setCoverImage(null)} className="absolute top-2 right-2 bg-black/70 text-cream p-1.5 rounded-full hover:bg-red-900/80 transition-colors"><X size={13} /></button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 border border-dashed border-white/10 rounded-xl p-5 cursor-pointer hover:border-gold/30 transition-colors text-cream/20 hover:text-cream/50">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              {uploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
              <span className="text-sm">{uploading ? 'Uploading…' : 'Add a cover photo'}</span>
            </label>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="text-[9px] font-black text-cream/30 uppercase tracking-[0.25em] block mb-2">Activity Name</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Anyone for the Wizkid concert?" className="w-full bg-transparent border-b border-white/10 pb-2.5 text-xl md:text-2xl font-display italic focus:outline-none focus:border-gold placeholder:text-cream/10 transition-colors" />
        </div>

        {/* Vibe */}
        <div>
          <label className="text-[9px] font-black text-cream/30 uppercase tracking-[0.25em] block mb-2">Describe It</label>
          <input type="text" value={vibe} onChange={e => setVibe(e.target.value)} placeholder="e.g. Looking for 3-4 people to go together, casual vibe." className="w-full bg-transparent border-b border-white/10 pb-2.5 text-base focus:outline-none focus:border-gold placeholder:text-cream/10 transition-colors" />
        </div>

        {/* Category */}
        <div>
          <label className="text-[9px] font-black text-cream/30 uppercase tracking-[0.25em] block mb-3">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter(c => c.key !== 'all').map(({ key, label, Icon, color }) => (
              <button key={key} onClick={() => setCategory(key)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${category === key ? `bg-gold/10 border-gold/40 text-gold` : 'border-white/[0.08] text-cream/35 hover:border-white/20'}`}>
                <Icon size={10} className={category === key ? 'text-gold' : color} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="text-[9px] font-black text-cream/30 uppercase tracking-[0.25em] block mb-2">Where</label>
          <PlacesAutocomplete
            value={location}
            onChange={(val, place) => { setLocation(val); if (place?.city) setPlaceCity(place.city); }}
            placeholder="Search a venue, bar, stadium, park…"
          />
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="text-[9px] font-black text-cream/30 uppercase tracking-[0.25em] block mb-2"><Calendar size={9} className="inline mr-1" /> Date</label>
            <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-2.5 text-sm focus:outline-none focus:border-gold transition-colors text-cream [color-scheme:dark]" />
          </div>
          <div>
            <label className="text-[9px] font-black text-cream/30 uppercase tracking-[0.25em] block mb-2"><Clock size={9} className="inline mr-1" /> Time</label>
            <input type="time" value={eventTime} onChange={e => setEventTime(e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-2.5 text-sm focus:outline-none focus:border-gold transition-colors text-cream [color-scheme:dark]" />
          </div>
        </div>

        {/* Tickets */}
        <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] space-y-4">
          <p className="text-[9px] font-black text-cream/30 uppercase tracking-[0.25em] flex items-center gap-1.5"><Ticket size={10} /> Tickets (optional)</p>
          <div>
            <label className="text-[9px] text-cream/25 uppercase tracking-widest font-black block mb-1.5">Ticket Link</label>
            <input type="url" value={ticketUrl} onChange={e => setTicketUrl(e.target.value)} placeholder="https://eventbrite.com/..." className="w-full bg-transparent border-b border-white/10 pb-2 text-sm focus:outline-none focus:border-gold placeholder:text-cream/10 transition-colors" />
          </div>
          <div>
            <label className="text-[9px] text-cream/25 uppercase tracking-widest font-black block mb-1.5">Price (₦) — leave blank if free</label>
            <input type="number" min="0" value={ticketPrice} onChange={e => setTicketPrice(e.target.value)} placeholder="e.g. 15000" className="w-full bg-transparent border-b border-white/10 pb-2 text-sm focus:outline-none focus:border-gold placeholder:text-cream/10 transition-colors" />
          </div>
        </div>

        {/* Who can join */}
        <div>
          <label className="text-[9px] font-black text-cream/30 uppercase tracking-[0.25em] block mb-3">Who Can Join</label>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setType('open')} className={`py-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-2 ${type === 'open' ? 'border-blue-400/50 bg-blue-400/10 text-blue-400' : 'border-white/[0.08] text-cream/35 hover:border-white/20'}`}>
              <Users size={18} /> Anyone
            </button>
            <button onClick={() => setType('curated')} className={`py-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-2 ${type === 'curated' ? 'border-gold/50 bg-gold/10 text-gold' : 'border-white/[0.08] text-cream/35 hover:border-white/20'}`}>
              <Zap size={18} /> By Request
            </button>
          </div>
        </div>

        {/* Group size */}
        <div>
          <label className="text-[9px] font-black text-cream/30 uppercase tracking-[0.25em] flex justify-between items-end mb-4">
            <span>Max Group Size</span>
            <span className="text-base font-display italic text-gold">{size} people</span>
          </label>
          <input type="range" min="2" max="50" value={size} onChange={e => setSize(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-gold" />
          <div className="flex justify-between text-[9px] text-cream/20 mt-2 font-black uppercase tracking-widest">
            <span>2</span><span>50</span>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-gold text-obsidian py-4 rounded-full font-black uppercase tracking-[0.18em] text-[11px] hover:bg-gold-light active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_24px_rgba(201,168,76,0.25)]"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <><span>Post Activity</span><ArrowRight size={15} /></>}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   VENUES TAB
   ══════════════════════════════════════════════════════════════════════ */
function VenuesTab() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('all');
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [reservedId, setReservedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/venues').then(r => r.json()).then(d => { setVenues(d.venues || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const venueCats = [
    { key: 'all', label: 'All', icon: '✦' },
    { key: 'dining', label: 'Dining', icon: '🍽' },
    { key: 'lounge', label: 'Lounge', icon: '🥂' },
    { key: 'boardroom', label: 'Deal Rooms', icon: '💼' },
    { key: 'accommodations', label: 'Stay', icon: '🛏' },
    { key: 'wellness', label: 'Wellness', icon: '🧖' },
  ];

  const filtered = catFilter === 'all' ? venues : venues.filter(v => v.category === catFilter);
  const fmt = (n: number) => `₦${(n / 1000).toFixed(0)}k`;

  const reserve = (id: string) => {
    setReservingId(id);
    setTimeout(() => { setReservingId(null); setReservedId(id); setTimeout(() => setReservedId(null), 3000); }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl italic mb-1">Partner Venues</h1>
        <p className="text-cream/40 text-sm">Curated spaces we&apos;ve unlocked for you.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {venueCats.map(c => (
          <button key={c.key} onClick={() => setCatFilter(c.key)} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap shrink-0 border transition-all ${catFilter === c.key ? 'bg-gold/15 text-gold border-gold/40' : 'text-cream/40 border-white/[0.08] hover:border-white/20'}`}>
            <span>{c.icon}</span> {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="text-gold animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map(v => (
            <div key={v.id} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-gold/25 transition-all group flex flex-col">
              <div className="relative h-44 overflow-hidden">
                <img src={v.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
                <span className="absolute top-3 left-3 text-[9px] font-black uppercase tracking-[0.2em] text-gold bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-gold/20">{v.category}</span>
                {v.rating && <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-black text-gold bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full"><Star size={9} fill="currentColor" /> {Number(v.rating).toFixed(1)}</span>}
                <div className="absolute bottom-3 left-3">
                  <h3 className="font-display text-2xl italic text-cream drop-shadow">{v.name}</h3>
                  {v.partner_name && <p className="text-[9px] uppercase tracking-widest text-gold/60 font-black">by {v.partner_name}</p>}
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <p className="text-cream/40 text-sm mb-4 line-clamp-2">{v.tagline}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {v.minimum_spend && <span className="text-[9px] font-black uppercase tracking-widest text-cream/40 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06]">From {fmt(v.minimum_spend)}/person</span>}
                  {v.capacity && <span className="text-[9px] font-black uppercase tracking-widest text-cream/40 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06]">{v.capacity} guests</span>}
                </div>
                <div className="space-y-1 mb-4 text-cream/30 text-xs">
                  {v.address && <p className="flex items-center gap-1.5"><MapPin size={10} /> {v.address}</p>}
                  {v.availability && <p className="flex items-center gap-1.5"><Clock size={10} /> {v.availability}</p>}
                </div>
                <div className="mt-auto">
                  {reservedId === v.id ? (
                    <div className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-900/20 border border-green-500/25 rounded-full text-green-400 text-[10px] font-black uppercase tracking-widest"><Check size={12} /> Requested</div>
                  ) : (
                    <button onClick={() => reserve(v.id)} disabled={reservingId === v.id} className="w-full flex items-center justify-center gap-2 py-2.5 bg-cream text-obsidian rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gold transition-all disabled:opacity-50">
                      {reservingId === v.id ? <Loader2 size={12} className="animate-spin" /> : <>Reserve a Seat <ArrowRight size={11} /></>}
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
   CONNECT TAB — People nearby + Groups
   ══════════════════════════════════════════════════════════════════════ */
function ConnectTab({ location }: { location: ReturnType<typeof useCityLocation> }) {
  const { city } = location;
  const [activityGroups, setActivityGroups] = useState<any[]>([]);
  const [openToMeet, setOpenToMeet] = useState<any[]>([]);
  const [circles, setCircles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'activity' | 'open' | 'groups'>('activity');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (city) p.set('city', city);
      const [peopleRes, circlesRes] = await Promise.all([
        fetch('/api/people?' + p.toString()),
        fetch('/api/circles'),
      ]);
      const peopleData = await peopleRes.json();
      const circlesData = await circlesRes.json();
      setActivityGroups(peopleData.activity_groups || []);
      setOpenToMeet(peopleData.open_to_meet || []);
      setCircles(circlesData.circles || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [city]);

  useEffect(() => { loadData(); }, [loadData]);

  const createGroup = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/circles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDesc }),
      });
      if (res.ok) { setNewName(''); setNewDesc(''); setShowCreate(false); loadData(); }
    } catch { /* ignore */ }
    setCreating(false);
  };

  const catMeta = (key: string) => CATEGORIES.find(c => c.key === key) || CATEGORIES[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl italic mb-1">Connect</h1>
        <p className="text-cream/40 text-sm">
          {city ? `Who's out in ${city} — grouped by where they're going.` : 'People grouped by where they\'re going.'}
        </p>
      </div>

      {/* Sub tabs */}
      <div className="flex gap-1 bg-white/[0.04] rounded-full p-1 w-fit">
        {([
          { key: 'activity', label: 'By Activity' },
          { key: 'open',     label: 'Open to Meet' },
          { key: 'groups',   label: 'My Groups' },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${tab === t.key ? 'bg-gold text-obsidian shadow' : 'text-cream/40 hover:text-cream/70'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="text-gold animate-spin" /></div>
      ) : tab === 'activity' ? (
        /* ── Grouped by upcoming event ── */
        activityGroups.length === 0 ? (
          <div className="text-center py-20 text-cream/25">
            <Users size={40} className="mx-auto mb-4 opacity-40" />
            <p className="font-display text-2xl italic mb-2">No upcoming activities{city ? ` in ${city}` : ''}.</p>
            <p className="text-sm">Post one and others will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activityGroups.map((group: any) => {
              const cat = catMeta(group.category);
              const CatIcon = cat.Icon;
              const spotsLeft = group.max_guests - group.current_guests;
              return (
                <div key={group.hangout_id} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 hover:border-gold/25 transition-all">
                  {/* Location header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${cat.color}`}>
                          <CatIcon size={10} /> {cat.label}
                        </span>
                        <span className="text-cream/20 text-[9px]">·</span>
                        <span className="text-[9px] text-cream/30 font-black uppercase tracking-widest flex items-center gap-1">
                          <Clock size={9} /> {group.formatted_time} {group.formatted_date}
                        </span>
                      </div>
                      <h3 className="font-display text-xl italic leading-tight truncate">{group.title}</h3>
                      <p className="text-[10px] text-cream/35 flex items-center gap-1 mt-0.5">
                        <MapPin size={9} /> {group.location}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[9px] font-black text-cream/30 uppercase tracking-widest">
                        {spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left` : 'Full'}
                      </p>
                      {group.ticket_price != null && (
                        <p className="text-[9px] text-gold/60 font-black mt-0.5">₦{(group.ticket_price / 1000).toFixed(0)}k</p>
                      )}
                    </div>
                  </div>

                  {/* Attendee avatars + names */}
                  {group.attendees.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {group.attendees.map((a: any) => (
                        <div key={a.id} className="flex items-center gap-2 bg-white/[0.04] rounded-full px-2.5 py-1.5 border border-white/[0.06]">
                          <div className="relative">
                            <img
                              src={a.avatar_url || `https://i.pravatar.cc/32?u=${a.id}`}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            {a.verified && (
                              <div className="absolute -bottom-0.5 -right-0.5">
                                <VerifiedBadge size={10} />
                              </div>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-cream/70 whitespace-nowrap">{a.name}</span>
                          {a.tier === 'black' && (
                            <span className="text-[8px] bg-gold/15 text-gold px-1 py-0.5 rounded font-black">BLACK</span>
                          )}
                        </div>
                      ))}
                      {spotsLeft > 0 && (
                        <div className="flex items-center gap-1.5 bg-gold/10 border border-gold/25 rounded-full px-3 py-1.5 cursor-pointer hover:bg-gold/15 transition-colors">
                          <PlusSquare size={11} className="text-gold" />
                          <span className="text-[11px] font-black text-gold">Join them</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[10px] text-cream/20 italic">No attendees yet — be the first.</p>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : tab === 'open' ? (
        /* ── Open to meet ── */
        <div className="space-y-5">
          <p className="text-cream/30 text-sm">
            People in {city || 'your city'} who are open to meeting up — no specific event needed.
          </p>
          {openToMeet.length === 0 ? (
            <div className="text-center py-16 text-cream/25">
              <UserCheck size={40} className="mx-auto mb-4 opacity-40" />
              <p className="font-display text-xl italic mb-2">No one flagged as open to meet yet.</p>
              <p className="text-sm">Toggle "Open to Meet" in your Profile to appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {openToMeet.map((p: any) => (
                <div key={p.id} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 flex flex-col items-center text-center gap-3 hover:border-gold/25 hover:-translate-y-0.5 transition-all cursor-pointer group">
                  <div className="relative">
                    <img src={p.avatar_url || `https://i.pravatar.cc/80?u=${p.id}`} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-white/10 group-hover:border-gold/30 transition-colors" />
                    {p.verified && <div className="absolute -top-1 -right-1"><VerifiedBadge size={13} /></div>}
                    {p.tier === 'black' && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gold rounded-full flex items-center justify-center border border-[#0a0a0a]"><Star size={8} fill="currentColor" className="text-obsidian" /></div>}
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-tight">{p.name}</p>
                    {p.location && <p className="text-[9px] text-cream/25 mt-0.5 flex items-center gap-1 justify-center"><MapPin size={8} /> {p.location}</p>}
                    {p.bio && <p className="text-[9px] text-cream/35 mt-1 line-clamp-2">{p.bio}</p>}
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-cream/25 font-black uppercase tracking-widest">
                    <span>{p.hangouts_count || 0} activities</span>
                    {Number(p.rating) > 0 && <span className="flex items-center gap-0.5"><Star size={8} fill="currentColor" className="text-gold/50" /> {Number(p.rating).toFixed(1)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── My Groups ── */
        <div className="space-y-5">
          <p className="text-cream/30 text-sm">Your groups — people you regularly go out with.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {circles.map((c: any) => (
              <div key={c.id} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 flex flex-col items-center text-center gap-3 hover:border-gold/25 hover:-translate-y-0.5 transition-all group cursor-pointer">
                <div className="w-12 h-12 rounded-full border border-gold/20 flex items-center justify-center bg-gold/5 text-gold group-hover:scale-105 transition-transform"><Users size={20} /></div>
                <div>
                  <h4 className="font-display text-lg italic leading-tight mb-0.5">{c.name}</h4>
                  {c.description && <p className="text-[9px] text-cream/30 line-clamp-2">{c.description}</p>}
                  <span className="text-[9px] text-cream/25 uppercase tracking-widest font-black">{c.member_count || 0} members</span>
                </div>
              </div>
            ))}
            {showCreate ? (
              <div className="border border-gold/20 rounded-2xl p-4 flex flex-col gap-3 bg-white/[0.02]">
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Group name" className="bg-transparent border-b border-white/10 pb-2 text-sm focus:outline-none focus:border-gold placeholder:text-cream/15 text-cream" />
                <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What's it about?" className="bg-transparent border-b border-white/10 pb-2 text-xs focus:outline-none focus:border-gold placeholder:text-cream/15 text-cream" />
                <div className="flex gap-2">
                  <button onClick={createGroup} disabled={creating} className="flex-1 bg-gold text-obsidian text-[9px] font-black uppercase tracking-widest py-2 rounded-full disabled:opacity-50">{creating ? '…' : 'Create'}</button>
                  <button onClick={() => setShowCreate(false)} className="px-2 text-cream/30 hover:text-cream"><X size={13} /></button>
                </div>
              </div>
            ) : (
              <div onClick={() => setShowCreate(true)} className="border border-dashed border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-cream/25 hover:text-cream/50 hover:border-white/20 transition-all cursor-pointer">
                <PlusSquare size={24} />
                <span className="text-[9px] uppercase tracking-widest font-black">New Group</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   PROFILE TAB
   ══════════════════════════════════════════════════════════════════════ */
function ProfileTab() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(d => {
      if (d.user) { setUser(d.user); setEditName(d.user.name || ''); setEditBio(d.user.bio || ''); setEditLocation(d.user.location || ''); }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editName, bio: editBio, location: editLocation }) });
      const d = await res.json();
      if (res.ok && d.user) { setUser(d.user); setEditing(false); }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const d = await res.json();
      if (res.ok) {
        const u2 = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ avatar_url: d.url }) });
        const d2 = await u2.json();
        if (u2.ok && d2.user) setUser(d2.user);
      }
    } catch { /* ignore */ }
    setUploadingAvatar(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="text-gold animate-spin" /></div>;

  if (showUpgrade) return (
    <div className="max-w-2xl mx-auto pb-10">
      <button onClick={() => setShowUpgrade(false)} className="text-[9px] uppercase tracking-widest font-black text-cream/30 hover:text-gold mb-6 flex items-center gap-1.5 transition-colors">← Back</button>
      <div className="bg-white/[0.03] border border-gold/20 rounded-3xl p-8 md:p-12">
        <SectionLabel variant="dark">Tier Upgrade</SectionLabel>
        <h2 className="font-display text-4xl italic mb-3">Convivia Black</h2>
        <p className="text-cream/50 text-base mb-8">Instant venue booking, priority seats, and Black-only events in every city.</p>
        <div className="space-y-3 mb-8">
          {[
            { icon: <Zap size={16} />, title: 'Instant Venue Booking', sub: 'No 24-hour wait' },
            { icon: <Ticket size={16} />, title: 'Priority Physical Seating', sub: 'The Table & Deal Rooms' },
            { icon: <ShieldCheck size={16} />, title: 'Verified Black Badge', sub: 'Stands out in every feed' },
          ].map(b => (
            <div key={b.title} className="flex items-start gap-3 bg-white/[0.03] p-4 rounded-xl border border-white/[0.06]">
              <span className="text-gold mt-0.5">{b.icon}</span>
              <div><p className="text-sm font-bold">{b.title}</p><p className="text-[10px] text-cream/30 uppercase tracking-wider font-black mt-0.5">{b.sub}</p></div>
            </div>
          ))}
        </div>
        <button className="w-full bg-gold text-obsidian py-4 rounded-full font-black uppercase tracking-[0.18em] text-[11px] hover:bg-gold-light transition-all flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(201,168,76,0.3)]">
          <Star size={15} fill="currentColor" /> Subscribe to Black
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-3xl p-8 md:p-10">

        {/* Avatar + name */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
          <div className="relative shrink-0">
            <label className="cursor-pointer relative block">
              <img src={user?.avatar_url || `https://i.pravatar.cc/100?u=${user?.id}`} alt="" className="w-24 h-24 rounded-full border-2 border-gold/40 object-cover" />
              <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
              {uploadingAvatar ? (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center"><Loader2 size={20} className="text-gold animate-spin" /></div>
              ) : (
                <div className="absolute inset-0 bg-black/0 hover:bg-black/40 rounded-full flex items-center justify-center transition-colors opacity-0 hover:opacity-100"><Camera size={18} className="text-white" /></div>
              )}
            </label>
            {user?.verified && <div className="absolute -bottom-1 -right-1"><VerifiedBadge size={18} /></div>}
          </div>

          <div className="flex-1 text-center sm:text-left w-full">
            {editing ? (
              <div className="space-y-3">
                <input value={editName} onChange={e => setEditName(e.target.value)} className="bg-transparent border-b border-white/10 pb-2 text-2xl font-display italic focus:outline-none focus:border-gold w-full" />
                <textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={2} className="bg-transparent border-b border-white/10 pb-2 text-sm focus:outline-none focus:border-gold w-full resize-none text-cream/50" placeholder="Tell people about you…" />
                <input value={editLocation} onChange={e => setEditLocation(e.target.value)} className="bg-transparent border-b border-white/10 pb-2 text-sm focus:outline-none focus:border-gold w-full text-cream/50" placeholder="City" />
                <div className="flex gap-3 pt-1">
                  <button onClick={save} disabled={saving} className="bg-gold text-obsidian px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
                  <button onClick={() => setEditing(false)} className="text-cream/30 hover:text-cream text-[10px] font-black uppercase tracking-widest transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                  <h2 className="font-display text-3xl italic">{user?.name}</h2>
                  {user?.verified && <VerifiedBadge size={16} />}
                  <button onClick={() => setEditing(true)} className="text-cream/25 hover:text-gold transition-colors ml-1"><Edit3 size={14} /></button>
                </div>
                <p className="text-cream/50 text-sm mb-1 max-w-sm">{user?.bio || 'No bio yet.'}</p>
                {user?.location && <p className="text-cream/25 text-xs flex items-center gap-1 justify-center sm:justify-start"><MapPin size={10} /> {user.location}</p>}
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[{ val: user?.hangouts_count || 0, label: 'Activities' }, { val: user?.connections_count || 0, label: 'Connections' }, { val: user?.circles_count || 0, label: 'Groups' }].map(s => (
            <div key={s.label} className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4 flex flex-col items-center hover:border-gold/20 transition-colors">
              <span className="text-2xl md:text-3xl font-display text-gold italic mb-1">{s.val}</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-cream/30 font-black">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Open to Meet toggle */}
        <div className="mb-3 flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.07] rounded-2xl">
          <div className="flex items-center gap-3">
            <UserCheck size={18} className={user?.open_to_meet ? 'text-gold' : 'text-cream/30'} />
            <div>
              <p className="text-sm font-bold">Open to Meet</p>
              <p className="text-[10px] text-cream/30 uppercase tracking-wider font-black">
                {user?.open_to_meet ? 'Visible in Connect tab' : 'Hidden from Connect tab'}
              </p>
            </div>
          </div>
          <button
            onClick={async () => {
              const next = !user.open_to_meet;
              setUser((u: any) => ({ ...u, open_to_meet: next }));
              await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ open_to_meet: next }) });
            }}
            className={`relative w-11 h-6 rounded-full transition-colors ${user?.open_to_meet ? 'bg-gold' : 'bg-white/10'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${user?.open_to_meet ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Verification stub */}
        {!user?.verified && (
          <div className="mb-4 flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.07] rounded-2xl">
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-cream/30" />
              <div>
                <p className="text-sm font-bold">Get Verified</p>
                <p className="text-[10px] text-cream/30 uppercase tracking-wider font-black">Verify your identity — coming soon</p>
              </div>
            </div>
            <button disabled className="text-[9px] text-cream/20 border border-white/[0.08] px-3 py-1.5 rounded-full font-black uppercase tracking-widest cursor-not-allowed">Coming Soon</button>
          </div>
        )}

        {/* Tier */}
        <div onClick={() => setShowUpgrade(true)} className="mb-4 flex items-center justify-between p-4 bg-gradient-to-r from-white/[0.03] to-white/[0.01] border border-gold/20 rounded-2xl cursor-pointer group hover:border-gold/40 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gold rounded-full" />
            <div>
              <p className="text-sm font-bold">{user?.tier === 'black' ? 'Convivia Black' : 'Convivia Standard'}</p>
              {user?.tier !== 'black' && <p className="text-[10px] text-gold font-black tracking-widest uppercase">Upgrade Available</p>}
            </div>
          </div>
          {user?.tier !== 'black' ? (
            <span className="text-[9px] text-obsidian bg-gold px-3 py-1.5 rounded-full font-black uppercase tracking-widest group-hover:scale-105 transition-transform">Unlock Black</span>
          ) : (
            <span className="text-[9px] text-gold font-black uppercase tracking-widest">Active</span>
          )}
        </div>

        <button onClick={() => { window.location.href = '/api/auth/signout'; }} className="w-full flex items-center justify-center gap-2 p-3.5 border border-white/[0.07] rounded-xl text-cream/30 hover:text-red-400 hover:border-red-400/20 transition-colors text-[10px] uppercase tracking-widest font-black">
          <LogOut size={13} /> Sign Out
        </button>
      </div>
    </div>
  );
}
