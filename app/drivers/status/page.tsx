'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ShieldCheck, Clock, FileText, 
  CheckCircle2, AlertCircle, ArrowRight
} from 'lucide-react';

export default function DriverStatus() {
  const steps = [
    { label: "Application Received", status: "COMPLETED", date: "Oct 24, 2024" },
    { label: "Document Verification", status: "COMPLETED", date: "Oct 25, 2024" },
    { label: "Practical Driving Test", status: "IN_PROGRESS", date: "Scheduled: Oct 28" },
    { label: "Background Check", status: "PENDING", date: "Pending previous steps" },
    { label: "Final Approval", status: "PENDING", date: "---" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-red-700 selection:text-white p-6 md:p-20">
      <div className="max-w-2xl mx-auto space-y-12">
        <header className="text-center space-y-6">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors">
            <ShieldCheck size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Verification Status</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-zinc-900 uppercase tracking-tighter italic leading-none">
            APPLICATION <br />
            <span className="text-red-700">TRACKER</span>
          </h1>
          <p className="text-zinc-500 font-medium italic">Applicant ID: DRV-99210-NG</p>
        </header>

        <div className="p-8 md:p-12 rounded-[2.5rem] bg-white border border-zinc-200 shadow-2xl space-y-10">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-zinc-100" />
            
            <div className="space-y-8 relative z-10">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-6">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all ${
                    step.status === 'COMPLETED' ? 'bg-green-500' : 
                    step.status === 'IN_PROGRESS' ? 'bg-red-700 animate-pulse' : 
                    'bg-zinc-200'
                  }`}>
                    {step.status === 'COMPLETED' && <CheckCircle2 size={12} className="text-white" />}
                    {step.status === 'IN_PROGRESS' && <Clock size={12} className="text-white" />}
                  </div>
                  <div className="space-y-1 flex-1 border-b border-zinc-50 pb-6 last:border-0">
                    <h3 className={`text-sm font-black uppercase tracking-tight italic ${
                      step.status === 'PENDING' ? 'text-zinc-300' : 'text-zinc-900'
                    }`}>
                      {step.label}
                    </h3>
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">{step.date}</p>
                      {step.status === 'IN_PROGRESS' && (
                        <span className="text-[8px] font-black uppercase tracking-widest bg-red-50 text-red-700 px-2 py-1 rounded-full">Active Step</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100 flex gap-4">
            <AlertCircle size={20} className="text-zinc-400 flex-shrink-0" />
            <div>
              <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest italic mb-1">What's next?</h4>
              <p className="text-[10px] text-zinc-500 leading-relaxed font-medium italic">Please ensure you have your original documents ready for the practical driving test. You will receive an SMS confirmation 24 hours before the appointment.</p>
            </div>
          </div>
        </div>

        <footer className="text-center italic">
          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-300">Convivia24 Quality Assurance Infrastructure</p>
        </footer>
      </div>
    </div>
  );
}
