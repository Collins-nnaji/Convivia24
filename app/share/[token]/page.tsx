'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, Clock, User, Car, 
  ShieldCheck, Share2, AlertCircle 
} from 'lucide-react';
import Link from 'next/link';

export default function SharePage({ params }: { params: { token: string } }) {
  // Mock data for the shared trip
  const tripData = {
    status: 'IN_PROGRESS',
    coarseLocation: 'Lekki Phase 1 Area',
    driverFirstName: 'Adeyemi',
    maskedPlate: 'ABC***21',
    scheduleTime: new Date().toISOString(),
    vehicleInfo: 'Silver Lexus LX 570',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 selection:bg-red-700 selection:text-white">
      <div className="w-full max-w-lg">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img src="/convivia24.png" alt="Convivia24" className="h-10 w-auto object-contain" />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-3xl bg-white border border-zinc-200 shadow-2xl space-y-8"
        >
          <header className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest mb-4">
              <ShieldCheck size={12} />
              Active Secure Trip
            </div>
            <h1 className="text-2xl font-black text-zinc-900 uppercase tracking-tight italic">Trip Status</h1>
            <p className="text-zinc-400 text-sm font-medium uppercase tracking-widest mt-1">Token: {params.token.slice(0, 8)}...</p>
          </header>

          <div className="space-y-6">
            {/* Status Item */}
            <div className="flex items-center gap-6 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-red-700 shadow-sm">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Current Status</p>
                <p className="text-lg font-black text-zinc-900 uppercase tracking-tight italic">On the move</p>
              </div>
            </div>

            {/* Privacy-Safe Location */}
            <div className="flex items-center gap-6 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 shadow-sm">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Approx. Location</p>
                <p className="text-lg font-black text-zinc-900 uppercase tracking-tight italic">{tripData.coarseLocation}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1 italic">Driver</p>
                <p className="text-base font-black text-zinc-900 italic uppercase tracking-tight">{tripData.driverFirstName}</p>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1 italic">Vehicle Plate</p>
                <p className="text-base font-black text-zinc-900 italic uppercase tracking-tight">{tripData.maskedPlate}</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-100 flex flex-col gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
              <AlertCircle size={16} className="text-red-700 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-zinc-500 leading-relaxed font-medium italic">
                Precise addresses are hidden for privacy. This link will expire once the trip is completed.
              </p>
            </div>
            <button className="w-full py-4 rounded-2xl bg-zinc-900 text-white text-xs font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl">
              <Share2 size={16} />
              Share Status
            </button>
          </div>
        </motion.div>

        <p className="mt-8 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] italic">
          Powered by Convivia24 Security Infrastructure
        </p>
      </div>
    </div>
  );
}
