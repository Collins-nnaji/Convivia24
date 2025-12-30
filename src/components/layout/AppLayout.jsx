import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Bookmark, User, Compass, Briefcase, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';

const AppLayout = () => {
  const navItems = [
    { icon: <Compass size={20} />, label: 'Explore', path: '/explore' },
    { icon: <Bookmark size={20} />, label: 'Saved', path: '/saved' },
    { icon: <User size={20} />, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans selection:bg-red-600 overflow-x-hidden relative">
      {/* Visual Depth: Noise & Glows (Matching Landing Page) */}
      <div className="fixed inset-0 z-[0] pointer-events-none opacity-[0.05] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-red-600/[0.08] blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-600/[0.06] blur-[100px] rounded-full pointer-events-none z-0"></div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-24 flex-col items-center py-10 border-r border-white/5 bg-zinc-950/20 backdrop-blur-3xl z-50">
        <NavLink to="/" className="mb-12">
          <img src="/Logo2.png" alt="logo" className="w-10 h-10 opacity-90 hover:opacity-100 transition-opacity" />
        </NavLink>
        
        <nav className="flex flex-col gap-10 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `group relative flex flex-col items-center gap-1.5 transition-all ${isActive ? 'text-red-500' : 'text-zinc-600 hover:text-zinc-300'}`
              }
            >
              <div className={`p-3 rounded-2xl transition-all ${'group-hover:bg-white/5'}`}>
                {item.icon}
              </div>
              <span className="text-[8px] font-black uppercase tracking-[0.2em]">{item.label}</span>
              {/* Active Indicator Dot */}
              <NavLink to={item.path}>
                {({ isActive }) => isActive && (
                  <motion.div layoutId="navDot" className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-4 bg-red-600 rounded-full" />
                )}
              </NavLink>
            </NavLink>
          ))}
        </nav>

        {/* Business CTA in Sidebar */}
        <NavLink 
          to="/business"
          className={({ isActive }) => 
            `mt-auto p-4 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
              isActive 
              ? 'bg-red-600/10 border-red-600/50 text-red-500' 
              : 'bg-white/5 border-white/5 text-zinc-500 hover:border-white/10 hover:text-white'
            }`
          }
        >
          <Briefcase size={18} />
          <span className="text-[7px] font-black uppercase tracking-widest text-center leading-tight">For<br/>Business</span>
        </NavLink>
      </aside>

      {/* Main Content Area */}
      <main className="lg:pl-24 pb-24 lg:pb-0 min-h-screen relative z-10">
        <div className="max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-zinc-950/80 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-6 z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-red-500 scale-110' : 'text-zinc-500'}`
            }
          >
            {item.icon}
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </NavLink>
        ))}
        <NavLink
          to="/business"
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-red-500 scale-110' : 'text-zinc-500'}`
          }
        >
          <Briefcase size={20} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Business</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default AppLayout;
