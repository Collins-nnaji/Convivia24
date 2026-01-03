import React from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowUpRight, Lock, Grid, List } from 'lucide-react';

const Saved = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 pb-20 px-6 lg:px-0"
    >
      <header className="flex flex-col sm:flex-row items-center sm:items-end justify-between border-b border-white/5 pb-8 gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-yellow-500 mb-1">
            <Star size={14} fill="currentColor" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Curated Vault</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-none text-white">Saved</h1>
        </div>
        
        <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-white/5 gap-1">
          <button className="p-2.5 rounded-xl bg-zinc-900 text-white shadow-xl">
            <Grid size={18} />
          </button>
          <button className="p-2.5 rounded-xl text-zinc-600 hover:text-zinc-400 transition-colors">
            <List size={18} />
          </button>
        </div>
      </header>

      {/* Empty State / Coming Soon */}
      <div className="relative group rounded-[2.5rem] lg:rounded-[3.5rem] bg-zinc-950 border border-white/5 p-8 lg:p-16 flex flex-col items-center text-center space-y-8 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-yellow-500/5 blur-3xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>

        <div className="relative w-32 h-32 rounded-[3rem] bg-zinc-900 border border-white/5 flex items-center justify-center text-yellow-500 shadow-2xl group-hover:scale-110 transition-transform duration-700">
          <Lock size={48} strokeWidth={1.5} />
        </div>
        
        <div className="relative space-y-4 max-w-md">
          <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white">Your Vault is Locked</h2>
          <p className="text-zinc-500 text-sm leading-relaxed font-medium">
            Start exploring the city to save experiences you love. Your curated vault will keep them safe and notify you before they're gone.
          </p>
        </div>

        <button className="relative flex items-center gap-3 px-10 py-5 bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-200 transition-all shadow-2xl group-hover:-translate-y-1">
          Explore Lagos <ArrowUpRight size={16} />
        </button>

        {/* Floating Decorative Elements */}
        <div className="absolute top-10 right-10 w-2 h-2 rounded-full bg-yellow-500 animate-ping"></div>
        <div className="absolute bottom-10 left-10 w-1 h-1 rounded-full bg-red-600 animate-pulse"></div>
      </div>

      {/* Recommended Section */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">You might also like</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-30 grayscale pointer-events-none">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 rounded-[2rem] bg-zinc-950 border border-white/5"></div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default Saved;
