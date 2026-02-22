'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Plus, Send, ArrowRight } from 'lucide-react';

type Listing = {
  id: string;
  client_id: string;
  title: string;
  description?: string | null;
  asking_price?: number | string | null;
  currency: string;
  commission_pct?: number | string | null;
  status: string;
  agreed_price?: number | string | null;
  agreed_commission_pct?: number | string | null;
  sold_at?: string | null;
  sale_value?: number | string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  price_agreed: 'Price agreed',
  listed: 'Listed',
  sold: 'Sold',
  withdrawn: 'Withdrawn',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-zinc-200 text-zinc-700',
  submitted: 'bg-blue-100 text-blue-800',
  price_agreed: 'bg-amber-100 text-amber-800',
  listed: 'bg-green-100 text-green-800',
  sold: 'bg-emerald-200 text-emerald-900',
  withdrawn: 'bg-zinc-300 text-zinc-600',
};

function formatPrice(value: number | string | null | undefined, currency: string): string {
  if (value == null || value === '') return '—';
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return '—';
  return `${currency === 'GBP' ? '£' : currency + ' '}${n.toLocaleString()}`;
}

function relativeDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return d.toLocaleDateString();
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  async function load() {
    const res = await fetch('/api/listings', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setListings(Array.isArray(data) ? data : []);
    } else {
      setListings([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(id: string) {
    setSubmittingId(id);
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'submit' }),
      });
      if (res.ok) await load();
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-block bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 mb-3">
            Items to sell
          </span>
          <h1 className="text-3xl font-black tracking-tighter text-zinc-900 uppercase italic">
            Your listings
          </h1>
          <p className="text-zinc-600 text-sm mt-1">
            Add items you want Convivia24 to sell. We agree price and commission in Messages, then list and sell.
          </p>
        </div>
        <Link
          href="/dashboard/listings/new"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-black uppercase tracking-[0.1em] px-5 py-3 rounded transition-colors"
        >
          <Plus size={16} />
          Add listing
        </Link>
      </div>

      {loading ? (
        <p className="text-zinc-500 text-sm">Loading…</p>
      ) : listings.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-lg p-8 shadow-sm text-center">
          <Package className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-600 text-sm mb-4">No listings yet.</p>
          <Link
            href="/dashboard/listings/new"
            className="inline-flex items-center gap-2 text-red-600 font-semibold text-sm hover:text-red-700"
          >
            <Plus size={14} />
            Add your first listing
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            <span className="text-zinc-600">
              <strong className="text-zinc-900">{listings.length}</strong> total
            </span>
            {listings.filter((l) => l.status === 'draft').length > 0 && (
              <span className="text-zinc-500">
                {listings.filter((l) => l.status === 'draft').length} draft
              </span>
            )}
            {listings.filter((l) => ['submitted', 'price_agreed', 'listed'].includes(l.status)).length > 0 && (
              <span className="text-zinc-500">
                {listings.filter((l) => ['submitted', 'price_agreed', 'listed'].includes(l.status)).length} in progress
              </span>
            )}
            {listings.filter((l) => l.status === 'sold').length > 0 && (
              <span className="text-zinc-500">
                {listings.filter((l) => l.status === 'sold').length} sold
              </span>
            )}
          </div>
          <div className="space-y-3">
            {listings.map((l) => (
              <div
                key={l.id}
                className="bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <Link href={`/dashboard/listings/${l.id}`} className="min-w-0 flex-1 group">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${STATUS_COLORS[l.status] ?? 'bg-zinc-200 text-zinc-700'}`}>
                        {STATUS_LABELS[l.status] ?? l.status}
                      </span>
                      <span className="text-[10px] text-zinc-400">{relativeDate(l.updated_at)}</span>
                    </div>
                    <h2 className="text-lg font-bold text-zinc-900 truncate group-hover:text-red-600 transition-colors">{l.title}</h2>
                    {l.description && (
                      <p className="text-sm text-zinc-500 mt-0.5 line-clamp-2">{l.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-2 text-[11px] text-zinc-600">
                      <span>Asking: {formatPrice(l.asking_price, l.currency)}</span>
                      {l.agreed_price != null && l.agreed_price !== '' && (
                        <span>Agreed: {formatPrice(l.agreed_price, l.currency)}</span>
                      )}
                      {l.agreed_commission_pct != null && l.agreed_commission_pct !== '' && (
                        <span>Commission: {Number(l.agreed_commission_pct)}%</span>
                      )}
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    {l.status === 'draft' && (
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); handleSubmit(l.id); }}
                        disabled={!!submittingId}
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider px-3 py-2 rounded transition-colors disabled:opacity-60"
                      >
                        <Send size={12} />
                        {submittingId === l.id ? 'Submitting…' : 'Submit'}
                      </button>
                    )}
                    <Link
                      href={`/dashboard/listings/${l.id}`}
                      className="inline-flex items-center gap-1.5 border border-zinc-300 text-zinc-700 text-xs font-semibold px-3 py-2 rounded hover:bg-zinc-50 transition-colors"
                    >
                      View
                      <ArrowRight size={12} />
                    </Link>
                    <Link
                      href="/dashboard/messages"
                      className="inline-flex items-center gap-1.5 border border-zinc-300 text-zinc-700 text-xs font-semibold px-3 py-2 rounded hover:bg-zinc-50 transition-colors"
                    >
                      Messages
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
