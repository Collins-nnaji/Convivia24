'use client';

import { FormEvent, useState } from 'react';
import { useDialogs } from '@/components/admin/ui/DialogProvider';
import { AdminInput, AdminTextArea } from '@/components/admin/ui/Fields';
import { readError, type PortalSupplier } from './types';

export default function SupplierProfile({
  base,
  supplier,
  onChanged,
}: {
  base: string;
  supplier: PortalSupplier;
  onChanged: () => Promise<unknown>;
}) {
  const { notify } = useDialogs();
  const [form, setForm] = useState({
    contactName: supplier.contactName || '',
    phone: supplier.phone || '',
    email: supplier.email || '',
    sameDay: supplier.sameDay,
    notes: supplier.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await fetch(base, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      setError(await readError(res, 'Could not save.'));
      return;
    }
    notify('Contact details saved.');
    await onChanged();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <form onSubmit={save} className="space-y-4 rounded-2xl border border-obsidian/10 bg-white p-6">
        <h2 className="font-bold">Who Convivia24 should call</h2>
        {error && <p className="text-sm text-ember">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminInput label="Contact name" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
          <AdminInput label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+234…" />
          <AdminInput
            label="Email"
            hint="order alerts go here"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="sm:col-span-2"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-obsidian/70">
          <input type="checkbox" checked={form.sameDay} onChange={(e) => setForm({ ...form, sameDay: e.target.checked })} className="rounded border-obsidian/30 text-ember focus:ring-ember" />
          We can deliver same day
        </label>
        <AdminTextArea label="Notes for the desk" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Opening hours, pickup instructions, anything useful" />
        <button type="submit" disabled={saving} className="btn-brand px-6 py-3 text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-50">
          {saving ? 'Saving…' : 'Save details'}
        </button>
      </form>

      <aside className="space-y-3 rounded-2xl border border-obsidian/10 bg-white/60 p-6 text-sm text-obsidian/60">
        <h2 className="font-bold text-obsidian">Set by Convivia24</h2>
        <p><span className="text-obsidian/40">Business name</span><br />{supplier.name}</p>
        <p><span className="text-obsidian/40">City</span><br />{supplier.city}</p>
        <p><span className="text-obsidian/40">Delivery areas</span><br />{supplier.areas.length ? supplier.areas.join(', ') : `Anywhere in ${supplier.city}`}</p>
        <p><span className="text-obsidian/40">Categories</span><br />{supplier.categories.length ? supplier.categories.join(', ') : 'Not specified'}</p>
        <p className="text-xs text-obsidian/40">To change any of these, message the desk.</p>
      </aside>
    </div>
  );
}
