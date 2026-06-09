'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Star, Eye, EyeOff, Users, ExternalLink } from 'lucide-react';
import { useAdmin } from '../layout';

interface EventRow {
  id: string; slug: string; title: string; category: string; city: string;
  starts_at: string; status: string; is_featured: boolean;
  tickets_sold: number; tickets_total: number; min_price: string | null; currency: string;
}

export default function EventsAdmin() {
  const { secret } = useAdmin();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [attendeesFor, setAttendeesFor] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<Record<string, unknown>[]>([]);

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(''), 2500); }

  function load() {
    fetch('/api/events?all=1', { headers: { 'x-admin-secret': secret } })
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .finally(() => setLoading(false));
  }
  useEffect(load, [secret]);

  async function patch(id: string, body: Record<string, unknown>) {
    await fetch(`/api/events/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify(body),
    });
    load();
  }

  async function remove(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This removes its tickets and orders.`)) return;
    await fetch(`/api/events/${id}`, { method: 'DELETE', headers: { 'x-admin-secret': secret } });
    flash('Event deleted.');
    load();
  }

  async function viewAttendees(id: string) {
    if (attendeesFor === id) { setAttendeesFor(null); return; }
    setAttendeesFor(id);
    setAttendees([]);
    const r = await fetch(`/api/events/${id}/attendees`, { headers: { 'x-admin-secret': secret } });
    const d = await r.json();
    setAttendees(d.attendees ?? []);
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light italic text-[#f5f0e8]">Events</h1>
          <p className="text-[#f5f0e8]/40 text-sm mt-1">Publish, feature, and track every event.</p>
        </div>
        <Link href="/create" className="inline-flex items-center gap-1.5 bg-[#c9a84c] text-[#0a0a0a] text-[11px] font-black uppercase tracking-[0.15em] px-4 py-2.5 hover:bg-[#d4b464] transition-colors"><Plus size={14} /> New event</Link>
      </div>

      {msg && <p className="mb-4 text-[#c9a84c] text-sm">{msg}</p>}

      <div className="border border-[#c9a84c]/15 divide-y divide-[#c9a84c]/10">
        {loading ? (
          <p className="p-5 text-[#f5f0e8]/30 text-sm">Loading…</p>
        ) : events.length === 0 ? (
          <p className="p-5 text-[#f5f0e8]/30 text-sm">No events yet. <Link href="/create" className="text-[#c9a84c]">Create one →</Link></p>
        ) : (
          events.map((e) => (
            <div key={e.id}>
              <div className="flex flex-wrap items-center gap-4 p-4">
                <div className="flex-1 min-w-[180px]">
                  <div className="flex items-center gap-2">
                    <Link href={`/events/${e.slug}`} className="font-display text-lg italic text-[#f5f0e8] hover:text-[#c9a84c] transition-colors">{e.title}</Link>
                    {e.is_featured && <Star size={13} className="text-[#c9a84c] fill-[#c9a84c]" />}
                    <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 ${e.status === 'published' ? 'text-emerald-400' : 'text-[#f5f0e8]/40'}`}>{e.status}</span>
                  </div>
                  <p className="text-[#f5f0e8]/30 text-xs mt-0.5">{e.category} · {e.city} · {new Date(e.starts_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#f5f0e8] text-sm">{e.tickets_sold ?? 0} / {e.tickets_total ?? 0}</p>
                  <p className="text-[9px] uppercase tracking-wider text-[#f5f0e8]/30">sold</p>
                </div>
                <div className="flex items-center gap-1">
                  <button title="Attendees" onClick={() => viewAttendees(e.id)} className="p-2 text-[#f5f0e8]/40 hover:text-[#c9a84c]"><Users size={15} /></button>
                  <button title={e.is_featured ? 'Unfeature' : 'Feature'} onClick={() => patch(e.id, { is_featured: !e.is_featured })} className="p-2 text-[#f5f0e8]/40 hover:text-[#c9a84c]"><Star size={15} className={e.is_featured ? 'fill-[#c9a84c] text-[#c9a84c]' : ''} /></button>
                  <button title={e.status === 'published' ? 'Unpublish' : 'Publish'} onClick={() => patch(e.id, { status: e.status === 'published' ? 'draft' : 'published' })} className="p-2 text-[#f5f0e8]/40 hover:text-[#c9a84c]">{e.status === 'published' ? <Eye size={15} /> : <EyeOff size={15} />}</button>
                  <Link title="Open" href={`/events/${e.slug}`} className="p-2 text-[#f5f0e8]/40 hover:text-[#c9a84c]"><ExternalLink size={15} /></Link>
                  <button title="Delete" onClick={() => remove(e.id, e.title)} className="p-2 text-[#f5f0e8]/40 hover:text-red-400"><Trash2 size={15} /></button>
                </div>
              </div>

              {attendeesFor === e.id && (
                <div className="bg-[#0a0a0a] border-t border-[#c9a84c]/10 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a84c]/60 mb-3">Attendees ({attendees.length})</p>
                  {attendees.length === 0 ? (
                    <p className="text-[#f5f0e8]/30 text-sm">No tickets issued yet.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-72 overflow-y-auto">
                      {attendees.map((a, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-[#f5f0e8]/80">{String(a.attendee_name)}</span>
                          <span className="text-[#f5f0e8]/30 text-xs">{String(a.ticket_type_name ?? '')}</span>
                          <span className="font-mono text-xs text-[#f5f0e8]/40">{String(a.code)}</span>
                          <span className={`text-[9px] font-black uppercase tracking-wider ${a.status === 'used' ? 'text-emerald-400' : 'text-[#c9a84c]/60'}`}>{a.status === 'used' ? 'in' : 'valid'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
