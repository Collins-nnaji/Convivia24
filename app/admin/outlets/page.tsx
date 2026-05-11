'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, ShieldCheck, ShieldOff, Eye } from 'lucide-react';

type Row = {
  id: string;
  status: string;
  business_name: string;
  city_name: string;
  street_address: string;
  phone: string;
  cac_number: string | null;
  user_email: string;
  user_name: string;
  submitted_at: string | null;
};

export default function AdminOutletApplicationsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/outlet-applications', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Forbidden');
      setRows(Array.isArray(data.applications) ? data.applications : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (id: string, action: 'approve' | 'reject' | 'under_review') => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/outlet-applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, admin_notes: notes[id]?.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="px-4 py-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-600">Admin</p>
          <h1 className="font-display text-3xl italic">Outlet applications</h1>
          <p className="text-sm text-neutral-600 mt-1">Review vendor profile requests and approve public outlet pages.</p>
        </div>
        <Link href="/admin" className="text-[10px] font-black uppercase tracking-widest text-red-700 hover:underline">
          Admin console
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-neutral-500">
          <Loader2 className="animate-spin" size={20} /> Loading…
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-900 text-sm">{error}</div>
      ) : rows.length === 0 ? (
        <p className="text-neutral-600">No applications yet.</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => (
            <li key={r.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-neutral-900">{r.business_name || '(unnamed)'}</p>
                  <p className="text-[12px] text-neutral-500 mt-0.5">
                    {r.city_name} · {r.user_name} · {r.user_email}
                  </p>
                  <p className="text-[12px] text-neutral-600 mt-2">{r.street_address}</p>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Phone {r.phone}
                    {r.cac_number ? ` · CAC ${r.cac_number}` : ''}
                  </p>
                  <span className="inline-block mt-2 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-neutral-100 border border-neutral-200">
                    {r.status}
                  </span>
                </div>
              </div>
              <textarea
                value={notes[r.id] ?? ''}
                onChange={(e) => setNotes((prev) => ({ ...prev, [r.id]: e.target.value }))}
                placeholder="Admin notes (optional)"
                rows={2}
                className="mt-3 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  type="button"
                  disabled={busyId === r.id}
                  onClick={() => patch(r.id, 'approve')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 hover:bg-emerald-800 disabled:opacity-50"
                >
                  {busyId === r.id ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                  Approve
                </button>
                <button
                  type="button"
                  disabled={busyId === r.id}
                  onClick={() => patch(r.id, 'under_review')}
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 text-neutral-800 text-[10px] font-black uppercase tracking-widest px-4 py-2 hover:border-amber-400 disabled:opacity-50"
                >
                  <Eye size={14} /> Under review
                </button>
                <button
                  type="button"
                  disabled={busyId === r.id}
                  onClick={() => patch(r.id, 'reject')}
                  className="inline-flex items-center gap-1.5 rounded-full border border-red-300 text-red-800 text-[10px] font-black uppercase tracking-widest px-4 py-2 hover:bg-red-50 disabled:opacity-50"
                >
                  <ShieldOff size={14} /> Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
