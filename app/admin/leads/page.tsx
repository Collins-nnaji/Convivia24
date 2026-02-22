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
    new: 'bg-red-100 text-red-800',
    contacted: 'bg-blue-100 text-blue-800',
    converted: 'bg-green-100 text-green-800',
    rejected: 'bg-zinc-200 text-zinc-600',
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <span className="inline-block bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 mb-3 rounded">
          Audit Leads
        </span>
        <h1 className="text-3xl font-black tracking-tighter text-zinc-900 uppercase italic">
          Incoming Leads
        </h1>
        <p className="text-zinc-600 text-sm mt-1">
          {leads.filter((l: any) => l.status === 'new').length} new · {leads.length} total
        </p>
      </div>

      <div className="bg-white border border-zinc-200 shadow-sm rounded-lg overflow-hidden">
        {leads.length === 0 && (
          <p className="text-zinc-500 text-sm text-center py-12">No leads yet. They appear here when someone completes the /audit form.</p>
        )}
        <div className="divide-y divide-zinc-100">
          {leads.map((lead: any) => (
            <div key={lead.id} className="px-6 py-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{lead.company || 'Unknown Company'}</p>
                  <p className="text-[11px] text-zinc-500">{lead.email}</p>
                </div>
                <span className={`shrink-0 text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded ${STATUS_COLORS[lead.status] || 'bg-zinc-200 text-zinc-600'}`}>
                  {lead.status}
                </span>
              </div>
              {lead.answers && (
                <div className="bg-zinc-50 border border-zinc-200 px-3 py-2 mb-3 text-[11px] text-zinc-700 max-h-20 overflow-auto rounded">
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
