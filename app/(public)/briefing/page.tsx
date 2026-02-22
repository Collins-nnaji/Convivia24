'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';

type FormState = {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
};

const INITIAL_STATE: FormState = {
  name: '',
  email: '',
  company: '',
  subject: '',
  message: '',
};

const SUBJECT_OPTIONS = [
  'Sales Health Audit — I want a free assessment',
  'Pipeline Management — my sales volumes are not growing',
  'Network Introductions — I need access to the right buyers',
  'Full Managed Engagement — I want Convivia24 to run my sales',
  'Intel Reports — I need data and market benchmarks',
  'Other',
];

export default function BriefingPage() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isDisabled = status === 'saving';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('saving');
    setErrorMessage(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || 'Unable to save right now.');
      }

      setStatus('saved');
      setForm(INITIAL_STATE);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Request failed.');
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  const inputClass = 'w-full border-b-2 border-zinc-200 focus:border-red-700 bg-transparent py-3 text-sm text-zinc-900 outline-none transition-colors placeholder-zinc-400';
  const labelClass = 'block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2';

  if (status === 'saved') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-700 flex items-center justify-center mx-auto mb-8">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-700 mb-3">Received</p>
          <h2 className="text-3xl font-black tracking-tighter text-zinc-900 mb-4">We&apos;ll be in touch within 24 hours.</h2>
          <p className="text-zinc-500 text-sm leading-relaxed mb-10">
            Every message is read by a real person on the Convivia24 team. Expect a direct call or message within one business day — no bots, no drip sequences, no waiting room.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-700 text-white text-sm font-black uppercase tracking-[0.15em] hover:bg-red-800 transition-colors"
            >
              Back to Home
            </Link>
            <Link
              href="/intel"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-zinc-200 text-zinc-700 text-sm font-black uppercase tracking-[0.15em] hover:border-zinc-900 hover:text-zinc-900 transition-colors"
            >
              View Intel
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Grid bg */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(185,28,28,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(185,28,28,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-[1fr_480px] gap-16 items-start">

          {/* Left — context */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-24"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-700 transition-colors mb-10 group"
            >
              <ArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" />
              Back
            </Link>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-700 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              24-Hour Response
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-zinc-900 leading-[0.95] mb-6">
              Let&apos;s talk about<br />
              <span className="text-red-700 italic">your revenue.</span>
            </h1>

            <p className="text-zinc-500 text-base leading-relaxed mb-10 max-w-md">
              Tell us where your sales are stuck. Convivia24 will review your situation and come back with a clear picture of what is blocking growth — and exactly how we fix it.
            </p>

            {/* What happens next */}
            <div className="space-y-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">What happens next</p>
              {[
                { step: '01', label: 'We review your submission', sub: 'Every inquiry is read by a real person on the Convivia24 team within 24 hours — guaranteed.' },
                { step: '02', label: 'We schedule a working call', sub: 'A focused 30-minute session to map your pipeline gaps, priorities, and revenue goals.' },
                { step: '03', label: 'You get a clear roadmap', sub: 'A written Sales Health Assessment delivered free — what\'s broken, what to fix first, and how we do it.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.12 }}
                  className="flex gap-5 border-l-2 border-red-700/20 pl-5"
                >
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-700 mb-1">{item.step}</p>
                    <p className="text-sm font-bold text-zinc-900 mb-0.5">{item.label}</p>
                    <p className="text-xs text-zinc-500 leading-relaxed">{item.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Locations */}
            <div className="mt-12 pt-8 border-t border-zinc-100">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">We operate from</p>
              <p className="text-sm text-zinc-700 font-semibold">Lagos · Abuja · London</p>
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="bg-white border-2 border-zinc-100 p-8 md:p-10 relative overflow-hidden">
              {/* Red top accent */}
              <motion.div
                className="absolute top-0 left-0 h-0.5 bg-red-700"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
              />

              <h2 className="text-xl font-black tracking-tight text-zinc-900 mb-8">Send us a message</h2>

              <form onSubmit={handleSubmit} className="space-y-7">

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Your Name</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      disabled={isDisabled}
                      placeholder="Full name"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Business Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      disabled={isDisabled}
                      placeholder="you@company.com"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Company</label>
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    disabled={isDisabled}
                    placeholder="Your company name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>What brings you here?</label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    disabled={isDisabled}
                    required
                    className="w-full border-b-2 border-zinc-200 focus:border-red-700 bg-transparent py-3 text-sm text-zinc-900 outline-none transition-colors cursor-pointer"
                  >
                    <option value="" disabled>Select the best fit</option>
                    {SUBJECT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Tell us more</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    disabled={isDisabled}
                    required
                    rows={5}
                    placeholder="Describe your sales situation — where you're stuck, team size, revenue targets, or anything that helps us understand what you're working with."
                    className="w-full border-b-2 border-zinc-200 focus:border-red-700 bg-transparent py-3 text-sm text-zinc-900 outline-none transition-colors resize-none placeholder-zinc-400"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isDisabled}
                    className="w-full inline-flex items-center justify-center gap-2 py-4 bg-red-700 text-white text-sm font-black uppercase tracking-[0.15em] hover:bg-red-800 disabled:opacity-50 transition-colors group"
                  >
                    {status === 'saving' ? 'Sending…' : (
                      <>
                        Send Inquiry
                        <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>

                  {status === 'error' && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 text-xs text-red-700 font-semibold"
                    >
                      {errorMessage || 'Something went wrong. Please try again.'}
                    </motion.p>
                  )}

                  <p className="text-center text-[10px] text-zinc-400 mt-4 uppercase tracking-[0.15em]">
                    Response within 24 hours · No commitment required
                  </p>
                </div>

              </form>
            </div>

            {/* Alternative CTA */}
            <div className="mt-6 p-5 bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-zinc-900">Not sure where to start?</p>
                <p className="text-xs text-zinc-500 mt-0.5">See exactly what Convivia24 does and how we engage.</p>
              </div>
              <Link
                href="/collective#what-we-do"
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.15em] hover:bg-zinc-800 transition-colors"
              >
                What We Do
                <ArrowRight size={11} />
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
