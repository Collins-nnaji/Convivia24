'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Ticket, ArrowRight, Calendar, MapPin, Search } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useUser } from '@/components/auth/AuthProvider';

interface MyOrder {
  reference: string; total: string; currency: string; status: string;
  event_title: string; event_slug: string; starts_at: string;
  venue: string | null; city: string; cover_image: string | null; ticket_count: number;
}

export default function TicketsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [looking, setLooking] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    fetch('/api/me/orders')
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((d) => setOrders(d.orders ?? []))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    const ref = reference.trim().toUpperCase();
    if (!ref) { setError('Enter your order reference.'); return; }
    setLooking(true); setError('');
    const res = await fetch(`/api/orders/${ref}`);
    setLooking(false);
    if (res.ok) router.push(`/orders/${ref}`);
    else setError('We couldn\'t find that booking. Check the reference and try again.');
  }

  return (
    <section className="bg-paper min-h-screen py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <SectionLabel>My tickets</SectionLabel>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <h1 className="font-display text-4xl sm:text-6xl font-light italic text-obsidian tracking-tight">Your bookings.</h1>
          <Link href="/calendar" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-gold-dark hover:text-gold shrink-0">
            <Calendar size={14} /> Calendar view
          </Link>
        </div>

        {/* Signed-out prompt */}
        {!authLoading && !user && (
          <div className="bg-white border border-obsidian/12 shadow-sm p-6 sm:p-8 mb-8 text-center">
            <Ticket size={28} className="text-gold-dark mx-auto mb-3" />
            <p className="font-display text-2xl italic text-obsidian mb-1">Sign in to see your tickets.</p>
            <p className="text-obsidian/55 text-sm mb-5">All your event bookings in one place once you sign in.</p>
            <Link href="/signin?next=/tickets" className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] px-6 py-3 transition-colors">
              Sign in <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Account orders */}
        {user && (
          <div className="mb-10">
            {loading ? (
              <p className="text-obsidian/40 text-sm">Loading your tickets…</p>
            ) : orders.length === 0 ? (
              <div className="bg-white border border-obsidian/12 p-8 text-center">
                <p className="font-display text-xl italic text-obsidian mb-1">No tickets yet.</p>
                <p className="text-obsidian/50 text-sm mb-5">When you book an event, your tickets appear here.</p>
                <Link href="/events" className="inline-flex items-center gap-2 bg-gold text-obsidian text-[11px] font-black uppercase tracking-[0.2em] px-6 py-3">Discover events</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((o, i) => (
                  <motion.div
                    key={o.reference}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  >
                  <Link href={`/orders/${o.reference}`} className="group flex items-center gap-4 bg-white border border-obsidian/12 hover:border-gold/40 hover:shadow-lift hover:-translate-y-0.5 transition-all duration-300 p-3 rounded-xl">
                    <img src={o.cover_image || '/Convivium.png'} alt="" className="w-20 h-20 object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-xl italic text-obsidian group-hover:text-gold-dark transition-colors truncate">{o.event_title}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-obsidian/50 text-xs mt-1">
                        <span className="inline-flex items-center gap-1"><Calendar size={11} className="text-gold-dark" /> {new Date(o.starts_at).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                        <span className="inline-flex items-center gap-1"><MapPin size={11} className="text-gold-dark" /> {o.venue ? o.venue + ', ' : ''}{o.city}</span>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-obsidian/40 mt-1.5">{o.ticket_count} ticket{Number(o.ticket_count) > 1 ? 's' : ''} · {o.reference}</p>
                    </div>
                    <ArrowRight size={18} className="text-gold-dark shrink-0 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reference lookup (works without an account) */}
        <div className="bg-white border border-obsidian/12 shadow-sm p-6 sm:p-7">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold-dark mb-3">Have a booking reference?</p>
          <form onSubmit={lookup} className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 border-b border-obsidian/20 focus-within:border-gold flex-1">
              <Search size={16} className="text-gold-dark" />
              <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="ORD-XXXXXX" className="flex-1 bg-transparent border-0 focus:ring-0 text-obsidian font-mono tracking-widest py-2.5 px-1 placeholder-obsidian/25 outline-none uppercase" />
            </div>
            <button type="submit" disabled={looking} className="inline-flex items-center justify-center gap-2 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] px-6 py-3 transition-colors disabled:opacity-60">
              {looking ? 'Searching…' : 'Find'}
            </button>
          </form>
          {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
        </div>
      </div>
    </section>
  );
}
