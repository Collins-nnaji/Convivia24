'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, Shield, Phone, Mail, 
  MessageSquare, ChevronRight, Search,
  Star, Users, Send, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

const faqs = [
  { q: "How are drivers vetted?", a: "Every driver undergoes a multi-stage background check including criminal record verification, driving history analysis, and a practical driving test." },
  { q: "What if there's an accident?", a: "We maintain a 24/7 incident response team. All trips are logged, and we work directly with your insurance provider and local authorities." },
  { q: "Can I book for someone else?", a: "Yes, you can register multiple vehicles and assign drivers to them. You can also share trip status via a secure link." },
];

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const response = await fetch('/api/support/enquire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit enquiry');
      }

      setSubmitSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-red-700 selection:text-white">
      {/* Harmonized Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/convivia24.png" alt="Convivia24" className="h-8 md:h-10 w-auto object-contain" />
          </Link>
          <div className="hidden md:flex items-center gap-10">
            <Link href="/support" className="text-sm font-bold uppercase tracking-widest text-red-700 transition-colors">Support</Link>
            <Link href="/marketplace" className="px-8 py-3 rounded-full bg-red-700 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-red-800 transition-all shadow-xl shadow-red-900/20 active:scale-95">Marketplace</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-40 pb-20 space-y-20">
        {/* Header */}
        <header className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-red-100 text-red-700 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
            <HelpCircle size={12} />
            Support Center
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-zinc-900 uppercase tracking-tighter leading-none italic">
            HOW CAN WE <br />
            <span className="text-red-700 not-italic">HELP YOU?</span>
          </h1>
          
          <div className="relative max-w-xl mx-auto mt-12">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" />
            <input 
              type="text" 
              placeholder="Search for help articles..."
              className="w-full bg-white border border-zinc-200 rounded-2xl px-12 py-5 text-zinc-900 font-bold placeholder-zinc-300 focus:outline-none focus:border-red-700 transition-colors shadow-2xl"
            />
          </div>
        </header>

        {/* Contact Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-8 rounded-[2rem] bg-white border border-zinc-100 hover:border-red-700/30 hover:shadow-xl transition-all text-center shadow-sm group">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-700 mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Phone size={24} />
            </div>
            <h3 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest mb-2 italic">Emergency</h3>
            <p className="text-xs text-zinc-400 font-medium italic">24/7 Hotline for active trips</p>
          </div>
          <div className="p-8 rounded-[2rem] bg-white border border-zinc-100 hover:border-red-700/30 hover:shadow-xl transition-all text-center shadow-sm group">
            <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 mx-auto mb-6 group-hover:scale-110 transition-transform group-hover:text-red-700">
              <Mail size={24} />
            </div>
            <h3 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest mb-2 italic">Email</h3>
            <p className="text-xs text-zinc-400 font-medium italic">support@convivia24.com</p>
          </div>
          <div className="p-8 rounded-[2rem] bg-white border border-zinc-100 hover:border-red-700/30 hover:shadow-xl transition-all text-center shadow-sm group">
            <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 mx-auto mb-6 group-hover:scale-110 transition-transform group-hover:text-red-700">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest mb-2 italic">Live Chat</h3>
            <p className="text-xs text-zinc-400 font-medium italic">Available in mobile app</p>
          </div>
        </div>

        {/* Support Form */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-6">
            <h2 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter italic">Send us a Message</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 md:p-12 space-y-6 shadow-sm">
            {submitSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 text-green-700"
              >
                <CheckCircle2 size={20} />
                <span className="text-sm font-bold italic">Your enquiry has been submitted successfully! We'll get back to you soon.</span>
              </motion.div>
            )}

            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700"
              >
                <span className="text-sm font-bold italic">{submitError}</span>
              </motion.div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 italic">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900 font-bold placeholder-zinc-300 focus:outline-none focus:border-red-700 focus:bg-white transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 italic">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900 font-bold placeholder-zinc-300 focus:outline-none focus:border-red-700 focus:bg-white transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 italic">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900 font-bold placeholder-zinc-300 focus:outline-none focus:border-red-700 focus:bg-white transition-all"
                placeholder="What can we help you with?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 italic">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900 font-bold placeholder-zinc-300 focus:outline-none focus:border-red-700 focus:bg-white transition-all resize-none"
                placeholder="Tell us more about your enquiry..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-10 py-5 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-red-700 transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit Enquiry
                </>
              )}
            </button>
          </form>
        </section>

        {/* FAQs */}
        <section className="space-y-12">
          <h2 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter italic border-b border-zinc-100 pb-6">Support FAQ</h2>
          <div className="py-20 text-center bg-white border border-zinc-100 rounded-[2rem] shadow-sm">
            <p className="text-zinc-400 font-medium italic">Support information is being finalized.</p>
          </div>
        </section>

        {/* Report CTA */}
        <section className="p-12 rounded-[3rem] bg-zinc-900 text-white text-center space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          <div className="max-w-xl mx-auto space-y-4 relative z-10">
            <h3 className="text-3xl font-black uppercase tracking-tight italic">Serious Incident?</h3>
            <p className="text-zinc-400 font-medium italic leading-relaxed">If you need to report a safety concern or a serious incident, our response team is available immediately.</p>
          </div>
          <button className="relative z-10 px-8 py-4 bg-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-800 transition-all shadow-xl shadow-red-900/40 active:scale-95">
            Open Formal Report
          </button>
        </section>
      </main>

      {/* Harmonized Footer */}
      <footer className="border-t border-zinc-200 py-20 px-6 bg-white mt-20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <img src="/convivia24.png" alt="Convivia24" className="h-10 w-auto object-contain" />
            </Link>
            <div className="flex flex-wrap justify-center gap-10">
              {['Support'].map((link) => (
                <Link key={link} href="/support" className="text-[10px] font-black uppercase tracking-[0.3em] text-red-700 transition-colors">
                  {link}
                </Link>
              ))}
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-red-700 transition-all cursor-pointer">
                <Star size={18} />
              </div>
              <div className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-red-700 transition-all cursor-pointer">
                <Users size={18} />
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-zinc-50 text-center flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em]">© 2024 CONVIVIA24 INFRASTRUCTURE. ALL RIGHTS RESERVED.</p>
            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em]">LAGOS • ABUJA • LONDON</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
