import { requireAdmin } from '@/lib/auth/session';
import sql from '@/lib/db';
import Link from 'next/link';
import { Users, GitBranch, MessageSquare, ClipboardList, Package, ArrowRight } from 'lucide-react';

export default async function AdminOverview() {
  await requireAdmin();

  const [
    clientCount,
    dealCount,
    unreadCount,
    leadCount,
    listingCount,
    listingSubmittedCount,
    recentDeals,
    recentLeads,
    recentListings,
  ] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM clients WHERE status = 'active'`,
    sql`SELECT COUNT(*) as count FROM pipeline_deals WHERE stage NOT IN ('closed_won','closed_lost')`,
    sql`SELECT COUNT(*) as count FROM messages WHERE sender_role = 'client' AND read_at IS NULL`,
    sql`SELECT COUNT(*) as count FROM audit_leads WHERE status = 'new'`,
    sql`SELECT COUNT(*) as count FROM listings`,
    sql`SELECT COUNT(*) as count FROM listings WHERE status IN ('submitted','price_agreed','listed')`,
    sql`SELECT d.*, c.name as client_name FROM pipeline_deals d JOIN clients c ON c.id = d.client_id ORDER BY d.updated_at DESC LIMIT 6`,
    sql`SELECT * FROM audit_leads WHERE status = 'new' ORDER BY created_at DESC LIMIT 5`,
    sql`SELECT l.id, l.title, l.status, l.client_id, c.name as client_name FROM listings l JOIN clients c ON c.id = l.client_id WHERE l.status IN ('submitted','price_agreed','listed') ORDER BY l.updated_at DESC LIMIT 5`,
  ]);

  const stats = [
    { label: 'Active Clients',    value: Number(clientCount[0]?.count ?? 0),  icon: Users,         href: '/admin/clients' },
    { label: 'Open Deals',        value: Number(dealCount[0]?.count ?? 0),    icon: GitBranch,     href: '/admin/pipeline' },
    { label: 'Listings',          value: Number(listingCount[0]?.count ?? 0),  icon: Package,      href: '/admin/listings', sub: Number(listingSubmittedCount[0]?.count ?? 0) > 0 ? `${listingSubmittedCount[0]?.count} in progress` : undefined },
    { label: 'Unread Messages',   value: Number(unreadCount[0]?.count ?? 0),  icon: MessageSquare, href: '/admin/messages' },
    { label: 'New Leads',         value: Number(leadCount[0]?.count ?? 0),    icon: ClipboardList, href: '/admin/leads' },
  ];

  const STAGE_COLORS: Record<string, string> = {
    lead: 'bg-zinc-700', qualified: 'bg-blue-700', proposal: 'bg-yellow-600',
    negotiation: 'bg-orange-600', closed_won: 'bg-green-700', closed_lost: 'bg-zinc-600',
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <span className="inline-block bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 mb-3">
          Command Center
        </span>
        <h1 className="text-3xl font-black tracking-tighter text-zinc-900 uppercase italic">
          Admin Overview
        </h1>
        <p className="text-zinc-600 text-sm mt-1">Everything across all client accounts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map(({ label, value, sub, icon: Icon, href }) => (
          <Link key={label} href={href}
            className="group bg-white border border-zinc-200 hover:border-red-400 shadow-sm p-5 transition-colors rounded-lg"
          >
            <Icon size={16} className="text-red-600 mb-3 group-hover:text-red-500" />
            <p className="text-2xl font-black text-zinc-900 tracking-tighter">{value}</p>
            <p className="text-[11px] text-zinc-500 uppercase tracking-[0.15em] mt-1">{label}</p>
            {sub !== undefined && sub !== null && <p className="text-[10px] text-zinc-500 mt-0.5">{sub}</p>}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent deals */}
        <div className="bg-white border border-zinc-200 shadow-sm rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
            <h2 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-900">Recent Deals</h2>
            <Link href="/admin/pipeline" className="text-[11px] text-red-600 hover:text-red-500 flex items-center gap-1">
              All <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-zinc-100">
            {recentDeals.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`shrink-0 text-[9px] font-black uppercase text-white px-1.5 py-0.5 rounded ${STAGE_COLORS[d.stage] || 'bg-zinc-600'}`}>
                    {d.stage.replace('_', ' ')}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-800 truncate">{d.title}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{d.client_name}</p>
                  </div>
                </div>
                {d.value && (
                  <span className="text-sm font-semibold text-zinc-900 shrink-0 ml-2">
                    {(d.currency === 'GBP' ? '£' : (d.currency || '') + ' ')}{parseFloat(d.value).toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* New leads */}
        <div className="bg-white border border-zinc-200 shadow-sm rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
            <h2 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-900">New Audit Leads</h2>
            <Link href="/admin/leads" className="text-[11px] text-red-600 hover:text-red-500 flex items-center gap-1">
              All <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-zinc-100">
            {recentLeads.length === 0 && (
              <p className="text-zinc-500 text-sm text-center py-6">No new leads</p>
            )}
            {recentLeads.map((lead: any) => (
              <div key={lead.id} className="px-6 py-3">
                <p className="text-sm font-semibold text-zinc-900">{lead.company || 'Unknown Company'}</p>
                <p className="text-[11px] text-zinc-500">{lead.email}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  {new Date(lead.created_at).toLocaleDateString('en-GB')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent listings (in progress) */}
        <div className="bg-white border border-zinc-200 shadow-sm rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
            <h2 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-900">Listings in progress</h2>
            <Link href="/admin/listings" className="text-[11px] text-red-600 hover:text-red-500 flex items-center gap-1">
              All <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-zinc-100">
            {(recentListings as { id: string; title: string; status: string; client_name: string }[]).length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-6">No listings in progress</p>
            ) : (
              (recentListings as { id: string; title: string; status: string; client_name: string }[]).map((l) => (
                <Link key={l.id} href={`/admin/listings/${l.id}`} className="flex items-center justify-between px-6 py-3 hover:bg-zinc-50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-800 truncate">{l.title}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{l.client_name}</p>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-zinc-200 text-zinc-700 shrink-0 ml-2">
                    {l.status.replace('_', ' ')}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-8">
        {[
          { href: '/admin/clients',   label: 'Clients' },
          { href: '/admin/clients/new', label: 'New client' },
          { href: '/admin/listings',  label: 'Listings' },
          { href: '/admin/pipeline',  label: 'Pipeline' },
          { href: '/admin/messages',  label: 'Messages' },
          { href: '/admin/leads',     label: 'Leads' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between bg-white border border-zinc-200 hover:border-red-400 px-4 py-3 transition-colors rounded-lg shadow-sm"
          >
            <span className="text-sm font-semibold text-zinc-800">{label}</span>
            <ArrowRight size={12} className="text-zinc-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}
