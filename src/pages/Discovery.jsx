import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ArrowUpRight, Zap, MapPin, TrendingUp, Star, Heart, Share2, Clock, Users } from 'lucide-react';

const Discovery = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Dining', 'Wellness', 'Nightlife', 'Fitness', 'Art'];

  const feedItems = [
    { id: 1, title: "Secret Pasta Night", cat: "Dining", img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1000&auto=format&fit=crop", price: "₦25,000", time: "Tonight, 8 PM", tags: ["Hidden Gem", "Culinary"] },
    { id: 2, title: "Deep House Yoga", cat: "Wellness", img: "https://images.unsplash.com/photo-1545201071-75f038ce1ed7?q=80&w=1000&auto=format&fit=crop", price: "₦5,000", time: "Sat, 10 AM", tags: ["Wellness", "High Vibe"] },
    { id: 3, title: "Sip & Paint: Noir", cat: "Art", img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1000&auto=format&fit=crop", price: "₦15,000", time: "Sat, 6 PM", tags: ["Art", "Social"] },
    { id: 4, title: "Rooftop HIIT", cat: "Fitness", img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop", price: "₦7,000", time: "Sun, 8 AM", tags: ["Active", "Views"] },
    { id: 5, title: "Vinyl Only Session", cat: "Nightlife", img: "https://images.unsplash.com/photo-1459749411177-042180ceea72?q=80&w=1000&auto=format&fit=crop", price: "₦10,000", time: "Sun, 10 PM", tags: ["Underground", "Culture"] },
  ];

  const filteredItems = activeCategory === 'All' 
    ? feedItems 
    : feedItems.filter(item => item.cat === activeCategory);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-transparent">
      
      {/* Left Column: Categories & Discovery Feed */}
      <div className="flex-1 px-6 py-10 lg:px-12 space-y-12">
        <header className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-500 mb-1">
                <div className="w-8 h-[1px] bg-red-500/50"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Discovery Protocol</span>
              </div>
              <h1 className="text-6xl lg:text-7xl font-black tracking-tighter uppercase italic leading-[0.8] text-white">
                The Hub
              </h1>
              <p className="text-zinc-500 text-sm font-medium tracking-wide">Lagos, NG • 2.4k people out now</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Vibe, place or experience..."
                  className="w-full md:w-80 bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-red-500/30 transition-all text-xs uppercase tracking-widest font-bold placeholder:text-zinc-700"
                />
              </div>
              <button className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 text-zinc-400 hover:text-white transition-all">
                <SlidersHorizontal size={20} />
              </button>
            </div>
          </div>

          {/* Categories Horizontal */}
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar border-b border-white/5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border ${
                  activeCategory === cat 
                  ? 'bg-white border-white text-black shadow-[0_10px_30px_-10px_rgba(255,255,255,0.3)]' 
                  : 'bg-zinc-900/30 border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {/* Feed Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-10">
          <AnimatePresence mode='popLayout'>
            {filteredItems.map((item, i) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative flex flex-col bg-zinc-900/20 border border-white/5 rounded-[3rem] overflow-hidden hover:border-red-500/30 transition-all duration-700 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)]"
              >
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" />
                  
                  {/* Floating Overlays */}
                  <div className="absolute top-6 right-6 flex flex-col gap-3">
                    <button className="p-3 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:text-red-500 transition-all transform hover:scale-110 active:scale-95">
                      <Heart size={18} />
                    </button>
                    <button className="p-3 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:text-white transition-all transform hover:scale-110">
                      <Share2 size={18} />
                    </button>
                  </div>

                  <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
                    {item.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/5 text-[8px] font-black uppercase tracking-widest text-zinc-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="p-10 space-y-8 flex-1">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Zap size={12} className="text-red-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/80">{item.cat}</span>
                      </div>
                      <h3 className="text-3xl lg:text-4xl font-black tracking-tighter text-white uppercase italic leading-none group-hover:translate-x-2 transition-transform duration-500">{item.title}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-zinc-600 mb-1">Entry</p>
                      <p className="text-xl font-black text-white italic">{item.price}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-white/5 pt-8">
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                        <Clock size={14} className="text-zinc-700" />
                        <span>{item.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                        <Users size={14} className="text-zinc-700" />
                        <span>Active Community</span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-6 bg-white text-black font-black text-xs uppercase tracking-[0.3em] rounded-[1.5rem] hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)]">
                    Secure Spot <ArrowUpRight size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </section>
      </div>

      {/* Right Column: Trending & Spotlight */}
      <aside className="hidden xl:flex w-[450px] flex-col p-12 space-y-16 bg-zinc-900/10 border-l border-white/5">
        
        {/* Spotlight Card */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 text-white">
            <Star size={18} className="text-yellow-500 fill-yellow-500" />
            <h2 className="text-sm font-black uppercase tracking-[0.4em]">Member Spotlight</h2>
          </div>
          
          <div className="relative aspect-square rounded-[3.5rem] overflow-hidden group border border-white/10">
            <img src="https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=1000" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Spotlight" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-10 flex flex-col justify-end gap-4">
              <div className="inline-flex px-4 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/40 backdrop-blur-md text-yellow-500 text-[9px] font-black uppercase tracking-widest self-start">
                Curated Recommendation
              </div>
              <h4 className="text-3xl font-black italic uppercase text-white leading-[0.9]">The Velvet<br/>Room Sessions</h4>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">Join 40+ members for an exclusive night of acoustic soul and jazz.</p>
              <button className="mt-2 w-full py-4 bg-zinc-900 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white hover:text-black transition-all">
                View Details
              </button>
            </div>
          </div>
        </section>

        {/* Trending Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 text-red-500">
            <TrendingUp size={18} />
            <h2 className="text-sm font-black uppercase tracking-[0.4em]">City Pulse</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { title: "Lekki Night Market", activity: "120+ Booked today", hot: true, icon: <MapPin size={14} /> },
              { title: "Jazz at the Park", activity: "Final 10 spots", hot: true, icon: <Users size={14} /> },
              { title: "The Wine Cellar", activity: "Partner Spot", hot: false, icon: <Star size={14} /> },
            ].map((trend, i) => (
              <motion.div 
                whileHover={{ x: 10 }}
                key={i} 
                className="p-6 rounded-[2rem] bg-zinc-900/40 border border-white/5 hover:bg-zinc-900/60 hover:border-red-500/20 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-zinc-600 group-hover:text-red-500 transition-colors">
                      {trend.icon}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black uppercase italic text-zinc-300 group-hover:text-white transition-colors">{trend.title}</h4>
                      <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{trend.activity}</p>
                    </div>
                  </div>
                  {trend.hot && <div className="w-2 h-2 rounded-full bg-red-600"></div>}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Statistics Bar */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 text-center space-y-1">
            <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Active Listings</p>
            <p className="text-2xl font-black text-white italic">42+</p>
          </div>
          <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 text-center space-y-1">
            <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Verified Spots</p>
            <p className="text-2xl font-black text-white italic">18</p>
          </div>
        </div>

      </aside>
    </div>
  );
};

export default Discovery;
