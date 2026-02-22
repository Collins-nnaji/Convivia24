import { requireAdmin } from '@/lib/auth/session';
import sql from '@/lib/db';
import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';

export default async function ClientsPage() {
  await requireAdmin();

  const clients = await sql`
    SELECT
      c.*,
      COUNT(DISTINCT d.id)  as deal_count,
      COUNT(DISTINCT m.id)  FILTER (WHERE m.sender_role = 'client' AND m.read_at IS NULL) as unread_count,
      u.name as admin_name
    FROM clients c
    LEFT JOIN pipeline_deals d ON d.client_id = c.id
    LEFT JOIN messages m ON m.client_id = c.id
    LEFT JOIN app_users u ON u.id = c.assigned_admin
    GROUP BY c.id, u.name
    ORDER BY c.created_at DESC
  `;

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="inline-block bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 mb-3">
            Clients
          </span>
          <h1 className="text-3xl font-black tracking-tighter text-zinc-900 uppercase italic">
            All Clients
          </h1>
          <p className="text-zinc-600 text-sm mt-1">{clients.length} account{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/admin/clients/new"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-black uppercase tracking-[0.1em] px-4 py-2.5 transition-colors rounded"
        >
          <Plus size={14} />
          New Client
        </Link>
      </div>

      <div className="bg-white border border-zinc-200 shadow-sm rounded-lg overflow-hidden">
        {clients.length === 0 && (
          <p className="text-zinc-500 text-sm text-center py-12">No clients yet. Add one to get started.</p>
        )}
        <div className="divide-y divide-zinc-100">
          {clients.map((c: any) => (
            <Link
              key={c.id}
              href={`/admin/clients/${c.id}`}
              className="group flex items-center justify-between px-6 py-4 hover:bg-zinc-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-red-600 flex items-center justify-center text-white text-sm font-black shrink-0 rounded">
                  {c.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{c.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {c.industry && <span className="text-[11px] text-zinc-500">{c.industry}</span>}
                    <span className={`text-[9px] font-black uppercase tracking-[0.1em] px-1.5 py-0.5 rounded ${c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-zinc-200 text-zinc-600'}`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-right">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{c.deal_count}</p>
                  <p className="text-[10px] text-zinc-500">deals</p>
                </div>
                {parseInt(c.unread_count) > 0 && (
                  <div className="bg-red-600 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                    {c.unread_count}
                  </div>
                )}
                <ArrowRight size={14} className="text-zinc-400 group-hover:text-red-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
