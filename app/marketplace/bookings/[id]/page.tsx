'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Download, Share2, AlertTriangle, 
  MapPin, Clock, User, Car, ShieldCheck, Receipt 
} from 'lucide-react';
import Link from 'next/link';

export default function BookingDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-10">
      <header className="flex justify-between items-center">
        <Link href="/marketplace/bookings" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors">
          <ArrowLeft size={20} />
          <span className="text-xs font-black uppercase tracking-widest">Back to History</span>
        </Link>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-zinc-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-all shadow-sm">
            <Share2 size={14} /> Share
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-red-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-800 transition-all shadow-lg shadow-red-900/20">
            <Download size={14} /> Receipt
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Main Info */}
          <section className="p-8 rounded-3xl bg-white border border-zinc-200 space-y-8 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-red-700 mb-2">Booking ID: {params.id}</p>
                <h1 className="text-3xl font-black text-zinc-900 uppercase tracking-tight italic">Trip Details</h1>
              </div>
              <div className="px-4 py-2 rounded-full bg-green-50 border border-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest">
                Completed
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-300 border border-zinc-100 shadow-sm">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Time & Duration</p>
                    <p className="text-sm font-bold text-zinc-900 uppercase tracking-tight italic">Oct 24, 2024 • 09:00 AM</p>
                    <p className="text-xs text-zinc-500 font-medium italic">Duration: 1h 45m</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-300 border border-zinc-100 shadow-sm">
                    <Car size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Vehicle Info</p>
                    <p className="text-sm font-bold text-zinc-900 uppercase tracking-tight italic">Toyota Land Cruiser Prado</p>
                    <p className="text-xs text-zinc-500 font-medium italic">LND-922-AZ (Black)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-300 border border-zinc-100 shadow-sm">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Pickup</p>
                    <p className="text-sm font-bold text-zinc-900 uppercase tracking-tight italic">VGC Estate Gate, Lekki</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-300 border border-zinc-100 shadow-sm">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Destination</p>
                    <p className="text-sm font-bold text-zinc-900 uppercase tracking-tight italic">Civic Center, Victoria Island</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Incident Form CTA */}
          <section className="p-8 rounded-3xl bg-zinc-50 border-2 border-dashed border-zinc-200 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-red-50 text-red-700">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="text-base font-black text-zinc-900 uppercase tracking-tight italic">Report an issue</h4>
                <p className="text-xs text-zinc-500 font-medium italic">Disputes, safety concerns, or feedback regarding this trip.</p>
              </div>
            </div>
            <button className="px-6 py-3 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
              Open Report
            </button>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-white border border-zinc-200 space-y-8 shadow-sm">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest italic border-b border-zinc-100 pb-4">Payment Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium uppercase tracking-widest text-[10px]">Base Trip Fare</span>
                <span className="text-zinc-900 font-bold tracking-tight">₦18,000.00</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium uppercase tracking-widest text-[10px]">Service Fee</span>
                <span className="text-zinc-900 font-bold tracking-tight">₦2,500.00</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium uppercase tracking-widest text-[10px]">VAT (7.5%)</span>
                <span className="text-zinc-900 font-bold tracking-tight">₦4,000.00</span>
              </div>
              <div className="pt-4 border-t border-zinc-100 flex justify-between items-center">
                <span className="text-xs font-black text-zinc-900 uppercase tracking-widest italic">Total Amount</span>
                <span className="text-xl font-black text-red-700 tracking-tighter italic">₦24,500.00</span>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-zinc-200 space-y-6 shadow-sm">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest italic border-b border-zinc-100 pb-4">Assigned Driver</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-300 overflow-hidden shadow-sm">
                <User size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-zinc-900 uppercase tracking-tight italic">Adeyemi O.</p>
                <div className="flex items-center gap-1">
                  <ShieldCheck size={12} className="text-green-500" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Gold Level Vetted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
