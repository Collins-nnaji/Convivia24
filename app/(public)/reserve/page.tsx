'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const SPACES = ['The Floor', 'The Table', 'The Bar', 'The Terrace', 'Private Dining', 'The Lounge'];
const OCCASIONS = ['Birthday', 'Anniversary', 'Business dinner', 'Celebration', 'Date night', 'Other'];

export default function ReservePage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', party_size: '',
    reservation_date: '', reservation_time: '',
    space: 'The Floor', occasion: '', special_requests: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function set(k: keyof typeof form, v: string) { setForm(p => ({ ...p, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          party_size: Number(form.party_size),
          phone: form.phone || undefined,
          occasion: form.occasion || undefined,
          special_requests: form.special_requests || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong. Please try again.'); return; }
      setSuccess(true);
    } catch {
      setError('Unable to submit reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-obsidian min-h-screen -mt-16 pt-32 pb-24">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #c9a84c 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-16 items-start">

          {/* LEFT */}
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }} className="lg:sticky lg:top-32">
            <motion.div variants={fadeUp}><SectionLabel>Book a Table</SectionLabel></motion.div>
            <motion.h1 variants={fadeUp} className="font-display text-4xl sm:text-6xl md:text-7xl font-light italic tracking-tight text-cream leading-[0.9] mb-6">
              Reserve<br />your seat.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-cream/50 text-base leading-relaxed mb-12 max-w-md">
              Tables confirmed within 2 hours. For same-day reservations or The Chef&apos;s Table,
              use the <Link href="/inquire" className="text-gold/70 hover:text-gold transition-colors">enquiry form</Link>.
            </motion.p>

            <motion.div variants={fadeUp} className="space-y-4 mb-12">
              {[
                { num: '01', text: 'Walk-ins welcome for lunch and early dinner.' },
                { num: '02', text: 'Reservations for groups of 6+ strongly recommended.' },
                { num: '03', text: 'The Chef\'s Table (6 seats) requires advance enquiry.' },
              ].map(s => (
                <div key={s.num} className="flex items-start gap-4">
                  <span className="text-[10px] font-black text-gold/50 mt-0.5 shrink-0">{s.num}</span>
                  <p className="text-cream/60 text-sm">{s.text}</p>
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
                <h2 className="font-display text-3xl italic text-cream mb-3">You&apos;re booked in.</h2>
                <p className="text-cream/50 text-sm mb-8">
                  We&apos;ll confirm your reservation within 2 hours. Check your email for a confirmation.
                </p>
                <Link href="/menu" className="inline-flex items-center gap-2 text-gold/60 hover:text-gold text-[10px] font-black uppercase tracking-[0.2em] transition-colors">
                  View the Menu <ArrowRight size={11} />
                </Link>
              </div>
            ) : (
              <div className="border border-gold/15 p-8 sm:p-10">
                <div className="h-px bg-gold mb-8" />
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name + Email */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    {([['Name', 'name', 'text', true], ['Email', 'email', 'email', true]] as const).map(([lbl, key, type, req]) => (
                      <div key={key}>
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/60 block mb-2">{lbl}</label>
                        <input type={type} value={form[key]} onChange={e => set(key, e.target.value)} required={req}
                          className="w-full bg-transparent border-0 border-b border-gold/20 focus:border-gold focus:ring-0 text-cream text-sm py-3 px-0 placeholder-cream/20 transition-colors"
                          placeholder={key === 'email' ? 'your@email.com' : 'Your full name'} />
                      </div>
                    ))}
                  </div>

                  {/* Phone + Party size */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/60 block mb-2">
                        Phone <span className="text-cream/20">(Optional)</span>
                      </label>
                      <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                        className="w-full bg-transparent border-0 border-b border-gold/20 focus:border-gold focus:ring-0 text-cream text-sm py-3 px-0 placeholder-cream/20 transition-colors"
                        placeholder="+234 800 000 0000" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/60 block mb-2">Party size</label>
                      <input type="number" min="1" max="200" value={form.party_size} onChange={e => set('party_size', e.target.value)} required
                        className="w-full bg-transparent border-0 border-b border-gold/20 focus:border-gold focus:ring-0 text-cream text-sm py-3 px-0 placeholder-cream/20 transition-colors"
                        placeholder="2" />
                    </div>
                  </div>

                  {/* Date + Time */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/60 block mb-2">Date</label>
                      <input type="date" value={form.reservation_date} onChange={e => set('reservation_date', e.target.value)} required
                        min={new Date().toISOString().slice(0, 10)}
                        className="w-full bg-transparent border-0 border-b border-gold/20 focus:border-gold focus:ring-0 text-cream text-sm py-3 px-0 transition-colors" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/60 block mb-2">Time</label>
                      <select value={form.reservation_time} onChange={e => set('reservation_time', e.target.value)} required
                        className="w-full bg-transparent border-0 border-b border-gold/20 focus:border-gold focus:ring-0 text-cream text-sm py-3 px-0 transition-colors appearance-none">
                        <option value="" className="bg-obsidian text-cream/50">Select time</option>
                        {['11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'].map(t => (
                          <option key={t} value={t} className="bg-obsidian text-cream">{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Space */}
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/60 block mb-2">Space</label>
                    <select value={form.space} onChange={e => set('space', e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-gold/20 focus:border-gold focus:ring-0 text-cream text-sm py-3 px-0 transition-colors appearance-none">
                      {SPACES.map(s => <option key={s} value={s} className="bg-obsidian text-cream">{s}</option>)}
                    </select>
                  </div>

                  {/* Occasion */}
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/60 block mb-2">
                      Occasion <span className="text-cream/20">(Optional)</span>
                    </label>
                    <select value={form.occasion} onChange={e => set('occasion', e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-gold/20 focus:border-gold focus:ring-0 text-cream text-sm py-3 px-0 transition-colors appearance-none">
                      <option value="" className="bg-obsidian text-cream/50">Select occasion</option>
                      {OCCASIONS.map(o => <option key={o} value={o} className="bg-obsidian text-cream">{o}</option>)}
                    </select>
                  </div>

                  {/* Special requests */}
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/60 block mb-2">
                      Special requests <span className="text-cream/20">(Optional)</span>
                    </label>
                    <textarea value={form.special_requests} onChange={e => set('special_requests', e.target.value)} rows={3}
                      className="w-full bg-transparent border-0 border-b border-gold/20 focus:border-gold focus:ring-0 text-cream text-sm py-3 px-0 placeholder-cream/20 transition-colors resize-none"
                      placeholder="Dietary requirements, celebrations, accessibility needs..." />
                  </div>

                  {error && <p className="text-red-400 text-xs">{error}</p>}

                  <button type="submit" disabled={loading}
                    className="w-full bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] py-4 transition-colors disabled:opacity-60">
                    {loading ? 'Submitting…' : 'Reserve Table'}
                  </button>

                  <p className="text-center text-cream/20 text-[10px] uppercase tracking-[0.2em]">
                    Confirmed within 2 hours &middot; Free cancellation 24h in advance
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
