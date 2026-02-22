'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, MessageSquare, Edit2, Check, X } from 'lucide-react';

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

const STATUS_HELP: Record<string, string> = {
  draft: 'Edit and submit when ready. We’ll then agree price and commission in Messages.',
  submitted: 'We’re reviewing. We’ll message you to agree price and commission.',
  price_agreed: 'Terms are agreed. We’re listing and working on the sale.',
  listed: 'Listed for sale. We’ll update you when it sells.',
  sold: 'Sold. Sale value and commission are recorded.',
  withdrawn: 'This listing was withdrawn.',
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

export default function ListingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAskingPrice, setEditAskingPrice] = useState('');
  const [editCurrency, setEditCurrency] = useState('GBP');
  const [editCommissionPct, setEditCommissionPct] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/listings/${id}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setListing(data);
          setEditTitle(data.title ?? '');
          setEditDescription(data.description ?? '');
          setEditAskingPrice(data.asking_price != null && data.asking_price !== '' ? String(data.asking_price) : '');
          setEditCurrency(data.currency ?? 'GBP');
          setEditCommissionPct(data.commission_pct != null && data.commission_pct !== '' ? String(data.commission_pct) : '');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit() {
    if (!listing) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'submit' }),
      });
      if (res.ok) {
        const data = await res.json();
        setListing(data);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveEdit() {
    if (!listing) return;
    const res = await fetch(`/api/listings/${listing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        asking_price: editAskingPrice ? Number(editAskingPrice) : undefined,
        currency: editCurrency,
        commission_pct: editCommissionPct ? Number(editCommissionPct) : undefined,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setListing(data);
      setEditing(false);
    }
  }

  if (loading || !listing) {
    return (
      <div className="p-8">
        <p className="text-zinc-500 text-sm">{loading ? 'Loading…' : 'Listing not found.'}</p>
        {!loading && <Link href="/dashboard/listings" className="text-red-600 text-sm font-semibold mt-2 inline-block">← Back to listings</Link>}
      </div>
    );
  }

  const isDraft = listing.status === 'draft';

  return (
    <div className="p-8 max-w-2xl">
      <Link href="/dashboard/listings" className="inline-flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900 text-sm font-semibold mb-6">
        <ArrowLeft size={14} />
        Back to listings
      </Link>
      <div className="bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between flex-wrap gap-2">
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-zinc-200 text-zinc-700">
            {STATUS_LABELS[listing.status] ?? listing.status}
          </span>
          {isDraft && !editing && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900 text-xs font-semibold"
              >
                <Edit2 size={12} />
                Edit
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase px-3 py-2 rounded transition-colors disabled:opacity-60"
              >
                <Send size={12} />
                {submitting ? 'Submitting…' : 'Submit to Convivia24'}
              </button>
            </div>
          )}
        </div>
        <div className="p-6 space-y-6">
          {STATUS_HELP[listing.status] && (
            <p className="text-sm text-zinc-600 bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3">
              {STATUS_HELP[listing.status]}
            </p>
          )}
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Title *</label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full border border-zinc-200 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-zinc-200 rounded px-3 py-2 text-sm resize-y"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Asking price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editAskingPrice}
                    onChange={(e) => setEditAskingPrice(e.target.value)}
                    className="w-full border border-zinc-200 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Currency</label>
                  <select
                    value={editCurrency}
                    onChange={(e) => setEditCurrency(e.target.value)}
                    className="w-full border border-zinc-200 rounded px-3 py-2 text-sm"
                  >
                    <option value="GBP">GBP</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Commission %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={editCommissionPct}
                  onChange={(e) => setEditCommissionPct(e.target.value)}
                  className="w-full border border-zinc-200 rounded px-3 py-2 text-sm max-w-[120px]"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-4 py-2 rounded"
                >
                  <Check size={14} />
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="inline-flex items-center gap-1.5 border border-zinc-300 text-zinc-700 text-sm font-semibold px-4 py-2 rounded hover:bg-zinc-50"
                >
                  <X size={14} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-xl font-black text-zinc-900 tracking-tight">{listing.title}</h1>
                <p className="text-[11px] text-zinc-500 mt-1">Updated {relativeDate(listing.updated_at)}</p>
              </div>
              {listing.description && (
                <div>
                  <h2 className="text-xs font-bold uppercase text-zinc-500 mb-1">Description</h2>
                  <p className="text-sm text-zinc-700 whitespace-pre-wrap">{listing.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[11px] text-zinc-500 uppercase font-bold">Asking price</p>
                  <p className="text-zinc-900">{formatPrice(listing.asking_price, listing.currency)}</p>
                </div>
                {listing.agreed_price != null && listing.agreed_price !== '' && (
                  <div>
                    <p className="text-[11px] text-zinc-500 uppercase font-bold">Agreed price</p>
                    <p className="text-zinc-900">{formatPrice(listing.agreed_price, listing.currency)}</p>
                  </div>
                )}
                {(listing.commission_pct != null && listing.commission_pct !== '') || (listing.agreed_commission_pct != null && listing.agreed_commission_pct !== '') ? (
                  <div>
                    <p className="text-[11px] text-zinc-500 uppercase font-bold">Commission</p>
                    <p className="text-zinc-900">{Number(listing.agreed_commission_pct ?? listing.commission_pct)}%</p>
                  </div>
                ) : null}
                {listing.status === 'sold' && listing.sale_value != null && (
                  <div>
                    <p className="text-[11px] text-zinc-500 uppercase font-bold">Sale value</p>
                    <p className="text-green-700 font-semibold">{formatPrice(listing.sale_value, listing.currency)}</p>
                  </div>
                )}
              </div>
            </>
          )}
          <Link
            href="/dashboard/messages"
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-semibold"
          >
            <MessageSquare size={14} />
            Open Messages to discuss this listing
          </Link>
        </div>
      </div>
    </div>
  );
}
