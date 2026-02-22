import { requireAdmin } from '@/lib/auth/session';
import sql from '@/lib/db';
import Link from 'next/link';
import { Users, GitBranch, MessageSquare, ClipboardList, ArrowRight } from 'lucide-react';

export default async function AdminOverview() {
  await requireAdmin();

  const [
    clientCount,
    dealCount,
    unreadCount,
    leadCount,
    recentDeals,
    recentLeads,
  ] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM clients WHERE status = 'active'`,
    sql`SELECT COUNT(*) as count FROM pipeline_deals WHERE stage NOT IN ('closed_won','closed_lost')`,
    sql`SELECT COUNT(*) as count FROM messages WHERE sender_role = 'client' AND read_at IS NULL`,
    sql`SELECT COUNT(*) as count FROM audit_leads WHERE status = 'new'`,
    sql`SELECT d.*, c.name as client_name FROM pipeline_deals d JOIN clients c ON c.id = d.client_id ORDER BY d.updated_at DESC LIMIT 6`,
    sql`SELECT * FROM audit_leads WHERE status = 'new' ORDER BY created_at DESC LIMIT 5`,
  ]);

  const stats = [
    { label: 'Active Clients',    value: Number(clientCount[0]?.count ?? 0),  icon: Users,         href: '/admin/clients' },
    { label: 'Open Deals',        value: Number(dealCount[0]?.count ?? 0),    icon: GitBranch,     href: '/admin/pipeline' },
    { label: 'Unread Messages',   value: Number(unreadCount[0]?.count ?? 0),  icon: MessageSquare, href: '/admin/messages' },
    { label: 'New Audit Leads',   value: Number(leadCount[0]?.count ?? 0),    icon: ClipboardList, href: '/admin/leads' },
  ];

  const STAGE_COLORS: Record<string, string> = {
    lead: 'bg-zinc-700', qualified: 'bg-blue-700', proposal: 'bg-yellow-600',
    negotiation: 'bg-orange-600', closed_won: 'bg-green-700', closed_lost: 'bg-zinc-600',
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <span className="inline-block bg-red-700 text-white text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 mb-3">
          Command Center
        </span>
        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
          Admin Overview
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Everything across all client accounts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}
            className="group bg-zinc-900 border border-zinc-800 hover:border-red-700 p-5 transition-colors"
          >
            <Icon size={16} className="text-red-700 mb-3" />
            <p className="text-2xl font-black text-white tracking-tighter">{value}</p>
            <p className="text-[11px] text-zinc-500 uppercase tracking-[0.15em] mt-1">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent deals */}
        <div className="bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-black uppercase tracking-[0.15em] text-white">Recent Deals</h2>
            <Link href="/admin/pipeline" className="text-[11px] text-red-500 hover:text-red-400 flex items-center gap-1">
              All <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-zinc-800">
            {recentDeals.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`shrink-0 text-[9px] font-black uppercase text-white px-1.5 py-0.5 ${STAGE_COLORS[d.stage] || 'bg-zinc-700'}`}>
                    {d.stage.replace('_', ' ')}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-200 truncate">{d.title}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{d.client_name}</p>
                  </div>
                </div>
                {d.value && (
                  <span className="text-sm font-semibold text-white shrink-0 ml-2">
                    £{parseFloat(d.value).toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* New leads */}
        <div className="bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-black uppercase tracking-[0.15em] text-white">New Audit Leads</h2>
            <Link href="/admin/leads" className="text-[11px] text-red-500 hover:text-red-400 flex items-center gap-1">
              All <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-zinc-800">
            {recentLeads.length === 0 && (
              <p className="text-zinc-600 text-sm text-center py-6">No new leads</p>
            )}
            {recentLeads.map((lead: any) => (
              <div key={lead.id} className="px-6 py-3">
                <p className="text-sm font-semibold text-white">{lead.company || 'Unknown Company'}</p>
                <p className="text-[11px] text-zinc-500">{lead.email}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">
                  {new Date(lead.created_at).toLocaleDateString('en-GB')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
