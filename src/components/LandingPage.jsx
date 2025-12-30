import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Sparkles, Star, ShieldCheck, X, AlertTriangle, MapPin
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(0);

  const locations = ['Lagos', 'Abuja', 'London', 'Berlin', 'New York', 'Dubai'];

  useEffect(() => {
    setIsLoaded(true);
    // Animate locations
    const interval = setInterval(() => {
      setCurrentLocation((prev) => (prev + 1) % locations.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleEnterPlatform = () => {
    setShowAgeModal(true);
  };

  const confirmAge = () => {
    setShowAgeModal(false);
    navigate('/feed');
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden font-sans selection:bg-red-600 selection:text-white flex flex-col">
      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      {/* Central Background Glow to fill space */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed top-1/3 left-1/3 w-[300px] h-[300px] bg-red-600/5 blur-[100px] rounded-full pointer-events-none z-0 animate-pulse"></div>

      {/* Main Content: 2-Column Layout */}
      <main className="flex-1 flex flex-col lg:flex-row max-w-[1400px] mx-auto w-full px-6 pt-12 pb-12 lg:py-8 lg:pt-12 items-center justify-center gap-12 lg:gap-24 relative z-10">
        
        {/* Column 1: Hero & Mission Statement */}
        <div className="w-full lg:w-[50%] text-center lg:text-left space-y-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            {/* Rolling Logo - Original Color */}
            <div className="mb-2 flex justify-center lg:justify-start">
              <motion.img 
                src="/Logo2.png" 
                alt="Convivia Logo" 
                className="w-16 h-16 lg:w-20 lg:h-20 opacity-90 hover:opacity-100 transition-opacity"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all cursor-default group">
                <Sparkles size={14} className="text-red-500 group-hover:rotate-12 transition-transform" />
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400">Curated City Experiences</span>
              </div>
              
              {/* 18+ Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={isLoaded ? { scale: 1 } : {}}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600/20 border border-red-600/40 backdrop-blur-xl"
              >
                <ShieldCheck size={12} className="text-red-500" />
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-red-500">18+</span>
              </motion.div>
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-3 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-100 to-gray-500 leading-[0.9] whitespace-nowrap">
              CONVIVIA 24
            </h1>
            
            <p className="text-xl lg:text-2xl text-red-500 mb-2 font-medium italic tracking-tight opacity-90">
              "Your city, simplified. Your life, elevated."
            </p>
            
            {/* Adult-Only Notice */}
            <p className="text-xs text-zinc-600 mb-6 font-medium uppercase tracking-widest flex items-center justify-center lg:justify-start gap-2">
              <AlertTriangle size={12} className="text-red-600/60" />
              <span>Adults Only • 18+ Platform</span>
            </p>

            {/* Animated Locations */}
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-6">
              <MapPin size={14} className="text-red-500" />
              <div className="relative h-5 overflow-hidden w-28">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentLocation}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-zinc-400 text-sm font-bold uppercase tracking-widest absolute left-0"
                  >
                    {locations[currentLocation]}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="text-zinc-600 text-sm font-bold">•</span>
              <span className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest">Live Now</span>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-3 text-zinc-600 text-[9px] font-bold uppercase tracking-widest mb-6">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-black bg-zinc-900 flex items-center justify-center overflow-hidden ring-1 ring-white/10">
                    <img src={`https://i.pravatar.cc/100?img=${i+25}`} alt="user" className="opacity-80" />
                  </div>
                ))}
              </div>
              <span>400+ Active</span>
            </div>

            {/* Mission Statement */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="relative pt-6 border-t border-white/5 max-w-xl mx-auto lg:mx-0"
            >
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-zinc-200 leading-[1.5] text-center lg:text-left italic relative z-10 mb-6">
                Discover, book, and enjoy the <span className="text-white font-black not-italic border-b-2 border-red-600/50">best social experiences</span> and lifestyle services in your city — <span className="text-zinc-500">anytime, any day.</span>
              </h2>
              
              <div className="flex justify-center lg:justify-start gap-4 mb-10">
                <div className="w-12 h-[1px] bg-red-600/30 self-center"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">The Convivia Mission</span>
              </div>

              {/* Strategic Larger Enter Platform Button */}
              <div className="flex flex-col items-center lg:items-start gap-3">
                <motion.button 
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEnterPlatform}
                  className="group relative px-12 py-6 bg-white text-black font-black rounded-2xl hover:bg-zinc-100 transition-all flex items-center justify-center gap-4 text-sm shadow-[0_20px_50px_-10px_rgba(255,255,255,0.4)] overflow-hidden"
                >
                  <span className="uppercase tracking-[0.2em]">Enter Platform</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight size={20} className="text-red-600" />
                  </motion.div>
                  
                  {/* Subtle shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                </motion.button>
                
                {/* Age Requirement Notice */}
                <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-[0.3em] flex items-center gap-1.5">
                  <ShieldCheck size={10} className="text-red-600/70" />
                  <span>Age Verification Required • 18+ Only</span>
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Column 2: Brand of the Week & Plus Card */}
        <div className="w-full lg:w-[40%] flex flex-col items-center lg:items-center justify-center gap-10 pt-8 lg:pt-0">
          
          {/* Brand of the Week Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, delay: 0.6 }}
            className="relative group w-full max-w-[400px]"
          >
            <div className="absolute inset-0 bg-yellow-500/5 rounded-[2rem] blur-2xl group-hover:bg-yellow-500/10 transition-all duration-1000"></div>
            
            <div className="relative p-8 rounded-[2rem] bg-zinc-950/40 border border-white/5 backdrop-blur-xl overflow-hidden flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[7px] font-black uppercase tracking-[0.2em] mb-6">
                Brand of the Week
              </div>

              <motion.img 
                animate={{ y: [0, -10, 0], rotate: [0, 2, 0, -2, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                src="https://brand-assets.edrington.com/transform/104bb60c-a336-419a-b1b4-bf3e15d74116/MAC-2025-ANoE-The-First-Light-Pack-Shot-Bottle--Box-PNG-150dpi-2xl?quality=100&io=transform%3Afit%2Cwidth%3A1176%2Cheight%3A1176" 
                alt="Macallan" 
                className="w-48 lg:w-64 xl:w-72 h-auto object-contain mb-6 drop-shadow-2xl transition-all duration-700"
              />

              <div className="space-y-1">
                <h4 className="text-lg font-black tracking-tighter text-yellow-500 uppercase italic">The Macallan</h4>
                <p className="text-[9px] text-zinc-500 leading-relaxed font-medium uppercase tracking-wider">"The First Light" Essence — A legacy of craftsmanship meets city nights.</p>
              </div>
            </div>
          </motion.div>

          {/* Smaller Convivia 24 Plus Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isLoaded ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, delay: 0.8 }}
            className="w-full max-w-[280px] aspect-[1.6/1] rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-white/10 p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-red-500/30 transition-all"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 blur-3xl rounded-full"></div>
            
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 text-red-500">
                  <Star size={10} fill="currentColor" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Plus Tier</span>
                </div>
                <h3 className="text-sm font-black tracking-tight text-white uppercase italic">City Pass</h3>
              </div>
              <img src="/Logo2.png" alt="mini logo" className="w-6 h-6 grayscale opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="space-y-1 relative z-10">
              <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-zinc-600">Member ID</p>
              <p className="text-[10px] font-mono text-zinc-400">C24-LGS-8820</p>
            </div>
          </motion.div>

        </div>
      </main>

      {/* Age Verification Modal */}
      <AnimatePresence>
        {showAgeModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAgeModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            ></motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl text-center overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
              
              <div className="w-20 h-20 bg-red-600/10 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-8">
                <ShieldCheck size={40} strokeWidth={1.5} />
              </div>

              <h3 className="text-3xl font-black tracking-tighter uppercase italic mb-4">Age Verification</h3>
              <p className="text-zinc-500 text-sm leading-relaxed mb-10 font-medium">
                Convivia 24 is a curated platform for social experiences. You must be <span className="text-white font-bold">18 years or older</span> to access the city feed and book lifestyle services.
              </p>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={confirmAge}
                  className="w-full py-5 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-200 transition-all shadow-xl"
                >
                  I am 18 or older
                </button>
                <button 
                  onClick={() => setShowAgeModal(false)}
                  className="w-full py-5 bg-zinc-900 border border-white/5 text-zinc-500 font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:text-white transition-all"
                >
                  Exit Platform
                </button>
              </div>

              <div className="mt-8 flex items-center justify-center gap-2 text-zinc-700">
                <AlertTriangle size={12} />
                <span className="text-[8px] font-black uppercase tracking-widest">Adult Content & Experience Warning</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Simplified Footer */}
      <footer className="py-8 border-t border-white/5 bg-zinc-950/20 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-zinc-700 text-[9px] font-bold uppercase tracking-[0.4em]">
              &copy; 2024 Convivia 24.
            </p>
            <p className="text-[8px] text-zinc-800 font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
              <AlertTriangle size={10} className="text-red-600/50" />
              <span>18+ Platform • Adults Only</span>
            </p>
          </div>
          <div className="flex gap-8">
            {['Services', 'Privacy', 'Support'].map(item => (
              <button key={item} className="text-zinc-700 hover:text-white transition-colors text-[8px] font-black uppercase tracking-[0.3em]">
                {item}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
