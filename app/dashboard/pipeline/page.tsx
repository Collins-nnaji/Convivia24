import { requireAuth, getAppUser } from '@/lib/auth/session';
import sql from '@/lib/db';

const STAGES = [
  { key: 'lead',         label: 'Lead',         color: 'border-zinc-600' },
  { key: 'qualified',    label: 'Qualified',    color: 'border-blue-600' },
  { key: 'proposal',     label: 'Proposal',     color: 'border-yellow-500' },
  { key: 'negotiation',  label: 'Negotiation',  color: 'border-orange-500' },
  { key: 'closed_won',   label: 'Won',          color: 'border-green-600' },
  { key: 'closed_lost',  label: 'Lost',         color: 'border-zinc-700' },
];

const STAGE_DOT: Record<string, string> = {
  lead: 'bg-zinc-500',
  qualified: 'bg-blue-500',
  proposal: 'bg-yellow-500',
  negotiation: 'bg-orange-500',
  closed_won: 'bg-green-500',
  closed_lost: 'bg-zinc-600',
};

export default async function PipelinePage() {
  const authUser = await requireAuth();
  const appUser = await getAppUser({ id: authUser.id, email: authUser.email!, name: authUser.name, image: authUser.image });

  const clientRows = await sql`
    SELECT c.* FROM clients c
    JOIN client_users cu ON cu.client_id = c.id
    WHERE cu.user_id = ${appUser.id}
    LIMIT 1
  `;
  const client = clientRows[0] ?? null;

  const deals = client
    ? await sql`SELECT * FROM pipeline_deals WHERE client_id = ${client.id} ORDER BY created_at DESC`
    : [];

  const byStage = STAGES.reduce((acc: Record<string, any[]>, s) => {
    acc[s.key] = deals.filter((d: any) => d.stage === s.key);
    return acc;
  }, {});

  return (
    <div className="p-8">
      <div className="mb-8">
        <span className="inline-block bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 mb-3">
          Pipeline
        </span>
        <h1 className="text-3xl font-black tracking-tighter text-zinc-900 uppercase italic">
          Your Deals
        </h1>
        <p className="text-zinc-600 text-sm mt-1">
          {deals.length} deal{deals.length !== 1 ? 's' : ''} across {STAGES.length} stages
        </p>
      </div>

      {!client ? (
        <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm">
          <p className="text-zinc-600 text-sm">No pipeline linked yet. Contact your account manager.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {STAGES.map(({ key, label, color }) => (
            <div key={key} className={`bg-white border-t-4 ${color} border-x border-b border-zinc-200 rounded-lg shadow-sm`}>
              <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${STAGE_DOT[key]}`} />
                  <span className="text-xs font-black uppercase tracking-[0.15em] text-zinc-600">{label}</span>
                </div>
                <span className="text-xs text-zinc-500">{byStage[key].length}</span>
              </div>
              <div className="p-3 space-y-2 min-h-[120px]">
                {byStage[key].length === 0 && (
                  <p className="text-[11px] text-zinc-500 text-center pt-4">No deals</p>
                )}
                {byStage[key].map((deal: any) => (
                  <div key={deal.id} className="bg-zinc-50 border border-zinc-200 rounded px-3 py-2.5">
                    <p className="text-sm font-semibold text-zinc-900 leading-tight">{deal.title}</p>
                    {deal.value && (
                      <p className="text-xs text-zinc-500 mt-1">
                        {deal.currency} {parseFloat(deal.value).toLocaleString()}
                      </p>
                    )}
                    {deal.notes && (
                      <p className="text-[11px] text-zinc-600 mt-1 line-clamp-2">{deal.notes}</p>
                    )}
                    {deal.due_date && (
                      <p className="text-[10px] text-zinc-600 mt-1">
                        Due {new Date(deal.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
