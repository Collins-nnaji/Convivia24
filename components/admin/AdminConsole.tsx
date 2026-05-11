'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Loader2, ShieldCheck, Trash2, UserPlus } from 'lucide-react';

type AdminUser = {
  id: string;
  email: string;
  role: 'owner' | 'admin';
  added_by: string | null;
  created_at: string;
  updated_at: string;
};

export function AdminConsole() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'owner'>('admin');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not load admins.');
      setAdmins(Array.isArray(data.admins) ? data.admins : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load admins.');
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const addAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save admin.');
      setEmail('');
      setRole('admin');
      setMessage(`${data.admin.email} can now access the admin console.`);
      await loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save admin.');
    } finally {
      setSaving(false);
    }
  };

  const removeAdmin = async (admin: AdminUser) => {
    setBusyId(admin.id);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`/api/admin/users/${admin.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not remove admin.');
      setMessage(`${admin.email} was removed from admins.`);
      await loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove admin.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-700">Manage access</p>
              <h1 className="mt-2 font-display text-3xl italic md:text-4xl">Admin console</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                Only signed-in admins can open this area. Add trusted people here and they can manage outlet reviews
                and admin access.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              <ShieldCheck className="mb-1" size={18} />
              Database-backed access
            </div>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</div>
          ) : null}
          {message ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              {message}
            </div>
          ) : null}

          <div className="mt-7 overflow-hidden rounded-3xl border border-neutral-200">
            {loading ? (
              <div className="flex items-center gap-2 p-5 text-sm text-neutral-500">
                <Loader2 className="animate-spin" size={18} /> Loading admins…
              </div>
            ) : (
              <ul className="divide-y divide-neutral-200">
                {admins.map((admin) => (
                  <li key={admin.id} className="flex flex-wrap items-center justify-between gap-4 bg-white px-4 py-4">
                    <div>
                      <p className="font-semibold text-neutral-900">{admin.email}</p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {admin.role === 'owner' ? 'Owner admin' : 'Admin'}
                        {admin.added_by ? ` · added by ${admin.added_by}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-neutral-700">
                        {admin.role}
                      </span>
                      {admin.role !== 'owner' ? (
                        <button
                          type="button"
                          onClick={() => removeAdmin(admin)}
                          disabled={busyId === admin.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          {busyId === admin.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <aside className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-700">Add admin</p>
          <form onSubmit={addAdmin} className="mt-5 space-y-4">
            <label className="block">
              <span className="text-xs font-bold text-neutral-700">Email address</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="name@example.com"
                className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-300 focus:ring-4 focus:ring-red-100"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-neutral-700">Role</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value === 'owner' ? 'owner' : 'admin')}
                className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-300 focus:ring-4 focus:ring-red-100"
              >
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-700 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-white hover:bg-red-800 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
              Add admin
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
