'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Droplets, ShieldCheck, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const products = [
  {
    id: 1,
    name: 'Convivia24 Premium Liquid',
    category: 'Wash Liquid',
    price: 3000,
    rating: 4.9,
    image: '/Car Wash Liquid1.png',
    tag: 'Top Rated',
    desc: 'Deep cleaning formula for a spotless finish.'
  },
  {
    id: 2,
    name: 'Convivia24 Ultra Spray',
    category: 'Detailing Spray',
    price: 4000,
    rating: 4.8,
    image: '/Car Wash Spray1.png',
    tag: 'Easy Use',
    desc: 'Instant shine and protection in one spray.'
  },
  {
    id: 3,
    name: 'The Elite Bundle',
    category: 'Full Kit',
    price: 7000,
    rating: 5.0,
    image: '/Car Wash Liquid and Spray1.png',
    tag: 'Best Value',
    desc: '1 Premium Liquid + 1 Ultra Spray. Save more.',
    isBundle: true
  },
  {
    id: 4,
    name: 'Pro Series Liquid',
    category: 'Wash Liquid',
    price: 3000,
    rating: 4.7,
    image: '/Car Wash Liquid2.png',
    tag: 'Pro Choice',
    desc: 'Industrial strength for personal car care.'
  }
];

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
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

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors mb-6 text-sm font-bold uppercase tracking-widest">
              <ArrowLeft size={16} />
              Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tighter uppercase italic leading-none">
              Convivia24 <span className="text-red-700 not-italic">Market</span>
            </h1>
            <p className="text-zinc-500 font-medium italic mt-2">Premium car care solutions, delivered to your door.</p>
          </div>
          <div className="flex gap-4">
            <div className="px-6 py-3 bg-white border border-zinc-200 rounded-2xl flex items-center gap-3 shadow-sm">
              <Droplets className="text-red-700" size={20} />
              <span className="text-sm font-black italic uppercase tracking-tight">Express Delivery in Lagos</span>
            </div>
          </div>
        </header>

        {/* Product Highlights */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Zap, label: 'Fast Acting', color: 'text-amber-500', bg: 'bg-amber-50' },
            { icon: ShieldCheck, label: 'Paint Safe', color: 'text-green-500', bg: 'bg-green-50' },
            { icon: Star, label: 'Premium Quality', color: 'text-red-700', bg: 'bg-red-50' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center`}>
                <item.icon size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 italic">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              className="group bg-white rounded-[2.5rem] border border-zinc-100 p-4 shadow-sm hover:shadow-2xl transition-all"
            >
              <div className="relative aspect-square rounded-[2rem] bg-zinc-100 overflow-hidden mb-6 flex items-center justify-center p-6">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-widest text-red-700 shadow-sm border border-red-50">
                    {product.tag}
                  </span>
                </div>
                {product.isBundle && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-red-700 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                      Bundle
                    </span>
                  </div>
                )}
              </div>
              
              <div className="px-2 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{product.category}</p>
                    <h3 className="text-lg font-black text-zinc-900 tracking-tight leading-none italic">{product.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">
                    <Star size={12} fill="currentColor" />
                    <span className="text-[10px] font-black">{product.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 font-medium italic leading-relaxed line-clamp-2">
                  {product.desc}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Price</p>
                    <p className="text-xl font-black text-zinc-900 tracking-tighter italic">₦{product.price.toLocaleString()}</p>
                  </div>
                  <button className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center hover:bg-red-700 transition-all shadow-lg active:scale-95 group/btn">
                    <ShoppingBag size={20} className="group-hover/btn:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Featured Banner */}
        <div className="relative p-12 rounded-[3rem] bg-zinc-900 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-700/30 to-transparent" />
          
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-[0.9]">
                The Ultimate <br />
                <span className="text-red-700 not-italic">Car Care Bundle</span>
              </h2>
              <p className="text-zinc-400 text-lg font-medium italic">
                Get our signature Liquid and Spray for just ₦7,000. Complete protection for your vehicle.
              </p>
              <button className="px-10 py-5 bg-red-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-red-800 transition-all shadow-xl shadow-red-900/40 active:scale-95">
                Order Bundle Now
              </button>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="relative w-64 h-64 bg-white/5 rounded-[2.5rem] border border-white/10 p-8">
                <img src="/Car Wash Liquid abd Spray2.png" alt="Bundle" className="w-full h-full object-contain drop-shadow-2xl" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-20 px-6 bg-white mt-20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <img src="/convivia24.png" alt="Convivia24" className="h-10 w-auto object-contain" />
            </Link>
            <div className="flex flex-wrap justify-center gap-10">
              <Link href="/support" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-red-700 transition-colors">
                Support
              </Link>
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
