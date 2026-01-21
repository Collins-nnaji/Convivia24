'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, Bell, Shield, 
  CreditCard, Smartphone, LogOut,
  ChevronRight, ArrowRight
} from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Account Settings</h1>
        <p className="text-zinc-500 font-medium text-sm">Manage your profile, security, and preferences.</p>
      </header>

      <div className="max-w-3xl space-y-12">
        {/* Profile Section */}
        <section className="space-y-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest italic border-b border-white/5 pb-4 flex items-center gap-2">
            <User size={16} className="text-red-700" />
            Personal Profile
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Full Name</label>
              <input type="text" defaultValue="John Doe" className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-red-700 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
              <input type="email" defaultValue="john@example.com" className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-red-700 transition-colors" />
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="space-y-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest italic border-b border-white/5 pb-4 flex items-center gap-2">
            <Shield size={16} className="text-red-700" />
            Security & Authentication
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Two-Factor Authentication', status: 'Enabled', action: 'Configure' },
              { label: 'Login History', status: 'Lagos, NG', action: 'View All' },
              { label: 'Password', status: 'Last changed 3mo ago', action: 'Update' },
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-between group hover:bg-zinc-900 transition-all">
                <div>
                  <p className="text-sm font-black text-white uppercase tracking-tight">{item.label}</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{item.status}</p>
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest text-red-700 hover:text-red-600 flex items-center gap-2">
                  {item.action} <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Notifications */}
        <section className="space-y-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest italic border-b border-white/5 pb-4 flex items-center gap-2">
            <Bell size={16} className="text-red-700" />
            Notification Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-white uppercase tracking-tight">Email Alerts</p>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Receipts, trip summaries, and billing</p>
              </div>
              <div className="w-12 h-6 bg-red-700 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-white uppercase tracking-tight">Push Notifications</p>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Driver arrivals and safety alerts</p>
              </div>
              <div className="w-12 h-6 bg-zinc-800 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-zinc-600 rounded-full" />
              </div>
            </div>
          </div>
        </section>

        <div className="pt-12 border-t border-white/5">
          <button className="flex items-center gap-2 text-red-700 font-black uppercase tracking-widest text-xs hover:text-red-600 transition-colors">
            <LogOut size={16} />
            Deactivate Account
          </button>
        </div>
      </div>
    </div>
  );
}
