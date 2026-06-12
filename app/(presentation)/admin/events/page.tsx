'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { useAdmin } from '../layout';

type Event = {
  id: string;
  name: string;
  description: string;
  event_type: string;
  frequency: string | null;
  day_of_week: string | null;
  time_start: string | null;
  time_end: string | null;
  access_level: string;
  access_note: string | null;
  image_url: string | null;
  booking_required: boolean;
  is_active: boolean;
  sort_order: number;
};

const BLANK: Partial<Event> = { name: '', description: '', event_type: 'weekly', access_level: 'public', booking_required: false, sort_order: 0 };

export default function EventsAdmin() {
  const { secret } = useAdmin();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'weekly' | 'signature' | 'special'>('weekly');
  const [editing, setEditing] = useState<Partial<Event> | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(''), 3000); }

  function load() {
    if (!secret) return;
    fetch('/api/events', { headers: { 'x-admin-secret': secret } })
      .then(r => r.json())
      .then(d => { setEvents(d.events || []); setLoading(false); });
  }
  useEffect(load, [secret]);

  async function save() {
    if (!editing?.name || !editing.description || !editing.event_type) return;
    setSaving(true);
    const isNew = !editing.id;
    const url = isNew ? '/api/events' : `/api/events/${editing.id}`;
    const res = await fetch(url, {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify(editing),
    });
    if (res.ok) { setEditing(null); load(); flash(isNew ? 'Event created.' : 'Event updated.'); }
    setSaving(false);
  }

  async function deleteEvent(id: string) {
    if (!confirm('Delete this event?')) return;
    await fetch(`/api/events/${id}`, { method: 'DELETE', headers: { 'x-admin-secret': secret } });
    load();
    flash('Event deleted.');
  }

  const filtered = events.filter(e => e.event_type === tab);

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c9a84c]/50 mb-1">Management</p>
          <h1 className="text-3xl font-light italic text-[#f5f0e8]">Events</h1>
        </div>
        <div className="flex items-center gap-3">
          {msg && <p className="text-emerald-400 text-sm bg-emerald-400/10 px-3 py-1.5">{msg}</p>}
          <button onClick={() => setEditing({ ...BLANK, event_type: tab })}
            className="flex items-center gap-2 bg-[#c9a84c] text-[#0a0a0a] text-[10px] font-black uppercase tracking-widest px-4 py-2.5 hover:bg-[#d4b464] transition-colors">
            <Plus size={12} /> Add event
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-8">
        {(['weekly', 'signature', 'special'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${tab === t ? 'bg-[#c9a84c] text-[#0a0a0a]' : 'border border-[#c9a84c]/20 text-[#f5f0e8]/40 hover:text-[#f5f0e8]/70'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="border border-[#c9a84c]/10 p-6 animate-pulse h-20" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="border border-[#c9a84c]/10 p-10 text-center">
          <p className="text-[#f5f0e8]/30 text-sm">No {tab} events yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(ev => (
            <div key={ev.id} className={`border p-5 flex items-start justify-between gap-4 ${ev.is_active ? 'border-[#c9a84c]/10' : 'border-[#c9a84c]/5 opacity-40'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3 mb-1">
                  <p className="text-sm italic text-[#f5f0e8]">{ev.name}</p>
                  {ev.frequency && <span className="text-[9px] uppercase tracking-widest text-[#c9a84c]/50">{ev.frequency}</span>}
                  {ev.day_of_week && <span className="text-[9px] text-[#f5f0e8]/30">{ev.day_of_week}</span>}
                  {ev.time_start && <span className="text-[9px] text-[#f5f0e8]/30">{ev.time_start}{ev.time_end ? ` – ${ev.time_end}` : ''}</span>}
                </div>
                <p className="text-xs text-[#f5f0e8]/30 truncate">{ev.description}</p>
                <p className="text-[9px] uppercase tracking-widest text-[#f5f0e8]/20 mt-1">{ev.access_level}{ev.access_note ? ` · ${ev.access_note}` : ''}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setEditing({ ...ev })} className="text-[#f5f0e8]/30 hover:text-[#c9a84c] transition-colors"><Pencil size={14} /></button>
                <button onClick={() => deleteEvent(ev.id)} className="text-[#f5f0e8]/30 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setEditing(null)}>
          <div className="bg-[#0a0a0a] border border-[#c9a84c]/25 p-8 w-full max-w-lg my-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl italic text-[#f5f0e8]">{editing.id ? 'Edit event' : 'New event'}</h2>
              <button onClick={() => setEditing(null)} className="text-[#f5f0e8]/30 hover:text-[#f5f0e8]"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              {([
                ['Name *', 'name', 'text'],
                ['Day / Frequency', 'day_of_week', 'text'],
                ['Start time', 'time_start', 'text'],
                ['End time', 'time_end', 'text'],
                ['Access note', 'access_note', 'text'],
                ['Image URL', 'image_url', 'text'],
              ] as [string, keyof Event, string][]).map(([lbl, key, type]) => (
                <div key={key}>
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#c9a84c]/50 block mb-1">{lbl}</label>
                  <input type={type} value={(editing[key] as string) || ''} onChange={e => setEditing(p => ({ ...p!, [key]: e.target.value }))}
                    className="w-full bg-transparent border-b border-[#c9a84c]/20 focus:border-[#c9a84c] text-[#f5f0e8] text-sm py-2 px-0 outline-none" />
                </div>
              ))}
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-[#c9a84c]/50 block mb-1">Description *</label>
                <textarea value={editing.description || ''} onChange={e => setEditing(p => ({ ...p!, description: e.target.value }))}
                  rows={3} className="w-full bg-transparent border-b border-[#c9a84c]/20 focus:border-[#c9a84c] text-[#f5f0e8] text-sm py-2 px-0 outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#c9a84c]/50 block mb-1">Type</label>
                  <select value={editing.event_type || 'weekly'} onChange={e => setEditing(p => ({ ...p!, event_type: e.target.value }))}
                    className="w-full bg-[#0a0a0a] border-b border-[#c9a84c]/20 text-[#f5f0e8] text-sm py-2 px-0 outline-none">
                    {['weekly', 'signature', 'special', 'private'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#c9a84c]/50 block mb-1">Access</label>
                  <select value={editing.access_level || 'public'} onChange={e => setEditing(p => ({ ...p!, access_level: e.target.value }))}
                    className="w-full bg-[#0a0a0a] border-b border-[#c9a84c]/20 text-[#f5f0e8] text-sm py-2 px-0 outline-none">
                    {['public', 'member', 'invitation', 'private'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.booking_required || false} onChange={e => setEditing(p => ({ ...p!, booking_required: e.target.checked }))} className="accent-[#c9a84c]" />
                <span className="text-sm text-[#f5f0e8]/60">Booking required</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="flex-1 border border-[#c9a84c]/20 text-[#f5f0e8]/40 hover:text-[#f5f0e8]/70 text-[10px] font-black uppercase tracking-widest py-2.5 transition-colors">Cancel</button>
              <button onClick={save} disabled={saving || !editing.name || !editing.description}
                className="flex-1 bg-[#c9a84c] hover:bg-[#d4b464] text-[#0a0a0a] text-[10px] font-black uppercase tracking-widest py-2.5 transition-colors disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
