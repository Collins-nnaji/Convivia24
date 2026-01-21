'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, Upload, Shield, 
  User, Smartphone, Car,
  FileText, CheckCircle2
} from 'lucide-react';

export default function DriverApplication() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-red-700 selection:text-white p-6 md:p-20">
      <div className="max-w-3xl mx-auto space-y-16">
        <header className="space-y-8 text-center md:text-left">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors">
            <ArrowLeft size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Home</span>
          </Link>
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest">
              <Shield size={12} />
              Professional Driver Portal
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-zinc-900 uppercase tracking-tighter italic leading-none">
              JOIN THE <br />
              <span className="text-red-700 text-6xl md:text-8xl">ELITE.</span>
            </h1>
            <p className="text-zinc-500 font-medium max-w-xl">Start your application to become a Convivia24 vetted professional driver.</p>
          </div>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 md:p-12 rounded-[2.5rem] bg-white border border-zinc-200 shadow-2xl space-y-12"
        >
          {/* Step 1: Personal */}
          <section className="space-y-8">
            <div className="flex items-center gap-4 border-b border-zinc-100 pb-4">
              <span className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-black italic">01</span>
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest italic">Personal Information</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Full Name</label>
                <input type="text" className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 text-zinc-900 font-bold focus:outline-none focus:border-red-700 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Date of Birth</label>
                <input type="date" className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 text-zinc-900 font-bold focus:outline-none focus:border-red-700 transition-colors" />
              </div>
            </div>
          </section>

          {/* Step 2: Docs */}
          <section className="space-y-8">
            <div className="flex items-center gap-4 border-b border-zinc-100 pb-4">
              <span className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-black italic">02</span>
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest italic">Documentation</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: "Valid Driving License", icon: Car },
                { label: "NIN or International Passport", icon: User },
                { label: "Recent LASDRI (Lagos Only)", icon: FileText }
              ].map((doc, i) => (
                <div key={i} className="p-6 rounded-2xl border-2 border-dashed border-zinc-100 hover:border-red-700/30 hover:bg-red-50/30 transition-all group flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-4">
                    <doc.icon size={20} className="text-zinc-300 group-hover:text-red-700 transition-colors" />
                    <span className="text-xs font-black text-zinc-500 uppercase tracking-widest group-hover:text-zinc-900 transition-colors">{doc.label}</span>
                  </div>
                  <Upload size={16} className="text-zinc-300 group-hover:text-red-700 transition-colors" />
                </div>
              ))}
            </div>
          </section>

          <button className="w-full py-5 bg-zinc-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl">
            Submit Application for Review
          </button>

          <div className="p-6 rounded-2xl bg-zinc-50 flex gap-4">
            <Shield size={20} className="text-red-700 flex-shrink-0" />
            <p className="text-[10px] text-zinc-500 leading-relaxed font-medium uppercase tracking-widest">
              By submitting, you consent to a comprehensive background check and character verification process as per Nigeria legal standards.
            </p>
          </div>
        </motion.div>

        <footer className="text-center pt-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 italic italic">Convivia24 Recruitment Infrastructure</p>
        </footer>
      </div>
    </div>
  );
}
