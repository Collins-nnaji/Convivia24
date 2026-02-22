import { requireAdmin } from '@/lib/auth/session';
import sql from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ListingAgreeForm } from './ListingAgreeForm';
import { ListingMarkSoldForm } from './ListingMarkSoldForm';

type ListingRow = {
  id: string;
  client_id: string;
  client_name?: string;
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

export default async function AdminListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const rows = await sql`
    SELECT l.*, c.name as client_name
    FROM listings l
    JOIN clients c ON c.id = l.client_id
    WHERE l.id = ${id}
  `;
  const listing = rows[0] as ListingRow | undefined;
  if (!listing) notFound();

  const STATUS_LABELS: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    price_agreed: 'Price agreed',
    listed: 'Listed',
    sold: 'Sold',
    withdrawn: 'Withdrawn',
  };

  function formatPrice(value: number | string | null | undefined, currency: string): string {
    if (value == null || value === '') return '—';
    const n = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(n)) return '—';
    return `${currency === 'GBP' ? '£' : currency + ' '}${n.toLocaleString()}`;
  }

  const commissionAmount =
    listing.status === 'sold' &&
    listing.sale_value != null &&
    listing.agreed_commission_pct != null
      ? Number(listing.sale_value) * (Number(listing.agreed_commission_pct) / 100)
      : null;

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <Link href="/admin/listings" className="text-[11px] text-zinc-600 hover:text-zinc-900 transition-colors mb-4 block">
          ← All Listings
        </Link>
        <span className="inline-block bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 mb-3">
          Listing
        </span>
        <h1 className="text-3xl font-black tracking-tighter text-zinc-900 uppercase italic">{listing.title}</h1>
        <p className="text-zinc-600 text-sm mt-1">
          Client: <Link href={`/admin/clients/${listing.client_id}`} className="text-red-600 hover:text-red-500">{listing.client_name ?? listing.client_id}</Link>
          {' · '}
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-zinc-200 text-zinc-700">
            {STATUS_LABELS[listing.status] ?? listing.status}
          </span>
        </p>
      </div>

      <div className="bg-white border border-zinc-200 shadow-sm rounded-lg p-6 space-y-6">
        {listing.description && (
          <div>
            <h2 className="text-xs font-black uppercase text-zinc-500 mb-1">Description</h2>
            <p className="text-zinc-700 text-sm whitespace-pre-wrap">{listing.description}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-zinc-500 text-[11px] uppercase font-bold">Asking price</p>
            <p className="text-zinc-900">{formatPrice(listing.asking_price, listing.currency)}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-[11px] uppercase font-bold">Agreed price</p>
            <p className="text-zinc-900">{formatPrice(listing.agreed_price, listing.currency)}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-[11px] uppercase font-bold">Commission %</p>
            <p className="text-zinc-900">{listing.agreed_commission_pct != null && listing.agreed_commission_pct !== '' ? `${Number(listing.agreed_commission_pct)}%` : '—'}</p>
          </div>
          {listing.status === 'sold' && (
            <>
              <div>
                <p className="text-zinc-500 text-[11px] uppercase font-bold">Sale value</p>
                <p className="text-zinc-900">{formatPrice(listing.sale_value, listing.currency)}</p>
              </div>
              {commissionAmount != null && (
                <div>
                  <p className="text-zinc-500 text-[11px] uppercase font-bold">Commission earned</p>
                  <p className="text-green-700 font-semibold">{formatPrice(commissionAmount, listing.currency)}</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="pt-4 border-t border-zinc-200 flex flex-wrap gap-4">
          <Link
            href={`/admin/clients/${listing.client_id}`}
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-500 text-sm font-semibold"
          >
            Open client (Messages & deals) →
          </Link>
        </div>

        {listing.status !== 'sold' && listing.status !== 'withdrawn' && (
          <div className="pt-4 border-t border-zinc-200 space-y-6">
            <ListingAgreeForm listingId={id} currentStatus={listing.status} agreedPrice={listing.agreed_price} agreedCommissionPct={listing.agreed_commission_pct} currency={listing.currency} />
            {(listing.status === 'price_agreed' || listing.status === 'listed') && (
              <ListingMarkSoldForm listingId={id} currency={listing.currency} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
