'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowRight, Shield, Car, History, Building2, 
  Smartphone, Play, Apple, ChevronRight, CheckCircle2,
  Users, MapPin, Star
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-red-700 selection:text-white overflow-x-hidden">
      {/* Floating Rotating Logo */}
      <motion.div
        className="fixed top-24 right-10 z-40 hidden xl:block pointer-events-none opacity-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <img src="/Logo2.png" alt="" className="w-32 h-32 grayscale" />
      </motion.div>

      {/* Hero Section */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/convivia24.png" alt="Convivia24" className="h-8 md:h-10 w-auto object-contain" />
          </Link>
          <div className="hidden md:flex items-center gap-10">
            <Link href="/support" className="text-sm font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors">Support</Link>
            <Link href="/marketplace" className="px-8 py-3 rounded-full bg-red-700 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-red-800 transition-all shadow-xl shadow-red-900/20 active:scale-95">Marketplace</Link>
          </div>
        </div>
      </nav>

      <main className="relative">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-screen bg-gradient-to-l from-red-50 to-transparent pointer-events-none -z-10 opacity-50" />
        
        <section className="pt-40 pb-32 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-red-100 text-red-700 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                Nigeria's Elite Driver Network
              </div>
              
              <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-zinc-900 leading-[0.9] italic">
                YOUR CAR.<br />
                <span className="text-red-700 not-italic">OUR MASTERY.</span>
              </h1>
              
              <p className="text-xl text-zinc-500 max-w-xl leading-relaxed font-medium italic">
                Convivia24 provides on-demand, vetted professional drivers for your personal vehicles. Experience luxury, safety, and ultimate convenience.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                <button className="flex items-center justify-center gap-4 px-10 py-5 bg-zinc-900 text-white rounded-2xl shadow-2xl hover:bg-black transition-all active:scale-95 group">
                  <Play size={24} fill="currentColor" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500 group-hover:text-red-500 transition-colors">Get it on</p>
                    <p className="text-xl font-black leading-none">Google Play</p>
                  </div>
                </button>
                <button className="flex items-center justify-center gap-4 px-10 py-5 bg-zinc-900 text-white rounded-2xl shadow-2xl hover:bg-black transition-all active:scale-95 group">
                  <Apple size={24} fill="currentColor" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500 group-hover:text-red-500 transition-colors">Download on the</p>
                    <p className="text-xl font-black leading-none">App Store</p>
                  </div>
                </button>
              </div>

              <div className="flex items-center gap-8 pt-8 border-t border-zinc-200">
                <div>
                  <p className="text-2xl font-black text-zinc-900 tracking-tighter italic">5,000+</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Verified Trips</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-zinc-900 tracking-tighter italic">4.9/5</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Avg. Rating</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-zinc-900 tracking-tighter italic">100%</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Vetted Drivers</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-red-700/10 rounded-[3rem] blur-[100px] -z-10" />
              <div className="relative aspect-[4/5] rounded-[3rem] bg-white border border-zinc-200 p-4 shadow-2xl overflow-hidden group">
                <div className="relative h-full w-full rounded-[2.5rem] bg-zinc-100 overflow-hidden">
                  <motion.img 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src="/Convivia24driver1.png" 
                    alt="Premium Driver Service" 
                    className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] group-hover:scale-105 transition-transform duration-1000"
                  />
                  <motion.img 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 6, repeat: Infinity, times: [0, 0.5, 1] }}
                    src="/Convivia24driver2.png" 
                    alt="Elite Chauffeur" 
                    className="absolute inset-0 w-full h-full object-cover grayscale-[0.2]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent" />
                  
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="absolute bottom-8 left-8 right-8 p-6 bg-white/70 backdrop-blur-md border border-zinc-200/50 rounded-3xl shadow-lg space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center text-white shadow-lg">
                          <Shield size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Trip Security</p>
                          <p className="text-sm font-black text-zinc-900 uppercase italic">Real-time Verified</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-[8px] font-black uppercase tracking-widest shadow-sm">Active</div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="max-w-7xl mx-auto py-32 px-6 grid md:grid-cols-3 gap-12">
          {[
            { 
              icon: History, 
              title: 'Trip Auditing', 
              desc: 'Every mile is logged. Access comprehensive digital receipts and route history for total accountability.',
              color: 'text-red-700',
              bg: 'bg-red-50'
            },
            { 
              icon: Car, 
              title: 'Personal Fleet', 
              desc: 'Register multiple personal vehicles and manage them from a single dashboard for effortless transitions.',
              color: 'text-blue-700',
              bg: 'bg-blue-50'
            },
            { 
              icon: Shield, 
              title: 'Rigorous Vetting', 
              desc: 'Drivers undergo multi-stage background checks, criminal record verification, and practical assessments.',
              color: 'text-zinc-900',
              bg: 'bg-zinc-100'
            }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -10 }}
              className="p-10 rounded-[2.5rem] bg-white border border-zinc-100 shadow-sm hover:shadow-2xl transition-all group"
            >
              <div className={`w-16 h-16 rounded-2xl ${feature.bg} flex items-center justify-center ${feature.color} mb-8 shadow-sm group-hover:scale-110 transition-transform`}>
                <feature.icon size={28} />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter italic mb-4 leading-none">{feature.title}</h3>
              <p className="text-zinc-500 font-medium leading-relaxed italic">{feature.desc}</p>
            </motion.div>
          ))}
        </section>

        {/* Call to Action */}
        <section className="max-w-7xl mx-auto mb-32 px-6">
          <div className="relative p-12 md:p-20 rounded-[3rem] bg-zinc-900 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-700/20 to-transparent" />
            
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9] italic">
                  ON-DEMAND <br />
                  <span className="text-red-700 not-italic">ELITE DRIVERS.</span>
                </h2>
                <p className="text-zinc-400 text-lg font-medium leading-relaxed italic">
                  Join the thousands of car owners who trust Convivia24 for their daily movements and long-distance travel.
                </p>
                <div className="flex gap-4">
                  <Link href="/support" className="px-10 py-4 bg-red-700 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-red-800 transition-all shadow-xl shadow-red-900/40 active:scale-95">
                    Get Started
                  </Link>
                  <Link href="/support" className="px-10 py-4 bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white/10 transition-all active:scale-95">
                    Learn More
                  </Link>
                </div>
              </div>
              <div className="hidden lg:flex justify-center">
                <motion.img 
                  src="/Logo2.png" 
                  alt="" 
                  className="w-64 h-64 opacity-20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <img src="/convivia24.png" alt="Convivia24" className="h-10 w-auto object-contain" />
            </Link>
            <div className="flex flex-wrap justify-center gap-10">
              {['Support'].map((link) => (
                <Link key={link} href="/support" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-red-700 transition-colors">
                  {link}
                </Link>
              ))}
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-red-700 transition-all cursor-pointer">
                <Star size={18} />
              </div>
              <div className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-red-700 transition-all cursor-pointer">
                <Users size={18} />
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-zinc-50 text-center flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em]">© 2024 CONVIVIA24 INFRASTRUCTURE. ALL RIGHTS RESERVED.</p>
            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em]">LAGOS • ABUJA • LONDON</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
