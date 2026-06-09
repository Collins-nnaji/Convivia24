'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Calendar, MapPin, Download, Smartphone } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';

interface Ticket { code: string; attendee_name: string | null; ticket_type_name: string | null; status: string }
interface EventInfo { title: string; venue: string | null; city: string; starts_at: string; cover_image: string | null }
interface Order { reference: string; buyer_name: string; buyer_email: string }

export default function OrderPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${reference}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setOrder(d.order); setEvent(d.event); setTickets(d.tickets ?? []); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [reference]);

  if (loading) return <div className="bg-obsidian min-h-screen flex items-center justify-center"><p className="text-cream/30 text-sm uppercase tracking-[0.3em]">Loading…</p></div>;
  if (error || !order) return (
    <div className="bg-obsidian min-h-[70vh] flex items-center justify-center text-center px-6">
      <div>
        <p className="font-display text-3xl italic text-cream mb-3">Order not found.</p>
        <Link href="/tickets" className="text-gold text-[11px] font-black uppercase tracking-[0.2em]">Look up your tickets &rarr;</Link>
      </div>
    </div>
  );

  const start = event ? new Date(event.starts_at) : null;

  return (
    <section className="bg-obsidian min-h-screen py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        {/* Confirmation header */}
        <div className="text-center mb-10">
          <CheckCircle2 size={44} className="text-gold mx-auto mb-4" />
          <SectionLabel>Order Confirmed</SectionLabel>
          <h1 className="font-display text-3xl sm:text-5xl italic text-cream mb-2">You&apos;re going.</h1>
          <p className="text-cream/50 text-sm">
            {tickets.length} ticket{tickets.length > 1 ? 's' : ''} sent to <span className="text-cream/80">{order.buyer_email}</span>
          </p>
          <p className="text-cream/30 text-[11px] uppercase tracking-[0.2em] mt-2">Ref · {order.reference}</p>
        </div>

        {/* Event banner */}
        {event && (
          <div className="border border-gold/15 mb-8 overflow-hidden">
            {event.cover_image && <img src={event.cover_image} alt="" className="w-full h-32 object-cover" />}
            <div className="p-5">
              <h2 className="font-display text-2xl italic text-cream mb-2">{event.title}</h2>
              {start && (
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-cream/50 text-sm">
                  <span className="inline-flex items-center gap-1.5"><Calendar size={13} className="text-gold/60" /> {start.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })} · {start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="inline-flex items-center gap-1.5"><MapPin size={13} className="text-gold/60" /> {event.venue ? event.venue + ', ' : ''}{event.city}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <p className="flex items-center justify-center gap-2 text-cream/40 text-xs mb-6"><Smartphone size={13} className="text-gold/60" /> Show any ticket below at the door — screenshots work too.</p>

        {/* Tickets */}
        <div className="space-y-5">
          {tickets.map((t) => (
            <div key={t.code} className="bg-cream text-obsidian flex flex-col sm:flex-row overflow-hidden">
              {/* Stub */}
              <div className="bg-obsidian text-cream p-5 sm:w-44 flex sm:flex-col justify-between items-center sm:items-start gap-2 relative">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-gold/60 mb-1">{t.ticket_type_name || 'Admission'}</p>
                  <p className="font-display text-lg italic leading-tight">{t.attendee_name}</p>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${t.status === 'used' ? 'text-red-400' : 'text-gold'}`}>
                  {t.status === 'used' ? 'Checked in' : 'Valid'}
                </span>
              </div>
              {/* QR + barcode */}
              <div className="flex-1 p-5 flex items-center gap-5">
                <div className="shrink-0">
                  <img src={`/api/tickets/${t.code}/qr`} alt={`QR for ${t.code}`} className="w-28 h-28" />
                </div>
                <div className="flex-1 min-w-0">
                  <img src={`/api/tickets/${t.code}/barcode`} alt={`Barcode ${t.code}`} className="w-full max-w-[220px]" />
                  <p className="font-mono text-xs text-obsidian/70 tracking-wider mt-1">{t.code}</p>
                  <Link href={`/t/${t.code}`} className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] text-gold-dark hover:text-gold mt-2">
                    <Download size={11} /> Open full ticket
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/events" className="text-gold/70 hover:text-gold text-[11px] font-black uppercase tracking-[0.2em]">Discover more events &rarr;</Link>
        </div>
      </div>
    </section>
  );
}
