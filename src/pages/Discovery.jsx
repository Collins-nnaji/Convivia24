import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, SlidersHorizontal, ArrowUpRight, ArrowRight, Zap, MapPin, 
  TrendingUp, Star, Heart, Share2, Clock, Users, 
  Sparkles, Navigation2, Calendar, LayoutGrid, List,
  ChevronRight, Info, Map as MapIcon, Bookmark, X, ShieldCheck, Award
} from 'lucide-react';

const Discovery = () => {
  const [activeTab, setActiveTab] = useState('experiences'); // 'experiences' or 'vault'
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['All', 'Dining', 'Wellness', 'Nightlife', 'Fitness', 'Art', 'Business', 'Social'];

  const feedItems = [
    { 
      id: 1, 
      title: "Secret Pasta Night", 
      cat: "Dining", 
      img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1000&auto=format&fit=crop", 
      price: 25000, 
      time: "Tonight, 8 PM", 
      location: "Victoria Island",
      tags: ["Hidden Gem", "Culinary"], 
      attendees: 12, 
      compatibility: 85,
      featured: true,
      rating: 4.9,
      venue: "The Italian Table",
      reason: "High compatibility with your food & networking preferences."
    },
    { 
      id: 2, 
      title: "Deep House Yoga", 
      cat: "Wellness", 
      img: "https://images.unsplash.com/photo-1545201071-75f038ce1ed7?q=80&w=1000&auto=format&fit=crop", 
      price: 5000, 
      time: "Sat, 10 AM", 
      location: "Lekki Phase 1",
      tags: ["Wellness", "High Vibe"], 
      attendees: 15, 
      compatibility: 78,
      rating: 4.7,
      venue: "Zen Studio",
      reason: "Matches your Saturday wellness routine."
    },
    { 
      id: 3, 
      title: "Community Beach Cleanup", 
      cat: "Social", 
      img: "https://images.unsplash.com/photo-1618477462146-050d2977d422?q=80&w=1000&auto=format&fit=crop", 
      price: 0, 
      time: "Sat, 8 AM", 
      location: "Landmark Beach",
      tags: ["Impact", "Social"], 
      attendees: 42, 
      compatibility: 92,
      rating: 4.8,
      venue: "Landmark Beach",
      reason: "Highly recommended for community-driven social impact."
    },
    { 
      id: 4, 
      title: "Rooftop HIIT", 
      cat: "Fitness", 
      img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop", 
      price: 7000, 
      time: "Sun, 8 AM", 
      location: "Victoria Island",
      tags: ["Active", "Views"], 
      attendees: 20, 
      compatibility: 88,
      rating: 4.6,
      venue: "The Rise Gym",
      reason: "Popular among active city professionals."
    },
    { 
      id: 5, 
      title: "Vinyl Only Session", 
      cat: "Nightlife", 
      img: "https://images.unsplash.com/photo-1459749411177-042180ceea72?q=80&w=1000&auto=format&fit=crop", 
      price: 10000, 
      time: "Sun, 10 PM", 
      location: "Lekki Phase 1",
      tags: ["Underground", "Culture"], 
      attendees: 18, 
      compatibility: 82,
      rating: 4.9,
      venue: "The Groove Loft",
      reason: "Perfect for discovering underground music culture."
    },
    {
      id: 6,
      title: "The Jazz Cave",
      cat: "Nightlife",
      img: "https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=1000&auto=format&fit=crop",
      price: 12000,
      time: "Fri, 9 PM",
      location: "Ikoyi",
      tags: ["Live Music", "Intimate"],
      attendees: 24,
      compatibility: 91,
      rating: 4.9,
      venue: "Blue Note Lagos",
      reason: "Matched: 4 people from your circle are going."
    },
    {
      id: 7,
      title: "Founder's Networking",
      cat: "Business",
      img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000&auto=format&fit=crop",
      price: 0,
      time: "Tue, 6 PM",
      location: "Victoria Island",
      tags: ["Tech", "Ambitious"],
      attendees: 35,
      compatibility: 94,
      rating: 4.8,
      venue: "The Co-Work Hub",
      reason: "High professional synergy with attendees."
    },
    {
      id: 8,
      title: "Artisanal Coffee Expo",
      cat: "Dining",
      img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1000&auto=format&fit=crop",
      price: 3500,
      time: "Sat, 9 AM",
      location: "Victoria Island",
      tags: ["Coffee", "Lifestyle"],
      attendees: 45,
      compatibility: 76,
      rating: 4.5,
      venue: "The Roastery",
      reason: "Matches your 'Lifestyle' & 'Dining' interests."
    },
    {
      id: 9,
      title: "Midnight Gallery Tour",
      cat: "Art",
      img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1000&auto=format&fit=crop",
      price: 15000,
      time: "Sat, 11 PM",
      location: "Ikoyi",
      tags: ["Exclusive", "Art"],
      attendees: 10,
      compatibility: 88,
      rating: 4.9,
      venue: "Noir Gallery",
      reason: "Intimate circle of art enthusiasts matching your profile."
    },
    {
      id: 10,
      title: "Rooftop Yoga Flow",
      cat: "Wellness",
      img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&auto=format&fit=crop",
      price: 0,
      time: "Sun, 7 AM",
      location: "Lekki Phase 1",
      tags: ["Morning", "Wellness"],
      attendees: 28,
      compatibility: 83,
      rating: 4.7,
      venue: "Skyline Lounge",
      reason: "Start your Sunday with a high-vibe circle."
    },
    {
      id: 11,
      title: "Cocktail Mixology Class",
      cat: "Dining",
      img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1000&auto=format&fit=crop",
      price: 20000,
      time: "Fri, 7 PM",
      location: "Victoria Island",
      tags: ["Skills", "Social"],
      attendees: 12,
      compatibility: 89,
      rating: 4.8,
      venue: "The Shaker Bar",
      reason: "Great for meeting people through hands-on activity."
    },
    {
      id: 12,
      title: "City Run Club",
      cat: "Fitness",
      img: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=1000&auto=format&fit=crop",
      price: 0,
      time: "Wed, 6 PM",
      location: "Lekki Phase 1",
      tags: ["Active", "Community"],
      attendees: 55,
      compatibility: 90,
      rating: 4.6,
      venue: "Lekki Bridge",
      reason: "Our most active social-fitness circle."
    }
  ];

  const vaultConnections = [
    { id: 1, name: "Alex Rivera", role: "Creative Director", status: "Met at Rooftop Cocktails", avatar: "https://i.pravatar.cc/150?img=12", compatibility: 94 },
    { id: 2, name: "Jordan Smith", role: "Tech Founder", status: "Met at Founders Brunch", avatar: "https://i.pravatar.cc/150?img=33", compatibility: 88 },
    { id: 3, name: "Elena Vogt", role: "Art Curator", status: "Matched: Art Preview", avatar: "https://i.pravatar.cc/150?img=22", compatibility: 91 },
  ];

  useEffect(() => {
    // DB Fetching logic placeholder
    // Using mock data for now - match this with DB structure
    setExperiences(feedItems);
    setIsLoading(false);
  }, []);

  const filteredItems = experiences.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.cat === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatPrice = (price) => {
    if (price === 0) return "FREE";
    return `₦${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col relative">
      
      {/* Social Hub Header */}
      <header className="sticky top-0 z-40 bg-[#121212]/90 backdrop-blur-2xl border-b border-white/5 px-4 lg:px-12 py-4 lg:py-8">
        <div className="max-w-[1600px] mx-auto space-y-6 lg:space-y-8">
          <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end gap-4 lg:gap-8">
            <div className="space-y-2 lg:space-y-4 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 text-red-500">
                <div className="w-8 lg:w-10 h-[2px] bg-red-600 rounded-full"></div>
                <span className="text-[9px] lg:text-[11px] font-black uppercase tracking-[0.4em] italic">Social Hub</span>
              </div>
              <h1 className="text-4xl lg:text-7xl font-black tracking-tighter uppercase italic leading-[0.85] text-white">
                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-zinc-800">Circle</span>
              </h1>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-zinc-950/40 p-1 rounded-[2rem] border border-white/5 backdrop-blur-3xl shadow-inner w-full lg:w-auto">
              <button 
                onClick={() => setActiveTab('experiences')}
                className={`flex-1 lg:flex-none px-6 lg:px-10 py-3 lg:py-4 rounded-[1.5rem] text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'experiences' ? 'bg-white text-black shadow-2xl scale-105' : 'text-zinc-600 hover:text-white'}`}
              >
                Experiences
              </button>
              <button 
                onClick={() => setActiveTab('vault')}
                className={`flex-1 lg:flex-none px-6 lg:px-10 py-3 lg:py-4 rounded-[1.5rem] text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'vault' ? 'bg-white text-black shadow-2xl scale-105' : 'text-zinc-600 hover:text-white'}`}
              >
                The Vault
              </button>
            </div>
          </div>

          {activeTab === 'experiences' && (
            <div className="flex flex-col md:flex-row items-center gap-4 lg:gap-6 pt-2">
              <div className="flex-1 w-full relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-500 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Search experiences..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/30 border border-white/5 rounded-[2rem] py-4 pl-14 pr-6 focus:outline-none focus:border-red-500/30 transition-all text-[11px] font-medium placeholder:text-zinc-700"
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar py-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2.5 rounded-full text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border ${
                      activeCategory === cat 
                      ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20' 
                      : 'bg-white/5 border-white/5 text-zinc-500 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] mx-auto w-full relative z-10">
        
        {/* Main Feed Content */}
        <div className="flex-1 px-6 lg:px-12 py-10">
          {activeTab === 'experiences' ? (
            <div className="space-y-12">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter">Live Circles</h2>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Connect through the city's pulse</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest">Real-time Matching Active</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item, i) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      onClick={() => setSelectedExperience(item)}
                      className="group relative bg-zinc-900/20 border border-white/5 rounded-[3rem] overflow-hidden hover:border-red-500/30 transition-all cursor-pointer flex flex-col hover:shadow-2xl hover:shadow-black/50"
                    >
                      <div className="aspect-[4/5] relative overflow-hidden">
                        <img src={item.img} className="w-full h-full object-cover grayscale-[0.2] opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" alt={item.title} />
                        
                        {/* Attendee Avatars - Social Proof */}
                        <div className="absolute top-6 right-6">
                          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10">
                            <div className="flex -space-x-2 mr-1">
                              {[1,2,3].map(n => (
                                <img key={n} src={`https://i.pravatar.cc/100?img=${n+20+item.id}`} className="w-5 h-5 rounded-full border border-black" alt="user" />
                              ))}
                            </div>
                            <span className="text-[9px] font-black text-white">+{item.attendees}</span>
                          </div>
                        </div>

                        <div className="absolute top-6 left-6">
                          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-red-600/80 backdrop-blur-xl border border-red-600/20">
                            <Sparkles size={10} className="text-white" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.compatibility}% Match</span>
                          </div>
                        </div>

                        {item.price === 0 && (
                          <div className="absolute bottom-6 right-6">
                            <div className="px-3 py-1 bg-white text-black rounded-lg text-[9px] font-black uppercase tracking-widest shadow-xl animate-bounce">FREE</div>
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent">
                          <div className="space-y-2">
                             <div className="flex items-center gap-2">
                               <span className="px-2 py-1 rounded-md bg-red-600/20 text-red-500 border border-red-600/20 text-[8px] font-black uppercase tracking-widest">
                                 {item.cat}
                               </span>
                               <span className="flex items-center gap-1 text-[8px] font-black text-yellow-500 uppercase">
                                 <Star size={8} fill="currentColor" /> {item.rating}
                               </span>
                             </div>
                             <h4 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-tight pr-4">{item.title}</h4>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-8 bg-zinc-950/20 space-y-6 flex-1 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                              <MapPin size={12} className="text-red-500" />
                              <span>{item.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-600">
                              <Clock size={12} />
                              <span>{item.time}</span>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[8px] font-black uppercase text-zinc-600 mb-0.5">Access</p>
                             <p className="text-lg font-black text-white italic leading-none">{formatPrice(item.price)}</p>
                          </div>
                        </div>
                        
                        <button className="w-full py-5 bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 shadow-[0_15px_30px_-10px_rgba(255,255,255,0.2)]">
                          View Circle <ArrowRight size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">The Vault</h2>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">People you've met through shared moments</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                    <input type="text" placeholder="Search Connections..." className="bg-zinc-900/30 border border-white/5 rounded-xl py-3 pl-11 pr-5 text-[10px] uppercase font-black tracking-widest focus:outline-none focus:border-red-500/30 transition-all placeholder:text-zinc-800" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {vaultConnections.map((person, i) => (
                  <motion.div
                    key={person.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 rounded-[3rem] bg-zinc-950/20 border border-white/5 hover:border-red-500/40 transition-all group relative overflow-hidden"
                  >
                    <div className="space-y-8 relative z-10">
                      <div className="flex items-start gap-5">
                        <div className="relative">
                          <img src={person.avatar} className="w-20 h-20 rounded-[2rem] object-cover border-2 border-white/10 group-hover:border-red-500/50 transition-all shadow-2xl" alt={person.name} />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-red-600 border-2 border-black flex items-center justify-center">
                            <ShieldCheck size={12} className="text-white" />
                          </div>
                        </div>
                        <div className="space-y-1 pr-10">
                          <h4 className="text-xl font-black uppercase italic text-white group-hover:text-red-500 transition-colors">{person.name}</h4>
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-relaxed line-clamp-1">{person.role}</p>
                          <div className="flex items-center gap-2 text-yellow-500 pt-2">
                            <Sparkles size={10} />
                            <span className="text-[10px] font-black">{person.compatibility}% Match</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-900/40 border border-white/5">
                          <MapPin size={12} className="text-zinc-600" />
                          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{person.status}</p>
                        </div>
                        <button className="w-full py-4 bg-white text-black font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all shadow-lg">View Profile</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Social Pulse - Added for better Social Feel */}
        <aside className="hidden xl:flex w-96 flex-col p-10 border-l border-white/5 space-y-12 bg-zinc-900/10">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-white">
              <TrendingUp size={18} className="text-red-500" />
              <h3 className="text-xs font-black uppercase tracking-[0.4em] italic">City Pulse</h3>
            </div>
            
            <div className="space-y-4">
              {[
                { name: "John D.", action: "joined", event: "Secret Pasta Night", time: "2m ago" },
                { name: "Sarah M.", action: "booked", event: "The Jazz Cave", time: "12m ago" },
                { name: "Mike R.", action: "joined", event: "City Run Club", time: "24m ago" },
                { name: "Elena V.", action: "joined", event: "Midnight Gallery", time: "1h ago" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950/20 border border-white/5 hover:bg-white/5 transition-all group">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+40}`} alt="user" className="opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white">
                      {activity.name} <span className="text-zinc-600 font-bold">{activity.action}</span>
                    </p>
                    <p className="text-[8px] font-bold text-red-500 uppercase truncate">{activity.event}</p>
                  </div>
                  <span className="text-[8px] font-black text-zinc-700 uppercase">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-red-600/10 to-transparent border border-red-600/20 space-y-6">
            <div className="flex items-center gap-3 text-red-500">
              <Zap size={18} />
              <h3 className="text-xs font-black uppercase tracking-widest italic">Fast Join</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              34 people with <span className="text-white font-bold">90%+ lifestyle synergy</span> are out tonight in Victoria Island.
            </p>
            <button className="w-full py-4 bg-white text-black font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all">
              See Who's Out
            </button>
          </div>

          {/* Social Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-zinc-950/40 border border-white/5 text-center space-y-1">
              <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Active Tonight</p>
              <p className="text-2xl font-black text-white italic">142</p>
            </div>
            <div className="p-6 rounded-3xl bg-zinc-950/40 border border-white/5 text-center space-y-1">
              <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Verified</p>
              <p className="text-2xl font-black text-white italic">100%</p>
            </div>
          </div>
        </aside>
      </div>

      {/* Social Bridge Modal */}
      <AnimatePresence>
        {selectedExperience && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExperience(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            ></motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-t-[3rem] lg:rounded-[4rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row h-[95vh] lg:h-auto lg:max-h-[90vh]"
            >
              <div className="w-full lg:w-[40%] relative min-h-[300px] lg:min-h-full">
                <img src={selectedExperience.img} className="w-full h-full object-cover grayscale opacity-30" alt={selectedExperience.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent p-8 lg:p-12 flex flex-col justify-end gap-4 lg:gap-6">
                  <div className="space-y-2 lg:space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-red-600/20 border border-red-600/20 text-red-500 text-[8px] lg:text-[10px] font-black uppercase tracking-widest">
                      {selectedExperience.cat}
                    </div>
                    <h3 className="text-3xl lg:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">{selectedExperience.title}</h3>
                    <div className="space-y-1 lg:space-y-2 text-zinc-500 text-[10px] lg:text-xs font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-red-500" />
                        <span>{selectedExperience.venue} • {selectedExperience.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-zinc-700" />
                        <span>{selectedExperience.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 lg:p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-3xl space-y-2 lg:space-y-3">
                    <div className="flex items-center gap-2 text-yellow-500">
                      <Award size={14} />
                      <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest italic">Synergy Insight</span>
                    </div>
                    <p className="text-[10px] lg:text-xs text-zinc-400 italic leading-relaxed font-medium">"{selectedExperience.reason}"</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-8 lg:p-12 flex flex-col gap-8 lg:gap-10 overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl lg:text-2xl font-black uppercase italic tracking-tight text-white">Experience Circle</h4>
                  <div className="px-3 py-1.5 rounded-2xl bg-zinc-900 border border-white/5 text-[8px] lg:text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    {selectedExperience.attendees} Attending
                  </div>
                </div>

                <div className="space-y-3 lg:space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="group flex items-center gap-4 lg:gap-5 p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-red-500/30 transition-all">
                      <div className="relative">
                        <img src={`https://i.pravatar.cc/150?img=${i+20}`} className="w-10 lg:w-14 h-10 lg:h-14 rounded-xl lg:rounded-2xl object-cover border-2 border-white/5" alt="guest" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-green-500 border-2 border-black"></div>
                      </div>
                      <div className="flex-1 space-y-0.5 lg:space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm lg:text-base font-black uppercase italic text-white group-hover:text-red-500 transition-colors">Verified Member</h5>
                          <ShieldCheck size={10} className="text-red-600" />
                        </div>
                        <div className="flex gap-1 lg:gap-2">
                          {['Lifestyle', 'Verified'].map(t => (
                            <span key={t} className="text-[7px] lg:text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600 italic">#{t}</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-zinc-500 mb-0.5 lg:mb-1">
                          <TrendingUp size={8} className="text-red-500" />
                          <span className="text-[7px] lg:text-[8px] font-black uppercase tracking-widest italic">Match</span>
                        </div>
                        <p className="text-lg lg:text-xl font-black text-white italic leading-none">{82 + (i * 3)}%</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto space-y-4 lg:space-y-6">
                  <div className="p-4 lg:p-6 rounded-3xl bg-red-600/5 border border-red-600/10 flex items-start gap-3 lg:gap-4">
                    <ShieldCheck size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] lg:text-xs text-zinc-500 leading-relaxed font-medium italic uppercase tracking-wide">
                      Your lifestyle synergy is high with this circle. You will meet these people at the venue.
                    </p>
                  </div>
                  <button className="w-full py-5 lg:py-6 bg-white text-black font-black text-xs uppercase tracking-[0.4em] rounded-3xl hover:bg-zinc-100 transition-all shadow-xl">
                    {selectedExperience.price === 0 ? 'Join Circle (FREE)' : `Book Circle (${formatPrice(selectedExperience.price)})`}
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setSelectedExperience(null)}
                className="absolute top-6 right-6 lg:top-8 lg:right-8 p-3 lg:p-4 rounded-3xl bg-black/40 backdrop-blur-3xl border border-white/10 text-zinc-600 hover:text-white transition-all z-50"
              >
                <X size={18} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stats Footer */}
      <div className="px-6 lg:px-12 py-16 max-w-7xl mx-auto w-full border-t border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
           {[
             { label: "Active Circles", value: "48+", icon: <Zap size={18} />, color: "text-yellow-500" },
             { label: "City Areas", value: "12", icon: <MapIcon size={18} />, color: "text-red-500" },
             { label: "Verified Only", value: "100%", icon: <ShieldCheck size={18} />, color: "text-white" },
             { label: "24/7 Access", value: "Live", icon: <Clock size={18} />, color: "text-zinc-500" }
           ].map((stat, i) => (
             <div key={i} className="space-y-2">
                <div className={`w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center ${stat.color} mb-4`}>
                  {stat.icon}
                </div>
                <p className="text-[9px] font-black uppercase text-zinc-700 tracking-[0.4em]">{stat.label}</p>
                <p className="text-2xl font-black text-white italic uppercase leading-none">{stat.value}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default Discovery;
