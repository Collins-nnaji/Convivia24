'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, ShieldCheck } from 'lucide-react';

interface Ticket { code: string; attendee_name: string | null; ticket_type_name: string | null; status: string; checked_in_at: string | null }
interface EventInfo { title: string; venue: string | null; city: string; country: string; starts_at: string }
interface OrderInfo { reference: string }

export default function TicketPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/tickets/${code}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setTicket(d.ticket); setEvent(d.event); setOrder(d.order); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) return <div className="bg-obsidian min-h-screen flex items-center justify-center"><p className="text-cream/30 text-sm uppercase tracking-[0.3em]">Loading…</p></div>;
  if (error || !ticket) return (
    <div className="bg-obsidian min-h-[70vh] flex items-center justify-center text-center px-6">
      <div>
        <p className="font-display text-3xl italic text-cream mb-3">Ticket not found.</p>
        <Link href="/tickets" className="text-gold text-[11px] font-black uppercase tracking-[0.2em]">Look up your tickets &rarr;</Link>
      </div>
    </div>
  );

  const start = event ? new Date(event.starts_at) : null;
  const used = ticket.status === 'used';
  const void_ = ticket.status === 'void';

  return (
    <section className="bg-obsidian min-h-screen py-10 sm:py-16 flex items-start justify-center">
      <div className="w-full max-w-md px-5">
        <div className="bg-cream text-obsidian overflow-hidden shadow-2xl">
          {/* top */}
          <div className="bg-obsidian text-cream p-6 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/60 mb-3">Convivia24 · Admit One</p>
            <h1 className="font-display text-3xl italic leading-tight">{event?.title}</h1>
            {start && (
              <div className="flex flex-col items-center gap-1 mt-3 text-cream/60 text-sm">
                <span className="inline-flex items-center gap-1.5"><Calendar size={13} className="text-gold/60" /> {start.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin size={13} className="text-gold/60" /> {event?.venue ? event.venue + ', ' : ''}{event?.city}</span>
              </div>
            )}
          </div>

          {/* status banner */}
          <div className={`text-center py-2 text-[10px] font-black uppercase tracking-[0.25em] ${used ? 'bg-red-500 text-white' : void_ ? 'bg-obsidian/80 text-cream' : 'bg-gold text-obsidian'}`}>
            {used ? `Checked in${ticket.checked_in_at ? ' · ' + new Date(ticket.checked_in_at).toLocaleString('en-GB') : ''}` : void_ ? 'Voided' : 'Valid for entry'}
          </div>

          {/* QR */}
          <div className="p-7 flex flex-col items-center">
            <div className={`${used || void_ ? 'opacity-40' : ''} transition-opacity`}>
              <img src={`/api/tickets/${ticket.code}/qr`} alt="Ticket QR" className="w-56 h-56" />
            </div>
            <img src={`/api/tickets/${ticket.code}/barcode`} alt="Ticket barcode" className="w-full max-w-xs mt-5" />
            <p className="font-mono text-sm tracking-widest text-obsidian/70 mt-2">{ticket.code}</p>
          </div>

          {/* details */}
          <div className="border-t border-dashed border-obsidian/20 px-7 py-5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/40 mb-1">Attendee</p>
              <p className="font-medium text-sm">{ticket.attendee_name}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/40 mb-1">Ticket</p>
              <p className="font-medium text-sm">{ticket.ticket_type_name || 'Admission'}</p>
            </div>
            {order && (
              <div className="col-span-2">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/40 mb-1">Order</p>
                <p className="font-mono text-xs text-obsidian/70">{order.reference}</p>
              </div>
            )}
          </div>

          <div className="bg-obsidian text-cream/40 px-7 py-3 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.2em]">
            <ShieldCheck size={12} className="text-gold/60" /> Secured by Convivia24
          </div>
        </div>

        <p className="text-center text-cream/30 text-xs mt-5">Screenshot this ticket or add it to your wallet. Brightness up at the door.</p>
      </div>
    </section>
  );
}
