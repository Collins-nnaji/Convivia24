'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '../layout';

type Reservation = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  space: string;
  occasion: string | null;
  special_requests: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'no-show' | 'completed';
  admin_notes: string | null;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-amber-400 bg-amber-400/10',
  confirmed: 'text-emerald-400 bg-emerald-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
  'no-show': 'text-red-600 bg-red-600/10',
  completed: 'text-[#c9a84c] bg-[#c9a84c]/10',
};

export default function ReservationsAdmin() {
  const { secret } = useAdmin();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!secret) return;
    setLoading(true);
    const url = filter === 'all' ? '/api/reservations' : `/api/reservations?status=${filter}`;
    fetch(url, { headers: { 'x-admin-secret': secret } })
      .then(r => r.json())
      .then(d => { setReservations(d.reservations || []); setLoading(false); });
  }, [secret, filter]);

  async function updateStatus(id: string, status: string, adminNotes?: string) {
    setSaving(true);
    const res = await fetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ status, admin_notes: adminNotes }),
    });
    if (res.ok) {
      const updated = await res.json();
      setReservations(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, ...updated } : null);
    }
    setSaving(false);
  }

  const filtered = filter === 'all' ? reservations : reservations.filter(r => r.status === filter);

  return (
    <div>
      <div className="mb-8">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c9a84c]/50 mb-1">Management</p>
        <h1 className="text-3xl font-light italic text-[#f5f0e8] mb-6">Reservations</h1>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled', 'no-show'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${filter === s ? 'bg-[#c9a84c] text-[#0a0a0a]' : 'border border-[#c9a84c]/20 text-[#f5f0e8]/40 hover:text-[#f5f0e8]/70'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border border-[#c9a84c]/10 p-5 animate-pulse">
                <div className="h-3 w-32 bg-[#c9a84c]/10 rounded mb-2" />
                <div className="h-3 w-48 bg-[#c9a84c]/5 rounded" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="border border-[#c9a84c]/10 p-10 text-center">
              <p className="text-[#f5f0e8]/30 text-sm">No reservations found.</p>
            </div>
          ) : filtered.map(res => (
            <button
              key={res.id}
              onClick={() => { setSelected(res); setNotes(res.admin_notes || ''); }}
              className={`w-full text-left border p-5 transition-colors ${selected?.id === res.id ? 'border-[#c9a84c]/40 bg-[#c9a84c]/5' : 'border-[#c9a84c]/10 hover:border-[#c9a84c]/20'}`}
            >
              <div className="flex items-start justify-between gap-4 mb-1">
                <p className="text-sm text-[#f5f0e8] font-medium">{res.name}</p>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 shrink-0 ${STATUS_COLORS[res.status]}`}>{res.status}</span>
              </div>
              <div className="flex items-center gap-4 flex-wrap mb-1">
                <p className="text-xs text-[#c9a84c]/70 font-medium">
                  {new Date(res.reservation_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} · {res.reservation_time}
                </p>
                <p className="text-xs text-[#f5f0e8]/40">{res.party_size} guests · {res.space}</p>
              </div>
              <p className="text-xs text-[#f5f0e8]/30">{res.email}</p>
            </button>
          ))}
        </div>

        {selected && (
          <div className="border border-[#c9a84c]/20 p-6 h-fit sticky top-24">
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#c9a84c]/50 mb-1">{selected.space}</p>
              <h2 className="text-xl italic text-[#f5f0e8] mb-1">{selected.name}</h2>
              <p className="text-xs text-[#f5f0e8]/40">{selected.email}</p>
              {selected.phone && <p className="text-xs text-[#f5f0e8]/30">{selected.phone}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-[#c9a84c]/10 pt-4 mb-4 text-sm">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-[#f5f0e8]/30 mb-0.5">Date</p>
                <p className="text-[#f5f0e8]/80">{new Date(selected.reservation_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-[#f5f0e8]/30 mb-0.5">Time</p>
                <p className="text-[#f5f0e8]/80">{selected.reservation_time}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-[#f5f0e8]/30 mb-0.5">Party size</p>
                <p className="text-[#f5f0e8]/80">{selected.party_size} guests</p>
              </div>
              {selected.occasion && (
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-[#f5f0e8]/30 mb-0.5">Occasion</p>
                  <p className="text-[#f5f0e8]/80">{selected.occasion}</p>
                </div>
              )}
            </div>
            {selected.special_requests && (
              <div className="border-t border-[#c9a84c]/10 pt-4 mb-4">
                <p className="text-[9px] uppercase tracking-widest text-[#f5f0e8]/30 mb-1">Special requests</p>
                <p className="text-sm text-[#f5f0e8]/60">{selected.special_requests}</p>
              </div>
            )}
            <div className="mb-4">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#c9a84c]/50 block mb-2">Admin notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-transparent border-b border-[#c9a84c]/20 focus:border-[#c9a84c] text-[#f5f0e8] text-sm py-2 px-0 outline-none resize-none placeholder-[#f5f0e8]/20"
                placeholder="Internal notes..."
              />
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {(['pending', 'confirmed', 'completed', 'cancelled', 'no-show'] as const).map(s => (
                <button
                  key={s}
                  disabled={saving || selected.status === s}
                  onClick={() => updateStatus(selected.id, s, notes)}
                  className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-colors disabled:opacity-40 ${selected.status === s ? 'bg-[#c9a84c] text-[#0a0a0a]' : 'border border-[#c9a84c]/20 text-[#f5f0e8]/50 hover:text-[#f5f0e8]'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              disabled={saving}
              onClick={() => updateStatus(selected.id, selected.status, notes)}
              className="w-full bg-[#c9a84c] hover:bg-[#d4b464] text-[#0a0a0a] text-[10px] font-black uppercase tracking-[0.2em] py-2.5 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save notes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
