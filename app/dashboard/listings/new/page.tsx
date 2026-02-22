'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, ArrowLeft } from 'lucide-react';

export default function NewListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [askingPrice, setAskingPrice] = useState('');
  const [currency, setCurrency] = useState('GBP');
  const [commissionPct, setCommissionPct] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          asking_price: askingPrice ? Number(askingPrice) : undefined,
          currency: currency.trim() || 'GBP',
          commission_pct: commissionPct ? Number(commissionPct) : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? 'Failed to create listing.');
        setLoading(false);
        return;
      }
      router.push('/dashboard/listings');
      router.refresh();
    } catch {
      setError('Network error.');
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-8">
        <Link
          href="/dashboard/listings"
          className="inline-flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900 text-sm font-semibold mb-4"
        >
          <ArrowLeft size={14} />
          Back to listings
        </Link>
        <span className="inline-block bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 mb-3">
          Items to sell
        </span>
        <h1 className="text-3xl font-black tracking-tighter text-zinc-900 uppercase italic">
          Add listing
        </h1>
        <p className="text-zinc-600 text-sm mt-1">
          Add an item you want Convivia24 to sell. You can discuss price and commission in Messages after submitting.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-lg shadow-sm p-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Office furniture lot"
            required
            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the item(s)"
            rows={3}
            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-y"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="asking_price" className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Asking price
            </label>
            <input
              id="asking_price"
              type="number"
              min="0"
              step="0.01"
              value={askingPrice}
              onChange={(e) => setAskingPrice(e.target.value)}
              placeholder="0"
              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="currency" className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Currency
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="GBP">GBP</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="commission_pct" className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
            Commission % (optional – can agree in Messages)
          </label>
          <input
            id="commission_pct"
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={commissionPct}
            onChange={(e) => setCommissionPct(e.target.value)}
            placeholder="e.g. 10"
            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-black uppercase tracking-[0.1em] px-5 py-3 rounded transition-colors disabled:opacity-60"
          >
            <Package size={16} />
            {loading ? 'Creating…' : 'Save as draft'}
          </button>
          <Link
            href="/dashboard/listings"
            className="inline-flex items-center border border-zinc-300 text-zinc-700 text-sm font-semibold px-5 py-3 rounded hover:bg-zinc-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
