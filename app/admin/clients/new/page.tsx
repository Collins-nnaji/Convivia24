'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewClientPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', industry: '', contact_email: '', contact_phone: '' });
  const [userEmail, setUserEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError('');
    const res = await fetch('/api/admin/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, userEmail }),
    });
    if (res.ok) {
      const client = await res.json();
      router.push(`/admin/clients/${client.id}`);
    } else {
      const { error: msg } = await res.json();
      setError(msg || 'Failed to create client');
      setSaving(false);
    }
  }

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-8">
        <a href="/admin/clients" className="text-[11px] text-zinc-600 hover:text-zinc-900 transition-colors mb-4 block">← All Clients</a>
        <span className="inline-block bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 mb-3 rounded">New Client</span>
        <h1 className="text-3xl font-black tracking-tighter text-zinc-900 uppercase italic">Add Client</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 shadow-sm rounded-lg p-6 space-y-4">
        {[
          { key: 'name', label: 'Company Name*', placeholder: 'Acme Corp' },
          { key: 'industry', label: 'Industry', placeholder: 'SaaS, Retail, Finance…' },
          { key: 'contact_email', label: 'Contact Email', placeholder: 'ceo@acme.com' },
          { key: 'contact_phone', label: 'Contact Phone', placeholder: '+44 7700 000000' },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-1.5">{label}</label>
            <input
              value={(form as any)[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              placeholder={placeholder}
              className="w-full bg-white border border-zinc-300 text-zinc-900 text-sm px-4 py-2.5 placeholder-zinc-400 rounded focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
            />
          </div>
        ))}

        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-1.5">
            Client User Email (Google account they'll sign in with)
          </label>
          <input
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="client@example.com"
            type="email"
            className="w-full bg-white border border-zinc-300 text-zinc-900 text-sm px-4 py-2.5 placeholder-zinc-400 rounded focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
          />
          <p className="text-[10px] text-zinc-500 mt-1">Optional — you can link users later from the client page.</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={saving || !form.name.trim()}
          className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-black uppercase tracking-[0.1em] py-3 rounded transition-colors disabled:opacity-50">
          {saving ? 'Creating…' : 'Create Client'}
        </button>
      </form>
    </div>
  );
}
