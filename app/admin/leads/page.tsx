import { requireAdmin } from '@/lib/auth/session';
import sql from '@/lib/db';
import LeadActions from './actions';

export default async function LeadsPage() {
  await requireAdmin();

  const leads = await sql`
    SELECT l.*, c.name as client_name
    FROM audit_leads l
    LEFT JOIN clients c ON c.id = l.assigned_client
    ORDER BY l.created_at DESC
  `;

  const clients = await sql`SELECT id, name FROM clients WHERE status = 'active' ORDER BY name`;

  const STATUS_COLORS: Record<string, string> = {
    new: 'bg-red-900 text-red-400',
    contacted: 'bg-blue-900 text-blue-400',
    converted: 'bg-green-900 text-green-400',
    rejected: 'bg-zinc-800 text-zinc-500',
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <span className="inline-block bg-red-700 text-white text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 mb-3">
          Audit Leads
        </span>
        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
          Incoming Leads
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          {leads.filter((l: any) => l.status === 'new').length} new · {leads.length} total
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800">
        {leads.length === 0 && (
          <p className="text-zinc-600 text-sm text-center py-12">No leads yet. They appear here when someone completes the /audit form.</p>
        )}
        <div className="divide-y divide-zinc-800">
          {leads.map((lead: any) => (
            <div key={lead.id} className="px-6 py-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="text-sm font-semibold text-white">{lead.company || 'Unknown Company'}</p>
                  <p className="text-[11px] text-zinc-500">{lead.email}</p>
                </div>
                <span className={`shrink-0 text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 ${STATUS_COLORS[lead.status] || 'bg-zinc-800 text-zinc-400'}`}>
                  {lead.status}
                </span>
              </div>
              {lead.answers && (
                <div className="bg-zinc-800 px-3 py-2 mb-3 text-[11px] text-zinc-400 max-h-20 overflow-auto">
                  <pre className="whitespace-pre-wrap font-sans">{JSON.stringify(lead.answers, null, 2)}</pre>
                </div>
              )}
              <LeadActions leadId={lead.id} status={lead.status} clients={clients as any[]} assignedClient={lead.assigned_client} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
