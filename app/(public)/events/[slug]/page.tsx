'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Users, Minus, Plus, ArrowLeft, Ticket, ShieldCheck, Music } from 'lucide-react';
import { CATEGORY_LABELS } from '@/lib/categories';
import { priceLabel, formatMoney } from '@/lib/money';
import { useUser } from '@/components/auth/AuthProvider';

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
  const { user } = useUser();
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

  // Prefill the booker from the signed-in account.
  useEffect(() => {
    if (user) setBuyer((b) => ({ ...b, name: b.name || user.name || '', email: user.email }));
  }, [user]);

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

  if (loading) return <div className="bg-paper min-h-screen flex items-center justify-center"><p className="text-obsidian/30 text-sm uppercase tracking-[0.3em]">Loading…</p></div>;
  if (notFound || !event) return (
    <div className="bg-paper min-h-[70vh] flex items-center justify-center text-center px-6">
      <div>
        <p className="font-display text-3xl italic text-obsidian mb-3">Event not found.</p>
        <Link href="/events" className="text-gold-dark text-[11px] font-black uppercase tracking-[0.2em]">&larr; Back to discover</Link>
      </div>
    </div>
  );

  const cover = event.cover_image || FALLBACKS[(slug.charCodeAt(0) || 0) % FALLBACKS.length];
  const start = new Date(event.starts_at);
  const free = total <= 0;

  return (
    <>
      {/* HERO */}
      <section className="relative bg-paper -mt-16 pt-16">
        <div className="relative h-[42vh] sm:h-[52vh]">
          <img src={cover} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/30 to-transparent" />
        </div>
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 -mt-28 sm:-mt-32 pb-4 z-10">
          <Link href="/events" className="inline-flex items-center gap-1.5 text-obsidian/60 hover:text-gold-dark text-[10px] font-black uppercase tracking-[0.2em] mb-5">
            <ArrowLeft size={12} /> Discover
          </Link>
          <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-gold-dark mb-3">{CATEGORY_LABELS[event.category] ?? event.category}</span>
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-light italic tracking-tight text-obsidian leading-[0.92] mb-3 max-w-3xl">{event.title}</h1>
          {event.tagline && <p className="text-obsidian/60 text-lg max-w-2xl">{event.tagline}</p>}
        </div>
      </section>

      {/* BODY */}
      <section className="bg-paper py-12 sm:py-16">
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
                <div key={d.label} className="bg-white border border-obsidian/10 p-5">
                  <d.icon size={16} className="text-gold-dark mb-3" />
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 mb-1">{d.label}</p>
                  <p className="text-obsidian/80 text-sm">{d.value}</p>
                </div>
              ))}
            </div>

            <h2 className="font-display text-2xl sm:text-3xl italic text-obsidian mb-4">About this event</h2>
            <p className="text-obsidian/65 leading-relaxed whitespace-pre-line mb-8">{event.description}</p>

            {event.lineup && event.lineup.length > 0 && (
              <div className="mb-8">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gold-dark mb-4">Lineup</p>
                <div className="flex flex-wrap gap-2.5">
                  {event.lineup.map((act) => (
                    <span key={act} className="inline-flex items-center gap-1.5 bg-white border border-obsidian/15 px-3.5 py-2 text-obsidian/80 text-sm">
                      <Music size={12} className="text-gold-dark" /> {act}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {event.organizer_name && (
              <div className="border-t border-obsidian/10 pt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-obsidian/40 mb-1">Presented by</p>
                <p className="font-display text-xl italic text-obsidian">{event.organizer_name}</p>
              </div>
            )}
          </div>

          {/* RIGHT — ticket panel */}
          <div id="tickets" className="lg:sticky lg:top-24 scroll-mt-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-obsidian/15 shadow-xl shadow-obsidian/5"
            >
              <div className="px-6 py-5 border-b border-obsidian/10 flex items-center gap-2">
                <Ticket size={16} className="text-gold-dark" />
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-obsidian">Get Tickets</p>
              </div>

              <div className="p-4 space-y-3">
                {types.length === 0 && <p className="text-obsidian/40 text-sm p-4 text-center">No tickets on sale yet.</p>}
                {types.map((t) => {
                  const remaining = t.quantity - t.sold;
                  const soldOut = remaining <= 0;
                  return (
                    <div key={t.id} className={`border p-4 transition-colors ${qty[t.id] ? 'border-gold bg-gold/5' : 'border-obsidian/10'}`}>
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div>
                          <p className="font-display text-lg italic text-obsidian leading-tight">{t.name}</p>
                          <p className="text-gold-dark text-sm font-semibold">{priceLabel(t.price, t.currency)}</p>
                        </div>
                        {soldOut ? (
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500 mt-1">Sold out</span>
                        ) : (
                          <div className="flex items-center gap-2.5 shrink-0">
                            <button type="button" onClick={() => step(t, -1)} disabled={!qty[t.id]} className="w-7 h-7 flex items-center justify-center border border-obsidian/20 text-obsidian disabled:opacity-30 hover:border-gold transition-colors"><Minus size={13} /></button>
                            <span className="w-5 text-center text-obsidian text-sm tabular-nums">{qty[t.id] || 0}</span>
                            <button type="button" onClick={() => step(t, 1)} className="w-7 h-7 flex items-center justify-center border border-obsidian/20 text-obsidian hover:border-gold transition-colors"><Plus size={13} /></button>
                          </div>
                        )}
                      </div>
                      {t.description && <p className="text-obsidian/45 text-xs mt-1.5">{t.description}</p>}
                      {t.perks && t.perks.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {t.perks.map((p) => (
                            <li key={p} className="flex items-center gap-1.5 text-obsidian/55 text-xs"><span className="w-1 h-1 rounded-full bg-gold" /> {p}</li>
                          ))}
                        </ul>
                      )}
                      {!soldOut && remaining <= 20 && <p className="text-gold-dark text-[10px] mt-2 uppercase tracking-wider">Only {remaining} left</p>}
                    </div>
                  );
                })}
              </div>

              {totalCount > 0 && (
                <div className="p-4 border-t border-obsidian/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-obsidian/55 text-sm">{totalCount} ticket{totalCount > 1 ? 's' : ''}</span>
                    <span className="font-display text-2xl italic text-gold-dark">{free ? 'Free' : formatMoney(total, event.currency)}</span>
                  </div>
                  {user ? (
                    <form onSubmit={checkout} className="space-y-3">
                      <input required value={buyer.name} onChange={(e) => setBuyer({ ...buyer, name: e.target.value })} placeholder="Name on the booking" className="w-full bg-transparent border-b border-obsidian/20 focus:border-gold text-obsidian text-sm py-2.5 px-0 placeholder-obsidian/35 outline-none focus:ring-0" />
                      <input value={buyer.email} readOnly className="w-full bg-transparent border-b border-obsidian/15 text-obsidian/60 text-sm py-2.5 px-0 outline-none cursor-default" />
                      <input value={buyer.phone} onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })} placeholder="Phone (optional)" className="w-full bg-transparent border-b border-obsidian/20 focus:border-gold text-obsidian text-sm py-2.5 px-0 placeholder-obsidian/35 outline-none focus:ring-0" />
                      {error && <p className="text-red-500 text-xs">{error}</p>}
                      <button type="submit" disabled={submitting} className="w-full bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] py-3.5 transition-colors disabled:opacity-60">
                        {submitting ? 'Issuing tickets…' : free ? 'Get free tickets' : 'Confirm & get tickets'}
                      </button>
                      <p className="flex items-center justify-center gap-1.5 text-obsidian/40 text-[10px] uppercase tracking-wider"><ShieldCheck size={11} className="text-gold-dark" /> Secure QR + barcode entry</p>
                    </form>
                  ) : (
                    <div className="space-y-2">
                      <Link href={`/signin?next=${encodeURIComponent(`/events/${slug}`)}`} className="w-full inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] py-3.5 transition-colors">
                        Sign in to get tickets
                      </Link>
                      <p className="text-center text-obsidian/45 text-xs">Sign in with Google — you&apos;ll come right back to finish.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* MOBILE — sticky ticket bar (sits above the bottom tab bar) */}
      {types.length > 0 && (
        <div className="lg:hidden fixed bottom-16 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-obsidian/10 px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/40">From</p>
            <p className="font-display text-xl italic text-gold-dark leading-tight">
              {priceLabel(Math.min(...types.map((t) => Number(t.price))), event.currency)}
            </p>
          </div>
          <a
            href="#tickets"
            className="shrink-0 inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] px-6 py-3 transition-colors"
          >
            <Ticket size={14} /> Get Tickets
          </a>
        </div>
      )}
    </>
  );
}
