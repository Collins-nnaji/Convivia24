'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Users, Minus, Plus, ArrowLeft, Ticket, ShieldCheck, Music } from 'lucide-react';
import { CATEGORY_LABELS } from '@/lib/categories';
import { priceLabel, formatMoney } from '@/lib/money';

interface EventDetail {
  id: string; slug: string; title: string; tagline: string | null; description: string;
  category: string; organizer_name: string | null; venue: string | null; address: string | null;
  city: string; country: string; starts_at: string; ends_at: string | null;
  cover_image: string | null; currency: string; capacity: number | null;
  age_restriction: string | null; lineup: string[] | null;
}
interface TicketType {
  id: string; name: string; description: string | null; price: string; currency: string;
  quantity: number; sold: number; max_per_order: number; perks: string[] | null;
}

const FALLBACKS = ['/The Spaces2.png', '/Convivium.png', '/conv1.png', '/Convivium2.png'];

export default function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [types, setTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [buyer, setBuyer] = useState({ name: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setEvent(d.event); setTypes(d.ticket_types ?? []); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const total = useMemo(
    () => types.reduce((sum, t) => sum + (qty[t.id] || 0) * Number(t.price), 0),
    [types, qty]
  );
  const totalCount = useMemo(() => Object.values(qty).reduce((a, b) => a + b, 0), [qty]);

  function step(t: TicketType, delta: number) {
    setQty((q) => {
      const remaining = t.quantity - t.sold;
      const next = Math.max(0, Math.min(Math.min(t.max_per_order, remaining), (q[t.id] || 0) + delta));
      return { ...q, [t.id]: next };
    });
  }

  async function checkout(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (totalCount === 0) { setError('Select at least one ticket.'); return; }
    setSubmitting(true);
    try {
      const items = types.filter((t) => qty[t.id] > 0).map((t) => ({ ticket_type_id: t.id, quantity: qty[t.id] }));
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, buyer, items }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Checkout failed.'); return; }
      router.push(`/orders/${data.reference}`);
    } catch {
      setError('Could not connect. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="bg-obsidian min-h-screen flex items-center justify-center"><p className="text-cream/30 text-sm uppercase tracking-[0.3em]">Loading…</p></div>;
  if (notFound || !event) return (
    <div className="bg-obsidian min-h-[70vh] flex items-center justify-center text-center px-6">
      <div>
        <p className="font-display text-3xl italic text-cream mb-3">Event not found.</p>
        <Link href="/events" className="text-gold text-[11px] font-black uppercase tracking-[0.2em]">&larr; Back to discover</Link>
      </div>
    </div>
  );

  const cover = event.cover_image || FALLBACKS[(slug.charCodeAt(0) || 0) % FALLBACKS.length];
  const start = new Date(event.starts_at);
  const free = total <= 0;

  return (
    <>
      {/* HERO */}
      <section className="relative bg-obsidian -mt-16 pt-16">
        <div className="relative h-[42vh] sm:h-[52vh]">
          <img src={cover} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-obsidian/20" />
        </div>
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 -mt-28 sm:-mt-32 pb-4 z-10">
          <Link href="/events" className="inline-flex items-center gap-1.5 text-cream/50 hover:text-gold text-[10px] font-black uppercase tracking-[0.2em] mb-5">
            <ArrowLeft size={12} /> Discover
          </Link>
          <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-gold mb-3">{CATEGORY_LABELS[event.category] ?? event.category}</span>
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-light italic tracking-tight text-cream leading-[0.92] mb-3 max-w-3xl">{event.title}</h1>
          {event.tagline && <p className="text-cream/60 text-lg max-w-2xl">{event.tagline}</p>}
        </div>
      </section>

      {/* BODY */}
      <section className="bg-obsidian py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-[1fr_400px] gap-10 lg:gap-14 items-start">

          {/* LEFT — details */}
          <div>
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {[
                { icon: Calendar, label: 'Date', value: start.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
                { icon: Clock, label: 'Doors', value: start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + (event.ends_at ? ` – ${new Date(event.ends_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : '') },
                { icon: MapPin, label: 'Location', value: `${event.venue ? event.venue + ', ' : ''}${event.city}, ${event.country}` },
                { icon: Users, label: 'Good to know', value: [event.age_restriction, event.capacity ? `Capacity ${event.capacity}` : null].filter(Boolean).join(' · ') || 'All welcome' },
              ].map((d) => (
                <div key={d.label} className="border border-gold/10 p-5">
                  <d.icon size={16} className="text-gold/60 mb-3" />
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-cream/30 mb-1">{d.label}</p>
                  <p className="text-cream/80 text-sm">{d.value}</p>
                </div>
              ))}
            </div>

            <h2 className="font-display text-2xl sm:text-3xl italic text-cream mb-4">About this event</h2>
            <p className="text-cream/60 leading-relaxed whitespace-pre-line mb-8">{event.description}</p>

            {event.lineup && event.lineup.length > 0 && (
              <div className="mb-8">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gold/60 mb-4">Lineup</p>
                <div className="flex flex-wrap gap-2.5">
                  {event.lineup.map((act) => (
                    <span key={act} className="inline-flex items-center gap-1.5 border border-gold/20 px-3.5 py-2 text-cream/80 text-sm">
                      <Music size={12} className="text-gold/60" /> {act}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {event.organizer_name && (
              <div className="border-t border-gold/10 pt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cream/30 mb-1">Presented by</p>
                <p className="font-display text-xl italic text-cream">{event.organizer_name}</p>
              </div>
            )}
          </div>

          {/* RIGHT — ticket panel */}
          <div className="lg:sticky lg:top-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-obsidian-100 border border-gold/20"
            >
              <div className="px-6 py-5 border-b border-gold/10 flex items-center gap-2">
                <Ticket size={16} className="text-gold" />
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cream">Get Tickets</p>
              </div>

              <div className="p-4 space-y-3">
                {types.length === 0 && <p className="text-cream/40 text-sm p-4 text-center">No tickets on sale yet.</p>}
                {types.map((t) => {
                  const remaining = t.quantity - t.sold;
                  const soldOut = remaining <= 0;
                  return (
                    <div key={t.id} className={`border p-4 transition-colors ${qty[t.id] ? 'border-gold/40 bg-gold/5' : 'border-gold/10'}`}>
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div>
                          <p className="font-display text-lg italic text-cream leading-tight">{t.name}</p>
                          <p className="text-gold text-sm font-semibold">{priceLabel(t.price, t.currency)}</p>
                        </div>
                        {soldOut ? (
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-400/80 mt-1">Sold out</span>
                        ) : (
                          <div className="flex items-center gap-2.5 shrink-0">
                            <button type="button" onClick={() => step(t, -1)} disabled={!qty[t.id]} className="w-7 h-7 flex items-center justify-center border border-gold/30 text-cream disabled:opacity-30 hover:border-gold transition-colors"><Minus size={13} /></button>
                            <span className="w-5 text-center text-cream text-sm tabular-nums">{qty[t.id] || 0}</span>
                            <button type="button" onClick={() => step(t, 1)} className="w-7 h-7 flex items-center justify-center border border-gold/30 text-cream hover:border-gold transition-colors"><Plus size={13} /></button>
                          </div>
                        )}
                      </div>
                      {t.description && <p className="text-cream/40 text-xs mt-1.5">{t.description}</p>}
                      {t.perks && t.perks.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {t.perks.map((p) => (
                            <li key={p} className="flex items-center gap-1.5 text-cream/50 text-xs"><span className="w-1 h-1 rounded-full bg-gold/60" /> {p}</li>
                          ))}
                        </ul>
                      )}
                      {!soldOut && remaining <= 20 && <p className="text-gold/60 text-[10px] mt-2 uppercase tracking-wider">Only {remaining} left</p>}
                    </div>
                  );
                })}
              </div>

              {totalCount > 0 && (
                <form onSubmit={checkout} className="p-4 border-t border-gold/10 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-cream/50 text-sm">{totalCount} ticket{totalCount > 1 ? 's' : ''}</span>
                    <span className="font-display text-2xl italic text-gold">{free ? 'Free' : formatMoney(total, event.currency)}</span>
                  </div>
                  <input required value={buyer.name} onChange={(e) => setBuyer({ ...buyer, name: e.target.value })} placeholder="Full name" className="w-full bg-transparent border-b border-gold/20 focus:border-gold text-cream text-sm py-2.5 px-0 placeholder-cream/30 outline-none focus:ring-0" />
                  <input required type="email" value={buyer.email} onChange={(e) => setBuyer({ ...buyer, email: e.target.value })} placeholder="Email for your tickets" className="w-full bg-transparent border-b border-gold/20 focus:border-gold text-cream text-sm py-2.5 px-0 placeholder-cream/30 outline-none focus:ring-0" />
                  <input value={buyer.phone} onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })} placeholder="Phone (optional)" className="w-full bg-transparent border-b border-gold/20 focus:border-gold text-cream text-sm py-2.5 px-0 placeholder-cream/30 outline-none focus:ring-0" />
                  {error && <p className="text-red-400/90 text-xs">{error}</p>}
                  <button type="submit" disabled={submitting} className="w-full bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] py-3.5 transition-colors disabled:opacity-60">
                    {submitting ? 'Issuing tickets…' : free ? 'Get free tickets' : 'Confirm & get tickets'}
                  </button>
                  <p className="flex items-center justify-center gap-1.5 text-cream/30 text-[10px] uppercase tracking-wider"><ShieldCheck size={11} className="text-gold/50" /> Secure QR + barcode entry</p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
