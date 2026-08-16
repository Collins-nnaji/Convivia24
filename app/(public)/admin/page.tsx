'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { formatNgn } from '@/lib/drinks/catalog';

type Item = {
  slug: string;
  name: string;
  on_hand: number;
  available: number;
  price_ngn: number | null;
  image_url: string | null;
  source: string;
  active: boolean;
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [msg, setMsg] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [blobOk, setBlobOk] = useState(false);
  const [aiOk, setAiOk] = useState(false);

  async function load() {
    const res = await fetch('/api/admin/inventory');
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await res.json();
    setAuthed(true);
    setItems(data.items || []);
    setBlobOk(Boolean(data.blobConfigured));
    setAiOk(Boolean(data.aiConfigured));
  }

  useEffect(() => {
    load().catch(() => setAuthed(false));
  }, []);

  async function login(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const res = await fetch('/api/admin/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', password }),
    });
    setLoading(false);
    if (!res.ok) {
      setMsg('Invalid password');
      return;
    }
    await load();
  }

  async function onUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/admin/inventory', { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error || 'Upload failed');
      return;
    }
    setMsg(`Saved ${data.item?.name}`);
    e.currentTarget.reset();
    await load();
  }

  async function askAi() {
    setLoading(true);
    const res = await fetch('/api/admin/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ai-list' }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error || 'AI unavailable');
      return;
    }
    setAdvice(data.advice || '');
  }

  if (!authed) {
    return (
      <section className="bg-paper min-h-[70vh] px-5 py-16">
        <div className="max-w-md mx-auto bg-white p-8 shadow-[0_12px_40px_-18px_rgba(10,10,10,0.28)]">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-ember mb-2">Admin</p>
          <h1 className="text-2xl font-bold mb-4">Stock desk</h1>
          <p className="text-sm text-obsidian/50 mb-6">
            Sign in with <code className="text-xs">ADMIN_PASSWORD</code>, or use a Neon Auth account listed in{' '}
            <code className="text-xs">CONVIVIA_ADMIN_EMAILS</code>.
          </p>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-sm py-2"
            />
            <button type="submit" disabled={loading} className="w-full py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em]">
              {loading ? '…' : 'Enter'}
            </button>
          </form>
          {msg && <p className="text-sm text-ember mt-4">{msg}</p>}
          <p className="text-xs text-obsidian/40 mt-6">
            Or{' '}
            <Link href="/signin?next=/admin" className="text-ember">
              sign in with Neon Auth
            </Link>
            .
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-ember mb-2">Admin</p>
            <h1 className="text-3xl font-bold">Inventory</h1>
            <p className="text-sm text-obsidian/50 mt-1">
              Azure upload {blobOk ? 'ready' : 'not configured'} · OpenAI {aiOk ? 'ready' : 'off'}
            </p>
          </div>
          <button
            type="button"
            onClick={askAi}
            disabled={loading || !aiOk}
            className="px-4 py-2.5 border border-obsidian/15 text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-40"
          >
            AI stock advice
          </button>
        </div>

        {msg && <p className="text-sm text-ember mb-6">{msg}</p>}
        {advice && (
          <div className="mb-8 bg-white p-5 text-sm text-obsidian/70 leading-relaxed whitespace-pre-wrap shadow-sm">
            {advice}
          </div>
        )}

        <form onSubmit={onUpload} className="bg-white p-6 sm:p-8 mb-12 space-y-4 shadow-[0_12px_40px_-18px_rgba(10,10,10,0.28)]">
          <h2 className="font-bold">Add / update stock</h2>
          <p className="text-sm text-obsidian/50">
            Upload a bottle image to Azure Storage. New SKUs appear in the shop with live on-hand counts.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field name="name" label="Name" required />
            <Field name="slug" label="Slug (optional)" placeholder="auto-from-name" />
            <Field name="priceNgn" label="Price (NGN)" type="number" required />
            <Field name="onHand" label="On hand" type="number" required />
            <Field name="brand" label="Brand" />
            <Field name="category" label="Category" placeholder="whisky, cognac, spirits…" />
            <Field name="volume" label="Volume" placeholder="70cl" />
            <Field name="abv" label="ABV %" type="number" />
          </div>
          <Field name="tagline" label="Tagline" />
          <Field name="description" label="Description" />
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1.5">
              Product image
            </label>
            <input name="image" type="file" accept="image/*" className="text-sm" />
          </div>
          <button type="submit" disabled={loading} className="px-6 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em]">
            {loading ? 'Saving…' : 'Save to shop'}
          </button>
        </form>

        <div className="overflow-x-auto bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/40 border-b border-obsidian/8">
                <th className="p-3">Product</th>
                <th className="p-3">On hand</th>
                <th className="p-3">Price</th>
                <th className="p-3">Source</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.slug} className="border-b border-obsidian/6">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {item.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image_url} alt="" className="w-10 h-12 object-cover" />
                      ) : (
                        <div className="w-10 h-12 bg-paper border border-obsidian/10" />
                      )}
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-[11px] text-obsidian/40 font-mono">{item.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 tabular-nums">{item.on_hand}</td>
                  <td className="p-3 tabular-nums">{item.price_ngn ? formatNgn(item.price_ngn) : '—'}</td>
                  <td className="p-3 text-obsidian/45">{item.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Field({
  name,
  label,
  type = 'text',
  required,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-sm py-2"
      />
    </div>
  );
}
