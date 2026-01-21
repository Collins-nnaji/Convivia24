'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, 
  ChevronRight, Filter, Download,
  CheckCircle2, AlertCircle, Car
} from 'lucide-react';
import Link from 'next/link';

const mockBookings = [
  {
    id: 'B-99210',
    status: 'COMPLETED',
    pickup: 'VGC, Lekki',
    destination: 'Victoria Island',
    date: 'Oct 24, 2024',
    time: '09:00 AM',
    vehicle: 'Toyota Prado',
    price: '₦24,500'
  },
  {
    id: 'B-99105',
    status: 'COMPLETED',
    pickup: 'Ikeja Gra',
    destination: 'Lekki Phase 1',
    date: 'Oct 20, 2024',
    time: '02:30 PM',
    vehicle: 'Lexus LX 570',
    price: '₦32,000'
  }
];

export default function BookingsPage() {
  const [filter, setFilter] = useState('ALL');

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter">Booking History</h1>
          <p className="text-zinc-500 font-medium text-sm">Review your past trips and download receipts.</p>
        </div>
        <div className="flex gap-2">
          <button className="p-3 rounded-xl bg-white border border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 transition-all shadow-sm">
            <Filter size={18} />
          </button>
          <button className="p-3 rounded-xl bg-white border border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 transition-all shadow-sm">
            <Download size={18} />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-zinc-100 pb-1">
        {['ALL', 'COMPLETED', 'CANCELLED', 'REPORTS'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
              filter === tab ? 'text-red-700' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            {tab}
            {filter === tab && (
              <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700" />
            )}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {mockBookings.map((booking) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="group p-6 rounded-2xl bg-white border border-zinc-200 hover:shadow-xl transition-all flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-8">
              <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:text-red-700 transition-colors">
                <Car size={24} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Route</p>
                  <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-tight truncate max-w-[150px]">
                    {booking.pickup} <span className="text-zinc-300 mx-1">→</span> {booking.destination}
                  </h4>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Date</p>
                  <p className="text-sm font-bold text-zinc-900 uppercase tracking-tight italic">{booking.date}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Vehicle</p>
                  <p className="text-sm font-bold text-zinc-500 uppercase tracking-tight italic">{booking.vehicle}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Cost</p>
                  <p className="text-sm font-black text-red-700 uppercase tracking-tight">{booking.price}</p>
                </div>
              </div>
            </div>
            
            <Link 
              href={`/marketplace/bookings/${booking.id}`}
              className="p-3 rounded-xl bg-zinc-50 text-zinc-300 hover:text-red-700 hover:bg-red-50 transition-all"
            >
              <ChevronRight size={20} />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Support CTA */}
      <div className="p-8 rounded-3xl bg-red-50 border border-red-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-700 flex items-center justify-center shadow-lg">
            <AlertCircle size={24} className="text-white" />
          </div>
          <div>
            <h4 className="text-base font-black text-zinc-900 uppercase tracking-tight italic">Something went wrong?</h4>
            <p className="text-xs text-zinc-500 font-medium">Report issues or request help with any of your previous trips.</p>
          </div>
        </div>
        <Link href="/support" className="px-6 py-3 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-md">
          Contact Safety Team
        </Link>
      </div>
    </div>
  );
}
