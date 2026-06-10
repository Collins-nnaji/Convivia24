'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket, ArrowRight } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';

export default function TicketLookupPage() {
  const router = useRouter();
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    const ref = reference.trim().toUpperCase();
    if (!ref) { setError('Enter your order reference.'); return; }
    setLoading(true);
    setError('');
    const res = await fetch(`/api/orders/${ref}`);
    setLoading(false);
    if (res.ok) router.push(`/orders/${ref}`);
    else setError('We couldn\'t find that order. Check the reference and try again.');
  }

  return (
    <section className="bg-paper min-h-screen py-16 sm:py-24">
      <div className="max-w-xl mx-auto px-5 sm:px-8">
        <SectionLabel>My Tickets</SectionLabel>
        <h1 className="font-display text-4xl sm:text-6xl font-light italic text-obsidian tracking-tight mb-4">Find your tickets.</h1>
        <p className="text-obsidian/55 mb-10 leading-relaxed">
          Enter the order reference from your confirmation (it looks like <span className="text-gold-dark font-mono">ORD-XXXXXX</span>)
          to pull up your QR + barcode tickets.
        </p>

        <form onSubmit={lookup} className="bg-white border border-obsidian/12 shadow-sm p-6 sm:p-8">
          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gold-dark block mb-2">Order reference</label>
          <div className="flex items-center gap-2 border-b border-obsidian/20 focus-within:border-gold mb-1">
            <Ticket size={18} className="text-gold-dark" />
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="ORD-XXXXXX"
              className="flex-1 bg-transparent border-0 focus:ring-0 text-obsidian font-mono tracking-widest py-3 px-1 placeholder-obsidian/25 outline-none uppercase"
            />
          </div>
          {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
          <button type="submit" disabled={loading} className="w-full mt-6 inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] py-3.5 transition-colors disabled:opacity-60">
            {loading ? 'Searching…' : <>View my tickets <ArrowRight size={14} /></>}
          </button>
        </form>
      </div>
    </section>
  );
}
