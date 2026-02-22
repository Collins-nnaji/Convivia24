'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ListingMarkSoldForm({ listingId, currency }: { listingId: string; currency: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saleValue, setSaleValue] = useState('');

  async function handleMarkSold(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const value = saleValue ? Number(saleValue) : undefined;
    if (value != null && (isNaN(value) || value < 0)) {
      setError('Enter a valid sale value.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'sold', sale_value: value ?? null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? 'Failed to update');
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError('Network error');
    }
    setLoading(false);
  }

  return (
    <div>
      <h2 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-600 mb-3">Mark as sold</h2>
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      <form onSubmit={handleMarkSold} className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="sale_value" className="block text-[11px] text-zinc-500 uppercase font-bold mb-1">
            Sale value ({currency})
          </label>
          <input
            id="sale_value"
            type="number"
            min="0"
            step="0.01"
            value={saleValue}
            onChange={(e) => setSaleValue(e.target.value)}
            placeholder="Final sale amount"
            className="bg-white border border-zinc-300 text-zinc-900 text-sm px-3 py-2 rounded w-40 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-700 hover:bg-green-600 text-white text-sm font-bold uppercase px-4 py-2 rounded transition-colors disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Mark sold'}
        </button>
      </form>
    </div>
  );
}
