'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

const industries = ['Technology', 'Financial Services', 'Healthcare', 'Retail & Distribution', 'Professional Services', 'Manufacturing', 'Real Estate', 'Other'];
const teamSizes = ['1–5', '6–20', '21–50', '51–200', '200+'];
const revenueRanges = ['Under $10k/month', '$10k–$50k/month', '$50k–$200k/month', '$200k+/month'];
const challenges = [
  'Cold leads that never convert',
  'Sales cycle longer than 90 days',
  'No documented sales strategy or playbook',
  'Poor or underutilised CRM',
  'Inconsistent team performance',
  'Weak follow-up processes',
  'No visibility into pipeline health',
];
const timelines = ['Immediately', 'Within 3 months', 'Within 6 months', 'Within 12 months'];

interface FormData {
  companyName: string; industry: string; teamSize: string; monthlyRevenue: string;
  challenges: string[]; revenueGoal: string; timeline: string; name: string; email: string; phone: string;
}

export default function AuditPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    companyName: '', industry: '', teamSize: '', monthlyRevenue: '',
    challenges: [], revenueGoal: '', timeline: '', name: '', email: '', phone: '',
  });
  const [submitted, setSubmitted] = useState(false);

  function updateField(field: keyof FormData, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function toggleChallenge(challenge: string) {
    setFormData(prev => ({
      ...prev,
      challenges: prev.challenges.includes(challenge)
        ? prev.challenges.filter(c => c !== challenge)
        : [...prev.challenges, challenge],
    }));
  }

  const inputClass = 'w-full bg-transparent border-b border-zinc-700 focus:border-red-600 text-white py-3 text-sm outline-none transition-colors placeholder-zinc-600';
  const labelClass = 'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5';
  const selectClass = 'w-full bg-zinc-800 border border-zinc-700 focus:border-red-600 text-white py-2.5 px-3 text-sm outline-none transition-colors cursor-pointer rounded';

  const steps = [{ num: 1, label: 'Company' }, { num: 2, label: 'Challenges' }, { num: 3, label: 'Contact' }];

  return (
    <div className="min-h-screen bg-zinc-900 overflow-x-hidden">

      {/* Header */}
      <section className="pt-32 pb-10 px-6 text-center border-b border-zinc-800 relative overflow-hidden">
        {/* Animated accent lines */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-red-700"
          initial={{ width: 0 }}
          animate={{ width: '50%' }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03]">
          <span className="text-[20rem] font-black text-white leading-none">✓</span>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3"
          >
            Free Assessment
          </motion.p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-tight mb-3">
            Request Your<br />
            <span className="text-red-500 italic">Sales Audit</span>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed"
          >
            We review every submission within 24 hours and provide a personalised Sales Health Assessment — at no cost.
          </motion.p>
          {/* Trust signals */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-6 mt-6"
          >
            {[
              { val: '24h', label: 'Response time' },
              { val: '47+', label: 'Clients audited' },
              { val: '100%', label: 'Free assessment' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <p className="text-lg font-black text-red-500 leading-none">{item.val}</p>
                <p className="text-[9px] uppercase tracking-widest text-zinc-600 mt-0.5">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {submitted ? (
        <section className="py-16 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto text-center space-y-6"
          >
            <div className="w-14 h-14 bg-red-700 flex items-center justify-center mx-auto rounded-full">
              <Check size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white mb-2">Audit Request Received.</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Our team will contact you within 24 hours with your personalised Sales Health Assessment.
              </p>
            </div>
            <div className="border border-zinc-800 rounded p-5 text-left space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Summary</p>
              <p className="text-sm text-zinc-300"><span className="text-zinc-500 text-xs">Company: </span>{formData.companyName}</p>
              <p className="text-sm text-zinc-300"><span className="text-zinc-500 text-xs">Industry: </span>{formData.industry}</p>
              <p className="text-sm text-zinc-300"><span className="text-zinc-500 text-xs">Contact: </span>{formData.name} · {formData.email}</p>
            </div>
          </motion.div>
        </section>
      ) : (
        <section className="py-10 px-6 pb-20">
          <div className="max-w-lg mx-auto">

            {/* Step indicator */}
            <div className="flex items-center mb-10">
              {steps.map((s, idx) => (
                <React.Fragment key={s.num}>
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full transition-colors ${
                      step > s.num ? 'bg-red-700 text-white'
                      : step === s.num ? 'bg-white text-zinc-900'
                      : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      {step > s.num ? <Check size={12} /> : s.num}
                    </div>
                    <p className={`text-[10px] font-semibold uppercase tracking-widest hidden sm:block ${
                      step >= s.num ? 'text-zinc-400' : 'text-zinc-700'
                    }`}>{s.label}</p>
                  </div>
                  {idx < 2 && (
                    <div className={`flex-1 h-px mx-3 transition-colors ${step > s.num ? 'bg-red-700' : 'bg-zinc-800'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
              <AnimatePresence mode="wait">

                {/* Step 1 */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1">Tell us about your company.</h2>
                      <p className="text-sm text-zinc-500">This helps us benchmark your pipeline against industry averages.</p>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className={labelClass}>Company Name</label>
                        <input type="text" value={formData.companyName} onChange={e => updateField('companyName', e.target.value)} placeholder="Your company name" required className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Industry</label>
                        <select value={formData.industry} onChange={e => updateField('industry', e.target.value)} required className={selectClass}>
                          <option value="" disabled>Select industry</option>
                          {industries.map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Team Size</label>
                        <select value={formData.teamSize} onChange={e => updateField('teamSize', e.target.value)} required className={selectClass}>
                          <option value="" disabled>Select team size</option>
                          {teamSizes.map(s => <option key={s} value={s}>{s} people</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Current Monthly Revenue</label>
                        <select value={formData.monthlyRevenue} onChange={e => updateField('monthlyRevenue', e.target.value)} required className={selectClass}>
                          <option value="" disabled>Select revenue range</option>
                          {revenueRanges.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>

                    <button type="button" onClick={() => setStep(2)} className="w-full py-3.5 bg-red-700 text-white text-sm font-semibold uppercase tracking-wider hover:bg-red-800 transition-colors flex items-center justify-center gap-2 group">
                      Continue <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </motion.div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1">What's holding your revenue back?</h2>
                      <p className="text-sm text-zinc-500">Select all that apply.</p>
                    </div>

                    <div className="space-y-2">
                      {challenges.map(challenge => {
                        const selected = formData.challenges.includes(challenge);
                        return (
                          <label key={challenge} className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${
                            selected ? 'border-red-700 bg-red-700/10' : 'border-zinc-800 hover:border-zinc-600'
                          }`}>
                            <div className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center rounded-sm transition-colors ${
                              selected ? 'border-red-700 bg-red-700' : 'border-zinc-600'
                            }`}>
                              {selected && <Check size={10} className="text-white" />}
                            </div>
                            <input type="checkbox" checked={selected} onChange={() => toggleChallenge(challenge)} className="hidden" />
                            <span className={`text-sm transition-colors ${selected ? 'text-white' : 'text-zinc-400'}`}>{challenge}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="flex gap-3">
                      <button type="button" onClick={() => setStep(1)} className="px-5 py-3.5 border border-zinc-700 text-zinc-400 text-sm font-semibold hover:border-zinc-500 hover:text-white transition-colors flex items-center gap-1.5 group">
                        <ChevronLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" /> Back
                      </button>
                      <button type="button" onClick={() => setStep(3)} className="flex-1 py-3.5 bg-red-700 text-white text-sm font-semibold uppercase tracking-wider hover:bg-red-800 transition-colors flex items-center justify-center gap-2 group">
                        Continue <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1">Where do you want to go?</h2>
                      <p className="text-sm text-zinc-500">Your goals and how to reach you.</p>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className={labelClass}>Primary Revenue Goal</label>
                        <input type="text" value={formData.revenueGoal} onChange={e => updateField('revenueGoal', e.target.value)} placeholder="e.g. Double revenue in 12 months" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Desired Timeline</label>
                        <select value={formData.timeline} onChange={e => updateField('timeline', e.target.value)} required className={selectClass}>
                          <option value="" disabled>When do you need results?</option>
                          {timelines.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>

                      <div className="border-t border-zinc-800 pt-5 space-y-5">
                        <p className={labelClass}>Your Contact Details</p>
                        <div>
                          <label className={labelClass}>Full Name</label>
                          <input type="text" value={formData.name} onChange={e => updateField('name', e.target.value)} placeholder="Your full name" required className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Business Email</label>
                          <input type="email" value={formData.email} onChange={e => updateField('email', e.target.value)} placeholder="you@company.com" required className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Phone Number</label>
                          <input type="tel" value={formData.phone} onChange={e => updateField('phone', e.target.value)} placeholder="+44 or +234..." className={inputClass} />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button type="button" onClick={() => setStep(2)} className="px-5 py-3.5 border border-zinc-700 text-zinc-400 text-sm font-semibold hover:border-zinc-500 hover:text-white transition-colors flex items-center gap-1.5 group">
                        <ChevronLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" /> Back
                      </button>
                      <button type="submit" className="flex-1 py-3.5 bg-red-700 text-white text-sm font-semibold uppercase tracking-wider hover:bg-red-800 transition-colors">
                        Submit Audit Request
                      </button>
                    </div>

                    <p className="text-center text-[10px] text-zinc-600">We review every submission within 24 hours</p>
                  </motion.div>
                )}

              </AnimatePresence>
            </form>
          </div>
        </section>
      )}

    </div>
  );
}
