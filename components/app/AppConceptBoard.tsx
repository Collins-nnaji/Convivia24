'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, PlusSquare, CircleDashed, User as UserIcon, Zap,
  Clock, Users, Star, ArrowRight, Building2, Ticket,
  MapPin, Camera, Calendar, LogOut, Edit3, Check, X, Loader2
} from 'lucide-react';
import ConviviumCard from '@/components/ConviviumCard';
import { SectionLabel } from '@/components/ui/SectionLabel';

/* ══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════ */
export function AppConceptBoard({ initialUser }: { initialUser?: any }) {
  const [activeTab, setActiveTab] = useState<'discover' | 'host' | 'venues' | 'circles' | 'profile'>('venues');
  
  const renderContent = () => {
    switch(activeTab) {
      case 'discover':
        return <DiscoverTab currentUser={initialUser} />;
      case 'host':
        return <HostTab />;
      case 'venues':
        return <VenuesTab />;
      case 'circles':
        return <CirclesTab />;
      case 'profile':
        return <ProfileTab />;
    }
  };

  return (
    <div className="flex flex-col h-full w-full mx-auto relative text-cream">
      {/* ────────────────── TOP NAV (DESKTOP) ────────────────── */}
      <header className="hidden md:flex items-center justify-between px-10 py-6 border-b border-cream/10 backdrop-blur-sm bg-transparent sticky top-0 z-50">
        <div className="w-[120px]" />
        
        <nav className="flex items-center gap-8">
          <DesktopNavLink label="Discover" icon={<Compass size={18} />} active={activeTab === 'discover'} onClick={() => setActiveTab('discover')} />
          <DesktopNavLink label="Host" icon={<PlusSquare size={18} />} active={activeTab === 'host'} onClick={() => setActiveTab('host')} />
          <DesktopNavLink label="Venues" icon={<Building2 size={18} />} active={activeTab === 'venues'} onClick={() => setActiveTab('venues')} />
          <DesktopNavLink label="Circles" icon={<CircleDashed size={18} />} active={activeTab === 'circles'} onClick={() => setActiveTab('circles')} />
          <DesktopNavLink label="Profile" icon={<UserIcon size={18} />} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </nav>

        <button className="bg-gold text-obsidian px-6 py-2.5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-gold-light hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all flex items-center gap-2">
          <Zap size={14} fill="currentColor" /> Pulse
        </button>
      </header>

      {/* ────────────────── MAIN CONTENT AREA ────────────────── */}
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

      {/* ────────────────── BOTTOM NAV (MOBILE) ────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#0d0d0d]/95 backdrop-blur-xl border-t border-cream/5 px-6 flex items-center justify-between pb-4 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <NavIcon icon={<Compass size={24} />} active={activeTab === 'discover'} onClick={() => setActiveTab('discover')} />
        <NavIcon icon={<PlusSquare size={24} />} active={activeTab === 'host'} onClick={() => setActiveTab('host')} />
        
        <div className="relative -top-5">
          <button onClick={() => setActiveTab('venues')} className={`w-14 h-14 bg-gradient-to-br from-gold-light to-gold-dark rounded-full flex items-center justify-center text-[#0a0a0a] shadow-[0_4px_20px_rgba(201,168,76,0.4)] hover:scale-105 transition-transform ${activeTab === 'venues' ? 'ring-4 ring-gold/30' : ''}`}>
            <Building2 size={24} fill="currentColor" className="text-obsidian opacity-80" />
          </button>
        </div>
        
        <NavIcon icon={<CircleDashed size={24} />} active={activeTab === 'circles'} onClick={() => setActiveTab('circles')} />
        <NavIcon icon={<UserIcon size={24} />} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      </div>
    </div>
  );
}

/* ══ NAV HELPERS ══ */
function DesktopNavLink({ label, icon, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 transition-all ${active ? 'text-gold font-bold drop-shadow-[0_0_8px_rgba(201,168,76,0.4)]' : 'text-cream/50 hover:text-cream'} relative`}
    >
      {icon}
      <span className="text-xs uppercase tracking-widest">{label}</span>
      {active && <span className="absolute -bottom-[29px] left-0 right-0 h-[3px] bg-gold rounded-t-full shadow-[0_0_10px_#c9a84c]"></span>}
    </button>
  );
}
function NavIcon({ icon, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`p-2 transition-colors ${active ? 'text-gold drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]' : 'text-cream/40 hover:text-cream/70'}`}
    >
      {icon}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   DISCOVER TAB — Live from the API
   ══════════════════════════════════════════════════════════════════════ */
function DiscoverTab({ currentUser }: any) {
  const [filter, setFilter] = useState<'all' | 'open' | 'curated'>('all');
  const [hangouts, setHangouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/hangouts')
      .then(r => r.json())
      .then(data => {
        setHangouts(data.hangouts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleJoin = async (hangoutId: string) => {
    setJoiningId(hangoutId);
    try {
      const res = await fetch(`/api/hangouts/${hangoutId}/join`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        // Refresh hangouts
        const r = await fetch('/api/hangouts');
        const refreshed = await r.json();
        setHangouts(refreshed.hangouts || []);
      } else {
        alert(data.error || 'Could not join.');
      }
    } catch {
      alert('Network error. Try again.');
    } finally {
      setJoiningId(null);
    }
  };

  const filtered = hangouts.filter((h: any) => filter === 'all' || h.type === filter);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6">
        <div>
          <h1 className="font-display text-5xl md:text-6xl italic mb-2">Tonight&apos;s Tables</h1>
          <p className="text-cream/50 text-base md:text-lg">Curated gatherings happening in the next 24 hours.</p>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
          <FilterChip label="All Tables" active={filter === 'all'} onClick={() => setFilter('all')} />
          <FilterChip label="Curated Only" active={filter === 'curated'} onClick={() => setFilter('curated')} color="gold" />
          <FilterChip label="Open List" active={filter === 'open'} onClick={() => setFilter('open')} color="blue" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-gold animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-cream/30">
          <Compass size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-display text-2xl italic mb-2">No tables tonight.</p>
          <p className="text-sm">Be the first to host one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((h: any) => {
            const isCurated = h.type === 'curated';
            const badgeClass = isCurated 
              ? 'bg-gold/10 text-gold border-gold/20' 
              : 'bg-[#1a3a5f]/30 text-[#4da6ff] border-[#4da6ff]/20';
            
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
                  <h3 className="font-display text-3xl mb-2">{h.title}</h3>
                  <p className="text-cream/60 text-sm mb-6 line-clamp-2">{h.vibe}</p>
                  
                  <div className="space-y-2 text-sm text-cream/50 mb-8">
                    <div className="flex items-center gap-2"><Clock size={14}/> {h.formatted_time || 'TBD'} <span className="text-xs ml-1 font-bold text-cream/20">• {h.formatted_date}</span></div>
                    <div className="flex items-center gap-2"><MapPin size={14}/> {h.location}</div>
                    {h.host_name && (
                      <div className="flex items-center gap-2 text-gold/60">
                        <Star size={14}/> Hosted by {h.host_name}
                        {h.host_tier === 'black' && <span className="text-[8px] bg-gold/20 text-gold px-1.5 py-0.5 rounded font-black">BLACK</span>}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-cream/5 pt-5 mt-auto">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {h.attendees?.slice(0,4).map((a:any) => (
                        <img key={a.user_id} src={a.avatar_url} className="w-8 h-8 rounded-full border-2 border-obsidian" alt=""/>
                      ))}
                    </div>
                    <span className="text-xs text-cream/40 font-bold">{h.current_guests} / {h.max_guests}</span>
                  </div>
                  <button 
                    onClick={() => handleJoin(h.id)}
                    disabled={joiningId === h.id}
                    className="text-[10px] uppercase font-black tracking-widest text-obsidian bg-cream hover:bg-gold hover:text-obsidian px-5 py-2.5 rounded-full transition-colors flex items-center gap-1.5 shadow-md group-hover:shadow-gold/20 disabled:opacity-50"
                  >
                    {joiningId === h.id ? <Loader2 size={12} className="animate-spin" /> : <>Request <ArrowRight size={12} className="mb-0.5" /></>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick, color = 'cream' }: any) {
  const baseColors: Record<string, string> = {
    cream: active ? 'bg-cream text-obsidian font-bold shadow-[0_0_15px_rgba(245,240,232,0.3)]' : 'bg-obsidian-200 text-cream/60 border border-cream/10 hover:border-cream/30',
    gold: active ? 'bg-gold/20 text-gold border border-gold/50 shadow-[0_0_15px_rgba(201,168,76,0.2)]' : 'bg-obsidian-200 text-gold/60 border border-gold/10 hover:border-gold/30',
    blue: active ? 'bg-[#1a3a5f]/30 text-[#4da6ff] border border-[#4da6ff]/50 shadow-[0_0_15px_rgba(77,166,255,0.2)]' : 'bg-obsidian-200 text-[#4da6ff]/60 border border-[#4da6ff]/10 hover:border-[#4da6ff]/30'
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
function HostTab() {
  const [size, setSize] = useState(6);
  const [type, setType] = useState('curated');
  const [title, setTitle] = useState('');
  const [vibe, setVibe] = useState('');
  const [location, setLocation] = useState('');
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
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        setCoverImage(data.url);
      } else {
        setError(data.error || 'Upload failed.');
      }
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
        body: JSON.stringify({ title, vibe, type, event_time, location, max_guests: size, cover_image: coverImage }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to create hangout.');
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
        <div className="w-16 h-16 border border-gold/30 flex items-center justify-center mx-auto mb-6 rounded-full bg-gold/10">
          <Check size={28} className="text-gold" />
        </div>
        <h2 className="font-display text-4xl italic text-cream mb-3">Your table is set.</h2>
        <p className="text-cream/50 text-base mb-8">Your hangout is live on the Discover feed. Guests can now request to join.</p>
        <button onClick={() => { setSuccess(false); setTitle(''); setVibe(''); setLocation(''); setEventDate(''); setEventTime(''); setCoverImage(null); }} className="text-gold text-[10px] uppercase tracking-widest font-black hover:text-gold-light transition-colors">
          Host Another →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto h-full flex flex-col">
      <div className="mb-8 md:mb-12 text-center">
        <h1 className="font-display text-5xl md:text-6xl italic mb-2">Host</h1>
        <p className="text-cream/50 text-base md:text-lg">Set the table. Define the energy. The right people will come.</p>
      </div>

      <div className="bg-obsidian-100/60 backdrop-blur-lg border border-cream/10 rounded-[40px] p-8 md:p-12 shadow-2xl flex-1">
        <div className="space-y-10">
          {/* Title */}
          <div>
            <label className="text-[10px] md:text-xs font-black text-cream/40 uppercase tracking-[0.2em] block mb-3">The Occasion</label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Founders After Dark" 
              className="w-full bg-transparent border-b border-cream/20 pb-3 text-2xl md:text-3xl focus:outline-none focus:border-gold placeholder:text-cream/10 transition-colors font-display italic" 
            />
          </div>

          {/* Vibe */}
          <div>
            <label className="text-[10px] md:text-xs font-black text-cream/40 uppercase tracking-[0.2em] block mb-3">The Energy</label>
            <input 
              type="text" 
              value={vibe}
              onChange={e => setVibe(e.target.value)}
              placeholder="e.g. Whisky, ideas, and honest conversation." 
              className="w-full bg-transparent border-b border-cream/20 pb-3 text-base focus:outline-none focus:border-gold placeholder:text-cream/10 transition-colors" 
            />
          </div>

          {/* Location */}
          <div>
            <label className="text-[10px] md:text-xs font-black text-cream/40 uppercase tracking-[0.2em] block mb-3">Where</label>
            <input 
              type="text" 
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. The Table, Victoria Island" 
              className="w-full bg-transparent border-b border-cream/20 pb-3 text-base focus:outline-none focus:border-gold placeholder:text-cream/10 transition-colors" 
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] md:text-xs font-black text-cream/40 uppercase tracking-[0.2em] block mb-3">
                <Calendar size={12} className="inline mr-1" /> Date
              </label>
              <input 
                type="date"
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                className="w-full bg-transparent border-b border-cream/20 pb-3 text-base focus:outline-none focus:border-gold transition-colors text-cream [color-scheme:dark]" 
              />
            </div>
            <div>
              <label className="text-[10px] md:text-xs font-black text-cream/40 uppercase tracking-[0.2em] block mb-3">
                <Clock size={12} className="inline mr-1" /> Time
              </label>
              <input 
                type="time"
                value={eventTime}
                onChange={e => setEventTime(e.target.value)}
                className="w-full bg-transparent border-b border-cream/20 pb-3 text-base focus:outline-none focus:border-gold transition-colors text-cream [color-scheme:dark]" 
              />
            </div>
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="text-[10px] md:text-xs font-black text-cream/40 uppercase tracking-[0.2em] block mb-3">
              <Camera size={12} className="inline mr-1" /> Cover Image <span className="text-cream/20">(optional)</span>
            </label>
            {coverImage ? (
              <div className="relative rounded-2xl overflow-hidden h-40">
                <img src={coverImage} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setCoverImage(null)} className="absolute top-2 right-2 bg-obsidian/80 text-cream p-1.5 rounded-full hover:bg-red-900 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 border border-dashed border-cream/20 rounded-2xl p-6 cursor-pointer hover:border-gold/40 transition-colors text-cream/30 hover:text-cream/60">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                {uploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                <span className="text-sm">{uploading ? 'Uploading...' : 'Add a cover photo'}</span>
              </label>
            )}
          </div>

          {/* Track Type */}
          <div>
            <label className="text-[10px] md:text-xs font-black text-cream/40 uppercase tracking-[0.2em] block mb-4 mt-8">Format</label>
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
          </div>

          {/* Size */}
          <div>
             <label className="text-[10px] md:text-xs font-black text-cream/40 uppercase tracking-[0.2em] block mb-6 flex justify-between items-end">
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

        {error && (
          <p className="text-red-400 text-sm mt-6 text-center">{error}</p>
        )}

        <button 
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-gold text-obsidian py-5 rounded-full font-black uppercase tracking-[0.2em] text-[11px] mt-12 hover:bg-gold-light hover:shadow-[0_0_30px_rgba(201,168,76,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <><span>Set the Table</span> <ArrowRight size={16} /></>}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   VENUES TAB — Partner Venue Marketplace (Homepage)
   ══════════════════════════════════════════════════════════════════════ */
function VenuesTab() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [reservedId, setReservedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/venues')
      .then(r => r.json())
      .then(data => {
        setVenues(data.venues || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = [
    { key: 'all', label: 'All Spaces', icon: '✦' },
    { key: 'dining', label: 'Dining', icon: '🍽' },
    { key: 'lounge', label: 'Lounge', icon: '🥂' },
    { key: 'boardroom', label: 'Deal Rooms', icon: '💼' },
    { key: 'accommodations', label: 'Stay', icon: '🛏' },
    { key: 'wellness', label: 'Wellness', icon: '🧖' },
  ];

  const filtered = categoryFilter === 'all' ? venues : venues.filter(v => v.category === categoryFilter);

  const handleReserve = (venueId: string) => {
    setReservingId(venueId);
    setTimeout(() => {
      setReservingId(null);
      setReservedId(venueId);
      setTimeout(() => setReservedId(null), 3000);
    }, 1500);
  };

  const formatSpend = (amount: number) => {
    return `₦${(amount / 1000).toFixed(0)}k`;
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="mb-6 md:mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60 mb-3">Partner Venues</p>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl italic mb-3">Find Your Table.</h1>
        <p className="text-cream/50 text-base md:text-lg max-w-2xl">
          Curated seats at Lagos and Abuja&apos;s finest spaces. We don&apos;t own the venues — we unlock them for you.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setCategoryFilter(cat.key)}
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

      {/* Venue Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-gold animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-cream/30">
          <Building2 size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-display text-2xl italic mb-2">No venues in this category yet.</p>
          <p className="text-sm">Check back soon — we&apos;re always adding new partner spaces.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {filtered.map((venue) => (
            <div key={venue.id} className="bg-obsidian-100/50 backdrop-blur-md rounded-[28px] overflow-hidden border border-cream/10 shadow-xl group hover:border-gold/30 transition-all duration-300 flex flex-col">
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img src={venue.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-transparent" />

                {/* Top badges */}
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

                {/* Bottom info overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-display text-2xl md:text-3xl italic text-cream mb-1 drop-shadow-lg">{venue.name}</h3>
                  {venue.partner_name && (
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gold/70">
                      Powered by {venue.partner_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <p className="text-cream/50 text-sm leading-relaxed mb-5 line-clamp-2">{venue.tagline}</p>

                {/* Info chips */}
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

                {/* Address & Availability */}
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

                {/* Reserve Button */}
                <div className="mt-auto">
                  {reservedId === venue.id ? (
                    <div className="w-full flex items-center justify-center gap-2 py-3 bg-green-900/30 border border-green-500/30 rounded-full text-green-400 text-[10px] font-black uppercase tracking-widest">
                      <Check size={14} /> Reservation Requested
                    </div>
                  ) : (
                    <button
                      onClick={() => handleReserve(venue.id)}
                      disabled={reservingId === venue.id}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-cream text-obsidian rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gold hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all disabled:opacity-50"
                    >
                      {reservingId === venue.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <>Reserve a Seat <ArrowRight size={12} /></>
                      )}
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
   CIRCLES TAB — Real data from API
   ══════════════════════════════════════════════════════════════════════ */
function CirclesTab() {
  const [circles, setCircles] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/circles');
      const data = await res.json();
      setCircles(data.circles || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/circles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDesc }),
      });
      if (res.ok) {
        setNewName('');
        setNewDesc('');
        setShowCreate(false);
        loadData();
      }
    } catch { /* ignore */ }
    setCreating(false);
  };

  return (
    <div className="space-y-10">
      <div className="mb-8 md:mb-10 text-center md:text-left">
        <h1 className="font-display text-5xl md:text-6xl italic mb-2">Circles</h1>
        <p className="text-cream/50 text-base md:text-lg">Your inner networks. Curated, trusted, active.</p>
      </div>

      <div className="lg:col-span-8 space-y-6">
        <h3 className="text-[10px] md:text-xs font-black text-gold uppercase tracking-[0.2em] flex items-center gap-2 border-b border-cream/5 pb-4">
          Your Circles <span className="bg-gold/20 text-gold px-2 py-0.5 rounded text-[10px]">{circles.length}</span>
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={24} className="text-gold animate-spin" />
          </div>
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
            
            {/* Create New Circle */}
            {showCreate ? (
              <div className="border border-gold/30 rounded-3xl p-5 flex flex-col gap-3 bg-obsidian-100/60">
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Circle name"
                  className="bg-transparent border-b border-cream/20 pb-2 text-sm focus:outline-none focus:border-gold placeholder:text-cream/20 text-cream"
                />
                <input
                  type="text"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="What's it about?"
                  className="bg-transparent border-b border-cream/20 pb-2 text-xs focus:outline-none focus:border-gold placeholder:text-cream/20 text-cream"
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={handleCreate} disabled={creating} className="flex-1 bg-gold text-obsidian text-[9px] font-black uppercase tracking-widest py-2 rounded-full disabled:opacity-50">
                    {creating ? '...' : 'Create'}
                  </button>
                  <button onClick={() => setShowCreate(false)} className="px-3 py-2 text-cream/40 hover:text-cream text-[9px]">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => setShowCreate(true)}
                className="border border-dashed border-cream/20 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-3 text-cream/30 hover:text-cream hover:border-cream/40 transition-colors cursor-pointer bg-cream/5 hover:bg-cream/10"
              >
                <PlusSquare size={28} className="mb-1" />
                <span className="text-[10px] uppercase tracking-widest font-black">New Circle</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   PROFILE TAB — Real authenticated user
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
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          setEditName(data.user.name || '');
          setEditBio(data.user.bio || '');
          setEditLocation(data.user.location || '');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
      if (res.ok && data.user) {
        setUser(data.user);
        setEditing(false);
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        // Update profile with new avatar
        const updateRes = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar_url: data.url }),
        });
        const updateData = await updateRes.json();
        if (updateRes.ok && updateData.user) setUser(updateData.user);
      }
    } catch { /* ignore */ }
    setUploadingAvatar(false);
  };

  const handleSignOut = () => {
    window.location.href = '/api/auth/signout';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="text-gold animate-spin" />
      </div>
    );
  }

  // Upgrade screen
  if (showUpgrade) {
    return (
      <div className="pt-4 pb-20 animate-[fade-in-up_0.3s_ease-out]">
        <button onClick={() => setShowUpgrade(false)} className="text-[10px] uppercase tracking-widest font-black text-cream/50 hover:text-gold mb-8 flex items-center gap-2">
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
                <SectionLabel variant="dark">Tier Upgrade</SectionLabel>
                <h2 className="font-display text-4xl sm:text-5xl italic text-cream mb-4">Convivia Black</h2>
                <p className="text-cream/60 text-base leading-relaxed mb-10 max-w-lg">
                  Skip the queue. Instant approval on curated matches, priority Deal Room access, and frictionless booking across Lagos, Abuja, and London.
                </p>

                <div className="space-y-4 mb-10 text-left">
                  <div className="flex items-start gap-3 bg-obsidian-100 p-4 rounded-2xl border border-cream/5">
                    <Zap size={18} className="text-gold shrink-0 mt-0.5" />
                    <div><p className="text-sm font-bold">Instant Venue Booking</p><p className="text-[10px] text-cream/40 mt-1 uppercase tracking-wider font-bold">No 24-hour wait</p></div>
                  </div>
                  <div className="flex items-start gap-3 bg-obsidian-100 p-4 rounded-2xl border border-cream/5">
                    <Ticket size={18} className="text-gold shrink-0 mt-0.5" />
                    <div><p className="text-sm font-bold">Priority Physical Seating</p><p className="text-[10px] text-cream/40 mt-1 uppercase tracking-wider font-bold">The Table & Deal Rooms</p></div>
                  </div>
                </div>

                <button className="w-full md:w-auto bg-gradient-to-r from-gold to-gold-dark text-obsidian px-10 py-4 rounded-full font-black uppercase tracking-[0.2em] text-[11px] hover:scale-105 shadow-[0_0_30px_rgba(201,168,76,0.3)] transition-all flex items-center justify-center gap-2 mx-auto lg:mx-0">
                  <Star size={16} fill="currentColor"/> Subscribe to Black
                </button>
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
            <div className="relative mb-4 group cursor-pointer">
              <div className="absolute inset-0 bg-gold/20 rounded-full blur-2xl group-hover:bg-gold/30 transition-colors" />
              <label className="cursor-pointer">
                <img src={user?.avatar_url} alt="" className="w-32 h-32 md:w-36 md:h-36 rounded-full border-[3px] border-gold relative z-10 object-cover shadow-2xl" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-obsidian/60 rounded-full flex items-center justify-center z-20">
                    <Loader2 size={24} className="text-gold animate-spin" />
                  </div>
                )}
              </label>
              <div className="absolute -bottom-3 relative z-20 bg-gold text-obsidian px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mx-auto w-max flex items-center gap-1.5 shadow-lg border border-gold-light">
                <Star size={12} fill="currentColor"/> {user?.rating} Rating
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left w-full">
            {editing ? (
              <div className="space-y-4 mb-8">
                <input value={editName} onChange={e => setEditName(e.target.value)} className="bg-transparent border-b border-cream/20 pb-2 text-3xl font-display italic focus:outline-none focus:border-gold w-full" />
                <textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={3} className="bg-transparent border-b border-cream/20 pb-2 text-base focus:outline-none focus:border-gold w-full resize-none text-cream/60" placeholder="Tell the table about you..." />
                <input value={editLocation} onChange={e => setEditLocation(e.target.value)} className="bg-transparent border-b border-cream/20 pb-2 text-sm focus:outline-none focus:border-gold w-full text-cream/60" placeholder="City" />
                <div className="flex gap-3">
                  <button onClick={handleSave} disabled={saving} className="bg-gold text-obsidian px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditing(false)} className="text-cream/40 hover:text-cream text-[10px] font-black uppercase tracking-widest">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3 justify-center md:justify-start">
                  <h2 className="font-display text-4xl md:text-5xl italic">{user?.name}</h2>
                  <button onClick={() => setEditing(true)} className="text-cream/30 hover:text-gold transition-colors">
                    <Edit3 size={16} />
                  </button>
                </div>
                <p className="text-cream/60 text-base max-w-md mx-auto md:mx-0 leading-relaxed mb-2">{user?.bio || 'No bio yet.'}</p>
                {user?.location && <p className="text-cream/30 text-sm mb-8 flex items-center gap-1 justify-center md:justify-start"><MapPin size={12} /> {user.location}</p>}
              </>
            )}

            <div className="grid grid-cols-3 gap-4 md:gap-6 w-full mb-10">
              <div className="bg-obsidian-100 border border-cream/5 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden group hover:border-gold/30 transition-colors">
                <span className="text-3xl md:text-4xl font-display text-gold italic mb-2">{user?.hangouts_count || 0}</span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-cream/40 font-black">Hangouts</span>
              </div>
              <div className="bg-obsidian-100 border border-cream/5 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden group hover:border-gold/30 transition-colors">
                <span className="text-3xl md:text-4xl font-display text-gold italic mb-2">{user?.connections_count || 0}</span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-cream/40 font-black">Connections</span>
              </div>
              <div className="bg-obsidian-100 border border-cream/5 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden group hover:border-gold/30 transition-colors">
                <span className="text-3xl md:text-4xl font-display text-gold italic mb-2">{user?.circles_count || 0}</span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-cream/40 font-black">Circles</span>
              </div>
            </div>

            <div className="space-y-4">
              <div 
                onClick={() => setShowUpgrade(true)}
                className="flex items-center justify-between p-6 bg-gradient-to-r from-obsidian-100 to-obsidian-200 rounded-[24px] border border-gold/30 relative overflow-hidden group cursor-pointer"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gold" />
                <div className="flex flex-col">
                   <span className="text-base font-bold tracking-wide">{user?.tier === 'black' ? 'Convivia Black' : 'Convivia Standard'}</span>
                   {user?.tier !== 'black' && <span className="text-[10px] text-gold font-black tracking-widest uppercase mt-1">Upgrade Available</span>}
                </div>
                {user?.tier !== 'black' ? (
                  <span className="text-[10px] uppercase text-obsidian bg-gold font-black tracking-widest px-4 py-2 rounded-md shadow-[0_0_15px_rgba(201,168,76,0.3)] group-hover:scale-105 transition-transform">Unlock Black</span>
                ) : (
                  <span className="text-[10px] uppercase text-gold font-black tracking-widest">Active</span>
                )}
              </div>

              {/* Sign Out */}
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 p-4 border border-cream/10 rounded-2xl text-cream/40 hover:text-red-400 hover:border-red-400/30 transition-colors text-[10px] uppercase tracking-widest font-black"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
