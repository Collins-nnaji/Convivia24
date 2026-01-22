'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Mic, MessageCircle, TrendingUp, Play, Apple, 
  Users, CheckCircle2, Star, Calendar, BarChart3,
  Sparkles, Target, Zap, Heart
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
          </div>
        </div>
      </nav>

      <main className="relative">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-screen bg-gradient-to-l from-red-50 to-transparent pointer-events-none -z-10 opacity-50" />
        
        <section className="pt-40 pb-32 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-12 xl:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-10 relative z-20"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-red-100 text-red-700 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                Build Speaking Confidence Daily
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-zinc-900 leading-[0.95] italic">
                <span className="block">CONVERSATIONS.</span>
                <span className="text-red-700 not-italic">24/7 CONFIDENCE.</span>
              </h1>
              
              <p className="text-2xl md:text-3xl text-zinc-700 font-bold leading-relaxed">
                Better Conversations. Anytime.
              </p>
              
              <p className="text-lg text-zinc-500 max-w-xl leading-relaxed font-medium italic">
                Learn how to start conversations, break the ice, and prepare for different types of speaking. Create meaningful connections through daily practice in real-life scenarios.
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
                  <p className="text-2xl font-black text-zinc-900 tracking-tighter italic">10,000+</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Practice Sessions</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-zinc-900 tracking-tighter italic">5 min</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Daily Practice</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-zinc-900 tracking-tighter italic">24/7</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Available</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative z-10 lg:order-2 mt-12 lg:mt-0 flex justify-center lg:justify-start"
            >
              <div className="absolute inset-0 bg-red-700/10 rounded-[3rem] blur-[100px] -z-10" />
              <div className="relative aspect-[4/5] w-full max-w-sm lg:max-w-lg xl:max-w-xl rounded-[3rem] bg-white border border-zinc-200 p-4 shadow-2xl overflow-hidden group">
                <div className="relative h-full w-full rounded-[2.5rem] bg-zinc-100 overflow-hidden">
                  {/* AI-generated conversation practice images - Replace these paths with your AI-generated images */}
                  <motion.img 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80" 
                    alt="Person practicing conversation" 
                    className="absolute inset-0 w-full h-full object-cover object-center grayscale-[0.1] group-hover:scale-105 transition-transform duration-1000"
                  />
                  <motion.img 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 6, repeat: Infinity, times: [0, 0.5, 1] }}
                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80" 
                    alt="People having conversation" 
                    className="absolute inset-0 w-full h-full object-cover object-center grayscale-[0.1]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/20 to-transparent" />
                  
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="absolute bottom-8 left-8 right-8 p-6 bg-white/90 backdrop-blur-md border border-zinc-200/50 rounded-3xl shadow-xl space-y-4 z-10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center text-white shadow-lg">
                          <Mic size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Daily Practice</p>
                          <p className="text-sm font-black text-zinc-900 uppercase italic">5-Min Sessions</p>
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
        <section className="max-w-7xl mx-auto py-32 px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-zinc-900 uppercase tracking-tighter leading-[0.9] italic mb-6">
              HOW IT <span className="text-red-700">WORKS</span>
            </h2>
            <p className="text-xl text-zinc-500 font-medium italic max-w-2xl mx-auto">
              Build connections and confidence through structured practice
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 mb-20">
            {[
              { 
                icon: Mic, 
                title: 'Solo Practice', 
                desc: 'Learn how to start conversations with real-life prompts. Practice breaking the ice in coffee shops, giving feedback at work, making small talk at events. Prepare for different speaking situations in private 5-minute sessions.',
                color: 'text-red-700',
                bg: 'bg-red-50'
              },
              { 
                icon: Users, 
                title: 'Partner Matching', 
                desc: 'Create meaningful connections by practicing with others. Break the ice with pre-selected topics that make conversations feel natural. Build confidence through real interactions in a safe, structured environment.',
                color: 'text-blue-700',
                bg: 'bg-blue-50'
              },
              { 
                icon: TrendingUp, 
                title: 'Track Progress', 
                desc: 'See your streak, total sessions, and time spent practicing. Watch your confidence grow as you master different types of speaking situations and build stronger connections.',
                color: 'text-purple-700',
                bg: 'bg-purple-50'
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
          </div>
        </section>

        {/* Benefits Section */}
        <section className="max-w-7xl mx-auto py-32 px-6 bg-gradient-to-br from-zinc-50 to-white rounded-[3rem]">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-zinc-900 uppercase tracking-tighter leading-[0.9] italic mb-6">
              PREPARE FOR <span className="text-red-700">ANY SITUATION</span>
            </h2>
            <p className="text-xl text-zinc-500 font-medium italic max-w-2xl mx-auto">
              Master different types of speaking and build confidence in every conversation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Sparkles, title: 'Social Events', desc: 'Break the ice at parties, networking events, and social gatherings' },
              { icon: Target, title: 'Workplace', desc: 'Give feedback, present ideas, and communicate with confidence' },
              { icon: Heart, title: 'Personal', desc: 'Build deeper connections in dating, friendships, and relationships' },
              { icon: Zap, title: 'Daily Life', desc: 'Order coffee, ask for directions, make small talk naturally' }
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl bg-white border border-zinc-100 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center text-red-700 mb-6">
                  <benefit.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tighter italic mb-3">{benefit.title}</h3>
                <p className="text-zinc-500 font-medium leading-relaxed text-sm">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pricing Tiers */}
        <section className="max-w-7xl mx-auto mb-32 px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-zinc-900 uppercase tracking-tighter leading-[0.9] italic mb-6">
              CHOOSE YOUR <span className="text-red-700">PLAN</span>
            </h2>
            <p className="text-xl text-zinc-500 font-medium italic max-w-2xl mx-auto">
              Start free, upgrade when you're ready for real conversations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <motion.div
              whileHover={{ y: -10 }}
              className="p-10 rounded-[2.5rem] bg-white border-2 border-zinc-200 shadow-lg hover:shadow-2xl transition-all"
            >
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter italic mb-2">Free</h3>
                  <p className="text-4xl font-black text-zinc-900">$0<span className="text-lg text-zinc-500 font-medium">/month</span></p>
                </div>
                <ul className="space-y-4">
                  {[
                    'Solo practice with prompts',
                    'Learn to start conversations',
                    'Prepare for different speaking types',
                    'Record yourself and reflect',
                    'Track your streak and progress',
                    '5-minute daily sessions'
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
                      <span className="text-zinc-600 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full px-8 py-4 bg-zinc-900 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-black transition-all active:scale-95">
                  Get Started Free
                </button>
              </div>
            </motion.div>

            {/* Paid Tier */}
            <motion.div
              whileHover={{ y: -10 }}
              className="p-10 rounded-[2.5rem] bg-gradient-to-br from-red-700 to-red-800 text-white shadow-2xl hover:shadow-red-900/40 transition-all relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/20 text-white text-[8px] font-black uppercase tracking-widest">
                Popular
              </div>
              <div className="space-y-6 relative z-10">
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-2">Premium</h3>
                  <p className="text-4xl font-black">$19.99<span className="text-lg font-medium opacity-80">/month</span></p>
                </div>
                <ul className="space-y-4">
                  {[
                    'Everything in Free',
                    'Break the ice with partners',
                    'Create meaningful connections',
                    'Topic-based conversations',
                    'Chat and schedule sessions',
                    'Priority matching',
                    'Advanced conversation scenarios'
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-white flex-shrink-0" />
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full px-8 py-4 bg-white text-red-700 text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-50 transition-all active:scale-95">
                  Upgrade Now
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials / Social Proof */}
        <section className="max-w-7xl mx-auto py-32 px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-zinc-900 uppercase tracking-tighter leading-[0.9] italic mb-6">
              BUILDING <span className="text-red-700">CONFIDENCE</span>
            </h2>
            <p className="text-xl text-zinc-500 font-medium italic max-w-2xl mx-auto">
              Join thousands who are breaking the ice and creating connections
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "I used to freeze at networking events. Now I can start conversations naturally and build real connections.",
                author: "Sarah M.",
                role: "Marketing Professional"
              },
              {
                quote: "The daily practice helped me prepare for my job interview. I felt confident and got the offer!",
                author: "James K.",
                role: "Software Engineer"
              },
              {
                quote: "Breaking the ice used to be so hard. Now I look forward to meeting new people and starting conversations.",
                author: "Maria L.",
                role: "Graduate Student"
              }
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-2xl bg-white border border-zinc-100 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-zinc-600 font-medium leading-relaxed mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="text-sm font-black text-zinc-900 uppercase tracking-tight">{testimonial.author}</p>
                  <p className="text-xs text-zinc-400 font-medium">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-7xl mx-auto mb-32 px-6">
          <div className="relative p-12 md:p-20 rounded-[3rem] bg-zinc-900 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-700/20 to-transparent" />
            
            <div className="relative z-10 text-center space-y-8">
              <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9] italic">
                READY TO BREAK <br />
                <span className="text-red-700 not-italic">THE ICE?</span>
              </h2>
              <p className="text-zinc-400 text-lg font-medium leading-relaxed italic max-w-2xl mx-auto">
                Start your journey to confident conversations today. Just 5 minutes a day can transform how you connect with others.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
                <button className="flex items-center justify-center gap-4 px-10 py-5 bg-red-700 text-white rounded-2xl shadow-2xl hover:bg-red-800 transition-all active:scale-95 group">
                  <Play size={24} fill="currentColor" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-black tracking-widest text-red-200 group-hover:text-white transition-colors">Get it on</p>
                    <p className="text-xl font-black leading-none">Google Play</p>
                  </div>
                </button>
                <button className="flex items-center justify-center gap-4 px-10 py-5 bg-red-700 text-white rounded-2xl shadow-2xl hover:bg-red-800 transition-all active:scale-95 group">
                  <Apple size={24} fill="currentColor" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-black tracking-widest text-red-200 group-hover:text-white transition-colors">Download on the</p>
                    <p className="text-xl font-black leading-none">App Store</p>
                  </div>
                </button>
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
