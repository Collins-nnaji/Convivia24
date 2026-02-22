import { requireAdmin } from '@/lib/auth/session';
import sql from '@/lib/db';
import Link from 'next/link';
import { ListingsFilters } from './ListingsFilters';

export default async function AdminListingsPage(props: { searchParams: Promise<{ client_id?: string; status?: string }> }) {
  await requireAdmin();
  const searchParams = await props.searchParams;
  const clientId = searchParams.client_id ?? null;
  const status = searchParams.status ?? null;

  const clients = await sql`SELECT id, name FROM clients ORDER BY name`;

  let listings: Record<string, unknown>[];
  if (clientId && status) {
    listings = (await sql`
      SELECT l.*, c.name as client_name
      FROM listings l
      JOIN clients c ON c.id = l.client_id
      WHERE l.client_id = ${clientId} AND l.status = ${status}
      ORDER BY l.updated_at DESC
    `) as Record<string, unknown>[];
  } else if (clientId) {
    listings = (await sql`
      SELECT l.*, c.name as client_name
      FROM listings l
      JOIN clients c ON c.id = l.client_id
      WHERE l.client_id = ${clientId}
      ORDER BY l.updated_at DESC
    `) as Record<string, unknown>[];
  } else if (status) {
    listings = (await sql`
      SELECT l.*, c.name as client_name
      FROM listings l
      JOIN clients c ON c.id = l.client_id
      WHERE l.status = ${status}
      ORDER BY l.updated_at DESC
    `) as Record<string, unknown>[];
  } else {
    listings = (await sql`
      SELECT l.*, c.name as client_name
      FROM listings l
      JOIN clients c ON c.id = l.client_id
      ORDER BY l.updated_at DESC
    `) as Record<string, unknown>[];
  }

  const STATUS_LABELS: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    price_agreed: 'Price agreed',
    listed: 'Listed',
    sold: 'Sold',
    withdrawn: 'Withdrawn',
  };

  function formatPrice(value: unknown, currency: string): string {
    if (value == null || value === '') return '—';
    const n = typeof value === 'string' ? parseFloat(value) : Number(value);
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
    return d.toLocaleDateString('en-GB');
  }

  const countDraft = listings.filter((l) => String(l.status) === 'draft').length;
  const countInProgress = listings.filter((l) => ['submitted', 'price_agreed', 'listed'].includes(String(l.status))).length;
  const countSold = listings.filter((l) => String(l.status) === 'sold').length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <span className="inline-block bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 mb-3">
          Listings
        </span>
        <h1 className="text-3xl font-black tracking-tighter text-zinc-900 uppercase italic">
          Items to sell
        </h1>
        <p className="text-zinc-600 text-sm mt-1">
          Partner listings: agree price and commission in Messages, then set agreed terms and mark sold here.
        </p>
      </div>

      <ListingsFilters clients={clients as { id: string; name: string }[]} currentClientId={clientId} currentStatus={status} />

      {listings.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-4 mb-3 text-sm">
          <span className="text-zinc-600">
            <strong className="text-zinc-900">{listings.length}</strong> showing
          </span>
          {countDraft > 0 && <span className="text-zinc-500">{countDraft} draft</span>}
          {countInProgress > 0 && <span className="text-zinc-500">{countInProgress} in progress</span>}
          {countSold > 0 && <span className="text-zinc-500">{countSold} sold</span>}
        </div>
      )}

      <div className="bg-white border border-zinc-200 shadow-sm rounded-lg overflow-hidden mt-2">
        {listings.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-12">No listings match the filters.</p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {listings.map((l) => (
              <Link
                key={String(l.id)}
                href={`/admin/listings/${l.id}`}
                className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 hover:bg-zinc-50 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-zinc-900 truncate">{String(l.title)}</p>
                    <span className="text-[10px] text-zinc-500 shrink-0">{relativeDate(String(l.updated_at))}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 truncate">{String(l.client_name)}</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-[11px] text-zinc-500">
                    <span>Asking: {formatPrice(l.asking_price, String(l.currency ?? 'GBP'))}</span>
                    {l.agreed_price != null && l.agreed_price !== '' && (
                      <span>Agreed: {formatPrice(l.agreed_price, String(l.currency ?? 'GBP'))}</span>
                    )}
                    {l.agreed_commission_pct != null && l.agreed_commission_pct !== '' && (
                      <span>Commission: {Number(l.agreed_commission_pct)}%</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-zinc-200 text-zinc-700">
                    {STATUS_LABELS[String(l.status)] ?? String(l.status)}
                  </span>
                  <span className="text-zinc-400">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
