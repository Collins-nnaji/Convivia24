import React from 'react';
import { motion } from 'framer-motion';
import { Settings, CreditCard, Clock, MapPin, LogOut, ShieldCheck, ChevronRight, Award } from 'lucide-react';

const Profile = () => {
  const menuItems = [
    { icon: <Clock size={18} />, label: 'Booking History', desc: 'Manage your past experiences', color: 'text-zinc-400' },
    { icon: <CreditCard size={18} />, label: 'Payments', desc: 'Secure checkout methods', color: 'text-zinc-400' },
    { icon: <MapPin size={18} />, label: 'City Preferences', desc: 'Current: Lagos, Nigeria', color: 'text-red-500' },
    { icon: <ShieldCheck size={18} />, label: 'Security', desc: 'Two-factor & privacy', color: 'text-zinc-400' },
    { icon: <Settings size={18} />, label: 'Settings', desc: 'Account & notifications', color: 'text-zinc-400' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 pb-20 max-w-2xl mx-auto"
    >
      <header className="flex flex-col items-center text-center space-y-6 pt-10">
        <div className="relative group">
          {/* Animated Glow Rings */}
          <div className="absolute inset-[-8px] bg-gradient-to-tr from-red-600 via-yellow-500 to-red-600 rounded-full blur-xl opacity-20 group-hover:opacity-40 animate-spin-slow transition-opacity"></div>
          <div className="absolute inset-[-2px] bg-black rounded-full z-0"></div>
          
          <div className="w-32 h-32 rounded-full border-2 border-white/10 overflow-hidden relative z-10 shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop" 
              alt="avatar" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
            />
          </div>

          <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black p-2 rounded-xl shadow-2xl z-20 border-2 border-black">
            <Award size={20} fill="currentColor" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Curated Explorer</h1>
          <div className="flex items-center justify-center gap-3">
            <span className="px-3 py-1 rounded-full bg-red-600/10 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] border border-red-500/20">Rank: City Gold</span>
            <span className="px-3 py-1 rounded-full bg-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] border border-white/10">Member since '24</span>
          </div>
        </div>
      </header>

      {/* Profile Card / Stats */}
      <section className="grid grid-cols-3 gap-4">
        {[
          { label: 'Bookings', value: '12' },
          { label: 'Saved', value: '48' },
          { label: 'Cities', value: '2' }
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-950 border border-white/5 rounded-2xl p-6 text-center space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">{stat.label}</p>
            <p className="text-2xl font-black text-white italic">{stat.value}</p>
          </div>
        ))}
      </section>

      {/* Menu Options */}
      <section className="space-y-3">
        {menuItems.map((item, index) => (
          <motion.button 
            key={index}
            whileHover={{ x: 8 }}
            className="w-full p-6 rounded-3xl bg-zinc-950 border border-white/5 flex items-center justify-between hover:bg-zinc-900 transition-all text-left group"
          >
            <div className="flex items-center gap-5">
              <div className={`bg-white/5 p-4 rounded-2xl border border-white/5 group-hover:bg-red-600/10 group-hover:border-red-500/20 group-hover:text-red-500 transition-all ${item.color}`}>
                {item.icon}
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white">{item.label}</h3>
                <p className="text-[10px] text-zinc-600 font-medium">{item.desc}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-zinc-800 group-hover:text-red-500 transition-colors" />
          </motion.button>
        ))}
      </section>

      <div className="pt-6">
        <button className="w-full p-6 rounded-3xl bg-zinc-900 border border-red-600/20 flex items-center justify-center gap-3 text-red-600 font-black text-xs uppercase tracking-[0.3em] hover:bg-red-600 hover:text-white transition-all shadow-2xl">
          <LogOut size={18} /> Logout Session
        </button>
      </div>

      <p className="text-center text-[8px] font-bold uppercase tracking-[0.4em] text-zinc-800">
        Convivia 24 &copy; V.0.4.2 ALPHA
      </p>
    </motion.div>
  );
};

export default Profile;
