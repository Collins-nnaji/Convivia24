import { requireAdmin } from '@/lib/auth/session';
import sql from '@/lib/db';
import Link from 'next/link';

const STAGES = [
  { key: 'lead',         label: 'Lead',         color: 'border-zinc-600' },
  { key: 'qualified',    label: 'Qualified',    color: 'border-blue-600' },
  { key: 'proposal',     label: 'Proposal',     color: 'border-yellow-500' },
  { key: 'negotiation',  label: 'Negotiation',  color: 'border-orange-500' },
  { key: 'closed_won',   label: 'Won',          color: 'border-green-600' },
  { key: 'closed_lost',  label: 'Lost',         color: 'border-zinc-700' },
];

export default async function AdminPipelinePage() {
  await requireAdmin();

  const deals = await sql`
    SELECT d.*, c.name as client_name
    FROM pipeline_deals d
    JOIN clients c ON c.id = d.client_id
    ORDER BY d.updated_at DESC
  `;

  const byStage = STAGES.reduce((acc: Record<string, any[]>, s) => {
    acc[s.key] = deals.filter((d: any) => d.stage === s.key);
    return acc;
  }, {});

  const totalOpen = deals.filter((d: any) => !['closed_won','closed_lost'].includes(d.stage));
  const totalValue = totalOpen.reduce((sum: number, d: any) => sum + parseFloat(d.value || 0), 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <span className="inline-block bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 mb-3 rounded">
          Pipeline
        </span>
        <h1 className="text-3xl font-black tracking-tighter text-zinc-900 uppercase italic">
          All Deals
        </h1>
        <p className="text-zinc-600 text-sm mt-1">
          {totalOpen.length} open deals · £{(totalValue / 1000).toFixed(0)}k pipeline value
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {STAGES.map(({ key, label, color }) => (
          <div key={key} className={`bg-white border-t-2 ${color} border-x border-b border-zinc-200 shadow-sm rounded-lg overflow-hidden`}>
            <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-[0.15em] text-zinc-700">{label}</span>
              <span className="text-xs text-zinc-500">{byStage[key].length}</span>
            </div>
            <div className="p-3 space-y-2 min-h-[100px]">
              {byStage[key].length === 0 && (
                <p className="text-[11px] text-zinc-500 text-center pt-3">Empty</p>
              )}
              {byStage[key].map((deal: any) => (
                <Link key={deal.id} href={`/admin/clients/${deal.client_id}`}
                  className="block bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300 px-3 py-2.5 rounded transition-colors">
                  <p className="text-sm font-semibold text-zinc-900 leading-tight">{deal.title}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{deal.client_name}</p>
                  {deal.value && (
                    <p className="text-[11px] text-zinc-600 mt-1">£{parseFloat(deal.value).toLocaleString()}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
