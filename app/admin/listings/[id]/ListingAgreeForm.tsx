'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ListingAgreeForm({
  listingId,
  currentStatus,
  agreedPrice,
  agreedCommissionPct,
  currency,
}: {
  listingId: string;
  currentStatus: string;
  agreedPrice: unknown;
  agreedCommissionPct: unknown;
  currency: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedPriceVal, setAgreedPriceVal] = useState(
    agreedPrice != null && agreedPrice !== '' ? String(agreedPrice) : ''
  );
  const [commissionVal, setCommissionVal] = useState(
    agreedCommissionPct != null && agreedCommissionPct !== '' ? String(agreedCommissionPct) : ''
  );

  async function handleAgree(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body: { agreed_price?: number; agreed_commission_pct?: number; status: string } = {
        status: 'price_agreed',
      };
      if (agreedPriceVal) body.agreed_price = Number(agreedPriceVal);
      if (commissionVal) body.agreed_commission_pct = Number(commissionVal);
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
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

  async function handleSetListed() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'listed' }),
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
      <h2 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-600 mb-3">Set agreed terms</h2>
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      <form onSubmit={handleAgree} className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="agreed_price" className="block text-[11px] text-zinc-500 uppercase font-bold mb-1">
            Agreed price ({currency})
          </label>
          <input
            id="agreed_price"
            type="number"
            min="0"
            step="0.01"
            value={agreedPriceVal}
            onChange={(e) => setAgreedPriceVal(e.target.value)}
            className="bg-white border border-zinc-300 text-zinc-900 text-sm px-3 py-2 rounded w-32 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
        <div>
          <label htmlFor="commission_pct" className="block text-[11px] text-zinc-500 uppercase font-bold mb-1">
            Commission %
          </label>
          <input
            id="commission_pct"
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={commissionVal}
            onChange={(e) => setCommissionVal(e.target.value)}
            className="bg-white border border-zinc-300 text-zinc-900 text-sm px-3 py-2 rounded w-24 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-red-700 hover:bg-red-600 text-white text-sm font-bold uppercase px-4 py-2 rounded transition-colors disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Mark as agreed'}
        </button>
        {(currentStatus === 'price_agreed' || currentStatus === 'listed') && (
          <button
            type="button"
            onClick={handleSetListed}
            disabled={loading || currentStatus === 'listed'}
            className="border border-zinc-300 text-zinc-700 text-sm font-semibold px-4 py-2 rounded hover:bg-zinc-100 transition-colors disabled:opacity-50"
          >
            {currentStatus === 'listed' ? 'Listed' : 'Mark as listed'}
          </button>
        )}
      </form>
    </div>
  );
}
