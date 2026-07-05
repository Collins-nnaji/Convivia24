'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';

const INQUIRY_TYPES = [
  'Reservation — Dining (group of 6+)',
  'Reservation — The Chef\'s Table',
  'Reservation — Private Dining',
  'Membership — The Convivium',
  'Private Hire — Events',
  'Programming — Convivia Dinner / The Gathering',
  'Partnerships & Press',
  'General Enquiry',
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export default function InquirePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [inquiryType, setInquiryType] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim() || undefined,
          inquiry_type: inquiryType || 'General Enquiry',
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong. Please try again.'); return; }
      setSuccess(true);
    } catch {
      setError('Unable to send your inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-obsidian min-h-screen -mt-16 pt-32 pb-24">
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #c9a84c 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 items-start">

          {/* LEFT */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            className="lg:sticky lg:top-32"
          >
            <motion.div variants={fadeUp}><SectionLabel>Reserve &amp; Enquire</SectionLabel></motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-display text-4xl sm:text-6xl md:text-7xl font-light italic tracking-tight text-cream leading-[0.9] mb-6"
            >
              Let us set a place<br />for you.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-cream/50 text-base leading-relaxed mb-12 max-w-md">
              Whether you&apos;re reserving a table, enquiring about The Chef&apos;s Table, membership,
              or a private event — we read every inquiry personally.
            </motion.p>

            <motion.div variants={fadeUp} className="space-y-6 mb-12">
              {[
                { num: '01', text: 'We read every inquiry personally — no auto-replies.' },
                { num: '02', text: 'We follow up within 24 hours.' },
                { num: '03', text: 'We find the right table for you.' },
              ].map((step) => (
                <div key={step.num} className="flex items-start gap-4">
                  <span className="text-[10px] font-black text-gold/50 mt-0.5 shrink-0">{step.num}</span>
                  <p className="text-cream/60 text-sm">{step.text}</p>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-gold animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cream/30">
                Open from 11am &middot; Lagos &middot; Abuja &middot; London
              </span>
            </motion.div>
          </motion.div>

          {/* RIGHT */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
            {success ? (
              <div className="border border-gold/20 p-10 text-center">
                <div className="w-12 h-12 border border-gold/30 flex items-center justify-center mx-auto mb-6">
                  <Check size={20} className="text-gold" />
                </div>
                <h2 className="font-display text-3xl italic text-cream mb-3">We&apos;ll be in touch.</h2>
                <p className="text-cream/50 text-sm mb-8">
                  Your inquiry has been received. We respond to every message within 24 hours.
                </p>
                <Link href="/menu" className="inline-flex items-center gap-2 text-gold/60 hover:text-gold text-[10px] font-black uppercase tracking-[0.2em] transition-colors">
                  View the Menu <ArrowRight size={11} />
                </Link>
              </div>
            ) : (
              <div className="border border-gold/15 p-8 sm:p-10">
                <div className="h-px bg-gold mb-8" />
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/60 block mb-2">Name</label>
                      <input
                        type="text" value={name} onChange={(e) => setName(e.target.value)} required
                        className="w-full bg-transparent border-0 border-b border-gold/20 focus:border-gold focus:ring-0 text-cream text-sm py-3 px-0 placeholder-cream/20 transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/60 block mb-2">Email</label>
                      <input
                        type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                        className="w-full bg-transparent border-0 border-b border-gold/20 focus:border-gold focus:ring-0 text-cream text-sm py-3 px-0 placeholder-cream/20 transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/60 block mb-2">
                      Company / Organisation <span className="text-cream/20">(Optional)</span>
                    </label>
                    <input
                      type="text" value={company} onChange={(e) => setCompany(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-gold/20 focus:border-gold focus:ring-0 text-cream text-sm py-3 px-0 placeholder-cream/20 transition-colors"
                      placeholder="Your company or organisation"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/60 block mb-2">Enquiry Type</label>
                    <select
                      value={inquiryType} onChange={(e) => setInquiryType(e.target.value)} required
                      className="w-full bg-transparent border-0 border-b border-gold/20 focus:border-gold focus:ring-0 text-cream text-sm py-3 px-0 transition-colors appearance-none"
                    >
                      <option value="" className="bg-obsidian text-cream/50">Select enquiry type</option>
                      {INQUIRY_TYPES.map((type) => (
                        <option key={type} value={type} className="bg-obsidian text-cream">{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/60 block mb-2">Message</label>
                    <textarea
                      value={message} onChange={(e) => setMessage(e.target.value)} required rows={5}
                      className="w-full bg-transparent border-0 border-b border-gold/20 focus:border-gold focus:ring-0 text-cream text-sm py-3 px-0 placeholder-cream/20 transition-colors resize-none"
                      placeholder="Tell us about your reservation, party size, dates, or inquiry..."
                    />
                  </div>

                  {error && <p className="text-red-400 text-xs">{error}</p>}

                  <button
                    type="submit" disabled={loading}
                    className="w-full bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] py-4 transition-colors disabled:opacity-60"
                  >
                    {loading ? 'Sending...' : 'Send Inquiry'}
                  </button>

                  <p className="text-center text-cream/20 text-[10px] uppercase tracking-[0.2em]">
                    Response within 24 hours &middot; No obligation required
                  </p>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
