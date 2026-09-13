'use client';

import { describeAudit } from '@/lib/suppliers/audit';
import type { SupplierAuditEntry } from './types';

const ACTOR_LABEL = { supplier: 'You', admin: 'Convivia24', system: 'System' } as const;
const ACTOR_TONE = {
  supplier: 'bg-ember/10 text-ember',
  admin: 'bg-obsidian text-white',
  system: 'bg-paper text-obsidian/50',
} as const;

/** Read-only. The same log the Convivia24 desk sees — nothing a supplier does is private to them. */
export default function SupplierActivity({ entries }: { entries: SupplierAuditEntry[] }) {
  return (
    <div>
      <p className="mb-4 text-sm text-obsidian/50">
        Every change on your shelf and your orders, whoever made it. Convivia24 sees the same list.
      </p>
      {entries.length === 0 ? (
        <p className="text-sm text-obsidian/45">Nothing yet.</p>
      ) : (
        <ul className="divide-y divide-obsidian/8 rounded-2xl border border-obsidian/10 bg-white">
          {entries.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
              <span className="w-32 shrink-0 text-xs tabular-nums text-obsidian/40">
                {new Date(e.createdAt).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${ACTOR_TONE[e.actor]}`}>
                {ACTOR_LABEL[e.actor]}
              </span>
              <span className="text-obsidian/75">{describeAudit(e)}</span>
              {e.actorLabel && e.actor === 'supplier' && <span className="text-xs text-obsidian/35">({e.actorLabel})</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
