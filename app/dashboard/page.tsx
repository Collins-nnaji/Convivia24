import { requireAuth, getAppUser } from '@/lib/auth/session';
import sql from '@/lib/db';
import Link from 'next/link';
import { ArrowRight, GitBranch, MessageSquare, FileText, TrendingUp, ShieldAlert, Package } from 'lucide-react';

const STAGE_LABELS: Record<string, string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Won',
  closed_lost: 'Lost',
};

const STAGE_COLORS: Record<string, string> = {
  lead: 'bg-zinc-700',
  qualified: 'bg-blue-700',
  proposal: 'bg-yellow-600',
  negotiation: 'bg-orange-600',
  closed_won: 'bg-green-700',
  closed_lost: 'bg-zinc-600',
};

export default async function DashboardPage(props: { searchParams: Promise<{ admin?: string }> }) {
  const searchParams = await props.searchParams;
  const authUser = await requireAuth();
  const appUser = await getAppUser({ id: authUser.id, email: authUser.email!, name: authUser.name, image: authUser.image });

  // Get client linked to this user
  const clientRows = await sql`
    SELECT c.* FROM clients c
    JOIN client_users cu ON cu.client_id = c.id
    WHERE cu.user_id = ${appUser.id}
    LIMIT 1
  `;
  type ClientRow = { id: string; name: string };
  const client = (clientRows[0] as ClientRow | undefined) ?? null;

  const dealRows = client
    ? await sql`SELECT * FROM pipeline_deals WHERE client_id = ${client.id} ORDER BY created_at DESC LIMIT 10`
    : [];
  const deals = dealRows as { id: string; value?: string; currency?: string; stage: string; title?: string; created_at?: string }[];

  const unreadMessages = client
    ? await sql`SELECT COUNT(*) as count FROM messages WHERE client_id = ${client.id} AND sender_role = 'admin' AND read_at IS NULL`
    : [{ count: '0' }];

  const docCount = client
    ? await sql`SELECT COUNT(*) as count FROM documents WHERE client_id = ${client.id}`
    : [{ count: '0' }];

  const listingRows = client
    ? await sql`SELECT id, title, status, asking_price, currency, updated_at FROM listings WHERE client_id = ${client.id} ORDER BY updated_at DESC LIMIT 5`
    : [];
  const listings = listingRows as { id: string; title: string; status: string; asking_price?: string | null; currency: string; updated_at: string }[];
  const listingCountByStatus = client
    ? (await sql`SELECT status, COUNT(*) as count FROM listings WHERE client_id = ${client.id} GROUP BY status`) as { status: string; count: string }[]
    : [];
  const totalListings = listingCountByStatus.reduce((s, r) => s + Number(r.count), 0);
  const draftCount = listingCountByStatus.find((r) => r.status === 'draft')?.count ?? '0';
  const submittedCount = listingCountByStatus.filter((r) => ['submitted', 'price_agreed', 'listed'].includes(r.status)).reduce((s, r) => s + Number(r.count), 0);
  const soldCount = listingCountByStatus.find((r) => r.status === 'sold')?.count ?? '0';

  const totalValue = deals.reduce((sum: number, d) => sum + parseFloat(d.value || '0'), 0);
  const currency = deals[0]?.currency ?? 'GBP';
  const wonDeals = deals.filter((d) => d.stage === 'closed_won');

  return (
    <div className="p-8 max-w-5xl">
      {searchParams.admin === 'denied' && (
        <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Admin access not granted</p>
            <p className="text-xs text-amber-800 mt-0.5">You were sent here because your account role is &quot;{appUser.role}&quot;, not &quot;admin&quot;. Only allowed admin emails get the Admin panel. Your email: {appUser.email}</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="mb-8">
        <span className="inline-block bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 mb-3">
          Dashboard
        </span>
        <h1 className="text-3xl font-black tracking-tighter text-zinc-900 uppercase italic">
          Welcome back{appUser.name ? `, ${appUser.name.split(' ')[0]}` : ''}.
        </h1>
        {client && (
          <p className="text-zinc-600 text-sm mt-1">{client.name}</p>
        )}
      </div>

      {!client && (
        <div className="bg-white border border-zinc-200 rounded-lg p-6 mb-8 shadow-sm">
          <p className="text-zinc-600 text-sm">
            Your account is pending client assignment. The Convivia24 team will link your pipeline shortly.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Active Deals', value: deals.filter((d) => !['closed_won','closed_lost'].includes(d.stage)).length, icon: GitBranch, href: '/dashboard/pipeline' },
          { label: 'Pipeline Value', value: `${currency === 'GBP' ? '£' : currency}${(totalValue / 1000).toFixed(0)}k`, icon: TrendingUp, href: '/dashboard/pipeline' },
          { label: 'Listings', value: totalListings, sub: draftCount ? `${draftCount} draft` : soldCount ? `${soldCount} sold` : undefined, icon: Package, href: '/dashboard/listings' },
          { label: 'Unread Messages', value: Number(unreadMessages[0]?.count ?? 0), icon: MessageSquare, href: '/dashboard/messages' },
          { label: 'Documents', value: Number(docCount[0]?.count ?? 0), icon: FileText, href: '/dashboard/documents' },
        ].map(({ label, value, sub, icon: Icon, href }) => (
          <Link key={label} href={href} className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm hover:border-red-200 hover:shadow-md transition-all group">
            <Icon size={16} className="text-red-600 mb-3 group-hover:text-red-700" />
            <p className="text-2xl font-black text-zinc-900 tracking-tighter">{value}</p>
            <p className="text-[11px] text-zinc-500 uppercase tracking-[0.15em] mt-1">{label}</p>
            {sub && <p className="text-[10px] text-zinc-400 mt-0.5">{sub}</p>}
          </Link>
        ))}
      </div>

      {/* Recent Deals */}
      {deals.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-lg mb-6 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
            <h2 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-900">Recent Deals</h2>
            <Link href="/dashboard/pipeline" className="text-[11px] text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-zinc-100">
            {deals.slice(0, 5).map((deal) => (
              <div key={deal.id} className="flex items-center justify-between px-6 py-3.5">
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] font-black uppercase tracking-[0.1em] text-white px-2 py-0.5 rounded ${STAGE_COLORS[deal.stage] || 'bg-zinc-600'}`}>
                    {STAGE_LABELS[deal.stage] || deal.stage}
                  </span>
                  <span className="text-sm text-zinc-700">{deal.title}</span>
                </div>
                {deal.value && (
                  <span className="text-sm font-semibold text-zinc-900">
                    {deal.currency} {parseFloat(deal.value).toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Listings */}
      {client && listings.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-lg mb-6 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
            <h2 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-900">Items to sell</h2>
            <Link href="/dashboard/listings" className="text-[11px] text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-zinc-100">
            {listings.slice(0, 3).map((l) => (
              <Link key={l.id} href={`/dashboard/listings/${l.id}`} className="flex items-center justify-between px-6 py-3.5 hover:bg-zinc-50 transition-colors">
                <span className="text-sm text-zinc-700 font-medium truncate">{l.title}</span>
                <span className="text-[11px] text-zinc-500 shrink-0 ml-2">{l.status === 'draft' ? 'Draft' : l.status === 'sold' ? 'Sold' : 'In progress'}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { href: '/dashboard/pipeline',  label: 'Pipeline',    sub: 'Track your deals' },
          { href: '/dashboard/listings', label: 'Items to sell', sub: 'List items for us to sell' },
          { href: '/dashboard/messages', label: 'Messages',   sub: 'Talk to your team' },
          { href: '/dashboard/documents', label: 'Documents', sub: 'Files & reports' },
        ].map(({ href, label, sub }) => (
          <Link key={href} href={href}
            className="group flex items-center justify-between bg-white border border-zinc-200 rounded-lg hover:border-red-300 hover:shadow-md px-5 py-4 transition-all"
          >
            <div>
              <p className="text-sm font-black uppercase tracking-[0.1em] text-zinc-900">{label}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">{sub}</p>
            </div>
            <ArrowRight size={14} className="text-zinc-400 group-hover:text-red-500 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
