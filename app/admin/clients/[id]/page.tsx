import { requireAdmin } from '@/lib/auth/session';
import sql from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AdminClientMessages from './messages';
import AdminDealManager from './deals';

type ClientRow = { id: string; name: string; industry?: string | null; contact_email?: string | null; contact_phone?: string | null; status: string };

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const rows = await sql`SELECT * FROM clients WHERE id = ${id}`;
  const client = rows[0] as ClientRow | undefined;
  if (!client) notFound();

  const [deals, messages, docs, linkedUsers] = await Promise.all([
    sql`SELECT * FROM pipeline_deals WHERE client_id = ${id} ORDER BY created_at DESC`,
    sql`
      SELECT m.*, u.name as sender_name, u.image as sender_image
      FROM messages m
      JOIN app_users u ON u.id = m.sender_id
      WHERE m.client_id = ${id}
      ORDER BY m.created_at ASC
    `,
    sql`SELECT * FROM documents WHERE client_id = ${id} ORDER BY created_at DESC`,
    sql`
      SELECT u.* FROM app_users u
      JOIN client_users cu ON cu.user_id = u.id
      WHERE cu.client_id = ${id}
    `,
  ]);

  const STAGE_COLORS: Record<string, string> = {
    lead: 'bg-zinc-700', qualified: 'bg-blue-700', proposal: 'bg-yellow-600',
    negotiation: 'bg-orange-600', closed_won: 'bg-green-700', closed_lost: 'bg-zinc-600',
  };

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/clients" className="text-[11px] text-zinc-500 hover:text-white transition-colors mb-4 block">
          ← All Clients
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-block bg-red-700 text-white text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 mb-3">
              Client
            </span>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">{client.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              {client.industry && <span className="text-zinc-500 text-sm">{client.industry}</span>}
              {client.contact_email && <span className="text-zinc-600 text-sm">{client.contact_email}</span>}
              <span className={`text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 ${client.status === 'active' ? 'bg-green-900 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                {client.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deals */}
        <div className="bg-zinc-900 border border-zinc-800">
          <div className="px-6 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-black uppercase tracking-[0.15em] text-white">Pipeline Deals</h2>
          </div>
          <AdminDealManager clientId={id} deals={deals as any[]} />
        </div>

        {/* Messages */}
        <div className="bg-zinc-900 border border-zinc-800">
          <div className="px-6 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-black uppercase tracking-[0.15em] text-white">Messages</h2>
          </div>
          <AdminClientMessages clientId={id} initialMessages={messages as any[]} />
        </div>

        {/* Documents */}
        <div className="bg-zinc-900 border border-zinc-800">
          <div className="px-6 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-black uppercase tracking-[0.15em] text-white">Documents ({docs.length})</h2>
          </div>
          <div className="divide-y divide-zinc-800 max-h-64 overflow-auto">
            {docs.length === 0 && <p className="text-zinc-600 text-sm text-center py-6">No documents</p>}
            {docs.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between px-6 py-3">
                <p className="text-sm text-zinc-300 truncate">{doc.name}</p>
                <a href={doc.url} target="_blank" rel="noopener noreferrer"
                  className="text-[11px] text-red-500 hover:text-red-400 shrink-0 ml-2">
                  Download →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Linked Users */}
        <div className="bg-zinc-900 border border-zinc-800">
          <div className="px-6 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-black uppercase tracking-[0.15em] text-white">Linked Users</h2>
          </div>
          <div className="divide-y divide-zinc-800">
            {linkedUsers.length === 0 && <p className="text-zinc-600 text-sm text-center py-6">No users linked</p>}
            {linkedUsers.map((u: any) => (
              <div key={u.id} className="flex items-center gap-3 px-6 py-3">
                <div className="w-7 h-7 rounded-full bg-red-700 flex items-center justify-center text-white text-xs font-black shrink-0">
                  {(u.name || u.email || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-white">{u.name || 'No name'}</p>
                  <p className="text-[11px] text-zinc-500">{u.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
