import { requireAdmin } from '@/lib/auth/session';
import sql from '@/lib/db';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

export default async function AdminMessagesPage() {
  await requireAdmin();

  // Get all clients with their latest message and unread count
  const threads = await sql`
    SELECT
      c.id,
      c.name,
      MAX(m.created_at) as last_message_at,
      COUNT(m.id) FILTER (WHERE m.sender_role = 'client' AND m.read_at IS NULL) as unread_count,
      (SELECT body FROM messages m2 WHERE m2.client_id = c.id ORDER BY m2.created_at DESC LIMIT 1) as last_body
    FROM clients c
    LEFT JOIN messages m ON m.client_id = c.id
    GROUP BY c.id, c.name
    HAVING COUNT(m.id) > 0
    ORDER BY last_message_at DESC NULLS LAST
  `;

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <span className="inline-block bg-red-700 text-white text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 mb-3">
          Messages
        </span>
        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
          All Threads
        </h1>
        <p className="text-zinc-500 text-sm mt-1">{threads.length} active conversation{threads.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800">
        {threads.length === 0 && (
          <p className="text-zinc-600 text-sm text-center py-12">No messages yet</p>
        )}
        <div className="divide-y divide-zinc-800">
          {threads.map((t: any) => (
            <Link key={t.id} href={`/admin/clients/${t.id}`}
              className="group flex items-center justify-between px-6 py-4 hover:bg-zinc-800 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 bg-zinc-700 flex items-center justify-center text-white text-sm font-black">
                    {t.name[0].toUpperCase()}
                  </div>
                  {parseInt(t.unread_count) > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-700 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                      {t.unread_count}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  {t.last_body && (
                    <p className="text-[11px] text-zinc-500 truncate">{t.last_body}</p>
                  )}
                </div>
              </div>
              <div className="shrink-0 ml-4 text-right">
                {t.last_message_at && (
                  <p className="text-[10px] text-zinc-600">
                    {new Date(t.last_message_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
