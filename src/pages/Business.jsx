import React from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, BarChart3, Users, Zap, ShieldCheck, 
  ArrowRight, Globe, Store, Rocket, Target, 
  MessageSquare, LayoutDashboard, Plus, Search
} from 'lucide-react';

const Business = () => {
  const steps = [
    { title: "Register", desc: "Set up your business profile and verify your identity." },
    { title: "List", desc: "Create your first experience or service listing." },
    { title: "Go Live", desc: "Your listing appears on The Hub for local explorers." }
  ];

  const features = [
    { icon: <Target size={20} />, title: "Precision Targeting", desc: "We match your experience with users looking for your specific vibe." },
    { icon: <MessageSquare size={20} />, title: "Direct Communication", desc: "Chat directly with guests to handle special requests." },
    { icon: <ShieldCheck size={20} />, title: "Identity Verified", desc: "Every Convivia member is 18+ and verified for safety." },
    { icon: <Zap size={20} />, title: "Instant Payouts", desc: "Revenue hits your account as soon as the experience begins." },
  ];

  return (
    <div className="min-h-screen bg-transparent">
      {/* 1. Hero Section - Strategic Marketing */}
      <section className="relative px-6 py-20 lg:px-12 overflow-hidden border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-10 text-center lg:text-left relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/10 border border-red-600/20 text-red-500"
            >
              <Briefcase size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Convivia for Business</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl lg:text-8xl font-black tracking-tighter uppercase italic leading-none text-white"
            >
              The City's <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white">Growth</span> Engine
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg lg:text-xl text-zinc-500 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
            >
              Transform your venue or service into a premium city experience. Connect with over 4,000+ active members looking for the best spots tonight.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button className="group px-12 py-6 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-200 transition-all shadow-[0_20px_50px_-10px_rgba(255,255,255,0.3)] flex items-center justify-center gap-3">
                Become a Partner <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-12 py-6 bg-zinc-950 border border-white/5 text-zinc-400 font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:text-white hover:border-white/10 transition-all">
                Partner Login
              </button>
            </motion.div>
          </div>

          {/* Abstract Dashboard Mockup */}
          <div className="flex-1 w-full lg:max-w-xl relative group">
            <div className="absolute inset-0 bg-red-600/10 blur-[120px] rounded-full transition-opacity duration-1000 group-hover:opacity-100 opacity-50"></div>
            <div className="relative bg-zinc-900 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl p-10 flex flex-col gap-8 backdrop-blur-sm transform-gpu">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500">
                    <LayoutDashboard size={20} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-300">Live Dashboard</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[8px] font-black uppercase tracking-widest">System Active</div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 rounded-[2rem] border border-white/5 p-6 space-y-1">
                    <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Daily Revenue</p>
                    <p className="text-2xl font-black italic text-white leading-none">₦482,000</p>
                  </div>
                  <div className="bg-black/40 rounded-[2rem] border border-white/5 p-6 space-y-1">
                    <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Active Guests</p>
                    <p className="text-2xl font-black italic text-white leading-none">24</p>
                  </div>
                </div>
                
                <div className="bg-black/40 rounded-[2.5rem] border border-white/5 p-8 relative overflow-hidden h-48">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-[10px] font-black uppercase text-zinc-400">Weekly Booking Velocity</p>
                    <TrendingUp size={14} className="text-red-500" />
                  </div>
                  <div className="flex gap-2 items-end h-24 absolute bottom-8 left-8 right-8">
                    {[4, 7, 5, 9, 6, 8, 10, 7, 12, 8].map((h, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ height: 0 }}
                        animate={{ height: `${h * 8}%` }}
                        transition={{ delay: 0.5 + (i * 0.05), duration: 0.8, ease: "easeOut" }}
                        className="flex-1 bg-red-600/40 rounded-t-lg group-hover:bg-red-600 transition-colors"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Features Section - Professional Value Prop */}
      <section className="px-6 py-32 lg:px-12 max-w-7xl mx-auto space-y-20">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-8 border-b border-white/5 pb-16">
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-[0.9]">Beyond simple listings</h2>
            <p className="text-zinc-500 text-sm font-medium uppercase tracking-[0.3em]">Comprehensive tools for the modern entrepreneur</p>
          </div>
          <button className="flex items-center gap-2 text-red-500 font-black uppercase tracking-[0.2em] text-xs hover:opacity-70 transition-all">
            Explore All Tools <Plus size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="p-10 rounded-[3rem] bg-zinc-900/20 border border-white/5 space-y-8 hover:bg-zinc-900/40 transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-zinc-950 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all shadow-xl border border-white/5">
                {feat.icon}
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-black uppercase italic tracking-tight">{feat.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed font-light">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. Onboarding Section - The Process */}
      <section className="px-6 py-20 lg:px-12 bg-zinc-900/10">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic">Ready in minutes</h2>
            <p className="text-zinc-600 text-sm font-black uppercase tracking-[0.4em]">The path to partnership</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600/20 to-transparent -z-10"></div>
            
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-6 group">
                <div className="w-20 h-20 rounded-full bg-zinc-950 border-2 border-white/10 flex items-center justify-center text-2xl font-black italic group-hover:border-red-600/50 group-hover:text-red-500 transition-all">
                  0{i + 1}
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase italic tracking-tight">{step.title}</h3>
                  <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Final CTA - The Conversion */}
      <section className="px-6 py-32 lg:px-12 text-center max-w-4xl mx-auto space-y-12">
        <div className="relative inline-block">
          <div className="absolute inset-[-20px] bg-red-600/20 blur-[60px] rounded-full"></div>
          <Rocket size={48} className="text-red-500 mx-auto relative z-10" />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase italic leading-[0.85]">Join the Elite<br/>Network</h2>
          <p className="text-zinc-500 text-lg leading-relaxed font-medium">Over 50+ premium venues in Lagos are already using Convivia to drive secure, high-value bookings.</p>
        </div>

        <button className="px-16 py-8 bg-red-600 text-white font-black text-sm uppercase tracking-[0.4em] rounded-3xl hover:bg-red-500 transition-all shadow-[0_30px_60px_-15px_rgba(220,38,38,0.4)] transform hover:scale-105">
          Apply for Partnership
        </button>
        
        <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.3em]">Limited partnership slots available for Q1 2024</p>
      </section>

    </div>
  );
};

// Re-using TrendingUp icon from main platform
const TrendingUp = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

export default Business;
