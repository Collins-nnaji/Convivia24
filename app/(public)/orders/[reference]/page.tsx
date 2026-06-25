'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Calendar, MapPin, Download, Smartphone, Share2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import FaceEnroll from '@/components/FaceEnroll';
import { absoluteUrl } from '@/lib/url';
import { orderStatusLabel, canShowTickets } from '@/lib/tickets/status';

interface Ticket { code: string; attendee_name: string | null; ticket_type_name: string | null; status: string }
interface EventInfo { slug?: string; title: string; venue: string | null; city: string; starts_at: string; cover_image: string | null }
interface Order {
  reference: string;
  buyer_name: string;
  buyer_email: string;
  status: string;
  total?: string;
  currency?: string;
}

export default function OrderPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [face, setFace] = useState<{ available: boolean; enrolled: boolean }>({ available: false, enrolled: false });
  const [shared, setShared] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const res = await fetch(`/api/orders/${reference}`);
      if (!res.ok) { if (active) setError(true); return; }
      const d = await res.json();
      if (!active) return;
      setOrder(d.order);
      setEvent(d.event);
      setTickets(d.tickets ?? []);
      setFace(d.face ?? { available: false, enrolled: false });
    }
    load().finally(() => { if (active) setLoading(false); });

    // Poll while payment is pending
    const interval = setInterval(async () => {
      const res = await fetch(`/api/orders/${reference}`);
      if (!res.ok) return;
      const d = await res.json();
      setOrder(d.order);
      setTickets(d.tickets ?? []);
      if (d.order?.status === 'paid' || d.order?.status === 'failed' || d.order?.status === 'expired') {
        clearInterval(interval);
      }
    }, 4000);

    return () => { active = false; clearInterval(interval); };
  }, [reference]);

  if (loading) {
    return (
      <div className="bg-paper min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-gold-dark" size={28} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-paper min-h-[70vh] flex items-center justify-center text-center px-6">
        <div>
          <p className="font-display text-3xl italic text-obsidian mb-3">Booking not found.</p>
          <Link href="/tickets" className="text-gold-dark text-[11px] font-black uppercase tracking-[0.2em]">Go to my tickets &rarr;</Link>
        </div>
      </div>
    );
  }

  const start = event ? new Date(event.starts_at) : null;
  const confirmed = canShowTickets(order.status);
  const pending = order.status === 'pending';
  const failed = order.status === 'failed' || order.status === 'expired';

  return (
    <section className="bg-paper min-h-screen py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-10">
          {confirmed ? (
            <CheckCircle2 size={44} className="text-gold-dark mx-auto mb-4" />
          ) : pending ? (
            <Clock size={44} className="text-gold-dark mx-auto mb-4" />
          ) : (
            <AlertCircle size={44} className="text-red-500 mx-auto mb-4" />
          )}
          <SectionLabel>{confirmed ? 'Booking confirmed' : pending ? 'Awaiting payment' : 'Booking issue'}</SectionLabel>
          <h1 className="font-display text-3xl sm:text-5xl italic text-obsidian mb-2">
            {confirmed ? "You're going." : pending ? 'Complete your payment.' : "We couldn't confirm this booking."}
          </h1>
          <p className="text-obsidian/55 text-sm max-w-md mx-auto">
            {confirmed && (
              <>
                {tickets.length} ticket{tickets.length > 1 ? 's' : ''} saved to your account
                {order.buyer_email ? <> ({order.buyer_email})</> : null}
              </>
            )}
            {pending && 'Your tickets will appear here as soon as payment is confirmed.'}
            {failed && 'This booking was not completed. You can try again from the event page.'}
          </p>
          <p className="text-obsidian/40 text-[11px] uppercase tracking-[0.2em] mt-2">
            {orderStatusLabel(order.status)} · Ref {order.reference}
          </p>
          {confirmed && (
            <button
              onClick={async () => {
                const url = absoluteUrl(`/orders/${order.reference}`);
                try {
                  if (navigator.share) await navigator.share({ title: 'My Convivia24 tickets', url });
                  else { await navigator.clipboard.writeText(url); setShared(true); setTimeout(() => setShared(false), 2000); }
                } catch { /* dismissed */ }
              }}
              className="inline-flex items-center gap-1.5 mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-gold-dark hover:text-gold transition-colors"
            >
              <Share2 size={12} /> {shared ? 'Link copied' : 'Share / open on another device'}
            </button>
          )}
        </div>

        {event && (
          <div className="bg-white border border-obsidian/12 mb-8 overflow-hidden">
            {event.cover_image && <img src={event.cover_image} alt="" className="w-full h-32 object-cover" />}
            <div className="p-5">
              <h2 className="font-display text-2xl italic text-obsidian mb-2">{event.title}</h2>
              {start && (
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-obsidian/55 text-sm">
                  <span className="inline-flex items-center gap-1.5"><Calendar size={13} className="text-gold-dark" /> {start.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })} · {start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="inline-flex items-center gap-1.5"><MapPin size={13} className="text-gold-dark" /> {event.venue ? event.venue + ', ' : ''}{event.city}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {pending && (
          <div className="bg-amber-50 border border-amber-200 p-5 mb-8 text-center">
            <p className="text-sm text-amber-900">Waiting for payment confirmation… This page updates automatically.</p>
          </div>
        )}

        {failed && event?.slug && (
          <div className="text-center mb-8">
            <Link href={`/events/${event.slug}`} className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] px-6 py-3 transition-colors">
              Try booking again
            </Link>
          </div>
        )}

        {confirmed && face.available && (
          <div className="mb-6">
            <FaceEnroll reference={order.reference} enrolled={face.enrolled} />
          </div>
        )}

        {confirmed && (
          <>
            <p className="flex items-center justify-center gap-2 text-obsidian/50 text-xs mb-6">
              <Smartphone size={13} className="text-gold-dark" /> Show any ticket below at the door — screenshots work too.
            </p>
            <div className="space-y-5">
              {tickets.map((t) => (
                <div key={t.code} className="bg-white border border-obsidian/12 flex flex-col sm:flex-row overflow-hidden shadow-sm">
                  <div className="bg-obsidian text-cream p-5 sm:w-44 flex sm:flex-col justify-between items-center sm:items-start gap-2 relative">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-gold/70 mb-1">{t.ticket_type_name || 'Admission'}</p>
                      <p className="font-display text-lg italic leading-tight">{t.attendee_name}</p>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${t.status === 'used' ? 'text-red-400' : 'text-gold'}`}>
                      {t.status === 'used' ? 'Checked in' : 'Valid'}
                    </span>
                  </div>
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
          </>
        )}

        <div className="text-center mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/tickets" className="text-gold-dark hover:text-gold text-[11px] font-black uppercase tracking-[0.2em]">My tickets</Link>
          <Link href="/events" className="text-obsidian/50 hover:text-obsidian text-[11px] font-black uppercase tracking-[0.2em]">Discover more events</Link>
        </div>
      </div>
    </section>
  );
}
