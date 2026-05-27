'use client';

import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useAdmin } from '../layout';

type Member = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  member_type: string;
  member_number: string | null;
  status: string;
  joined_at: string;
  renewal_date: string | null;
  notes: string | null;
};

type WaitlistEntry = { id: string; email: string; name: string | null; company: string | null; status: string; created_at: string };

const STATUS_COLORS: Record<string, string> = {
  active: 'text-emerald-400 bg-emerald-400/10',
  pending: 'text-amber-400 bg-amber-400/10',
  lapsed: 'text-[#f5f0e8]/30 bg-[#f5f0e8]/5',
  suspended: 'text-red-400 bg-red-400/10',
};

export default function MembersAdmin() {
  const { secret } = useAdmin();
  const [members, setMembers] = useState<Member[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'members' | 'waitlist'>('members');
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', member_type: 'regular', notes: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [selected, setSelected] = useState<Member | null>(null);

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(''), 3000); }

  function load() {
    if (!secret) return;
    Promise.all([
      fetch('/api/members', { headers: { 'x-admin-secret': secret } }).then(r => r.json()),
      fetch('/api/waitlist', { headers: { 'x-admin-secret': secret } }).then(r => r.json()),
    ]).then(([m, w]) => {
      setMembers(m.members || []);
      setWaitlist(w.waitlist || []);
      setLoading(false);
    });
  }
  useEffect(load, [secret]);

  async function addMember() {
    if (!form.name || !form.email) return;
    setSaving(true);
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) { setAdding(false); setForm({ name: '', email: '', phone: '', member_type: 'regular', notes: '' }); load(); flash('Member added.'); }
    else flash(data.error || 'Error adding member.');
    setSaving(false);
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/members/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ status }),
    });
    load();
    if (selected?.id === id) setSelected(p => p ? { ...p, status } : null);
  }

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c9a84c]/50 mb-1">Management</p>
          <h1 className="text-3xl font-light italic text-[#f5f0e8]">Convivium</h1>
        </div>
        <div className="flex items-center gap-3">
          {msg && <p className="text-emerald-400 text-sm bg-emerald-400/10 px-3 py-1.5">{msg}</p>}
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-2 bg-[#c9a84c] text-[#0a0a0a] text-[10px] font-black uppercase tracking-widest px-4 py-2.5 hover:bg-[#d4b464] transition-colors">
            <Plus size={12} /> Add member
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-8">
        {(['members', 'waitlist'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${tab === t ? 'bg-[#c9a84c] text-[#0a0a0a]' : 'border border-[#c9a84c]/20 text-[#f5f0e8]/40 hover:text-[#f5f0e8]/70'}`}>
            {t} {t === 'members' ? `(${members.length})` : `(${waitlist.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3, 4].map(i => <div key={i} className="border border-[#c9a84c]/10 p-5 animate-pulse h-16" />)}</div>
      ) : tab === 'members' ? (
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-2">
            {members.length === 0 ? (
              <div className="border border-[#c9a84c]/10 p-10 text-center"><p className="text-[#f5f0e8]/30 text-sm">No members yet.</p></div>
            ) : members.map(m => (
              <button key={m.id} onClick={() => setSelected(m)}
                className={`w-full text-left border p-4 transition-colors ${selected?.id === m.id ? 'border-[#c9a84c]/40 bg-[#c9a84c]/5' : 'border-[#c9a84c]/10 hover:border-[#c9a84c]/20'}`}>
                <div className="flex items-center justify-between gap-4 mb-0.5">
                  <p className="text-sm text-[#f5f0e8]">{m.name}</p>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 shrink-0 ${STATUS_COLORS[m.status]}`}>{m.status}</span>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-xs text-[#f5f0e8]/30">{m.email}</p>
                  <p className="text-[9px] uppercase tracking-widest text-[#c9a84c]/40">{m.member_type} · {m.member_number}</p>
                </div>
              </button>
            ))}
          </div>
          {selected && (
            <div className="border border-[#c9a84c]/20 p-6 h-fit sticky top-24">
              <div className="mb-4">
                <p className="text-[9px] uppercase tracking-widest text-[#c9a84c]/50">{selected.member_number} · {selected.member_type}</p>
                <h2 className="text-xl italic text-[#f5f0e8]">{selected.name}</h2>
                <p className="text-xs text-[#f5f0e8]/40">{selected.email}</p>
                {selected.phone && <p className="text-xs text-[#f5f0e8]/30">{selected.phone}</p>}
              </div>
              <div className="border-t border-[#c9a84c]/10 pt-4 mb-4 text-xs text-[#f5f0e8]/40 space-y-1">
                <p>Joined: {new Date(selected.joined_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                {selected.renewal_date && <p>Renewal: {new Date(selected.renewal_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                {selected.notes && <p className="text-[#f5f0e8]/30 italic">{selected.notes}</p>}
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[#c9a84c]/50 mb-2">Change status</p>
              <div className="flex flex-wrap gap-2">
                {['active', 'pending', 'lapsed', 'suspended'].map(s => (
                  <button key={s} onClick={() => updateStatus(selected.id, s)}
                    className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-colors ${selected.status === s ? 'bg-[#c9a84c] text-[#0a0a0a]' : 'border border-[#c9a84c]/20 text-[#f5f0e8]/40 hover:text-[#f5f0e8]'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {waitlist.length === 0 ? (
            <div className="border border-[#c9a84c]/10 p-10 text-center"><p className="text-[#f5f0e8]/30 text-sm">Waitlist is empty.</p></div>
          ) : waitlist.map(w => (
            <div key={w.id} className="border border-[#c9a84c]/10 p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-[#f5f0e8]">{w.name || '—'}{w.company ? ` · ${w.company}` : ''}</p>
                <p className="text-xs text-[#f5f0e8]/40">{w.email}</p>
                <p className="text-[10px] text-[#f5f0e8]/20 mt-0.5">{new Date(w.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 ${w.status === 'invited' ? 'text-[#c9a84c] bg-[#c9a84c]/10' : 'text-[#f5f0e8]/30 bg-[#f5f0e8]/5'}`}>{w.status}</span>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setAdding(false)}>
          <div className="bg-[#0a0a0a] border border-[#c9a84c]/25 p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl italic text-[#f5f0e8]">Add member</h2>
              <button onClick={() => setAdding(false)} className="text-[#f5f0e8]/30 hover:text-[#f5f0e8]"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              {(['name', 'email', 'phone'] as const).map(f => (
                <div key={f}>
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#c9a84c]/50 block mb-1">{f}{f !== 'phone' ? ' *' : ''}</label>
                  <input value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                    className="w-full bg-transparent border-b border-[#c9a84c]/20 focus:border-[#c9a84c] text-[#f5f0e8] text-sm py-2 px-0 outline-none" />
                </div>
              ))}
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-[#c9a84c]/50 block mb-1">Type</label>
                <select value={form.member_type} onChange={e => setForm(p => ({ ...p, member_type: e.target.value }))}
                  className="w-full bg-[#0a0a0a] border-b border-[#c9a84c]/20 text-[#f5f0e8] text-sm py-2 px-0 outline-none">
                  {['regular', 'host', 'creative', 'executive', 'local'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-[#c9a84c]/50 block mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={2} className="w-full bg-transparent border-b border-[#c9a84c]/20 focus:border-[#c9a84c] text-[#f5f0e8] text-sm py-2 px-0 outline-none resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setAdding(false)} className="flex-1 border border-[#c9a84c]/20 text-[#f5f0e8]/40 text-[10px] font-black uppercase tracking-widest py-2.5 transition-colors hover:text-[#f5f0e8]/70">Cancel</button>
              <button onClick={addMember} disabled={saving || !form.name || !form.email}
                className="flex-1 bg-[#c9a84c] hover:bg-[#d4b464] text-[#0a0a0a] text-[10px] font-black uppercase tracking-widest py-2.5 transition-colors disabled:opacity-50">
                {saving ? 'Adding…' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
