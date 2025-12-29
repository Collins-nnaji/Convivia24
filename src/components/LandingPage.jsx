import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { neon } from '@neondatabase/serverless';
import { 
  Star, ArrowRight, CheckCircle2,
  X, Send, Sparkles
} from 'lucide-react';

const sql = neon('postgresql://neondb_owner:npg_cx9lQEBUT6sq@ep-fancy-firefly-ahzlfq15-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require');

const LandingPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    city: '',
    interests: [],
    customFeature: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const corePrinciples = [
    { 
      title: "Forum-First", 
      desc: "Meaningful threads, discussions, and replies. No algorithmic feeds, just human conversation.",
      color: "text-white"
    },
    { 
      title: "City-Based Communities", 
      desc: "London After Dark, Berlin Nights, and more. Connect with your local scene.",
      color: "text-zinc-400"
    },
    { 
      title: "Live Threads", 
      desc: "Real-time threads that expire after the night (6-12 hours). Capture the moment.",
      color: "text-zinc-500"
    },
    { 
      title: "Safe & Adult-Only", 
      desc: "18+ platform with strong moderation, consent, and safety standards.",
      color: "text-zinc-600"
    }
  ];

  const scenes = [
    "Afrobeats", "Electronic", "Jazz", "Chill", "First Night Out"
  ];

  const availableInterests = [
    "City-Based Forums",
    "Live Expiring Threads",
    "Reputation System",
    "Invite-only Night Circles",
    "Private Scene Channels",
    "Identity Verification"
  ];

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await sql`
        INSERT INTO waitlist (email, city, interests, custom_feature)
        VALUES (${formData.email}, ${formData.city}, ${formData.interests}, ${formData.customFeature})
        ON CONFLICT (email) DO UPDATE 
        SET city = EXCLUDED.city, 
            interests = EXCLUDED.interests, 
            custom_feature = EXCLUDED.custom_feature;
      `;
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Waitlist submission error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden font-sans selection:bg-red-600 selection:text-white">
      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/10 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-800/5 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.05),transparent_70%)]"></div>
      </div>

      {/* Main View Container */}
      <div className="relative z-10 max-w-[1700px] mx-auto min-h-screen lg:h-screen flex flex-col lg:flex-row items-center justify-center lg:justify-between px-6 lg:px-12 py-20 lg:py-0 gap-16 lg:gap-12">
        
        {/* Column 1: Hero content */}
        <div className="w-full lg:w-[30%] flex flex-col items-center lg:items-start text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="mb-6 lg:mb-8 relative"
          >
            <div className="relative group">
              <div className="absolute inset-[-20px] bg-red-600/10 rounded-full blur-3xl group-hover:bg-red-600/20 transition-all duration-1000"></div>
              <img 
                src="/Logo2.png" 
                alt="Convivia 24 Logo" 
                className="w-32 h-32 md:w-40 lg:w-48 relative z-10 animate-spin-slow hover:pause filter drop-shadow-[0_0_30px_rgba(220,38,38,0.3)]"
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col items-center lg:items-start"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/10 mb-6 hover:bg-white/10 transition-all cursor-default group">
              <Sparkles size={14} className="text-red-500 group-hover:rotate-12 transition-transform" />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400">The After-Hours Forum</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-8xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-100 to-gray-500 leading-[0.9]">
              CONVIVIA 24
            </h1>
            
            <p className="text-xl lg:text-2xl text-red-500 mb-6 font-medium italic tracking-tight opacity-90">
              “The city talks after dark.”
            </p>
            
            <p className="text-base lg:text-lg text-gray-500 mb-10 max-w-sm leading-relaxed font-light">
              Where human conversation overpowers algorithmic feeds. City-based communities, real-time threads, and reputation that actually matters.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center w-full">
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowWaitlistModal(true)}
                className="w-full sm:w-auto group relative px-10 py-5 bg-white text-black font-black rounded-2xl hover:bg-zinc-100 transition-all flex items-center justify-center gap-3 overflow-hidden text-sm shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)]"
              >
                Join the Waitlist <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <div className="flex items-center gap-3 text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-black bg-zinc-900 flex items-center justify-center overflow-hidden ring-1 ring-white/10">
                      <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="user" className="opacity-80" />
                    </div>
                  ))}
                </div>
                <span>428+ Owls</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Column 2: Core Principles (Animated Text) */}
        <div className="w-full lg:w-[35%] flex flex-col justify-center py-10 lg:py-0">
          <div className="space-y-12 lg:space-y-10">
            {corePrinciples.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group cursor-default"
              >
                <div className="flex items-start gap-6 lg:gap-4">
                  <span className="text-xs lg:text-[10px] font-mono text-red-600 mt-1.5 font-bold opacity-50 group-hover:opacity-100 transition-opacity">0{index + 1}</span>
                  <div className="space-y-2 lg:space-y-1">
                    <h3 className={`text-3xl lg:text-3xl font-black tracking-tighter transition-colors duration-500 group-hover:text-white ${item.color}`}>
                      {item.title}
                    </h3>
                    <p className="text-sm lg:text-sm text-zinc-600 max-w-sm leading-relaxed group-hover:text-zinc-400 transition-colors duration-500 font-light text-left">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Column 3: Brand of the Week (Extreme Right) */}
        <div className="w-full lg:w-[25%] flex flex-col items-center justify-center pt-10 lg:pt-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative group w-full max-w-[340px]"
          >
            <div className="absolute inset-0 bg-yellow-500/5 rounded-[2.5rem] blur-2xl group-hover:bg-yellow-500/10 transition-all duration-1000"></div>
            
            <div className="relative p-8 lg:p-10 rounded-[2.5rem] bg-zinc-950/50 border border-white/5 backdrop-blur-xl overflow-hidden flex flex-col items-center text-center">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[8px] font-black uppercase tracking-[0.2em] mb-8">
                Brand of the Week
              </div>

              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 3, 0, -3, 0]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
                className="relative mb-8"
              >
                <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <img 
                  src="https://brand-assets.edrington.com/transform/104bb60c-a336-419a-b1b4-bf3e15d74116/MAC-2025-ANoE-The-First-Light-Pack-Shot-Bottle--Box-PNG-150dpi-2xl?quality=100&io=transform%3Afit%2Cwidth%3A1176%2Cheight%3A1176" 
                  alt="Macallan Whiskey - The First Light" 
                  className="w-48 sm:w-64 h-auto object-contain relative z-10 drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform duration-700"
                />
              </motion.div>

              <div className="space-y-1 relative z-10">
                <h4 className="text-xl lg:text-2xl font-black text-white tracking-tighter uppercase">The Macallan</h4>
                <p className="text-[10px] text-yellow-600 uppercase tracking-widest font-bold">The First Light — 2025 Edition</p>
              </div>

              <div className="mt-8 w-full pt-6 border-t border-white/5 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zinc-950 px-4 text-[8px] font-bold uppercase tracking-[0.3em] text-zinc-700">The Essence</div>
                <p className="text-[10px] lg:text-xs text-zinc-400 font-light leading-relaxed italic px-2">
                  "Born from the misty mornings of Speyside, 'The First Light' is a liquid testament to patience. Matured in rare sherry-seasoned oak, it captures the fleeting moment when the night surrenders to the dawn."
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Scroll Indicator for Desktop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="hidden lg:block absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2 text-gray-700">
            <span className="text-[8px] uppercase tracking-[0.4em] font-bold">The Ecosystem</span>
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="w-px h-8 bg-gradient-to-b from-red-600 to-transparent"
            />
          </div>
        </motion.div>
      </div>

      {/* Waitlist Modal */}
      <AnimatePresence>
        {showWaitlistModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWaitlistModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-[3rem] p-8 md:p-12 overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setShowWaitlistModal(false)}
                className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              {!isSubmitted ? (
                <div className="relative z-10">
                  <div className="mb-10 text-center">
                    <h2 className="text-3xl md:text-4xl font-black mb-4">Shape the Scene</h2>
                    <p className="text-gray-400">Tell us what you want to see in the city after dark.</p>
                  </div>

                  <form onSubmit={handleWaitlistSubmit} className="space-y-8 max-h-[60vh] overflow-y-auto px-2 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 ml-1">Email Address</label>
                          <input 
                            required
                            type="email" 
                            placeholder="nightowl@example.com"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-red-500 transition-colors text-base"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 ml-1">Your City</label>
                          <input 
                            required
                            type="text" 
                            placeholder="London, Berlin, Lagos..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-red-500 transition-colors text-base"
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 ml-1">Desired Features</label>
                        <div className="grid grid-cols-1 gap-2">
                          {availableInterests.map((interest) => (
                            <button
                              key={interest}
                              type="button"
                              onClick={() => toggleInterest(interest)}
                              className={`px-4 py-2 rounded-xl text-[10px] font-bold border text-left transition-all ${
                                formData.interests.includes(interest) 
                                ? 'bg-red-600 border-red-500 text-white' 
                                : 'bg-white/5 border-white/10 text-zinc-500 hover:border-white/20'
                              }`}
                            >
                              {interest}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 ml-1">Anything else?</label>
                      <textarea 
                        placeholder="What's missing from your nightlife?"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-red-500 transition-colors h-24 resize-none text-base"
                        value={formData.customFeature}
                        onChange={(e) => setFormData({...formData, customFeature: e.target.value})}
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-5 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-red-600/20"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>Join Private Waitlist <Send size={18} /></>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 size={48} className="text-red-500" />
                  </div>
                  <h2 className="text-4xl font-black mb-4">You're in the Loop</h2>
                  <p className="text-gray-400 max-w-xs mx-auto text-lg leading-relaxed">
                    Welcome to the underground. We'll reach out when the city is ready to talk.
                  </p>
                  <button 
                    onClick={() => setShowWaitlistModal(false)}
                    className="mt-12 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                  >
                    Close Window
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Scenes Highlight (Compact) */}
      <section className="py-12 px-4 bg-black relative">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/0 via-red-900/5 to-zinc-950/0"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-sm font-bold mb-8 uppercase tracking-[0.2em] text-gray-500">Dive into the Scenes</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {scenes.map((scene, index) => (
              <span 
                key={index}
                className="px-6 py-3 rounded-xl bg-zinc-900/80 backdrop-blur-sm border border-white/5 text-xs font-bold hover:border-red-500/50 hover:text-red-500 transition-all cursor-default"
              >
                {scene}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Section (High-Fidelity Card) */}
      <section className="py-32 px-4 relative z-10 overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                The Elite Layer
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tighter">
                CONVIVIA 24 <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-700">PLUS</span>
              </h2>
              <p className="text-gray-400 mb-10 text-lg font-light leading-relaxed max-w-xl">
                For those who live for the night. Convivia Plus is more than a subscription—it's your digital key to the city's most guarded secrets.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                {[
                  { title: "Night Circles", desc: "Private invite-only temporary groups." },
                  { title: "Trust Signals", desc: "Verified identity for safer connections." },
                  { title: "Ghost Mode", desc: "Browse threads without leaving a trace." },
                  { title: "Priority Echo", desc: "Your replies stay at the top of the scene." }
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-2 text-yellow-500 font-bold text-sm uppercase tracking-wider">
                      <Star size={14} fill="currentColor" /> {item.title}
                    </div>
                    <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="w-full lg:w-1/2 flex justify-center perspective-1000">
            <motion.div
              initial={{ opacity: 0, rotateY: 30, x: 50 }}
              whileInView={{ opacity: 1, rotateY: -15, x: 0 }}
              whileHover={{ rotateY: 0, scale: 1.05 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative w-full max-w-[450px] aspect-[1.58/1] rounded-[2rem] p-8 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black border border-white/20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5),0_0_50px_rgba(180,150,50,0.1)] overflow-hidden group"
            >
              {/* Holographic Overlays */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.15),transparent)] pointer-events-none"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-yellow-500/5 via-transparent to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

              <div className="relative h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-500/60">Membership Pass</p>
                    <h3 className="text-2xl font-black text-white tracking-tighter">PLUS ACCESS</h3>
                  </div>
                  <div className="w-16 h-16 relative">
                    <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full animate-pulse"></div>
                    <img src="/Logo2.png" alt="Plus Logo" className="w-full h-full object-contain relative z-10 brightness-125 saturate-150" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="h-px w-full bg-gradient-to-r from-yellow-500/50 via-yellow-500/10 to-transparent"></div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-500">Member Status</p>
                      <p className="text-xs font-mono text-zinc-300">VERIFIED NIGHT OWL</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-500">Access Level</p>
                      <p className="text-xs font-mono text-yellow-500 tracking-widest">RANK: APEX</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-colors"></div>
              </div>

              {/* NFC Chip lookalike */}
              <div className="absolute top-1/2 left-8 -translate-y-1/2 w-10 h-8 rounded-md bg-gradient-to-br from-yellow-600/40 to-yellow-900/40 border border-yellow-500/20 flex flex-col justify-center gap-1 px-1">
                <div className="h-[1px] w-full bg-yellow-500/30"></div>
                <div className="h-[1px] w-full bg-yellow-500/30"></div>
                <div className="h-[1px] w-full bg-yellow-500/30"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-zinc-950/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <img src="/Logo2.png" alt="logo" className="w-12 h-12 mx-auto mb-8 grayscale opacity-30" />
          <p className="text-gray-600 text-sm font-medium tracking-widest uppercase">
            &copy; 2024 Convivia 24. For the night-owls, by the night-owls.
          </p>
          <div className="flex justify-center gap-8 mt-10">
            <button className="text-zinc-600 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Principles</button>
            <button className="text-zinc-600 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Safety</button>
            <button className="text-zinc-600 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Verified</button>
          </div>
          <p className="mt-12 text-[10px] text-zinc-800 font-bold uppercase tracking-[0.3em]">
            18+ Only. Participation-based reputation.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
