'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '../layout';

type Inquiry = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  inquiry_type: string;
  message: string;
  status: 'new' | 'read' | 'responded' | 'archived';
  admin_notes: string | null;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  new: 'text-emerald-400 bg-emerald-400/10',
  read: 'text-blue-400 bg-blue-400/10',
  responded: 'text-[#c9a84c] bg-[#c9a84c]/10',
  archived: 'text-[#f5f0e8]/20 bg-[#f5f0e8]/5',
};

export default function InquiriesAdmin() {
  const { secret } = useAdmin();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!secret) return;
    setLoading(true);
    const url = filter === 'all' ? '/api/inquiries' : `/api/inquiries?status=${filter}`;
    fetch(url, { headers: { 'x-admin-secret': secret } })
      .then(r => r.json())
      .then(d => { setInquiries(d.inquiries || []); setLoading(false); });
  }, [secret, filter]);

  async function updateStatus(id: string, status: string, adminNotes?: string) {
    setSaving(true);
    const res = await fetch(`/api/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ status, admin_notes: adminNotes }),
    });
    if (res.ok) {
      const updated = await res.json();
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, ...updated } : i));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, ...updated } : null);
    }
    setSaving(false);
  }

  const filtered = filter === 'all' ? inquiries : inquiries.filter(i => i.status === filter);

  return (
    <div>
      <div className="mb-8">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c9a84c]/50 mb-1">Management</p>
        <h1 className="text-3xl font-light italic text-[#f5f0e8] mb-6">Inquiries</h1>
        <div className="flex gap-2 flex-wrap">
          {['all', 'new', 'read', 'responded', 'archived'].map(s => (
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
              <p className="text-[#f5f0e8]/30 text-sm">No inquiries found.</p>
            </div>
          ) : filtered.map(inq => (
            <button
              key={inq.id}
              onClick={() => { setSelected(inq); setNotes(inq.admin_notes || ''); if (inq.status === 'new') updateStatus(inq.id, 'read'); }}
              className={`w-full text-left border p-5 transition-colors ${selected?.id === inq.id ? 'border-[#c9a84c]/40 bg-[#c9a84c]/5' : 'border-[#c9a84c]/10 hover:border-[#c9a84c]/20'}`}
            >
              <div className="flex items-start justify-between gap-4 mb-1">
                <p className="text-sm text-[#f5f0e8] font-medium">{inq.name}</p>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 shrink-0 ${STATUS_COLORS[inq.status]}`}>{inq.status}</span>
              </div>
              <p className="text-xs text-[#f5f0e8]/40 mb-1">{inq.email}{inq.company ? ` · ${inq.company}` : ''}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#c9a84c]/50 mb-1">{inq.inquiry_type}</p>
              <p className="text-xs text-[#f5f0e8]/30 truncate">{inq.message}</p>
              <p className="text-[10px] text-[#f5f0e8]/20 mt-2">{new Date(inq.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </button>
          ))}
        </div>

        {selected && (
          <div className="border border-[#c9a84c]/20 p-6 h-fit sticky top-24">
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c9a84c]/50 mb-1">{selected.inquiry_type}</p>
              <h2 className="text-xl italic text-[#f5f0e8] mb-1">{selected.name}</h2>
              <p className="text-xs text-[#f5f0e8]/40">{selected.email}</p>
              {selected.company && <p className="text-xs text-[#f5f0e8]/30">{selected.company}</p>}
            </div>
            <div className="border-t border-[#c9a84c]/10 pt-4 mb-6">
              <p className="text-sm text-[#f5f0e8]/70 leading-relaxed">{selected.message}</p>
            </div>
            <div className="mb-4">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#c9a84c]/50 block mb-2">Admin notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-transparent border-b border-[#c9a84c]/20 focus:border-[#c9a84c] text-[#f5f0e8] text-sm py-2 px-0 outline-none resize-none placeholder-[#f5f0e8]/20"
                placeholder="Private notes..."
              />
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {(['new', 'read', 'responded', 'archived'] as const).map(s => (
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
